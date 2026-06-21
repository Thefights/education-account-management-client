import { ApiUrls } from '@/shared/api/apiUrls'
import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useConfirm from '@/shared/hooks/useConfirm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Card, Flex, Input, Select, Space, Typography } from 'antd'
import { useMemo, useState } from 'react'
import TopupRuleCreateDialog from '../components/TopupRuleCreateDialog'

const TopupRulesPage = () => {
  const { t } = useTranslation()
  const confirm = useConfirm()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState({ key: 'id', direction: 'desc' })
  const [selectedIds, setSelectedIds] = useState([])
  const [filters, setFilters] = useState({ search: '', type: undefined, status: undefined })
  const [formState, setFormState] = useState({ open: false, id: null })
  const params = useMemo(
    () => ({ page, pageSize, sort: `${sort.key} ${sort.direction}`, ...filters }),
    [filters, page, pageSize, sort]
  )
  const rules = useFetch(ApiUrls.TOPUP_RULE.INDEX, params, [params])
  const updateStatus = useAxiosSubmit({
    url: ApiUrls.TOPUP_RULE.UPDATE_STATUS,
    method: 'PUT',
  })
  const createRule = useAxiosSubmit({ url: ApiUrls.TOPUP_RULE.INDEX, method: 'POST' })
  const updateRule = useAxiosSubmit({ method: 'PUT' })
  const deleteRule = useAxiosSubmit({ method: 'DELETE' })
  const fields = [
      { key: 'id', title: 'ID', sortable: true, width: 80 },
      { key: 'ruleName', title: t('topup.rule_name') },
      { key: 'matchMode', title: t('topup_form.match_mode'), type: 'tag' },
      { key: 'topupAmount', title: t('topup.amount') },
      { key: 'status', title: t('topup.status'), type: 'tag' },
      {
        key: 'conditions',
        title: t('topup.conditions'),
        render: (conditions) => conditions?.length ?? 0,
      },
      { key: 'createdAt', title: t('topup.created_at') },
      {
        key: 'actions', title: '', width: 70,
        render: (_, row) => <ActionMenu actions={[
          { title: t('button.edit'), onClick: () => setFormState({ open: true, id: row.id }) },
          { title: t('button.delete'), onClick: () => handleDelete(row) },
        ]} />,
      },
    ]
  const changeStatus = async (status) => {
    const response = await updateStatus.submit({ overrideData: { ids: selectedIds, status } })
    if (response) {
      setSelectedIds([])
      await rules.fetch()
    }
  }
  const handleDelete = async (rule) => {
    const accepted = await confirm({
      title: t('topup_form.delete_rule'),
      description: t('topup_form.delete_rule_confirm', { name: rule.ruleName }),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!accepted) return
    const response = await deleteRule.submit({ overrideUrl: ApiUrls.TOPUP_RULE.DETAIL(rule.id) })
    if (response) await rules.fetch()
  }

  const content = (
    <>
      <Flex vertical gap={16}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <Typography.Title level={4}>{t('topup.rules_title')}</Typography.Title>
          <Space>
            <Button type="primary" onClick={() => setFormState({ open: true, id: null })}>{t('button.create')}</Button>
            <Button disabled={!selectedIds.length} onClick={() => changeStatus(1)}>{t('topup.activate')}</Button>
            <Button disabled={!selectedIds.length} danger onClick={() => changeStatus(2)}>{t('topup.deactivate')}</Button>
          </Space>
        </Flex>
        <Flex gap={12} wrap="wrap">
          <Input
            allowClear
            value={filters.search}
            placeholder={t('topup.search_rule')}
            onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, search: event.target.value })) }}
            style={{ width: 240 }}
          />
          <Select
            allowClear
            value={filters.type}
            placeholder={t('topup.rule_type')}
            options={[{ value: 1, label: t('topup.system_tab', 'System') }, { value: 2, label: t('topup.schedule_tab', 'Schedule') }]}
            onChange={(type) => { setPage(1); setFilters((current) => ({ ...current, type })) }}
            style={{ width: 180 }}
          />
          <Select
            allowClear
            value={filters.status}
            placeholder={t('topup.status')}
            options={[{ value: 1, label: t('topup_form.active') }, { value: 2, label: t('topup_form.inactive') }]}
            onChange={(status) => { setPage(1); setFilters((current) => ({ ...current, status })) }}
            style={{ width: 180 }}
          />
          <Button onClick={() => { setPage(1); setFilters({ search: '', type: undefined, status: undefined }) }}>{t('button.reset')}</Button>
        </Flex>
        <GenericTable
          data={rules.data?.collection}
          fields={fields}
          rowKey="id"
          loading={rules.loading}
          sort={sort}
          setSort={setSort}
          canSelectRows
          selectedRows={selectedIds}
          setSelectedRows={setSelectedIds}
        />
        <GenericTablePagination
          totalCount={rules.data?.totalCount}
          totalPage={rules.data?.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={rules.loading}
        />
      </Flex>
      <TopupRuleCreateDialog
        open={formState.open}
        ruleId={formState.id}
        onClose={() => setFormState({ open: false, id: null })}
        onSuccess={() => rules.fetch()}
      />
    </>
  )

  return content
}

export default TopupRulesPage
