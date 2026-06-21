import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Col, Flex, Row, Space } from 'antd'

const defaultFilters = { search: '', types: [], statuses: [] }

const TopupRuleFilterSection = ({ filters, loading, onFilter, onReset }) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const { values, handleChange, reset, setField, registerRef } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const statusOptions = [
    { value: '', label: t('text.all') },
    { value: 1, label: t('topup_form.active') },
    { value: 2, label: t('topup_form.inactive') },
  ]
  const fields = [
    {
      key: 'search',
      title: t('topup.search_rule'),
      label: t('topup.search_rule'),
      type: 'search',
      required: false,
      reserveLabelSpace: true,
    },
    {
      key: 'types',
      title: t('topup.rule_type'),
      type: 'select',
      multiple: true,
      options: _enum.topupRuleTypeIdOptions,
      required: false,
      props: { allowClear: true },
    },
    {
      key: 'statuses',
      title: t('topup.status'),
      type: 'select',
      multiple: true,
      options: statusOptions.filter((option) => option.value !== ''),
      required: false,
      props: { allowClear: true },
    },
  ]

  return (
    <Card size="small">
      <Row gutter={[16, 16]} align="bottom">
        {fields.map((field) => (
          <Col key={field.key} xs={24} md={6}>
            {renderField(field)}
          </Col>
        ))}
        <Col xs={24} md={6}>
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

export default TopupRuleFilterSection
