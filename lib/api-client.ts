/**
 * Centralized API client with standardized error handling
 * Implements ERROR #22: Content Type Validation Everywhere
 * Implements ERROR #11: Inconsistent Error Response Format
 * Implements ERROR #26: Session Expiry Not Handled
 */

export interface ApiError {
  code: string
  message: string
  details?: any
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
}

export class ApiClientError extends Error {
  code: string
  details?: any

  constructor(error: ApiError) {
    super(error.message)
    this.name = 'ApiClientError'
    this.code = error.code
    this.details = error.details
  }
}

/**
 * Get CSRF token from cookies
 */
function getCsrfTokenFromCookies(): string | null {
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
 * Safe fetch wrapper with standardized error handling
 */
export async function apiFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    // Get CSRF token for non-GET requests (Comment 7)
    const csrfToken = getCsrfTokenFromCookies()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers as Record<string, string>,
    }

    // Add CSRF token for state-changing requests
    if (csrfToken && options?.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method)) {
      headers['x-csrf-token'] = csrfToken
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle session expiry (401 Unauthorized)
    if (response.status === 401) {
      // Redirect to login page
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`
      }
      throw new ApiClientError({
        code: 'UNAUTHORIZED',
        message: 'Your session has expired. Please sign in again.',
      })
    }

    // Validate content type
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      throw new ApiClientError({
        code: 'INVALID_RESPONSE',
        message: 'Server returned non-JSON response',
      })
    }

    const data = await response.json()

    // Handle error responses
    if (!response.ok) {
      throw new ApiClientError({
        code: data.error?.code || 'API_ERROR',
        message: data.error?.message || data.error || data.message || 'An error occurred',
        details: data.error?.details || data.details,
      })
    }

    return data
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }

    // Network or parsing errors
    throw new ApiClientError({
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Network request failed',
    })
  }
}

/**
 * Standardized error response builder for API routes
 */
export function errorResponse(
  message: string,
  code: string = 'INTERNAL_ERROR',
  status: number = 500,
  details?: any
) {
  return Response.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  )
}

/**
 * Standardized success response builder for API routes
 */
export function successResponse<T = any>(data: T, status: number = 200) {
  return Response.json(
    {
      success: true,
      data,
    },
    { status }
  )
}
