import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultManagementStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'

const formatAmount = (value) => (value == null ? null : Number(value).toLocaleString())

const CourseManagementTableSection = ({
  courses,
  loading,
  sort,
  setSort,
  onEdit,
  onDelete,
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
      key: 'courseName',
      title: t('course_management.field.course_name'),
      width: 220,
      sortable: true,
    },
    { key: 'schoolName', title: t('course_management.field.school'), width: 200, sortable: true },
    {
      key: 'status',
      title: t('course_management.field.status'),
      width: 120,
      sortable: true,
      type: 'tag',
      options: _enum.courseStatusOptions,
      color: defaultManagementStatusStyle,
    },
    { key: 'description', title: t('course_management.field.description'), width: 280 },
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
      key: 'actions',
      title: '',
      width: 70,
      render: (_, row) => (
        <ActionMenu
          actions={[
            { title: t('button.edit'), onClick: () => onEdit(row) },
            { title: t('button.delete'), onClick: () => onDelete(row) },
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
    />
  )
}

export default CourseManagementTableSection
