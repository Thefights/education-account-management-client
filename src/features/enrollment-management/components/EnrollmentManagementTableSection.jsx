import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import {
  defaultChargeStatusStyle,
  defaultManagementStatusStyle,
} from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'

const isEnrollmentRemovable = (enrollment) =>
  enrollment.courseStatus === 'Draft' && enrollment.chargeStatus == null

const isEnrollmentWithdrawable = (enrollment) =>
  enrollment.status === 'Active' &&
  (enrollment.courseStatus === 'Upcoming' || enrollment.courseStatus === 'InProgress')

const EnrollmentManagementTableSection = ({
  enrollments,
  loading,
  sort,
  setSort,
  selectedIds,
  setSelectedIds,
  onDelete,
  onWithdraw,
  showCourse = true,
  readOnly = false,
  allowWithdraw = false,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const fields = [
    {
      key: 'accountNumber',
      title: t('enrollment_management.field.account_number'),
      width: 170,
      sortable: true,
    },

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
      key: 'enrolledAt',
      title: t('enrollment_management.field.enrolled_at'),
      width: 180,
      sortable: true,
      render: formatDatetimeStringBasedOnCurrentLanguage,
    },
    {
      key: 'status',
      title: t('enrollment_management.field.status'),
      width: 130,
      sortable: true,
      type: 'tag',
      options: _enum.enrollmentStatusOptions,
      color: (status) => (status === 'Withdrawn' ? 'default' : 'success'),
    },
    {
      key: 'chargeStatus',
      title: t('enrollment_management.field.charge_status'),
      width: 150,
      sortable: true,
      type: 'tag',
      options: _enum.chargeStatusOptions,
      color: defaultChargeStatusStyle,
    },
    {
      key: 'grossAmount',
      title: t('enrollment_management.field.gross_amount'),
      width: 140,
      isNumeric: true,
      render: formatCurrencyBasedOnCurrentLanguage,
    },
    {
      key: 'paidAmount',
      title: t('enrollment_management.field.paid_amount'),
      width: 140,
      isNumeric: true,
      render: formatCurrencyBasedOnCurrentLanguage,
    },
    {
      key: 'remainingAmount',
      title: t('enrollment_management.field.remaining_amount'),
      width: 160,
      isNumeric: true,
      render: formatCurrencyBasedOnCurrentLanguage,
    },
    ...(!readOnly || allowWithdraw
      ? [
          {
            key: 'actions',
            title: '',
            width: 70,
            render: (_, row) => (
              <ActionMenu
                actions={[
                  ...(isEnrollmentRemovable(row)
                    ? [{ title: t('button.delete'), onClick: () => onDelete?.(row) }]
                    : []),
                  ...(isEnrollmentWithdrawable(row)
                    ? [
                        {
                          title: t('enrollment_management.action.withdraw'),
                          onClick: () => onWithdraw?.(row),
                        },
                      ]
                    : []),
                ]}
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
      getRowClassName={(row) => (row.status === 'Withdrawn' ? 'withdrawn-enrollment-row' : '')}
    />
  )
}

export default EnrollmentManagementTableSection
