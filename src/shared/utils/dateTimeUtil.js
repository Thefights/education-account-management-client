import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'
import { getLocalDateFromServerDateTime } from './formatDateUtil'

dayjs.extend(utc)
dayjs.extend(timezone)

const SINGAPORE_TIME_ZONE = 'Asia/Singapore'

const LANGUAGE_TIME_ZONES = {
  en: SINGAPORE_TIME_ZONE,
  vi: 'Asia/Ho_Chi_Minh',
  zh: 'Asia/Shanghai',
}

const getCurrentLanguage = () => {
  let language = localStorage.getItem('language') || 'en'
  try {
    language = JSON.parse(language)
  } catch {
    /* empty */
  }

  return language
}

const getTimeZoneBasedOnCurrentLanguage = () =>
  LANGUAGE_TIME_ZONES[getCurrentLanguage()] || SINGAPORE_TIME_ZONE

export const getCurrentDateBasedOnCurrentLanguage = () =>
  dayjs().tz(getTimeZoneBasedOnCurrentLanguage()).format('YYYY-MM-DD')

const getWallTimeBasedOnCurrentLanguage = (value) => {
  if (!value) return null
  const date = dayjs(value)
  if (!date.isValid()) return null
  const dateHour = date.minute(0).second(0).millisecond(0)
  return dayjs.tz(dateHour.format('YYYY-MM-DDTHH:mm:ss.SSS'), getTimeZoneBasedOnCurrentLanguage())
}

export const toLocalDateTimeInput = (value) => {
  if (!value) return ''
  const date = dayjs(getLocalDateFromServerDateTime(value))
  return date.isValid() ? date.format('YYYY-MM-DDTHH:mm') : ''
}

/** Treats date/time components as browser-local time and returns an ISO instant. */
export const localDateTimeToIso = (value) => {
  if (!value) return ''
  const date = dayjs(value)
  return date.isValid() ? date.toISOString() : ''
}

export const toLocalPickerValue = (value) => {
  if (!value) return null
  const date = dayjs(getLocalDateFromServerDateTime(value))
  return date.isValid() ? date : null
}

export const isDateTimeBefore = (earlier, later) => {
  if (!earlier || !later) return false
  const earlierDate = dayjs(earlier)
  const laterDate = dayjs(later)
  return earlierDate.isValid() && laterDate.isValid() && earlierDate.isBefore(laterDate)
}

/** Treats the supplied date/hour components as the current language's wall time. */
export const wallTimeBasedOnCurrentLanguageToIso = (value) =>
  getWallTimeBasedOnCurrentLanguage(value)?.toISOString() || ''

/** Converts a backend instant to a Day.js value displayed in the current language's timezone. */
export const toPickerValueBasedOnCurrentLanguage = (value) => {
  if (!value) return null
  const date = dayjs(value)
  return date.isValid() ? date.tz(getTimeZoneBasedOnCurrentLanguage()) : null
}

