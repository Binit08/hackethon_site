"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Camera, Clock, Eye, User, Video } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
      <div className="min-h-screen bg-[#151c2e] flex items-center justify-center">
        <div className="text-white">Loading proctoring data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#151c2e] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(87,97,255,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,75,149,0.12),transparent_55%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Proctoring Monitor</h1>
          <p className="text-white/70">Track exam integrity and violations</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-[#232b4d] border-[#6aa5ff]/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#232b4d] border-[#6aa5ff]/20">
              <SelectItem value="ALL" className="text-white">All Sessions</SelectItem>
              <SelectItem value="ACTIVE" className="text-white">Active</SelectItem>
              <SelectItem value="COMPLETED" className="text-white">Completed</SelectItem>
              <SelectItem value="SUSPENDED" className="text-white">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sessions.map((session) => {
            const suspicion = getSuspicionLevel(session.suspicionScore)
            return (
              <Card key={session._id} className="bg-[#192345] border-[#6aa5ff]/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Video className="h-5 w-5 text-[#6aa5ff]" />
                      {session.userId?.name || "Unknown User"}
                    </CardTitle>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-white/70 text-xs">
                    {session.userId?.email || "No email"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Session Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#232b4d] p-2 rounded">
                      <div className="text-white/60">Exam Type</div>
                      <div className="text-white font-semibold">{session.examType}</div>
                    </div>
                    <div className="bg-[#232b4d] p-2 rounded">
                      <div className="text-white/60">Duration</div>
                      <div className="text-white font-semibold">
                        {session.endTime 
                          ? `${Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)}m`
                          : "Ongoing"
                        }
                      </div>
                    </div>
                  </div>

                  {/* Violation Stats */}
                  <div className="bg-[#232b4d] p-3 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">Total Violations</span>
                      <span className="text-lg font-bold text-white">{session.totalViolations}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-red-400 font-bold">{session.highSeverityCount}</div>
                        <div className="text-white/60">High</div>
                      </div>
                      <div className="text-center">
                        <div className="text-yellow-400 font-bold">{session.mediumSeverityCount}</div>
                        <div className="text-white/60">Medium</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-bold">{session.lowSeverityCount}</div>
                        <div className="text-white/60">Low</div>
                      </div>
                    </div>
                  </div>

                  {/* Suspicion Score */}
                  <div className="bg-[#232b4d] p-3 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/60">Suspicion Level</span>
                      <span className={`text-xs font-bold ${suspicion.color}`}>
                        {suspicion.level}
                      </span>
                    </div>
                    <div className="w-full bg-[#151c2e] rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          session.suspicionScore >= 80 ? 'bg-red-500' :
                          session.suspicionScore >= 50 ? 'bg-orange-500' :
                          session.suspicionScore >= 30 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(session.suspicionScore, 100)}%` }}
                      />
                    </div>
                    <div className="text-right text-xs text-white/60 mt-1">
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
                      className="flex-1 bg-[#232b4d] border-[#6aa5ff]/30 hover:bg-[#6aa5ff]/20 text-white"
                    >
                      <Eye className="mr-2 h-3 w-3" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {sessions.length === 0 && (
          <Card className="bg-[#192345] border-[#6aa5ff]/20">
            <CardContent className="py-12 text-center text-white/60">
              No proctoring sessions found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
