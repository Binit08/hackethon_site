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
  import { Check, CreditCard, Smartphone, QrCode, Shield, Users, Calendar, IndianRupee } from "lucide-react"

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
          <section id="register" className="mt-10">
            <h3 className="text-3xl font-bold mb-8 text-center">Registration & Payment</h3>
            
            {/* Registration Steps */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-[#192345] rounded-xl p-6 border border-[#6aa5ff]/20 hover:border-[#6aa5ff]/40 transition-all">
                <div className="w-12 h-12 bg-[#6aa5ff]/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-[#6aa5ff]" />
                </div>
                <div className="text-sm text-[#6aa5ff] font-semibold mb-2">STEP 1</div>
                <h4 className="font-bold text-lg mb-2">Form Your Team</h4>
                <p className="text-white/70 text-sm">
                  Create or join a team of 1-3 members. Choose your team name and assign roles.
                </p>
              </div>

              <div className="bg-[#192345] rounded-xl p-6 border border-[#6aa5ff]/20 hover:border-[#6aa5ff]/40 transition-all">
                <div className="w-12 h-12 bg-[#6aa5ff]/10 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-[#6aa5ff]" />
                </div>
                <div className="text-sm text-[#6aa5ff] font-semibold mb-2">STEP 2</div>
                <h4 className="font-bold text-lg mb-2">Complete Payment</h4>
                <p className="text-white/70 text-sm">
                  Pay the registration fee of ₹2000 per team via UPI, QR code, or bank transfer.
                </p>
              </div>

              <div className="bg-[#192345] rounded-xl p-6 border border-[#6aa5ff]/20 hover:border-[#6aa5ff]/40 transition-all">
                <div className="w-12 h-12 bg-[#6aa5ff]/10 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-[#6aa5ff]" />
                </div>
                <div className="text-sm text-[#6aa5ff] font-semibold mb-2">STEP 3</div>
                <h4 className="font-bold text-lg mb-2">Confirmation</h4>
                <p className="text-white/70 text-sm">
                  Receive confirmation email with your team ID and access to the competition portal.
                </p>
              </div>
            </div>

            {/* Registration Details & Payment Options */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Registration Details */}
              <div className="bg-[#192345] rounded-2xl p-8 border border-[#6aa5ff]/20">
                <h4 className="font-bold text-2xl mb-6">Registration Details</h4>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#6aa5ff]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <IndianRupee className="h-4 w-4 text-[#6aa5ff]" />
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-1">Registration Fee</div>
                      <div className="text-white/70">
                        ₹1 per team <span className="text-xs text-[#6aa5ff]">(Demo Amount)</span>
                      </div>
                      <div className="text-xs text-white/50 mt-1">Actual: ₹2000 per team</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#6aa5ff]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-[#6aa5ff]" />
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-1">Team Size</div>
                      <div className="text-white/70">1-3 members per team</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#6aa5ff]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-[#6aa5ff]" />
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-1">Deadline</div>
                      <div className="text-white/70">30th December 2025</div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#6aa5ff]/5 border border-[#6aa5ff]/20 rounded-xl p-4 mb-6">
                  <div className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    What&apos;s Included
                  </div>
                  <ul className="space-y-2 text-white/70 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      Free Accommodation at NIT Silchar
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      Gala Dinner & Refreshments
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      Certificate of Participation
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      Access to All Competition Rounds
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      Mentorship from Industry Experts
                    </li>
                  </ul>
                </div>

                <Link href="/auth/register">
                  <Button className="w-full bg-[#6aa5ff] hover:bg-[#5a95ef] text-white font-semibold py-6 text-lg">
                    Register Your Team Now
                  </Button>
                </Link>
              </div>

              {/* Payment Options */}
              <div className="bg-[#192345] rounded-2xl p-8 border border-[#6aa5ff]/20">
                <h4 className="font-bold text-2xl mb-6">Payment Options</h4>

                {/* UPI Payment */}
                <div className="bg-[#0f1729] rounded-xl p-6 mb-4 border border-[#6aa5ff]/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#6aa5ff]/10 rounded-full flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-[#6aa5ff]" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">UPI Payment</div>
                      <div className="text-sm text-white/60">Instant & Secure</div>
                    </div>
                  </div>
                  <div className="bg-[#192345] rounded-lg p-4 font-mono text-sm">
                    <div className="text-white/60 mb-1">UPI ID:</div>
                    <div className="text-[#6aa5ff] font-semibold">hackathon@nits.sbi</div>
                    <div className="text-xs text-green-400 mt-2">✓ Pay ₹1 to register</div>
                  </div>
                </div>

                {/* QR Code Payment */}
                <div className="bg-[#0f1729] rounded-xl p-6 mb-4 border border-[#6aa5ff]/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#6aa5ff]/10 rounded-full flex items-center justify-center">
                      <QrCode className="h-5 w-5 text-[#6aa5ff]" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Scan QR Code</div>
                      <div className="text-sm text-white/60">Google Pay, PhonePe, Paytm</div>
                    </div>
                  </div>
                  <div className="bg-[#192345] rounded-lg p-4 flex justify-center">
                    <div className="w-40 h-40 bg-white rounded-lg flex items-center justify-center">
                      <div className="text-center text-[#192345] text-xs p-2">
                        [QR Code Here]<br/>Scan to Pay<br/>₹1<br/>
                        <span className="text-[10px] text-gray-500">(Demo)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Transfer */}
                <div className="bg-[#0f1729] rounded-xl p-6 border border-[#6aa5ff]/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#6aa5ff]/10 rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-[#6aa5ff]" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Bank Transfer</div>
                      <div className="text-sm text-white/60">NEFT/RTGS/IMPS</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-[#6aa5ff]/10">
                      <span className="text-white/60">Account Name:</span>
                      <span className="text-white font-semibold">NIT Silchar Hackathon</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#6aa5ff]/10">
                      <span className="text-white/60">Account Number:</span>
                      <span className="text-white font-mono">40404040404040</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#6aa5ff]/10">
                      <span className="text-white/60">Bank:</span>
                      <span className="text-white">State Bank of India</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#6aa5ff]/10">
                      <span className="text-white/60">Branch:</span>
                      <span className="text-white">NIT Silchar Campus</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-white/60">IFSC Code:</span>
                      <span className="text-white font-mono">SBIN0007061</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="text-sm text-yellow-400">
                    <strong>Important:</strong> After payment, save the transaction ID and upload the receipt during registration.
                  </div>
                </div>
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
