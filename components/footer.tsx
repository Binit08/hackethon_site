export default function Footer() {
  return (
    <footer className="w-full bg-[#0b1220] text-white/90 py-10 border-t border-white/10">
      <div className="container mx-auto px-4 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <span className="text-lg font-bold tracking-wide">Hackathon Portal</span>
            <span className="text-sm text-white/60">&copy; {new Date().getFullYear()} NIT Silchar</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="/" className="hover:text-[#6aa5ff] transition-colors">Homepage</a>
            <a href="/leaderboard" className="hover:text-[#6aa5ff] transition-colors">Leaderboard</a>
            <a href="/faq" className="hover:text-[#6aa5ff] transition-colors">FAQ</a>
            <a href="mailto:noreply@hackathon.nits.ac.in" className="hover:text-[#6aa5ff] transition-colors">Contact</a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
          <span className="text-xs text-white/60">Made with <span className="text-[#ff6ab0]">&hearts;</span> by Team NITS</span>
          <span className="text-xs text-white/50">Powered by Next.js, Tailwind CSS, Judge0, MongoDB</span>
        </div>
      </div>
    </footer>
  )
}
