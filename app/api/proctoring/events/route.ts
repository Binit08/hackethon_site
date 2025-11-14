import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import ProctoringSession from "@/models/ProctoringSession"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { sessionId, eventType, severity, examType } = body

    if (!sessionId || !eventType) {
      return NextResponse.json(
        { error: "Session ID and event type required" },
        { status: 400 }
      )
    }

    // Handle different event types
    if (eventType === "PROCTORING_STARTED") {
      // Create or update session
      await ProctoringSession.findOneAndUpdate(
        { sessionId, userId: session.user.id },
        {
          sessionId,
          userId: session.user.id,
          startTime: new Date(),
          status: "ACTIVE",
          examType: examType || "CODING",
        },
        { upsert: true, new: true }
      )
    } else if (eventType === "PROCTORING_ENDED") {
      await ProctoringSession.findOneAndUpdate(
        { sessionId, userId: session.user.id },
        {
          endTime: new Date(),
          status: "COMPLETED",
        }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error logging event:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
