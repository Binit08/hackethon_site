import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { rateLimit, RATE_LIMITS, getRateLimitIdentifier } from '@/middleware/rate-limit'

// GET face descriptor for a user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Apply rate limiting (Comment 4)
    const identifier = getRateLimitIdentifier(request, session.user.id)
    const rateLimitResponse = rateLimit(RATE_LIMITS.faceDescriptor)(request, identifier)
    if (rateLimitResponse) return rateLimitResponse

    // Verify user can only access their own data unless they are admin
    // Normalize IDs to string for comparison
    const sessionUserId = String(session.user.id)
    const requestedUserId = String(params.id)
    
    if (sessionUserId !== requestedUserId && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - You can only access your own face descriptor' },
        { status: 403 }
      )
    }

    await dbConnect()
    
    const user = await User.findById(params.id).select('faceDescriptor')
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      faceDescriptor: user.faceDescriptor || null
    })

  } catch (error) {
    console.error('Error fetching face descriptor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST/PUT to save face descriptor for a user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Apply rate limiting (Comment 4)
    const identifier = getRateLimitIdentifier(request, session.user.id)
    const rateLimitResponse = rateLimit(RATE_LIMITS.faceDescriptor)(request, identifier)
    if (rateLimitResponse) return rateLimitResponse

    // Verify user can only update their own data unless they are admin
    // Normalize IDs to string for comparison
    const sessionUserId = String(session.user.id)
    const requestedUserId = String(params.id)
    
    if (sessionUserId !== requestedUserId && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - You can only update your own face descriptor' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { faceDescriptor } = body

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return NextResponse.json(
        { error: 'Invalid face descriptor' },
        { status: 400 }
      )
    }

    // Validate face descriptor is exactly 128 numbers with proper ranges
    if (faceDescriptor.length !== 128 || !faceDescriptor.every(n => typeof n === 'number')) {
      return NextResponse.json(
        { error: 'Face descriptor must be an array of exactly 128 numbers' },
        { status: 400 }
      )
    }

    // Validate each value is finite and in valid range [-1, 1]
    for (let i = 0; i < faceDescriptor.length; i++) {
      const val = faceDescriptor[i]
      if (!Number.isFinite(val)) {
        return NextResponse.json(
          { error: `Face descriptor contains non-finite value at index ${i}` },
          { status: 400 }
        )
      }
      if (val < -1 || val > 1) {
        return NextResponse.json(
          { error: `Face descriptor value out of range [-1, 1] at index ${i}` },
          { status: 400 }
        )
      }
    }

    await dbConnect()
    
    const user = await User.findByIdAndUpdate(
      params.id,
      { faceDescriptor },
      { new: true }
    )
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Face descriptor saved successfully'
    })

  } catch (error) {
    console.error('Error saving face descriptor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
