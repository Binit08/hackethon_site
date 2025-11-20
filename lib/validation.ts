/**
 * Shared validation utilities
 * Implements ERROR #41: Team Name Validation Inconsistent
 * Implements ERROR #36: Password Requirements Not Enforced
 * Implements ERROR #3: Unvalidated Face Descriptor Data
 */

/**
 * Validate team name format
 */
export function validateTeamName(teamName: string): { valid: boolean; error?: string } {
  const normalized = String(teamName).replace(/\s+/g, ' ').trim()
  
  if (normalized.length < 3 || normalized.length > 30) {
    return {
      valid: false,
      error: 'Team name must be between 3 and 30 characters',
    }
  }

  const regex = /^[A-Za-z][A-Za-z0-9\- ]{1,28}[A-Za-z0-9]$/
  if (!regex.test(normalized)) {
    return {
      valid: false,
      error: 'Team name must start with a letter and contain only letters, numbers, spaces, or hyphens',
    }
  }

  return { valid: true }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; error?: string; strength?: number } {
  if (password.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters long',
      strength: 0,
    }
  }

  let strength = 0
  const checks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  // Calculate strength (0-5)
  Object.values(checks).forEach(check => {
    if (check) strength++
  })

  // Require at least 3 out of 5 criteria
  if (strength < 3) {
    return {
      valid: false,
      error: 'Password must contain at least 3 of: uppercase, lowercase, number, special character, or be 12+ chars',
      strength,
    }
  }

  // Check against common passwords
  const commonPasswords = [
    'password', '12345678', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '123456789',
  ]
  if (commonPasswords.includes(password.toLowerCase())) {
    return {
      valid: false,
      error: 'Password is too common. Please choose a stronger password',
      strength,
    }
  }

  return { valid: true, strength }
}

/**
 * Validate face descriptor
 */
export function validateFaceDescriptor(descriptor: any): { valid: boolean; error?: string } {
  if (!Array.isArray(descriptor)) {
    return {
      valid: false,
      error: 'Face descriptor must be an array',
    }
  }

  if (descriptor.length !== 128) {
    return {
      valid: false,
      error: 'Face descriptor must contain exactly 128 numbers',
    }
  }

  // Check each value is a valid number in range [-1, 1]
  for (let i = 0; i < descriptor.length; i++) {
    const val = descriptor[i]
    
    if (typeof val !== 'number') {
      return {
        valid: false,
        error: `Face descriptor element at index ${i} is not a number`,
      }
    }

    if (!Number.isFinite(val)) {
      return {
        valid: false,
        error: `Face descriptor element at index ${i} is not finite (NaN or Infinity)`,
      }
    }

    // Normalized embeddings should be in range [-1, 1]
    if (val < -1 || val > 1) {
      return {
        valid: false,
        error: `Face descriptor element at index ${i} is out of range [-1, 1]: ${val}`,
      }
    }
  }

  return { valid: true }
}

/**
 * Sanitize HTML content to prevent XSS
 * Simple server-side sanitizer that strips all HTML tags except allowed ones
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''
  
  // First, escape all HTML
  let sanitized = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
  
  // Then, restore allowed tags (convert back to < and >)
  const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre']
  allowedTags.forEach(tag => {
    // Opening tags (without attributes)
    sanitized = sanitized.replace(
      new RegExp(`&lt;(${tag})&gt;`, 'gi'),
      '<$1>'
    )
    // Closing tags
    sanitized = sanitized.replace(
      new RegExp(`&lt;/(${tag})&gt;`, 'gi'),
      '</$1>'
    )
  })
  
  return sanitized
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(email)) {
    return {
      valid: false,
      error: 'Invalid email format',
    }
  }
  return { valid: true }
}

/**
 * Validate problem fields
 */
export function validateProblem(problem: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!problem.title || problem.title.trim().length === 0) {
    errors.push('Title is required')
  }

  if (!problem.description || problem.description.trim().length === 0) {
    errors.push('Description is required')
  }

  if (typeof problem.points !== 'number' || problem.points <= 0) {
    errors.push('Points must be a positive number')
  }

  if (problem.type === 'CODING') {
    if (typeof problem.timeLimit !== 'number' || problem.timeLimit <= 0) {
      errors.push('Time limit must be a positive number')
    }

    if (typeof problem.memoryLimit !== 'number' || problem.memoryLimit <= 0) {
      errors.push('Memory limit must be a positive number')
    }

    if (!problem.sampleInput || problem.sampleInput.trim().length === 0) {
      errors.push('Sample input is required for coding problems')
    }

    if (!problem.sampleOutput || problem.sampleOutput.trim().length === 0) {
      errors.push('Sample output is required for coding problems')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
