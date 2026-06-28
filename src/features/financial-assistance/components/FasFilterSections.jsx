import {
  defaultFasApplicationFilters,
  defaultFasSchemeFilters,
  fasApplicationStatusOptions,
  fasSchemeStatusOptions,
} from '@/features/financial-assistance/utils/fasTableConfig'
import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import FilterSectionLayout from '@/shared/components/filters/FilterSectionLayout'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import { CalendarOutlined } from '@ant-design/icons'
import { Col, DatePicker, Form, Select, Typography } from 'antd'
import dayjs from 'dayjs'

const filterCardStyles = {
  boxShadow: 'none',
  background: 'var(--app-filter-bg)',
}

const FieldBox = ({ title, children }) => (
  <div>
    <Typography.Text style={{ display: 'block', marginBottom: 8 }}>
      {title}
    </Typography.Text>
    {children}
  </div>
)

const makeMultiCheckField = ({ key, title, options }) => ({
  key,
  title,
  type: 'multi-check-dropdown',
  options,
  required: false,
  placeholder: 'All',
  selectAllText: 'Select all',
  searchPlaceholder: 'Input keyword',
  cancelText: 'Cancel',
  okText: 'OK',
  selectedText: (count) => `${count} items`,
})

export const FasSchemeFilterSection = ({ filters, loading, onFilter, onReset }) => {
  const { values, handleChange, reset, setField, registerRef } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const fields = [
    {
      key: 'search',
      title: 'Search by FAS ID or scheme name',
      label: 'Search by FAS ID or scheme name',
      type: 'search',
      required: false,
      reserveLabelSpace: true,
      onEnterDown: () => onFilter?.(values),
    },
  ]

  return (
    <FilterSectionLayout
      cardProps={{ style: filterCardStyles, styles: { body: { padding: 16 } } }}
      actions={
        <>
          <ResetFilterButton
            loading={loading}
            onResetFilterClick={() => {
              reset(defaultFasSchemeFilters)
              onReset?.()
            }}
          />
          <FilterButton loading={loading} onFilterClick={() => onFilter?.(values)} />
        </>
      }
    >
        {fields.map((field) => (
          <Col key={field.key} xs={24} md={8}>
            {renderField(field)}
          </Col>
        ))}
        <Col xs={24} md={12}>
          <FieldBox title="Status">
            <Select
              value={values.status || 'all'}
              style={{ width: '100%', height: 40 }}
              options={[{ value: 'all', label: 'All' }, ...fasSchemeStatusOptions]}
              onChange={(value) => setField('status', value)}
            />
          </FieldBox>
        </Col>
    </FilterSectionLayout>
  )
}

export const FasApplicationFilterSection = ({
  filters,
  loading,
  onFilter,
  onReset,
  searchTitle = 'Search by FAS, account, or app no.',
  dateTitle = 'Submitted date',
  showStatus = true,
  showDateRange = true,
}) => {
  const { values, handleChange, reset, setField, registerRef } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const fields = [
    {
      key: 'search',
      title: searchTitle,
      label: searchTitle,
      type: 'search',
      required: false,
      reserveLabelSpace: true,
      onEnterDown: () => onFilter?.(values),
      colProps: { xs: 24, md: 8, xl: 7 },
    },
    showStatus
      ? {
          ...makeMultiCheckField({
            key: 'statuses',
            title: 'Status',
            options: fasApplicationStatusOptions,
          }),
          colProps: { xs: 24, sm: 12, md: 8, xl: 5 },
        }
      : null,
  ].filter(Boolean)

  const dateRangeValue =
    values.dateFrom || values.dateTo
      ? [values.dateFrom ? dayjs(values.dateFrom) : null, values.dateTo ? dayjs(values.dateTo) : null]
      : null

  const resetValues = () => {
    reset(defaultFasApplicationFilters)
    onReset?.()
  }

  return (
    <FilterSectionLayout
      cardProps={{ style: filterCardStyles, styles: { body: { padding: 16 } } }}
      actions={
        <>
          <ResetFilterButton loading={loading} onResetFilterClick={resetValues} />
          <FilterButton loading={loading} onFilterClick={() => onFilter?.(values)} />
        </>
      }
    >
        {fields.map((field) => (
          <Col key={field.key} {...field.colProps}>
            {renderField(field)}
          </Col>
        ))}
        {showDateRange && (
          <Col xs={24} md={8} xl={6}>
            <FieldBox title={dateTitle}>
              <Form.Item style={{ marginBottom: 0 }}>
                <DatePicker.RangePicker
                  allowClear
                  value={dateRangeValue}
                  suffixIcon={<CalendarOutlined />}
                  onChange={(range) => {
                    setField('dateFrom', range?.[0]?.format('YYYY-MM-DD') || '')
                    setField('dateTo', range?.[1]?.format('YYYY-MM-DD') || '')
                  }}
                  style={{ width: '100%', height: 40 }}
                />
              </Form.Item>
            </FieldBox>
          </Col>
        )}
    </FilterSectionLayout>
  )
}
