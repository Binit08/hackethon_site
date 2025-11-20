"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, Plus, Trash2, Edit, Camera, Users, FileText, 
  TrendingUp, Award, Activity, CheckCircle, XCircle, Clock,
  BarChart3, Target, Shield, Sparkles as SparklesIcon, Zap, Crown
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Sparkles } from "@/components/ui/sparkles"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { MovingBorder } from "@/components/ui/moving-border"
import { motion } from "framer-motion"

interface Problem {
  id: string
  title: string
  description: string
  type: string
  difficulty: string
  points: number
  isActive?: boolean
  round: number
}

interface DashboardStats {
  totalUsers: number
  totalTeams: number
  totalProblems: number
  totalSubmissions: number
  acceptedSubmissions: number
  activeUsers: number
  averageScore: number
  invalidTeamNames?: number
  newTeams24h?: number
}

export default function AdminPage() {
  const router = useRouter()
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTeams: 0,
    totalProblems: 0,
    totalSubmissions: 0,
    acceptedSubmissions: 0,
    activeUsers: 0,
    averageScore: 0,
    invalidTeamNames: 0,
    newTeams24h: 0,
  })
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([])
  const [allSubmissions, setAllSubmissions] = useState<any[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const mountedRef = useRef(true)
  const { toast } = useToast()

  // Fetch with AbortController and careful type checks
  const fetchProblems = useCallback(async (signal?: AbortSignal) => {
    try {
      const resp = await fetch("/api/problems", { signal })
      if (!resp.ok) {
        const ct = resp.headers.get("content-type")
        if (ct?.includes("application/json")) {
          const body = await resp.json().catch(() => null)
          throw new Error(body?.error || `Failed to fetch problems (${resp.status})`)
        } else {
          const text = await resp.text().catch(() => "")
          throw new Error(text || `Failed to fetch problems (${resp.status})`)
        }
      }
      const ct = resp.headers.get("content-type") || ""
      if (!ct.includes("application/json")) {
        throw new Error("Server returned non-JSON for problems list")
      }
      const data = await resp.json()
      if (!Array.isArray(data)) throw new Error("Invalid problems format from server")
      if (!mountedRef.current) return
      setProblems(data)
    } catch (err: any) {
      if (err.name === "AbortError") return
      toast({
        title: "Unable to load",
        description: err.message || "Failed to load problems",
        variant: "destructive",
      })
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [toast])

  const fetchDashboardStats = useCallback(async () => {
    try {
      const [subsRes, adminStatsRes] = await Promise.all([
        fetch('/api/submissions'),
        fetch('/api/admin/stats')
      ])
      const submissions = subsRes.ok ? await subsRes.json() : []
      const adminStats = adminStatsRes.ok ? await adminStatsRes.json() : {}

      const accepted = submissions.filter((s: any) => s.status === 'ACCEPTED').length
      const totalScore = submissions.reduce((sum: number, s: any) => sum + (s.score || 0), 0)

      setStats({
        totalUsers: Number(adminStats.totalUsers || 0),
        totalTeams: Number(adminStats.totalTeams || 0),
        totalProblems: problems.length,
        totalSubmissions: submissions.length,
        acceptedSubmissions: accepted,
        activeUsers: 0,
        averageScore: submissions.length > 0 ? Math.round(totalScore / submissions.length) : 0,
        invalidTeamNames: Number(adminStats.invalidTeamNames || 0),
        newTeams24h: Number(adminStats.newTeams24h || 0),
      })
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [problems.length])

  const fetchRecentSubmissions = useCallback(async () => {
    try {
      const res = await fetch('/api/submissions')
      if (res.ok) {
        const data = await res.json()
        setRecentSubmissions(Array.isArray(data) ? data.slice(0, 5) : [])
      }
    } catch (err) {
      console.error('Failed to fetch recent submissions:', err)
    }
  }, [])

  const fetchAllSubmissions = useCallback(async () => {
    setLoadingSubmissions(true)
    try {
      const res = await fetch('/api/submissions')
      if (res.ok) {
        const data = await res.json()
        setAllSubmissions(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Failed to fetch all submissions:', err)
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive"
      })
    } finally {
      setLoadingSubmissions(false)
    }
  }, [toast])

  useEffect(() => {
    mountedRef.current = true
    const ac = new AbortController()
    fetchProblems(ac.signal)
    fetchDashboardStats()
    fetchRecentSubmissions()
    return () => {
      mountedRef.current = false
      ac.abort()
    }
  }, [fetchProblems, fetchDashboardStats, fetchRecentSubmissions])

  // Optimistic delete: remove from UI immediately, rollback if server fails
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this problem? This action cannot be undone.")) return
    const prev = problems
    setProblems((p) => p.filter((x) => x.id !== id))

    try {
      const resp = await fetch(`/api/problems/${id}`, { method: "DELETE" })
      if (!resp.ok) {
        const ct = resp.headers.get("content-type") || ""
        if (ct.includes("application/json")) {
          const body = await resp.json().catch(() => null)
          throw new Error(body?.error || `Delete failed (${resp.status})`)
        } else {
          throw new Error(`Delete failed (${resp.status})`)
        }
      }
      toast({ title: "Deleted", description: "Problem removed successfully." })
    } catch (err: any) {
      setProblems(prev) // rollback
      toast({
        title: "Delete failed",
        description: err?.message || "Could not delete problem.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 relative overflow-hidden">
        <BackgroundBeams />
        <Sparkles />
        
        {/* Background & Glass Effect - matching homepage */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(87,97,255,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,75,149,0.12),transparent_55%)]" />
        </div>
        <div className="absolute inset-0 bg-white/0 backdrop-blur-[2px]" />

        {/* Header */}
        <header className="relative z-10 pt-10 pb-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-blue-200 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/50"
                    >
                      <Crown className="w-8 h-8 text-white" />
                    </motion.div>
                    <TextGenerateEffect 
                      words="Admin Panel"
                      className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900"
                    />
                  </div>
                  <p className="text-gray-700 text-lg font-medium flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Manage problems, submissions and results for the hackathon
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <MovingBorder duration={2000} className="bg-blue-100/50">
                    <Button
                      onClick={() => router.push("/")}
                      variant="ghost"
                      className="bg-transparent border-0 !text-gray-900 hover:!text-gray-700"
                    >
                      ← Back to Home
                    </Button>
                  </MovingBorder>
                  <MovingBorder duration={2000} className="bg-purple-100/50">
                    <Button
                      onClick={() => router.push("/admin/proctoring")}
                      variant="ghost"
                      className="bg-transparent border-0 !text-gray-900 hover:!text-gray-700 flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Proctoring
                    </Button>
                  </MovingBorder>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <MovingBorder duration={2000} className="bg-gradient-to-r from-blue-500 to-cyan-600">
                        <Button
                          onClick={() => {
                            setEditingProblem(null)
                            setIsDialogOpen(true)
                          }}
                          className="flex items-center gap-2 bg-transparent hover:bg-transparent text-white border-0"
                        >
                          <Plus className="h-4 w-4" />
                          Add Problem
                        </Button>
                      </MovingBorder>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-blue-200">
                      <DialogHeader>
                        <DialogTitle className="text-gray-900">
                          {editingProblem ? "Edit Problem" : "Create Problem"}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                          {editingProblem
                            ? "Update the problem details"
                            : "Add a new problem to the hackathon"}
                        </DialogDescription>
                      </DialogHeader>

                      <ProblemForm
                        key={editingProblem?.id ?? "create"}
                        problem={editingProblem}
                        onSuccess={() => {
                          setIsDialogOpen(false)
                          // re-fetch to keep state fresh
                          setLoading(true)
                          fetchProblems()
                        }}
                      />
                    </DialogContent>
                  </Dialog>

                  <MovingBorder duration={2000} className="bg-green-100/50">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setLoading(true)
                        fetchProblems()
                      }}
                      className="bg-transparent border-0 !text-gray-900 hover:!text-gray-700"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                    </Button>
                  </MovingBorder>
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        <main className="relative z-10 container mx-auto px-4 max-w-6xl pb-12">
          {/* Dashboard Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="bg-white/80 backdrop-blur-xl border-blue-200 shadow-xl hover:shadow-blue-500/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1 font-semibold">Total Problems</p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.totalProblems}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="bg-white/80 backdrop-blur-xl border-purple-200 shadow-xl hover:shadow-purple-500/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1 font-semibold">Submissions</p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.totalSubmissions}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="bg-white/80 backdrop-blur-xl border-green-200 shadow-xl hover:shadow-green-500/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1 font-semibold">Accepted</p>
                      <p className="text-4xl font-bold text-green-600">{stats.acceptedSubmissions}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="bg-white/80 backdrop-blur-xl border-yellow-200 shadow-xl hover:shadow-yellow-500/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1 font-semibold">Active Users</p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{stats.activeUsers}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Tabs defaultValue="problems" className="space-y-6">
            <TabsList className="bg-white/80 backdrop-blur-xl border border-blue-200">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700">Overview</TabsTrigger>
              <TabsTrigger value="problems" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700">Problems</TabsTrigger>
              <TabsTrigger value="submissions" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700">Submissions</TabsTrigger>
              <TabsTrigger value="results" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-6">
                {/* Recent Activity */}
                <Card className="bg-white/80 backdrop-blur-xl border-blue-200 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Recent Submissions
                    </CardTitle>
                    <CardDescription className="text-gray-600">Latest 5 submissions from participants</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentSubmissions.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No submissions yet</p>
                    ) : (
                      <div className="space-y-3">
                        {recentSubmissions.map((sub: any) => (
                          <div key={sub.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                              {sub.status === 'ACCEPTED' ? (
                                <CheckCircle className="h-5 w-5 text-green-400" />
                              ) : sub.status === 'WRONG_ANSWER' ? (
                                <XCircle className="h-5 w-5 text-red-400" />
                              ) : (
                                <Clock className="h-5 w-5 text-yellow-400" />
                              )}
                              <div>
                                <p className="text-gray-900 font-medium">{sub.problem?.title || 'Problem'}</p>
                                <p className="text-gray-500 text-sm">{new Date(sub.submittedAt).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-900 font-semibold">{sub.score} pts</p>
                              <p className={`text-sm ${
                                sub.status === 'ACCEPTED' ? 'text-green-400' :
                                sub.status === 'WRONG_ANSWER' ? 'text-red-400' :
                                'text-yellow-400'
                              }`}>
                                {sub.status.replace(/_/g, ' ')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-white/80 backdrop-blur-xl border-purple-200 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button 
                        onClick={() => router.push('/admin/proctoring')}
                        className="h-24 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-400 flex flex-col items-center justify-center gap-2 !text-gray-900"
                      >
                        <Shield className="h-8 w-8 text-blue-600" />
                        <span>View Proctoring</span>
                      </Button>
                      <Button 
                        onClick={() => router.push('/leaderboard')}
                        className="h-24 bg-purple-50 border border-purple-200 hover:bg-purple-100 hover:border-purple-400 flex flex-col items-center justify-center gap-2 !text-gray-900"
                      >
                        <BarChart3 className="h-8 w-8 text-purple-600" />
                        <span>Leaderboard</span>
                      </Button>
                      <Button 
                        onClick={() => {
                          setEditingProblem(null)
                          setIsDialogOpen(true)
                        }}
                        className="h-24 bg-cyan-50 border border-cyan-200 hover:bg-cyan-100 hover:border-cyan-400 flex flex-col items-center justify-center gap-2 !text-gray-900"
                      >
                        <Plus className="h-8 w-8 text-cyan-600" />
                        <span>Add Problem</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="problems">
              <Card className="bg-white/80 backdrop-blur-xl border-blue-200 shadow-xl">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-gray-900 text-2xl">Problems</CardTitle>
                      <CardDescription className="text-gray-600">Manage coding and MCQ problems</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : problems.length === 0 ? (
                    <div className="p-8 text-center text-gray-600 bg-blue-50 rounded-xl border border-blue-200">
                      No problems found. Click &quot;Add Problem&quot; to create your first problem.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {problems.filter(Boolean).map((problem: any) => (
                        <div
                          key={problem.id || problem._id}
                          className="flex items-center justify-between p-6 border border-blue-200 rounded-xl bg-white hover:border-blue-400 hover:shadow-lg transition-all"
                        >
                          <div className="flex-1">
                            <h3 className="font-bold text-xl mb-2 text-gray-900">{problem?.title || 'Untitled Problem'}</h3>
                            <div className="flex gap-3 mb-3 flex-wrap">
                              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                                {problem?.type || 'UNKNOWN'}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                problem?.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                                problem?.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {problem?.difficulty || 'N/A'}
                              </span>
                              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                                {problem?.points ?? 0} pts
                              </span>
                              <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium">
                                Round {problem?.round ?? '?'}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2">{problem?.description || 'No description provided.'}</p>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingProblem(problem)
                                setIsDialogOpen(true)
                              }}
                              className="border-blue-300 hover:bg-blue-50 hover:border-blue-500 !text-gray-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(problem.id || problem._id)}
                              className="bg-red-50 hover:bg-red-100 border border-red-300 !text-red-600 hover:!text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submissions">
              <Card className="bg-white/80 backdrop-blur-xl border-blue-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-gray-900 text-2xl flex items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    All Submissions
                  </CardTitle>
                  <CardDescription className="text-gray-600">View and manage all submissions from participants</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">Total submissions: {allSubmissions.length}</p>
                      <Button 
                        onClick={fetchAllSubmissions}
                        disabled={loadingSubmissions}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {loadingSubmissions ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Refresh
                      </Button>
                    </div>

                    {loadingSubmissions ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    ) : allSubmissions.length === 0 ? (
                      <div className="text-center py-12 bg-blue-50 rounded-xl border border-blue-200">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No submissions yet. Click refresh to load submissions.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-blue-100 border-b-2 border-blue-300">
                              <th className="text-left p-3 text-gray-900 font-semibold">User</th>
                              <th className="text-left p-3 text-gray-900 font-semibold">Problem</th>
                              <th className="text-left p-3 text-gray-900 font-semibold">Language</th>
                              <th className="text-left p-3 text-gray-900 font-semibold">Status</th>
                              <th className="text-left p-3 text-gray-900 font-semibold">Score</th>
                              <th className="text-left p-3 text-gray-900 font-semibold">Submitted At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allSubmissions.map((sub: any, idx: number) => (
                              <tr 
                                key={sub._id || idx} 
                                className={`border-b border-blue-100 hover:bg-blue-50 transition-colors ${
                                  idx % 2 === 0 ? 'bg-white' : 'bg-blue-50/50'
                                }`}
                              >
                                <td className="p-3 text-gray-900">{sub.userId?.name || 'Unknown'}</td>
                                <td className="p-3 text-gray-900">{sub.problemId?.title || 'Unknown Problem'}</td>
                                <td className="p-3 text-gray-600 uppercase">{sub.language || 'N/A'}</td>
                                <td className="p-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    sub.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                    sub.status === 'WRONG_ANSWER' ? 'bg-red-100 text-red-700' :
                                    sub.status === 'COMPILATION_ERROR' ? 'bg-orange-100 text-orange-700' :
                                    sub.status === 'RUNTIME_ERROR' ? 'bg-red-100 text-red-700' :
                                    sub.status === 'TIME_LIMIT_EXCEEDED' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {sub.status?.replace(/_/g, ' ') || 'PENDING'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="text-gray-900 font-semibold">{sub.score}</span>
                                  <span className="text-gray-500 text-sm"> / {sub.problemId?.points || 100}</span>
                                </td>
                                <td className="p-3 text-gray-600 text-sm">
                                  {new Date(sub.submittedAt).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results">
              <Card className="bg-white/80 backdrop-blur-xl border-blue-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-gray-900 text-2xl">Results</CardTitle>
                  <CardDescription className="text-gray-600">View and export results</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 bg-blue-50 p-6 rounded-xl border border-blue-200">Results view will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  )
}

/* ---------------------------
   ProblemForm component
   - Better validation
   - Handles both Create and Update
   - Displays detailed console logs for debugging
   --------------------------- */
function ProblemForm({
  problem,
  onSuccess,
}: {
  problem: Problem | null
  onSuccess: () => void
}) {
  const initial = {
    title: problem?.title ?? "",
    description: problem?.description ?? "",
    type: problem?.type ?? "CODING",
    difficulty: problem?.difficulty ?? "MEDIUM",
    points: problem?.points ?? 100,
    timeLimit: 5,
    memoryLimit: 256,
    constraints: "",
    sampleInput: "",
    sampleOutput: "",
    round: problem?.round ?? 1,
  }

  const [formData, setFormData] = useState(initial)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // keep form in sync if editingProblem changes externally
  useEffect(() => {
    setFormData({
      title: problem?.title ?? "",
      description: problem?.description ?? "",
      type: problem?.type ?? "CODING",
      difficulty: problem?.difficulty ?? "MEDIUM",
      points: problem?.points ?? 100,
      timeLimit: 5,
      memoryLimit: 256,
      constraints: "",
      sampleInput: "",
      sampleOutput: "",
      round: problem?.round ?? 1,
    })
  }, [problem])

  const validate = () => {
    if (!formData.title || formData.title.trim().length < 4)
      return "Title must be at least 4 characters."
    if (!formData.description || formData.description.trim().length < 10)
      return "Description must be at least 10 characters."
    if (!Number.isFinite(Number(formData.points)) || formData.points <= 0)
      return "Points must be a positive number."
    if (!Number.isFinite(Number(formData.round)) || formData.round <= 0)
      return "Round must be a positive number."
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate()
    if (v) {
      toast({ title: "Validation", description: v, variant: "destructive" })
      return
    }

    setLoading(true)
    const url = problem ? `/api/problems/${problem.id}` : "/api/problems"
    const method = problem ? "PUT" : "POST"

    try {
      console.log(`[ProblemForm] submitting to ${method} ${url}`, formData)
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      console.log("[ProblemForm] response status", resp.status)

      if (!resp.ok) {
        const ct = resp.headers.get("content-type") || ""
        if (ct.includes("application/json")) {
          const body = await resp.json().catch(() => null)
          console.error("[ProblemForm] api error json:", body)
          throw new Error(body?.error || `Save failed (${resp.status})`)
        } else {
          const text = await resp.text().catch(() => "")
          console.error("[ProblemForm] api error text:", text)
          throw new Error(text || `Save failed (${resp.status})`)
        }
      }

      const ct = resp.headers.get("content-type") || ""
      if (!ct.includes("application/json")) {
        const text = await resp.text().catch(() => "")
        console.warn("[ProblemForm] non-json success:", text)
        throw new Error("Server returned non-JSON response")
      }

      const result = await resp.json()
      console.log("[ProblemForm] success:", result)
      toast({ title: "Saved", description: `Problem ${problem ? "updated" : "created"}` })
      onSuccess()
    } catch (err: any) {
      console.error("[ProblemForm] submit error:", err)
      toast({
        title: "Save error",
        description: err?.message || "Could not save problem",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-white">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          minLength={4}
          className="bg-[#232b4d] border-[#6aa5ff]/20 text-white focus:border-[#6aa5ff]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">Description</Label>
        <textarea
          id="description"
          className="flex min-h-[100px] w-full rounded-md border border-[#6aa5ff]/20 bg-[#232b4d] px-3 py-2 text-sm text-white ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6aa5ff] focus-visible:ring-offset-2"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          minLength={10}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type" className="text-white">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger className="bg-[#232b4d] border-[#6aa5ff]/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#232b4d] border-[#6aa5ff]/20">
              <SelectItem value="CODING" className="text-white">Coding</SelectItem>
              <SelectItem value="MCQ" className="text-white">MCQ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty" className="text-white">Difficulty</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
          >
            <SelectTrigger className="bg-[#232b4d] border-[#6aa5ff]/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#232b4d] border-[#6aa5ff]/20">
              <SelectItem value="EASY" className="text-white">Easy</SelectItem>
              <SelectItem value="MEDIUM" className="text-white">Medium</SelectItem>
              <SelectItem value="HARD" className="text-white">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="points" className="text-white">Points</Label>
          <Input
            id="points"
            type="number"
            value={formData.points}
            onChange={(e) =>
              setFormData({ ...formData, points: parseInt(e.target.value || "0", 10) })
            }
            required
            min={1}
            className="bg-[#232b4d] border-[#6aa5ff]/20 text-white focus:border-[#6aa5ff]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="round" className="text-white">Round</Label>
          <Input
            id="round"
            type="number"
            value={formData.round}
            onChange={(e) =>
              setFormData({ ...formData, round: parseInt(e.target.value || "1", 10) })
            }
            required
            min={1}
            className="bg-[#232b4d] border-[#6aa5ff]/20 text-white focus:border-[#6aa5ff]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeLimit" className="text-white">Time Limit (min)</Label>
          <Input
            id="timeLimit"
            type="number"
            value={formData.timeLimit}
            onChange={(e) =>
              setFormData({ ...formData, timeLimit: parseInt(e.target.value || "5", 10) })
            }
            required
            min={1}
            className="bg-[#232b4d] border-[#6aa5ff]/20 text-white focus:border-[#6aa5ff]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="memoryLimit" className="text-white">Memory Limit (MB)</Label>
        <Input
          id="memoryLimit"
          type="number"
          value={formData.memoryLimit}
          onChange={(e) =>
            setFormData({ ...formData, memoryLimit: parseInt(e.target.value || "256", 10) })
          }
          required
          min={16}
          className="bg-[#232b4d] border-[#6aa5ff]/20 text-white focus:border-[#6aa5ff]"
        />
      </div>

      {formData.type === "CODING" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="constraints" className="text-white">Constraints (optional)</Label>
            <textarea
              id="constraints"
              className="flex min-h-[60px] w-full rounded-md border border-[#6aa5ff]/20 bg-[#232b4d] px-3 py-2 text-sm text-white"
              value={formData.constraints}
              onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
              placeholder="e.g., 1 <= n <= 10^5"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sampleInput" className="text-white">Sample Input (optional)</Label>
              <textarea
                id="sampleInput"
                className="flex min-h-[60px] w-full rounded-md border border-[#6aa5ff]/20 bg-[#232b4d] px-3 py-2 text-sm text-white"
                value={formData.sampleInput}
                onChange={(e) => setFormData({ ...formData, sampleInput: e.target.value })}
                placeholder="Example input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sampleOutput" className="text-white">Sample Output (optional)</Label>
              <textarea
                id="sampleOutput"
                className="flex min-h-[60px] w-full rounded-md border border-[#6aa5ff]/20 bg-[#232b4d] px-3 py-2 text-sm text-white"
                value={formData.sampleOutput}
                onChange={(e) => setFormData({ ...formData, sampleOutput: e.target.value })}
                placeholder="Expected output"
              />
            </div>
          </div>
        </>
      )}

      <div className="flex gap-2 pt-4">
        <Button 
          type="submit" 
          disabled={loading} 
          className="flex-1 bg-[#6aa5ff] hover:bg-[#3c7dff]"
        >
          {loading ? "Saving..." : problem ? "Update Problem" : "Create Problem"}
        </Button>
      </div>
    </form>
  )
}
