import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

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

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}