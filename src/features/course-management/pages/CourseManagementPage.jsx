import { ApiUrls } from '@/shared/api/apiUrls'
import axiosConfig from '@/shared/api/axiosClient'
import GenericImportSection from '@/shared/components/dialogs/commons/GenericImportSection'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { csvImportTemplates } from '@/shared/config/csvImportTemplates'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useConfirm from '@/shared/hooks/useConfirm'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { showWarningToast } from '@/shared/utils/toastUtil'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import CourseManagementFilterSection from '../components/CourseManagementFilterSection'
import CourseManagementFormSection from '../components/CourseManagementFormSection'
import CourseManagementTableSection from '../components/CourseManagementTableSection'
import CourseManagementToolbarSection from '../components/CourseManagementToolbarSection'
import CourseStudentsDialog from '../components/CourseStudentsDialog'

const defaultFilters = { search: '', statuses: [] }

const CourseManagementPage = () => {
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
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState(null)
  const [openStudentsDialog, setOpenStudentsDialog] = useState(false)

  const queryParams = useMemo(
    () => ({ sort: `${sort.key} ${sort.direction}`, ...filters, page, pageSize }),
    [sort, filters, page, pageSize]
  )
  const courses = useFetch(ApiUrls.COURSE_MANAGEMENT.INDEX, queryParams, [queryParams])
  const selectedCourses = useMemo(() => {
    const selected = new Set(selectedIds)
    return (courses.data?.collection || []).filter((course) => selected.has(course.id))
  }, [courses.data?.collection, selectedIds])

  const createCourse = useAxiosSubmit({
    url: ApiUrls.COURSE_MANAGEMENT.INDEX,
    method: 'POST',
  })
  const updateCourse = useAxiosSubmit({
    url: ApiUrls.COURSE_MANAGEMENT.DETAIL(selectedRow.id),
    method: 'PUT',
    onError: async (error) => {
      if (error?.response?.status !== 409) return
      setOpenUpdate(false)
      setSelectedRow({})
      await courses.fetch()
      showWarningToast(t('course_management.message.update_conflict'))
    },
  })
  const publishCourses = useAxiosSubmit({
    url: ApiUrls.COURSE_MANAGEMENT.PUBLISH,
    method: 'POST',
  })
  const submitImport = useAxiosSubmit({
    url: ApiUrls.COURSE_MANAGEMENT.IMPORT,
    method: 'POST',
  })

  const clearSelection = () => setSelectedIds([])
  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
    clearSelection()
  }
  const handleSort = (value) => {
    setSort(value)
    clearSelection()
  }
  const handlePage = (value) => {
    setPage(value)
    clearSelection()
  }
  const handlePageSize = (value) => {
    setPageSize(value)
    clearSelection()
  }

  const handleDelete = async (course) => {
    const accepted = await confirm({
      title: t('course_management.confirm.delete_title'),
      description: t('course_management.confirm.delete_description', { name: course.courseName }),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!accepted) return

    setDeleteLoading(true)
    try {
      await axiosConfig.delete(ApiUrls.COURSE_MANAGEMENT.DETAIL(course.id), {
        headers: { 'If-Match': `"${course.rowVersion}"` },
      })
      clearSelection()
      await courses.fetch()
    } catch {
      // The shared Axios interceptor displays the API error.
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (!selectedCourses.length) return
    const accepted = await confirm({
      title: t('course_management.confirm.delete_selected_title'),
      description: t('course_management.confirm.delete_selected_description', {
        count: selectedCourses.length,
      }),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!accepted) return

    const formData = new FormData()
    selectedCourses.forEach((course, index) => {
      formData.append(`items[${index}].id`, course.id)
      formData.append(`items[${index}].rowVersion`, course.rowVersion)
    })

    setDeleteLoading(true)
    try {
      await axiosConfig.delete(ApiUrls.COURSE_MANAGEMENT.DELETE_SELECTED, { data: formData })
      clearSelection()
      await courses.fetch()
    } catch {
      // The shared Axios interceptor displays the API error.
    } finally {
      setDeleteLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!selectedCourses.length) return
    const hasExpiredEnrollment = selectedCourses.some(
      (course) => new Date(course.enrollmentDueDate).getTime() <= Date.now()
    )
    if (hasExpiredEnrollment) {
      showWarningToast(t('course_management.message.publish_deadline_expired'))
      return
    }

    const accepted = await confirm({
      title: t('course_management.confirm.publish_title'),
      description: t('course_management.confirm.publish_description', {
        count: selectedCourses.length,
      }),
      confirmText: t('course_management.action.publish'),
    })
    if (!accepted) return

    const response = await publishCourses.submit({ overrideData: { ids: selectedIds } })
    if (!response) return
    clearSelection()
    await courses.fetch()
  }

  const handleImport = async (values) => {
    if (!values.file?.name?.toLowerCase().endsWith('.csv')) return

    const formData = new FormData()
    formData.append('file', values.file)
    const response = await submitImport.submit({ overrideData: formData })
    const result = response?.data
    setImportResult(result || null)
    if (result?.succeeded) {
      clearSelection()
      await courses.fetch()
    }
  }

  const mutationLoading = deleteLoading || publishCourses.loading

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('course_management.title.management')}
        </Typography.Title>
        <CourseManagementToolbarSection
          onCreate={() => setOpenCreate(true)}
          onImport={() => setOpenImport(true)}
          onPublish={handlePublish}
          onDeleteSelected={handleDeleteSelected}
          selectedIds={selectedIds}
          loading={mutationLoading}
        />
        <CourseManagementFilterSection
          filters={filters}
          loading={courses.loading}
          onFilter={handleFilter}
          onReset={() => handleFilter(defaultFilters)}
        />
        <CourseManagementTableSection
          courses={courses.data?.collection}
          loading={courses.loading || mutationLoading}
          sort={sort}
          setSort={handleSort}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onEdit={(row) => {
            setSelectedRow(row)
            setOpenUpdate(true)
          }}
          onDelete={handleDelete}
          onManageStudents={(row) => {
            setSelectedCourseForStudents(row)
            setOpenStudentsDialog(true)
          }}
        />
        <GenericTablePagination
          totalCount={courses.data?.totalCount}
          totalPage={courses.data?.totalPage}
          page={page}
          setPage={handlePage}
          pageSize={pageSize}
          setPageSize={handlePageSize}
          loading={courses.loading}
        />
      </Flex>
      <CourseManagementFormSection
        openCreate={openCreate}
        setOpenCreate={setOpenCreate}
        openUpdate={openUpdate}
        setOpenUpdate={setOpenUpdate}
        selectedRow={selectedRow}
        onCreateSubmit={createCourse.submit}
        onUpdateSubmit={updateCourse.submit}
        refetch={courses.fetch}
      />
      <GenericImportSection
        open={openImport}
        onClose={() => {
          setImportResult(null)
          setOpenImport(false)
        }}
        result={importResult}
        template={csvImportTemplates.courses}
        onSubmit={handleImport}
      />
      <CourseStudentsDialog
        open={openStudentsDialog}
        onClose={() => {
          setOpenStudentsDialog(false)
          setSelectedCourseForStudents(null)
        }}
        course={selectedCourseForStudents}
        onEnrollmentsChanged={courses.fetch}
      />
    </Card>
  )
}

export default CourseManagementPage
