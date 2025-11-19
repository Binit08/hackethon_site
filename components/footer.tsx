export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-blue-50 via-cyan-50 to-sky-50 text-gray-800 py-10 border-t border-blue-200">
      <div className="container mx-auto px-4 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <span className="text-lg font-bold tracking-wide bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 text-transparent bg-clip-text">Hackathon Portal</span>
            <span className="text-sm text-gray-600">&copy; {new Date().getFullYear()} NIT Silchar</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="/" className="hover:text-blue-600 transition-colors">Homepage</a>
            <a href="/leaderboard" className="hover:text-blue-600 transition-colors">Leaderboard</a>
            <a href="/faq" className="hover:text-blue-600 transition-colors">FAQ</a>
            <a href="mailto:noreply@hackathon.nits.ac.in" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-blue-200 pt-6">
          <span className="text-xs text-gray-600">Made with <span className="text-cyan-600">&hearts;</span> by Team NITS</span>
          <span className="text-xs text-gray-500">Powered by Next.js, Tailwind CSS, Judge0, MongoDB</span>
        </div>
      </div>
    </footer>
  )
}
