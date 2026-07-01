const getCurrentLanguage = () => {
  let language = localStorage.getItem('language') || 'en'
  try {
    language = JSON.parse(language)
  } catch {
    /* empty */
  }

  return language
}

export const getDateHourFormatBasedOnCurrentLanguage = () => {
  switch (getCurrentLanguage()) {
    case 'vi':
    case 'zh':
      return 'D/M/YYYY HH'
    case 'en':
    default:
      return 'M/D/YYYY HH'
  }
}

export const formatDateBasedOnCurrentLanguage = (date) => {
  if (!date) return ''

  const language = getCurrentLanguage()
  switch (language) {
    case 'en':
      return formatDateToMMDDYYYY(date)
    case 'vi':
      return formatDateToDDMMYYYY(date)
    case 'zh':
      return formatDateToDDMMYYYY(date)
    default:
      return formatDateToMMDDYYYY(date)
  }
}

export const formatDatetimeStringBasedOnCurrentLanguage = (datetime) => {
  const language = getCurrentLanguage()

  switch (language) {
    case 'en':
      return formatDatetimeToMMDDYYYY(datetime)
    case 'vi':
      return formatDatetimeToDDMMYYYY(datetime)
    case 'zh':
      return formatDatetimeToDDMMYYYY(datetime)
    default:
      return formatDatetimeToMMDDYYYY(datetime)
  }
}

const hasTimezoneOffset = (value) => /(?:z|[+-]\d{2}:?\d{2})$/i.test(value)

const normalizeServerDateTime = (value) => {
  if (!value || value instanceof Date) return value
  if (typeof value !== 'string') return value

  const trimmed = value.trim()
  if (!trimmed) return trimmed

  if (hasTimezoneOffset(trimmed)) return trimmed
  if (/^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)?$/.test(trimmed)) {
    return `${trimmed.replace(' ', 'T')}Z`
  }

  return trimmed
}

export const getLocalDateFromServerDateTime = (datetimeString) => {
  if (!datetimeString) return null

  const date = new Date(normalizeServerDateTime(datetimeString))
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDatetimeToDDMMYYYY = (datetimeString) => {
  if (!datetimeString) return ''

  const date = getLocalDateFromServerDateTime(datetimeString)
  if (!date) return ''

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`
}

const formatDatetimeToMMDDYYYY = (datetimeString) => {
  if (!datetimeString) return ''

  const date = getLocalDateFromServerDateTime(datetimeString)
  if (!date) return ''

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${hours}:${minutes}:${seconds} ${month}/${day}/${year}`
}

export const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const day = String(date?.getDate()).padStart(2, '0')
  const month = String(date?.getMonth() + 1).padStart(2, '0')
  const year = date?.getFullYear()

  return `${day}/${month}/${year}`
}

const formatDateToMMDDYYYY = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const day = String(date?.getDate()).padStart(2, '0')
  const month = String(date?.getMonth() + 1).padStart(2, '0')
  const year = date?.getFullYear()

  return `${month}/${day}/${year}`
}

