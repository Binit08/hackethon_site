import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Problem from "@/models/Problem"
import { executeCode, LANGUAGE_IDS } from "@/lib/judge0"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { problemId, code, language, input } = body || {}

    if (!problemId) {
      return NextResponse.json({ error: "Problem ID is required" }, { status: 400 })
    }

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    if (!language || !LANGUAGE_IDS[language.toLowerCase()]) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_IDS).join(", ")}` },
        { status: 400 }
      )
    }

    const problem = await Problem.findById(problemId).lean()
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    // Check if Judge0 is configured
    if (!process.env.JUDGE0_API_KEY) {
      return NextResponse.json({
        error: "Code execution is not configured. Please set JUDGE0_API_KEY in your environment variables. Get a free API key from https://rapidapi.com/judge0-official/api/judge0-ce"
      }, { status: 503 })
    }

    // Execute code using Judge0
    const usedInput: string = (input ?? problem.sampleInput ?? "").toString()
    const timeLimitSeconds = problem.timeLimit ? Math.min(problem.timeLimit * 60, 10) : 5 // cap at 10s
    const memoryLimitKB = problem.memoryLimit ? problem.memoryLimit * 1024 : 256000 // convert MB to KB

    const result = await executeCode(code, language, usedInput, timeLimitSeconds, memoryLimitKB)

    // Map Judge0 status to our response format
    const payload = {
      status: result.status.description,
      statusId: result.status.id,
      verdict: result.status.description,
      stdout: result.stdout || null,
      stderr: result.stderr || null,
      compileOutput: result.compile_output || null,
      message: result.message || null,
      usedInput,
      language,
      metrics: {
        timeMs: result.time ? parseFloat(result.time) * 1000 : null,
        memoryKB: result.memory || null,
      },
      problem: {
        id: problem._id.toString(),
        title: problem.title,
      },
    }

    return NextResponse.json(payload, { status: 200 })
  } catch (error: any) {
    console.error("Run endpoint error:", error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
