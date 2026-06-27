import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
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
import { Card, Col, DatePicker, Flex, Form, Row, Space, Typography } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'

const DATE_HOUR_SHOW_TIME = { format: 'HH', showMinute: false, showSecond: false }

const FieldBox = ({ title, children }) => (
  <div>
    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
      {title}
    </Typography.Text>
    {children}
  </div>
)

const defaultFilters = {
  search: '',
  sourceTypes: [],
  statuses: [],
  createdFrom: '',
  createdTo: '',
}

const TopupHistoryFilterSection = ({ filters, loading, onFilter, onReset }) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const [dateRangeError, setDateRangeError] = useState('')

  const { values, handleChange, reset, setField, registerRef } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)

  const fields = [
    {
      key: 'search',
      title: t('topup.search_execution'),
      label: t('topup.search_execution'),
      type: 'search',
      required: false,
      reserveLabelSpace: true,
      colProps: { xs: 24, md: 12, xl: 6 },
    },
    {
      key: 'sourceTypes',
      title: t('topup.source'),
      type: 'multi-check-dropdown',
      options: _enum.topupExecutionSourceTypeIdOptions,
      required: false,
      placeholder: t('text.all'),
      selectAllText: t('general.select_all'),
      searchPlaceholder: t('general.input_keyword'),
      cancelText: t('general.cancel'),
      okText: t('general.ok'),
      selectedText: (count) => `${count} ${t('text.items')}`,
      colProps: { xs: 24, md: 12, xl: 6 },
    },
    {
      key: 'statuses',
      title: t('topup.status'),
      type: 'multi-check-dropdown',
      options: _enum.topupExecutionStatusIdOptions,
      required: false,
      placeholder: t('text.all'),
      selectAllText: t('general.select_all'),
      searchPlaceholder: t('general.input_keyword'),
      cancelText: t('general.cancel'),
      okText: t('general.ok'),
      selectedText: (count) => `${count} ${t('text.items')}`,
      colProps: { xs: 24, md: 12, xl: 6 },
    },
  ]

  const validateDateRange = (createdFrom, createdTo) => {
    const from = createdFrom && dayjs(createdFrom)
    const to = createdTo && dayjs(createdTo)

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
    const createdFrom = wallTimeBasedOnCurrentLanguageToIso(range?.[0])
    const createdTo = wallTimeBasedOnCurrentLanguageToIso(range?.[1])

    setField('createdFrom', createdFrom)
    setField('createdTo', createdTo)
    validateDateRange(createdFrom, createdTo)
  }

  const handleFilter = () => {
    if (!validateDateRange(values.createdFrom, values.createdTo)) return
    onFilter?.(values)
  }

  const handleReset = () => {
    setDateRangeError('')
    reset(defaultFilters)
    onReset?.()
  }

  const dateRangeValue =
    values.createdFrom || values.createdTo
      ? [
          toPickerValueBasedOnCurrentLanguage(values.createdFrom),
          toPickerValueBasedOnCurrentLanguage(values.createdTo),
        ]
      : null

  return (
    <Card
      size="small"
      style={{ boxShadow: 'none', background: 'var(--app-filter-bg)' }}
      styles={{ body: { padding: 16 } }}
    >
      <Row gutter={[16, 16]} align="bottom">
        {fields.map((field) => (
          <Col key={field.key} {...field.colProps}>
            {renderField(field)}
          </Col>
        ))}

        <Col xs={24} md={12} xl={6}>
          <FieldBox title={t('topup.created_at')}>
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
                onChange={handleDateRangeChange}
                style={{ width: '100%', height: 40 }}
              />
            </Form.Item>
          </FieldBox>
        </Col>

        <Col flex="auto">
          <Flex justify="end">
            <Space>
              <ResetFilterButton loading={loading} onResetFilterClick={handleReset} />
              <FilterButton loading={loading} onFilterClick={handleFilter} />
            </Space>
          </Flex>
        </Col>
      </Row>
    </Card>
  )
}

export default TopupHistoryFilterSection
