/**
 * Rate limiting middleware
 * Implements ERROR #12: Missing Rate Limiting
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitStore>()

export interface RateLimitConfig {
  windowMs: number  // Time window in milliseconds
  maxRequests: number  // Max requests per window
}

/**
 * Rate limit middleware
 */
export function rateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests } = config

  return (req: NextRequest, identifier: string): NextResponse | null => {
    const now = Date.now()
    const key = identifier

    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      const keysToDelete: string[] = []
      rateLimitStore.forEach((v, k) => {
        if (now > v.resetTime) {
          keysToDelete.push(k)
        }
      })
      keysToDelete.forEach(k => rateLimitStore.delete(k))
    }

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key)

    if (!entry || now > entry.resetTime) {
      // Create new entry
      entry = {
        count: 0,
        resetTime: now + windowMs,
      }
      rateLimitStore.set(key, entry)
    }

    // Increment count
    entry.count++

    // Check if rate limited
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            details: {
              retryAfter,
            },
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
          },
        }
      )
    }

    // Set rate limit headers
    const remaining = maxRequests - entry.count

    // Return null to continue (attach headers to response in route handler)
    return null
  }
}

/**
 * Get rate limit identifier from request
 */
export function getRateLimitIdentifier(req: NextRequest, userId?: string): string {
  // Use user ID if available, otherwise use IP
  if (userId) {
    return `user:${userId}`
  }

  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
  return `ip:${ip}`
}

/**
 * Predefined rate limit configs
 */
export const RATE_LIMITS = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 per 15 min
  api: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 per minute
  submission: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute
  faceDescriptor: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 per minute
}
