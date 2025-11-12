import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env file
config({ path: resolve(__dirname, '../.env') })

import connectDB from '../lib/mongodb'
import User from '../models/User'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  try {
    const email = process.argv[2]
    const password = process.argv[3]

    if (!email || !password) {
      console.error('Usage: npm run create-admin <email> <password>')
      process.exit(1)
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      // Update existing user to admin
      existingUser.role = 'ADMIN'
      await existingUser.save()
      console.log(`✅ Updated existing user ${email} to ADMIN role`)
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10)
      
      await User.create({
        name: email.split('@')[0], // Use email prefix as name
        email,
        password: hashedPassword,
        role: 'ADMIN',
      })

      console.log(`✅ Created new ADMIN user: ${email}`)
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin:', error)
    process.exit(1)
  }
}

createAdmin()
