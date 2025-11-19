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
  const submittingRef = useRef(false) // Prevent duplicate submissions (Comment 6)
  const hasSubmittedRef = useRef(false) // Track if already submitted (Comment 6)

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
    // Prevent duplicate submissions (Comment 6)
    if (submittingRef.current || hasSubmittedRef.current) {
      return
    }
    
    if (!selectedProblem || !code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before submitting",
        variant: "destructive",
      })
      return
    }

    submittingRef.current = true
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

      hasSubmittedRef.current = true // Mark as submitted (Comment 6)
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
      submittingRef.current = false // Allow retry on error
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
      // Prevent duplicate auto-submissions (Comment 6)
      if (!hasWork() || submittingRef.current || hasSubmittedRef.current) return
      
      submittingRef.current = true
      try {
        const blob = new Blob([makeBeaconPayload()], { type: 'application/json' })
        navigator.sendBeacon('/api/submissions/auto', blob)
        hasSubmittedRef.current = true // Mark as submitted
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
    console.log('handleRun called', { selectedProblem: !!selectedProblem, code: code?.length || 0 })
    
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
    
    console.log('Making API call to /api/run')
    
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
      
      console.log('Response received:', response.status)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Run failed" }))
        throw new Error(error.error || "Run failed")
      }
      const result = await response.json()
      
      console.log('Result:', result)
      
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
      console.error('Run error:', err)
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative overflow-hidden">
      {/* Round access gating banners */}
      {/* Banners removed per request; gating logic retained without visual notices */}
      
      {/* Background & Glass Effect - light theme */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50" />
      </div>

  {/* Top bar */}
      <div className="z-10 w-full border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 shadow-sm">
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
              <SelectTrigger className="w-60 bg-white border-gray-300">
                <SelectValue placeholder="Select problem" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {problems.map((problem) => (
                  <SelectItem key={problem.id || problem._id} value={problem.id || problem._id}>
                    {problem.title} ({problem.points} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedProblem && (
              <div className="hidden md:flex items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">{selectedProblem.points} pts</span>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">{selectedProblem.timeLimit}m</span>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">{selectedProblem.memoryLimit}MB</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Disable action buttons if locked */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-36 bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setEditorFullscreen((v) => !v)}
              title={editorFullscreen ? "Exit fullscreen" : "Fullscreen editor"}
              className="border-gray-300 hover:bg-gray-100"
            >
              {editorFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>

            <Button 
              onClick={() => {
                console.log('Run button clicked!', { 
                  running, 
                  selectedProblem: selectedProblem?.title,
                  codeLength: code?.length 
                })
                handleRun()
              }} 
              disabled={running || !selectedProblem} 
              variant="outline"
              className="bg-green-50 border-green-300 hover:bg-green-100 text-green-700"
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
              className="border-gray-300 hover:bg-gray-100"
            >
              <TimerReset className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !selectedProblem}
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
                <Card className="h-full bg-white border-gray-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-gray-900 text-xl">{selectedProblem ? selectedProblem.title : "Problem"}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {selectedProblem ? `${selectedProblem.points} points • ${selectedProblem.timeLimit} min limit` : "Select a problem to view details"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-5rem)] overflow-auto">
                    {selectedProblem ? (
                      <Tabs defaultValue="description" className="h-full flex flex-col">
                        <TabsList className="w-full bg-gray-100 border border-gray-200">
                          <TabsTrigger value="description" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-600">Description</TabsTrigger>
                          <TabsTrigger value="samples" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-600">Examples</TabsTrigger>
                          <TabsTrigger value="constraints" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-600">Constraints</TabsTrigger>
                        </TabsList>
                        <TabsContent value="description" className="flex-1 overflow-auto mt-4">
                          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800">
                            {selectedProblem.description}
                          </div>
                        </TabsContent>
                        <TabsContent value="samples" className="flex-1 overflow-auto mt-4 space-y-4">
                          {selectedProblem.sampleInput && (
                            <div>
                              <h4 className="font-semibold mb-2 text-blue-700">Sample Input</h4>
                              <pre className="bg-gray-50 border border-gray-300 p-4 rounded-lg text-sm overflow-x-auto text-gray-800">{selectedProblem.sampleInput}</pre>
                            </div>
                          )}
                          {selectedProblem.sampleOutput && (
                            <div>
                              <h4 className="font-semibold mb-2 text-blue-700">Sample Output</h4>
                              <pre className="bg-gray-50 border border-gray-300 p-4 rounded-lg text-sm overflow-x-auto text-gray-800">{selectedProblem.sampleOutput}</pre>
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold mb-2 text-blue-700">Custom Input (Optional)</h4>
                            <textarea
                              className="w-full h-32 rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                              placeholder="Enter custom input to test your code..."
                              value={customInput}
                              onChange={(e) => setCustomInput(e.target.value)}
                            />
                          </div>
                        </TabsContent>
                        <TabsContent value="constraints" className="flex-1 overflow-auto mt-4">
                          <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 border border-gray-300 p-4 rounded-lg">
                            {selectedProblem.constraints || "No specific constraints provided."}
                          </div>
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="text-sm text-gray-500">Select a problem to get started.</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Middle: Editor + Console */}
              <div className={editorFullscreen ? "lg:col-span-5" : "lg:col-span-2"}>
                <div className="h-full flex flex-col gap-4">
                  {/* Code editor panel */}
                  <Card className="flex-1 overflow-hidden bg-white border-gray-200 shadow-sm">
                    <CardHeader className="py-3 px-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">Code Editor</span>
                        <span className="text-xs text-gray-600">Ctrl+Enter to Run • Shift+Enter to Submit</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 h-[calc(100%-3.5rem)]">
                      <MonacoEditor
                        height="100%"
                        language={language === "cpp" ? "cpp" : language}
                        theme="vs-light"
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
                  <Card className="h-64 overflow-hidden bg-white border-gray-200 shadow-sm">
                    <CardHeader className="py-3 px-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Terminal className="h-4 w-4 text-blue-600" />
                          Console Output
                        </span>
                        {consoleOutput && (
                          <span className="text-xs text-green-600">● Ready</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 h-[calc(100%-3.5rem)] overflow-auto bg-gray-900">
                      <pre className="text-sm font-mono whitespace-pre-wrap text-green-400">
                        {consoleOutput || (
                          <span className="text-gray-400 italic">Click &apos;Run&apos; to execute your code and see output here...</span>
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

