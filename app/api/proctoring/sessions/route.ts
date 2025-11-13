import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import ProctoringSession from "@/models/ProctoringSession"
import ProctoringViolation from "@/models/ProctoringViolation"

// Get all proctoring sessions (Admin only)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")

    const query: any = {}
    if (userId) query.userId = userId
    if (status) query.status = status

    const sessions = await ProctoringSession.find(query)
      .populate('userId', 'name email')
      .sort({ startTime: -1 })
      .limit(100)
      .lean()

    // Get detailed violation data for each session
    const sessionsWithDetails = await Promise.all(
      sessions.map(async (sess: any) => {
        const violations = await ProctoringViolation.find({ sessionId: sess.sessionId })
          .sort({ timestamp: -1 })
          .limit(10)
          .lean()

        return {
          ...sess,
          recentViolations: violations,
        }
      })
    )

    return NextResponse.json(sessionsWithDetails)
  } catch (error: any) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
