import { toLocalPickerValue } from '@/shared/utils/dateTimeUtil'
import dayjs from 'dayjs'

export const getScheduleExecutionAt = (data = {}) => {
  if (data.oneTimeExecutionAt) return toLocalPickerValue(data.oneTimeExecutionAt)

  const [hour = 0, minute = 0, second = 0] = String(data.executionTime || '00:00:00')
    .split(':')
    .map((value) => Number(value))
  const now = dayjs()
  const month = Number(data.executeAtMonth) || 1
  const day = Number(data.executeAtDay) || now.date()

  return dayjs()
    .month(month - 1)
    .date(day)
    .hour(hour)
    .minute(minute)
    .second(second)
}
