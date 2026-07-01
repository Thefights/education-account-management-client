import FasStatusTag from '@/features/financial-assistance/components/FasStatusTag'
import {
  formatMoney,
  formatTierRange,
} from '@/features/financial-assistance/utils/fasFormUtil'
import { ApiUrls } from '@/shared/api/apiUrls'
import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import { EnumConfig } from '@/shared/config/enumConfig'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useFetch from '@/shared/hooks/useFetch'
import useForm from '@/shared/hooks/useForm'
import { CheckOutlined, EyeOutlined, StopOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Flex,
  Input,
  Modal,
  Select,
  Space,
  Typography,
  message,
} from 'antd'
import { useMemo, useState } from 'react'

const FAS_APPLICATION_STATUS = EnumConfig.FasApplicationStatus
const defaultFilters = {
  search: '',
  statuses: [],
  submittedFrom: '',
  submittedTo: '',
  schemeId: undefined,
}

const sortFields = {
  applicationNumber: 'applicationNumber',
  accountName: 'accountName',
  accountNumber: 'accountNumber',
  schemeName: 'schemeName',
  status: 'status',
  submittedAt: 'submittedAt',
}

const QueueFilters = ({ value, schemeOptions, loading, onApply }) => {
  const { fasApplicationStatusOptions } = useEnum()
  const { values, handleChange, setField, registerRef, reset } = useForm(value)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const fields = useMemo(
    () => [
      {
        key: 'search',
        title: 'Search by application number, account number, account name, or scheme name',
        label: 'Search by application number, account number, account name, or scheme name',
        type: 'search',
        required: false,
        reserveLabelSpace: true,
      },
      {
        key: 'statuses',
        title: 'Status',
        type: 'multi-check-dropdown',
        options: fasApplicationStatusOptions,
        required: false,
        placeholder: 'All',
        selectAllText: 'Select all',
        searchPlaceholder: 'Input keyword',
        cancelText: 'Cancel',
        okText: 'OK',
        selectedText: (count) => `${count} items`,
      },
      {
        key: 'schemeId',
        title: 'Scheme',
        type: 'select',
        options: schemeOptions,
        required: false,
        placeholder: 'All',
        props: {
          allowClear: true,
          showSearch: true,
          optionFilterProp: 'label',
        },
      },
      {
        key: 'submittedRange',
        title: 'Submitted date',
        type: 'range-picker',
        required: false,
        from: { key: 'submittedFrom' },
        to: { key: 'submittedTo' },
        placeholder: ['From date', 'To date'],
      },
    ],
    [fasApplicationStatusOptions, schemeOptions]
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
        index === 0 ? { xs: 24, lg: 8 } : { xs: 24, sm: 12, lg: index === 3 ? 6 : 5 }
      }
    />
  )
}

const ReviewDialog = ({ detail, loading, onClose, onApprove, onReject }) => {
  const tiers = detail.scheme.tiers
  const recommendedTier = detail.systemSuggestedTier
  const approvedTier = detail.approvedTier
  const student = detail.studentProfile
  const [selectedTierId, setSelectedTierId] = useState(
    approvedTier?.id || recommendedTier?.id || tiers[0]?.id
  )
  const [reason, setReason] = useState('')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [externalReason, setExternalReason] = useState('')
  const [internalReason, setInternalReason] = useState('')
  const isPending = detail?.status === FAS_APPLICATION_STATUS.Pending
  const isOverride = recommendedTier?.id && selectedTierId !== recommendedTier.id

  return (
    <Modal
      open
      width={900}
      title={`FAS Application ${detail?.applicationNumber || ''}`}
      onCancel={onClose}
      footer={
        isPending ? (
          <Space>
            <Button danger icon={<StopOutlined />} onClick={() => setRejectOpen(true)}>
              Reject
            </Button>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={loading}
              onClick={() => {
                if (!selectedTierId) return message.error('Select an approved tier.')
                if (isOverride && reason.trim().length < 10) {
                  return message.error('Override reason must be at least 10 characters.')
                }
                onApprove({ approvedTierId: selectedTierId, reason: reason.trim() || undefined })
              }}
            >
              Approve
            </Button>
          </Space>
        ) : (
          <Button onClick={onClose}>Close</Button>
        )
      }
      destroyOnHidden
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="Student age">{student.age}</Descriptions.Item>
          <Descriptions.Item label="Student nationality">{student.studentNationality}</Descriptions.Item>
          <Descriptions.Item label="Scheme">{detail.scheme.schemeName}</Descriptions.Item>
          <Descriptions.Item label="Status"><FasStatusTag status={detail.status} /></Descriptions.Item>
          <Descriptions.Item label="Gross household income">{formatMoney(student.grossHouseholdIncome)}</Descriptions.Item>
          <Descriptions.Item label="Per-capita income">{formatMoney(student.perCapitaIncome)}</Descriptions.Item>
          <Descriptions.Item label="Guardian nationality">{student.guardianNationality}</Descriptions.Item>
          <Descriptions.Item label="Household members">{student.householdMembers}</Descriptions.Item>
        </Descriptions>
        <Divider orientation="left">Tier review</Divider>
        <Select
          value={selectedTierId}
          disabled={!isPending}
          style={{ width: '100%' }}
          options={tiers.map((tier) => ({
            value: tier.id,
            label: `${tier.tierName} — ${formatTierRange(tier)}`,
          }))}
          onChange={setSelectedTierId}
        />
        {isPending && isOverride && (
          <Input.TextArea
            value={reason}
            rows={3}
            placeholder="Reason for overriding the recommended tier"
            onChange={(event) => setReason(event.target.value)}
          />
        )}
        <Divider orientation="left">Documents</Divider>
        {detail.scheme.requiredDocuments.length ? (
          detail.scheme.requiredDocuments.map((document) => (
            <Typography.Text key={document.requiredDocumentId}>
              {document.documentName}: {document.fileName || 'Not uploaded'}
            </Typography.Text>
          ))
        ) : (
          <Typography.Text type="secondary">No documents.</Typography.Text>
        )}
        {(detail?.externalRejectionReason || detail?.internalRejectionReason) && (
          <>
            <Divider orientation="left">Rejection reasons</Divider>
            <Typography.Paragraph>Applicant: {detail.externalRejectionReason || '-'}</Typography.Paragraph>
            <Typography.Paragraph>Internal: {detail.internalRejectionReason || '-'}</Typography.Paragraph>
          </>
        )}
      </Space>
      <Modal
        open={rejectOpen}
        title="Reject FAS application"
        okText="Reject"
        okButtonProps={{ danger: true, loading }}
        onCancel={() => setRejectOpen(false)}
        onOk={() => {
          if (!externalReason.trim() || !internalReason.trim()) {
            return message.error('Both rejection reasons are required.')
          }
          onReject({
            externalRejectionReason: externalReason.trim(),
            internalRejectionReason: internalReason.trim(),
          })
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input.TextArea
            value={externalReason}
            rows={3}
            placeholder="Reason shown to the applicant"
            onChange={(event) => setExternalReason(event.target.value)}
          />
          <Input.TextArea
            value={internalReason}
            rows={3}
            placeholder="Internal review reason"
            onChange={(event) => setInternalReason(event.target.value)}
          />
        </Space>
      </Modal>
    </Modal>
  )
}

const FasApplicationQueuePage = () => {
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ key: 'submittedAt', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [application, setApplication] = useState(null)
  const [approving, setApproving] = useState(false)

  const params = useMemo(
    () => ({
      search: filters.search || undefined,
      statuses: filters.statuses?.length ? filters.statuses : undefined,
      submittedFrom: filters.submittedFrom || undefined,
      submittedTo: filters.submittedTo || undefined,
      schemeId: filters.schemeId || undefined,
      sort: `${sortFields[sort.key] || sort.key} ${sort.direction}`,
      page,
      pageSize,
    }),
    [filters, sort, page, pageSize]
  )
  const applications = useFetch(ApiUrls.FAS_APPLICATION_MANAGEMENT.INDEX, params, [params])
  const schemes = useFetch(ApiUrls.FAS_SCHEME_MANAGEMENT.GET_ALL, {}, [])
  const pageData = applications.data || { collection: [], totalCount: 0, totalPage: 0 }
  const schemeOptions = useMemo(
    () =>
      (schemes.data?.collection || schemes.data || []).map((scheme) => ({
        value: scheme.id,
        label: scheme.schemeName,
      })),
    [schemes.data]
  )
  const detail = useAxiosSubmit({ method: 'GET' })
  const approve = useAxiosSubmit({ method: 'POST' })
  const reject = useAxiosSubmit({ method: 'POST' })

  const openDetail = async (row) => {
    const response = await detail.submit({
      overrideUrl: ApiUrls.FAS_APPLICATION_MANAGEMENT.DETAIL(row.id),
    })
    if (response) setApplication(response.data)
  }
  const refreshAndClose = async (response) => {
    if (!response) return
    setApplication(null)
    await applications.fetch()
  }

  const fields = [
    { key: 'applicationNumber', title: 'Application number', sortable: true },
    { key: 'accountNumber', title: 'Account number', sortable: true },
    { key: 'accountName', title: 'Account name', sortable: true },
    { key: 'schemeName', title: 'Scheme name', sortable: true },
    { key: 'status', title: 'Status', sortable: true, render: (value) => <FasStatusTag status={value} /> },
    { key: 'submittedAt', title: 'Submitted date', sortable: true },
    {
      key: 'actions',
      title: '',
      width: 60,
      render: (_, row) => (
        <ActionMenu actions={[{ title: 'Review', icon: <EyeOutlined />, onClick: () => openDetail(row) }]} />
      ),
    },
  ]

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>FAS Application Queue</Typography.Title>
        <QueueFilters
          value={filters}
          schemeOptions={schemeOptions}
          loading={applications.loading}
          onApply={(value) => {
            setFilters(value)
            setPage(1)
          }}
        />
        <GenericTable
          data={pageData.collection}
          fields={fields}
          rowKey="id"
          sort={sort}
          setSort={setSort}
          loading={applications.loading}
        />
        <GenericTablePagination
          totalCount={pageData.totalCount}
          totalPage={pageData.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={applications.loading}
        />
      </Flex>
      {application && (
        <ReviewDialog
          detail={application}
          loading={approving || approve.loading || reject.loading}
          onClose={() => setApplication(null)}
          onApprove={async (payload) => {
            setApproving(true)
            const response = await approve.submit({
              overrideUrl: ApiUrls.FAS_APPLICATION_MANAGEMENT.APPROVE(application.id),
              overrideData: payload,
            })
            setApproving(false)
            await refreshAndClose(response)
          }}
          onReject={async (payload) =>
            refreshAndClose(
              await reject.submit({
                overrideUrl: ApiUrls.FAS_APPLICATION_MANAGEMENT.REJECT(application.id),
                overrideData: payload,
              })
            )
          }
        />
      )}
    </Card>
  )
}

export default FasApplicationQueuePage
