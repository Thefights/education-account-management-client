import { GenericTablePagination } from '@/components/generals/GenericPagination'
import { ApiUrls } from '@/configs/apiUrls'
import { EnumConfig } from '@/configs/enumConfig'
import useAxiosSubmit from '@/hooks/useAxiosSubmit'
import useFetch from '@/hooks/useFetch'
import useTranslation from '@/hooks/useTranslation'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import AccountManagementFilterSection from './sections/AccountManagementFilterSection'
import AccountManagementFormSection from './sections/AccountManagementFormSection'
import AccountManagementImportSection from './sections/AccountManagementImportSection'
import AccountManagementTableSection from './sections/AccountManagementTableSection'

const defaultFilters = {
  search: '',
  status: '',
  gender: '',
  role: '',
}

const defaultSort = {
  key: 'id',
  direction: 'desc',
}

const toProductOptions = (products = []) =>
  products.map((product) => ({
    value: product.id,
    label: product.name || `#${product.id}`,
    searchKey: [product.id, product.name, product.description].filter(Boolean).join(' '),
  }))

const AccountManagementPage = () => {
  const { t } = useTranslation()

  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState(defaultSort)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openImport, setOpenImport] = useState(false)
  const [selectedRow, setSelectedRow] = useState({})
  const [selectedIds, setSelectedIds] = useState([])
  const [importResult, setImportResult] = useState(null)

  const queryParams = useMemo(
    () => ({
      sort: `${sort.key} ${sort.direction}`,
      ...filters,
      page,
      pageSize,
    }),
    [sort, filters, page, pageSize]
  )

  const getAuthAccounts = useFetch(ApiUrls.AUTH_ACCOUNT.MANAGEMENT.INDEX, queryParams, [
    queryParams,
  ])
  const getProducts = useFetch(ApiUrls.PRODUCT.MANAGEMENT.GET_ALL)

  const productOptions = useMemo(() => toProductOptions(getProducts.data || []), [getProducts.data])

  const createAuthAccount = useAxiosSubmit({
    url: ApiUrls.AUTH_ACCOUNT.MANAGEMENT.INDEX,
    method: 'POST',
  })

  const updateAuthAccount = useAxiosSubmit({
    url: ApiUrls.AUTH_ACCOUNT.MANAGEMENT.DETAIL(selectedRow.id),
    method: 'PUT',
  })

  const deleteAuthAccount = useAxiosSubmit({ method: 'DELETE' })
  const updateAuthAccountStatus = useAxiosSubmit({
    url: ApiUrls.AUTH_ACCOUNT.MANAGEMENT.UPDATE_STATUS,
    method: 'PUT',
  })
  const unlockAuthAccounts = useAxiosSubmit({
    url: ApiUrls.AUTH_ACCOUNT.MANAGEMENT.UNLOCK,
    method: 'PUT',
  })
  const batchImportAuthAccount = useAxiosSubmit({
    url: ApiUrls.AUTH_ACCOUNT.MANAGEMENT.BATCH_IMPORT,
    method: 'POST',
  })

  const refetchAuthAccounts = async () => {
    setSelectedIds([])
    await getAuthAccounts.fetch()
  }

  const handleSortChange = (nextSort) => {
    setSelectedIds([])
    setSort(nextSort)
  }

  const handlePageChange = (nextPage) => {
    setSelectedIds([])
    setPage(nextPage)
  }

  const handlePageSizeChange = (nextPageSize) => {
    setSelectedIds([])
    setPageSize(nextPageSize)
  }

  const handleFilter = (values) => {
    setSelectedIds([])
    setFilters(values)
    setPage(1)
  }

  const handleResetFilter = () => {
    setSelectedIds([])
    setFilters(defaultFilters)
    setPage(1)
  }

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return

    const response = await deleteAuthAccount.submit({
      overrideUrl: ApiUrls.AUTH_ACCOUNT.MANAGEMENT.DELETE_SELECTED,
      overrideParam: { ids: selectedIds },
    })

    if (!response) return

    await refetchAuthAccounts()
  }

  const handleUpdateStatusSelected = async (status) => {
    if (!selectedIds.length) return

    const response = await updateAuthAccountStatus.submit({
      overrideData: {
        authAccountIds: selectedIds,
        status,
      },
    })

    if (!response) return

    await refetchAuthAccounts()
  }

  const handleUnlockSelected = async () => {
    if (!selectedIds.length) return

    const response = await unlockAuthAccounts.submit({
      overrideData: {
        authAccountIds: selectedIds,
      },
    })

    if (!response) return

    await refetchAuthAccounts()
  }

  const handleImportSubmit = async (values) => {
    const response = await batchImportAuthAccount.submit({ overrideData: values })
    const result = response?.data

    if (!result) return

    setImportResult(result)
    if ((result.succeeded ?? result.Succeeded ?? 0) > 0) {
      await refetchAuthAccounts()
    }
  }

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('account.title.account_management')}
        </Typography.Title>

        <AccountManagementFilterSection
          filters={filters}
          onFilter={handleFilter}
          onReset={handleResetFilter}
          loading={getAuthAccounts.loading}
        />

        <AccountManagementTableSection
          accounts={getAuthAccounts.data?.collection}
          productOptions={productOptions}
          loading={getAuthAccounts.loading}
          sort={sort}
          setSort={handleSortChange}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          actionLoading={
            deleteAuthAccount.loading || updateAuthAccountStatus.loading || unlockAuthAccounts.loading
          }
          onDeleteSelected={handleDeleteSelected}
          onActivateSelected={() => handleUpdateStatusSelected(EnumConfig.AuthAccountStatus.Active)}
          onDeactivateSelected={() =>
            handleUpdateStatusSelected(EnumConfig.AuthAccountStatus.Inactive)
          }
          onUnlockSelected={handleUnlockSelected}
          onImport={() => {
            setImportResult(null)
            setOpenImport(true)
          }}
          onCreate={() => setOpenCreate(true)}
          onEdit={(row) => {
            setSelectedRow(row)
            setOpenUpdate(true)
          }}
        />

        <GenericTablePagination
          totalCount={getAuthAccounts.data?.totalCount}
          totalPage={getAuthAccounts.data?.totalPage}
          page={page}
          setPage={handlePageChange}
          pageSize={pageSize}
          setPageSize={handlePageSizeChange}
          loading={getAuthAccounts.loading}
        />
      </Flex>

      <AccountManagementFormSection
        openCreate={openCreate}
        setOpenCreate={setOpenCreate}
        openUpdate={openUpdate}
        setOpenUpdate={setOpenUpdate}
        selectedRow={selectedRow}
        productOptions={productOptions}
        productsLoading={getProducts.loading}
        onCreateSubmit={createAuthAccount.submit}
        onUpdateSubmit={updateAuthAccount.submit}
        refetch={refetchAuthAccounts}
      />

      <AccountManagementImportSection
        open={openImport}
        onClose={() => setOpenImport(false)}
        result={importResult}
        onSubmit={handleImportSubmit}
      />
    </Card>
  )
}

export default AccountManagementPage
