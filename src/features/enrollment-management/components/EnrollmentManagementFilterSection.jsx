import { ApiUrls } from '@/shared/api/apiUrls'
import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Col, Flex, Row, Space } from 'antd'
import { useMemo } from 'react'

const emptyFilters = { search: '', courseId: '', chargeStatuses: [] }

const EnrollmentManagementFilterSection = ({
  filters,
  onFilter,
  onReset,
  loading,
  showCourse = true,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const courses = useFetch(showCourse ? ApiUrls.COURSE_MANAGEMENT.GET_ALL : '')
  const { values, handleChange, setField, registerRef, reset } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)

  const courseOptions = useMemo(
    () => [
      { value: '', label: t('text.all') },
      ...(courses.data?.collection || courses.data || []).map((course) => ({
        value: course.id,
        label: `${course.courseCode} - ${course.courseName}`,
      })),
    ],
    [courses.data, t]
  )

  const fields = useMemo(
    () => [
      {
        key: 'search',
        title: t('enrollment_management.label.search'),
        label: t('enrollment_management.label.search'),
        placeholder: t('enrollment_management.placeholder.search'),
        type: 'search',
        required: false,
        reserveLabelSpace: true,
      },
      {
        key: 'courseId',
        title: t('enrollment_management.field.course'),
        type: 'select',
        required: false,
        options: courseOptions,
        placeholder: t('text.all'),
        props: {
          showSearch: true,
          optionFilterProp: 'label',
          loading: courses.loading,
          allowClear: true,
        },
      },
      {
        key: 'chargeStatuses',
        title: t('enrollment_management.field.charge_status'),
        type: 'multi-check-dropdown',
        required: false,
        options: _enum.chargeStatusOptions,
        placeholder: t('text.all'),
        selectAllText: t('general.select_all'),
        searchPlaceholder: t('general.input_keyword'),
        cancelText: t('general.cancel'),
        okText: t('general.ok'),
        selectedText: (count) => `${count} ${t('text.items')}`,
      },
    ],
    [courseOptions, courses.loading, _enum.chargeStatusOptions, t]
  )

  return (
    <Card size="small">
      <Row gutter={[16, 16]} align="bottom">
        <Col xs={24} md={showCourse ? 8 : 12}>
          {renderField(fields[0])}
        </Col>
        {showCourse && (
          <Col xs={24} md={8}>
            {renderField(fields[1])}
          </Col>
        )}
        <Col xs={24} sm={12} md={showCourse ? 4 : 6}>
          {renderField(fields[2])}
        </Col>
        <Col xs={24} sm={12} md={showCourse ? 4 : 6}>
          <Flex justify="end" align="end" style={{ height: '100%' }}>
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

export default EnrollmentManagementFilterSection
