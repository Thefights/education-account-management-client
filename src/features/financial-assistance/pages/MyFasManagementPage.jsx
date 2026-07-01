import FasStatusTag from '@/features/financial-assistance/components/FasStatusTag'
import {
  formatFriendlyTierRanges,
  formatMoney,
  formatSubsidy,
} from '@/features/financial-assistance/utils/fasFormUtil'
import { ApiUrls } from '@/shared/api/apiUrls'
import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import GenericTable from '@/shared/components/tables/GenericTable'
import { EnumConfig } from '@/shared/config/enumConfig'
import { envConfig } from '@/shared/config/envConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { getEnumLabelByValue } from '@/shared/utils/handleStringUtil'
import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  RedoOutlined,
  StopOutlined,
} from '@ant-design/icons'
import { Button, Card, Descriptions, Flex, List, Modal, Space, theme, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FAS_APPLICATION_STATUS = EnumConfig.FasApplicationStatus
const defaultFilters = { search: '' }
const statusTabs = [
  FAS_APPLICATION_STATUS.Draft,
  FAS_APPLICATION_STATUS.Pending,
  FAS_APPLICATION_STATUS.Approved,
  FAS_APPLICATION_STATUS.Rejected,
  FAS_APPLICATION_STATUS.Expired,
]

const getFileUrl = (fileKey) => {
  if (!fileKey) return null
  if (/^https?:\/\//i.test(fileKey)) return fileKey
  return `${envConfig.imageCloudUrl.replace(/\/$/, '')}/${fileKey.replace(/^\//, '')}`
}

const MyFasFilterSection = ({ filters, loading, onFilter, onReset }) => {
  const { t } = useTranslation()
  const { values, handleChange, setField, registerRef, reset } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const fields = [
    {
      key: 'search',
      title: t('financial_assistance.management.search_label'),
      label: t('financial_assistance.management.search_label'),
      type: 'search',
      required: false,
      reserveLabelSpace: true,
      colProps: { xs: 24 },
    },
  ]

  return (
    <GenericFilterSection
      fields={fields}
      values={values}
      renderField={renderField}
      reset={reset}
      resetValues={defaultFilters}
      onFilter={onFilter}
      onReset={onReset}
      loading={loading}
      cardProps={{
        style: { boxShadow: 'none', background: 'var(--app-filter-bg)' },
        styles: { body: { padding: 16 } },
      }}
    />
  )
}

const DetailDate = ({ value }) => formatDatetimeStringBasedOnCurrentLanguage(value) || '-'

const DetailSection = ({ title, children, extra }) => {
  const { token } = theme.useToken()

  return (
    <Flex
      vertical
      gap={12}
      style={{
        padding: 16,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadiusLG,
        background: token.colorFillAlter,
      }}
    >
      <Flex justify="space-between" align="center" gap={12}>
        <Typography.Text strong>{title}</Typography.Text>
        {extra}
      </Flex>
      {children}
    </Flex>
  )
}

const TierSummary = ({ tier }) => {
  const { t } = useTranslation()
  const { token } = theme.useToken()

  if (!tier) {
    return (
      <Typography.Text type="secondary">
        {t('financial_assistance.empty.no_approved_tier')}
      </Typography.Text>
    )
  }

  return (
    <Flex
      justify="space-between"
      gap={16}
      wrap="wrap"
      style={{
        padding: 14,
        borderRadius: token.borderRadius,
        background: token.colorBgContainer,
      }}
    >
      <Flex vertical gap={6}>
        <Typography.Text strong>{tier.tierName}</Typography.Text>
        <Typography.Text type="secondary">{formatFriendlyTierRanges(tier).join(' · ')}</Typography.Text>
      </Flex>
      <Flex vertical gap={4} align="flex-end">
        <Typography.Text type="secondary">
          {t('financial_assistance.field.deduction')}
        </Typography.Text>
        <Typography.Text strong style={{ color: token.colorSuccess, fontSize: 16 }}>
          {tier.isPerComponent
            ? t('financial_assistance.text.per_component_subsidy', {
                course: formatSubsidy(tier.courseFeeSubsidyValue, tier.subsidyType),
                misc: formatSubsidy(tier.miscFeeSubsidyValue, tier.subsidyType),
              })
            : formatSubsidy(tier.subsidyValue, tier.subsidyType)}
        </Typography.Text>
      </Flex>
    </Flex>
  )
}

const MyFasApplicationDetailDialog = ({
  detail,
  loading,
  onClose,
  onEditDraft,
  onDeleteDraft,
  onWithdraw,
  onReapply,
}) => {
  const { t } = useTranslation()
  const status = detail?.status
  const isDraft = status === FAS_APPLICATION_STATUS.Draft
  const isPending = status === FAS_APPLICATION_STATUS.Pending
  const canReapply =
    status === FAS_APPLICATION_STATUS.Rejected || status === FAS_APPLICATION_STATUS.Expired
  const showTier =
    status === FAS_APPLICATION_STATUS.Approved || status === FAS_APPLICATION_STATUS.Expired
  const title = t('financial_assistance.management.detail_title', {
    number: detail?.applicationNumber || '',
  })

  const footer = (
    <Flex justify="space-between" gap={12} wrap="wrap">
      <Button onClick={onClose}>{t('button.close')}</Button>
      <Space wrap>
        {isDraft && (
          <>
            <Button icon={<DeleteOutlined />} danger onClick={onDeleteDraft}>
              {t('financial_assistance.action.delete_draft')}
            </Button>
            <Button type="primary" icon={<EditOutlined />} onClick={onEditDraft}>
              {t('button.update')}
            </Button>
          </>
        )}
        {isPending && (
          <Button icon={<StopOutlined />} danger onClick={onWithdraw}>
            {t('financial_assistance.action.withdraw')}
          </Button>
        )}
        {canReapply && (
          <Button type="primary" icon={<RedoOutlined />} onClick={onReapply}>
            {t('financial_assistance.action.apply_again')}
          </Button>
        )}
      </Space>
    </Flex>
  )

  return (
    <Modal
      open={Boolean(detail) || loading}
      width={860}
      title={title}
      footer={footer}
      onCancel={onClose}
      destroyOnHidden
    >
      {loading || !detail ? (
        <Typography.Text type="secondary">{t('general.loading')}</Typography.Text>
      ) : (
        <Flex vertical gap={16}>
          <Descriptions bordered size="small" column={{ xs: 1, md: 2 }}>
            <Descriptions.Item label={t('financial_assistance.field.scheme')}>
              {detail.scheme?.schemeName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('financial_assistance.field.status')}>
              <FasStatusTag status={detail.status} />
            </Descriptions.Item>
            <Descriptions.Item label={t('financial_assistance.field.submitted_at')}>
              <DetailDate value={detail.createdAt} />
            </Descriptions.Item>
            {detail.withdrawnAt && (
              <Descriptions.Item label={t('financial_assistance.field.withdrawn_at')}>
                <DetailDate value={detail.withdrawnAt} />
              </Descriptions.Item>
            )}
            {detail.approvedAt && (
              <Descriptions.Item label={t('financial_assistance.field.approved_at')}>
                <DetailDate value={detail.approvedAt} />
              </Descriptions.Item>
            )}
            {detail.validityEndDate && (
              <Descriptions.Item label={t('financial_assistance.field.validity_end_date')}>
                <DetailDate value={detail.validityEndDate} />
              </Descriptions.Item>
            )}
            <Descriptions.Item label={t('financial_assistance.field.gross_household_income')}>
              {formatMoney(detail.grossHouseholdIncomeSnapshot)}
            </Descriptions.Item>
            <Descriptions.Item label={t('financial_assistance.field.per_capita_income')}>
              {formatMoney(detail.perCapitaIncomeSnapshot)}
            </Descriptions.Item>
            <Descriptions.Item label={t('financial_assistance.field.household_members')}>
              {detail.householdMemberCountSnapshot ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('financial_assistance.field.guardian_nationality')}>
              {detail.guardianNationalitySnapshot || '-'}
            </Descriptions.Item>
          </Descriptions>

          {showTier && (
            <DetailSection title={t('financial_assistance.section.tier')}>
              <TierSummary tier={detail.approvedTier} />
            </DetailSection>
          )}

          {(detail.externalRejectionReason ||
            status === FAS_APPLICATION_STATUS.Rejected ||
            status === FAS_APPLICATION_STATUS.Withdrawn) && (
            <DetailSection
              title={
                status === FAS_APPLICATION_STATUS.Withdrawn
                  ? t('financial_assistance.section.application_note')
                  : t('financial_assistance.section.rejection_reason')
              }
            >
              <Typography.Paragraph>
                {detail.externalRejectionReason ||
                  t('financial_assistance.message.application_withdrawn_description')}
              </Typography.Paragraph>
            </DetailSection>
          )}

          <DetailSection
            title={t('financial_assistance.section.documents')}
            extra={
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {(detail.documents || []).length}
              </Typography.Text>
            }
          >
            <List
              size="small"
              dataSource={detail.documents || []}
              locale={{ emptyText: t('financial_assistance.empty.no_documents') }}
              renderItem={(document) => {
                const fileUrl = getFileUrl(document.fileKey)
                return (
                  <List.Item
                    actions={
                      fileUrl
                        ? [
                            <Button
                              key="view"
                              type="link"
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {t('financial_assistance.action.view_document')}
                            </Button>,
                          ]
                        : []
                    }
                  >
                    <List.Item.Meta
                      avatar={<FileTextOutlined />}
                      title={document.documentNameSnapshot || document.fileName}
                      description={document.fileName || '-'}
                    />
                  </List.Item>
                )
              }}
            />
          </DetailSection>

          <DetailSection
            title={t('financial_assistance.section.additional_questions')}
            extra={
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {(detail.additionalAnswers || []).length}
              </Typography.Text>
            }
          >
            <List
              size="small"
              dataSource={detail.additionalAnswers || []}
              locale={{ emptyText: t('financial_assistance.empty.no_additional_questions') }}
              renderItem={(answer) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space size={6}>
                        <Typography.Text>{answer.questionTextSnapshot}</Typography.Text>
                        {answer.isRequiredSnapshot && (
                          <Typography.Text type="danger">*</Typography.Text>
                        )}
                      </Space>
                    }
                    description={answer.answerText || '-'}
                  />
                </List.Item>
              )}
            />
          </DetailSection>
        </Flex>
      )}
    </Modal>
  )
}

const MyFasManagementPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { fasApplicationStatusOptions } = useEnum()
  const [filters, setFilters] = useState(defaultFilters)
  const [activeStatus, setActiveStatus] = useState(FAS_APPLICATION_STATUS.Draft)
  const [sort, setSort] = useState({ key: null, direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detail, setDetail] = useState(null)

  const queryParams = useMemo(
    () => ({
      Search: filters.search || undefined,
      Statuses: [activeStatus],
      ...(sort.key ? { Sort: `${sort.key} ${sort.direction}` } : {}),
      Page: page,
      PageSize: pageSize,
    }),
    [activeStatus, filters.search, page, pageSize, sort]
  )

  const applications = useFetch(ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATIONS, queryParams, [queryParams])
  const pendingCount = useFetch(
    ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATIONS,
    { Statuses: [FAS_APPLICATION_STATUS.Pending], Page: 1, PageSize: 1 },
    []
  )
  const approvedCount = useFetch(
    ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATIONS,
    { Statuses: [FAS_APPLICATION_STATUS.Approved], Page: 1, PageSize: 1 },
    []
  )
  const rejectedCount = useFetch(
    ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATIONS,
    { Statuses: [FAS_APPLICATION_STATUS.Rejected], Page: 1, PageSize: 1 },
    []
  )
  const withdrawnCount = useFetch(
    ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATIONS,
    { Statuses: [FAS_APPLICATION_STATUS.Withdrawn], Page: 1, PageSize: 1 },
    []
  )
  const draftCount = useFetch(
    ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATIONS,
    { Statuses: [FAS_APPLICATION_STATUS.Draft], Page: 1, PageSize: 1 },
    []
  )
  const expiredCount = useFetch(
    ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATIONS,
    { Statuses: [FAS_APPLICATION_STATUS.Expired], Page: 1, PageSize: 1 },
    []
  )
  const countMap = {
    [FAS_APPLICATION_STATUS.Pending]: pendingCount.data?.totalCount ?? 0,
    [FAS_APPLICATION_STATUS.Approved]: approvedCount.data?.totalCount ?? 0,
    [FAS_APPLICATION_STATUS.Rejected]: rejectedCount.data?.totalCount ?? 0,
    [FAS_APPLICATION_STATUS.Withdrawn]: withdrawnCount.data?.totalCount ?? 0,
    [FAS_APPLICATION_STATUS.Draft]: draftCount.data?.totalCount ?? 0,
    [FAS_APPLICATION_STATUS.Expired]: expiredCount.data?.totalCount ?? 0,
  }

  const loadDetail = useAxiosSubmit({ method: 'GET' })
  const withdraw = useAxiosSubmit({ method: 'POST' })
  const removeDraft = useAxiosSubmit({ method: 'DELETE' })
  const reapply = useAxiosSubmit({ method: 'POST' })
  const pageData = applications.data || { collection: [], totalCount: 0, totalPage: 0 }

  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
  }

  const handleStatusChange = (status) => {
    setActiveStatus(status)
    setPage(1)
  }

  const openDetail = async (row) => {
    const response = await loadDetail.submit({
      overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_DETAIL(row.id),
    })
    if (response?.data) setDetail(response.data)
  }

  const closeDetail = () => setDetail(null)

  const refreshAfterAction = async () => {
    closeDetail()
    await Promise.all([
      applications.fetch(),
      pendingCount.fetch(),
      approvedCount.fetch(),
      rejectedCount.fetch(),
      withdrawnCount.fetch(),
      draftCount.fetch(),
      expiredCount.fetch(),
    ])
  }

  const handleDeleteDraft = async () => {
    if (!detail) return
    const response = await removeDraft.submit({
      overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_DELETE_DRAFT(detail.id),
    })
    if (response) await refreshAfterAction()
  }

  const handleWithdraw = async () => {
    if (!detail) return
    const response = await withdraw.submit({
      overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_WITHDRAW(detail.id),
    })
    if (response) await refreshAfterAction()
  }

  const handleReapply = async () => {
    if (!detail) return
    const response = await reapply.submit({
      overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_REAPPLY_DRAFT(detail.id),
    })
    const draftId = response?.data?.id ?? response?.data
    if (draftId) {
      navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY), {
        state: { draftApplicationId: draftId },
      })
    }
  }

  const fields = [
    {
      key: 'applicationNumber',
      title: t('financial_assistance.field.application_number'),
      sortable: true,
      fixedColumn: true,
      width: 220,
    },
    {
      key: 'schemeName',
      title: t('financial_assistance.field.scheme_name'),
      sortable: true,
      width: 280,
    },
    {
      key: 'status',
      title: t('financial_assistance.field.status'),
      sortable: true,
      width: 140,
      render: (value) => <FasStatusTag status={value} />,
    },
    {
      key: 'submittedAt',
      title: t('financial_assistance.field.submitted_date'),
      sortable: true,
      width: 200,
      render: (value) => formatDatetimeStringBasedOnCurrentLanguage(value) || '-',
    },
  ]

  const handleSortChange = (nextSort) => {
    setSort(nextSort)
    setPage(1)
  }

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('financial_assistance.management.title')}
        </Typography.Title>

        <Space wrap>
          {statusTabs.map((status) => (
            <Button
              key={status}
              type={activeStatus === status ? 'primary' : 'default'}
              onClick={() => handleStatusChange(status)}
            >
              {getEnumLabelByValue(fasApplicationStatusOptions, status) || status} (
              {countMap[status] ?? 0})
            </Button>
          ))}
        </Space>

        <MyFasFilterSection
          filters={filters}
          loading={applications.loading}
          onFilter={handleFilter}
          onReset={() => handleFilter(defaultFilters)}
        />

        <GenericTable
          data={pageData.collection}
          fields={fields}
          rowKey="id"
          sort={sort}
          setSort={handleSortChange}
          loading={applications.loading}
          onRowClick={openDetail}
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

      <MyFasApplicationDetailDialog
        detail={detail}
        loading={loadDetail.loading}
        onClose={closeDetail}
        onEditDraft={() =>
          navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY), {
            state: { draftApplicationId: detail?.id },
          })
        }
        onDeleteDraft={handleDeleteDraft}
        onWithdraw={handleWithdraw}
        onReapply={handleReapply}
      />
    </Card>
  )
}

export default MyFasManagementPage
