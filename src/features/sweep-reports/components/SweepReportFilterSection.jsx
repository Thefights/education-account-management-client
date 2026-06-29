import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import FilterSectionLayout from '@/shared/components/filters/FilterSectionLayout'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { CalendarOutlined } from '@ant-design/icons'
import { Col, DatePicker, Form, Typography } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'

const defaultFilters = { batchDateFrom: '', batchDateTo: '' }

const FieldBox = ({ title, children }) => (
  <div>
    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
      {title}
    </Typography.Text>
    {children}
  </div>
)

const SweepReportFilterSection = ({ filters, loading, onFilter, onReset }) => {
  const { t } = useTranslation()
  const { values, reset, setField } = useForm(filters)
  const [dateRangeError, setDateRangeError] = useState('')

  const validateDateRange = (batchDateFrom, batchDateTo) => {
    const from = batchDateFrom && dayjs(batchDateFrom)
    const to = batchDateTo && dayjs(batchDateTo)

    if (from && to && to.isBefore(from)) {
      setDateRangeError(t('audit_log.validation.to_date_before_from_date'))
      return false
    }

    setDateRangeError('')
    return true
  }

  const handleDateRangeChange = (range) => {
    const batchDateFrom = range?.[0] ? range[0].format('YYYY-MM-DD') : ''
    const batchDateTo = range?.[1] ? range[1].format('YYYY-MM-DD') : ''

    setField('batchDateFrom', batchDateFrom)
    setField('batchDateTo', batchDateTo)
    validateDateRange(batchDateFrom, batchDateTo)
  }

  const dateRangeValue =
    values.batchDateFrom || values.batchDateTo
      ? [
          values.batchDateFrom ? dayjs(values.batchDateFrom) : null,
          values.batchDateTo ? dayjs(values.batchDateTo) : null,
        ]
      : null

  const handleReset = () => {
    setDateRangeError('')
    reset(defaultFilters)
    onReset?.()
  }

  const handleFilter = () => {
    if (!validateDateRange(values.batchDateFrom, values.batchDateTo)) return
    onFilter?.(values)
  }

  return (
    <FilterSectionLayout
      cardProps={{
        style: { boxShadow: 'none', background: 'var(--app-filter-bg)' },
        styles: { body: { padding: 16 } },
      }}
      actions={
        <>
          <ResetFilterButton loading={loading} onResetFilterClick={handleReset} />
          <FilterButton loading={loading} onFilterClick={handleFilter} />
        </>
      }
    >
      <Col xs={24} md={12} xl={6}>
        <FieldBox title={t('batch_report.batch_date')}>
          <Form.Item
            validateStatus={dateRangeError ? 'error' : undefined}
            help={dateRangeError || undefined}
            style={{ marginBottom: 0 }}
          >
            <DatePicker.RangePicker
              allowClear
              suffixIcon={<CalendarOutlined />}
              value={dateRangeValue}
              onChange={handleDateRangeChange}
              style={{ width: '100%', height: 40 }}
            />
          </Form.Item>
        </FieldBox>
      </Col>
    </FilterSectionLayout>
  )
}

export default SweepReportFilterSection
