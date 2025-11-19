/**
 * Client-side CSRF token helper (Comment 7)
 * 
 * Usage:
 * import { getCsrfToken } from '@/lib/csrf-client'
 * 
 * fetch('/api/endpoint', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'x-csrf-token': getCsrfToken() || ''
 *   },
 *   body: JSON.stringify(data)
 * })
 */

/**
 * Get CSRF token from cookies on the client side
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'csrf-token') {
      return value
    }
  }
  return null
}

/**
 * Add CSRF token to fetch options
 * Automatically adds the token for POST/PUT/DELETE/PATCH requests
 */
export function withCsrfToken(options: RequestInit = {}): RequestInit {
  const method = options.method?.toUpperCase() || 'GET'
  
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return options
  }

  const token = getCsrfToken()
  if (!token) {
    console.warn('CSRF token not found in cookies')
    return options
  }

  return {
    ...options,
    headers: {
      ...options.headers,
      'x-csrf-token': token,
    },
  }
}
