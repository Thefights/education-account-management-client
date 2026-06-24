import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { localDateTimeToIso, toLocalPickerValue } from '@/shared/utils/dateTimeUtil'
import { Card, Col, DatePicker, Flex, Row, Space, Typography } from 'antd'

const defaultFilters = { name: '', frequencies: [], statuses: [], createdFrom: '', createdTo: '' }

const TopupScheduleFilterSection = ({ filters, loading, onFilter, onReset }) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const { values, handleChange, reset, setField, registerRef } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const fields = [
    {
      key: 'name',
      title: t('topup.search_topup'),
      label: t('topup.search_topup'),
      type: 'search',
      required: false,
      reserveLabelSpace: true,
    },
    {
      key: 'frequencies',
      title: t('topup.schedule_type'),
      type: 'multi-check-dropdown',
      options: _enum.scheduleTopupFrequencyIdOptions,
      required: false,
      placeholder: t('text.all'),
      selectAllText: t('general.select_all'),
      searchPlaceholder: t('general.input_keyword'),
      cancelText: t('general.cancel'),
      okText: t('general.ok'),
      selectedText: (count) => `${count} ${t('text.items')}`,
    },
    {
      key: 'statuses',
      title: t('topup.status'),
      type: 'multi-check-dropdown',
      options: _enum.scheduleTopupStatusIdOptions,
      required: false,
      placeholder: t('text.all'),
      selectAllText: t('general.select_all'),
      searchPlaceholder: t('general.input_keyword'),
      cancelText: t('general.cancel'),
      okText: t('general.ok'),
      selectedText: (count) => `${count} ${t('text.items')}`,
    },
  ]
  const dateRangeValue =
    values.createdFrom || values.createdTo
      ? [toLocalPickerValue(values.createdFrom), toLocalPickerValue(values.createdTo)]
      : null

  return (
    <Card size="small">
      <Row gutter={[16, 16]} align="bottom">
        {fields.map((field) => (
          <Col key={field.key} xs={24} md={6}>
            {renderField(field)}
          </Col>
        ))}
        <Col xs={24} md={6}>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            {t('topup.created_at')}
          </Typography.Text>
          <DatePicker.RangePicker
            value={dateRangeValue}
            style={{ width: '100%' }}
            onChange={(range) => {
              setField('createdFrom', localDateTimeToIso(range?.[0]))
              setField('createdTo', localDateTimeToIso(range?.[1]?.endOf('day')))
            }}
          />
        </Col>
        <Col xs={24}>
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
