/** School administrator page for managing courses in the current school. */
import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useConfirm from '@/shared/hooks/useConfirm'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import CourseManagementFilterSection from '../components/CourseManagementFilterSection'
import CourseManagementFormSection from '../components/CourseManagementFormSection'
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
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedRow, setSelectedRow] = useState({})
  const queryParams = useMemo(
    () => ({ sort: `${sort.key} ${sort.direction}`, ...filters, page, pageSize }),
    [sort, filters, page, pageSize]
  )
  const courses = useFetch(ApiUrls.COURSE_MANAGEMENT.INDEX, queryParams, [queryParams])
  const createCourse = useAxiosSubmit({
    url: ApiUrls.COURSE_MANAGEMENT.INDEX,
    method: 'POST',
  })
  const updateCourse = useAxiosSubmit({
    url: ApiUrls.COURSE_MANAGEMENT.DETAIL(selectedRow.id),
    method: 'PUT',
  })
  const deleteCourse = useAxiosSubmit({ method: 'DELETE' })
  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
  }
  const handleDelete = async (course) => {
    const accepted = await confirm({
      title: t('course_management.confirm.delete_title'),
      description: t('course_management.confirm.delete_description', { name: course.courseName }),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!accepted) return
    const response = await deleteCourse.submit({
      overrideUrl: ApiUrls.COURSE_MANAGEMENT.DETAIL(course.id),
    })
    if (response) await courses.fetch()
  }

  return (
    <Card style={{ flex: 1, width: '100%', border: 0, borderRadius: 0 }}>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('course_management.title.management')}
        </Typography.Title>
        <CourseManagementToolbarSection onCreate={() => setOpenCreate(true)} />
        <CourseManagementFilterSection
          filters={filters}
          loading={courses.loading}
          onFilter={handleFilter}
          onReset={() => handleFilter(defaultFilters)}
        />
        <CourseManagementTableSection
          courses={courses.data?.collection}
          loading={courses.loading || deleteCourse.loading}
          sort={sort}
          setSort={setSort}
          onCreate={() => setOpenCreate(true)}
          onEdit={(row) => {
            setSelectedRow(row)
            setOpenUpdate(true)
          }}
          onDelete={handleDelete}
        />
        <GenericTablePagination
          totalCount={courses.data?.totalCount}
          totalPage={courses.data?.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
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
    </Card>
  )
}

export default CourseManagementPage
