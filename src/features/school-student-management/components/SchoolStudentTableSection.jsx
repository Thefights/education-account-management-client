import ActionMenu from '@/shared/components/generals/ActionMenu'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import GenericTable from '@/shared/components/tables/GenericTable'
import { routeUrls } from '@/shared/config/routeUrls'
import { defaultManagementStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { Popover, Space, Tag } from 'antd'
import { Link } from 'react-router-dom'

const SchoolStudentTableSection = ({
  students,
  loading,
  sort,
  setSort,
  selectedIds,
  setSelectedIds,
  onDelete,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const renderCourseTag = (course) => (
    <Link
      key={course.id}
      to={routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.COURSE_MANAGEMENT.DETAIL(course.id))}
    >
      <Tag color={defaultManagementStatusStyle(course.status)}>
        {course.courseCode} · {course.courseName}
      </Tag>
    </Link>
  )

  const fields = [
    {
      key: 'accountNumber',
      title: t('school_student.field.account_number'),
      width: 150,
      sortable: true,
    },
    {
      key: 'nric',
      title: t('school_student.field.nric'),
      width: 150,
      sortable: true,
      render: (value) => <MaskedNric value={value} />,
    },
    {
      key: 'fullName',
      title: t('school_student.field.full_name'),
      width: 220,
      sortable: true,
    },
    {
      key: 'courses',
      title: t('school_student.field.courses'),
      width: 320,
      sortable: true,
      render: (courses = []) => {
        if (!courses.length) return null
        const visibleCourses = courses.slice(0, 2)
        const hiddenCourses = courses.slice(2)
        return (
          <Space size={[4, 4]} wrap>
            {visibleCourses.map(renderCourseTag)}
            {!!hiddenCourses.length && (
              <Popover
                placement="bottom"
                content={<Space direction="vertical">{hiddenCourses.map(renderCourseTag)}</Space>}
              >
                <Tag>+{hiddenCourses.length}</Tag>
              </Popover>
            )}
          </Space>
        )
      },
    },
    {
      key: 'email',
      title: t('school_student.field.email'),
      width: 240,
      sortable: true,
    },
    {
      key: 'phoneNumber',
      title: t('school_student.field.phone_number'),
      width: 160,
      sortable: true,
    },
    {
      key: 'status',
      title: t('school_student.field.status'),
      width: 120,
      sortable: true,
      type: 'tag',
      options: _enum.schoolStudentStatusOptions,
      color: defaultManagementStatusStyle,
    },
    {
      key: 'createdAt',
      title: t('audit_log.field.created_at'),
      width: 180,
      sortable: true,
      render: formatDatetimeStringBasedOnCurrentLanguage,
    },
    {
      key: 'actions',
      title: '',
      width: 70,
      render: (_, row) => (
        <ActionMenu actions={[{ title: t('button.delete'), onClick: () => onDelete?.(row) }]} />
      ),
    },
  ]

  return (
    <GenericTable
      data={students}
      fields={fields}
      rowKey="id"
      loading={loading}
      sort={sort}
      setSort={setSort}
      canSelectRows
      selectedRows={selectedIds}
      setSelectedRows={setSelectedIds}
    />
  )
}

export default SchoolStudentTableSection
