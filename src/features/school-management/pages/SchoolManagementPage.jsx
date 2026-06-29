/** System administrator page for managing schools. */
import { ApiUrls } from '@/shared/api/apiUrls'
import GenericImportSection from '@/shared/components/dialogs/commons/GenericImportSection'
import BulkActionBar from '@/shared/components/generals/BulkActionBar'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { csvImportTemplates } from '@/shared/config/csvImportTemplates'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useConfirm from '@/shared/hooks/useConfirm'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { getImportErrorResult } from '@/shared/utils/importResultUtil'
import { CheckCircleOutlined, StopOutlined } from '@ant-design/icons'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import SchoolManagementFilterSection from '../components/SchoolManagementFilterSection'
import SchoolManagementFormSection from '../components/SchoolManagementFormSection'
import SchoolManagementTableSection from '../components/SchoolManagementTableSection'
import SchoolManagementToolbarSection from '../components/SchoolManagementToolbarSection'

const defaultFilters = { search: '', statuses: [] }

const SchoolManagementPage = () => {
  const { t } = useTranslation()
  const confirm = useConfirm()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ key: 'id', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openImport, setOpenImport] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [selectedRow, setSelectedRow] = useState({})
  const [selectedIds, setSelectedIds] = useState([])

  const queryParams = useMemo(
    () => ({ sort: `${sort.key} ${sort.direction}`, ...filters, page, pageSize }),
    [sort, filters, page, pageSize]
  )
  const schools = useFetch(ApiUrls.SCHOOL_MANAGEMENT.INDEX, queryParams, [queryParams])
  const createSchool = useAxiosSubmit({
    url: ApiUrls.SCHOOL_MANAGEMENT.INDEX,
    method: 'POST',
  })
  const updateSchool = useAxiosSubmit({
    url: ApiUrls.SCHOOL_MANAGEMENT.DETAIL(selectedRow.id),
    method: 'PUT',
  })
  const updateStatus = useAxiosSubmit({
    url: ApiUrls.SCHOOL_MANAGEMENT.UPDATE_STATUS,
    method: 'PUT',
  })
  const deleteSchool = useAxiosSubmit({ method: 'DELETE' })
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
    const response = await updateStatus.submit({ overrideData: { ids: selectedIds, status } })
    if (!response) return
    setSelectedIds([])
    await schools.fetch()
  }

  const handleDelete = async (school) => {
    const accepted = await confirm({
      title: t('school_management.confirm.delete_title'),
      description: t('school_management.confirm.delete_description', { name: school.schoolName }),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!accepted) return
    const response = await deleteSchool.submit({
      overrideUrl: ApiUrls.SCHOOL_MANAGEMENT.DETAIL(school.id),
    })
    if (response) await schools.fetch()
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
          loading={schools.loading || deleteSchool.loading}
          sort={sort}
          setSort={setSort}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onCreate={() => setOpenCreate(true)}
          onEdit={(row) => {
            setSelectedRow(row)
            setOpenUpdate(true)
          }}
          onDelete={handleDelete}
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
      <SchoolManagementFormSection
        openCreate={openCreate}
        setOpenCreate={setOpenCreate}
        openUpdate={openUpdate}
        setOpenUpdate={setOpenUpdate}
        selectedRow={selectedRow}
        onCreateSubmit={createSchool.submit}
        onUpdateSubmit={updateSchool.submit}
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
