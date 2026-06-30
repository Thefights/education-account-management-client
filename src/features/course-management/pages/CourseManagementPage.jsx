import { ApiUrls } from '@/shared/api/apiUrls'
import GenericImportSection from '@/shared/components/dialogs/commons/GenericImportSection'
import BulkActionBar from '@/shared/components/generals/BulkActionBar'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { csvImportTemplates } from '@/shared/config/csvImportTemplates'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useReasonConfirm from '@/shared/hooks/useReasonConfirm'
import useTranslation from '@/shared/hooks/useTranslation'
import { getLocalDateFromServerDateTime } from '@/shared/utils/formatDateUtil'
import { getImportErrorResult } from '@/shared/utils/importResultUtil'
import { showWarningToast } from '@/shared/utils/toastUtil'
import { CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CourseManagementFilterSection from '../components/CourseManagementFilterSection'
import CourseManagementTableSection from '../components/CourseManagementTableSection'
import CourseManagementToolbarSection from '../components/CourseManagementToolbarSection'

const defaultFilters = { search: '', statuses: [] }

const CourseManagementPage = () => {
  const { t } = useTranslation()
  const confirmReason = useReasonConfirm()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ key: 'id', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [openImport, setOpenImport] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
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
    onError: async (error) => {
      setImportResult(getImportErrorResult(error))
    },
  })
  const deleteSelectedCourses = useAxiosSubmit({
    url: ApiUrls.COURSE_MANAGEMENT.DELETE_SELECTED,
    method: 'DELETE',
  })
  const duplicateCourse = useAxiosSubmit({
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
    const reason = await confirmReason({
      title: t('course_management.confirm.delete_selected_title'),
      description: t('course_management.confirm.delete_selected_description', {
        count: selectedCourses.length,
      }),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!reason) return

    const formData = new FormData()
    selectedCourses.forEach((course, index) => {
      formData.append(`items[${index}].id`, course.id)
      formData.append(`items[${index}].rowVersion`, course.rowVersion)
    })
    formData.append('reason', reason)

    const response = await deleteSelectedCourses.submit({ overrideData: formData })
    if (!response) return
    clearSelection()
    await courses.fetch()
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

    const reason = await confirmReason({
      title: t('course_management.confirm.publish_title'),
      description: t('course_management.confirm.publish_description', {
        count: selectedCourses.length,
      }),
      confirmText: t('course_management.action.publish'),
    })
    if (!reason) return

    const response = await publishCourses.submit({ overrideData: { ids: selectedIds, reason } })
    if (!response) return
    clearSelection()
    await courses.fetch()
  }

  const handleImport = async (values) => {
    if (!values.file?.name?.toLowerCase().endsWith('.csv')) return

    const formData = new FormData()
    formData.append('file', values.file)
    const response = await submitImport.submit({ overrideData: formData })
    if (!response) return
    const result = response?.data
    setImportResult(result || null)
    if (result?.succeeded) {
      clearSelection()
      await courses.fetch()
    }
  }

  const handleDuplicate = async (course) => {
    const response = await duplicateCourse.submit({
      overrideUrl: ApiUrls.COURSE_MANAGEMENT.DUPLICATE(course.id),
    })
    if (!response) return

    clearSelection()
    await courses.fetch()
    const duplicateId = response?.data?.id
    if (duplicateId) {
      navigate(routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.COURSE_MANAGEMENT.EDIT(duplicateId)))
    }
  }

  const mutationLoading =
    deleteSelectedCourses.loading || duplicateCourse.loading || publishCourses.loading

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
          onEdit={(row) =>
            navigate(routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.COURSE_MANAGEMENT.EDIT(row.id)))
          }
          onDuplicate={handleDuplicate}
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
        <BulkActionBar
          selectedCount={selectedIds.length}
          loading={mutationLoading}
          onClear={clearSelection}
          actions={[
            {
              key: 'publish',
              label: t('course_management.action.publish'),
              icon: <CheckCircleOutlined />,
              onClick: handlePublish,
            },
            {
              key: 'delete',
              label: t('course_management.action.delete_selected'),
              icon: <DeleteOutlined />,
              danger: true,
              onClick: handleDeleteSelected,
            },
          ]}
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
