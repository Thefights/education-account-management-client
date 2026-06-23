import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useConfirm from '@/shared/hooks/useConfirm'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Flex, Space } from 'antd'
import { useMemo, useState } from 'react'
import TopupScheduleFilterSection from '../components/TopupScheduleFilterSection'
import TopupScheduleFormSection from '../components/TopupScheduleFormSection'
import TopupScheduleTableSection from '../components/TopupScheduleTableSection'

const defaultFilters = { name: '', frequencies: [], statuses: [], createdFrom: '', createdTo: '' }
const defaultSort = { key: 'id', direction: 'desc' }

const TopupSchedulesPage = () => {
  const { t } = useTranslation()
  const confirm = useConfirm()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState(defaultSort)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState([])
  const [formState, setFormState] = useState({ open: false, id: null })
  const queryParams = useMemo(
    () => ({
      sort: `${sort.key} ${sort.direction}`,
      name: filters.name,
      frequencies: filters.frequencies,
      statuses: filters.statuses,
      createdFrom: filters.createdFrom,
      createdTo: filters.createdTo,
      page,
      pageSize,
    }),
    [sort, filters, page, pageSize]
  )
  const schedules = useFetch(ApiUrls.SCHEDULE_TOPUP.INDEX, queryParams, [queryParams])
  const createSchedule = useAxiosSubmit({ url: ApiUrls.SCHEDULE_TOPUP.INDEX, method: 'POST' })
  const updateSchedule = useAxiosSubmit({ method: 'PUT' })
  const updateStatus = useAxiosSubmit({
    url: ApiUrls.SCHEDULE_TOPUP.UPDATE_STATUS,
    method: 'PUT',
  })
  const deleteSchedule = useAxiosSubmit({ method: 'DELETE' })
  const loading =
    schedules.loading ||
    createSchedule.loading ||
    updateSchedule.loading ||
    updateStatus.loading ||
    deleteSchedule.loading

  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
    setSelectedIds([])
  }
  const handleChangeStatus = async (status) => {
    const response = await updateStatus.submit({ overrideData: { ids: selectedIds, status } })
    if (!response) return
    setSelectedIds([])
    await schedules.fetch()
  }
  const handleDelete = async (schedule) => {
    const accepted = await confirm({
      title: t('topup_form.delete_schedule'),
      description: t('topup_form.delete_schedule_confirm', {
        name: schedule.name || schedule.id,
      }),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!accepted) return
    const response = await deleteSchedule.submit({
      overrideUrl: ApiUrls.SCHEDULE_TOPUP.DETAIL(schedule.id),
    })
    if (response) await schedules.fetch()
  }

  return (
    <>
      <Flex vertical gap={16}>
        <Flex justify="end">
          <Space wrap>
            <Button
              loading={loading}
              disabled={!selectedIds.length}
              onClick={() => handleChangeStatus(1)}
            >
              {t('topup.activate')}
            </Button>
            <Button
              danger
              loading={loading}
              disabled={!selectedIds.length}
              onClick={() => handleChangeStatus(2)}
            >
              {t('topup.deactivate')}
            </Button>
            <Button
              type="primary"
              disabled={loading}
              onClick={() => setFormState({ open: true, id: null })}
            >
              {t('button.create')}
            </Button>
          </Space>
        </Flex>
        <TopupScheduleFilterSection
          filters={filters}
          loading={loading}
          onFilter={handleFilter}
          onReset={() => handleFilter(defaultFilters)}
        />
        <TopupScheduleTableSection
          schedules={schedules.data?.collection}
          loading={loading}
          sort={sort}
          setSort={setSort}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onEdit={(row) => setFormState({ open: true, id: row.id })}
          onDelete={handleDelete}
        />
        <GenericTablePagination
          totalCount={schedules.data?.totalCount}
          totalPage={schedules.data?.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={loading}
        />
      </Flex>
      <TopupScheduleFormSection
        open={formState.open}
        scheduleId={formState.id}
        onClose={() => setFormState({ open: false, id: null })}
        onCreateSubmit={createSchedule.submit}
        onUpdateSubmit={updateSchedule.submit}
        refetch={schedules.fetch}
      />
    </>
  )
}

export default TopupSchedulesPage
