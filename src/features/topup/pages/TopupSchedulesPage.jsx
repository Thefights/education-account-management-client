import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { routeUrls } from '@/shared/config/routeUrls'
import useFetch from '@/shared/hooks/useFetch'
import { Flex } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopupConfigurationToolbarSection from '../components/TopupConfigurationToolbarSection'
import TopupScheduleFilterSection from '../components/TopupScheduleFilterSection'
import TopupScheduleTableSection from '../components/TopupScheduleTableSection'

const defaultFilters = { name: '', frequencies: [], statuses: [], createdFrom: '', createdTo: '' }
const defaultSort = { key: 'id', direction: 'desc' }

const TopupSchedulesPage = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState(defaultSort)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const queryParams = useMemo(
    () => ({
      sort: `${sort.key} ${sort.direction}`,
      name: filters.name,
      frequencies: filters.frequencies,
      statuses: filters.statuses,
      createdFrom: filters.createdFrom,
      createdTo: filters.createdTo,
      page,
      pageSize,
    }),
    [sort, filters, page, pageSize]
  )
  const schedules = useFetch(ApiUrls.SCHEDULE_TOPUP.INDEX, queryParams, [queryParams])
  const loading = schedules.loading

  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
  }
  return (
    <Flex vertical gap={16}>
      <TopupConfigurationToolbarSection
        loading={loading}
        onCreate={() =>
          navigate(routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.SCHEDULE_CREATE))
        }
      />
      <TopupScheduleFilterSection
        filters={filters}
        loading={loading}
        onFilter={handleFilter}
        onReset={() => handleFilter(defaultFilters)}
      />
      <TopupScheduleTableSection
        schedules={schedules.data?.collection}
        loading={loading}
        sort={sort}
        setSort={setSort}
        onDetail={(row) =>
          navigate(
            routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.SCHEDULE_DETAIL(row.id))
          )
        }
      />
      <GenericTablePagination
        totalCount={schedules.data?.totalCount}
        totalPage={schedules.data?.totalPage}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        loading={loading}
      />
    </Flex>
  )
}

export default TopupSchedulesPage
