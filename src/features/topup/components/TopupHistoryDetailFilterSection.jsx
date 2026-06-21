import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Col, Flex, Row, Space } from 'antd'

const defaultFilters = {
  accountNumber: '',
  statuses: [],
}

const TopupHistoryDetailFilterSection = ({ filters, loading, onFilter, onReset }) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const { values, handleChange, reset, setField, registerRef } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)

  const fields = [
    {
      key: 'accountNumber',
      title: t('topup.account_number'),
      label: t('topup.account_number'),
      type: 'search',
      required: false,
      reserveLabelSpace: true,
      colProps: { xs: 24, md: 8 },
    },
    {
      key: 'statuses',
      title: t('topup.status'),
      type: 'select',
      multiple: true,
      options: _enum.topupTargetStatusIdOptions,
      required: false,
      props: { allowClear: true, placeholder: t('text.all') },
      colProps: { xs: 24, md: 8 },
    },
  ]

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
        <Col xs={24} md={8}>
          <Flex justify="end">
            <Space>
              <ResetFilterButton
                loading={loading}
                onResetFilterClick={() => {
                  reset(defaultFilters)
                  onReset?.()
                }}
              />
              <FilterButton loading={loading} onFilterClick={() => onFilter?.(values)} />
            </Space>
          </Flex>
        </Col>
      </Row>
    </Card>
  )
}

export default TopupHistoryDetailFilterSection
