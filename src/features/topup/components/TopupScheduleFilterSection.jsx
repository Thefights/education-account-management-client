import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Col, Flex, Row, Space } from 'antd'

const defaultFilters = { frequencies: [], statuses: [] }

const TopupScheduleFilterSection = ({ filters, loading, onFilter, onReset }) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const { values, handleChange, reset, setField, registerRef } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const fields = [
    {
      key: 'frequencies',
      title: t('topup.schedule_type'),
      type: 'select',
      multiple: true,
      options: _enum.topupScheduleTypeIdOptions,
      required: false,
      props: { allowClear: true, placeholder: t('text.all') },
    },
    {
      key: 'statuses',
      title: t('topup.status'),
      type: 'select',
      multiple: true,
      options: _enum.topupScheduleStatusIdOptions,
      required: false,
      props: { allowClear: true, placeholder: t('text.all') },
    },
  ]

  return (
    <Card size="small">
      <Row gutter={[16, 16]} align="bottom">
        {fields.map((field) => (
          <Col key={field.key} xs={24} md={8}>
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

export default TopupScheduleFilterSection
