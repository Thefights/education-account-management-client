import FasStatusTag from '@/features/financial-assistance/components/FasStatusTag'
import { ApiUrls } from '@/shared/api/apiUrls'
import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import ActionMenu from '@/shared/components/generals/ActionMenu'
import BulkActionBar from '@/shared/components/generals/BulkActionBar'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import GenericTable from '@/shared/components/tables/GenericTable'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useReasonConfirm from '@/shared/hooks/useReasonConfirm'
import useTranslation from '@/shared/hooks/useTranslation'
import { getStatusActionMeta } from '@/shared/utils/bulkStatusActionUtil'
import {
  CheckCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
  StopOutlined,
} from '@ant-design/icons'
import { Button, Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FAS_STATUS = EnumConfig.FasSchemeStatus
const defaultFilters = { search: '', statuses: [] }

const sortFields = {
  schemeCode: 'schemeCode',
  schemeName: 'schemeName',
  status: 'status',
  durationInMonths: 'durationInMonths',
  createdAt: 'createdAt',
}

const SchemeFilters = ({ value, loading, onApply }) => {
  const { fasSchemeStatusOptions } = useEnum()
  const { t } = useTranslation()
  const { values, handleChange, setField, registerRef, reset } = useForm(value)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const fields = useMemo(
    () => [
      {
        key: 'search',
        title: t('financial_assistance.admin.scheme.search_label'),
        label: t('financial_assistance.admin.scheme.search_label'),
        type: 'search',
        required: false,
        reserveLabelSpace: true,
      },
      {
        key: 'statuses',
        title: t('financial_assistance.field.status'),
        type: 'multi-check-dropdown',
        options: fasSchemeStatusOptions,
        required: false,
        placeholder: t('text.all'),
        selectAllText: t('general.select_all'),
        searchPlaceholder: t('general.input_keyword'),
        selectedText: (count) => `${count} ${t('text.items')}`,
      },
    ],
    [fasSchemeStatusOptions, t]
  )

  return (
    <GenericFilterSection
      fields={fields}
      values={values}
      renderField={renderField}
      reset={reset}
      resetValues={defaultFilters}
      onReset={() => onApply(defaultFilters)}
      onFilter={onApply}
      loading={loading}
      getFieldColProps={(_, index) =>
        index === 0 ? { xs: 24, md: 14, lg: 16 } : { xs: 24, md: 10, lg: 8 }
      }
    />
  )
}

const FasSchemeManagementPage = () => {
  const navigate = useNavigate()
  const confirmReason = useReasonConfirm()
  const { t } = useTranslation()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ key: 'createdAt', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState([])

  const params = useMemo(
    () => ({
      search: filters.search || undefined,
      statuses: filters.statuses?.length ? filters.statuses : undefined,
      sort: `${sortFields[sort.key] || sort.key} ${sort.direction}`,
      page,
      pageSize,
    }),
    [filters, sort, page, pageSize]
  )
  const schemes = useFetch(ApiUrls.FAS_SCHEME_MANAGEMENT.INDEX, params, [params])
  const pageData = schemes.data || { collection: [], totalCount: 0, totalPage: 0 }
  const activateMeta = useMemo(
    () =>
      getStatusActionMeta({
        records: pageData.collection,
        selectedIds,
        targetStatus: FAS_STATUS.Active,
      }),
    [pageData.collection, selectedIds]
  )
  const deactivateMeta = useMemo(
    () =>
      getStatusActionMeta({
        records: pageData.collection,
        selectedIds,
        targetStatus: FAS_STATUS.Inactive,
      }),
    [pageData.collection, selectedIds]
  )

  const duplicate = useAxiosSubmit({ method: 'POST' })
  const updateStatus = useAxiosSubmit({
    url: ApiUrls.FAS_SCHEME_MANAGEMENT.UPDATE_STATUS,
    method: 'PUT',
  })
  const deleteSelected = useAxiosSubmit({
    url: ApiUrls.FAS_SCHEME_MANAGEMENT.DELETE_SELECTED,
    method: 'DELETE',
  })

  const clearSelection = () => setSelectedIds([])

  const handleChangeStatus = async (status, actionLabel) => {
    if (!selectedIds.length) return
    const actionMeta = status === FAS_STATUS.Active ? activateMeta : deactivateMeta
    if (!actionMeta.hasActionable) return

    const reason = await confirmReason({
      title: actionLabel,
      description: t('text.status_update_selection_description', { count: selectedIds.length }),
      confirmColor: status === FAS_STATUS.Inactive ? 'error' : 'primary',
      confirmText: actionLabel,
    })
    if (!reason) return

    const response = await updateStatus.submit({
      overrideData: { ids: actionMeta.actionableIds, status, reason },
    })
    if (!response) return
    clearSelection()
    await schemes.fetch()
  }

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return

    const reason = await confirmReason({
      title: t('financial_assistance.admin.scheme.delete_selected_title'),
      description: t('financial_assistance.admin.text.selected_count', {
        count: selectedIds.length,
      }),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!reason) return

    const response = await deleteSelected.submit({
      overrideData: { ids: selectedIds, reason },
    })
    if (!response) return
    clearSelection()
    await schemes.fetch()
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

  const mutationLoading = duplicate.loading || updateStatus.loading || deleteSelected.loading

  const fields = [
    { key: 'schemeCode', title: t('financial_assistance.admin.field.scheme_code'), sortable: true },
    { key: 'schemeName', title: t('financial_assistance.field.scheme_name'), sortable: true },
    {
      key: 'durationInMonths',
      title: t('financial_assistance.admin.field.duration_months'),
      sortable: true,
      isNumeric: true,
    },
    {
      key: 'status',
      title: t('financial_assistance.field.status'),
      sortable: true,
      render: (value) => <FasStatusTag status={value} />,
    },
    {
      key: 'actions',
      title: '',
      width: 60,
      render: (_, row) => (
        <ActionMenu
          actions={[
            {
              title: t('button.duplicate'),
              icon: <CopyOutlined />,
              onClick: async () => {
                const response = await duplicate.submit({
                  overrideUrl: ApiUrls.FAS_SCHEME_MANAGEMENT.DUPLICATE(row.id),
                })
                if (response) await schemes.fetch()
              },
            },
          ]}
        />
      ),
    },
  ]

  return (
    <Card>
      <Flex vertical gap={16}>
        <Flex justify="space-between" align="center">
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t('financial_assistance.admin.scheme.title')}
          </Typography.Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              navigate(routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.FAS_ADMIN.SCHEME_CREATE))
            }
          >
            {t('financial_assistance.admin.scheme.create_scheme')}
          </Button>
        </Flex>
        <SchemeFilters
          value={filters}
          loading={schemes.loading}
          onApply={(value) => {
            setFilters(value)
            setPage(1)
            clearSelection()
          }}
        />
        <GenericTable
          data={pageData.collection}
          fields={fields}
          rowKey="id"
          sort={sort}
          setSort={handleSort}
          canSelectRows
          selectedRows={selectedIds}
          setSelectedRows={setSelectedIds}
          loading={schemes.loading || mutationLoading}
          onRowClick={(row) =>
            navigate(routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.FAS_ADMIN.SCHEME_DETAIL(row.id)))
          }
        />
        <GenericTablePagination
          totalCount={pageData.totalCount}
          totalPage={pageData.totalPage}
          page={page}
          setPage={handlePage}
          pageSize={pageSize}
          setPageSize={handlePageSize}
          loading={schemes.loading}
        />
        <BulkActionBar
          selectedCount={selectedIds.length}
          loading={mutationLoading}
          onClear={clearSelection}
          actions={[
            {
              key: 'activate',
              label: t('financial_assistance.admin.action.activate'),
              icon: <CheckCircleOutlined />,
              disabled: !activateMeta.hasActionable,
              onClick: () =>
                handleChangeStatus(
                  FAS_STATUS.Active,
                  t('financial_assistance.admin.action.activate')
                ),
            },
            {
              key: 'deactivate',
              label: t('financial_assistance.admin.action.deactivate'),
              icon: <StopOutlined />,
              disabled: !deactivateMeta.hasActionable,
              onClick: () =>
                handleChangeStatus(
                  FAS_STATUS.Inactive,
                  t('financial_assistance.admin.action.deactivate')
                ),
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
    </Card>
  )
}

export default FasSchemeManagementPage
