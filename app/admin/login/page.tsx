// app/admin/login/page.tsx
"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useSearchParams()

  const urlError = params.get("error")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setLoading(false)
        return
      }

      // After sign in, navigate to admin — middleware will enforce ADMIN role
      router.push("/admin")
      router.refresh()
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#151c2e] p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Only administrators can access the admin dashboard. Use your admin account credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(urlError === "unauthorized") && (
            <div className="text-red-500 mb-4 text-sm">
              You must be an admin to access that page.
            </div>
          )}
          {error && (
            <div className="text-red-500 mb-4 text-sm">{error}</div>
          )}
          <form className="space-y-4" onSubmit={handleLogin}>
            <Input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Button type="submit" className="w-full bg-[#ff6ab0] hover:bg-[#e2549b]" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
