"use client"

import { useState, useEffect } from "react"
import { signIn, useSession, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { LogIn, Mail, Lock } from "lucide-react"
import { Spotlight } from "@/components/ui/spotlight"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { MovingBorder } from "@/components/ui/moving-border"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"

export default function SignInPage() {
  const { data: session } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const isFormValid = email.trim() !== "" && password.trim() !== ""

  // If already signed in, send user away immediately
  useEffect(() => {
    if (session?.user) {
      router.replace(session.user.role === "ADMIN" ? "/admin" : "/dashboard")
    }
  }, [session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Sign in failed",
          description: result.error || "Invalid email or password",
          variant: "destructive",
        })
      } else {
        // Fetch updated session to get role
        const newSession = await getSession()
        const destination = newSession?.user?.role === "ADMIN" ? "/admin" : "/dashboard"
        toast({
          title: "Signed in",
          description: "Welcome back!",
        })
        router.push(destination)
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: "Unexpected error",
        description: error?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 p-4 pt-24 relative">
      <BackgroundBeams />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(59, 130, 246, 0.5)" />
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl relative z-10">
        <CardHeader className="text-center border-b border-blue-100">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <LogIn className="h-8 w-8 text-blue-600" />
          </div>
          <TextGenerateEffect 
            words="Welcome Back"
            className="text-2xl text-gray-900 mb-2"
          />
          <CardDescription className="text-gray-600">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900 flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-[#0f1729] border-[#6aa5ff]/20 text-white placeholder:text-white/40"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900 flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-600" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-white border-blue-200 text-gray-900 placeholder:text-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <MovingBorder
              duration={3000}
              className="bg-white/80 backdrop-blur-sm w-full"
            >
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold border-0"
                disabled={loading || !isFormValid}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </MovingBorder>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don&apos;t have an account? </span>
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

