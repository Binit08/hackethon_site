import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Submission from "@/models/Submission"
import { generateCertificate } from "@/lib/certificate"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || session.user.id

    // Get user's total score
    const user = await User.findById(userId).lean()
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const submissions = await Submission.find({ userId }).lean()
    const totalScore = submissions.reduce((sum: number, sub: any) => sum + sub.score, 0)

    // Generate certificate
    const certificate = await generateCertificate({
      name: user.name,
      score: totalScore,
      date: new Date().toLocaleDateString(),
    })

    return new NextResponse(certificate, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${user.name}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error("Error generating certificate:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
