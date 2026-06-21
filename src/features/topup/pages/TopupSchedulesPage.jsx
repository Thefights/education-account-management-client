import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useConfirm from '@/shared/hooks/useConfirm'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Card, Flex, Select, Typography } from 'antd'
import { useMemo, useState } from 'react'
import TopupScheduleCreateDialog from '../components/TopupScheduleCreateDialog'

const TopupSchedulesPage = () => {
  const { t } = useTranslation()
  const confirm = useConfirm()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState({ key: 'id', direction: 'desc' })
  const [filters, setFilters] = useState({ frequency: undefined, status: undefined })
  const [formState, setFormState] = useState({ open: false, id: null })
  const params = useMemo(
    () => ({ page, pageSize, sort: `${sort.key} ${sort.direction}`, ...filters }),
    [filters, page, pageSize, sort]
  )
  const schedules = useFetch(ApiUrls.TOPUP_SCHEDULE.INDEX, params, [params])
  const createSchedule = useAxiosSubmit({ url: ApiUrls.TOPUP_SCHEDULE.INDEX, method: 'POST' })
  const updateSchedule = useAxiosSubmit({ method: 'PUT' })
  const deleteSchedule = useAxiosSubmit({ method: 'DELETE' })
  const fields = [
      { key: 'id', title: 'ID', sortable: true, width: 80 },
      { key: 'topupRule.ruleName', title: t('topup.rule_name') },
      { key: 'frequency', title: t('topup.schedule_type'), sortable: true },
      { key: 'status', title: t('topup.status'), sortable: true, type: 'tag' },
      { key: 'executionTime', title: t('topup_form.execution_time') },
      { key: 'nextExecutionAt', title: t('topup.next_execution') },
      {
        key: 'actions', title: '', width: 70,
        render: (_, row) => <ActionMenu actions={[
          { title: t('button.edit'), onClick: () => setFormState({ open: true, id: row.id }) },
          { title: t('button.delete'), onClick: () => handleDelete(row) },
        ]} />,
      },
    ]
  const handleDelete = async (schedule) => {
    const accepted = await confirm({
      title: t('topup_form.delete_schedule'),
      description: t('topup_form.delete_schedule_confirm', { name: schedule.topupRule?.ruleName || schedule.id }),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!accepted) return
    const response = await deleteSchedule.submit({ overrideUrl: ApiUrls.TOPUP_SCHEDULE.DETAIL(schedule.id) })
    if (response) await schedules.fetch()
  }

  const content = (
    <>
      <Flex vertical gap={16}>
        <Flex justify="space-between" align="center">
          <Typography.Title level={4}>{t('topup.schedules_title')}</Typography.Title>
          <Button type="primary" onClick={() => setFormState({ open: true, id: null })}>{t('button.create')}</Button>
        </Flex>
        <Flex gap={12} wrap="wrap">
          <Select
            allowClear
            value={filters.frequency}
            placeholder={t('topup.schedule_type')}
            options={[{ value: 1, label: t('topup_form.one_time') }, { value: 2, label: t('topup_form.monthly') }, { value: 3, label: t('topup_form.yearly') }]}
            onChange={(frequency) => { setPage(1); setFilters((current) => ({ ...current, frequency })) }}
            style={{ width: 180 }}
          />
          <Select
            allowClear
            value={filters.status}
            placeholder={t('topup.status')}
            options={[{ value: 1, label: t('topup_form.active') }, { value: 2, label: t('topup_form.inactive') }, { value: 3, label: 'Completed' }]}
            onChange={(status) => { setPage(1); setFilters((current) => ({ ...current, status })) }}
            style={{ width: 180 }}
          />
          <Button onClick={() => { setPage(1); setFilters({ frequency: undefined, status: undefined }) }}>{t('button.reset')}</Button>
        </Flex>
        <GenericTable
          data={schedules.data?.collection}
          fields={fields}
          rowKey="id"
          loading={schedules.loading}
          sort={sort}
          setSort={setSort}
        />
        <GenericTablePagination
          totalCount={schedules.data?.totalCount}
          totalPage={schedules.data?.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={schedules.loading}
        />
      </Flex>
      <TopupScheduleCreateDialog
        open={formState.open}
        scheduleId={formState.id}
        onClose={() => setFormState({ open: false, id: null })}
        onSuccess={() => schedules.fetch()}
      />
    </>
  )

  return content
}

export default TopupSchedulesPage
