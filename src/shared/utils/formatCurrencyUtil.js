const localeByLanguage = {
  en: 'en-SG',
  vi: 'vi-VN',
  zh: 'zh-CN',
}

const currencyCode = 'SGD'

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
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))
  const formattedCurrency = `${currencyCode} ${formattedAmount}`

  if (sign === 'credit') return `+${formattedCurrency}`
  if (sign === 'debit') return `-${formattedCurrency}`
  return formattedCurrency
}

export const getCurrencySymbolBasedOnCurrentLanguage = () => {
  return currencyCode
}
