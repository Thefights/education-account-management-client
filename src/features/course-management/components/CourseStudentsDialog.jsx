import AssignStudentsDialog from '@/features/enrollment-management/components/AssignStudentsDialog'
import EnrollmentManagementTableSection from '@/features/enrollment-management/components/EnrollmentManagementTableSection'
import { ApiUrls } from '@/shared/api/apiUrls'
import axiosConfig from '@/shared/api/axiosClient'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import useConfirm from '@/shared/hooks/useConfirm'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Flex, Modal } from 'antd'
import { useMemo, useState } from 'react'

const CourseStudentsDialog = ({ open, onClose, course, onEnrollmentsChanged }) => {
  const { t } = useTranslation()
  const confirm = useConfirm()
  const [sort, setSort] = useState({ key: 'id', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState([])
  const [openAssign, setOpenAssign] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const isEnrolling = course?.status === 'Enrolling'
  const readOnly = !isEnrolling

  const queryParams = useMemo(
    () => ({ courseId: course?.id, sort: `${sort.key} ${sort.direction}`, page, pageSize }),
    [course?.id, sort, page, pageSize]
  )

  const enrollments = useFetch(open ? ApiUrls.ENROLLMENT_MANAGEMENT.INDEX : '', queryParams, [
    open,
    queryParams,
  ])

  const clearSelection = () => setSelectedIds([])

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
      await onEnrollmentsChanged?.()
    } catch {
      // API error shown by interceptor
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
      await onEnrollmentsChanged?.()
    } catch {
      // API error shown by interceptor
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleAssigned = async () => {
    await enrollments.fetch()
    await onEnrollmentsChanged?.()
  }

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        afterClose={() => {
          setPage(1)
          setSelectedIds([])
        }}
        title={t(
          isEnrolling
            ? 'enrollment_management.action.manage_students'
            : 'enrollment_management.action.view_students'
        )}
        footer={null}
        width={1200}
        destroyOnClose
      >
        <Flex vertical gap={16}>
          {!readOnly && (
            <Flex justify="flex-end" gap={8}>
              <Button
                danger
                disabled={!selectedIds.length}
                loading={deleteLoading}
                onClick={handleDeleteSelected}
              >
                {t('enrollment_management.action.delete_selected')}
              </Button>
              <Button type="primary" onClick={() => setOpenAssign(true)}>
                {t('enrollment_management.title.assign_students')}
              </Button>
            </Flex>
          )}

          <EnrollmentManagementTableSection
            enrollments={enrollments.data?.collection}
            loading={enrollments.loading || deleteLoading}
            sort={sort}
            setSort={handleSort}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onDelete={handleDelete}
            showCourse={false}
            readOnly={readOnly}
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
      </Modal>

      <AssignStudentsDialog
        open={openAssign}
        onClose={() => setOpenAssign(false)}
        fixedCourse={course}
        onAssigned={handleAssigned}
      />
    </>
  )
}

export default CourseStudentsDialog
