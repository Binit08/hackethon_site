"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Camera, Clock, Eye, User, Video, Shield, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Sparkles } from "@/components/ui/sparkles"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { motion } from "framer-motion"

interface Violation {
  _id: string
  userId: any
  sessionId: string
  violationType: string
  severity: string
  details: string
  timestamp: string
}

interface Session {
  _id: string
  userId: any
  sessionId: string
  startTime: string
  endTime: string | null
  status: string
  totalViolations: number
  highSeverityCount: number
  mediumSeverityCount: number
  lowSeverityCount: number
  suspicionScore: number
  examType: string
  recentViolations: Violation[]
}

export default function ProctoringAdminPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const { toast } = useToast()

  const fetchSessions = useCallback(async () => {
    try {
      const url = statusFilter === "ALL" 
        ? "/api/proctoring/sessions"
        : `/api/proctoring/sessions?status=${statusFilter}`
      
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch sessions")
      
      const data = await response.json()
      setSessions(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load proctoring data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, toast])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "MEDIUM": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "LOW": return "bg-green-500/20 text-green-400 border-green-500/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-500/20 text-green-400"
      case "COMPLETED": return "bg-blue-500/20 text-blue-400"
      case "SUSPENDED": return "bg-red-500/20 text-red-400"
      case "TERMINATED": return "bg-gray-500/20 text-gray-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const getSuspicionLevel = (score: number) => {
    if (score >= 80) return { level: "CRITICAL", color: "text-red-400" }
    if (score >= 50) return { level: "HIGH", color: "text-orange-400" }
    if (score >= 30) return { level: "MEDIUM", color: "text-yellow-400" }
    return { level: "LOW", color: "text-green-400" }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 flex items-center justify-center">
        <div className="text-gray-900">Loading proctoring data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 relative overflow-hidden">
      <BackgroundBeams />
      <Sparkles />
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.12),transparent_55%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/50"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <TextGenerateEffect 
            words="Proctoring Monitor"
            className="text-4xl font-bold mb-2 text-gray-900"
          />
          <p className="text-gray-700 flex items-center justify-center gap-2">
            <Activity className="w-4 h-4" />
            Track exam integrity and violations
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-white/80 backdrop-blur-xl border-blue-200 text-gray-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-xl border-blue-200">
              <SelectItem value="ALL" className="text-gray-900">All Sessions</SelectItem>
              <SelectItem value="ACTIVE" className="text-gray-900">Active</SelectItem>
              <SelectItem value="COMPLETED" className="text-gray-900">Completed</SelectItem>
              <SelectItem value="SUSPENDED" className="text-gray-900">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sessions.map((session, index) => {
            const suspicion = getSuspicionLevel(session.suspicionScore)
            return (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-white/80 backdrop-blur-xl border-blue-200 shadow-xl hover:shadow-blue-500/50 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gray-900 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                          <Video className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg">{session.userId?.name || "Unknown User"}</span>
                      </CardTitle>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-600 text-xs">
                      {session.userId?.email || "No email"}
                    </CardDescription>
                  </CardHeader>
                <CardContent className="space-y-3">
                  {/* Session Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-blue-50 p-2 rounded border border-blue-200">
                      <div className="text-gray-600">Exam Type</div>
                      <div className="text-gray-900 font-semibold">{session.examType}</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded border border-blue-200">
                      <div className="text-gray-600">Duration</div>
                      <div className="text-gray-900 font-semibold">
                        {session.endTime 
                          ? `${Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)}m`
                          : "Ongoing"
                        }
                      </div>
                    </div>
                  </div>

                  {/* Violation Stats */}
                  <div className="bg-purple-50 p-3 rounded border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Total Violations</span>
                      <span className="text-lg font-bold text-gray-900">{session.totalViolations}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-red-600 font-bold">{session.highSeverityCount}</div>
                        <div className="text-gray-600">High</div>
                      </div>
                      <div className="text-center">
                        <div className="text-yellow-600 font-bold">{session.mediumSeverityCount}</div>
                        <div className="text-gray-600">Medium</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-600 font-bold">{session.lowSeverityCount}</div>
                        <div className="text-gray-600">Low</div>
                      </div>
                    </div>
                  </div>

                  {/* Suspicion Score */}
                  <div className="bg-purple-50 p-3 rounded border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">Suspicion Level</span>
                      <span className={`text-xs font-bold ${suspicion.color}`}>
                        {suspicion.level}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          session.suspicionScore >= 80 ? 'bg-red-600' :
                          session.suspicionScore >= 50 ? 'bg-orange-600' :
                          session.suspicionScore >= 30 ? 'bg-yellow-600' :
                          'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(session.suspicionScore, 100)}%` }}
                      />
                    </div>
                    <div className="text-right text-xs text-gray-600 mt-1">
                      {session.suspicionScore}/100
                    </div>
                  </div>

                  {/* Recent Violations */}
                  {session.recentViolations && session.recentViolations.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-white/80 mb-2">Recent Violations</div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {session.recentViolations.slice(0, 3).map((violation: Violation) => (
                          <div 
                            key={violation._id} 
                            className={`flex items-center justify-between p-2 rounded text-xs border ${getSeverityColor(violation.severity)}`}
                          >
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-3 w-3" />
                              <span>{violation.violationType.replace(/_/g, ' ')}</span>
                            </div>
                            <span className="opacity-70">
                              {new Date(violation.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-blue-50 border-blue-200 hover:bg-blue-100 text-gray-900"
                    >
                      <Eye className="mr-2 h-3 w-3" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            )
          })}
        </div>

        {sessions.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-xl border-blue-200 shadow-xl">
            <CardContent className="py-12 text-center text-gray-600">
              No proctoring sessions found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
