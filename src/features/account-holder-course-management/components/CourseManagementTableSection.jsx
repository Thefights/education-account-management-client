import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultManagementStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { Tag } from 'antd'

const CourseManagementTableSection = ({ courses, loading, sort, setSort, onCourseClick }) => {
  const { t } = useTranslation()
  const _enum = useEnum()

  const fields = [
    {
      key: 'courseCode',
      title: t('course_management.field.course_code'),
      width: 160,
      fixedColumn: true,
      sortable: true,
    },
    {
      key: 'courseName',
      title: t('course_management.field.course_name'),
      width: 260,
      sortable: true,
    },
    {
      key: 'status',
      title: t('course_management.field.status'),
      width: 130,
      type: 'tag',
      options: _enum.courseStatusOptions,
      color: defaultManagementStatusStyle,
      sortable: true,
    },
    {
      key: 'startDate',
      title: t('course_management.field.start_date'),
      width: 180,
      sortable: true,
      render: (value) => formatDatetimeStringBasedOnCurrentLanguage(value) || '-',
    },
    {
      key: 'endDate',
      title: t('course_management.field.end_date'),
      width: 180,
      sortable: true,
      render: (value) => formatDatetimeStringBasedOnCurrentLanguage(value) || '-',
    },
    {
      key: 'enrollmentStatus',
      title: t('course_management.field.note'),
      width: 240,
      render: (value) =>
        value === 'Withdrawn' ? (
          <Tag
            color="warning"
            style={{
              marginInlineEnd: 0,
              whiteSpace: 'normal',
              lineHeight: 1.35,
              padding: '4px 8px',
            }}
          >
            {t('course_management.message.withdrawn_course_note')}
          </Tag>
        ) : (
          '-'
        ),
    },
  ]

  return (
    <GenericTable
      data={courses}
      fields={fields}
      rowKey="id"
      loading={loading}
      sort={sort}
      setSort={setSort}
      onRowClick={onCourseClick}
    />
  )
}

export default CourseManagementTableSection
