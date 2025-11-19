import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import connectDB from "./mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { 
  isAccountLocked, 
  getLockoutTimeRemaining, 
  recordFailedLogin, 
  clearFailedLogins,
  getRemainingAttempts 
} from "./account-lockout"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Check if account is locked (ERROR #37)
        if (isAccountLocked(credentials.email)) {
          const remainingTime = getLockoutTimeRemaining(credentials.email)
          throw new Error(`Account locked due to too many failed login attempts. Try again in ${Math.ceil(remainingTime / 60)} minutes.`)
        }

        await connectDB()

        const user = await User.findOne({ email: credentials.email })

        if (!user) {
          recordFailedLogin(credentials.email)
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          recordFailedLogin(credentials.email)
          const remaining = getRemainingAttempts(credentials.email)
          if (remaining > 0 && remaining <= 2) {
            throw new Error(`Invalid credentials. ${remaining} attempts remaining before account lockout.`)
          }
          return null
        }

        // Clear failed login attempts on successful login
        clearFailedLogins(credentials.email)

        return {
          id: (user as any)._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
