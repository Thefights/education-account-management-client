const localeByLanguage = {
  en: 'en-SG',
  vi: 'vi-VN',
  zh: 'zh-CN',
}

const getCurrentLanguage = () => {
  const storedLanguage = localStorage.getItem('language') || 'en'
  try {
    return JSON.parse(storedLanguage)
  } catch {
    return storedLanguage
  }
}

export const formatCurrencyBasedOnCurrentLanguage = (value, options = {}) => {
  const { fallback = 'N/A', sign } = options
  const amount = Number(value)
  if (value == null || Number.isNaN(amount)) return fallback

  const language = getCurrentLanguage()
  const formattedAmount = new Intl.NumberFormat(localeByLanguage[language] || localeByLanguage.en, {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))

  if (sign === 'credit') return `+${formattedAmount}`
  if (sign === 'debit') return `-${formattedAmount}`
  return formattedAmount
}

export const getCurrencySymbolBasedOnCurrentLanguage = () => {
  const language = getCurrentLanguage()
  const parts = new Intl.NumberFormat(localeByLanguage[language] || localeByLanguage.en, {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).formatToParts(0)
  return parts.find((part) => part.type === 'currency')?.value || '$'
}
