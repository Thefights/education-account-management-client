import { toast } from 'react-toastify'

const toastCache = new Map()
const TOAST_DEDUPE_TTL_MS = 1500

const showToast = (message, type = 'error') => {
  if (!message) return

  const normalizedMessage = String(message)
  const now = Date.now()
  const cacheKey = `${type}:${normalizedMessage}`
  const lastShownAt = toastCache.get(cacheKey)

  if (lastShownAt && now - lastShownAt < TOAST_DEDUPE_TTL_MS) return

  toastCache.set(cacheKey, now)

  if (type === 'success') {
    toast.success(normalizedMessage)
  } else if (type === 'info') {
    toast.info(normalizedMessage)
  } else if (type === 'warning') {
    toast.warning(normalizedMessage)
  } else {
    toast.error(normalizedMessage)
  }
}

export const showSuccessToast = (message) => showToast(message, 'success')

export const showErrorToast = (message) => showToast(message, 'error')

export const showInfoToast = (message) => showToast(message, 'info')

export const showWarningToast = (message) => showToast(message, 'warning')
