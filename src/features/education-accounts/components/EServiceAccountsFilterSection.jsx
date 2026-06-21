import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Col, Flex, Row, Space } from 'antd'
import { useMemo } from 'react'

const EServiceAccountsFilterSection = ({ filters, onFilter, onReset }) => {
  const { t } = useTranslation()
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

  const fields = useMemo(
    () => [
      {
        key: 'search',
        title: t('education_account.search'),
        label: t('education_account.search_label'),
        type: 'search',
        required: false,
        reserveLabelSpace: true,
      },
      {
        key: 'statuses',
        title: t('education_account.status'),
        type: 'select',
        multiple: true,
        required: false,
        options: [
          { value: 'Active', label: t('education_account.active') },
          { value: 'Extended', label: t('education_account.extended') },
          { value: 'Closed', label: t('education_account.inactive') },
        ],
      },
    ],
    [t]
  )

  const handleReset = () => {
    reset({ search: '', statuses: [] })
    onReset?.()
  }

  return (
    <Card size="small">
      <Row gutter={[16, 16]} align="bottom">
        <Col xs={24} lg={12}>
          {renderField(fields[0])}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderField(fields[1])}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Flex justify="end">
            <Space>
              <ResetFilterButton onResetFilterClick={handleReset} />
              <FilterButton onFilterClick={() => onFilter?.(values)} />
            </Space>
          </Flex>
        </Col>
      </Row>
    </Card>
  )
}

export default EServiceAccountsFilterSection
