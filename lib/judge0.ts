/**
 * Judge0 CE API integration for code execution
 * Docs: https://ce.judge0.com/
 */

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com"
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY

// Warn in development, but allow build to succeed (Comment 8)
if (!JUDGE0_API_KEY && process.env.NODE_ENV === 'development') {
  console.warn('Warning: JUDGE0_API_KEY is not set. Code execution will not work.')
}

// Language ID mapping for Judge0 CE
// Full list: https://ce.judge0.com/#statuses-and-languages-language-get
export const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63, // Node.js
  python: 71,     // Python 3
  java: 62,       // Java (OpenJDK 13.0.1)
  cpp: 54,        // C++ (GCC 9.2.0)
  c: 50,          // C (GCC 9.2.0)
  typescript: 74, // TypeScript
  go: 60,         // Go
  rust: 73,       // Rust
  ruby: 72,       // Ruby
  php: 68,        // PHP
}

export interface Judge0Submission {
  source_code: string
  language_id: number
  stdin?: string
  expected_output?: string
  cpu_time_limit?: number    // seconds (default: 2)
  memory_limit?: number       // KB (default: 128000)
}

export interface Judge0Result {
  stdout: string | null
  stderr: string | null
  compile_output: string | null
  message: string | null
  time: string | null         // execution time in seconds
  memory: number | null       // memory in KB
  status: {
    id: number
    description: string
  }
  token?: string
}

/**
 * Submit code to Judge0 for execution
 */
export async function submitCode(submission: Judge0Submission): Promise<string> {
  // Validate API key at function level (Comment 8)
  if (!JUDGE0_API_KEY) {
    throw new Error('Code execution is not configured. JUDGE0_API_KEY is missing.')
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  // If using RapidAPI (public Judge0 instance)
  if (JUDGE0_API_URL.includes("rapidapi.com")) {
    headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com"
    headers["X-RapidAPI-Key"] = JUDGE0_API_KEY
  }

  const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`, {
    method: "POST",
    headers,
    body: JSON.stringify(submission),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Judge0 submission failed: ${response.status} - ${error}`)
  }

  const result = await response.json()
  return result.token
}

/**
 * Get submission result by token (with polling and timeout)
 * Implements ERROR #7: No Timeout on Judge0 Polling
 */
export async function getResult(token: string, maxAttempts = 10, timeoutMs = 30000): Promise<Judge0Result> {
  // Validate API key at function level (Comment 8)
  if (!JUDGE0_API_KEY) {
    throw new Error('Code execution is not configured. JUDGE0_API_KEY is missing.')
  }

  const headers: Record<string, string> = {}

  if (JUDGE0_API_URL.includes("rapidapi.com")) {
    headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com"
    headers["X-RapidAPI-Key"] = JUDGE0_API_KEY
  }

  const startTime = Date.now()

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Check absolute timeout
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Judge0 execution timeout - exceeded ${timeoutMs}ms limit`)
    }

    const response = await fetch(
      `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`,
      { headers }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Judge0 get result failed: ${response.status} - ${error}`)
    }

    const result: Judge0Result = await response.json()

    // Status ID 1 = In Queue, 2 = Processing
    // Status ID >= 3 = Finished (success or error)
    if (result.status.id > 2) {
      return result
    }

    // Wait before polling again (exponential backoff)
    const delay = Math.min(1000 * Math.pow(1.5, attempt), 3000)
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  throw new Error("Judge0 execution timeout - result not ready after polling")
}

/**
 * Execute code and return result (submit + poll)
 */
export async function executeCode(
  code: string,
  language: string,
  input?: string,
  timeLimitSeconds?: number,
  memoryLimitKB?: number
): Promise<Judge0Result> {
  const languageId = LANGUAGE_IDS[language.toLowerCase()]
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_IDS).join(", ")}`)
  }

  const submission: Judge0Submission = {
    source_code: code,
    language_id: languageId,
    stdin: input || "",
    cpu_time_limit: timeLimitSeconds || 2,
    memory_limit: memoryLimitKB || 128000, // 128 MB default
  }

  const token = await submitCode(submission)
  const result = await getResult(token)

  return result
}
