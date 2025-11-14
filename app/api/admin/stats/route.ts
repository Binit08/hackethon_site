import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Team from "@/models/Team"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const [totalUsers, totalTeams, newTeams24h, invalidTeamNames] = await Promise.all([
      User.countDocuments({}),
      Team.countDocuments({}),
      Team.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      // name NOT matching regex, or length out of bounds (server mirrors model rules)
      Team.countDocuments({
        $or: [
          { name: { $not: /^[A-Za-z][A-Za-z0-9\- ]{1,28}[A-Za-z0-9]$/ } },
          { $expr: { $lt: [{ $strLenCP: "$name" }, 3] } },
          { $expr: { $gt: [{ $strLenCP: "$name" }, 30] } },
        ],
      }),
    ])

    return NextResponse.json({
      totalUsers,
      totalTeams,
      newTeams24h,
      invalidTeamNames,
    })
  } catch (err: any) {
    console.error("Admin stats error:", err)
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}
