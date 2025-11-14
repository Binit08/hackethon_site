import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

// Protect all /admin routes except the login page itself
if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  console.log('Middleware - pathname:', pathname)
  console.log('Middleware - token:', token ? { email: (token as any).email, role: (token as any).role } : null)

  // Not signed in
  if (!token) {
    console.log('Middleware - no token, redirecting to login')
    const url = new URL("/admin/login", req.url)
    url.searchParams.set("error", "unauthorized")
    return NextResponse.redirect(url)
  }

  // Signed in but not an admin
  if ((token as any).role !== "ADMIN") {
    console.log('Middleware - not admin role:', (token as any).role)
    const url = new URL("/admin/login", req.url)
    url.searchParams.set("error", "unauthorized")
    return NextResponse.redirect(url)
  }

  console.log('Middleware - authorized as admin')
}

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}