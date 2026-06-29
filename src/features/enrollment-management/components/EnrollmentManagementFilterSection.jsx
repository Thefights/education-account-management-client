import { ApiUrls } from '@/shared/api/apiUrls'
import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
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
    <GenericFilterSection
      fields={showCourse ? fields : [fields[0], fields[2]]}
      values={values}
      renderField={renderField}
      reset={reset}
      resetValues={emptyFilters}
      onReset={onReset}
      onFilter={onFilter}
      loading={loading}
      getFieldColProps={() => ({ xs: 24, md: showCourse ? 8 : 12 })}
    />
  )
}

export default EnrollmentManagementFilterSection
