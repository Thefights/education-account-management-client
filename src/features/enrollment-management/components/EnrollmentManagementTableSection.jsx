import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultManagementStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatSingaporeDateTime } from '@/shared/utils/dateTimeUtil'

const chargeStatusColors = {
  Unpaid: 'error',
  PartiallyPaid: 'warning',
  Paid: 'success',
  Outstanding: 'volcano',
}

const formatAmount = (value) =>
  value == null ? null : Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })

const isEnrollmentRemovable = (enrollment) =>
  enrollment.courseStatus === 'Enrolling' && enrollment.chargeStatus == null

const EnrollmentManagementTableSection = ({
  enrollments,
  loading,
  sort,
  setSort,
  selectedIds,
  setSelectedIds,
  onDelete,
  showCourse = true,
  readOnly = false,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const fields = [
    { key: 'id', title: t('enrollment_management.field.id'), width: 80, sortable: true },
    ...(showCourse
      ? [
          {
            key: 'courseCode',
            title: t('enrollment_management.field.course_code'),
            width: 150,
            sortable: true,
          },
          {
            key: 'courseName',
            title: t('enrollment_management.field.course_name'),
            width: 220,
            sortable: true,
          },
          {
            key: 'courseStatus',
            title: t('enrollment_management.field.course_status'),
            width: 130,
            type: 'tag',
            options: _enum.courseStatusOptions,
            color: defaultManagementStatusStyle,
          },
        ]
      : []),
    {
      key: 'citizenNric',
      title: t('enrollment_management.field.nric'),
      width: 140,
      sortable: true,
    },
    {
      key: 'citizenFullName',
      title: t('enrollment_management.field.full_name'),
      width: 200,
      sortable: true,
    },
    { key: 'citizenEmail', title: t('enrollment_management.field.email'), width: 220 },
    { key: 'citizenPhoneNumber', title: t('enrollment_management.field.phone'), width: 150 },
    {
      key: 'accountNumber',
      title: t('enrollment_management.field.account_number'),
      width: 170,
      sortable: true,
    },
    {
      key: 'enrolledAt',
      title: t('enrollment_management.field.enrolled_at'),
      width: 180,
      sortable: true,
      render: formatSingaporeDateTime,
    },
    {
      key: 'chargeStatus',
      title: t('enrollment_management.field.charge_status'),
      width: 150,
      sortable: true,
      type: 'tag',
      options: _enum.chargeStatusOptions,
      color: (status) => chargeStatusColors[status] || 'default',
    },
    {
      key: 'grossAmount',
      title: t('enrollment_management.field.gross_amount'),
      width: 140,
      isNumeric: true,
      render: formatAmount,
    },
    {
      key: 'paidAmount',
      title: t('enrollment_management.field.paid_amount'),
      width: 140,
      isNumeric: true,
      render: formatAmount,
    },
    {
      key: 'remainingAmount',
      title: t('enrollment_management.field.remaining_amount'),
      width: 160,
      isNumeric: true,
      render: formatAmount,
    },
    ...(!readOnly
      ? [
          {
            key: 'actions',
            title: '',
            width: 70,
            render: (_, row) => (
              <ActionMenu
                actions={
                  isEnrollmentRemovable(row)
                    ? [{ title: t('button.delete'), onClick: () => onDelete?.(row) }]
                    : []
                }
              />
            ),
          },
        ]
      : []),
  ]

  return (
    <GenericTable
      data={enrollments}
      fields={fields}
      rowKey="id"
      loading={loading}
      sort={sort}
      setSort={setSort}
      canSelectRows={!readOnly}
      selectedRows={selectedIds}
      setSelectedRows={setSelectedIds}
      isRowSelectable={isEnrollmentRemovable}
    />
  )
}

export default EnrollmentManagementTableSection
