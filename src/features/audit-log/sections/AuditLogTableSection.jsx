import GenericTable from '@/shared/components/tables/GenericTable'
import {
  defaultAuditLogActionStyle,
  defaultAuditLogCategoryStyle,
} from '@/app/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { renderEmptyFallback } from '@/shared/utils/handleStringUtil'
import { DownloadOutlined } from '@ant-design/icons'
import { Button, Flex } from 'antd'
import { useMemo } from 'react'

const AuditLogTableSection = ({ auditLogs, loading, sort, setSort, onExport = () => {} }) => {
  const { t } = useTranslation()
  const _enum = useEnum()

  const fields = useMemo(
    () => [
      {
        key: 'id',
        title: t('audit_log.field.id'),
        width: 70,
        sortable: true,
        fixedColumn: true,
      },
      {
        key: 'actorUserIdText',
        title: t('audit_log.field.actor_user_id_text'),
        width: 160,
        sortable: true,
      },
      {
        key: 'actorFullName',
        title: t('audit_log.field.actor_full_name'),
        width: 180,
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
      {
        key: 'action',
        title: t('audit_log.field.action'),
        width: 220,
        sortable: true,
        type: 'tag',
        options: _enum.auditLogActionOptions,
        color: defaultAuditLogActionStyle,
      },
      {
        key: 'object',
        title: t('audit_log.field.object'),
        width: 260,
        sortable: true,
      },
      {
        key: 'ipAddress',
        title: t('audit_log.field.ip_address'),
        width: 150,
        sortable: true,
      },
      {
        key: 'createdAt',
        title: t('audit_log.field.created_at'),
        width: 180,
        sortable: true,
        render: (value) =>
          formatDatetimeStringBasedOnCurrentLanguage(value) || renderEmptyFallback(null),
      },
    ],
    [t, _enum.auditLogActionOptions, _enum.auditLogCategoryOptions]
  )

  return (
    <>
      <Flex justify="end" align="center" gap={12} wrap="wrap" style={{ marginBottom: 12 }}>
        <Button icon={<DownloadOutlined />} onClick={onExport}>
          {t('audit_log.button.export')}
        </Button>
      </Flex>

      <GenericTable
        data={auditLogs}
        fields={fields}
        sort={sort}
        setSort={setSort}
        rowKey="id"
        loading={loading}
      />
    </>
  )
}

export default AuditLogTableSection
