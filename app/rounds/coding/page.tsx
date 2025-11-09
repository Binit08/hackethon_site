"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

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
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchProblems()
  }, [])

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

  const fetchProblems = async () => {
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
  }

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
        title: "Success",
        description: "Your code has been submitted successfully!",
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Problem</CardTitle>
                    <CardDescription>Select a problem to solve</CardDescription>
                  </div>
                  <Select
                    value={selectedProblem?.id || ""}
                    onValueChange={(value) => {
                      const problem = problems.find((p) => p.id === value)
                      setSelectedProblem(problem || null)
                      setCode("")
                    }}
                  >
                    <SelectTrigger className="w-48">
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
                </div>
              </CardHeader>
              {selectedProblem && (
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {selectedProblem.title}
                    </h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {selectedProblem.description}
                    </p>
                  </div>

                  {selectedProblem.constraints && (
                    <div>
                      <h4 className="font-semibold mb-2">Constraints:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedProblem.constraints}
                      </p>
                    </div>
                  )}

                  {selectedProblem.sampleInput && (
                    <div>
                      <h4 className="font-semibold mb-2">Sample Input:</h4>
                      <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                        {selectedProblem.sampleInput}
                      </pre>
                    </div>
                  )}

                  {selectedProblem.sampleOutput && (
                    <div>
                      <h4 className="font-semibold mb-2">Sample Output:</h4>
                      <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                        {selectedProblem.sampleOutput}
                      </pre>
                    </div>
                  )}

                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Time Limit: {selectedProblem.timeLimit} minutes</span>
                    <span>Memory Limit: {selectedProblem.memoryLimit} MB</span>
                    <span>Points: {selectedProblem.points}</span>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Code Editor */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Code Editor</CardTitle>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <MonacoEditor
                    height="500px"
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
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedProblem}
                  className="w-full mt-4"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Code"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

