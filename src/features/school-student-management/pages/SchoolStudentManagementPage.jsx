import { ApiUrls } from '@/shared/api/apiUrls'
import GenericImportSection from '@/shared/components/dialogs/commons/GenericImportSection'
import BulkActionBar from '@/shared/components/generals/BulkActionBar'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { csvImportTemplates } from '@/shared/config/csvImportTemplates'
import { EnumConfig } from '@/shared/config/enumConfig'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useReasonConfirm from '@/shared/hooks/useReasonConfirm'
import useTranslation from '@/shared/hooks/useTranslation'
import { getStatusActionMeta } from '@/shared/utils/bulkStatusActionUtil'
import { getImportErrorResult } from '@/shared/utils/importResultUtil'
import { CheckCircleOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import SchoolStudentFilterSection from '../components/SchoolStudentFilterSection'
import SchoolStudentFormSection from '../components/SchoolStudentFormSection'
import SchoolStudentTableSection from '../components/SchoolStudentTableSection'
import SchoolStudentToolbarSection from '../components/SchoolStudentToolbarSection'

const defaultFilters = { search: '', statuses: [] }

const SchoolStudentManagementPage = () => {
  const { t } = useTranslation()
  const confirmReason = useReasonConfirm()
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

  const getStudents = useFetch(ApiUrls.SCHOOL_STUDENT_MANAGEMENT.INDEX, queryParams, [queryParams])
  const studentRecords = getStudents.data?.collection || getStudents.data || []
  const activateMeta = useMemo(
    () =>
      getStatusActionMeta({
        records: studentRecords,
        selectedIds,
        targetStatus: EnumConfig.SchoolStudentStatus.Active,
      }),
    [studentRecords, selectedIds]
  )
  const deactivateMeta = useMemo(
    () =>
      getStatusActionMeta({
        records: studentRecords,
        selectedIds,
        targetStatus: EnumConfig.SchoolStudentStatus.Inactive,
      }),
    [studentRecords, selectedIds]
  )

  const createStudent = useAxiosSubmit({
    url: ApiUrls.SCHOOL_STUDENT_MANAGEMENT.INDEX,
    method: 'POST',
    successMessage: 'general.create_success',
  })

  const updateStatus = useAxiosSubmit({
    url: ApiUrls.SCHOOL_STUDENT_MANAGEMENT.DETAIL(selectedIds[0] || 0),
    method: 'PUT',
    successMessage: 'general.update_success',
  })

  const deleteStudent = useAxiosSubmit({
    url: ApiUrls.SCHOOL_STUDENT_MANAGEMENT.DELETE_SELECTED,
    method: 'DELETE',
  })

  const submitImport = useAxiosSubmit({
    url: ApiUrls.SCHOOL_STUDENT_MANAGEMENT.IMPORT,
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
      overrideData: { listIds: actionMeta.actionableIds, status, reason },
    })
    if (!response) return
    setSelectedIds([])
    await getStudents.fetch()
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
    const response = await deleteStudent.submit({
      overrideData: { ids: selectedIds, reason },
    })
    if (!response) return
    setSelectedIds([])
    await getStudents.fetch()
  }

  const handleDelete = async (student) => {
    const reason = await confirmReason({
      title: t('button.delete'),
      description: student.fullName,
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!reason) return
    const response = await deleteStudent.submit({
      overrideUrl: ApiUrls.SCHOOL_STUDENT_MANAGEMENT.DETAIL(student.id),
      overrideData: { reason },
    })
    if (response) await getStudents.fetch()
  }

  const mutationLoading = updateStatus.loading || deleteStudent.loading

  const handleImport = async (values) => {
    if (!values.file?.name?.toLowerCase().endsWith('.csv')) return

    const formData = new FormData()
    formData.append('file', values.file)
    const response = await submitImport.submit({ overrideData: formData })
    if (!response) return
    const result = response?.data
    setImportResult(result || null)
    if (result?.succeeded) await getStudents.fetch()
  }

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('school_student.title.management')}
        </Typography.Title>
        <SchoolStudentToolbarSection
          onAddClick={() => setOpenCreate(true)}
          onImport={() => setOpenImport(true)}
        />
        <SchoolStudentFilterSection
          filters={filters}
          loading={getStudents.loading}
          onFilter={handleFilter}
          onReset={() => handleFilter(defaultFilters)}
        />
        <SchoolStudentTableSection
          students={studentRecords}
          loading={getStudents.loading || deleteStudent.loading}
          sort={sort}
          setSort={setSort}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onDelete={handleDelete}
        />
        <GenericTablePagination
          totalCount={getStudents.data?.totalCount}
          totalPage={getStudents.data?.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={getStudents.loading}
        />
        <BulkActionBar
          selectedCount={selectedIds.length}
          loading={mutationLoading}
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
      <SchoolStudentFormSection
        openCreate={openCreate}
        setOpenCreate={setOpenCreate}
        onCreateSubmit={createStudent.submit}
        refetch={getStudents.fetch}
      />
      <GenericImportSection
        open={openImport}
        onClose={() => {
          setImportResult(null)
          setOpenImport(false)
        }}
        result={importResult}
        template={csvImportTemplates.schoolStudents || csvImportTemplates.admins}
        onSubmit={handleImport}
      />
    </Card>
  )
}

export default SchoolStudentManagementPage
