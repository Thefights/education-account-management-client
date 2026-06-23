import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultManagementStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatSingaporeDateTime } from '@/shared/utils/dateTimeUtil'

const formatAmount = (value) => (value == null ? null : Number(value).toLocaleString())
const isDraft = (course) => course.status === 'Draft'

const CourseManagementTableSection = ({
  courses,
  loading,
  sort,
  setSort,
  selectedIds,
  setSelectedIds,
  onEdit,
  onDelete,
  onManageStudents,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const fields = [
    {
      key: 'id',
      title: t('course_management.field.id'),
      width: 80,
      sortable: true,
      fixedColumn: true,
    },
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
      key: 'courseFeeAmount',
      title: t('course_management.field.course_fee_amount'),
      width: 160,
      sortable: true,
      isNumeric: true,
      render: formatAmount,
    },
    {
      key: 'miscFeeAmount',
      title: t('course_management.field.misc_fee_amount'),
      width: 150,
      sortable: true,
      isNumeric: true,
      render: formatAmount,
    },
    {
      key: 'gstAmount',
      title: t('course_management.field.gst_amount'),
      width: 130,
      sortable: true,
      isNumeric: true,
      render: formatAmount,
    },
    {
      key: 'totalFeeAmount',
      title: t('course_management.field.total_fee_amount'),
      width: 150,
      isNumeric: true,
      render: formatAmount,
    },
    {
      key: 'enrollmentDueDate',
      title: t('course_management.field.enrollment_due_date'),
      width: 180,
      sortable: true,
      render: formatSingaporeDateTime,
    },
    {
      key: 'fasApplicationDueDate',
      title: t('course_management.field.fas_application_due_date'),
      width: 190,
      sortable: true,
      render: formatSingaporeDateTime,
    },
    {
      key: 'startDate',
      title: t('course_management.field.start_date'),
      width: 170,
      sortable: true,
      render: formatSingaporeDateTime,
    },
    {
      key: 'endDate',
      title: t('course_management.field.end_date'),
      width: 170,
      sortable: true,
      render: formatSingaporeDateTime,
    },
    {
      key: 'enrollmentCount',
      title: t('course_management.field.enrollment_count'),
      width: 150,
      sortable: true,
      isNumeric: true,
      render: formatAmount,
    },
    {
      key: 'actions',
      title: '',
      width: 70,
      render: (_, row) => {
        const actions = []
        if (row.status === 'Draft' || row.status === 'Enrolling') {
          actions.push({ title: t('button.edit'), onClick: () => onEdit(row) })
        }
        if (row.status === 'Draft') {
          actions.push({ title: t('button.delete'), onClick: () => onDelete(row) })
        }
        if (row.status === 'Enrolling') {
          actions.push({
            title: t('enrollment_management.action.manage_students'),
            onClick: () => onManageStudents(row),
          })
        }
        if (row.status === 'Upcoming' || row.status === 'InProgress' || row.status === 'Closed') {
          actions.push({
            title: t('enrollment_management.action.view_students'),
            onClick: () => onManageStudents(row),
          })
        }
        return <ActionMenu actions={actions} />
      },
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
    />
  )
}

export default CourseManagementTableSection
