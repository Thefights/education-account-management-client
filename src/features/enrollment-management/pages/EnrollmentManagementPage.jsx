import { ApiUrls } from '@/shared/api/apiUrls'
import axiosConfig from '@/shared/api/axiosClient'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import useConfirm from '@/shared/hooks/useConfirm'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import AssignStudentsDialog from '../components/AssignStudentsDialog'
import EnrollmentManagementFilterSection from '../components/EnrollmentManagementFilterSection'
import EnrollmentManagementTableSection from '../components/EnrollmentManagementTableSection'
import EnrollmentManagementToolbarSection from '../components/EnrollmentManagementToolbarSection'

const defaultFilters = { search: '', courseId: '', chargeStatuses: [] }

const EnrollmentManagementPage = () => {
  const { t } = useTranslation()
  const confirm = useConfirm()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ key: 'id', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState([])
  const [openAssign, setOpenAssign] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const queryParams = useMemo(() => {
    const params = { sort: `${sort.key} ${sort.direction}`, ...filters, page, pageSize }
    if (!params.courseId) delete params.courseId
    return params
  }, [sort, filters, page, pageSize])

  const enrollments = useFetch(ApiUrls.ENROLLMENT_MANAGEMENT.INDEX, queryParams, [queryParams])

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

  const handleDelete = async (enrollment) => {
    const accepted = await confirm({
      title: t('enrollment_management.confirm.delete_title'),
      description: t('enrollment_management.confirm.delete_description', {
        name: enrollment.citizenFullName,
      }),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!accepted) return

    setDeleteLoading(true)
    try {
      await axiosConfig.delete(ApiUrls.ENROLLMENT_MANAGEMENT.DETAIL(enrollment.id))
      clearSelection()
      await enrollments.fetch()
    } catch {
      // Shared Axios interceptor handles error
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return
    const accepted = await confirm({
      title: t('enrollment_management.confirm.delete_selected_title'),
      description: t('enrollment_management.confirm.delete_selected_description', {
        count: selectedIds.length,
      }),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!accepted) return

    setDeleteLoading(true)
    try {
      await axiosConfig.delete(ApiUrls.ENROLLMENT_MANAGEMENT.DELETE_SELECTED, {
        data: { ids: selectedIds },
      })
      clearSelection()
      await enrollments.fetch()
    } catch {
      // Shared Axios interceptor handles error
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleAssigned = async () => {
    clearSelection()
    await enrollments.fetch()
  }

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('enrollment_management.title.management')}
        </Typography.Title>

        <EnrollmentManagementToolbarSection
          onAssign={() => setOpenAssign(true)}
          onDeleteSelected={handleDeleteSelected}
          selectedIds={selectedIds}
          loading={deleteLoading}
        />

        <EnrollmentManagementFilterSection
          filters={filters}
          onFilter={handleFilter}
          onReset={() => handleFilter(defaultFilters)}
          loading={enrollments.loading}
        />

        <EnrollmentManagementTableSection
          enrollments={enrollments.data?.collection}
          loading={enrollments.loading || deleteLoading}
          sort={sort}
          setSort={handleSort}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onDelete={handleDelete}
        />

        <GenericTablePagination
          totalCount={enrollments.data?.totalCount}
          totalPage={enrollments.data?.totalPage}
          page={page}
          setPage={handlePage}
          pageSize={pageSize}
          setPageSize={handlePageSize}
          loading={enrollments.loading}
        />
      </Flex>

      <AssignStudentsDialog
        open={openAssign}
        onClose={() => setOpenAssign(false)}
        onAssigned={handleAssigned}
      />
    </Card>
  )
}

export default EnrollmentManagementPage
