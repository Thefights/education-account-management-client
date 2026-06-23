import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useConfirm from '@/shared/hooks/useConfirm'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Flex, Space } from 'antd'
import { useMemo, useState } from 'react'
import TopupRuleFilterSection from '../components/TopupRuleFilterSection'
import TopupRuleFormSection from '../components/TopupRuleFormSection'
import TopupRuleTableSection from '../components/TopupRuleTableSection'

const defaultFilters = { name: '', statuses: [] }
const defaultSort = { key: 'id', direction: 'desc' }

const TopupRulesPage = () => {
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
      statuses: filters.statuses,
      page,
      pageSize,
    }),
    [sort, filters, page, pageSize]
  )
  const rules = useFetch(ApiUrls.SYSTEM_TOPUP.INDEX, queryParams, [queryParams])
  const createRule = useAxiosSubmit({ url: ApiUrls.SYSTEM_TOPUP.INDEX, method: 'POST' })
  const updateRule = useAxiosSubmit({ method: 'PUT' })
  const updateStatus = useAxiosSubmit({ url: ApiUrls.SYSTEM_TOPUP.UPDATE_STATUS, method: 'PUT' })
  const deleteRule = useAxiosSubmit({ method: 'DELETE' })
  const loading =
    rules.loading ||
    createRule.loading ||
    updateRule.loading ||
    updateStatus.loading ||
    deleteRule.loading

  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
    setSelectedIds([])
  }
  const handleChangeStatus = async (status) => {
    const response = await updateStatus.submit({ overrideData: { ids: selectedIds, status } })
    if (!response) return
    setSelectedIds([])
    await rules.fetch()
  }
  const handleDelete = async (rule) => {
    const accepted = await confirm({
      title: t('topup_form.delete_system_topup'),
      description: t('topup_form.delete_system_topup_confirm', { name: rule.name }),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!accepted) return
    const response = await deleteRule.submit({
      overrideUrl: ApiUrls.SYSTEM_TOPUP.DETAIL(rule.id),
    })
    if (response) await rules.fetch()
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
        <TopupRuleFilterSection
          filters={filters}
          loading={loading}
          onFilter={handleFilter}
          onReset={() => handleFilter(defaultFilters)}
        />
        <TopupRuleTableSection
          rules={rules.data?.collection}
          loading={loading}
          sort={sort}
          setSort={setSort}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onEdit={(row) => setFormState({ open: true, id: row.id })}
          onDelete={handleDelete}
        />
        <GenericTablePagination
          totalCount={rules.data?.totalCount}
          totalPage={rules.data?.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={loading}
        />
      </Flex>
      <TopupRuleFormSection
        open={formState.open}
        ruleId={formState.id}
        onClose={() => setFormState({ open: false, id: null })}
        onCreateSubmit={createRule.submit}
        onUpdateSubmit={updateRule.submit}
        refetch={rules.fetch}
      />
    </>
  )
}

export default TopupRulesPage
