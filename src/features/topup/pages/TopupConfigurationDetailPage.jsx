import { ApiUrls } from '@/shared/api/apiUrls'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import { defaultTopupStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useConfirm from '@/shared/hooks/useConfirm'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { Button, Card, Descriptions, Flex, Result, Skeleton, Space, Tag, Typography } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { TopupConditionTree } from '../components/TopupRuleConditionsField'
import { normalizeTopupConditionGroup } from '../utils/topupRuleFormUtil'

const TopupConfigurationDetailPage = ({ type }) => {
  const { id } = useParams()
  const isSchedule = type === 'schedule'
  const { t } = useTranslation()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const detailUrl = isSchedule ? ApiUrls.SCHEDULE_TOPUP.DETAIL(id) : ApiUrls.SYSTEM_TOPUP.DETAIL(id)
  const detail = useFetch(detailUrl, {}, [id])
  const updateStatus = useAxiosSubmit({
    url: isSchedule ? ApiUrls.SCHEDULE_TOPUP.UPDATE_STATUS : ApiUrls.SYSTEM_TOPUP.UPDATE_STATUS,
    method: 'PUT',
  })
  const remove = useAxiosSubmit({ url: detailUrl, method: 'DELETE' })
  const data = detail.data
  const isActive = data?.status === 'Active' || data?.status === 1
  const listUrl = routeUrls.BASE_ROUTE.FINANCE_ADMIN(
    `${routeUrls.TOPUP_MANAGEMENT.INDEX}?tab=${isSchedule ? 'schedules' : 'system'}`
  )
  const editUrl = routeUrls.BASE_ROUTE.FINANCE_ADMIN(
    isSchedule
      ? routeUrls.TOPUP_MANAGEMENT.SCHEDULE_EDIT(id)
      : routeUrls.TOPUP_MANAGEMENT.SYSTEM_EDIT(id)
  )

  const handleStatus = async () => {
    const response = await updateStatus.submit({
      overrideData: {
        ids: [Number(id)],
        status: isActive
          ? isSchedule
            ? EnumConfig.ScheduleTopupStatus.Inactive
            : EnumConfig.SystemTopupStatus.Inactive
          : isSchedule
            ? EnumConfig.ScheduleTopupStatus.Active
            : EnumConfig.SystemTopupStatus.Active,
      },
    })
    if (response) await detail.fetch()
  }

  const handleDelete = async () => {
    const accepted = await confirm({
      title: t(isSchedule ? 'topup_form.delete_schedule' : 'topup_form.delete_system_topup'),
      description: t(
        isSchedule
          ? 'topup_form.delete_schedule_confirm'
          : 'topup_form.delete_system_topup_confirm',
        { name: data?.name }
      ),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!accepted) return
    const response = await remove.submit()
    if (response) navigate(listUrl)
  }

  if (detail.loading && !data)
    return (
      <Card>
        <Skeleton active />
      </Card>
    )
  if (!data) {
    return (
      <Card>
        <Result
          status="404"
          title="404"
          subTitle={t('topup_form.not_found')}
          extra={<Button onClick={() => navigate(listUrl)}>{t('topup_form.back_to_list')}</Button>}
        />
      </Card>
    )
  }

  return (
    <Flex vertical gap={16}>
      <Card>
        <Flex justify="space-between" align="center" gap={16} wrap="wrap">
          <Flex align="center" gap={12}>
            <Button
              aria-label={t('button.back')}
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(listUrl)}
            />
            <div>
              <Flex align="center" gap={8} wrap="wrap">
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {data.name}
                </Typography.Title>
                <Tag color={defaultTopupStatusStyle(data.status)}>{data.status}</Tag>
              </Flex>
              <Typography.Text type="secondary">
                {t(isSchedule ? 'topup_form.schedule_detail' : 'topup_form.system_detail')} · #
                {data.id}
              </Typography.Text>
            </div>
          </Flex>
          <Space wrap>
            <Button onClick={handleStatus} loading={updateStatus.loading}>
              {t(isActive ? 'topup.deactivate' : 'topup.activate')}
            </Button>
            <Button icon={<EditOutlined />} onClick={() => navigate(editUrl)}>
              {t('button.edit')}
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={remove.loading}
              onClick={handleDelete}
            >
              {t('button.delete')}
            </Button>
          </Space>
        </Flex>
      </Card>

      <Card title={t('topup_form.overview')}>
        <Descriptions bordered column={{ xs: 1, md: 3 }}>
          <Descriptions.Item label="ID">#{data.id}</Descriptions.Item>
          <Descriptions.Item label={t('topup_form.topup_amount')}>
            <Typography.Text strong>
              {formatCurrencyBasedOnCurrentLanguage(data.topupAmount)}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('topup_form.status')}>
            <Tag color={defaultTopupStatusStyle(data.status)}>{data.status}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {isSchedule && (
        <Card
          title={
            <Space>
              <CalendarOutlined />
              {t('topup.schedule_configuration')}
            </Space>
          }
        >
          <Descriptions bordered column={{ xs: 1, md: 2, lg: 3 }}>
            <Descriptions.Item label={t('topup_form.schedule_type')}>
              {data.frequency}
            </Descriptions.Item>
            {data.oneTimeExecutionAt && (
              <Descriptions.Item label={t('topup_form.execution_date')}>
                {formatDatetimeStringBasedOnCurrentLanguage(data.oneTimeExecutionAt)}
              </Descriptions.Item>
            )}
            {data.executeAtDay != null && (
              <Descriptions.Item label={t('topup_form.day_of_month')}>
                {data.executeAtDay}
              </Descriptions.Item>
            )}
            {data.executeAtMonth != null && (
              <Descriptions.Item label={t('topup_form.month')}>
                {data.executeAtMonth}
              </Descriptions.Item>
            )}
            <Descriptions.Item label={t('topup.next_execution')}>
              {formatDatetimeStringBasedOnCurrentLanguage(data.nextExecutionAt) || '—'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card
        title={
          <Space>
            <SafetyCertificateOutlined />
            {t('topup_form.who_receives')}
          </Space>
        }
      >
        <TopupConditionTree value={normalizeTopupConditionGroup(data.rootConditionGroup)} />
      </Card>
    </Flex>
  )
}

export default TopupConfigurationDetailPage
