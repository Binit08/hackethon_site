"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Confetti from "react-confetti"
import { motion } from "framer-motion"
import {
  FaRocket, FaCode, FaTrophy, FaFileAlt,
  FaQuestionCircle, FaEnvelopeOpenText, FaCertificate, FaUser,
} from "react-icons/fa"

type DashboardClientProps = {
  session: {
    user?: {
      name?: string
      email?: string
      image?: string
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
      className="flex flex-col items-center px-6 py-7 rounded-2xl hover:bg-[#202945]/70 bg-transparent transition-shadow duration-150 shadow-none border-none"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg text-white mb-1">{title}</h3>
      <p className="mb-5 text-white/80 text-center">{description}</p>
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
    <div className="min-h-screen bg-[#13182a] relative overflow-hidden font-montserrat">
      <Confetti numberOfPieces={75} recycle={false} opacity={0.13} width={width} height={height} />
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Top blur and radial */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(87,97,255,0.10),transparent_78%)]" />
        {/* Gradient veil */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#182142]/60 via-[#151c2e]/75 to-[#13182a] backdrop-blur-[3px]" />
      </div>

      <div className="container mx-auto px-4 pb-20 pt-14 relative z-10">
        {/* Banner Welcome Section */}
        <section className="max-w-4xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between border-b border-[#232b4d] py-10 px-2 rounded-3xl mb-12 bg-gradient-to-br from-[#0b1220]/90 to-[#21284a]/90 shadow-[0px_10px_40px_0px_rgba(100,37,255,0.08)]">
          <div className="flex-1 flex flex-col justify-center items-center md:items-start gap-2">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6aa5ff] via-[#9b8cff] to-[#ff6ab0] bg-clip-text text-transparent mb-1 text-center md:text-left"
            >
              Welcome, {session.user?.name || "Participant"}!
            </motion.h2>
            <p className="text-white/70 font-light">{session.user?.email}</p>
            <span className="mt-2 text-white/80 font-medium">Hackathon 2026 Dashboard</span>
            <span className="text-[#88ffe0] font-semibold text-lg">Ignite innovation. Compete. Win.</span>
          </div>
          <div className="flex-1 flex justify-center md:justify-end mb-8 md:mb-0">
            <div className="rounded-full border-4 border-[#6aa5ff] overflow-hidden w-32 h-32 flex items-center justify-center shadow-md bg-[#221a49]/50">
              {session?.user?.image
                ? <img src={session.user.image} className="w-full h-full object-cover" alt="Profile" />
                : <FaUser className="text-[#6aa5ff] text-6xl" />
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
        <div className="w-full border-t border-[#232b4d] mb-10" />

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
