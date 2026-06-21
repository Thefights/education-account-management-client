import { ApiUrls } from '@/shared/api/apiUrls'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Card, Descriptions, Flex, Skeleton, Statistic, Tag, Typography } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import TransactionHistorySection from '../components/TransactionHistorySection'

const EducationAccountDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const detail = useFetch(ApiUrls.EDUCATION_ACCOUNT.DETAIL(id))
  const account = detail.data

  return (
    <Flex vertical gap={16}>
      <Card>
        <Flex vertical gap={16}>
          <Flex align="center" gap={12}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
            <Typography.Title level={4} style={{ margin: 0 }}>
              {t('education_account.detail_title')}
            </Typography.Title>
          </Flex>
          {detail.loading && !account ? <Skeleton active /> : (
            <>
              <Flex align="center" gap={8}>
                <Typography.Title level={5} style={{ margin: 0 }}>{account?.name}</Typography.Title>
                <Tag color={account?.status === 'Active' ? 'success' : 'processing'}>{account?.status}</Tag>
              </Flex>
              <Statistic title={t('education_account.balance')} value={account?.balance} precision={2} />
              <Descriptions bordered column={{ xs: 1, md: 2 }}>
                <Descriptions.Item label={t('education_account.account_number')}>{account?.accountNumber}</Descriptions.Item>
                <Descriptions.Item label={t('education_account.nric')}><MaskedNric value={account?.nric} /></Descriptions.Item>
                <Descriptions.Item label={t('education_account.date_of_birth')}>{account?.dateOfBirth}</Descriptions.Item>
                <Descriptions.Item label={t('education_account.created_date')}>{account?.createdDate}</Descriptions.Item>
                <Descriptions.Item label={t('education_account.expected_closing_date')}>{account?.expectedClosingDate}</Descriptions.Item>
                <Descriptions.Item label={t('education_account.email')}>{account?.email}</Descriptions.Item>
                <Descriptions.Item label={t('education_account.phone')}>{account?.phoneNumber}</Descriptions.Item>
                <Descriptions.Item label={t('education_account.residential_address')}>{account?.residentialAddress}</Descriptions.Item>
                <Descriptions.Item label={t('education_account.mailing_address')}>{account?.mailingAddress}</Descriptions.Item>
              </Descriptions>
            </>
          )}
        </Flex>
      </Card>
      <TransactionHistorySection url={ApiUrls.EDUCATION_ACCOUNT.TRANSACTIONS(id)} />
    </Flex>
  )
}

export default EducationAccountDetailPage
