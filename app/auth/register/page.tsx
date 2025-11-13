"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus, User, Mail, Lock, Users } from "lucide-react"

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  teamName?: string
  teamSize: number
}

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    teamName: "",
    teamSize: 1,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { toast } = useToast()

  const nameInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const teamNameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 1 && nameInputRef.current) {
      nameInputRef.current.focus()
    } else if (step === 2 && emailInputRef.current) {
      emailInputRef.current.focus()
    } else if (step === 3 && passwordInputRef.current) {
      passwordInputRef.current.focus()
    } else if (step === 4 && teamNameInputRef.current) {
      teamNameInputRef.current.focus()
    }
  }, [step])

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required"
      }
    } else if (currentStep === 2) {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format"
      }
    } else if (currentStep === 3) {
      if (!formData.password) {
        newErrors.password = "Password is required"
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters"
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    } else if (currentStep === 4) {
      if (formData.teamSize > 1 && !formData.teamName?.trim()) {
        newErrors.teamName = "Team name is required for teams"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(step)) return

    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          teamName: formData.teamSize > 1 ? formData.teamName : undefined,
        }),
      })

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          const data = await response.json()
          throw new Error(data.error || `Registration failed (${response.status})`)
        } else {
          const text = await response.text()
          throw new Error(`Registration failed: ${text.substring(0, 100)}`)
        }
      }

      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: "Account created successfully. Please sign in.",
      })
      router.push("/auth/signin")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#151c2e] p-4 pt-24">
      <Card className="w-full max-w-md bg-[#192345] border-[#6aa5ff]/20">
        <CardHeader className="text-center border-b border-[#6aa5ff]/10">
          <div className="mx-auto mb-4 w-16 h-16 bg-[#6aa5ff]/10 rounded-full flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-[#6aa5ff]" />
          </div>
          <CardTitle className="text-2xl text-white">Create Account</CardTitle>
          <CardDescription className="text-white/60">
            Step {step} of 4: Complete the registration
          </CardDescription>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded ${
                  s <= step ? "bg-[#6aa5ff]" : "bg-[#0f1729]"
                } transition-colors`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white flex items-center gap-2">
                      <User className="h-4 w-4 text-[#6aa5ff]" />
                      Full Name
                    </Label>
                    <Input
                      ref={nameInputRef}
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="bg-[#0f1729] border-[#6aa5ff]/20 text-white placeholder:text-white/40"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      required
                      autoComplete="name"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-400">{errors.name}</p>
                    )}
                  </div>
                  <Button type="button" onClick={handleNext} className="w-full bg-[#6aa5ff] hover:bg-[#5a95ef] text-white font-semibold">
                    Next
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#6aa5ff]" />
                      Email
                    </Label>
                    <Input
                      ref={emailInputRef}
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="bg-[#0f1729] border-[#6aa5ff]/20 text-white placeholder:text-white/40"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      required
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleBack} className="flex-1 bg-[#0f1729] border-[#6aa5ff]/20 text-white hover:bg-[#1f2d4f]">
                      Back
                    </Button>
                    <Button type="button" onClick={handleNext} className="flex-1 bg-[#6aa5ff] hover:bg-[#5a95ef] text-white font-semibold">
                      Next
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white flex items-center gap-2">
                      <Lock className="h-4 w-4 text-[#6aa5ff]" />
                      Password
                    </Label>
                    <Input
                      ref={passwordInputRef}
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-[#0f1729] border-[#6aa5ff]/20 text-white placeholder:text-white/40"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    {errors.password && (
                      <p className="text-sm text-red-400">{errors.password}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white flex items-center gap-2">
                      <Lock className="h-4 w-4 text-[#6aa5ff]" />
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="bg-[#0f1729] border-[#6aa5ff]/20 text-white placeholder:text-white/40"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleBack} className="flex-1 bg-[#0f1729] border-[#6aa5ff]/20 text-white hover:bg-[#1f2d4f]">
                      Back
                    </Button>
                    <Button type="button" onClick={handleNext} className="flex-1 bg-[#6aa5ff] hover:bg-[#5a95ef] text-white font-semibold">
                      Next
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="teamSize" className="text-white flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#6aa5ff]" />
                      Team Size
                    </Label>
                    <select
                      id="teamSize"
                      className="flex h-10 w-full rounded-md border border-[#6aa5ff]/20 bg-[#0f1729] text-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6aa5ff] focus-visible:ring-offset-2"
                      value={formData.teamSize}
                      onChange={(e) => updateFormData("teamSize", parseInt(e.target.value))}
                    >
                      <option value={1}>Individual (1 member)</option>
                      <option value={2}>Team (2 members)</option>
                      <option value={3}>Team (3 members)</option>
                      <option value={4}>Team (4 members)</option>
                    </select>
                  </div>
                  {formData.teamSize > 1 && (
                    <div className="space-y-2">
                      <Label htmlFor="teamName" className="text-white">Team Name</Label>
                      <Input
                        ref={teamNameInputRef}
                        id="teamName"
                        type="text"
                        placeholder="Team Name"
                        className="bg-[#0f1729] border-[#6aa5ff]/20 text-white placeholder:text-white/40"
                        value={formData.teamName}
                        onChange={(e) => updateFormData("teamName", e.target.value)}
                        required={formData.teamSize > 1}
                      />
                      {errors.teamName && (
                        <p className="text-sm text-red-400">{errors.teamName}</p>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleBack} className="flex-1 bg-[#0f1729] border-[#6aa5ff]/20 text-white hover:bg-[#1f2d4f]">
                      Back
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1 bg-[#6aa5ff] hover:bg-[#5a95ef] text-white font-semibold">
                      {loading ? "Registering..." : "Register"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-white/60">Already have an account? </span>
            <Link href="/auth/signin" className="text-[#6aa5ff] hover:text-[#5a95ef] font-semibold">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

