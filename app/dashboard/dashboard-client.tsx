"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Confetti from "react-confetti"
import { motion } from "framer-motion"
import {
  FaRocket, FaCode, FaTrophy, FaFileAlt,
  FaQuestionCircle, FaEnvelopeOpenText, FaCertificate, FaUser,
} from "react-icons/fa"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Sparkles } from "@/components/ui/sparkles"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { MovingBorder } from "@/components/ui/moving-border"

type DashboardClientProps = {
  session: {
    user?: {
      name?: string | null
      email?: string | null
      image?: string | null
    }
    [key: string]: any
  }
}

/* ------------ Feature Block: Not a Card, Flat Section ------------- */
function FeatureBlock({ icon, title, description, href, button, outline = false, download = false }
  : {
    icon: React.ReactNode
    title: string
    description: string
    href: string
    button: string
    outline?: boolean
    download?: boolean
  }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      className="flex flex-col items-center px-6 py-7 rounded-2xl hover:bg-blue-100/50 bg-transparent transition-shadow duration-150 shadow-none border-none"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg text-gray-900 mb-1">{title}</h3>
      <p className="mb-5 text-gray-600 text-center">{description}</p>
      {download ? (
        <a href={href} download>
          <Button className="w-full" variant={outline ? "outline" : "default"}>{button}</Button>
        </a>
      ) : (
        <Link href={href}>
          <Button className="w-full" variant={outline ? "outline" : "default"}>{button}</Button>
        </Link>
      )}
    </motion.div>
  )
}

/* ------------ DASHBOARD CLIENT -------------- */
export default function DashboardClient({ session }: DashboardClientProps) {
  const width = typeof window !== "undefined" ? window.innerWidth : 1200
  const height = typeof window !== "undefined" ? window.innerHeight : 800

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 relative overflow-hidden font-montserrat">
      <BackgroundBeams />
      <Sparkles />
      <Confetti numberOfPieces={75} recycle={false} opacity={0.08} width={width} height={height} />
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Top blur and radial */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(147,197,253,0.15),transparent_78%)]" />
        {/* Gradient veil */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-cyan-50/30 to-sky-50/20 backdrop-blur-[2px]" />
      </div>

      <div className="container mx-auto px-4 pb-20 pt-14 relative z-10">
        {/* Banner Welcome Section */}
        <section className="max-w-4xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between border-b border-blue-200 py-10 px-2 rounded-3xl mb-12 bg-white/60 backdrop-blur-sm shadow-xl">
          <div className="flex-1 flex flex-col justify-center items-center md:items-start gap-2">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent mb-1 text-center md:text-left"
            >
              Welcome, {session.user?.name || "Participant"}!
            </motion.h2>
            <p className="text-gray-600 font-light">{session.user?.email}</p>
            <span className="mt-2 text-gray-700 font-medium">Hackathon 2026 Dashboard</span>
            <span className="text-cyan-600 font-semibold text-lg">Ignite innovation. Compete. Win.</span>
          </div>
          <div className="flex-1 flex justify-center md:justify-end mb-8 md:mb-0">
            <div className="rounded-full border-4 border-blue-600 overflow-hidden w-32 h-32 flex items-center justify-center shadow-md bg-blue-100 relative">
              {session?.user?.image
                ? <Image src={session.user.image} fill className="object-cover" alt="Profile" />
                : <FaUser className="text-blue-600 text-6xl" />
              }
            </div>
          </div>
        </section>

        {/* Feature Row: MCQ / Coding / Leaderboard / Submissions */}
        <section className="max-w-5xl mx-auto relative">
          <div className="flex flex-col lg:flex-row gap-8 justify-between mb-14">
            <FeatureBlock
              icon={<FaRocket className="text-[#6aa5ff]" />}
              title="MCQ Round"
              description="Fundamentals & Aptitude. Get Ready!"
              href="/rounds/mcq"
              button="Start MCQ"
            />
            <FeatureBlock
              icon={<FaCode className="text-[#9b8cff]" />}
              title="Coding Round"
              description="Solve real AI/ML Challenges."
              href="/rounds/coding"
              button="Start Coding"
            />
            <FeatureBlock
              icon={<FaTrophy className="text-[#ffd56a]" />}
              title="Leaderboard"
              description="See ranking. Who’s on top?"
              href="/leaderboard"
              button="Leaderboard"
              outline
            />
            <FeatureBlock
              icon={<FaFileAlt className="text-[#ff6ab0]" />}
              title="My Submissions"
              description="Your challenge & code history."
              href="/submissions"
              button="Submissions"
              outline
            />
          </div>
        </section>

        {/* Divider Line */}
        <div className="w-full border-t border-blue-200 mb-10" />

        {/* Quick Actions: FAQ, Contact, Certificate */}
        <section className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 pt-8 items-stretch">
          <FeatureBlock
            icon={<FaQuestionCircle className="text-[#88ffe0]" />}
            title="FAQ"
            description="How to play, rules & more."
            href="/faq"
            button="FAQ"
            outline
          />
          <FeatureBlock
            icon={<FaEnvelopeOpenText className="text-[#9b8cff]" />}
            title="Contact"
            description="Need help? Message us!"
            href="/contact"
            button="Contact Us"
            outline
          />
          <FeatureBlock
            icon={<FaCertificate className="text-[#ffd56a]" />}
            title="Certificate"
            description="Download your achievement."
            href="/api/certificate"
            button="Certificate"
            outline
            download
          />
        </section>
      </div>
    </div>
  )
}
