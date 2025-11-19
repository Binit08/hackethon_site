// app/admin/login/page.tsx
"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, Mail, Lock, AlertCircle, Shield, Sparkles as SparklesIcon } from "lucide-react"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Spotlight } from "@/components/ui/spotlight"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { MovingBorder } from "@/components/ui/moving-border"
import { Sparkles } from "@/components/ui/sparkles"
import { motion } from "framer-motion"

function AdminLoginForm() {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 p-4 relative overflow-hidden">
      <BackgroundBeams />
      <Sparkles />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(59, 130, 246, 0.5)" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto relative z-10"
      >
        <Card className="bg-white/80 backdrop-blur-xl border-blue-200 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-cyan-50/50 to-sky-50/50 pointer-events-none" />
          <CardHeader className="text-center border-b border-blue-400/20 relative">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50"
            >
              <Shield className="h-10 w-10 text-white" />
            </motion.div>
            <TextGenerateEffect 
              words="Admin Access"
              className="text-3xl text-gray-900 font-bold mb-2"
            />
            <CardDescription className="text-gray-600">
              Only administrators can access the admin dashboard
            </CardDescription>
          </CardHeader>
        <CardContent className="pt-6 relative">
          {(urlError === "unauthorized") && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-400/50 flex items-center gap-2 backdrop-blur-sm"
            >
              <AlertCircle className="h-4 w-4 text-red-300" />
              <span className="text-red-200 text-sm">
                You must be an admin to access that page.
              </span>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-400/50 flex items-center gap-2 backdrop-blur-sm"
            >
              <AlertCircle className="h-4 w-4 text-red-300" />
              <span className="text-red-200 text-sm">{error}</span>
            </motion.div>
          )}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900 flex items-center gap-2 font-semibold">
                <Mail className="h-4 w-4 text-blue-600" />
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                className="bg-white border-blue-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-blue-600/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900 flex items-center gap-2 font-semibold">
                <Lock className="h-4 w-4 text-blue-600" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-white border-blue-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-blue-600/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <MovingBorder
              duration={3000}
              className="bg-gradient-to-r from-blue-500 to-purple-600 w-full"
            >
              <Button 
                type="submit" 
                className="w-full bg-transparent hover:bg-transparent text-white font-bold text-lg border-0 h-12" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <SparklesIcon className="h-5 w-5" />
                    </motion.div>
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Admin Login
                  </span>
                )}
              </Button>
            </MovingBorder>
          </form>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Shield className="h-12 w-12 text-blue-400" />
        </motion.div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  )
}
