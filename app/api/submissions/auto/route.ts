import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Submission from "@/models/Submission"
import User from "@/models/User"
import Problem from "@/models/Problem"

interface AutoItem {
  problemId: string
  code: string | null
  language?: string
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Some browsers may send text/plain; attempt to parse gracefully
    let body: any = null
    const text = await request.text()
    try {
      body = JSON.parse(text)
    } catch {
      body = { items: [] }
    }

    const items: AutoItem[] = Array.isArray(body?.items) ? body.items : []
    if (!items.length) {
      return NextResponse.json({ message: "No items to submit" }, { status: 200 })
    }

    const user = await User.findById(session.user.id).populate('teamId').lean()

    const results: any[] = []
    for (const item of items) {
      if (!item?.problemId) continue
      const problem = await Problem.findById(item.problemId).lean()
      if (!problem) continue

      let status: any = "PENDING"
      let score = 0
      let verdict = ""
      let error: string | null = null

      // MCQ auto grading if correctAnswer exists
      if (problem.type === "MCQ" && item.code) {
        if (problem.correctAnswer && item.code.trim().toLowerCase() === problem.correctAnswer.toLowerCase()) {
          score = problem.points || 0
          status = "ACCEPTED"
          verdict = "Correct"
        } else {
          status = "PENDING"
          verdict = "Under review (auto-submit)"
        }
      }

      // Coding: mark as received
      if (problem.type === "CODING" && item.code) {
        status = "PENDING"
        verdict = "Submission received (auto-submit)"
      }

      const submission = await Submission.create({
        userId: session.user.id,
        teamId: (user as any)?.teamId?._id || null,
        problemId: problem._id,
        code: item.code || null,
        language: item.language || "javascript",
        status,
        verdict,
        score,
        error,
      })

      const populated = await Submission.findById(submission._id)
        .populate('userId', 'name')
        .populate('problemId', 'title points')
        .lean()

      results.push(populated)
    }

    return NextResponse.json({ count: results.length, submissions: results }, { status: 201 })
  } catch (error: any) {
    console.error("Error in auto submissions:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
