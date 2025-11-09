import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Submission from "@/models/Submission"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get all users with their submissions
    const users = await User.find()
      .populate('teamId', 'name')
      .lean()

    // Calculate scores for each user
    const leaderboard = await Promise.all(
      users.map(async (user) => {
        const submissions = await Submission.find({ userId: user._id }).lean()
        const totalScore = submissions.reduce((sum: number, sub: any) => sum + sub.score, 0)
        const acceptedSubmissions = submissions.filter(
          (sub: any) => sub.status === "ACCEPTED"
        ).length
        const totalSubmissions = submissions.length

        return {
          userId: user._id.toString(),
          userName: user.name,
          teamName: (user.teamId as any)?.name,
          totalScore,
          totalSubmissions,
          acceptedSubmissions,
        }
      })
    )

    // Filter and sort
    const filtered = leaderboard
      .filter((entry) => entry.totalSubmissions > 0)
      .sort((a, b) => {
        // Sort by score first, then by accepted submissions
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore
        }
        return b.acceptedSubmissions - a.acceptedSubmissions
      })
      .slice(0, 100) // Top 100

    return NextResponse.json(filtered)
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
