/**
 * Audit log management page for browsing, filtering, sorting, and exporting logs.
 */
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { ApiUrls } from '@/shared/api/apiUrls'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { downloadCsv } from '@/shared/utils/downloadFile'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import AuditLogExportSection from '../components/AuditLogExportSection'
import AuditLogFilterSection from '../components/AuditLogFilterSection'
import AuditLogTableSection from '../components/AuditLogTableSection'

const defaultFilters = {
  search: '',
  categories: [],
  actions: [],
  createdFrom: '',
  createdTo: '',
}

const defaultSort = {
  key: 'createdAt',
  direction: 'desc',
}

const auditLogSortFieldMap = {
  createdAt: 'CreatedAt',
}

const getAuditLogExportSort = (sort) => {
  const field = auditLogSortFieldMap[sort.key] || sort.key
  return `${field} ${sort.direction}`
}

const getNullableDateTime = (value) => value || null

const AuditLogPage = () => {
  const { t } = useTranslation()

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

  const getAuditLogs = useFetch(ApiUrls.AUDIT_LOG.MANAGEMENT.INDEX, queryParams, [queryParams])

  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
  }

  const handleResetFilter = () => {
    setFilters(defaultFilters)
    setPage(1)
  }

  const handleExport = async (fields) => {
    const exportFilter = {
      sort: getAuditLogExportSort(sort),
      search: filters.search ?? '',
      categories: filters.categories ?? [],
      actions: filters.actions ?? [],
      createdFrom: getNullableDateTime(filters.createdFrom),
      createdTo: getNullableDateTime(filters.createdTo),
    }

    await downloadCsv(
      ApiUrls.AUDIT_LOG.MANAGEMENT.EXPORT,
      {},
      {
        method: 'POST',
        data: {
          filter: exportFilter,
          fields,
        },
        headers: {
          'Content-Type': 'application/json',
        },
        filenamePrefix: 'audit-logs',
      }
    )
  }

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('audit_log.title.audit_log_management')}
        </Typography.Title>

        <AuditLogFilterSection
          filters={filters}
          defaultFilters={defaultFilters}
          onFilter={handleFilter}
          onReset={handleResetFilter}
          loading={getAuditLogs.loading}
        />

        <AuditLogTableSection
          auditLogs={getAuditLogs.data?.collection}
          loading={getAuditLogs.loading}
          sort={sort}
          setSort={setSort}
          onExport={() => setOpenExport(true)}
        />

        <GenericTablePagination
          totalCount={getAuditLogs.data?.totalCount}
          totalPage={getAuditLogs.data?.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={getAuditLogs.loading}
        />
      </Flex>

      <AuditLogExportSection
        open={openExport}
        onClose={() => setOpenExport(false)}
        onSubmit={handleExport}
      />
    </Card>
  )
}

export default AuditLogPage
