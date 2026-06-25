import { ApiUrls } from '@/shared/api/apiUrls'
import axiosConfig from '@/shared/api/axiosClient'
import GenericImportSection from '@/shared/components/dialogs/commons/GenericImportSection'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { csvImportTemplates } from '@/shared/config/csvImportTemplates'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useConfirm from '@/shared/hooks/useConfirm'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { getLocalDateFromServerDateTime } from '@/shared/utils/formatDateUtil'
import { showWarningToast } from '@/shared/utils/toastUtil'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CourseManagementFilterSection from '../components/CourseManagementFilterSection'
import CourseManagementTableSection from '../components/CourseManagementTableSection'
import CourseManagementToolbarSection from '../components/CourseManagementToolbarSection'

const defaultFilters = { search: '', statuses: [] }

const CourseManagementPage = () => {
  const { t } = useTranslation()
  const confirm = useConfirm()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ key: 'id', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [openImport, setOpenImport] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [deleteLoading, setDeleteLoading] = useState(false)
  const navigate = useNavigate()

  const queryParams = useMemo(
    () => ({ sort: `${sort.key} ${sort.direction}`, ...filters, page, pageSize }),
    [sort, filters, page, pageSize]
  )
  const courses = useFetch(ApiUrls.COURSE_MANAGEMENT.INDEX, queryParams, [queryParams])
  const selectedCourses = useMemo(() => {
    const selected = new Set(selectedIds)
    return (courses.data?.collection || []).filter((course) => selected.has(course.id))
  }, [courses.data?.collection, selectedIds])

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
    const hasExpiredFasDeadline = selectedCourses.some((course) => {
      const deadline = getLocalDateFromServerDateTime(course.enrollmentDeadline)
      return !deadline || deadline.getTime() <= Date.now()
    })
    if (hasExpiredFasDeadline) {
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
          onCreate={() =>
            navigate(routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.COURSE_MANAGEMENT.CREATE))
          }
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
          onDetail={(row) =>
            navigate(routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.COURSE_MANAGEMENT.DETAIL(row.id)))
          }
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
    </Card>
  )
}

export default CourseManagementPage
