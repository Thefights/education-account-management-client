import ManualAccountResultSection from '@/features/manual-account-creation/components/ManualAccountResultSection'
import GenericImportSection from '@/shared/components/dialogs/commons/GenericImportSection'
import { ApiUrls } from '@/shared/api/apiUrls'
import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import NricInput from '@/shared/components/textFields/NricInput'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { minLen } from '@/shared/utils/validateUtil'
import { Card, Flex, Typography, message } from 'antd'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import EServiceAccountsFilterSection from '../components/EServiceAccountsFilterSection'
import EServiceAccountsTableSection from '../components/EServiceAccountsTableSection'
import EServiceAccountsToolbarSection from '../components/EServiceAccountsToolbarSection'

const defaultFilters = { search: '', statuses: [] }

const EServiceAccountsPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ key: 'createdDate', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [openCreate, setOpenCreate] = useState(() => Boolean(location.state?.openCreate))
  const [openImport, setOpenImport] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const { submit: submitAccounts } = useAxiosSubmit({
    url: ApiUrls.EDUCATION_ACCOUNT.INDEX,
    method: 'POST',
  })
  const { submit: submitImport } = useAxiosSubmit({
    url: ApiUrls.EDUCATION_ACCOUNT.IMPORT,
    method: 'POST',
  })
  const queryParams = useMemo(
    () => ({ ...filters, sort: `${sort.key} ${sort.direction}`, page, pageSize }),
    [filters, page, pageSize, sort]
  )
  const createFields = useMemo(
    () => [
      {
        key: 'nric',
        title: t('education_account.nric'),
        type: 'custom',
        render: ({ value, onChange }) => (
          <NricInput value={value} onChange={onChange} placeholder="S1234567D" />
        ),
      },
      {
        key: 'reason',
        title: t('education_account.reason'),
        multiple: 5,
        validate: [minLen(20, t('education_account.reason_min'))],
        props: {
          placeholder: t('education_account.reason_placeholder'),
        },
      },
    ],
    [t]
  )
  const importFields = useMemo(
    () => [
      {
        key: 'file',
        title: t('education_account.csv_file'),
        type: 'file',
        buttonText: t('education_account.select_csv'),
        props: { accept: '.csv,text/csv' },
      },
    ],
    [t]
  )
  const accounts = useFetch(ApiUrls.EDUCATION_ACCOUNT.INDEX, queryParams, [queryParams])

  const handleImport = async (values) => {
    if (!values.file?.name?.toLowerCase().endsWith('.csv')) {
      message.error(t('education_account.csv_only'))
      return
    }

    const formData = new FormData()
    formData.append('file', values.file)
    const response = await submitImport({ overrideData: formData })
    const result = response?.data
    setImportResult(result || null)
    if (result?.succeeded) await accounts.fetch()
  }

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('education_account.management_title')}
        </Typography.Title>
        <EServiceAccountsToolbarSection
          onCreate={() => setOpenCreate(true)}
          onImport={() => setOpenImport(true)}
        />
        <EServiceAccountsFilterSection
          filters={filters}
          onFilter={(values) => {
            setFilters(values)
            setPage(1)
          }}
          onReset={() => {
            setFilters(defaultFilters)
            setPage(1)
          }}
        />
        <EServiceAccountsTableSection
          accounts={accounts.data?.collection}
          loading={accounts.loading}
          sort={sort}
          setSort={setSort}
          onView={(account) =>
            navigate(
              routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.EDUCATION_ACCOUNTS.DETAIL(account.id))
            )
          }
          onCreate={() => setOpenCreate(true)}
          onImport={() => setOpenImport(true)}
        />
        <GenericTablePagination
          totalCount={accounts.data?.totalCount}
          totalPage={accounts.data?.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      </Flex>
      <GenericFormDialog
        open={openCreate}
        onClose={() => {
          setOpenCreate(false)
        }}
        title={t('education_account.create_title')}
        submitLabel={t('button.create')}
        initialValues={{ nric: location.state?.nric || '', reason: location.state?.reason || '' }}
        fields={createFields}
        destroyOnClose
        onSubmit={async ({ values, setField }) => {
          const response = await submitAccounts({ overrideData: values })
          if (!response?.data) return
          setField('nric', '')
          setField('reason', '')
          setOpenCreate(false)
          await accounts.fetch()
        }}
      />
      <GenericImportSection
        open={openImport}
        onClose={() => {
          setImportResult(null)
          setOpenImport(false)
        }}
        title={t('education_account.import_title')}
        submitLabel={t('education_account.import_csv')}
        fields={importFields}
        result={importResult}
        renderResult={(result) => <ManualAccountResultSection result={result} />}
        onSubmit={handleImport}
      />
    </Card>
  )
}

export default EServiceAccountsPage
