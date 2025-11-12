"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Play, Send, TimerReset, Maximize2, Minimize2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-96 bg-muted animate-pulse" />,
})

interface Problem {
  id: string
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
      setProblems(data)
      if (data.length > 0) {
        setSelectedProblem(data[0])
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="w-full border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-16 z-40">
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
              <SelectTrigger className="w-60">
                <SelectValue placeholder="Select problem" />
              </SelectTrigger>
              <SelectContent>
                {problems.map((problem) => (
                  <SelectItem key={problem.id} value={problem.id}>
                    {problem.title} ({problem.points} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedProblem && (
              <div className="hidden md:flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-muted text-foreground/80">Points: {selectedProblem.points}</span>
                <span className="px-2 py-1 rounded bg-muted text-foreground/80">Time: {selectedProblem.timeLimit} min</span>
                <span className="px-2 py-1 rounded bg-muted text-foreground/80">Memory: {selectedProblem.memoryLimit} MB</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="secondary"
              onClick={() => setEditorFullscreen((v) => !v)}
              title={editorFullscreen ? "Exit fullscreen" : "Fullscreen editor"}
            >
              {editorFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>

            <Button onClick={handleRun} disabled={running || !selectedProblem} variant="outline">
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
            >
              <TimerReset className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !selectedProblem}>
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
      <div ref={containerRef} className={`container mx-auto px-4 pt-6 pb-8 ${editorFullscreen ? "max-w-full" : "max-w-7xl"}`}>
        <div className={`${editorFullscreen ? "fixed inset-x-0 top-28 bottom-0 px-4 z-30" : ""}`}>
          <div className="h-full" style={{ height: editorFullscreen ? "calc(100vh - 8rem)" : "calc(100vh - 12rem)" }}>
            <div className="relative flex h-full w-full">
              {/* Left: Problem panel */}
              <div className="pr-3" style={{ width: `${leftWidth}%` }}>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{selectedProblem ? selectedProblem.title : "Problem"}</CardTitle>
                    <CardDescription>Select a problem to view details</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-4.5rem)] overflow-auto">
                    {selectedProblem ? (
                      <Tabs defaultValue="description" className="h-full flex flex-col">
                        <TabsList className="w-full">
                          <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
                          <TabsTrigger value="samples" className="flex-1">Samples</TabsTrigger>
                          <TabsTrigger value="constraints" className="flex-1">Constraints</TabsTrigger>
                        </TabsList>
                        <TabsContent value="description" className="flex-1 overflow-auto mt-3">
                          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                            {selectedProblem.description}
                          </div>
                        </TabsContent>
                        <TabsContent value="samples" className="flex-1 overflow-auto mt-3 space-y-4">
                          {selectedProblem.sampleInput && (
                            <div>
                              <h4 className="font-semibold mb-2">Sample Input</h4>
                              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">{selectedProblem.sampleInput}</pre>
                            </div>
                          )}
                          {selectedProblem.sampleOutput && (
                            <div>
                              <h4 className="font-semibold mb-2">Sample Output</h4>
                              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">{selectedProblem.sampleOutput}</pre>
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold mb-2">Custom Input</h4>
                            <textarea
                              className="w-full h-28 rounded-md border bg-background p-2 text-sm"
                              placeholder="Enter custom input (optional)"
                              value={customInput}
                              onChange={(e) => setCustomInput(e.target.value)}
                            />
                          </div>
                        </TabsContent>
                        <TabsContent value="constraints" className="flex-1 overflow-auto mt-3">
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {selectedProblem.constraints || "No constraints provided."}
                          </div>
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="text-sm text-muted-foreground">Select a problem to get started.</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Resizer */}
              {!editorFullscreen && (
                <div
                  className={`w-1.5 cursor-col-resize rounded-full bg-border hover:bg-primary/40 active:bg-primary/60 ${isResizing ? "bg-primary/60" : ""}`}
                  onMouseDown={() => setIsResizing(true)}
                />
              )}

              {/* Right: Editor panel */}
              <div className="pl-3 flex-1 min-w-[280px]">
                <Card className="h-full">
                  <CardHeader className="py-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Editor</CardTitle>
                      <div className="text-xs text-muted-foreground">
                        <span className="mr-3">Lang: {language}</span>
                        {selectedProblem && (
                          <span>
                            TL: {selectedProblem.timeLimit}m • ML: {selectedProblem.memoryLimit}MB
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-4.5rem)] flex flex-col gap-3">
                    <div className="border rounded-md overflow-hidden flex-1">
                      <MonacoEditor
                        height="100%"
                        language={language}
                        value={code}
                        onChange={(value) => setCode(value || "")}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: "on",
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 2,
                          wordWrap: "on",
                        }}
                      />
                    </div>
                    <Tabs defaultValue="console" className="flex-1 min-h-[140px]">
                      <TabsList>
                        <TabsTrigger value="console">Console</TabsTrigger>
                      </TabsList>
                      <TabsContent value="console" className="mt-2 h-[140px]">
                        <div className="h-full w-full rounded-md border bg-muted/30 p-3 text-xs overflow-auto">
                          {consoleOutput || "Console output will appear here after Run/Submit."}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

