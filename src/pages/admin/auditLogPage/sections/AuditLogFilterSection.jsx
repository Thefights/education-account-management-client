import FilterButton from '@/components/buttons/FilterButton'
import ResetFilterButton from '@/components/buttons/ResetFilterButton'
import useEnum from '@/hooks/useEnum'
import useFieldRenderer from '@/hooks/useFieldRenderer'
import useForm from '@/hooks/useForm'
import useTranslation from '@/hooks/useTranslation'
import { CalendarOutlined } from '@ant-design/icons'
import { Card, Col, DatePicker, Flex, Form, Row, Space, Typography } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

const DATE_TIME_FORMAT = 'D/M/YYYY HH:mm'

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
        title: t('audit_log.field.search'),
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
        key: 'actions',
        title: t('audit_log.field.action'),
        type: 'multi-check-dropdown',
        options: _enum.auditLogActionOptions,
        loading,
        placeholder: t('text.all'),
        selectAllText: t('general.select_all'),
        searchPlaceholder: t('general.input_keyword'),
        cancelText: t('general.cancel'),
        okText: t('general.ok'),
        selectedText: (count) => `${count} ${t('text.items')}`,
        required: false,
      },
    ],
    [_enum.auditLogActionOptions, _enum.auditLogCategoryOptions, loading, t]
  )

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
    const createdFrom = range?.[0]?.toISOString() || ''
    const createdTo = range?.[1]?.toISOString() || ''

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
          values.createdFrom ? dayjs(values.createdFrom) : null,
          values.createdTo ? dayjs(values.createdTo) : null,
        ]
      : null

  return (
    <Card size="small">
      <Row gutter={[16, 16]} align="bottom">
        <Col xs={24} md={8}>
          {renderField(filterFields[0])}
        </Col>

        <Col xs={24} md={5}>
          <FieldBox title={filterFields[1].title}>{renderField(filterFields[1])}</FieldBox>
        </Col>

        <Col xs={24} md={5}>
          <FieldBox title={filterFields[2].title}>{renderField(filterFields[2])}</FieldBox>
        </Col>

        <Col xs={24} md={6}>
          <FieldBox title={t('audit_log.field.created_at')}>
            <Form.Item
              validateStatus={dateRangeError ? 'error' : undefined}
              help={dateRangeError || undefined}
              style={{ marginBottom: 0 }}
            >
              <DatePicker.RangePicker
                showTime
                allowClear
                format={DATE_TIME_FORMAT}
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

        <Col xs={24}>
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

export default AuditLogFilterSection
