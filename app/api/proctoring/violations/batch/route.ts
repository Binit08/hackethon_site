import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import ProctoringViolation from "@/models/ProctoringViolation"
import ProctoringSession from "@/models/ProctoringSession"

/**
 * Batch endpoint for proctoring violations
 * Implements ERROR #9: Proctoring Violation Batch Processing Missing
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized',
          },
        },
        { status: 401 }
      )
    }

    await connectDB()

    const body = await request.json()
    const { violations } = body

    if (!Array.isArray(violations) || violations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Violations array required',
          },
        },
        { status: 400 }
      )
    }

    // Validate all violations have required fields
    for (const violation of violations) {
      if (!violation.sessionId || !violation.violation) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_VIOLATION',
              message: 'Each violation must have sessionId and violation data',
            },
          },
          { status: 400 }
        )
      }
    }

    // Process all violations in a transaction
    const results = []

    for (const item of violations) {
      const { sessionId, violation } = item

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

      results.push(violationRecord)
    }

    // Check if any session has too many violations
    const sessionIdMap = new Map<string, boolean>()
    violations.forEach(v => sessionIdMap.set(v.sessionId, true))
    const sessionIds = Array.from(sessionIdMap.keys())
    const suspensions = []

    for (const sessionId of sessionIds) {
      const sessionData = await ProctoringSession.findOne({ sessionId })
      if (sessionData && sessionData.suspicionScore >= 80) {
        await ProctoringSession.findOneAndUpdate(
          { sessionId },
          { status: "SUSPENDED" }
        )
        suspensions.push(sessionId)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        violations: results,
        suspensions,
        message: suspensions.length > 0
          ? "Too many violations detected. Your exam has been flagged for review."
          : "Violations logged successfully",
      },
    })
  } catch (error: any) {
    console.error("Error logging batch violations:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || "Internal server error",
        },
      },
      { status: 500 }
    )
  }
}
