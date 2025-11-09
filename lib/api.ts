/**
 * Safe fetch wrapper that handles errors and ensures JSON responses
 */
export async function safeFetch(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options)
    
    // Check if response is ok
    if (!response.ok) {
      // Try to parse error as JSON, fallback to text
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const error = await response.json()
        throw new Error(error.error || error.message || `HTTP ${response.status}`)
      } else {
        const text = await response.text()
        throw new Error(text || `HTTP ${response.status}`)
      }
    }
    
    // Ensure response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      const text = await response.text()
      throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 100)}`)
    }
    
    return await response.json()
  } catch (error: any) {
    // Re-throw with more context
    if (error instanceof Error) {
      throw error
    }
    throw new Error(error.message || 'Network request failed')
  }
}

