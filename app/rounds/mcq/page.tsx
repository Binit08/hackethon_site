"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface Problem {
  id: string
  title: string
  description: string
  points: number
  mcqOptions: Array<{
    id: string
    option: string
  }>
}

export default function MCQRoundPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchProblems()
  }, [])

  const fetchProblems = async () => {
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
      setProblems(data)
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
    setSubmitting(true)
    try {
      const submissions = await Promise.all(
        Object.entries(selectedAnswers).map(async ([problemId, optionId]) => {
          const response = await fetch("/api/submissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              problemId,
              optionId,
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

      const results = submissions

      toast({
        title: "Success",
        description: "Your answers have been submitted successfully!",
      })

      router.push("/submissions")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit answers",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">MCQ Round</h1>
          <p className="text-muted-foreground">
            Answer all questions. You can review your answers before submitting.
          </p>
        </div>

        <div className="space-y-6">
          {problems.map((problem, index) => (
            <Card key={problem.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>
                  Question {index + 1} ({problem.points} points)
                </CardTitle>
                <CardDescription>{problem.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedAnswers[problem.id] || ""}
                  onValueChange={(value) =>
                    setSelectedAnswers({
                      ...selectedAnswers,
                      [problem.id]: value,
                    })
                  }
                >
                  {problem.mcqOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2 py-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label
                        htmlFor={option.id}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {option.option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {Object.keys(selectedAnswers).length} of {problems.length} questions answered
          </p>
          <Button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(selectedAnswers).length !== problems.length}
            size="lg"
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
      </div>
    </div>
  )
}

