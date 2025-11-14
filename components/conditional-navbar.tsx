"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "./navbar"

export function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Hide navbar on exam pages (coding and MCQ rounds)
  const hideNavbar = pathname === "/rounds/coding" || pathname === "/rounds/mcq"
  
  if (hideNavbar) {
    return null
  }
  
  return <Navbar />
}
