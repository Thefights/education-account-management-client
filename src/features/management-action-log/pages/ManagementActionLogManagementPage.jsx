import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { routeUrls } from '@/shared/config/routeUrls'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { downloadCsv } from '@/shared/utils/downloadFile'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ManagementActionLogManagementExportSection from '../components/ManagementActionLogManagementExportSection'
import ManagementActionLogManagementFilterSection from '../components/ManagementActionLogManagementFilterSection'
import ManagementActionLogManagementTableSection from '../components/ManagementActionLogManagementTableSection'
import ManagementActionLogManagementToolbarSection from '../components/ManagementActionLogManagementToolbarSection'

const defaultFilters = {
  search: '',
  entityTypes: [],
  actions: [],
  occurredFrom: '',
  occurredTo: '',
}

const defaultSort = {
  key: 'occurredAt',
  direction: 'desc',
}

const getNullableDateTime = (value) => value || null

const ManagementActionLogManagementPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState(defaultSort)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [openExport, setOpenExport] = useState(false)

  const queryParams = useMemo(
    () => ({
      sort: `${sort.key} ${sort.direction}`,
      ...filters,
      page,
      pageSize,
    }),
    [filters, page, pageSize, sort]
  )

  const getLogs = useFetch(ApiUrls.MANAGEMENT_ACTION_LOG.MANAGEMENT.INDEX, queryParams, [
    queryParams,
  ])

  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
  }

  const handleResetFilter = () => {
    setFilters(defaultFilters)
    setPage(1)
  }

  const handleDetail = (row) => {
    navigate(routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.LOGS.MANAGEMENT_ACTION_DETAIL(row.id)))
  }

  const handleExport = async (fields) => {
    const exportFilter = {
      sort: `${sort.key} ${sort.direction}`,
      search: filters.search ?? '',
      entityTypes: filters.entityTypes ?? [],
      actions: filters.actions ?? [],
      occurredFrom: getNullableDateTime(filters.occurredFrom),
      occurredTo: getNullableDateTime(filters.occurredTo),
    }

    await downloadCsv(
      ApiUrls.MANAGEMENT_ACTION_LOG.MANAGEMENT.EXPORT,
      {},
      {
        method: 'POST',
        data: {
          filter: exportFilter,
          fields,
        },
        filenamePrefix: 'management-action-logs',
      }
    )
  }

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('management_action_log.title.management')}
        </Typography.Title>

        <ManagementActionLogManagementToolbarSection onExport={() => setOpenExport(true)} />

        <ManagementActionLogManagementFilterSection
          filters={filters}
          defaultFilters={defaultFilters}
          onFilter={handleFilter}
          onReset={handleResetFilter}
          loading={getLogs.loading}
        />

        <ManagementActionLogManagementTableSection
          logs={getLogs.data?.collection}
          loading={getLogs.loading}
          sort={sort}
          setSort={setSort}
          onDetail={handleDetail}
        />

        <GenericTablePagination
          totalCount={getLogs.data?.totalCount}
          totalPage={getLogs.data?.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={getLogs.loading}
        />
      </Flex>

      <ManagementActionLogManagementExportSection
        open={openExport}
        onClose={() => setOpenExport(false)}
        onSubmit={handleExport}
      />
    </Card>
  )
}

export default ManagementActionLogManagementPage
