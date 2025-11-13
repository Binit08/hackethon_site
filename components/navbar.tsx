"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0b1220]/80 border-b border-white/10 shadow-lg">
      <div className="relative w-full">
        {/* Background glass/shade effects */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(87,97,255,0.11),transparent_62%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,75,149,0.09),transparent_70%)]" />
        </div>
        <div className="relative container mx-auto max-w-7xl px-4 flex h-16 items-center justify-between">
          {/* Left: Brand */}
          <Link href="/" className="text-lg font-extrabold tracking-wide bg-gradient-to-r from-[#6aa5ff] via-[#9b8cff] to-[#ff6ab0] text-transparent bg-clip-text hover:opacity-80 transition-opacity">
            Hackathon 2026
          </Link>
          {/* Middle: Nav Links */}
          <div className="hidden md:flex gap-8 text-white/80 font-medium">
            <Link 
              href="/"
              className={`hover:text-white/95 transition-colors ${pathname === "/" ? "text-[#6aa5ff] font-bold" : ""}`}
            >
              Home
            </Link>
            {session && (
              <>
                <Link 
                  href="/dashboard"
                  className={`hover:text-white/95 transition-colors ${pathname === "/dashboard" ? "text-[#6aa5ff] font-bold" : ""}`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/submissions"
                  className={`hover:text-white/95 transition-colors ${pathname === "/submissions" ? "text-[#6aa5ff] font-bold" : ""}`}
                >
                  Submissions
                </Link>
                <Link 
                  href="/leaderboard"
                  className={`hover:text-white/95 transition-colors ${pathname === "/leaderboard" ? "text-[#6aa5ff] font-bold" : ""}`}
                >
                  Leaderboard
                </Link>
              </>
            )}
            <Link 
              href="/faq"
              className={`hover:text-white/95 transition-colors ${pathname === "/faq" ? "text-[#6aa5ff] font-bold" : ""}`}
            >
              FAQ
            </Link>
            <Link 
              href="/contact"
              className={`hover:text-white/95 transition-colors ${pathname === "/contact" ? "text-[#6aa5ff] font-bold" : ""}`}
            >
              Contact
            </Link>
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className={`hover:text-white/95 transition-colors ${pathname === "/admin" ? "font-bold text-[#6aa5ff]" : ""}`}
              >
                Admin
              </Link>
            )}
          </div>
          {/* Right: User Controls */}
          <div className="flex items-center gap-2 md:gap-4">
            {session ? (
              <>
                <span className="text-sm text-white/60 mr-2 hidden md:inline">
                  {session.user.name}
                </span>
                <Button size="sm" variant="outline" className="bg-white/10 border-white/15 text-white/90 backdrop-blur-md"
                  onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button size="sm" variant="ghost" className="text-white/85">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-[#7c4dff] hover:bg-[#6a3fff] text-white font-bold">Register</Button>
                </Link>
                <Link href="/admin/login">
                  <Button size="sm" className="bg-[#ff6ab0] hover:bg-[#e2549b] text-white font-bold">
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
