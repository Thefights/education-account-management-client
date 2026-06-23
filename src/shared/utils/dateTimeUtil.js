import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'

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

export const formatSingaporeDateTime = (value, format = 'DD/MM/YYYY HH:mm') => {
  if (!value) return ''
  const date = dayjs(value)
  const resolvedFormat = typeof format === 'string' ? format : 'DD/MM/YYYY HH:mm'
  return date.isValid() ? date.tz(SINGAPORE_TIME_ZONE).format(resolvedFormat) : ''
}

export const toSingaporeDateTimeInput = (value) =>
  formatSingaporeDateTime(value, 'YYYY-MM-DDTHH:mm')

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

export const isSingaporeDateTimeBefore = (earlier, later) => {
  const earlierDate = getSingaporeWallTime(earlier)
  const laterDate = getSingaporeWallTime(later)
  return !!earlierDate && !!laterDate && earlierDate.isBefore(laterDate)
}
