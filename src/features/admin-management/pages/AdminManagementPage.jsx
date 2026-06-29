import { ApiUrls } from '@/shared/api/apiUrls'
import GenericImportSection from '@/shared/components/dialogs/commons/GenericImportSection'
import BulkActionBar from '@/shared/components/generals/BulkActionBar'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { csvImportTemplates } from '@/shared/config/csvImportTemplates'
import { routeUrls } from '@/shared/config/routeUrls'
import useApiOptions from '@/shared/hooks/useApiOptions'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useReasonConfirm from '@/shared/hooks/useReasonConfirm'
import useTranslation from '@/shared/hooks/useTranslation'
import { getImportErrorResult } from '@/shared/utils/importResultUtil'
import { CheckCircleOutlined, StopOutlined } from '@ant-design/icons'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminManagementFilterSection from '../components/AdminManagementFilterSection'
import AdminManagementFormSection from '../components/AdminManagementFormSection'
import AdminManagementTableSection from '../components/AdminManagementTableSection'
import AdminManagementToolbarSection from '../components/AdminManagementToolbarSection'

const defaultFilters = { search: '', roles: [], statuses: [], schoolIds: [] }
const defaultSort = { key: 'id', direction: 'desc' }

const AdminManagementPage = () => {
  const { t } = useTranslation()
  const confirmReason = useReasonConfirm()
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState(defaultSort)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [openCreate, setOpenCreate] = useState(false)
  const [openImport, setOpenImport] = useState(false)
  const [importResult, setImportResult] = useState(null)
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
  const updateStatus = useAxiosSubmit({
    url: ApiUrls.ADMIN_MANAGEMENT.UPDATE_STATUS,
    method: 'PUT',
  })
  const submitImport = useAxiosSubmit({
    url: ApiUrls.ADMIN_MANAGEMENT.IMPORT,
    method: 'POST',
    onError: async (error) => {
      setImportResult(getImportErrorResult(error))
    },
  })

  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
    setSelectedIds([])
  }

  const handleChangeStatus = async (status) => {
    const reason = await confirmReason({
      title: status === 1 ? t('button.activate') : t('button.deactivate'),
      description: `${selectedIds.length} ${t('text.selected').toLowerCase()}`,
      confirmColor: status === 1 ? 'primary' : 'error',
      confirmText: status === 1 ? t('button.activate') : t('button.deactivate'),
    })
    if (!reason) return
    const response = await updateStatus.submit({
      overrideData: { ids: selectedIds, status, reason },
    })
    if (!response) return
    setSelectedIds([])
    await getAdmins.fetch()
  }

  const handleImport = async (values) => {
    if (!values.file?.name?.toLowerCase().endsWith('.csv')) return

    const formData = new FormData()
    formData.append('file', values.file)
    const response = await submitImport.submit({ overrideData: formData })
    if (!response) return
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
          onDetail={(row) => {
            navigate(
              routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.ADMIN_MANAGEMENT.DETAIL(row.userId))
            )
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
        <BulkActionBar
          selectedCount={selectedIds.length}
          loading={updateStatus.loading}
          onClear={() => setSelectedIds([])}
          actions={[
            {
              key: 'activate',
              label: t('button.activate'),
              icon: <CheckCircleOutlined />,
              onClick: () => handleChangeStatus(1),
            },
            {
              key: 'deactivate',
              label: t('button.deactivate'),
              icon: <StopOutlined />,
              danger: true,
              onClick: () => handleChangeStatus(2),
            },
          ]}
        />
      </Flex>
      <AdminManagementFormSection
        openCreate={openCreate}
        setOpenCreate={setOpenCreate}
        openUpdate={false}
        setOpenUpdate={() => {}}
        selectedRow={{}}
        onCreateSubmit={createAdmin.submit}
        onUpdateSubmit={async () => undefined}
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
