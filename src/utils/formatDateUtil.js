export const formatDateBasedOnCurrentLanguage = (date) => {
  if (!date) return ''
  let language = localStorage.getItem('language') || 'en'
  language = JSON.parse(language)
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

export const formatDateAndTimeBasedOnCurrentLanguage = (date, time = null) => {
  if (!date) return ''

  let language = localStorage.getItem('language') || 'en'
  try {
    language = JSON.parse(language)
  } catch {
    /* empty */
  }

  if (time) {
    const datetime = `${date} ${time}`
    return formatDatetimeStringBasedOnCurrentLanguage(datetime)
  }

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
  let language = localStorage.getItem('language') || 'en'
  try {
    language = JSON.parse(language)
  } catch {
    /* empty */
  }

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

// Format DateTime -> 14:30:15 24/05/2024
export const formatDatetimeToDDMMYYYY = (datetimeString) => {
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

// Format DateTime -> 14:30:15 05/24/2024
export const formatDatetimeToMMDDYYYY = (datetimeString) => {
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

// Format Date -> Fri, 24 May 2024
export const formatDateWithWeekDay = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  return date?.toLocaleDateString('en-GB', options)
}

// Format Date -> 24 May 2024
export const formatDateWithLetterMonth = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }
  return date?.toLocaleDateString('en-GB', options)
}

// Format Date -> 24/05/2024
export const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const day = String(date?.getDate()).padStart(2, '0')
  const month = String(date?.getMonth() + 1).padStart(2, '0')
  const year = date?.getFullYear()

  return `${day}/${month}/${year}`
}

// Format Date -> 05/24/2024
export const formatDateToMMDDYYYY = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const day = String(date?.getDate()).padStart(2, '0')
  const month = String(date?.getMonth() + 1).padStart(2, '0')
  const year = date?.getFullYear()

  return `${month}/${day}/${year}`
}

// Format Date -> 2024-05-24
export const formatDateToSqlDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const day = String(date?.getDate()).padStart(2, '0')
  const month = String(date?.getMonth() + 1).padStart(2, '0')
  const year = date?.getFullYear()

  return `${year}-${month}-${day}`
}

export const getCurrentMonthRange = () => {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    fromDate: formatDateToSqlDate(firstDay),
    toDate: formatDateToSqlDate(lastDay),
  }
}

// Format Date -> 2024-05-24T00:00:00
export const formatDateToDateTime = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const day = String(date?.getDate()).padStart(2, '0')
  const month = String(date?.getMonth() + 1).padStart(2, '0')
  const year = date?.getFullYear()

  return `${year}-${month}-${day}T00:00:00`
}

// Format Time -> 14:30
export const formatTimeToHourMinute = (time) => {
  if (!time) return ''
  const timeStr = String(time)
  const [hour = '00', minute = '00'] = timeStr.split(':')
  return `${hour}:${minute}`
}

export const formatDateTimeToTimeOnly = (dateTime) => {
  if (!dateTime) return ''

  const date = getLocalDateFromServerDateTime(dateTime)
  if (!date) return ''

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export const mergeDateAndTime = (dateTime, timeValue) => {
  if (!dateTime || !timeValue) return null

  const date = new Date(dateTime)
  if (Number.isNaN(date.getTime())) return null

  const [hours, minutes] = String(timeValue)
    .split(':')
    .map((value) => Number(value))

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null

  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

// Others
export const formatDateKey = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const parseDateKey = (dateStr) => {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}
