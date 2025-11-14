"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Play, Send, TimerReset, Maximize2, Minimize2, Terminal } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Proctoring } from "@/components/proctoring"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-96 bg-muted animate-pulse" />,
})

interface Problem {
  _id: string
  id?: string
  title: string
  description: string
  points: number
  timeLimit: number
  memoryLimit: number
  constraints: string | null
  sampleInput: string | null
  sampleOutput: string | null
  testCases: Array<{
    id: string
    input: string
    output: string
    isHidden: boolean
  }>
}

export default function CodingRoundPage() {
  const { data: session } = useSession()
  const [statusLoading, setStatusLoading] = useState(true)
  const [roundStatus, setRoundStatus] = useState<any | null>(null)
  const [problems, setProblems] = useState<Problem[]>([])
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [running, setRunning] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState<string>("")
  const [customInput, setCustomInput] = useState<string>("")
  const [leftWidth, setLeftWidth] = useState<number>(50) // %
  const [isResizing, setIsResizing] = useState(false)
  const [editorFullscreen, setEditorFullscreen] = useState(false)
  const [proctoringSessionId] = useState(`coding-${session?.user?.id || 'guest'}-${Date.now()}`)
  const router = useRouter()
  const { toast } = useToast()
  const containerRef = useRef<HTMLDivElement | null>(null)

  const fetchProblems = useCallback(async () => {
    try {
      const response = await fetch("/api/problems?type=CODING&isActive=true")
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to fetch problems" }))
        throw new Error(error.error || "Failed to fetch problems")
      }
      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        throw new Error("Server returned non-JSON response")
      }
      const data = await response.json()
      // Ensure each problem has an 'id' property for compatibility
      const problemsWithId = data.map((p: any) => ({
        ...p,
        id: p._id || p.id,
      }))
      setProblems(problemsWithId)
      if (problemsWithId.length > 0) {
        setSelectedProblem(problemsWithId[0])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load problems",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchProblems()
  }, [fetchProblems])

  // Fetch round status to gate Round 2 access
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await fetch('/api/rounds/status')
        if (res.ok) {
          const data = await res.json()
          setRoundStatus(data)
        }
      } catch (e) {
        // ignore
      } finally {
        setStatusLoading(false)
      }
    }
    loadStatus()
  }, [])

  // Dev/admin override to allow coding submissions off-schedule and bypass qualification
  const allowOffschedule = (process.env.NEXT_PUBLIC_ALLOW_OFFSCHEDULE_SUBMISSIONS === 'true') || (session?.user?.role === 'ADMIN')

  useEffect(() => {
    if (selectedProblem) {
      // Set default code based on language
      const defaults: Record<string, string> = {
        javascript: "function solve(input) {\n  // Your code here\n  return input;\n}",
        python: "def solve(input):\n    # Your code here\n    return input",
        java: "public class Solution {\n    public String solve(String input) {\n        // Your code here\n        return input;\n    }\n}",
        cpp: "#include <iostream>\n#include <string>\nusing namespace std;\n\nstring solve(string input) {\n    // Your code here\n    return input;\n}",
      }
      setCode(defaults[language] || defaults.javascript)
    }
  }, [selectedProblem, language])

  

  // Resizer handlers
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.min(75, Math.max(25, (x / rect.width) * 100))
    setLeftWidth(pct)
  }, [isResizing])

  const stopResizing = useCallback(() => setIsResizing(false), [])

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", onMouseMove)
      window.addEventListener("mouseup", stopResizing)
    } else {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", stopResizing)
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", stopResizing)
    }
  }, [isResizing, onMouseMove, stopResizing])

  // Keyboard shortcuts: Ctrl/Cmd+Enter to Run, Shift+Enter to Submit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleRun()
      } else if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  })

  const handleSubmit = async () => {
    if (!selectedProblem || !code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before submitting",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: selectedProblem.id,
          code,
          language,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Submission failed" }))
        throw new Error(error.error || "Submission failed")
      }

      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        throw new Error("Server returned non-JSON response")
      }

      const result = await response.json()

      toast({
        title: "Submitted",
        description: "Your code has been queued for evaluation.",
      })

      router.push("/submissions")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit code",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Auto-submit on navigation/back or tab hide for coding
  useEffect(() => {
    const hasWork = () => !!(selectedProblem && code.trim())

    const makeBeaconPayload = () => {
      const items = selectedProblem && code.trim()
        ? [{ problemId: (selectedProblem as any).id, code, language }]
        : []
      return JSON.stringify({ items, reason: 'AUTO_UNLOAD', round: 'CODING' })
    }

    const autoSubmit = () => {
      if (!hasWork()) return
      try {
        const blob = new Blob([makeBeaconPayload()], { type: 'application/json' })
        navigator.sendBeacon('/api/submissions/auto', blob)
      } catch (e) {
        fetch('/api/submissions/auto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: makeBeaconPayload(),
          keepalive: true,
        }).catch(() => {})
      }
      if ((window as any).__stopProctoring) {
        (window as any).__stopProctoring()
      }
    }

    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (hasWork()) {
        autoSubmit()
        e.preventDefault()
        e.returnValue = ''
      }
    }

    const onPopState = () => {
      if (hasWork()) {
        toast({ title: 'Leaving coding round', description: 'Your code is being auto-submitted.' })
        autoSubmit()
      }
    }

    const onVisibility = () => {
      if (document.hidden && hasWork()) {
        toast({ title: 'Tab hidden', description: 'Auto-submitting your code and stopping proctoring.' })
        autoSubmit()
      }
    }

    window.addEventListener('beforeunload', beforeUnload)
    window.addEventListener('popstate', onPopState)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('beforeunload', beforeUnload)
      window.removeEventListener('popstate', onPopState)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [selectedProblem, code, language, toast])

  const handleRun = async () => {
    if (!selectedProblem || !code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before running",
        variant: "destructive",
      })
      return
    }
    setRunning(true)
    setConsoleOutput((prev) => prev ? prev + "\n---\n" : "")
    setConsoleOutput((prev) => prev + `[Run] Problem: ${selectedProblem.title}\nLanguage: ${language}\nInput: ${customInput || selectedProblem.sampleInput || "<none>"}\n\nProcessing...\n`)
    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: selectedProblem.id,
          code,
          language,
          input: customInput || selectedProblem.sampleInput || "",
        }),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Run failed" }))
        throw new Error(error.error || "Run failed")
      }
      const result = await response.json()
      setConsoleOutput((prev) => prev + `Status: ${result.status}\nVerdict: ${result.verdict}\n`)
      if (result.stdout) {
        setConsoleOutput((prev) => prev + `\nStdout:\n${result.stdout}\n`)
      }
      if (result.stderr) {
        setConsoleOutput((prev) => prev + `\nStderr:\n${result.stderr}\n`)
      }
      if (result.compileOutput) {
        setConsoleOutput((prev) => prev + `\nCompile Output:\n${result.compileOutput}\n`)
      }
      if (result.message) {
        setConsoleOutput((prev) => prev + `\nMessage: ${result.message}\n`)
      }
      if (result.metrics) {
        setConsoleOutput((prev) => prev + `\nExecution Time: ${result.metrics.timeMs?.toFixed(2) || "N/A"} ms\n`)
        setConsoleOutput((prev) => prev + `Memory Used: ${result.metrics.memoryKB ? (result.metrics.memoryKB / 1024).toFixed(2) : "N/A"} MB\n`)
      }
    } catch (err: any) {
      setConsoleOutput((prev) => prev + `Error: ${err?.message || "Unknown error"}\n`)
      toast({
        title: "Run failed",
        description: err?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setRunning(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151c2e] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6aa5ff]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#151c2e] text-white relative overflow-hidden">
      {/* Round access gating banners */}
      {/* Banners removed per request; gating logic retained without visual notices */}
      
      {/* Background & Glass Effect - matching homepage */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(87,97,255,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,75,149,0.12),transparent_55%)]" />
      </div>
      <div className="absolute inset-0 bg-white/0 backdrop-blur-[2px]" />

  {/* Top bar */}
      <div className="z-10 w-full border-b border-[#6aa5ff]/20 bg-[#192345]/80 backdrop-blur supports-[backdrop-filter]:bg-[#192345]/60 sticky top-0">
        <div className="container mx-auto px-4 py-3 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <Select
              value={selectedProblem?.id || ""}
              onValueChange={(value) => {
                const problem = problems.find((p) => p.id === value)
                setSelectedProblem(problem || null)
                setCode("")
                setConsoleOutput("")
              }}
            >
              <SelectTrigger className="w-60 bg-[#232b4d] border-[#6aa5ff]/20 text-white">
                <SelectValue placeholder="Select problem" />
              </SelectTrigger>
              <SelectContent className="bg-[#232b4d] border-[#6aa5ff]/20">
                {problems.map((problem) => (
                  <SelectItem key={problem.id || problem._id} value={problem.id || problem._id} className="text-white">
                    {problem.title} ({problem.points} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedProblem && (
              <div className="hidden md:flex items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 font-medium">{selectedProblem.points} pts</span>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-medium">{selectedProblem.timeLimit}m</span>
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">{selectedProblem.memoryLimit}MB</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Disable action buttons if locked */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-36 bg-[#232b4d] border-[#6aa5ff]/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#232b4d] border-[#6aa5ff]/20">
                <SelectItem value="javascript" className="text-white">JavaScript</SelectItem>
                <SelectItem value="python" className="text-white">Python</SelectItem>
                <SelectItem value="java" className="text-white">Java</SelectItem>
                <SelectItem value="cpp" className="text-white">C++</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setEditorFullscreen((v) => !v)}
              title={editorFullscreen ? "Exit fullscreen" : "Fullscreen editor"}
              className="bg-[#232b4d] border-[#6aa5ff]/30 hover:bg-[#6aa5ff]/20 text-white"
            >
              {editorFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>

            <Button 
              onClick={handleRun} 
              disabled={running || !selectedProblem || (!allowOffschedule && (roundStatus && roundStatus.round2.window === 'active' && !roundStatus.round1.qualified))} 
              variant="outline"
              className="bg-green-500/20 border-green-500/30 hover:bg-green-500/30 text-green-400"
            >
              {running ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Run
                </>
              )}
            </Button>
            <Button
              variant="outline"
              disabled={!consoleOutput}
              onClick={() => setConsoleOutput("")}
              title="Clear console"
              className="bg-[#232b4d] border-[#6aa5ff]/30 hover:bg-[#6aa5ff]/20 text-white"
            >
              <TimerReset className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !selectedProblem || (!allowOffschedule && (roundStatus && roundStatus.round2.window === 'active' && !roundStatus.round1.qualified))}
              className="bg-[#6aa5ff] hover:bg-[#3c7dff]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Submit
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main split panes */}
      <div ref={containerRef} className={`relative z-10 container mx-auto px-4 pt-6 pb-8 ${editorFullscreen ? "max-w-full" : ""}`}>
        <div className={`${editorFullscreen ? "fixed inset-x-0 top-16 bottom-0 px-4 z-30" : ""}`}>
          <div className="h-full" style={{ height: editorFullscreen ? "calc(100vh - 5rem)" : "calc(100vh - 12rem)" }}>
            <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
              {/* Left: Problem panel */}
              <div className={editorFullscreen ? "hidden" : "lg:col-span-2"}>
                <Card className="h-full bg-[#192345] border-[#6aa5ff]/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-xl">{selectedProblem ? selectedProblem.title : "Problem"}</CardTitle>
                    <CardDescription className="text-white/70">
                      {selectedProblem ? `${selectedProblem.points} points • ${selectedProblem.timeLimit} min limit` : "Select a problem to view details"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-5rem)] overflow-auto">
                    {selectedProblem ? (
                      <Tabs defaultValue="description" className="h-full flex flex-col">
                        <TabsList className="w-full bg-[#232b4d] border border-[#6aa5ff]/20">
                          <TabsTrigger value="description" className="flex-1 data-[state=active]:bg-[#6aa5ff] data-[state=active]:text-white text-white/70">Description</TabsTrigger>
                          <TabsTrigger value="samples" className="flex-1 data-[state=active]:bg-[#6aa5ff] data-[state=active]:text-white text-white/70">Examples</TabsTrigger>
                          <TabsTrigger value="constraints" className="flex-1 data-[state=active]:bg-[#6aa5ff] data-[state=active]:text-white text-white/70">Constraints</TabsTrigger>
                        </TabsList>
                        <TabsContent value="description" className="flex-1 overflow-auto mt-4">
                          <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-white/90">
                            {selectedProblem.description}
                          </div>
                        </TabsContent>
                        <TabsContent value="samples" className="flex-1 overflow-auto mt-4 space-y-4">
                          {selectedProblem.sampleInput && (
                            <div>
                              <h4 className="font-semibold mb-2 text-[#6aa5ff]">Sample Input</h4>
                              <pre className="bg-[#232b4d] border border-[#6aa5ff]/20 p-4 rounded-lg text-sm overflow-x-auto text-white/90">{selectedProblem.sampleInput}</pre>
                            </div>
                          )}
                          {selectedProblem.sampleOutput && (
                            <div>
                              <h4 className="font-semibold mb-2 text-[#6aa5ff]">Sample Output</h4>
                              <pre className="bg-[#232b4d] border border-[#6aa5ff]/20 p-4 rounded-lg text-sm overflow-x-auto text-white/90">{selectedProblem.sampleOutput}</pre>
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold mb-2 text-[#6aa5ff]">Custom Input (Optional)</h4>
                            <textarea
                              className="w-full h-32 rounded-lg border border-[#6aa5ff]/20 bg-[#232b4d] p-3 text-sm text-white focus:border-[#6aa5ff] focus:outline-none focus:ring-2 focus:ring-[#6aa5ff]/20"
                              placeholder="Enter custom input to test your code..."
                              value={customInput}
                              onChange={(e) => setCustomInput(e.target.value)}
                            />
                          </div>
                        </TabsContent>
                        <TabsContent value="constraints" className="flex-1 overflow-auto mt-4">
                          <div className="text-sm text-white/80 whitespace-pre-wrap bg-[#232b4d] border border-[#6aa5ff]/20 p-4 rounded-lg">
                            {selectedProblem.constraints || "No specific constraints provided."}
                          </div>
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="text-sm text-white/60">Select a problem to get started.</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Middle: Editor + Console */}
              <div className={editorFullscreen ? "lg:col-span-5" : "lg:col-span-2"}>
                <div className="h-full flex flex-col gap-4">
                  {/* Code editor panel */}
                  <Card className="flex-1 overflow-hidden bg-[#192345] border-[#6aa5ff]/20">
                    <CardHeader className="py-3 px-4 bg-[#232b4d]/60 border-b border-[#6aa5ff]/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">Code Editor</span>
                        <span className="text-xs text-white/60">Ctrl+Enter to Run • Shift+Enter to Submit</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 h-[calc(100%-3.5rem)]">
                      <MonacoEditor
                        height="100%"
                        language={language === "cpp" ? "cpp" : language}
                        theme="vs-dark"
                        value={code}
                        onChange={(val) => setCode(val || "")}
                        options={{
                          minimap: { enabled: true },
                          fontSize: 14,
                          automaticLayout: true,
                          scrollBeyondLastLine: false,
                          wordWrap: "on",
                          padding: { top: 10, bottom: 10 },
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* Console output panel */}
                  <Card className="h-64 overflow-hidden bg-[#192345] border-[#6aa5ff]/20">
                    <CardHeader className="py-3 px-4 bg-[#232b4d]/60 border-b border-[#6aa5ff]/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white flex items-center gap-2">
                          <Terminal className="h-4 w-4 text-[#6aa5ff]" />
                          Console Output
                        </span>
                        {consoleOutput && (
                          <span className="text-xs text-green-400">● Ready</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 h-[calc(100%-3.5rem)] overflow-auto bg-[#0d1117]">
                      <pre className="text-sm font-mono whitespace-pre-wrap text-white/90">
                        {consoleOutput || (
                          <span className="text-white/50 italic">Click &apos;Run&apos; to execute your code and see output here...</span>
                        )}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right: Proctoring sidebar - always visible */}
              {!editorFullscreen && (
                <div className="hidden lg:block lg:col-span-1">
                  <div className="sticky top-24">
                    <Proctoring 
                      userId={session?.user?.id}
                      sessionId={proctoringSessionId}
                      onPermissionDenied={() => {
                        toast({
                          title: "Proctoring Required",
                          description: "Camera access is mandatory for the coding exam.",
                          variant: "destructive",
                        })
                      }}
                      onViolation={(type) => {
                        console.log("Violation detected:", type)
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

