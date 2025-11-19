"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Proctoring } from "@/components/proctoring"

interface Problem {
  _id: string
  title: string
  description: string
  points: number
  correctAnswer?: string
}

export default function MCQRoundPage() {
  const { data: session } = useSession()
  const [problems, setProblems] = useState<Problem[]>([])
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [proctoringSessionId] = useState(`mcq-${session?.user?.id || 'guest'}-${Date.now()}`)
  const router = useRouter()
  const { toast} = useToast()
  const submittingRef = useRef(false) // Prevent duplicate submissions (Comment 6)
  const hasSubmittedRef = useRef(false) // Track if already submitted (Comment 6)

  const fetchProblems = useCallback(async () => {
    try {
      const response = await fetch("/api/problems?type=MCQ&isActive=true")
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to fetch problems" }))
        throw new Error(error.error || "Failed to fetch problems")
      }
      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        throw new Error("Server returned non-JSON response")
      }
      const data = await response.json()
      setProblems(Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load problems",
        variant: "destructive",
      })
      setProblems([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchProblems()
  }, [fetchProblems])

  // MCQ demo round: always open, no schedule gating

  const handleSubmit = async () => {
    // Prevent duplicate submissions (Comment 6)
    if (submittingRef.current || hasSubmittedRef.current) {
      return
    }
    
    submittingRef.current = true
    setSubmitting(true)
    try {
      const submissions = await Promise.all(
        Object.entries(selectedAnswers).map(async ([problemId, answer]) => {
          const response = await fetch("/api/submissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              problemId,
              code: answer, // Send as code since MCQ uses text answers
              language: "text",
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
          return await response.json()
        })
      )

      hasSubmittedRef.current = true // Mark as submitted (Comment 6)
      toast({
        title: "Success",
        description: `Successfully submitted ${submissions.length} answer(s)!`,
      })

      // Wait a bit before redirecting
      setTimeout(() => {
        router.push("/submissions")
      }, 1000)
    } catch (error: any) {
      console.error("Submission error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit answers",
        variant: "destructive",
      })
      submittingRef.current = false // Allow retry on error
    } finally {
      setSubmitting(false)
    }
  }

  // Auto-submit on navigation/back or tab hide
  useEffect(() => {
    const hasAnswers = () => Object.keys(selectedAnswers).some((k) => (selectedAnswers[k] || '').trim())

    const makeBeaconPayload = () => {
      const items = Object.entries(selectedAnswers)
        .filter(([_, ans]) => (ans || '').trim())
        .map(([problemId, code]) => ({ problemId, code, language: 'text' }))
      return JSON.stringify({ items, reason: 'AUTO_UNLOAD', round: 'MCQ' })
    }

    const autoSubmit = () => {
      // Prevent duplicate auto-submissions (Comment 6)
      if (!hasAnswers() || submittingRef.current || hasSubmittedRef.current) return
      
      submittingRef.current = true
      try {
        const blob = new Blob([makeBeaconPayload()], { type: 'application/json' })
        navigator.sendBeacon('/api/submissions/auto', blob)
        hasSubmittedRef.current = true // Mark as submitted
      } catch (e) {
        // best effort fallback
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
      if (hasAnswers()) {
        autoSubmit()
        e.preventDefault()
        e.returnValue = ''
      }
    }

    const onPopState = () => {
      if (hasAnswers()) {
        toast({ title: 'Leaving exam', description: 'Your answers are being auto-submitted.' })
        autoSubmit()
      }
    }

    const onVisibility = () => {
      if (document.hidden && hasAnswers()) {
        toast({ title: 'Tab hidden', description: 'Auto-submitting your answers and stopping proctoring.' })
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
  }, [selectedAnswers, toast])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative overflow-hidden">
      
      {/* Background & Glass Effect - light theme */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50" />
      </div>

      {/* Floating Proctoring Widget */}
      <div className="fixed bottom-4 right-4 w-80 z-50 hidden lg:block">
        <Proctoring 
          userId={session?.user?.id}
          sessionId={proctoringSessionId}
          onPermissionDenied={() => {
            toast({
              title: "Proctoring Required",
              description: "Camera access is mandatory for the MCQ exam.",
              variant: "destructive",
            })
          }}
          onViolation={(type) => {
            console.log("MCQ Violation detected:", type)
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">MCQ Round</h1>
          <p className="text-blue-700 text-lg font-medium">
            Answer all questions carefully. You can review your answers before submitting.
          </p>
        </div>

        {problems.length === 0 ? (
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="py-12">
              <p className="text-center text-gray-600 text-lg">
                No MCQ problems available at the moment. Please check back later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-6">
              {problems.map((problem, index) => (
                <Card key={problem._id} className="bg-white border-gray-200 hover:border-blue-300 transition-all shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900 text-xl flex justify-between items-center">
                      <span>Question {index + 1}</span>
                      <span className="text-sm font-medium px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                        {problem.points} points
                      </span>
                    </CardTitle>
                    <CardDescription className="text-gray-700 text-base mt-3">
                      {problem.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Label className="text-gray-700 text-sm font-medium">Your Answer:</Label>
                      <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        placeholder="Type your answer here..."
                        value={selectedAnswers[problem._id] || ""}
                        onChange={(e) =>
                          setSelectedAnswers({
                            ...selectedAnswers,
                            [problem._id]: e.target.value,
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <p className="text-sm text-gray-700">
                <span className="text-blue-700 font-semibold">
                  {Object.keys(selectedAnswers).filter(key => selectedAnswers[key].trim()).length}
                </span>
                {" "}of{" "}
                <span className="text-blue-700 font-semibold">{problems.length}</span>
                {" "}questions answered
              </p>
              <Button
                onClick={handleSubmit}
                disabled={submitting 
                  || Object.keys(selectedAnswers).filter(key => selectedAnswers[key].trim()).length !== problems.length}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Answers"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

