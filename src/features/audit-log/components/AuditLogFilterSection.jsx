import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import FilterSectionLayout from '@/shared/components/filters/FilterSectionLayout'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  toPickerValueBasedOnCurrentLanguage,
  wallTimeBasedOnCurrentLanguageToIso,
} from '@/shared/utils/dateTimeUtil'
import { getDateHourFormatBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { CalendarOutlined } from '@ant-design/icons'
import { Col, DatePicker, Form, Typography } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

const DATE_HOUR_SHOW_TIME = { format: 'HH', showMinute: false, showSecond: false }

const FieldBox = ({ title, children }) => (
  <div>
    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
      {title}
    </Typography.Text>
    {children}
  </div>
)

const AuditLogFilterSection = ({
  filters = {},
  defaultFilters = {},
  onFilter,
  onReset,
  loading = false,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const [dateRangeError, setDateRangeError] = useState('')

  const { values, handleChange, setField, registerRef, reset } = useForm(filters)

  const { renderField } = useFieldRenderer(
    values,
    setField,
    handleChange,
    registerRef,
    false,
    'outlined',
    'medium'
  )

  const filterFields = useMemo(
    () => [
      {
        key: 'search',
        title: t('audit_log.placeholder.search_text'),
        type: 'search',
        required: false,
        label: t('audit_log.placeholder.search_text'),
        reserveLabelSpace: true,
      },
      {
        key: 'categories',
        title: t('audit_log.field.category'),
        type: 'multi-check-dropdown',
        options: _enum.auditLogCategoryOptions,
        loading,
        placeholder: t('text.all'),
        selectAllText: t('general.select_all'),
        searchPlaceholder: t('general.input_keyword'),
        cancelText: t('general.cancel'),
        okText: t('general.ok'),
        selectedText: (count) => `${count} ${t('text.items')}`,
        required: false,
      },
      {
        key: 'action',
        title: t('audit_log.field.action'),
        type: 'text',
        required: false,
      },
    ],
    [_enum.auditLogCategoryOptions, loading, t]
  )

  const validateDateRange = (occurredFrom, occurredTo) => {
    const from = occurredFrom && dayjs(occurredFrom)
    const to = occurredTo && dayjs(occurredTo)

    if (from && from.isAfter(dayjs())) {
      setDateRangeError(t('audit_log.validation.from_date_not_future'))
      return false
    }

    if (from && to && to.isBefore(from)) {
      setDateRangeError(t('audit_log.validation.to_date_before_from_date'))
      return false
    }

    setDateRangeError('')
    return true
  }

  const handleDateRangeChange = (range) => {
    const occurredFrom = wallTimeBasedOnCurrentLanguageToIso(range?.[0])
    const occurredTo = wallTimeBasedOnCurrentLanguageToIso(range?.[1])

    setField('occurredFrom', occurredFrom)
    setField('occurredTo', occurredTo)
    validateDateRange(occurredFrom, occurredTo)
  }

  const handleFilter = () => {
    if (!validateDateRange(values.occurredFrom, values.occurredTo)) return
    onFilter?.(values)
  }

  const handleReset = () => {
    setDateRangeError('')
    reset(defaultFilters)
    onReset?.()
  }

  const dateRangeValue =
    values.occurredFrom || values.occurredTo
      ? [
          toPickerValueBasedOnCurrentLanguage(values.occurredFrom),
          toPickerValueBasedOnCurrentLanguage(values.occurredTo),
        ]
      : null

  return (
    <FilterSectionLayout
      actions={
        <>
          <ResetFilterButton loading={loading} onResetFilterClick={handleReset} />
          <FilterButton loading={loading} onFilterClick={handleFilter} />
        </>
      }
    >
        <Col xs={24} md={12} xl={8}>
          {renderField(filterFields[0])}
        </Col>

        <Col xs={24} md={12} xl={5}>
          {renderField(filterFields[1])}
        </Col>

        <Col xs={24} md={12} xl={5}>
          {renderField(filterFields[2])}
        </Col>

        <Col xs={24} md={12} xl={6}>
          <FieldBox title={t('audit_log.field.created_at')}>
            <Form.Item
              validateStatus={dateRangeError ? 'error' : undefined}
              help={dateRangeError || undefined}
              style={{ marginBottom: 0 }}
            >
              <DatePicker.RangePicker
                showTime={DATE_HOUR_SHOW_TIME}
                allowClear
                format={getDateHourFormatBasedOnCurrentLanguage()}
                suffixIcon={<CalendarOutlined />}
                value={dateRangeValue}
                placeholder={[
                  t('audit_log.placeholder.created_from'),
                  t('audit_log.placeholder.created_to'),
                ]}
                onChange={handleDateRangeChange}
                style={{ width: '100%', height: 40 }}
              />
            </Form.Item>
          </FieldBox>
        </Col>
    </FilterSectionLayout>
  )
}

export default AuditLogFilterSection
