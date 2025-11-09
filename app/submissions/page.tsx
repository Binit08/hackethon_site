"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

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
      setSubmissions(data)
    } catch (error: any) {
      console.error("Error fetching submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "WRONG_ANSWER":
      case "RUNTIME_ERROR":
      case "COMPILATION_ERROR":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "TIME_LIMIT_EXCEEDED":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "text-green-600"
      case "WRONG_ANSWER":
      case "RUNTIME_ERROR":
      case "COMPILATION_ERROR":
        return "text-red-600"
      case "TIME_LIMIT_EXCEEDED":
        return "text-yellow-600"
      default:
        return "text-blue-600"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 pt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Submissions</h1>
          <p className="text-muted-foreground">View all your submissions and their status</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submission History</CardTitle>
            <CardDescription>{submissions.length} total submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No submissions yet. Start solving problems!
                </p>
              ) : (
                submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(submission.status)}
                        <div>
                          <h3 className="font-semibold">
                            {submission.problem.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${getStatusColor(submission.status)}`}>
                          {submission.status.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Score: {submission.score}/{submission.problem.points}
                        </p>
                      </div>
                    </div>
                    {submission.verdict && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Verdict: {submission.verdict}
                      </p>
                    )}
                    {submission.error && (
                      <pre className="text-sm bg-destructive/10 text-destructive p-2 rounded mt-2 overflow-x-auto">
                        {submission.error}
                      </pre>
                    )}
                    {(submission.runtime || submission.memory) && (
                      <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                        {submission.runtime && (
                          <span>Runtime: {submission.runtime}ms</span>
                        )}
                        {submission.memory && (
                          <span>Memory: {submission.memory}KB</span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

