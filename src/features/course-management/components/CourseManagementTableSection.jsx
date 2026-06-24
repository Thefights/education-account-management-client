import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultManagementStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'

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
  onDetail,
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
      key: 'description',
      title: t('course_management.field.description'),
      width: 300,
      sortable: true,
      render: (desc) => (
        <div
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          title={desc}
        >
          {desc || '-'}
        </div>
      ),
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
      onRowClick={onDetail}
    />
  )
}

export default CourseManagementTableSection
