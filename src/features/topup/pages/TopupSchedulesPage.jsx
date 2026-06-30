import { ApiUrls } from '@/shared/api/apiUrls'
import BulkActionBar from '@/shared/components/generals/BulkActionBar'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useReasonConfirm from '@/shared/hooks/useReasonConfirm'
import useTranslation from '@/shared/hooks/useTranslation'
import { CheckCircleOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons'
import { Flex } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopupConfigurationToolbarSection from '../components/TopupConfigurationToolbarSection'
import TopupScheduleFilterSection from '../components/TopupScheduleFilterSection'
import TopupScheduleTableSection from '../components/TopupScheduleTableSection'

const defaultFilters = { name: '', frequencies: [], statuses: [], createdFrom: '', createdTo: '' }
const defaultSort = { key: 'id', direction: 'desc' }

const TopupSchedulesPage = () => {
  const { t } = useTranslation()
  const confirmReason = useReasonConfirm()
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState(defaultSort)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState([])
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
  const updateStatus = useAxiosSubmit({
    url: ApiUrls.SCHEDULE_TOPUP.UPDATE_STATUS,
    method: 'PUT',
  })
  const remove = useAxiosSubmit({
    url: ApiUrls.SCHEDULE_TOPUP.DELETE_SELECTED,
    method: 'DELETE',
  })
  const loading = schedules.loading
  const selectedSchedules = useMemo(() => {
    const selected = new Set(selectedIds)
    return (schedules.data?.collection || []).filter((schedule) => selected.has(schedule.id))
  }, [schedules.data?.collection, selectedIds])
  const hasCompletedSelection = selectedSchedules.some(
    (schedule) => schedule.status === EnumConfig.ScheduleTopupStatus.Completed
  )

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
  const handleChangeStatus = async (status) => {
    const isActive = status === EnumConfig.ScheduleTopupStatus.Active
    const reason = await confirmReason({
      title: isActive ? t('button.activate') : t('button.deactivate'),
      description: `${selectedIds.length} ${t('text.selected').toLowerCase()}`,
      confirmColor: isActive ? 'primary' : 'error',
      confirmText: isActive ? t('button.activate') : t('button.deactivate'),
    })
    if (!reason) return
    const response = await updateStatus.submit({
      overrideData: { ids: selectedIds, status, reason },
    })
    if (!response) return
    clearSelection()
    await schedules.fetch()
  }
  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return
    const reason = await confirmReason({
      title: t('topup_form.delete_selected_schedule_title'),
      description: t('topup_form.delete_selected_schedule_description', {
        count: selectedIds.length,
      }),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!reason) return
    const response = await remove.submit({
      overrideData: { ids: selectedIds, reason },
    })
    if (!response) return
    clearSelection()
    await schedules.fetch()
  }
  const mutationLoading = updateStatus.loading || remove.loading

  return (
    <Flex vertical gap={16}>
      <TopupConfigurationToolbarSection
        loading={loading}
        onCreate={() =>
          navigate(routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.SCHEDULE_CREATE))
        }
      />
      <TopupScheduleFilterSection
        filters={filters}
        loading={loading}
        onFilter={handleFilter}
        onReset={() => handleFilter(defaultFilters)}
      />
      <TopupScheduleTableSection
        schedules={schedules.data?.collection}
        loading={loading || mutationLoading}
        sort={sort}
        setSort={handleSort}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onDetail={(row) =>
          navigate(
            routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.SCHEDULE_DETAIL(row.id))
          )
        }
        onEdit={(row) =>
          navigate(
            routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.SCHEDULE_EDIT(row.id))
          )
        }
      />
      <GenericTablePagination
        totalCount={schedules.data?.totalCount}
        totalPage={schedules.data?.totalPage}
        page={page}
        setPage={handlePage}
        pageSize={pageSize}
        setPageSize={handlePageSize}
        loading={loading}
      />
      <BulkActionBar
        selectedCount={selectedIds.length}
        loading={mutationLoading}
        onClear={clearSelection}
        actions={[
          {
            key: 'activate',
            label: t('button.activate'),
            icon: <CheckCircleOutlined />,
            disabled: hasCompletedSelection,
            onClick: () => handleChangeStatus(EnumConfig.ScheduleTopupStatus.Active),
          },
          {
            key: 'deactivate',
            label: t('button.deactivate'),
            icon: <StopOutlined />,
            onClick: () => handleChangeStatus(EnumConfig.ScheduleTopupStatus.Inactive),
          },
          {
            key: 'delete',
            label: t('button.delete'),
            icon: <DeleteOutlined />,
            danger: true,
            onClick: handleDeleteSelected,
          },
        ]}
      />
    </Flex>
  )
}

export default TopupSchedulesPage
