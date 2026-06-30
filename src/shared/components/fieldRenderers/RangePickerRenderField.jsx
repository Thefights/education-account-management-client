import useTranslation from '@/shared/hooks/useTranslation'
import {
  toPickerValueBasedOnCurrentLanguage,
  wallTimeBasedOnCurrentLanguageToIso,
} from '@/shared/utils/dateTimeUtil'
import { getDateHourFormatBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { getObjectValueFromStringPath } from '@/shared/utils/handleObjectUtil'
import { CalendarOutlined } from '@ant-design/icons'
import { DatePicker, Form, Typography } from 'antd'
import dayjs from 'dayjs'
import { forwardRef, useImperativeHandle, useState } from 'react'

const defaultDateParser = (value) => {
  if (!value) return null
  const date = dayjs(value)
  return date.isValid() ? date : null
}

const defaultDateSerializer = (value) => value?.format('YYYY-MM-DD') || ''

const languageDateTimeParser = (value) => toPickerValueBasedOnCurrentLanguage(value)
const languageDateTimeSerializer = (value) => wallTimeBasedOnCurrentLanguageToIso(value)
const defaultDateHourShowTime = { format: 'HH', showMinute: false, showSecond: false }

const resolveRangeValue = ({ fromValue, toValue, parseValue }) => {
  if (!fromValue && !toValue) return null
  return [parseValue(fromValue), parseValue(toValue)]
}

const RangePickerRenderField = ({ field, values, setField }, ref) => {
  const { t } = useTranslation()
  const [error, setError] = useState('')

  const from = field.from || {}
  const to = field.to || {}
  const fromKey = from.key || 'fromDate'
  const toKey = to.key || 'toDate'
  const fromValue = getObjectValueFromStringPath(values, fromKey)
  const toValue = getObjectValueFromStringPath(values, toKey)
  const valueType = field.valueType || 'date'
  const parseValue =
    field.parseValue ||
    (valueType === 'language-datetime' ? languageDateTimeParser : defaultDateParser)
  const serializeValue =
    field.serializeValue ||
    (valueType === 'language-datetime' ? languageDateTimeSerializer : defaultDateSerializer)
  const showTime =
    field.showTime !== undefined
      ? field.showTime
      : valueType === 'language-datetime'
        ? defaultDateHourShowTime
        : undefined
  const format =
    field.format !== undefined
      ? field.format
      : valueType === 'language-datetime'
        ? getDateHourFormatBasedOnCurrentLanguage()
        : undefined
  const isHourOnlyPicker =
    typeof showTime === 'object' &&
    showTime.showMinute === false &&
    showTime.showSecond === false

  const validate = (nextFrom = fromValue, nextTo = toValue) => {
    const fromDate = nextFrom && dayjs(nextFrom)
    const toDate = nextTo && dayjs(nextTo)
    let result = true

    if (field.disallowFutureFrom && fromDate && fromDate.isAfter(dayjs())) {
      result = field.fromFutureMessage || t('audit_log.validation.from_date_not_future')
    } else if (field.validateOrder !== false && fromDate && toDate && toDate.isBefore(fromDate)) {
      result = field.orderMessage || t('audit_log.validation.to_date_before_from_date')
    } else if (typeof field.validateRange === 'function') {
      result = field.validateRange(nextFrom, nextTo, values)
    }

    const message = typeof result === 'string' ? result : ''
    setError(message)
    return result === true || result === undefined || result === ''
  }

  useImperativeHandle(ref, () => ({
    validate: () => validate(),
    resetValidation: () => setError(''),
  }))

  const handleChange = (range) => {
    const nextFrom = serializeValue(range?.[0])
    const nextTo = serializeValue(range?.[1])

    setField(fromKey, nextFrom)
    setField(toKey, nextTo)
    validate(nextFrom, nextTo)
  }

  return (
    <div>
      {field.title ? (
        <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
          {field.title}
        </Typography.Text>
      ) : null}
      <Form.Item
        validateStatus={error ? 'error' : undefined}
        help={error || undefined}
        style={{ marginBottom: 0 }}
      >
        <DatePicker.RangePicker
          allowClear={field.allowClear ?? true}
          showTime={showTime}
          format={format}
          classNames={isHourOnlyPicker ? { popup: { root: 'hour-only-picker-popup' } } : undefined}
          suffixIcon={field.suffixIcon || <CalendarOutlined />}
          value={resolveRangeValue({ fromValue, toValue, parseValue })}
          placeholder={field.placeholder}
          onChange={handleChange}
          style={{ width: '100%', height: 40, ...(field.style || {}) }}
          {...(field.props || {})}
        />
      </Form.Item>
    </div>
  )
}

export default forwardRef(RangePickerRenderField)
