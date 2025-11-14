import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Team from "@/models/Team"
import bcrypt from "bcryptjs"
import { sendConfirmationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, teamName } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    try {
      await connectDB()
    } catch (dbError: any) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        { error: "Database connection failed. Please check your DATABASE_URL." },
        { status: 500 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

  // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user first
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "PARTICIPANT",
    })

    // Create team if needed
    if (teamName) {
      // Validate team name format (same as schema)
      const normalized = String(teamName).replace(/\s+/g, ' ').trim()
      const re = /^[A-Za-z][A-Za-z0-9\- ]{1,28}[A-Za-z0-9]$/
      if (normalized.length < 3 || normalized.length > 30 || !re.test(normalized)) {
        // Delete the user if created earlier (but at this point user not yet created?)
        // We validate before creating team and after creating user, so no cleanup needed yet.
        return NextResponse.json(
          { error: "Team name must be 3-30 chars, start with a letter, and contain only letters, numbers, spaces, or hyphens" },
          { status: 400 }
        )
      }
      // Check if team name is taken
      const existingTeam = await Team.findOne({ name: normalized })

      if (existingTeam) {
        // Delete the user if team creation fails
        await User.findByIdAndDelete(user._id)
        return NextResponse.json(
          { error: "Team name already taken" },
          { status: 400 }
        )
      }

      // Create team with leader
      const team = await Team.create({
        name: normalized,
        leaderId: user._id,
      }) as typeof Team.prototype

      // Update user with team ID
      user.teamId = team._id as import("mongoose").Types.ObjectId
      await user.save()
    }

    // Send confirmation email
    try {
      await sendConfirmationEmail(user.email, user.name)
    } catch (error) {
      console.error("Error sending confirmation email:", error)
      // Don't fail registration if email fails
    }

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error: any) {
    console.error("Registration error:", error)
    
    // Provide more specific error messages
    let errorMessage = "Internal server error"
    if (error.name === "ValidationError") {
      errorMessage = Object.values(error.errors).map((e: any) => e.message).join(", ")
    } else if (error.code === 11000) {
      // MongoDB duplicate key error
      if (error.keyPattern?.email) {
        errorMessage = "Email already exists"
      } else if (error.keyPattern?.name) {
        errorMessage = "Team name already taken"
      }
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
