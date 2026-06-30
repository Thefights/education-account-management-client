import MaskedNric from '@/shared/components/generals/MaskedNric'
import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultAuditLogCategoryStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { renderEmptyFallback } from '@/shared/utils/handleStringUtil'
import { useMemo } from 'react'

const AuditLogManagementTableSection = ({ auditLogs, loading, sort, setSort }) => {
  const { t } = useTranslation()
  const _enum = useEnum()

  const fields = useMemo(
    () => [
      {
        key: 'occurredAt',
        title: t('audit_log.field.created_at'),
        width: 180,
        sortable: true,
        render: (value) =>
          formatDatetimeStringBasedOnCurrentLanguage(value) || renderEmptyFallback(null),
      },
      {
        key: 'actorUserId',
        title: t('audit_log.field.actor_user_id'),
        width: 160,
        sortable: true,
      },
      {
        key: 'actorUserRole',
        title: t('account.field.roles'),
        width: 180,
        sortable: true,
      },
      {
        key: 'action',
        title: t('audit_log.field.action'),
        width: 220,
        sortable: true,
      },
      {
        key: 'nric',
        title: 'NRIC',
        width: 140,
        sortable: true,
        render: (value) => <MaskedNric value={value} />,
      },
      {
        key: 'ipAddress',
        title: t('audit_log.field.ip_address'),
        width: 150,
        sortable: true,
      },
      {
        key: 'category',
        title: t('audit_log.field.category'),
        width: 170,
        sortable: true,
        type: 'tag',
        options: _enum.auditLogCategoryOptions,
        color: defaultAuditLogCategoryStyle,
      },
    ],
    [t, _enum.auditLogCategoryOptions]
  )

  return (
    <GenericTable
      data={auditLogs}
      fields={fields}
      sort={sort}
      setSort={setSort}
      rowKey="id"
      loading={loading}
    />
  )
}

export default AuditLogManagementTableSection
