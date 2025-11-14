"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle, Code, Calendar, Zap, Activity } from "lucide-react"

interface Submission {
  id: string
  problem: {
    title: string
    points: number
  }
  status: string
  score: number
  runtime: number | null
  memory: number | null
  submittedAt: string
  verdict: string | null
  error: string | null
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("/api/submissions")
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to fetch submissions" }))
        throw new Error(error.error || "Failed to fetch submissions")
      }
      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        throw new Error("Server returned non-JSON response")
      }
      const data = await response.json()
      // API returns submissions with problemId populated, not 'problem'
      const normalized = Array.isArray(data)
        ? data.filter(Boolean).map((s: any) => ({
            id: s._id || s.id,
            problem: {
              title: s.problemId?.title || 'Unknown Problem',
              points: s.problemId?.points || 0,
            },
            status: s.status || 'PENDING',
            score: typeof s.score === 'number' ? s.score : 0,
            runtime: s.runtime ?? null,
            memory: s.memory ?? null,
            submittedAt: s.submittedAt || new Date().toISOString(),
            verdict: s.verdict || null,
            error: s.error || null,
          }))
        : []
      setSubmissions(normalized)
    } catch (error: any) {
      console.error("Error fetching submissions:", error)
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Accepted</Badge>
      case "WRONG_ANSWER":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Wrong Answer</Badge>
      case "RUNTIME_ERROR":
        return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">Runtime Error</Badge>
      case "COMPILATION_ERROR":
        return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">Compilation Error</Badge>
      case "TIME_LIMIT_EXCEEDED":
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Time Limit</Badge>
      default:
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Pending</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "WRONG_ANSWER":
      case "RUNTIME_ERROR":
      case "COMPILATION_ERROR":
        return <XCircle className="h-4 w-4 text-red-400" />
      case "TIME_LIMIT_EXCEEDED":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />
      default:
        return <Clock className="h-4 w-4 text-blue-400" />
    }
  }

  const calculateAccuracy = () => {
    const accepted = submissions.filter(s => s.status === "ACCEPTED").length
    return submissions.length > 0 ? ((accepted / submissions.length) * 100).toFixed(1) : 0
  }

  const getTotalScore = () => {
    return submissions.reduce((sum, s) => sum + s.score, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151c2e] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6aa5ff]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#151c2e] py-8 pt-24">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Code className="h-8 w-8 text-[#6aa5ff]" />
            My Submissions
          </h1>
          <p className="text-white/60">Track your coding progress and submission history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#192345] border-[#6aa5ff]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Total</p>
                  <p className="text-3xl font-bold text-white">{submissions.length}</p>
                </div>
                <Activity className="h-8 w-8 text-[#6aa5ff]/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#192345] border-[#6aa5ff]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Accepted</p>
                  <p className="text-3xl font-bold text-green-400">
                    {submissions.filter(s => s.status === "ACCEPTED").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#192345] border-[#6aa5ff]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Accuracy</p>
                  <p className="text-3xl font-bold text-[#6aa5ff]">{calculateAccuracy()}%</p>
                </div>
                <Zap className="h-8 w-8 text-[#6aa5ff]/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#192345] border-[#6aa5ff]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Total Score</p>
                  <p className="text-3xl font-bold text-yellow-400">{getTotalScore()}</p>
                </div>
                <Activity className="h-8 w-8 text-yellow-400/40" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Table */}
        <Card className="bg-[#192345] border-[#6aa5ff]/20">
          <CardHeader className="border-b border-[#6aa5ff]/10">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#6aa5ff]" />
              Submission History
            </CardTitle>
            <CardDescription className="text-white/60">
              {submissions.length} total submissions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {submissions.length === 0 ? (
              <div className="text-center py-16">
                <Code className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg">No submissions yet</p>
                <p className="text-white/40 text-sm mt-2">Start solving problems to see your submissions here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0f1729] border-b border-[#6aa5ff]/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                        Problem
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                        Runtime
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                        Memory
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#6aa5ff]/10">
                    {submissions.filter(Boolean).map((submission) => (
                      <tr 
                        key={submission.id} 
                        className="hover:bg-[#1f2d4f]/30 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(submission.status)}
                            {getStatusBadge(submission.status)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">
                            {submission.problem.title}
                          </div>
                          {submission.verdict && (
                            <div className="text-sm text-white/50 mt-1">
                              {submission.verdict}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-white font-semibold">
                            {submission.score}
                            <span className="text-white/50">/{submission.problem.points}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-white/80">
                            {submission.runtime ? `${submission.runtime}ms` : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-white/80">
                            {submission.memory ? `${submission.memory}KB` : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white/60">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                            <div className="text-xs text-white/40">
                              {new Date(submission.submittedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

