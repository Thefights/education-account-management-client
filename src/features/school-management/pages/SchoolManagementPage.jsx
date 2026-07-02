import { ApiUrls } from '@/shared/api/apiUrls'
import GenericImportSection from '@/shared/components/dialogs/commons/GenericImportSection'
import BulkActionBar from '@/shared/components/generals/BulkActionBar'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { csvImportTemplates } from '@/shared/config/csvImportTemplates'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useReasonConfirm from '@/shared/hooks/useReasonConfirm'
import useTranslation from '@/shared/hooks/useTranslation'
import { getStatusActionMeta } from '@/shared/utils/bulkStatusActionUtil'
import { getImportErrorResult } from '@/shared/utils/importResultUtil'
import { CheckCircleOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SchoolManagementFilterSection from '../components/SchoolManagementFilterSection'
import SchoolManagementFormSection from '../components/SchoolManagementFormSection'
import SchoolManagementTableSection from '../components/SchoolManagementTableSection'
import SchoolManagementToolbarSection from '../components/SchoolManagementToolbarSection'

const defaultFilters = { search: '', statuses: [] }

const SchoolManagementPage = () => {
  const { t } = useTranslation()
  const confirmReason = useReasonConfirm()
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ key: 'id', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [openCreate, setOpenCreate] = useState(false)
  const [openImport, setOpenImport] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])

  const queryParams = useMemo(
    () => ({ sort: `${sort.key} ${sort.direction}`, ...filters, page, pageSize }),
    [sort, filters, page, pageSize]
  )
  const schools = useFetch(ApiUrls.SCHOOL_MANAGEMENT.INDEX, queryParams, [queryParams])
  const activateMeta = useMemo(
    () =>
      getStatusActionMeta({
        records: schools.data?.collection,
        selectedIds,
        targetStatus: EnumConfig.SchoolStatus.Active,
      }),
    [schools.data?.collection, selectedIds]
  )
  const deactivateMeta = useMemo(
    () =>
      getStatusActionMeta({
        records: schools.data?.collection,
        selectedIds,
        targetStatus: EnumConfig.SchoolStatus.Inactive,
      }),
    [schools.data?.collection, selectedIds]
  )
  const createSchool = useAxiosSubmit({
    url: ApiUrls.SCHOOL_MANAGEMENT.INDEX,
    method: 'POST',
  })
  const updateStatus = useAxiosSubmit({
    url: ApiUrls.SCHOOL_MANAGEMENT.UPDATE_STATUS,
    method: 'PUT',
  })
  const deleteSelectedSchools = useAxiosSubmit({
    url: ApiUrls.SCHOOL_MANAGEMENT.DELETE_SELECTED,
    method: 'DELETE',
  })
  const submitImport = useAxiosSubmit({
    url: ApiUrls.SCHOOL_MANAGEMENT.IMPORT,
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
    const actionMeta = status === 1 ? activateMeta : deactivateMeta
    if (!actionMeta.hasActionable) return

    const reason = await confirmReason({
      title: status === 1 ? t('button.activate') : t('button.deactivate'),
      description: t('text.status_update_selection_description', { count: selectedIds.length }),
      confirmColor: status === 1 ? 'primary' : 'error',
      confirmText: status === 1 ? t('button.activate') : t('button.deactivate'),
    })
    if (!reason) return
    const response = await updateStatus.submit({
      overrideData: { ids: actionMeta.actionableIds, status, reason },
    })
    if (!response) return
    setSelectedIds([])
    await schools.fetch()
  }

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return
    const reason = await confirmReason({
      title: t('button.delete'),
      description: `${selectedIds.length} ${t('text.selected').toLowerCase()}`,
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!reason) return
    const response = await deleteSelectedSchools.submit({
      overrideData: { ids: selectedIds, reason },
    })
    if (!response) return
    setSelectedIds([])
    await schools.fetch()
  }

  const handleImport = async (values) => {
    if (!values.file?.name?.toLowerCase().endsWith('.csv')) return

    const formData = new FormData()
    formData.append('file', values.file)
    const response = await submitImport.submit({ overrideData: formData })
    if (!response) return
    const result = response?.data
    setImportResult(result || null)
    if (result?.succeeded) await schools.fetch()
  }

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('school_management.title.management')}
        </Typography.Title>
        <SchoolManagementToolbarSection
          onCreate={() => setOpenCreate(true)}
          onImport={() => setOpenImport(true)}
        />
        <SchoolManagementFilterSection
          filters={filters}
          loading={schools.loading}
          onFilter={handleFilter}
          onReset={() => handleFilter(defaultFilters)}
        />
        <SchoolManagementTableSection
          schools={schools.data?.collection}
          loading={schools.loading || deleteSelectedSchools.loading}
          sort={sort}
          setSort={setSort}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onDetail={(row) =>
            navigate(routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.SCHOOL_MANAGEMENT.DETAIL(row.id)))
          }
        />
        <GenericTablePagination
          totalCount={schools.data?.totalCount}
          totalPage={schools.data?.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={schools.loading}
        />
        <BulkActionBar
          selectedCount={selectedIds.length}
          loading={updateStatus.loading || deleteSelectedSchools.loading}
          onClear={() => setSelectedIds([])}
          actions={[
            {
              key: 'activate',
              label: t('button.activate'),
              icon: <CheckCircleOutlined />,
              disabled: !activateMeta.hasActionable,
              onClick: () => handleChangeStatus(1),
            },
            {
              key: 'deactivate',
              label: t('button.deactivate'),
              icon: <StopOutlined />,
              danger: true,
              disabled: !deactivateMeta.hasActionable,
              onClick: () => handleChangeStatus(2),
            },
            {
              key: 'delete',
              label: t('button.delete'),
              icon: <DeleteOutlined />,
              danger: true,
              onClick: handleDeleteSelected,
            },
          ]}
        />
      </Flex>
      <SchoolManagementFormSection
        openCreate={openCreate}
        setOpenCreate={setOpenCreate}
        onCreateSubmit={createSchool.submit}
        refetch={schools.fetch}
      />
      <GenericImportSection
        open={openImport}
        onClose={() => {
          setImportResult(null)
          setOpenImport(false)
        }}
        result={importResult}
        template={csvImportTemplates.schools}
        onSubmit={handleImport}
      />
    </Card>
  )
}

export default SchoolManagementPage
