import { ApiUrls } from '@/shared/api/apiUrls'
import GenericImportSection from '@/shared/components/dialogs/commons/GenericImportSection'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { csvImportTemplates } from '@/shared/config/csvImportTemplates'
import useApiOptions from '@/shared/hooks/useApiOptions'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import AdminManagementFilterSection from '../components/AdminManagementFilterSection'
import AdminManagementFormSection from '../components/AdminManagementFormSection'
import AdminManagementTableSection from '../components/AdminManagementTableSection'
import AdminManagementToolbarSection from '../components/AdminManagementToolbarSection'

const defaultFilters = { search: '', roles: [], statuses: [], schoolIds: [] }
const defaultSort = { key: 'id', direction: 'desc' }

const AdminManagementPage = () => {
  const { t } = useTranslation()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState(defaultSort)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openImport, setOpenImport] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [selectedRow, setSelectedRow] = useState({})
  const [selectedIds, setSelectedIds] = useState([])
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
  const updateStatus = useAxiosSubmit({
    url: ApiUrls.ADMIN_MANAGEMENT.UPDATE_STATUS,
    method: 'PUT',
  })
  const submitImport = useAxiosSubmit({
    url: ApiUrls.ADMIN_MANAGEMENT.IMPORT,
    method: 'POST',
  })

  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
    setSelectedIds([])
  }

  const handleChangeStatus = async (status) => {
    const response = await updateStatus.submit({ overrideData: { ids: selectedIds, status } })
    if (!response) return
    setSelectedIds([])
    await getAdmins.fetch()
  }

  const handleImport = async (values) => {
    if (!values.file?.name?.toLowerCase().endsWith('.csv')) return

    const formData = new FormData()
    formData.append('file', values.file)
    const response = await submitImport.submit({ overrideData: formData })
    const result = response?.data
    setImportResult(result || null)
    if (result?.succeeded) await getAdmins.fetch()
  }

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('admin_management.title.management')}
        </Typography.Title>
        <AdminManagementToolbarSection
          onCreate={() => setOpenCreate(true)}
          onImport={() => setOpenImport(true)}
          selectedIds={selectedIds}
          onChangeStatus={handleChangeStatus}
          loading={updateStatus.loading}
        />
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
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
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
      <GenericImportSection
        open={openImport}
        onClose={() => {
          setImportResult(null)
          setOpenImport(false)
        }}
        result={importResult}
        template={csvImportTemplates.admins}
        onSubmit={handleImport}
      />
    </Card>
  )
}

export default AdminManagementPage
