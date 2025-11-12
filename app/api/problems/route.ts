import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Problem from "@/models/Problem"
import TestCase from "@/models/TestCase"
import MCQOption from "@/models/MCQOption"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const round = searchParams.get("round")
    const isActive = searchParams.get("isActive")

    const query: any = {}
    if (type) query.type = type
    if (round) query.round = parseInt(round)
    if (isActive !== null) query.isActive = isActive === "true"

    const problems = await Problem.find(query)
      .populate('testCases')
      .populate('mcqOptions')
      .sort({ createdAt: 1 })
      .lean()

    return NextResponse.json(problems)
  } catch (error: any) {
    console.error("Error fetching problems:", error)
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
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized - Admin role required" }, { status: 403 })
    }

    await connectDB()

    const body = await request.json()
    console.log("Received problem data:", body)
    
    const {
      title,
      description,
      difficulty,
      type,
      points,
      timeLimit,
      memoryLimit,
      constraints,
      sampleInput,
      sampleOutput,
      testCases,
      mcqOptions,
      correctAnswer,
      round,
    } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      )
    }

    const problemData = {
      title,
      description,
      difficulty: difficulty || "MEDIUM",
      type: type || "CODING",
      points: points || 100,
      timeLimit: timeLimit || 5,
      memoryLimit: memoryLimit || 256,
      constraints: constraints || null,
      sampleInput: sampleInput || null,
      sampleOutput: sampleOutput || null,
      correctAnswer: correctAnswer || null,
      round: round || 1,
    }

    console.log("Creating problem with data:", problemData)

    const problem = await Problem.create(problemData)

    console.log("Problem created:", problem._id)

    // Create test cases if provided
    if (testCases && testCases.length > 0) {
      const testCaseDocs = testCases.map((tc: any) => ({
        ...tc,
        problemId: problem._id,
      }))
      await TestCase.insertMany(testCaseDocs)
    }

    // Create MCQ options if provided
    if (mcqOptions && mcqOptions.length > 0) {
      const optionDocs = mcqOptions.map((opt: any) => ({
        ...opt,
        problemId: problem._id,
      }))
      await MCQOption.insertMany(optionDocs)
    }

    const populatedProblem = await Problem.findById(problem._id)
      .populate('testCases')
      .populate('mcqOptions')
      .lean()

    return NextResponse.json(populatedProblem, { status: 201 })
  } catch (error: any) {
    console.error("Error creating problem:", error)
    console.error("Error stack:", error.stack)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
