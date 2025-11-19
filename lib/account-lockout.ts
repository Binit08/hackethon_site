/**
 * Account lockout tracking for failed login attempts
 * Implements ERROR #37: No Account Lockout
 */

interface LoginAttempt {
  count: number
  lastAttempt: number
  lockedUntil?: number
}

// In-memory store (use Redis in production)
const loginAttempts = new Map<string, LoginAttempt>()

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000 // 15 minute window

/**
 * Check if account is locked
 */
export function isAccountLocked(email: string): boolean {
  const attempt = loginAttempts.get(email)
  
  if (!attempt) {
    return false
  }

  // Check if still locked
  if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
    return true
  }

  // Lock expired, reset
  if (attempt.lockedUntil && Date.now() >= attempt.lockedUntil) {
    loginAttempts.delete(email)
    return false
  }

  return false
}

/**
 * Get remaining lockout time in seconds
 */
export function getLockoutTimeRemaining(email: string): number {
  const attempt = loginAttempts.get(email)
  
  if (!attempt || !attempt.lockedUntil) {
    return 0
  }

  const remaining = Math.max(0, attempt.lockedUntil - Date.now())
  return Math.ceil(remaining / 1000)
}

/**
 * Record failed login attempt
 */
export function recordFailedLogin(email: string): void {
  const now = Date.now()
  const attempt = loginAttempts.get(email)

  if (!attempt) {
    // First failed attempt
    loginAttempts.set(email, {
      count: 1,
      lastAttempt: now,
    })
    return
  }

  // Check if attempt window has expired
  if (now - attempt.lastAttempt > ATTEMPT_WINDOW_MS) {
    // Reset counter
    loginAttempts.set(email, {
      count: 1,
      lastAttempt: now,
    })
    return
  }

  // Increment counter
  attempt.count++
  attempt.lastAttempt = now

  // Lock account if max attempts reached
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_DURATION_MS
  }

  loginAttempts.set(email, attempt)
}

/**
 * Clear failed login attempts (on successful login)
 */
export function clearFailedLogins(email: string): void {
  loginAttempts.delete(email)
}

/**
 * Get remaining attempts before lockout
 */
export function getRemainingAttempts(email: string): number {
  const attempt = loginAttempts.get(email)
  
  if (!attempt) {
    return MAX_ATTEMPTS
  }

  // If locked, return 0
  if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
    return 0
  }

  return Math.max(0, MAX_ATTEMPTS - attempt.count)
}

/**
 * Cleanup expired entries (call periodically)
 */
export function cleanupExpiredLockouts(): void {
  const now = Date.now()
  const keysToDelete: string[] = []
  
  loginAttempts.forEach((attempt, email) => {
    // Remove if attempt window expired and not locked
    if (!attempt.lockedUntil && now - attempt.lastAttempt > ATTEMPT_WINDOW_MS) {
      keysToDelete.push(email)
      return
    }
    
    // Remove if lockout expired
    if (attempt.lockedUntil && now > attempt.lockedUntil) {
      keysToDelete.push(email)
    }
  })
  
  keysToDelete.forEach(email => loginAttempts.delete(email))
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredLockouts, 5 * 60 * 1000)
}
