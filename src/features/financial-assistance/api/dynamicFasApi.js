import { getEnv } from '@/shared/config/envConfig'

const dynamicFasApiBaseUrl = getEnv(
  'VITE_DYNAMIC_FAS_API_BASE_URL',
  'http://127.0.0.1:8001'
).replace(/\/$/, '')

const request = async (path, payload) => {
  const response = await fetch(`${dynamicFasApiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let detail = `AI service returned error ${response.status}`
    try {
      const body = await response.json()
      if (typeof body?.detail === 'string') detail = body.detail
    } catch {
      // Keep the status-based fallback when the response is not JSON.
    }
    throw new Error(detail)
  }

  return response.json()
}

export const chatWithDynamicFas = (payload) =>
  request('/dynamic-fas/chat', payload)

export const resetDynamicFasSession = (sessionId) =>
  request('/dynamic-fas/reset-session', { session_id: sessionId })

