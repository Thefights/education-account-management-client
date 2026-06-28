import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { downloadCsv } from '@/shared/utils/downloadFile'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import AuditLogManagementExportSection from '../components/AuditLogManagementExportSection'
import AuditLogManagementFilterSection from '../components/AuditLogManagementFilterSection'
import AuditLogManagementTableSection from '../components/AuditLogManagementTableSection'
import AuditLogManagementToolbarSection from '../components/AuditLogManagementToolbarSection'

const defaultFilters = {
  search: '',
  categories: [],
  action: '',
  occurredFrom: '',
  occurredTo: '',
}

const defaultSort = {
  key: 'occurredAt',
  direction: 'desc',
}

const getNullableDateTime = (value) => value || null

const AuditLogManagementPage = () => {
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
      sort: `${sort.key} ${sort.direction}`,
      search: filters.search ?? '',
      categories: filters.categories ?? [],
      action: filters.action ?? '',
      occurredFrom: getNullableDateTime(filters.occurredFrom),
      occurredTo: getNullableDateTime(filters.occurredTo),
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

        <AuditLogManagementToolbarSection onExport={() => setOpenExport(true)} />

        <AuditLogManagementFilterSection
          filters={filters}
          defaultFilters={defaultFilters}
          onFilter={handleFilter}
          onReset={handleResetFilter}
          loading={getAuditLogs.loading}
        />

        <AuditLogManagementTableSection
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

      <AuditLogManagementExportSection
        open={openExport}
        onClose={() => setOpenExport(false)}
        onSubmit={handleExport}
      />
    </Card>
  )
}

export default AuditLogManagementPage
