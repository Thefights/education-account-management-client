import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import FilterSectionLayout from '@/shared/components/filters/FilterSectionLayout'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Col, Flex, Space } from 'antd'
import { useMemo } from 'react'

const AiSupportRequestFilterSection = ({
  filters,
  defaultFilters,
  mode = 'pending',
  loading,
  onFilter,
  onReset,
}) => {
  const { t } = useTranslation()
  const { values, handleChange, setField, registerRef, reset, validateAll, resetValidation } =
    useForm(filters)
  const { renderField } = useFieldRenderer(
    values,
    setField,
    handleChange,
    registerRef,
    false,
    'outlined',
    'medium'
  )
  const isResolved = mode === 'resolved'

  const fields = useMemo(
    () => [
      {
        key: 'search',
        title: t('ai_support_request.filter.search'),
        label: t('ai_support_request.filter.search'),
        type: 'search',
        required: false,
        reserveLabelSpace: true,
        colProps: { xs: 24 },
      },
      {
        key: 'createdRange',
        title: t('ai_support_request.filter.created_range'),
        type: 'range-picker',
        from: { key: 'createdFrom' },
        to: { key: 'createdTo' },
        disallowFutureFrom: true,
        placeholder: [
          t('ai_support_request.filter.from_date'),
          t('ai_support_request.filter.to_date'),
        ],
        colProps: { xs: 24, md: 12, lg: isResolved ? 6 : 8 },
      },
      ...(isResolved
        ? [
            {
              key: 'resolvedRange',
              title: t('ai_support_request.filter.resolved_range'),
              type: 'range-picker',
              from: { key: 'resolvedFrom' },
              to: { key: 'resolvedTo' },
              disallowFutureFrom: true,
              placeholder: [
                t('ai_support_request.filter.from_date'),
                t('ai_support_request.filter.to_date'),
              ],
              colProps: { xs: 24, md: 12, lg: 6 },
            },
          ]
        : []),
      {
        key: 'sort',
        title: t('ai_support_request.filter.sort'),
        type: 'select',
        required: false,
        options: isResolved
          ? [
              { value: 'resolvedAt desc', label: t('ai_support_request.filter.newest_resolved') },
              { value: 'resolvedAt asc', label: t('ai_support_request.filter.oldest_resolved') },
            ]
          : [
              { value: 'createdAt desc', label: t('ai_support_request.filter.newest_created') },
              { value: 'createdAt asc', label: t('ai_support_request.filter.oldest_created') },
            ],
        placeholder: t('ai_support_request.filter.sort'),
        props: { allowClear: false },
        colProps: { xs: 24, md: 12, lg: isResolved ? 6 : 8 },
      },
    ],
    [isResolved, t]
  )

  const handleFilter = () => {
    if (!validateAll()) return
    onFilter?.(values)
  }

  const handleReset = () => {
    reset(defaultFilters)
    resetValidation()
    onReset?.()
  }

  return (
    <FilterSectionLayout
      gutter={[16, 12]}
      onEnterFilter={handleFilter}
      cardProps={{
        style: { boxShadow: 'none', background: 'var(--app-filter-bg)' },
        styles: { body: { padding: 14 } },
      }}
    >
      {fields.map((field) => (
        <Col key={field.key} {...field.colProps}>
          {renderField(field)}
        </Col>
      ))}
      <Col xs={24} md={12} lg={isResolved ? 6 : 8}>
        <Flex justify="end">
          <Space wrap>
            <ResetFilterButton loading={loading} onResetFilterClick={handleReset} />
            <FilterButton loading={loading} onFilterClick={handleFilter} />
          </Space>
        </Flex>
      </Col>
    </FilterSectionLayout>
  )
}

export default AiSupportRequestFilterSection
