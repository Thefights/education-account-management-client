import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Col, Flex, Row, Space } from 'antd'
import { useMemo } from 'react'

const ProductManagementFilterSection = ({ filters = {}, onFilter, onReset, loading = false }) => {
  const { t } = useTranslation()
  const _enum = useEnum()

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
        title: t('product.placeholder.search_product'),
        type: 'search',
        label: t('product.placeholder.search_text'),
        required: false,
        reserveLabelSpace: true,
      },
      {
        key: 'status',
        title: t('product.field.status'),
        type: 'select',
        options: [{ value: '', label: t('text.all') }, ..._enum.productStatusOptions],
        required: false,
      },
    ],
    [t, _enum.productStatusOptions]
  )

  const handleReset = () => {
    reset({})
    onReset?.()
  }

  return (
    <Card size="small">
      <Row gutter={[16, 16]} align="bottom">
        <Col xs={24} md={8}>
          {renderField(filterFields[0])}
        </Col>

        <Col xs={24} md={12}>
          {renderField(filterFields[1])}
        </Col>

        <Col xs={24} md={4}>
          <Flex justify="end" style={{ height: '100%' }}>
            <Space>
              <ResetFilterButton loading={loading} onResetFilterClick={handleReset} />

              <FilterButton loading={loading} onFilterClick={() => onFilter?.(values)} />
            </Space>
          </Flex>
        </Col>
      </Row>
    </Card>
  )
}

export default ProductManagementFilterSection
