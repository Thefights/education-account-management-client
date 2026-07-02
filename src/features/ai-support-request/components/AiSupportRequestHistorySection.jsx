import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import GenericTable from '@/shared/components/tables/GenericTable'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { Card, Space, Tag, Typography } from 'antd'
import { useMemo } from 'react'

const AiSupportRequestHistorySection = ({ requests, loading, page, setPage, pageSize, setPageSize }) => {
  const { t } = useTranslation()
  const fields = useMemo(
    () => [
      { key: 'title', title: t('ai_support_request.field.title'), width: 180 },
      {
        key: 'questionMessage',
        title: t('ai_support_request.field.question'),
        render: (value) => <Typography.Text style={{ whiteSpace: 'pre-wrap' }}>{value}</Typography.Text>,
      },
      {
        key: 'adminResponse',
        title: t('ai_support_request.field.admin_response'),
        render: (value) => <Typography.Text style={{ whiteSpace: 'pre-wrap' }}>{value}</Typography.Text>,
      },
      {
        key: 'status',
        title: t('ai_support_request.field.status'),
        width: 110,
        render: () => <Tag color="success">{t('ai_support_request.status.resolved')}</Tag>,
      },
      {
        key: 'resolvedAt',
        title: t('ai_support_request.field.resolved_at'),
        width: 170,
        render: formatDatetimeStringBasedOnCurrentLanguage,
      },
    ],
    [t]
  )

  return (
    <Card title={t('ai_support_request.title.history')}>
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
        <GenericTable
          data={requests?.collection}
          fields={fields}
          rowKey="id"
          loading={loading}
        />
        <GenericTablePagination
          totalCount={requests?.totalCount}
          totalPage={requests?.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={loading}
        />
      </Space>
    </Card>
  )
}

export default AiSupportRequestHistorySection
