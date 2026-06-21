import { ApiUrls } from '@/shared/api/apiUrls'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Descriptions, Flex, Skeleton, Statistic, Typography } from 'antd'

const AccountProfilePage = () => {
  const { t } = useTranslation()
  const profile = useFetch(ApiUrls.ACCOUNT_HOLDER.PROFILE)
  const data = profile.data

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4}>{t('account_profile.title')}</Typography.Title>
        {profile.loading && !data ? (
          <Skeleton active />
        ) : (
          <>
            <Statistic title={t('account_profile.balance')} value={data?.balance} precision={2} />
            <Descriptions bordered column={{ xs: 1, md: 2 }}>
              <Descriptions.Item label={t('account_profile.account_number')}>
                {data?.accountNumber}
              </Descriptions.Item>
              <Descriptions.Item label={t('account_profile.name')}>{data?.name}</Descriptions.Item>
              <Descriptions.Item label={t('account_profile.nric')}>
                <MaskedNric value={data?.nric} />
              </Descriptions.Item>
              <Descriptions.Item label={t('account_profile.date_of_birth')}>
                {data?.dateOfBirth}
              </Descriptions.Item>
              <Descriptions.Item label={t('education_account.expected_closing_date')}>
                {data?.expectedClosingDate}
              </Descriptions.Item>
              <Descriptions.Item label={t('account_profile.email')}>
                {data?.email}
              </Descriptions.Item>
              <Descriptions.Item label={t('account_profile.phone')}>
                {data?.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label={t('account_profile.residential_address')}>
                {data?.residentialAddress}
              </Descriptions.Item>
              <Descriptions.Item label={t('account_profile.mailing_address')}>
                {data?.mailingAddress}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Flex>
    </Card>
  )
}

export default AccountProfilePage
