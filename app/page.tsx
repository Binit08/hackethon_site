  /* eslint-disable @next/next/no-img-element */
  // app/page.tsx
  import Link from "next/link"
  import { Button } from "@/components/ui/button"
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

  export default function Home() {
    return (
      <div className="min-h-screen bg-[#151c2e] text-white relative overflow-hidden">

        {/* Background & Glass Effect */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(87,97,255,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,75,149,0.12),transparent_55%)]" />
        </div>
        <div className="absolute inset-0 bg-white/0 backdrop-blur-[2px]" />

        {/* Hero Section */}
        <header className="relative z-10 container mx-auto px-4 pt-10 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-center mb-4">
            National-Level Coding Competition
          </h1>
          <p className="text-[#6aa5ff] text-center text-lg font-medium mb-2">
            Organized by NIT Silchar: Where Innovation Meets Excellence
          </p>
          <p className="max-w-2xl text-white/85 text-center mb-6">
            Join the brightest minds to tackle real-world challenges using AI/ML and cutting-edge technologies. Showcase your skills, win exciting prizes, and shape the future.
          </p>
          <Link href="#challenge">
            <Button size="lg" className="bg-[#6aa5ff] hover:bg-[#3c7dff]">View The Challenge</Button>
          </Link>
        </header>

        {/* About Hackathon */}
        <main className="relative z-10 container mx-auto px-4 pt-16 pb-24">
          <section id="about" className="bg-[#192345] rounded-2xl p-8 mb-12 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-4">About The Hackathon</h2>
              <p className="text-white/70 mb-4">Fostering Innovation and Collaborative Problem-Solving</p>
              <div className="bg-[#232b4d] rounded-xl shadow-lg p-6">
                <h3 className="font-bold mb-1">Hosted by NIT Silchar</h3>
                <p className="text-white/80 mb-2">An Institute of National Importance, NIT Silchar stands at the forefront of technical education and research. With a legacy of excellence and top national rankings (NIRF Engg.: 40), its the perfect launchpad for the next generation of innovators.</p>
                <ul className="space-y-2 mt-4 text-white/85">
                  <li>• <b>Encourage Innovation:</b> Drive creative AI/ML-driven solutions for complex problems.</li>
                  <li>• <b>Foster Collaboration:</b> Build a national community of coders, thinkers, and creators.</li>
                  <li>• <b>Identify Talent:</b> Discover and recognize the brightest tech talent in the country.</li>
                </ul>
              </div>
            </div>
            <div className="flex-1 flex justify-center items-center">
              <img src="/nit_images.jpeg" alt="NIT Silchar Campus" className="rounded-2xl shadow-2xl object-cover w-full max-w-2xl h-[28rem] p-4 m-4 " />
            </div>
          </section>

          {/* Competition Timeline */}
          <section id="timeline" className="mb-12 mt-4">
            <h3 className="text-2xl font-bold mb-8 text-center">Competition Timeline</h3>
            <div className="space-y-8 max-w-2xl mx-auto">
              <TimelineBlock
                month="January 2026 (Second Week)"
                round="Round 1: Online Screening"
                detail="An initial online test featuring MCQs, aptitude challenges, and basic coding questions to screen participants. Top 75% or those with 50%+ marks qualify."
              />
              <TimelineBlock
                month="February 2026 (First Week)"
                round="Round 2: Online Challenge"
                detail="Qualified teams will tackle intermediate problem statements based on coding and AI/ML applications. Top teams will be shortlisted for the final round."
              />
              <TimelineBlock
                month="February 2026 (Last Week)"
                round="Round 3: Offline Finale"
                detail="The ultimate challenge! A 48-hour offline hackathon at NIT Silchar campus where finalists will solve real-time problems and present their solutions."
              />
            </div>
          </section>

          {/* Prizes & Recognition */}
          <section id="prizes" className="mb-14 mt-4">
            <h3 className="text-2xl font-bold mb-8 text-center">Prizes & Recognition</h3>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <PrizeBlock place="2nd Prize" amount="₹40,000" />
              <PrizeBlock place="1st Prize" amount="₹50,000" highlight />
              <PrizeBlock place="3rd Prize" amount="₹30,000" />
            </div>
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
              <RecognitionItem>Outstanding Performance</RecognitionItem>
              <RecognitionItem>Appreciation Certificate</RecognitionItem>
              <RecognitionItem>Participation Certificate</RecognitionItem>
            </div>
          </section>

          {/* Register Team & Payment */}
          <section id="register" className="grid md:grid-cols-2 gap-8 items-center mt-10 bg-[#192345] rounded-2xl p-8">
            <div>
              <h3 className="font-bold text-xl mb-4">Register Your Team</h3>
              <p className="mb-2 text-white/80">Assemble your team of up to three members and get ready to code. Registration closes on <b>30th December 2025</b>. Don't miss out on this incredible opportunity.</p>
              <ul className="mb-4 flex gap-6 flex-wrap">
                <li className="bg-[#222a49] px-4 py-2 rounded-xl text-white/85">Free Accommodation</li>
                <li className="bg-[#222a49] px-4 py-2 rounded-xl text-white/85">Gala Dinner</li>
              </ul>
              <Link href="https://forms.gle">
                <Button className="bg-[#6aa5ff] hover:bg-[#3c7dff] mt-2">Register via Google Form</Button>
              </Link>
            </div>
            <div>
              <div className="bg-[#222a49] rounded-xl p-6">
                <h4 className="font-bold text-lg mb-2">Payment Details</h4>
                <p className="mb-1"><b>Registration Fee:</b> ₹2000 per team</p>
                <p className="mb-1"><b>Account Name:</b> YYYY</p>
                <p className="mb-1"><b>Account Number:</b> XXX</p>
                <p className="mb-1"><b>Bank:</b> SBI, NIT Silchar Branch</p>
                <p className="mb-1"><b>IFSC Code:</b> SBIN0007061</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    )
  }

  /* --- Local subcomponents --- */
  function TimelineBlock({ month, round, detail }: { month: string, round: string, detail: string }) {
    return (
      <div className="bg-[#232b4d] rounded-xl shadow-lg p-6 relative">
        <div className="absolute -left-6 top-6 h-4 w-4 rounded-full bg-gradient-to-r from-[#6aa5ff] to-[#ff6ab0] shadow-[0_0_0_4px_rgba(255,255,255,0.08)]" />
        <div className="font-semibold text-[#6aa5ff] mb-2">{month}</div>
        <div className="font-bold text-lg mb-1">{round}</div>
        <div className="text-white/85">{detail}</div>
      </div>
    )
  }

  function PrizeBlock({ place, amount, highlight }: { place: string, amount: string, highlight?: boolean }) {
    return (
      <div className={`bg-[#232b4d] rounded-xl shadow-lg p-8 text-center border-2 ${highlight ? "border-[#6aa5ff]" : "border-transparent"} scale-105 flex flex-col justify-center items-center`}>
        <div className={`text-2xl font-bold mb-2 ${highlight ? "text-[#6aa5ff]" : ""}`}>{place}</div>
        <div className="text-4xl font-extrabold mb-2">{amount}</div>
        <div className="text-white/70">+ Certificate of Achievement</div>
      </div>
    )
  }

  function RecognitionItem({ children }: { children: React.ReactNode }) {
    return (
      <div className="px-4 py-2 rounded-full bg-[#233059] text-white/80 text-sm text-center mb-2 shadow-md">
        {children}
      </div>
    )
  }
