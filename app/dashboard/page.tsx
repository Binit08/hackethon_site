// app/dashboard/page.jsx

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  // Get authentication session server-side
  const session = await getServerSession(authOptions)

  // Redirect unauthenticated users
  if (!session) {
    redirect("/auth/signin")
  }

  // Pass session info as a prop to the client component
  return <DashboardClient session={session} />
}
