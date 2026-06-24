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

export const formatCurrencyBasedOnCurrentLanguage = (value) => {
  if (value == null || Number.isNaN(Number(value))) return ''

  const language = getCurrentLanguage()
  return new Intl.NumberFormat(localeByLanguage[language] || localeByLanguage.en, {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value))
}
