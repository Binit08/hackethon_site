import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    // Lazy-load heavy/server-adjacent modules to avoid pulling client/vendor bundles
    // into the server runtime during module evaluation.
    const [{ default: User }, { default: Team }, bcrypt, { sendConfirmationEmail }] = await Promise.all([
      import('@/models/User'),
      import('@/models/Team'),
      import('bcryptjs'),
      import('@/lib/email')
    ])
    const body = await request.json()
    
    // Explicitly whitelist allowed fields to prevent role injection (ERROR #40)
    const { name, email, password, teamName } = body

    // Validate all fields BEFORE any database operations (Comment 1)
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Use shared validation library (Comment 3)
    const { validatePassword, validateTeamName, validateEmail } = await import('@/lib/validation')
    
    // Validate email format
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      )
    }

    // Validate and normalize team name if provided
    let normalizedTeamName: string | null = null
    if (teamName) {
      const teamValidation = validateTeamName(teamName)
      if (!teamValidation.valid) {
        return NextResponse.json(
          { error: teamValidation.error },
          { status: 400 }
        )
      }
      normalizedTeamName = String(teamName).replace(/\s+/g, ' ').trim()
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

    // Check if team name is taken (before creating user)
    if (normalizedTeamName) {
      const existingTeam = await Team.findOne({ name: normalizedTeamName })
      if (existingTeam) {
        return NextResponse.json(
          { error: "Team name already taken" },
          { status: 400 }
        )
      }
    }

    // All validations passed - now hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "PARTICIPANT",
    })

    // Create team if needed
    if (normalizedTeamName) {
      try {
        // Create team with leader
        const team = await Team.create({
          name: normalizedTeamName,
          leaderId: user._id,
        }) as typeof Team.prototype

        // Update user with team ID
        user.teamId = team._id as import("mongoose").Types.ObjectId
        await user.save()
      } catch (teamError: any) {
        // Team creation failed - delete the user to avoid orphaned account
        await User.findByIdAndDelete(user._id)
        throw teamError
      }
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
