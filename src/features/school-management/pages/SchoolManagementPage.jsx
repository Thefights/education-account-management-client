/** System administrator page for managing schools. */
import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useConfirm from '@/shared/hooks/useConfirm'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import SchoolManagementFilterSection from '../components/SchoolManagementFilterSection'
import SchoolManagementFormSection from '../components/SchoolManagementFormSection'
import SchoolManagementTableSection from '../components/SchoolManagementTableSection'

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
  const [selectedRow, setSelectedRow] = useState({})
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
  const deleteSchool = useAxiosSubmit({ method: 'DELETE' })
  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
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

  return (
    <Card style={{ flex: 1, width: '100%', border: 0, borderRadius: 0 }}>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('school_management.title.management')}
        </Typography.Title>
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
    </Card>
  )
}

export default SchoolManagementPage
