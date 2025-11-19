"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-blue-200/50 shadow-lg">
      <div className="relative w-full">
        {/* Background glass/shade effects */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.08),transparent_62%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.06),transparent_70%)]" />
        </div>
        <div className="relative container mx-auto max-w-7xl px-4 flex h-16 items-center justify-between">
          {/* Left: Brand */}
          <Link href="/" className="text-lg font-extrabold tracking-wide bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 text-transparent bg-clip-text hover:opacity-80 transition-opacity">
            Hackathon 2026
          </Link>
          {/* Middle: Nav Links */}
          <div className="hidden md:flex gap-8 text-gray-700 font-medium">
            <Link 
              href="/"
              className={`hover:text-gray-900 transition-colors ${pathname === "/" ? "text-blue-600 font-bold" : ""}`}
            >
              Home
            </Link>
            {session && (
              <>
                <Link 
                  href="/dashboard"
                  className={`hover:text-gray-900 transition-colors ${pathname === "/dashboard" ? "text-blue-600 font-bold" : ""}`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/submissions"
                  className={`hover:text-gray-900 transition-colors ${pathname === "/submissions" ? "text-blue-600 font-bold" : ""}`}
                >
                  Submissions
                </Link>
                <Link 
                  href="/leaderboard"
                  className={`hover:text-gray-900 transition-colors ${pathname === "/leaderboard" ? "text-blue-600 font-bold" : ""}`}
                >
                  Leaderboard
                </Link>
              </>
            )}
            <Link 
              href="/faq"
              className={`hover:text-gray-900 transition-colors ${pathname === "/faq" ? "text-blue-600 font-bold" : ""}`}
            >
              FAQ
            </Link>
            <Link 
              href="/contact"
              className={`hover:text-gray-900 transition-colors ${pathname === "/contact" ? "text-blue-600 font-bold" : ""}`}
            >
              Contact
            </Link>
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className={`hover:text-gray-900 transition-colors ${pathname === "/admin" ? "font-bold text-blue-600" : ""}`}
              >
                Admin
              </Link>
            )}
          </div>
          {/* Right: User Controls */}
          <div className="flex items-center gap-2 md:gap-4">
            {session ? (
              <>
                <span className="text-sm text-gray-600 mr-2 hidden md:inline">
                  {session.user.name}
                </span>
                <Button size="sm" variant="outline" className="bg-white/50 border-blue-200 text-gray-700 hover:bg-blue-50 backdrop-blur-md"
                  onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button size="sm" variant="ghost" className="text-gray-700 hover:text-gray-900 hover:bg-blue-50">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Register</Button>
                </Link>
                <Link href="/admin/login">
                  <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold">
                    Admin Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
