import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { routeUrls } from '@/shared/config/routeUrls'
import useFetch from '@/shared/hooks/useFetch'
import { Flex } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopupConfigurationToolbarSection from '../components/TopupConfigurationToolbarSection'
import TopupRuleFilterSection from '../components/TopupRuleFilterSection'
import TopupRuleTableSection from '../components/TopupRuleTableSection'

const defaultFilters = { name: '', statuses: [] }
const defaultSort = { key: 'id', direction: 'desc' }

const TopupRulesPage = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState(defaultSort)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const queryParams = useMemo(
    () => ({
      sort: `${sort.key} ${sort.direction}`,
      name: filters.name,
      statuses: filters.statuses,
      page,
      pageSize,
    }),
    [sort, filters, page, pageSize]
  )
  const rules = useFetch(ApiUrls.SYSTEM_TOPUP.INDEX, queryParams, [queryParams])
  const loading = rules.loading

  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
  }
  return (
    <Flex vertical gap={16}>
      <TopupConfigurationToolbarSection
        loading={loading}
        onCreate={() =>
          navigate(routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.SYSTEM_CREATE))
        }
      />
      <TopupRuleFilterSection
        filters={filters}
        loading={loading}
        onFilter={handleFilter}
        onReset={() => handleFilter(defaultFilters)}
      />
      <TopupRuleTableSection
        rules={rules.data?.collection}
        loading={loading}
        sort={sort}
        setSort={setSort}
        onDetail={(row) =>
          navigate(
            routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.SYSTEM_DETAIL(row.id))
          )
        }
      />
      <GenericTablePagination
        totalCount={rules.data?.totalCount}
        totalPage={rules.data?.totalPage}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        loading={loading}
      />
    </Flex>
  )
}

export default TopupRulesPage
