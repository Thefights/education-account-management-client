import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import { Col } from 'antd'
import FilterSectionLayout from './FilterSectionLayout'

const defaultFieldColProps = { xs: 24, md: 6 }

const GenericFilterSection = ({
  fields,
  values,
  renderField,
  reset,
  resetValues,
  onFilter,
  onReset,
  loading = false,
  getFieldColProps,
  actionColProps,
  cardProps,
  rowProps,
  gutter,
  extraActions,
}) => {
  const handleReset = () => {
    if (resetValues !== undefined) reset(resetValues)
    onReset?.()
  }

  const resolveFieldColProps = (field, index) =>
    field.colProps || getFieldColProps?.(field, index) || defaultFieldColProps

  return (
    <FilterSectionLayout
      cardProps={cardProps}
      rowProps={rowProps}
      gutter={gutter}
      actionColProps={actionColProps}
      actions={
        <>
          <ResetFilterButton loading={loading} onResetFilterClick={handleReset} />
          <FilterButton loading={loading} onFilterClick={() => onFilter?.(values)} />
          {extraActions}
        </>
      }
    >
      {fields.map((field, index) => (
        <Col key={field.key} {...resolveFieldColProps(field, index)}>
          {renderField(field)}
        </Col>
      ))}
    </FilterSectionLayout>
  )
}

export default GenericFilterSection
