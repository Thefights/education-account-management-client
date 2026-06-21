import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { routeUrls } from '@/shared/config/routeUrls'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopupHistoryFilterSection from '../components/TopupHistoryFilterSection'
import TopupHistoryTableSection from '../components/TopupHistoryTableSection'

const defaultFilters = {
  search: '',
  sourceTypes: [],
  statuses: [],
  createdFrom: '',
  createdTo: '',
}

const TopupHistoryPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState({ key: 'createdAt', direction: 'desc' })
  const [filters, setFilters] = useState(defaultFilters)

  const params = useMemo(
    () => ({
      page,
      pageSize,
      sort: `${sort.key} ${sort.direction}`,
      search: filters.search,
      sourceTypes: filters.sourceTypes,
      statuses: filters.statuses,
      createdFrom: filters.createdFrom,
      createdTo: filters.createdTo,
    }),
    [filters, page, pageSize, sort]
  )
  const history = useFetch(ApiUrls.TOPUP.HISTORY, params, [params])

  return (
    <Card>
      <Flex vertical gap={16}>
        <Flex align="center" gap={12}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() =>
              navigate(routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.INDEX))
            }
          />
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t('topup.history_title')}
          </Typography.Title>
        </Flex>
        <TopupHistoryFilterSection
          filters={filters}
          loading={history.loading}
          onFilter={(newFilters) => {
            setFilters(newFilters)
            setPage(1)
          }}
          onReset={() => {
            setFilters(defaultFilters)
            setPage(1)
          }}
        />

        <TopupHistoryTableSection
          history={history.data?.collection}
          loading={history.loading}
          sort={sort}
          setSort={setSort}
        />
        <GenericTablePagination
          totalCount={history.data?.totalCount}
          totalPage={history.data?.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={history.loading}
        />
      </Flex>
    </Card>
  )
}

export default TopupHistoryPage
