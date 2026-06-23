import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { routeUrls } from '@/shared/config/routeUrls'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDateBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Card, Descriptions, Flex, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopupHistoryDetailFilterSection from '../components/TopupHistoryDetailFilterSection'
import TopupHistoryDetailTableSection from '../components/TopupHistoryDetailTableSection'

const defaultFilters = { accountNumber: '', statuses: [] }

const TopupHistoryDetailPage = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState({ key: 'createdAt', direction: 'desc' })
  const [filters, setFilters] = useState(defaultFilters)
  const detail = useFetch(ApiUrls.TOPUP.HISTORY_DETAIL(id), {}, [id])
  const targetParams = useMemo(
    () => ({
      page,
      pageSize,
      sort: `${sort.key} ${sort.direction}`,
      accountNumber: filters.accountNumber,
      statuses: filters.statuses,
    }),
    [filters, page, pageSize, sort]
  )
  const targets = useFetch(ApiUrls.TOPUP.HISTORY_TARGETS(id), targetParams, [id, targetParams])
  const data = detail.data

  return (
    <Flex vertical gap={16}>
      <Card loading={detail.loading}>
        <Flex vertical gap={16}>
          <Flex align="center" gap={12}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() =>
                navigate(routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.HISTORY))
              }
            />
            <Typography.Title level={4} style={{ margin: 0 }}>
              {data?.executionCode || t('topup.execution_detail')}
            </Typography.Title>
          </Flex>
          <Descriptions bordered column={{ xs: 1, md: 2, lg: 3 }}>
            <Descriptions.Item label={t('topup.source')}>
              <Tag>{data?.sourceType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('topup.status')}>
              <Tag>{data?.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('topup.rule_name')}>
              {data?.ruleNameSnapshot}
            </Descriptions.Item>
            <Descriptions.Item label={t('topup.total_targets')}>
              {data?.totalTargetCount}
            </Descriptions.Item>
            <Descriptions.Item label={t('topup.succeeded')}>{data?.successCount}</Descriptions.Item>
            <Descriptions.Item label={t('topup.failed')}>{data?.failedCount}</Descriptions.Item>
            <Descriptions.Item label={t('topup.amount')}>
              {data?.totalExecutedAmount}
            </Descriptions.Item>
            <Descriptions.Item label={t('topup.reason')}>{data?.manualReason}</Descriptions.Item>
            <Descriptions.Item label={t('topup.created_at')}>
              {formatDateBasedOnCurrentLanguage(data?.createdAt)}
            </Descriptions.Item>
          </Descriptions>
        </Flex>
      </Card>
      <Card>
        <Flex vertical gap={16}>
          <TopupHistoryDetailFilterSection
            filters={filters}
            loading={targets.loading}
            onFilter={(newFilters) => {
              setFilters(newFilters)
              setPage(1)
            }}
            onReset={() => {
              setFilters(defaultFilters)
              setPage(1)
            }}
          />
          <TopupHistoryDetailTableSection
            targets={targets.data?.collection}
            loading={targets.loading}
            sort={sort}
            setSort={setSort}
          />
          <GenericTablePagination
            totalCount={targets.data?.totalCount}
            totalPage={targets.data?.totalPage}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            loading={targets.loading}
          />
        </Flex>
      </Card>
    </Flex>
  )
}

export default TopupHistoryDetailPage
