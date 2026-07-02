import { ApiUrls } from '@/shared/api/apiUrls'
import BulkActionBar from '@/shared/components/generals/BulkActionBar'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useReasonConfirm from '@/shared/hooks/useReasonConfirm'
import useTranslation from '@/shared/hooks/useTranslation'
import { getStatusActionMeta } from '@/shared/utils/bulkStatusActionUtil'
import { CheckCircleOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons'
import { Flex } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopupConfigurationToolbarSection from '../components/TopupConfigurationToolbarSection'
import TopupRuleFilterSection from '../components/TopupRuleFilterSection'
import TopupRuleTableSection from '../components/TopupRuleTableSection'

const defaultFilters = { name: '', statuses: [] }
const defaultSort = { key: 'id', direction: 'desc' }

const TopupRulesPage = () => {
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
      statuses: filters.statuses,
      page,
      pageSize,
    }),
    [sort, filters, page, pageSize]
  )
  const rules = useFetch(ApiUrls.SYSTEM_TOPUP.INDEX, queryParams, [queryParams])
  const activateMeta = useMemo(
    () =>
      getStatusActionMeta({
        records: rules.data?.collection,
        selectedIds,
        targetStatus: EnumConfig.SystemTopupStatus.Active,
      }),
    [rules.data?.collection, selectedIds]
  )
  const deactivateMeta = useMemo(
    () =>
      getStatusActionMeta({
        records: rules.data?.collection,
        selectedIds,
        targetStatus: EnumConfig.SystemTopupStatus.Inactive,
      }),
    [rules.data?.collection, selectedIds]
  )
  const updateStatus = useAxiosSubmit({
    url: ApiUrls.SYSTEM_TOPUP.UPDATE_STATUS,
    method: 'PUT',
  })
  const remove = useAxiosSubmit({
    url: ApiUrls.SYSTEM_TOPUP.DELETE_SELECTED,
    method: 'DELETE',
  })
  const loading = rules.loading

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
    const isActive = status === EnumConfig.SystemTopupStatus.Active
    const actionMeta = isActive ? activateMeta : deactivateMeta
    if (!actionMeta.hasActionable) return

    const reason = await confirmReason({
      title: isActive ? t('button.activate') : t('button.deactivate'),
      description: t('text.status_update_selection_description', { count: selectedIds.length }),
      confirmColor: isActive ? 'primary' : 'error',
      confirmText: isActive ? t('button.activate') : t('button.deactivate'),
    })
    if (!reason) return
    const response = await updateStatus.submit({
      overrideData: { ids: actionMeta.actionableIds, status, reason },
    })
    if (!response) return
    clearSelection()
    await rules.fetch()
  }
  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return
    const reason = await confirmReason({
      title: t('topup_form.delete_selected_system_topup_title'),
      description: t('topup_form.delete_selected_system_topup_description', {
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
    await rules.fetch()
  }
  const handleDelete = async (rule) => {
    const reason = await confirmReason({
      title: t('button.delete'),
      description: rule.name,
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!reason) return
    const response = await remove.submit({
      overrideUrl: ApiUrls.SYSTEM_TOPUP.DETAIL(rule.id),
      overrideData: { reason },
    })
    if (response) await rules.fetch()
  }
  const mutationLoading = updateStatus.loading || remove.loading

  return (
    <Flex vertical gap={16}>
      <TopupConfigurationToolbarSection
        loading={loading}
        onCreate={() =>
          navigate(routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.SYSTEM_CREATE))
        }
      />
      <TopupRuleFilterSection
        filters={filters}
        loading={loading}
        onFilter={handleFilter}
        onReset={() => handleFilter(defaultFilters)}
      />
      <TopupRuleTableSection
        rules={rules.data?.collection}
        loading={loading || mutationLoading}
        sort={sort}
        setSort={handleSort}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onDetail={(row) =>
          navigate(
            routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.SYSTEM_DETAIL(row.id))
          )
        }
        onDelete={handleDelete}
      />
      <GenericTablePagination
        totalCount={rules.data?.totalCount}
        totalPage={rules.data?.totalPage}
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
            disabled: !activateMeta.hasActionable,
            onClick: () => handleChangeStatus(EnumConfig.SystemTopupStatus.Active),
          },
          {
            key: 'deactivate',
            label: t('button.deactivate'),
            icon: <StopOutlined />,
            disabled: !deactivateMeta.hasActionable,
            onClick: () => handleChangeStatus(EnumConfig.SystemTopupStatus.Inactive),
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

export default TopupRulesPage
