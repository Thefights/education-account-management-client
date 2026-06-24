import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'
import { getLocalDateFromServerDateTime } from './formatDateUtil'

dayjs.extend(utc)
dayjs.extend(timezone)

export const SINGAPORE_TIME_ZONE = 'Asia/Singapore'

export const getCurrentSingaporeDate = () => dayjs().tz(SINGAPORE_TIME_ZONE).format('YYYY-MM-DD')

const getSingaporeWallTime = (value) => {
  if (!value) return null
  const date = dayjs(value)
  if (!date.isValid()) return null
  return dayjs.tz(date.format('YYYY-MM-DDTHH:mm:ss.SSS'), SINGAPORE_TIME_ZONE)
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

export const isDateTimeBefore = (earlier, later) => {
  if (!earlier || !later) return false
  const earlierDate = dayjs(earlier)
  const laterDate = dayjs(later)
  return earlierDate.isValid() && laterDate.isValid() && earlierDate.isBefore(laterDate)
}

/** Treats the supplied date/time components as Singapore wall time and returns an ISO instant. */
export const singaporeWallTimeToIso = (value) => getSingaporeWallTime(value)?.toISOString() || ''

/** Converts a backend instant to a Day.js value displayed in Singapore time. */
export const toSingaporePickerValue = (value) => {
  if (!value) return null
  const date = dayjs(value)
  return date.isValid() ? date.tz(SINGAPORE_TIME_ZONE) : null
}

/** Creates a time-only picker value whose business timezone is Singapore. */
export const toSingaporeTimePickerValue = (value = '00:00:00') =>
  dayjs.tz(`2000-01-01T${value}`, SINGAPORE_TIME_ZONE)
