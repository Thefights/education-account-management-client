import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { ApiUrls } from '@/shared/api/apiUrls'
import { EnumConfig } from '@/shared/config/enumConfig'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import ProductManagementFilterSection from './sections/ProductManagementFilterSection'
import ProductManagementFormSection from './sections/ProductManagementFormSection'
import ProductManagementTableSection from './sections/ProductManagementTableSection'

const defaultFilters = {
  search: '',
  status: '',
}

const defaultSort = {
  key: 'id',
  direction: 'desc',
}

const ProductManagementPage = () => {
  const { t } = useTranslation()

  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState(defaultSort)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedRow, setSelectedRow] = useState({})
  const [selectedIds, setSelectedIds] = useState([])

  const queryParams = useMemo(
    () => ({
      sort: `${sort.key} ${sort.direction}`,
      ...filters,
      page,
      pageSize,
    }),
    [sort, filters, page, pageSize]
  )

  const getProducts = useFetch(ApiUrls.PRODUCT.MANAGEMENT.INDEX, queryParams, [queryParams])

  const createProduct = useAxiosSubmit({
    url: ApiUrls.PRODUCT.MANAGEMENT.INDEX,
    method: 'POST',
  })

  const updateProduct = useAxiosSubmit({
    url: ApiUrls.PRODUCT.MANAGEMENT.DETAIL(selectedRow.id),
    method: 'PUT',
  })

  const deleteProduct = useAxiosSubmit({ method: 'DELETE' })
  const updateProductStatus = useAxiosSubmit({
    url: ApiUrls.PRODUCT.MANAGEMENT.UPDATE_STATUS,
    method: 'PUT',
  })

  const refetchProducts = async () => {
    setSelectedIds([])
    await getProducts.fetch()
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

    const response = await deleteProduct.submit({
      overrideUrl: ApiUrls.PRODUCT.MANAGEMENT.DELETE_SELECTED,
      overrideParam: { ids: selectedIds },
    })

    if (!response) return

    await refetchProducts()
  }

  const handleUpdateStatusSelected = async (status) => {
    if (!selectedIds.length) return

    const response = await updateProductStatus.submit({
      overrideData: {
        productIds: selectedIds,
        status,
      },
    })

    if (!response) return

    await refetchProducts()
  }

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('product.title.product_management')}
        </Typography.Title>

        <ProductManagementFilterSection
          filters={filters}
          onFilter={handleFilter}
          onReset={handleResetFilter}
          loading={getProducts.loading}
        />

        <ProductManagementTableSection
          products={getProducts.data?.collection}
          loading={getProducts.loading}
          sort={sort}
          setSort={handleSortChange}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          actionLoading={deleteProduct.loading || updateProductStatus.loading}
          onDeleteSelected={handleDeleteSelected}
          onActivateSelected={() => handleUpdateStatusSelected(EnumConfig.ProductStatus.Active)}
          onDeactivateSelected={() => handleUpdateStatusSelected(EnumConfig.ProductStatus.Inactive)}
          onCreate={() => setOpenCreate(true)}
          onEdit={(row) => {
            setSelectedRow(row)
            setOpenUpdate(true)
          }}
        />

        <GenericTablePagination
          totalCount={getProducts.data?.totalCount}
          totalPage={getProducts.data?.totalPage}
          page={page}
          setPage={handlePageChange}
          pageSize={pageSize}
          setPageSize={handlePageSizeChange}
          loading={getProducts.loading}
        />
      </Flex>

      <ProductManagementFormSection
        openCreate={openCreate}
        setOpenCreate={setOpenCreate}
        openUpdate={openUpdate}
        setOpenUpdate={setOpenUpdate}
        selectedRow={selectedRow}
        onCreateSubmit={createProduct.submit}
        onUpdateSubmit={updateProduct.submit}
        refetch={refetchProducts}
      />
    </Card>
  )
}

export default ProductManagementPage
