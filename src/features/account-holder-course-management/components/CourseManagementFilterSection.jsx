import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Space } from 'antd'

const emptyFilters = { search: '', statuses: [] }

const CourseManagementFilterSection = ({
  tab,
  setTab,
  counts,
  filters,
  onFilter,
  onReset,
  loading,
}) => {
  const { t } = useTranslation()
  const { values, handleChange, setField, registerRef, reset } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const fields = [
    {
      key: 'search',
      title: t('course_management.placeholder.searchbyID'),
      label: t('course_management.placeholder.searchbyID'),
      type: 'search',
      required: false,
      reserveLabelSpace: true,
    },
  ]

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type={tab === 3 ? 'primary' : 'default'} onClick={() => setTab(3)}>
          {t('course_management.tab.upcoming')} ({counts?.upcoming ?? 0})
        </Button>

        <Button type={tab === 4 ? 'primary' : 'default'} onClick={() => setTab(4)}>
          {t('course_management.tab.in_progress')} ({counts?.inProgress ?? 0})
        </Button>

        <Button type={tab === 5 ? 'primary' : 'default'} onClick={() => setTab(5)}>
          {t('course_management.tab.closed')} ({counts?.closed ?? 0})
        </Button>
      </Space>

      <GenericFilterSection
        fields={fields}
        values={values}
        renderField={renderField}
        reset={reset}
        resetValues={emptyFilters}
        onReset={onReset}
        onFilter={onFilter}
        loading={loading}
        getFieldColProps={() => ({ xs: 24, md: 12 })}
      />
    </>
  )
}

export default CourseManagementFilterSection
