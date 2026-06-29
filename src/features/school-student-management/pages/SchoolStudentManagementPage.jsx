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
import SchoolStudentFilterSection from '../components/SchoolStudentFilterSection'
import SchoolStudentFormSection from '../components/SchoolStudentFormSection'
import SchoolStudentTableSection from '../components/SchoolStudentTableSection'
import SchoolStudentToolbarSection from '../components/SchoolStudentToolbarSection'

const defaultFilters = { search: '', statuses: [] }

const SchoolStudentManagementPage = () => {
  const { t } = useTranslation()
  const confirm = useConfirm()
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

  const deleteStudent = useAxiosSubmit({ method: 'DELETE' })

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

  const handleDelete = async (row) => {
    const accepted = await confirm({
      title: t('school_student.confirm.delete_title'),
      description: t('school_student.confirm.delete_description', { name: row.nric }),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!accepted) return
    const response = await deleteStudent.submit({
      overrideUrl: ApiUrls.SCHOOL_STUDENT_MANAGEMENT.DETAIL(row.id),
    })
    if (response) {
      setSelectedIds([])
      await getStudents.fetch()
    }
  }

  const handleChangeStatus = async (status) => {
    const response = await updateStatus.submit({
      overrideData: { listIds: selectedIds, status },
    })
    if (!response) return
    setSelectedIds([])
    await getStudents.fetch()
  }

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
          students={getStudents.data?.collection || getStudents.data || []}
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
