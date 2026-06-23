import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Col, Flex, Row, Space } from 'antd'

const emptyFilters = { search: '', statuses: [] }

const SchoolStudentFilterSection = ({ filters, onFilter, onReset, loading }) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const { values, handleChange, setField, registerRef, reset } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)

  const fields = [
    {
      key: 'search',
      title: t('school_student.label.search'),
      label: t('school_student.label.search'),
      placeholder: t('school_student.placeholder.search'),
      type: 'search',
      required: false,
      reserveLabelSpace: true,
    },
    {
      key: 'statuses',
      title: t('school_student.field.status'),
      type: 'multi-check-dropdown',
      options: _enum.schoolStudentStatusOptions,
      required: false,
      placeholder: t('text.all'),
      selectAllText: t('general.select_all'),
      searchPlaceholder: t('general.input_keyword'),
      cancelText: t('general.cancel'),
      okText: t('general.ok'),
      selectedText: (count) => `${count} ${t('text.items')}`,
    },
  ]

  const handleReset = () => {
    reset(emptyFilters)
    onReset?.()
  }

  return (
    <Card size="small">
      <Row gutter={[16, 16]} align="bottom">
        <Col xs={24} md={12}>
          {renderField(fields[0])}
        </Col>
        <Col xs={24} md={6}>
          {renderField(fields[1])}
        </Col>
        <Col xs={24} md={6}>
          <Flex justify="end">
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

export default SchoolStudentFilterSection
