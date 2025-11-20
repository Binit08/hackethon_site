import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { validateCsrfToken, generateCsrfToken, setCsrfToken } from "@/lib/csrf"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const response = NextResponse.next()

  // Generate and set CSRF token for all requests if not present
  if (!req.cookies.get('csrf-token')) {
    const token = generateCsrfToken()
    setCsrfToken(response, token)
  }

  // Apply CSRF protection to all API routes except auth endpoints (Comment 7)
  // NOTE: Temporarily relaxed - only validate if token is provided in header
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    const headerToken = req.headers.get('x-csrf-token')
    
    // Only validate if client is sending CSRF token
    if (headerToken) {
      const isValid = await validateCsrfToken(req)
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        )
      }
    }
    // If no header token is provided, allow the request (backward compatibility)
  }

// Protect all /admin routes except the login page itself
if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // Not signed in
  if (!token) {
    const url = new URL("/admin/login", req.url)
    url.searchParams.set("error", "unauthorized")
    return NextResponse.redirect(url)
  }

  // Signed in but not an admin
  if ((token as any).role !== "ADMIN") {
    const url = new URL("/admin/login", req.url)
    url.searchParams.set("error", "unauthorized")
    return NextResponse.redirect(url)
  }
}

  return response
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
}