import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Problem from "@/models/Problem"
import TestCase from "@/models/TestCase"
import MCQOption from "@/models/MCQOption"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const problem = await Problem.findById(params.id)
      .populate({
        path: 'testCases',
        match: { isHidden: false }
      })
      .populate('mcqOptions')
      .lean()

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    return NextResponse.json(problem)
  } catch (error: any) {
    console.error("Error fetching problem:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const problem = await Problem.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    )
      .populate('testCases')
      .populate('mcqOptions')
      .lean()

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    return NextResponse.json(problem)
  } catch (error: any) {
    console.error("Error updating problem:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    await Problem.findByIdAndDelete(params.id)
    await TestCase.deleteMany({ problemId: params.id })
    await MCQOption.deleteMany({ problemId: params.id })

    return NextResponse.json({ message: "Problem deleted" })
  } catch (error: any) {
    console.error("Error deleting problem:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
