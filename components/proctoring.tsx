"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Camera, Eye, EyeOff, Users, Wifi, WifiOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProctoringProps {
  onViolation?: (violation: ViolationType) => void
  onPermissionDenied?: () => void
  userId?: string
  sessionId?: string
}

type ViolationType = 
  | "MULTIPLE_FACES"
  | "NO_FACE"
  | "LOOKING_AWAY"
  | "TAB_SWITCH"
  | "CAMERA_BLOCKED"
  | "WINDOW_BLUR"

interface Violation {
  type: ViolationType
  timestamp: number
  severity: "LOW" | "MEDIUM" | "HIGH"
  details?: string
}

export function Proctoring({ 
  onViolation,
  onPermissionDenied,
  userId,
  sessionId
}: ProctoringProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [violations, setViolations] = useState<Violation[]>([])
  const [currentStatus, setCurrentStatus] = useState<string>("Initializing...")
  const [faceCount, setFaceCount] = useState<number>(0)
  const [isConnected, setIsConnected] = useState(true)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    startProctoring()
    setupVisibilityDetection()
    
    return () => {
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startProctoring = async () => {
    try {
      // Request camera and microphone - REQUIRED, cannot be disabled
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: true
      })

      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      setIsMonitoring(true)
      setCurrentStatus("Monitoring active")
      
      // Start face detection
      setTimeout(() => {
        startFaceDetection()
      }, 2000)

      toast({
        title: "Proctoring Active",
        description: "Your session is being monitored. Do not leave this tab.",
      })

      // Send initial status to backend
      await logEvent("PROCTORING_STARTED", "LOW")

    } catch (error: any) {
      console.error("Proctoring error:", error)
      
      setCurrentStatus("Permission denied - Exam cannot proceed")
      
      const violation: Violation = {
        type: "CAMERA_BLOCKED",
        timestamp: Date.now(),
        severity: "HIGH",
        details: error.message
      }
      
      handleViolation(violation)
      
      if (onPermissionDenied) {
        onPermissionDenied()
      }

      toast({
        title: "Proctoring Required",
        description: "You must enable camera and microphone to take the exam.",
        variant: "destructive",
      })
    }
  }

  const startFaceDetection = () => {
    // Simple face detection using video analysis
    // In production, use face-api.js or similar library
    detectionIntervalRef.current = setInterval(() => {
      detectFaces()
    }, 3000) // Check every 3 seconds
  }

  const detectFaces = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data for analysis
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    
    // Simple brightness detection (if screen is too dark, likely covered)
    const avgBrightness = getAverageBrightness(imageData)
    
    if (avgBrightness < 20) {
      // Camera likely blocked
      const violation: Violation = {
        type: "CAMERA_BLOCKED",
        timestamp: Date.now(),
        severity: "HIGH",
        details: "Camera appears to be covered or blocked"
      }
      handleViolation(violation)
      setFaceCount(0)
    } else if (avgBrightness > 30) {
      // Assume face detected (simplified)
      setFaceCount(1)
      setCurrentStatus("Monitoring active - Face detected")
    }

    // In production, integrate face-api.js for real face detection:
    // const detections = await faceapi.detectAllFaces(video)
    // setFaceCount(detections.length)
    // if (detections.length === 0) handleViolation("NO_FACE")
    // if (detections.length > 1) handleViolation("MULTIPLE_FACES")
  }

  const getAverageBrightness = (imageData: ImageData): number => {
    const data = imageData.data
    let sum = 0
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const brightness = (r + g + b) / 3
      sum += brightness
    }
    
    return sum / (data.length / 4)
  }

  const setupVisibilityDetection = () => {
    // Detect tab switching
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const violation: Violation = {
          type: "TAB_SWITCH",
          timestamp: Date.now(),
          severity: "HIGH",
          details: "User switched to another tab"
        }
        handleViolation(violation)
      }
    })

    // Detect window blur
    window.addEventListener('blur', () => {
      const violation: Violation = {
        type: "WINDOW_BLUR",
        timestamp: Date.now(),
        severity: "MEDIUM",
        details: "User switched to another window"
      }
      handleViolation(violation)
    })

    // Detect if trying to disable camera
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.addEventListener('ended', () => {
          const violation: Violation = {
            type: "CAMERA_BLOCKED",
            timestamp: Date.now(),
            severity: "HIGH",
            details: "Camera was disabled during exam"
          }
          handleViolation(violation)
          // Try to restart
          startProctoring()
        })
      })
    }

    // Detect network disconnection
    window.addEventListener('offline', () => {
      setIsConnected(false)
      logEvent("NETWORK_DISCONNECTED", "MEDIUM")
    })

    window.addEventListener('online', () => {
      setIsConnected(true)
      logEvent("NETWORK_RECONNECTED", "LOW")
    })
  }

  const handleViolation = (violation: Violation) => {
    setViolations(prev => [...prev, violation])
    
    // Update status
    setCurrentStatus(`⚠️ Violation: ${violation.type.replace(/_/g, ' ')}`)
    
    // Call parent callback
    if (onViolation) {
      onViolation(violation.type)
    }

    // Log to backend
    logViolation(violation)

    // Show toast notification
    toast({
      title: `Violation Detected: ${violation.type.replace(/_/g, ' ')}`,
      description: violation.details || "This incident has been recorded.",
      variant: "destructive",
    })
  }

  const logViolation = async (violation: Violation) => {
    try {
      await fetch('/api/proctoring/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          violation,
          timestamp: new Date().toISOString(),
        })
      })
    } catch (error) {
      console.error('Failed to log violation:', error)
    }
  }

  const logEvent = async (eventType: string, severity: string) => {
    try {
      await fetch('/api/proctoring/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          eventType,
          severity,
          timestamp: new Date().toISOString(),
        })
      })
    } catch (error) {
      console.error('Failed to log event:', error)
    }
  }

  const cleanup = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
    }
  }, [stream])

  // Expose a global stop hook so pages can force proctoring off before auto-submit
  useEffect(() => {
    ;(window as any).__stopProctoring = () => {
      cleanup()
      setIsMonitoring(false)
      setCurrentStatus('Monitoring stopped')
    }
    return () => {
      delete (window as any).__stopProctoring
    }
  }, [cleanup])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH": return "text-red-400 bg-red-500/20"
      case "MEDIUM": return "text-yellow-400 bg-yellow-500/20"
      case "LOW": return "text-green-400 bg-green-500/20"
      default: return "text-gray-400 bg-gray-500/20"
    }
  }

  return (
    <Card className="bg-[#192345] border-[#6aa5ff]/20">
      <CardHeader className="pb-2 py-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-sm">
            <Camera className="h-4 w-4 text-[#6aa5ff]" />
            Proctoring
          </CardTitle>
          <div className="flex items-center gap-2">
            {isMonitoring ? (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-red-400">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                Offline
              </span>
            )}
            {isConnected ? (
              <Wifi className="h-3 w-3 text-green-400" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-400" />
            )}
          </div>
        </div>
        <CardDescription className="text-white/70 text-xs">
          {currentStatus}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Video Preview - Always on, cannot be disabled */}
        <div className="relative rounded-lg overflow-hidden bg-black border border-[#6aa5ff]/20">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-32 object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Overlay indicators */}
          <div className="absolute top-1 left-1 right-1 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {faceCount === 1 ? (
                <span className="px-1.5 py-0.5 rounded-full bg-green-500/80 text-white text-xs flex items-center gap-1">
                  <Eye className="h-2.5 w-2.5" />
                  Face
                </span>
              ) : faceCount === 0 ? (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500/80 text-white text-xs flex items-center gap-1">
                  <EyeOff className="h-2.5 w-2.5" />
                  No Face
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-full bg-yellow-500/80 text-white text-xs flex items-center gap-1">
                  <Users className="h-2.5 w-2.5" />
                  Multiple
                </span>
              )}
            </div>
            <div className="px-1.5 py-0.5 rounded-full bg-black/60 text-white text-xs">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Recording indicator */}
          <div className="absolute bottom-1 left-1">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/90 text-white text-xs">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              REC
            </div>
          </div>
        </div>

        {/* Violation Summary */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-[#232b4d] rounded p-1.5 text-center">
            <div className="text-xs text-white/60">Total</div>
            <div className="text-sm font-bold text-white">{violations.length}</div>
          </div>
          <div className="bg-[#232b4d] rounded p-1.5 text-center">
            <div className="text-xs text-white/60">High</div>
            <div className="text-sm font-bold text-red-400">
              {violations.filter(v => v.severity === "HIGH").length}
            </div>
          </div>
          <div className="bg-[#232b4d] rounded p-1.5 text-center">
            <div className="text-xs text-white/60">Med</div>
            <div className="text-sm font-bold text-yellow-400">
              {violations.filter(v => v.severity === "MEDIUM").length}
            </div>
          </div>
        </div>

        {/* Recent Violations */}
        {violations.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-white/80">Recent</div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {violations.slice(-3).reverse().map((violation, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-1.5 rounded text-xs ${getSeverityColor(violation.severity)}`}
                >
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    <span className="truncate">{violation.type.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-xs opacity-70">
                    {new Date(violation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning Message */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="h-3 w-3 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-400">
              <p className="font-semibold">Mandatory</p>
              <p className="text-yellow-400/80 mt-0.5 text-xs">
                Do not switch tabs • Keep face visible • One person only
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
