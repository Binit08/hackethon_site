export default function Round3InfoPage() {
  return (
    <div className="min-h-screen bg-[#151c2e] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(87,97,255,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,75,149,0.12),transparent_55%)]" />
      </div>
      <div className="absolute inset-0 bg-white/0 backdrop-blur-[2px]" />

      <main className="relative z-10 container mx-auto px-4 max-w-3xl py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Round 3: Final (Offline)</h1>
        <p className="text-[#6aa5ff] text-lg font-medium mb-8">Venue: NIT Silchar, Assam • February 2026 (Last Week)</p>

        <div className="space-y-6">
          <div className="bg-[#192345] border border-[#6aa5ff]/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-2">Access</h2>
            <p className="text-white/80">This round is conducted offline at the NIT Silchar campus. Only shortlisted teams from Round 2 will participate. The online portal provides test data and information only.</p>
          </div>
          <div className="bg-[#192345] border border-[#6aa5ff]/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-2">What to Expect</h2>
            <ul className="list-disc list-inside text-white/80 space-y-1">
              <li>Real-time problem statements</li>
              <li>On-site validation and evaluation</li>
              <li>Test datasets and guidelines available on arrival</li>
            </ul>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 text-yellow-300">
            Note: This page is informational. There is no online submission for Round 3.
          </div>
        </div>
      </main>
    </div>
  )
}
