"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Camera, Eye, EyeOff, Users, Wifi, WifiOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as faceapi from 'face-api.js'

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
  | "DIFFERENT_PERSON"

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
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [storedDescriptor, setStoredDescriptor] = useState<Float32Array | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const consecutiveNoFaceCount = useRef<number>(0)
  const consecutiveLookingAwayCount = useRef<number>(0)
  const cameraRestartAttempts = useRef<number>(0)
  const violationCooldowns = useRef<Map<ViolationType, number>>(new Map())
  const eventQueue = useRef<Array<any>>([])
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Load face-api.js models on mount
  useEffect(() => {
    loadModels()
    // Start event queue flushing
    flushTimerRef.current = setInterval(() => {
      flushEventQueue()
    }, 5000) // Flush every 5 seconds
    
    return () => {
      if (flushTimerRef.current) {
        clearInterval(flushTimerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (modelsLoaded) {
      startProctoring()
      const cleanupVisibility = setupVisibilityDetection()
      
      return () => {
        cleanup()
        if (cleanupVisibility) {
          cleanupVisibility()
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelsLoaded])

  const loadModels = async () => {
    try {
      setCurrentStatus("Loading AI models...")
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ])
      
      setModelsLoaded(true)
      setCurrentStatus("Models loaded successfully")
      
      // Load stored face descriptor for this user if available
      await loadUserFaceDescriptor()
      
    } catch (error) {
      console.error('Failed to load models:', error)
      setCurrentStatus("Failed to load AI models")
      toast({
        title: "Model Loading Error",
        description: "Face detection models failed to load. Proctoring may be limited.",
        variant: "destructive",
      })
    }
  }

  const loadUserFaceDescriptor = async () => {
    try {
      if (!userId) return
      
      const response = await fetch(`/api/users/${userId}/face-descriptor`)
      if (response.ok) {
        const data = await response.json()
        if (data.faceDescriptor) {
          setStoredDescriptor(new Float32Array(data.faceDescriptor))
        }
      }
    } catch (error) {
      console.error('Failed to load face descriptor:', error)
    }
  }

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
    // Real-time face detection using face-api.js
    detectionIntervalRef.current = setInterval(() => {
      detectFaces()
    }, 3000) // Check every 3 seconds
  }

  const detectFaces = async () => {
    if (!videoRef.current || !modelsLoaded) return
    if (videoRef.current.readyState !== 4) return // Wait for video to be ready

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()

      setFaceCount(detections.length)

      // No face detected
      if (detections.length === 0) {
        consecutiveNoFaceCount.current++
        
        // Only trigger violation after 2 consecutive detections (6 seconds)
        if (consecutiveNoFaceCount.current >= 2) {
          const violation: Violation = {
            type: "NO_FACE",
            timestamp: Date.now(),
            severity: "HIGH",
            details: "No face detected in frame"
          }
          handleViolation(violation)
          setCurrentStatus("⚠️ No face detected")
        }
      } 
      // Multiple faces detected
      else if (detections.length > 1) {
        consecutiveNoFaceCount.current = 0
        const violation: Violation = {
          type: "MULTIPLE_FACES",
          timestamp: Date.now(),
          severity: "HIGH",
          details: `${detections.length} faces detected`
        }
        handleViolation(violation)
        setCurrentStatus(`⚠️ ${detections.length} faces detected`)
      } 
      // Exactly one face - perform additional checks
      else {
        consecutiveNoFaceCount.current = 0
        const detection = detections[0]
        
        // Check if person is looking away
        const isLookingAway = checkIfLookingAway(detection.landmarks)
        if (isLookingAway) {
          consecutiveLookingAwayCount.current++
          
          if (consecutiveLookingAwayCount.current >= 3) {
            const violation: Violation = {
              type: "LOOKING_AWAY",
              timestamp: Date.now(),
              severity: "MEDIUM",
              details: "Candidate not looking at screen"
            }
            handleViolation(violation)
            setCurrentStatus("⚠️ Looking away from screen")
          }
        } else {
          consecutiveLookingAwayCount.current = 0
          setCurrentStatus("Monitoring active - Face detected")
        }

        // Verify identity if we have a stored descriptor
        if (storedDescriptor && detection.descriptor) {
          const distance = faceapi.euclideanDistance(storedDescriptor, detection.descriptor)
          
          // Distance > 0.6 means different person
          if (distance > 0.6) {
            const violation: Violation = {
              type: "DIFFERENT_PERSON",
              timestamp: Date.now(),
              severity: "HIGH",
              details: `Face mismatch detected (distance: ${distance.toFixed(2)})`
            }
            handleViolation(violation)
            setCurrentStatus("⚠️ Different person detected")
          }
        }
      }

    } catch (error) {
      console.error('Face detection error:', error)
      // Don't spam violations for detection errors
    }
  }

  const checkIfLookingAway = (landmarks: faceapi.FaceLandmarks68): boolean => {
    // Get key facial landmark positions
    const nose = landmarks.getNose()
    const leftEye = landmarks.getLeftEye()
    const rightEye = landmarks.getRightEye()
    const mouth = landmarks.getMouth()

    // Calculate center of face
    const faceCenter = {
      x: (leftEye[0].x + rightEye[3].x) / 2,
      y: (leftEye[0].y + rightEye[3].y) / 2
    }

    // Check nose position relative to eye center
    const nosePoint = nose[3] // Tip of nose
    const horizontalOffset = Math.abs(nosePoint.x - faceCenter.x)
    const eyeDistance = Math.abs(rightEye[3].x - leftEye[0].x)

    // If nose is significantly offset from center, person is looking away
    // Threshold: 30% of eye distance
    return horizontalOffset > eyeDistance * 0.3
  }

  const setupVisibilityDetection = () => {
    // Named handler functions for proper cleanup
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const violation: Violation = {
          type: "TAB_SWITCH",
          timestamp: Date.now(),
          severity: "HIGH",
          details: "User switched to another tab"
        }
        handleViolation(violation)
      }
    }

    const handleWindowBlur = () => {
      const violation: Violation = {
        type: "WINDOW_BLUR",
        timestamp: Date.now(),
        severity: "MEDIUM",
        details: "User switched to another window"
      }
      handleViolation(violation)
    }

    const handleOffline = () => {
      setIsConnected(false)
      logEvent("NETWORK_DISCONNECTED", "MEDIUM")
    }

    const handleOnline = () => {
      setIsConnected(true)
      logEvent("NETWORK_RECONNECTED", "LOW")
    }

    // Detect tab switching
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Detect window blur
    window.addEventListener('blur', handleWindowBlur)

    // Detect network disconnection
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    // Detect if camera track ends
    const trackEndedHandlers: (() => void)[] = []
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        const handleTrackEnded = () => {
          // Check restart attempts
          if (cameraRestartAttempts.current >= 2) {
            // Too many restart attempts, stop trying
            setCurrentStatus("⚠️ Camera unavailable - Exam cannot proceed")
            const violation: Violation = {
              type: "CAMERA_BLOCKED",
              timestamp: Date.now(),
              severity: "HIGH",
              details: "Camera was disabled and could not be restarted"
            }
            handleViolation(violation)
            return
          }
          
          // Attempt restart
          cameraRestartAttempts.current++
          const violation: Violation = {
            type: "CAMERA_BLOCKED",
            timestamp: Date.now(),
            severity: "HIGH",
            details: `Camera was disabled during exam (restart attempt ${cameraRestartAttempts.current})`
          }
          handleViolation(violation)
          startProctoring()
        }
        track.addEventListener('ended', handleTrackEnded)
        trackEndedHandlers.push(() => track.removeEventListener('ended', handleTrackEnded))
      })
    }

    // Return cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
      trackEndedHandlers.forEach(cleanup => cleanup())
    }
  }

  const handleViolation = (violation: Violation) => {
    // Check cooldown - skip if same violation was triggered recently
    const now = Date.now()
    const lastTrigger = violationCooldowns.current.get(violation.type) || 0
    const cooldownMs = 90000 // 90 seconds cooldown
    
    if (now - lastTrigger < cooldownMs) {
      // Still in cooldown, skip logging
      return
    }
    
    // Update cooldown timestamp
    violationCooldowns.current.set(violation.type, now)
    
    setViolations(prev => [...prev, violation])
    
    // Update status
    setCurrentStatus(`⚠️ Violation: ${violation.type.replace(/_/g, ' ')}`)
    
    // Call parent callback
    if (onViolation) {
      onViolation(violation.type)
    }

    // Queue violation for batched logging
    queueEvent({
      type: 'violation',
      data: {
        userId,
        sessionId,
        violation,
        timestamp: new Date().toISOString(),
      }
    })

    // Show toast notification
    toast({
      title: `Violation Detected: ${violation.type.replace(/_/g, ' ')}`,
      description: violation.details || "This incident has been recorded.",
      variant: "destructive",
    })
  }

  const queueEvent = (event: any) => {
    eventQueue.current.push(event)
  }

  const flushEventQueue = async () => {
    if (eventQueue.current.length === 0 || !navigator.onLine) {
      return
    }

    const events = [...eventQueue.current]
    eventQueue.current = []

    // Process violations and events separately with retry
    const violations = events.filter(e => e.type === 'violation')
    const otherEvents = events.filter(e => e.type === 'event')

    if (violations.length > 0) {
      // Use batch endpoint with correct payload structure (Comment 2)
      await sendWithRetry('/api/proctoring/violations/batch', { violations: violations.map(v => v.data) }, 2)
    }

    if (otherEvents.length > 0) {
      await sendWithRetry('/api/proctoring/events', otherEvents.map(e => e.data), 2)
    }
  }

  const sendWithRetry = async (url: string, data: any, maxRetries: number) => {
    let attempt = 0
    
    while (attempt <= maxRetries) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Send data as-is (Comment 2: batch endpoint expects { violations: [...] })
          body: JSON.stringify(data)
        })
        
        if (response.ok) {
          // Success
          return
        }
        
        if (response.status < 500) {
          // Client error (don't retry)
          console.error(`Proctoring API error ${response.status} for ${url}:`, await response.text())
          return
        }
        
        // Server error, retry with backoff
        throw new Error(`Server error: ${response.status}`)
      } catch (error) {
        attempt++
        if (attempt > maxRetries) {
          // Failed after retries, log and drop the events (Comment 2)
          console.error(`Failed to send events to ${url} after ${maxRetries} retries:`, error)
          return
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  const logEvent = async (eventType: string, severity: string) => {
    queueEvent({
      type: 'event',
      data: {
        userId,
        sessionId,
        eventType,
        severity,
        timestamp: new Date().toISOString(),
      }
    })
  }

  const cleanup = useCallback(async () => {
    // Flush any remaining events before cleanup
    if (eventQueue.current.length > 0 && navigator.onLine) {
      const events = [...eventQueue.current]
      eventQueue.current = []
      const violations = events.filter(e => e.type === 'violation')
      const otherEvents = events.filter(e => e.type === 'event')
      if (violations.length > 0) {
        // Use batch endpoint (Comment 2)
        await sendWithRetry('/api/proctoring/violations/batch', { violations: violations.map(v => v.data) }, 2)
      }
      if (otherEvents.length > 0) {
        await sendWithRetry('/api/proctoring/events', otherEvents.map(e => e.data), 2)
      }
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
    }
    if (flushTimerRef.current) {
      clearInterval(flushTimerRef.current)
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
        {/* Consent and Data Usage Disclosure */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="h-3 w-3 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-300">
              <p className="font-semibold">Biometric Monitoring Active</p>
              <p className="text-blue-300/80 mt-0.5 text-xs">
                This system captures and analyzes your face for identity verification during the exam. 
                A face template is securely stored and used only for exam integrity purposes.
              </p>
            </div>
          </div>
        </div>

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
