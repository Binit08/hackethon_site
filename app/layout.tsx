import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/toaster"
import { ConditionalNavbar } from "@/components/conditional-navbar"
import { ConditionalFooter } from "@/components/conditional-footer"
import ErrorBoundary from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hackathon 2026 Portal - NIT Silchar",
  description: "Official portal for Hackathon 2026 at NIT Silchar",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <ConditionalNavbar />
            {children}
            <ConditionalFooter />
            <Toaster />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}

