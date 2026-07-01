import FasStatusTag from '@/features/financial-assistance/components/FasStatusTag'
import {
  formatMoney,
  formatTierRange,
} from '@/features/financial-assistance/utils/fasFormUtil'
import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import ActionMenu from '@/shared/components/generals/ActionMenu'
import SearchBar from '@/shared/components/generals/SearchBar'
import GenericTable from '@/shared/components/tables/GenericTable'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { showSuccessToast } from '@/shared/utils/toastUtil'
import { DeleteOutlined, EditOutlined, EyeOutlined, RedoOutlined, StopOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Flex,
  Modal,
  Select,
  Space,
  Typography,
} from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FAS_APPLICATION_STATUS = EnumConfig.FasApplicationStatus

const MyFasManagementPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { fasApplicationStatusOptions } = useEnum()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState({ key: 'submittedAt', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detail, setDetail] = useState(null)

  const params = useMemo(
    () => ({
      search: search || undefined,
      status: status === 'all' ? undefined : status,
      sort: `${sort.key === 'submittedAt' ? 'createdAt' : sort.key} ${sort.direction}`,
      page,
      pageSize,
    }),
    [search, status, sort, page, pageSize]
  )
  const applications = useFetch(ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATIONS, params, [params])
  const pageData = applications.data || { collection: [], totalCount: 0, totalPage: 0 }
  const loadDetail = useAxiosSubmit({ method: 'GET' })
  const withdraw = useAxiosSubmit({ method: 'POST' })
  const removeDraft = useAxiosSubmit({ method: 'DELETE' })
  const reapply = useAxiosSubmit({ method: 'POST' })

  const openDetail = async (row) => {
    const response = await loadDetail.submit({
      overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_DETAIL(row.id),
    })
    if (response) setDetail(response.data)
  }
  const mutate = async (request, successMessage) => {
    if (!request) return
    showSuccessToast(successMessage)
    setDetail(null)
    await applications.fetch()
  }

  const fields = [
    { key: 'applicationNumber', title: t('financial_assistance.field.application_number'), sortable: true },
    { key: 'schemeName', title: t('financial_assistance.field.scheme_name'), sortable: true },
    { key: 'status', title: t('financial_assistance.field.status'), sortable: true, render: (value) => <FasStatusTag status={value} /> },
    { key: 'submittedAt', title: t('financial_assistance.field.submitted_date'), sortable: true },
    {
      key: 'actions',
      title: '',
      width: 60,
      render: (_, row) => {
        const actions = [
          { title: t('financial_assistance.action.view'), icon: <EyeOutlined />, onClick: () => openDetail(row) },
        ]
        if (row.status === FAS_APPLICATION_STATUS.Draft) {
          actions.push(
            {
              title: t('button.update'),
              icon: <EditOutlined />,
              onClick: () =>
                navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY), {
                  state: { draftApplicationId: row.id },
                }),
            },
            {
              title: t('financial_assistance.action.delete_draft'),
              icon: <DeleteOutlined />,
              onClick: async () =>
                mutate(
                  await removeDraft.submit({
                    overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_DELETE_DRAFT(row.id),
                  }),
                  t('financial_assistance.message.draft_deleted')
                ),
            }
          )
        }
        if (row.status === FAS_APPLICATION_STATUS.Pending) {
          actions.push({
            title: t('financial_assistance.action.withdraw'),
            icon: <StopOutlined />,
            onClick: async () =>
              mutate(
                await withdraw.submit({
                  overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_WITHDRAW(row.id),
                }),
                t('financial_assistance.message.application_withdrawn')
              ),
          })
        }
        if (
          row.status === FAS_APPLICATION_STATUS.Rejected ||
          row.status === FAS_APPLICATION_STATUS.Expired
        ) {
          actions.push({
            title: t('financial_assistance.action.apply_again'),
            icon: <RedoOutlined />,
            onClick: async () => {
              const response = await reapply.submit({
                overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_REAPPLY_DRAFT(row.id),
              })
              const draftId = response?.data?.id
              if (draftId) {
                navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY), {
                  state: { draftApplicationId: draftId },
                })
              }
            },
          })
        }
        return <ActionMenu actions={actions} />
      },
    },
  ]

  const approvedTier =
    detail?.approvedTier ||
    detail?.scheme?.tiers?.find((tier) => tier.id === detail?.approvedTierId)

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>{t('financial_assistance.management.title')}</Typography.Title>
        <Flex gap={12} wrap="wrap">
          <div style={{ flex: 1, minWidth: 300 }}>
            <Typography.Text>{t('financial_assistance.management.search_label')}</Typography.Text>
            <SearchBar
              value={search}
              setValue={(value) => {
                setSearch(value)
                setPage(1)
              }}
            />
          </div>
          <div style={{ width: 220 }}>
            <Typography.Text>{t('financial_assistance.field.status')}</Typography.Text>
            <Select
              value={status}
              style={{ width: '100%' }}
              options={[{ value: 'all', label: t('financial_assistance.filter.all_statuses') }, ...fasApplicationStatusOptions]}
              onChange={(value) => {
                setStatus(value)
                setPage(1)
              }}
            />
          </div>
        </Flex>
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
      {detail && (
        <Modal
          open
          width={800}
          title={t('financial_assistance.management.detail_title', { number: detail.applicationNumber || '' })}
          footer={<Button onClick={() => setDetail(null)}>{t('button.close')}</Button>}
          onCancel={() => setDetail(null)}
          destroyOnHidden
        >
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label={t('financial_assistance.field.scheme')}>{detail.schemeName || detail.scheme?.schemeName}</Descriptions.Item>
            <Descriptions.Item label={t('financial_assistance.field.status')}><FasStatusTag status={detail.status} /></Descriptions.Item>
            <Descriptions.Item label={t('financial_assistance.field.gross_household_income')}>{formatMoney(detail.grossHouseholdIncomeSnapshot)}</Descriptions.Item>
            <Descriptions.Item label={t('financial_assistance.field.per_capita_income')}>{formatMoney(detail.perCapitaIncomeSnapshot)}</Descriptions.Item>
            <Descriptions.Item label={t('financial_assistance.field.guardian_nationality')}>{detail.guardianNationalitySnapshot}</Descriptions.Item>
            <Descriptions.Item label={t('financial_assistance.field.submitted_at')}>{detail.createdAt || '-'}</Descriptions.Item>
          </Descriptions>
          <Divider orientation="left">{t('financial_assistance.section.tier')}</Divider>
          {approvedTier ? (
            <Typography.Paragraph>
              <strong>{approvedTier.tierName}:</strong> {formatTierRange(approvedTier)}
            </Typography.Paragraph>
          ) : (
            <Typography.Text type="secondary">{t('financial_assistance.empty.no_approved_tier')}</Typography.Text>
          )}
          <Divider orientation="left">{t('financial_assistance.section.documents')}</Divider>
          <Space direction="vertical">
            {(detail.documents || []).map((document) => (
              <Typography.Text key={document.id || document.fileKey}>
                {document.documentNameSnapshot}: {document.fileName}
              </Typography.Text>
            ))}
            {!(detail.documents || []).length && <Typography.Text type="secondary">{t('financial_assistance.empty.no_documents')}</Typography.Text>}
          </Space>
          {detail.externalRejectionReason && (
            <>
              <Divider orientation="left">{t('financial_assistance.section.rejection_reason')}</Divider>
              <Typography.Paragraph>{detail.externalRejectionReason || '-'}</Typography.Paragraph>
            </>
          )}
        </Modal>
      )}
    </Card>
  )
}

export default MyFasManagementPage
