import { NextResponse, NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import ProctoringViolation from "@/models/ProctoringViolation"
import ProctoringSession from "@/models/ProctoringSession"
import { rateLimit, RATE_LIMITS, getRateLimitIdentifier } from "@/middleware/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Apply rate limiting (Comment 4)
    const identifier = getRateLimitIdentifier(request, session.user.id)
    const rateLimitResponse = rateLimit(RATE_LIMITS.api)(request, identifier)
    if (rateLimitResponse) return rateLimitResponse

    await connectDB()

    const body = await request.json()
    const { sessionId, violation } = body

    if (!sessionId || !violation) {
      return NextResponse.json(
        { error: "Session ID and violation data required" },
        { status: 400 }
      )
    }

    // Create violation record
    const violationRecord = await ProctoringViolation.create({
      userId: session.user.id,
      sessionId,
      violationType: violation.type,
      severity: violation.severity,
      details: violation.details || null,
      timestamp: new Date(violation.timestamp),
    })

    // Update session statistics
    const updateFields: any = {
      $inc: { totalViolations: 1 },
    }

    if (violation.severity === "HIGH") {
      updateFields.$inc.highSeverityCount = 1
      updateFields.$inc.suspicionScore = 15
    } else if (violation.severity === "MEDIUM") {
      updateFields.$inc.mediumSeverityCount = 1
      updateFields.$inc.suspicionScore = 8
    } else {
      updateFields.$inc.lowSeverityCount = 1
      updateFields.$inc.suspicionScore = 3
    }

    await ProctoringSession.findOneAndUpdate(
      { sessionId, userId: session.user.id },
      updateFields,
      { upsert: true }
    )

    // Check if too many violations - potentially suspend exam
    const sessionData = await ProctoringSession.findOne({ sessionId })
    if (sessionData && sessionData.suspicionScore >= 80) {
      await ProctoringSession.findOneAndUpdate(
        { sessionId },
        { status: "SUSPENDED" }
      )
      
      return NextResponse.json({
        success: true,
        violation: violationRecord,
        action: "EXAM_SUSPENDED",
        message: "Too many violations detected. Your exam has been flagged for review."
      })
    }

    return NextResponse.json({ 
      success: true, 
      violation: violationRecord 
    })
  } catch (error: any) {
    console.error("Error logging violation:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")
    const userId = searchParams.get("userId")

    const query: any = {}

    // Admins can see all violations, users only their own
    if (session.user.role === "ADMIN") {
      if (userId) query.userId = userId
      if (sessionId) query.sessionId = sessionId
    } else {
      query.userId = session.user.id
      if (sessionId) query.sessionId = sessionId
    }

    const violations = await ProctoringViolation.find(query)
      .sort({ timestamp: -1 })
      .limit(100)
      .lean()

    return NextResponse.json(violations)
  } catch (error: any) {
    console.error("Error fetching violations:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
