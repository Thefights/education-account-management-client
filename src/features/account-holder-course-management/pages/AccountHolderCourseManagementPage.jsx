/** Account Holder page for managing courses. */
import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import CourseManagementFilterSection from '../components/CourseManagementFilterSection'
import CourseManagementTableSection from '../components/CourseManagementTableSection'

const defaultFilters = { Search: '', searchfields: ['Course.CourseName', 'Course.CourseCode'] }

const AccountHolderCourseManagementPage = () => {
  const { t } = useTranslation()
  const [filters, setFilters] = useState(defaultFilters)
  const [tab, setTab] = useState(3)
  const [sort, setSort] = useState({key: 'startDate', direction: 'desc',})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const queryParams = useMemo(
    () => ({
      Tab: tab,
      Sort: `${sort.key} ${sort.direction}`,
      Search: filters.search,
      SearchField: filters.searchfields,
      Page: page,
      PageSize: pageSize,
    }),
    [tab, sort, filters, page, pageSize]
  )

  const courses = useFetch(ApiUrls.ACCOUNT_HOLDER.COURSES, queryParams, [queryParams])

  const inUpcoming = useFetch(
    ApiUrls.ACCOUNT_HOLDER.COURSES,
    { Tab: 3, Page: 1, PageSize: 1 },
    []
  )

  const inProgressCount = useFetch(
    ApiUrls.ACCOUNT_HOLDER.COURSES,
    { Tab: 4, Page: 1, PageSize: 1 },
    []
  )

  const closedCount = useFetch(
    ApiUrls.ACCOUNT_HOLDER.COURSES,
    { Tab: 5, Page: 1, PageSize: 1 },
    []
  )

  const counts = {
    upcoming: inUpcoming.data?.totalCount ?? 0,
    inProgress: inProgressCount.data?.totalCount ?? 0,
    closed: closedCount.data?.totalCount ?? 0,
  }
  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
  }

  

  return (
    <Flex vertical gap={18} style={{ width: '100%', maxWidth: 1400, margin: '0 auto' }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t('course_management.title.management')}
          </Typography.Title>
      <Card>
        <Flex vertical gap={16}>
        
          <CourseManagementFilterSection
            tab={tab}
            setTab={setTab}
            counts={counts}
            filters={filters}
            loading={courses.loading}
            onFilter={handleFilter}
            onReset={() => handleFilter(defaultFilters)}
          />
          <CourseManagementTableSection
            courses={courses.data?.collection ?? []}
            loading={courses.loading}
            sort={sort}
            setSort={setSort}
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
      </Card>
    
    </Flex>


  )
}

export default AccountHolderCourseManagementPage
