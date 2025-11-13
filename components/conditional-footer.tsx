"use client"

import { usePathname } from "next/navigation"
import Footer from "./footer"

export function ConditionalFooter() {
  const pathname = usePathname()
  
  // Hide footer on exam pages (coding and MCQ rounds)
  const hideFooter = pathname === "/rounds/coding" || pathname === "/rounds/mcq"
  
  if (hideFooter) {
    return null
  }
  
  return <Footer />
}
