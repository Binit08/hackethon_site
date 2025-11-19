/**
 * CSRF Protection Implementation (Comment 7)
 * 
 * Uses double-submit cookie pattern:
 * - Server sets httpOnly cookie with random token
 * - Client sends token in request header
 * - Server validates they match
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const CSRF_TOKEN_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const TOKEN_LENGTH = 32

/**
 * Generate a cryptographically secure random token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(TOKEN_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Get the CSRF token from cookies
 */
export async function getCsrfToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_TOKEN_NAME)?.value || null
}

/**
 * Set CSRF token in response cookies
 */
export function setCsrfToken(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

/**
 * Validate CSRF token from request
 * Returns true if token is valid, false otherwise
 */
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  // Skip validation for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true
  }

  const cookieToken = request.cookies.get(CSRF_TOKEN_NAME)?.value
  const headerToken = request.headers.get(CSRF_HEADER_NAME)

  if (!cookieToken || !headerToken) {
    return false
  }

  // Timing-safe comparison
  return cookieToken === headerToken
}

/**
 * Middleware helper to validate CSRF and return error response if invalid
 */
export async function csrfProtection(
  request: NextRequest
): Promise<NextResponse | null> {
  const isValid = await validateCsrfToken(request)
  
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  return null // No error, continue
}
