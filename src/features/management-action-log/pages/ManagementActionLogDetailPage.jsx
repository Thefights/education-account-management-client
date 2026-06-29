import { ApiUrls } from '@/shared/api/apiUrls'
import GenericDetail from '@/shared/components/details/GenericDetail'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { renderEmptyFallback } from '@/shared/utils/handleStringUtil'
import { Typography } from 'antd'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const ManagementActionLogDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const detail = useFetch(ApiUrls.MANAGEMENT_ACTION_LOG.MANAGEMENT.DETAIL(id), {}, [id])
  const log = detail.data

  const fields = useMemo(
    () => [
      {
        key: 'id',
        label: t('management_action_log.field.id'),
      },
      {
        key: 'occurredAt',
        label: t('management_action_log.field.occurred_at'),
        render: (value) =>
          formatDatetimeStringBasedOnCurrentLanguage(value) || renderEmptyFallback(null),
      },
      {
        key: 'batchId',
        label: t('management_action_log.field.batch_id'),
        code: true,
        copyable: true,
      },
      {
        key: 'ipAddress',
        label: t('management_action_log.field.ip_address'),
      },
      {
        key: 'actorUserId',
        label: t('management_action_log.field.actor_user_id'),
      },
      {
        key: 'actorUserRole',
        label: t('management_action_log.field.actor_user_role'),
      },
      {
        key: 'actorFullName',
        label: t('management_action_log.field.actor_full_name'),
      },
      {
        key: 'actorEmail',
        label: t('management_action_log.field.actor_email'),
      },
      {
        key: 'entityType',
        label: t('management_action_log.field.entity_type'),
      },
      {
        key: 'entityId',
        label: t('management_action_log.field.entity_id'),
      },
      {
        key: 'action',
        label: t('management_action_log.field.action'),
      },
      {
        key: 'previousStatus',
        label: t('management_action_log.field.previous_status'),
      },
      {
        key: 'newStatus',
        label: t('management_action_log.field.new_status'),
      },
      {
        key: 'reason',
        label: t('management_action_log.field.reason'),
        span: 2,
        render: (value) => (
          <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
            {renderEmptyFallback(value)}
          </Typography.Paragraph>
        ),
      },
    ],
    [t]
  )

  return (
    <GenericDetail
      title={t('management_action_log.title.detail')}
      data={log}
      fields={fields}
      loading={detail.loading}
      onBack={() => navigate(-1)}
    />
  )
}

export default ManagementActionLogDetailPage
