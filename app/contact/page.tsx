"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { MovingBorder } from "@/components/ui/moving-border"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          const error = await response.json()
          throw new Error(error.error || "Failed to send message")
        } else {
          throw new Error("Failed to send message")
        }
      }

      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        throw new Error("Server returned non-JSON response")
      }

      toast({
        title: "Success",
        description: "Your message has been sent successfully! We'll get back to you soon.",
      })
      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 py-8 pt-24 relative">
      <BackgroundBeams />
      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="mb-8 text-center">
          <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <TextGenerateEffect 
            words="Contact Us"
            className="text-4xl font-bold text-gray-900 mb-2"
          />
          <p className="text-gray-600">Get in touch with us for any questions or support</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-[#192345] border-[#6aa5ff]/20">
            <CardHeader className="border-b border-blue-100">
              <CardTitle className="text-gray-900">Contact Information</CardTitle>
              <CardDescription className="text-gray-600">
                Reach out to us through these channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Email</p>
                  <p className="text-sm text-gray-600">
                    support@hackathon.nits.ac.in
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[#6aa5ff]/10 p-3 rounded-lg">
                  <Phone className="h-6 w-6 text-[#6aa5ff]" />
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Phone</p>
                  <p className="text-sm text-white/60">
                    +91-XXX-XXXX-XXXX
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[#6aa5ff]/10 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-[#6aa5ff]" />
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Address</p>
                  <p className="text-sm text-white/60">
                    NIT Silchar, Assam, India
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-4 border-t border-[#6aa5ff]/10">
                <p className="text-sm text-white/60">
                  <span className="text-white font-semibold">Response Time:</span> We typically respond within 24 hours
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl">
            <CardHeader className="border-b border-blue-100">
              <CardTitle className="text-gray-900">Send us a Message</CardTitle>
              <CardDescription className="text-gray-600">
                Fill out the form below and we&apos;ll get back to you
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-900">Name</Label>
                  <Input
                    id="name"
                    className="bg-white border-blue-200 text-gray-900 placeholder:text-gray-400"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-white border-blue-200 text-gray-900 placeholder:text-gray-400"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-gray-900">Subject</Label>
                  <Input
                    id="subject"
                    className="bg-white border-blue-200 text-gray-900 placeholder:text-gray-400"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-900">Message</Label>
                  <textarea
                    id="message"
                    className="flex min-h-[120px] w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                  />
                </div>
                <MovingBorder
                  duration={3000}
                  className="bg-white/80 backdrop-blur-sm w-full"
                >
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold border-0"
                  >
                    {loading ? (
                      "Sending..."
                    ) : (
                      <span className="flex items-center gap-2 justify-center">
                        <Send className="h-4 w-4" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </MovingBorder>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

