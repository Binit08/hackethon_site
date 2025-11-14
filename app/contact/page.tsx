"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react"

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
    <div className="min-h-screen bg-[#151c2e] py-8 pt-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-[#6aa5ff]" />
            Contact Us
          </h1>
          <p className="text-white/60">Get in touch with us for any questions or support</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-[#192345] border-[#6aa5ff]/20">
            <CardHeader className="border-b border-[#6aa5ff]/10">
              <CardTitle className="text-white">Contact Information</CardTitle>
              <CardDescription className="text-white/60">
                Reach out to us through these channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-[#6aa5ff]/10 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-[#6aa5ff]" />
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Email</p>
                  <p className="text-sm text-white/60">
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

          <Card className="bg-[#192345] border-[#6aa5ff]/20">
            <CardHeader className="border-b border-[#6aa5ff]/10">
              <CardTitle className="text-white">Send us a Message</CardTitle>
              <CardDescription className="text-white/60">
                Fill out the form below and we&apos;ll get back to you
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Name</Label>
                  <Input
                    id="name"
                    className="bg-[#0f1729] border-[#6aa5ff]/20 text-white placeholder:text-white/40"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-[#0f1729] border-[#6aa5ff]/20 text-white placeholder:text-white/40"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-white">Subject</Label>
                  <Input
                    id="subject"
                    className="bg-[#0f1729] border-[#6aa5ff]/20 text-white placeholder:text-white/40"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-white">Message</Label>
                  <textarea
                    id="message"
                    className="flex min-h-[120px] w-full rounded-md border border-[#6aa5ff]/20 bg-[#0f1729] px-3 py-2 text-sm text-white ring-offset-background placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6aa5ff] focus-visible:ring-offset-2"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-[#6aa5ff] hover:bg-[#5a95ef] text-white font-semibold"
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
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

