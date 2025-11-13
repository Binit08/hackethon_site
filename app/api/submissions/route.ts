import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Submission from "@/models/Submission"
import User from "@/models/User"
import Problem from "@/models/Problem"
import MCQAnswer from "@/models/MCQAnswer"
import MCQOption from "@/models/MCQOption"

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

    // Handle coding submission (basic validation - would need actual code execution in production)
    if (problem.type === "CODING" && code) {
      // In production, you would run the code against test cases here
      // For now, we'll create a pending submission
      status = "PENDING"
      verdict = "Submission received"
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
