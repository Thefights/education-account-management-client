import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultManagementStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { CopyOutlined, EditOutlined } from '@ant-design/icons'

const isDraft = (course) => course.status === 'Draft'
const canEdit = (course) => course.status === 'Draft' || course.status === 'Enrolling'

const CourseManagementTableSection = ({
  courses,
  loading,
  sort,
  setSort,
  selectedIds,
  setSelectedIds,
  onDetail,
  onEdit,
  onDuplicate,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const fields = [
    {
      key: 'courseCode',
      title: t('course_management.field.course_code'),
      width: 150,
      sortable: true,
    },
    {
      key: 'courseName',
      title: t('course_management.field.course_name'),
      width: 220,
      sortable: true,
    },
    {
      key: 'status',
      title: t('course_management.field.status'),
      width: 130,
      sortable: true,
      type: 'tag',
      options: _enum.courseStatusOptions,
      color: defaultManagementStatusStyle,
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
      key: 'enrollmentCount',
      title: t('course_management.field.enrollment_count'),
      width: 140,
      sortable: true,
      isNumeric: true,
      render: (value) => Number(value ?? 0).toLocaleString(),
    },
    {
      key: 'createdAt',
      title: t('audit_log.field.created_at'),
      width: 180,
      sortable: true,
      render: (value) => formatDatetimeStringBasedOnCurrentLanguage(value) || '-',
    },
    {
      key: 'actions',
      title: '',
      width: 70,
      render: (_, row) => (
        <ActionMenu
          actions={[
            {
              title: t('button.edit'),
              icon: <EditOutlined />,
              disabled: !canEdit(row),
              onClick: () => onEdit(row),
            },
            {
              title: t('button.duplicate', 'Duplicate'),
              icon: <CopyOutlined />,
              onClick: () => onDuplicate(row),
            },
          ]}
        />
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
      canSelectRows
      selectedRows={selectedIds}
      setSelectedRows={setSelectedIds}
      isRowSelectable={isDraft}
      onRowClick={onDetail}
    />
  )
}

export default CourseManagementTableSection
