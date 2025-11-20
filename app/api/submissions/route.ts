import { NextResponse, NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Submission from "@/models/Submission"
import User from "@/models/User"
import Problem from "@/models/Problem"
import TestCase from "@/models/TestCase"
import MCQAnswer from "@/models/MCQAnswer"
import MCQOption from "@/models/MCQOption"
import { rateLimit, RATE_LIMITS, getRateLimitIdentifier } from "@/middleware/rate-limit"
import { executeCode } from "@/lib/judge0"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const problemId = searchParams.get("problemId")
    const teamId = searchParams.get("teamId")

    const query: any = {}
    if (userId && session.user.role === "ADMIN") {
      query.userId = userId
    } else if (session.user.role !== "ADMIN") {
      query.userId = session.user.id
    }
    if (problemId) query.problemId = problemId
    if (teamId) query.teamId = teamId

    const submissions = await Submission.find(query)
      .populate('userId', 'name email')
      .populate('problemId', 'title points')
      .populate('teamId', 'name')
      .sort({ submittedAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json(submissions)
  } catch (error: any) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { problemId, code, language, optionId } = body

    if (!problemId) {
      return NextResponse.json(
        { error: "Problem ID is required" },
        { status: 400 }
      )
    }

    // Get user's team if exists
    const user = await User.findById(session.user.id).populate('teamId').lean()

    // Get problem
    const problem = await Problem.findById(problemId).lean()

    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      )
    }

    let status: any = "PENDING"
    let score = 0
    let verdict = ""
    let error: string | null = null
    let isCorrect = false
    let runtime: number | undefined
    let memory: number | undefined

    // Handle MCQ submission (simple text answer check)
    if (problem.type === "MCQ" && code) {
      // For MCQ with text answers, we'll store as pending
      // Admin can manually grade or auto-check against correctAnswer field
      if (problem.correctAnswer && code.trim().toLowerCase() === problem.correctAnswer.toLowerCase()) {
        isCorrect = true
        score = problem.points
        status = "ACCEPTED"
        verdict = "Correct"
      } else {
        status = "PENDING"
        verdict = "Under review"
      }
    }

    // Handle coding submission - Execute against test cases
    if (problem.type === "CODING" && code && language) {
      // Check if Judge0 is configured
      if (!process.env.JUDGE0_API_KEY) {
        return NextResponse.json({
          error: "Code execution is not configured. Please set JUDGE0_API_KEY in your environment variables."
        }, { status: 503 })
      }

      try {
        // Fetch all test cases for this problem
        const testCases = await import('@/models/TestCase').then(m => m.default)
        const allTestCases = await testCases.find({ problemId: problem._id }).lean()
        
        if (allTestCases.length === 0) {
          // No test cases, mark as pending for manual review
          status = "PENDING"
          verdict = "No test cases available - requires manual review"
        } else {
          // Run code against all test cases
          let passedTests = 0
          let totalTests = allTestCases.length
          let totalScore = 0
          let failedTestCase = null
          
          const timeLimitSeconds = problem.timeLimit ? Math.min(problem.timeLimit * 60, 10) : 5
          const memoryLimitKB = problem.memoryLimit ? problem.memoryLimit * 1024 : 256000

          for (const testCase of allTestCases) {
            try {
              const result = await executeCode(
                code,
                language,
                testCase.input,
                timeLimitSeconds,
                memoryLimitKB
              )

              // Update runtime and memory (take max values)
              if (result.time) {
                const timeMs = parseFloat(result.time) * 1000
                runtime = runtime ? Math.max(runtime, timeMs) : timeMs
              }
              if (result.memory) {
                memory = memory ? Math.max(memory, result.memory) : result.memory
              }

              // Check if output matches expected output (trim whitespace)
              const actualOutput = (result.stdout || '').trim()
              const expectedOutput = testCase.output.trim()
              
              if (result.status.id === 3 && actualOutput === expectedOutput) {
                // Status 3 = Accepted
                passedTests++
                totalScore += testCase.points
              } else {
                // Failed test case
                if (!failedTestCase) {
                  failedTestCase = {
                    status: result.status.description,
                    expected: expectedOutput,
                    actual: actualOutput,
                    stderr: result.stderr,
                    compile_output: result.compile_output
                  }
                }
                
                // Check for specific error types
                if (result.status.id === 6) {
                  status = "COMPILATION_ERROR"
                  verdict = "Compilation Error"
                  error = result.compile_output || result.stderr || "Compilation failed"
                  break
                } else if (result.status.id === 5) {
                  status = "TIME_LIMIT_EXCEEDED"
                  verdict = "Time Limit Exceeded"
                  break
                } else if ([11, 12].includes(result.status.id)) {
                  status = "RUNTIME_ERROR"
                  verdict = "Runtime Error"
                  error = result.stderr || result.message || "Runtime error"
                  break
                }
              }
            } catch (execError: any) {
              console.error("Test case execution error:", execError)
              status = "RUNTIME_ERROR"
              verdict = "Execution Error"
              error = execError.message
              break
            }
          }

          // Determine final status
          if (status === "PENDING") {
            if (passedTests === totalTests) {
              status = "ACCEPTED"
              verdict = "All test cases passed"
              score = problem.points
              isCorrect = true
            } else {
              status = "WRONG_ANSWER"
              verdict = `${passedTests}/${totalTests} test cases passed`
              score = Math.floor((totalScore / allTestCases.reduce((sum, tc) => sum + tc.points, 0)) * problem.points)
            }
          }
        }
      } catch (testError: any) {
        console.error("Error running test cases:", testError)
        status = "RUNTIME_ERROR"
        verdict = "Test execution failed"
        error = testError.message
      }
    }

    // Create submission
    const submission = await Submission.create({
      userId: session.user.id,
      teamId: (user as any)?.teamId?._id || null,
      problemId: problem._id,
      code: code || null,
      language: language || "javascript",
      status,
      verdict,
      score,
      runtime,
      memory,
      error,
    })

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('userId', 'name')
      .populate('problemId', 'title')
      .lean()

    return NextResponse.json(populatedSubmission, { status: 201 })
  } catch (error: any) {
    console.error("Error creating submission:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
