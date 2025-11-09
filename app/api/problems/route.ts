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
      .populate('testCases', null, { isHidden: false })
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
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
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

    const problem = await Problem.create({
      title,
      description,
      difficulty: difficulty || "MEDIUM",
      type: type || "CODING",
      points: points || 100,
      timeLimit: timeLimit || 5,
      memoryLimit: memoryLimit || 256,
      constraints,
      sampleInput,
      sampleOutput,
      correctAnswer,
      round: round || 1,
    })

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
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
