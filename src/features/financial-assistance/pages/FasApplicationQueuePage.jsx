import FasApplicationQueueFilterSection from '@/features/financial-assistance/components/FasApplicationQueueFilterSection'
import FasApplicationReviewDialog from '@/features/financial-assistance/components/FasApplicationReviewDialog'
import FasStatusTag from '@/features/financial-assistance/components/FasStatusTag'
import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import GenericTable from '@/shared/components/tables/GenericTable'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'

const defaultFilters = {
  search: '',
  statuses: [],
  submittedFrom: '',
  submittedTo: '',
}

const sortFields = {
  applicationNumber: 'applicationNumber',
  accountName: 'accountName',
  accountNumber: 'accountNumber',
  schemeName: 'schemeName',
  status: 'status',
  submittedAt: 'createdAt',
}

const FasApplicationQueuePage = () => {
  const { t } = useTranslation()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ key: 'status', direction: 'asc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [application, setApplication] = useState(null)

  const params = useMemo(
    () => ({
      search: filters.search || undefined,
      statuses: filters.statuses?.length ? filters.statuses : undefined,
      submittedFrom: filters.submittedFrom || undefined,
      submittedTo: filters.submittedTo || undefined,
      sort:
        sort.key === 'status' && sort.direction === 'asc'
          ? 'status asc,createdAt desc'
          : `${sortFields[sort.key] || sort.key} ${sort.direction}`,
      page,
      pageSize,
    }),
    [filters, sort, page, pageSize]
  )
  const applications = useFetch(ApiUrls.FAS_APPLICATION_MANAGEMENT.INDEX, params, [params])
  const detail = useAxiosSubmit({ method: 'GET' })
  const approve = useAxiosSubmit({ method: 'POST' })
  const reject = useAxiosSubmit({ method: 'POST' })
  const pageData = applications.data || { collection: [], totalCount: 0, totalPage: 0 }

  const openDetail = async (row) => {
    const response = await detail.submit({
      overrideUrl: ApiUrls.FAS_APPLICATION_MANAGEMENT.DETAIL(row.id),
    })
    if (response) setApplication(response.data)
  }

  const refreshAndClose = async (response) => {
    if (!response) return
    setApplication(null)
    await applications.fetch()
  }

  const fields = [
    { key: 'applicationNumber', title: t('financial_assistance.field.application_number'), sortable: true },
    { key: 'accountNumber', title: t('financial_assistance.admin.field.account_number'), sortable: true },
    { key: 'accountName', title: t('financial_assistance.admin.field.account_name'), sortable: true },
    { key: 'schemeName', title: t('financial_assistance.field.scheme_name'), sortable: true },
    {
      key: 'status',
      title: t('financial_assistance.field.status'),
      sortable: true,
      render: (value) => <FasStatusTag status={value} />,
    },
    {
      key: 'submittedAt',
      title: t('financial_assistance.field.submitted_date'),
      sortable: true,
      render: (value) => formatDatetimeStringBasedOnCurrentLanguage(value),
    },
  ]

  const mutationLoading = approve.loading || reject.loading

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('financial_assistance.admin.application_queue.title')}
        </Typography.Title>
        <FasApplicationQueueFilterSection
          filters={filters}
          loading={applications.loading}
          onFilter={(value) => {
            setFilters(value)
            setPage(1)
          }}
          onReset={() => {
            setFilters(defaultFilters)
            setPage(1)
          }}
        />
        <GenericTable
          data={pageData.collection}
          fields={fields}
          rowKey="id"
          sort={sort}
          setSort={setSort}
          loading={applications.loading || detail.loading || mutationLoading}
          onRowClick={openDetail}
        />
        <GenericTablePagination
          totalCount={pageData.totalCount}
          totalPage={pageData.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={applications.loading}
        />
      </Flex>
      {application ? (
        <FasApplicationReviewDialog
          detail={application}
          loading={mutationLoading}
          onClose={() => setApplication(null)}
          onApprove={async (payload) =>
            refreshAndClose(
              await approve.submit({
                overrideUrl: ApiUrls.FAS_APPLICATION_MANAGEMENT.APPROVE(application.id),
                overrideData: payload,
              })
            )
          }
          onReject={async (payload) =>
            refreshAndClose(
              await reject.submit({
                overrideUrl: ApiUrls.FAS_APPLICATION_MANAGEMENT.REJECT(application.id),
                overrideData: payload,
              })
            )
          }
        />
      ) : null}
    </Card>
  )
}

export default FasApplicationQueuePage
