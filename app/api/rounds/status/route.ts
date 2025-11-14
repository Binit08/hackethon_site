import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Problem from "@/models/Problem"
import Submission from "@/models/Submission"
import { schedule, windowStatus } from "@/lib/schedule"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()

    // Round 1 problems (MCQ + basic coding)
    const r1Problems = await Problem.find({ round: 1, isActive: true }).select("_id points type").lean()
    const r1ProblemIds = r1Problems.map((p) => p._id)

    // User submissions for round 1
    const r1Subs = await Submission.find({ userId: session.user.id, problemId: { $in: r1ProblemIds } })
      .select("problemId score submittedAt")
      .sort({ submittedAt: -1 })
      .lean()

    // Highest score per problem
    const bestByProblem = new Map<string, number>()
    for (const s of r1Subs) {
      const key = String(s.problemId)
      const prev = bestByProblem.get(key) || 0
      if (typeof s.score === 'number' && s.score > prev) bestByProblem.set(key, s.score)
    }

    const r1UserScore = Array.from(bestByProblem.values()).reduce((a, b) => a + b, 0)
    const r1MaxScore = r1Problems.reduce((sum, p) => sum + (p.points || 0), 0)
    const r1Percent = r1MaxScore > 0 ? Math.round((r1UserScore / r1MaxScore) * 100) : 0

    // Qualification rule: >= 50% marks qualifies for Round 2
    const round1Qualified = r1Percent >= 50

    // Round 2 window status
    const r1Window = schedule.round1
    const r2Window = schedule.round2
    const r3Window = schedule.round3

    const payload = {
      round1: {
        window: windowStatus(r1Window),
        score: r1UserScore,
        maxScore: r1MaxScore,
        percent: r1Percent,
        qualified: round1Qualified,
      },
      round2: {
        window: windowStatus(r2Window),
        qualified: false, // to be determined after Round 2 evaluation
      },
      round3: {
        window: windowStatus(r3Window),
        qualified: false, // shortlisted teams only (offline)
        venue: "NIT Silchar, Assam",
      },
      schedule: {
        round1: { start: r1Window.start, end: r1Window.end, label: r1Window.label },
        round2: { start: r2Window.start, end: r2Window.end, label: r2Window.label },
        round3: { start: r3Window.start, end: r3Window.end, label: r3Window.label },
      },
    }

    return NextResponse.json(payload)
  } catch (err: any) {
    console.error("Round status error:", err)
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}
