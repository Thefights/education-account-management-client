import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Col, Flex, Row, Space } from 'antd'

const emptyFilters = { search: '', statuses: [], schoolId: '' }

const CourseManagementFilterSection = ({
  filters,
  onFilter,
  onReset,
  loading,
  canSelectSchool = false,
  schoolOptions = [],
  schoolsLoading = false,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const { values, handleChange, setField, registerRef, reset } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const fields = [
    {
      key: 'search',
      title: t('course_management.placeholder.search'),
      label: t('text.search_label'),
      type: 'search',
      required: false,
      reserveLabelSpace: true,
    },
    {
      key: 'statuses',
      title: t('course_management.field.status'),
      type: 'select',
      multiple: true,
      options: _enum.courseStatusOptions,
      required: false,
    },
    ...(canSelectSchool
      ? [
          {
            key: 'schoolId',
            title: t('course_management.field.school'),
            type: 'select',
            options: schoolOptions,
            props: {
              loading: schoolsLoading,
              showSearch: true,
              allowClear: true,
              optionFilterProp: 'label',
            },
            required: false,
          },
        ]
      : []),
  ]

  return (
    <Card size="small">
      <Row gutter={[16, 16]} align="bottom">
        {fields.map((field, index) => (
          <Col key={field.key} xs={24} md={index === 0 ? 10 : 5}>
            {renderField(field)}
          </Col>
        ))}
        <Col xs={24} md={6}>
          <Flex justify="end">
            <Space>
              <ResetFilterButton
                loading={loading}
                onResetFilterClick={() => {
                  reset(emptyFilters)
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

export default CourseManagementFilterSection
