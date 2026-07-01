import FasStatusTag from '@/features/financial-assistance/components/FasStatusTag'
import { ApiUrls } from '@/shared/api/apiUrls'
import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import BulkActionBar from '@/shared/components/generals/BulkActionBar'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useFetch from '@/shared/hooks/useFetch'
import useForm from '@/shared/hooks/useForm'
import useReasonConfirm from '@/shared/hooks/useReasonConfirm'
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
  const { values, handleChange, setField, registerRef, reset } = useForm(value)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const fields = useMemo(
    () => [
      {
        key: 'search',
        title: 'Search by scheme code or scheme name',
        label: 'Search by scheme code or scheme name',
        type: 'search',
        required: false,
        reserveLabelSpace: true,
      },
      {
        key: 'statuses',
        title: 'Status',
        type: 'multi-check-dropdown',
        options: fasSchemeStatusOptions,
        required: false,
        placeholder: 'All',
        selectAllText: 'Select all',
        searchPlaceholder: 'Input keyword',
        cancelText: 'Cancel',
        okText: 'OK',
        selectedText: (count) => `${count} items`,
      },
    ],
    [fasSchemeStatusOptions]
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

  const duplicate = useAxiosSubmit({ method: 'POST' })
  const updateStatus = useAxiosSubmit({ url: ApiUrls.FAS_SCHEME_MANAGEMENT.UPDATE_STATUS, method: 'PUT' })
  const deleteSelected = useAxiosSubmit({
    url: ApiUrls.FAS_SCHEME_MANAGEMENT.DELETE_SELECTED,
    method: 'DELETE',
  })

  const clearSelection = () => setSelectedIds([])

  const handleChangeStatus = async (status, actionLabel) => {
    if (!selectedIds.length) return

    const reason = await confirmReason({
      title: actionLabel,
      description: `${selectedIds.length} selected`,
      confirmColor: status === FAS_STATUS.Inactive ? 'error' : 'primary',
      confirmText: actionLabel,
    })
    if (!reason) return

    const response = await updateStatus.submit({
      overrideData: { ids: selectedIds, status, reason },
    })
    if (!response) return
    clearSelection()
    await schemes.fetch()
  }

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return

    const reason = await confirmReason({
      title: 'Delete selected FAS schemes?',
      description: `${selectedIds.length} selected`,
      confirmColor: 'error',
      confirmText: 'Delete',
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
    { key: 'schemeCode', title: 'Scheme code', sortable: true },
    { key: 'schemeName', title: 'Scheme name', sortable: true },
    { key: 'durationInMonths', title: 'Duration (months)', sortable: true, isNumeric: true },
    { key: 'status', title: 'Status', sortable: true, render: (value) => <FasStatusTag status={value} /> },
    {
      key: 'tiers',
      title: 'Tiers',
      render: (value) => (value || []).map((tier) => tier.tierName).join(', '),
    },
    {
      key: 'actions',
      title: '',
      width: 60,
      render: (_, row) => (
        <ActionMenu
          actions={[
            {
              title: 'Duplicate',
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
          <Typography.Title level={4} style={{ margin: 0 }}>FAS Scheme Management</Typography.Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              navigate(routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.FAS_ADMIN.SCHEME_CREATE))
            }
          >
            Create scheme
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
            navigate(
              routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.FAS_ADMIN.SCHEME_DETAIL(row.id))
            )
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
              label: 'Activate',
              icon: <CheckCircleOutlined />,
              onClick: () => handleChangeStatus(FAS_STATUS.Active, 'Activate'),
            },
            {
              key: 'deactivate',
              label: 'Deactivate',
              icon: <StopOutlined />,
              onClick: () => handleChangeStatus(FAS_STATUS.Inactive, 'Deactivate'),
            },
            {
              key: 'delete',
              label: 'Delete',
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
