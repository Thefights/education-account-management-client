import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import useApiOptions from '@/shared/hooks/useApiOptions'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import AdminManagementFilterSection from '../components/AdminManagementFilterSection'
import AdminManagementFormSection from '../components/AdminManagementFormSection'
import AdminManagementTableSection from '../components/AdminManagementTableSection'

const defaultFilters = { search: '', roles: [], statuses: [], schoolId: '' }
const defaultSort = { key: 'id', direction: 'desc' }

const AdminManagementPage = () => {
  const { t } = useTranslation()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState(defaultSort)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedRow, setSelectedRow] = useState({})
  const schools = useApiOptions({
    url: ApiUrls.SCHOOL_MANAGEMENT.GET_ALL,
    valueKey: 'id',
    labelKey: 'schoolName',
  })

  const queryParams = useMemo(
    () => ({ sort: `${sort.key} ${sort.direction}`, ...filters, page, pageSize }),
    [sort, filters, page, pageSize]
  )
  const getAdmins = useFetch(ApiUrls.ADMIN_MANAGEMENT.INDEX, queryParams, [queryParams])
  const createAdmin = useAxiosSubmit({
    url: ApiUrls.ADMIN_MANAGEMENT.INDEX,
    method: 'POST',
  })
  const updateAdmin = useAxiosSubmit({
    url: ApiUrls.ADMIN_MANAGEMENT.DETAIL(selectedRow.userId),
    method: 'PUT',
  })

  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
  }

  return (
    <Card style={{ flex: 1, width: '100%', border: 0, borderRadius: 0 }}>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('admin_management.title.management')}
        </Typography.Title>
        <AdminManagementFilterSection
          filters={filters}
          loading={getAdmins.loading}
          onFilter={handleFilter}
          onReset={() => handleFilter(defaultFilters)}
          schoolOptions={schools.options}
          schoolsLoading={schools.loading}
        />
        <AdminManagementTableSection
          admins={getAdmins.data?.collection}
          loading={getAdmins.loading}
          sort={sort}
          setSort={setSort}
          onCreate={() => setOpenCreate(true)}
          onEdit={(row) => {
            setSelectedRow(row)
            setOpenUpdate(true)
          }}
        />
        <GenericTablePagination
          totalCount={getAdmins.data?.totalCount}
          totalPage={getAdmins.data?.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={getAdmins.loading}
        />
      </Flex>
      <AdminManagementFormSection
        openCreate={openCreate}
        setOpenCreate={setOpenCreate}
        openUpdate={openUpdate}
        setOpenUpdate={setOpenUpdate}
        selectedRow={selectedRow}
        onCreateSubmit={createAdmin.submit}
        onUpdateSubmit={updateAdmin.submit}
        refetch={getAdmins.fetch}
        schoolOptions={schools.options}
        schoolsLoading={schools.loading}
      />
    </Card>
  )
}

export default AdminManagementPage
