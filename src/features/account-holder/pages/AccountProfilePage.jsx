import { ApiUrls } from '@/shared/api/apiUrls'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDateToDDMMYYYY } from '@/shared/utils/formatDateUtil'
import { BankOutlined, UserOutlined } from '@ant-design/icons'
import { Card, Descriptions, Flex, Grid, Skeleton, Statistic, Typography, theme } from 'antd'

const AccountProfilePage = () => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const profile = useFetch(ApiUrls.ACCOUNT_HOLDER.PROFILE)
  const data = profile.data

  const descriptionItems = [
    {
      key: 'accountNumber',
      label: t('account_profile.account_number'),
      children: data?.accountNumber,
    },
    { key: 'name', label: t('account_profile.name'), children: data?.name },
    { key: 'nric', label: t('account_profile.nric'), children: <MaskedNric value={data?.nric} /> },
    {
      key: 'dateOfBirth',
      label: t('account_profile.date_of_birth'),
      children: formatDateToDDMMYYYY(data?.dateOfBirth),
    },
    {
      key: 'expectedClosingDate',
      label: t('education_account.expected_closing_date'),
      children: formatDateToDDMMYYYY(data?.expectedClosingDate),
    },
    { key: 'email', label: t('account_profile.email'), children: data?.email },
    { key: 'phoneNumber', label: t('account_profile.phone'), children: data?.phoneNumber },
    {
      key: 'residentialAddress',
      label: t('account_profile.residential_address'),
      children: data?.residentialAddress,
    },
    {
      key: 'mailingAddress',
      label: t('account_profile.mailing_address'),
      children: data?.mailingAddress,
    },
  ]

  return (
    <Flex vertical gap={18} style={{ width: '100%', maxWidth: 1400, margin: '0 auto' }}>
      <Typography.Title level={3} style={{ margin: 0, letterSpacing: '-0.02em' }}>
        {t('account_profile.title')}
      </Typography.Title>

      {profile.loading && !data ? (
        <Card>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      ) : (
        <>
          <Card
            style={{
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgContainer} 72%)`,
              borderColor: token.colorPrimaryBorder,
            }}
            styles={{ body: { padding: screens.sm ? 28 : 20 } }}
          >
            <Flex align="center" justify="space-between" gap={20} wrap="wrap">
              <Flex align="center" gap={16}>
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    color: token.colorPrimary,
                    background: token.colorPrimaryBgHover,
                    fontSize: 22,
                  }}
                >
                  <BankOutlined />
                </Flex>
                <div>
                  <Typography.Text type="secondary">
                    {t('account_profile.account_number')}
                  </Typography.Text>
                  <Typography.Title level={4} style={{ margin: '2px 0 0' }}>
                    {data?.accountNumber || '-'}
                  </Typography.Title>
                </div>
              </Flex>
              <Statistic
                title={t('account_profile.balance')}
                value={data?.balance}
                formatter={(value) => formatCurrencyBasedOnCurrentLanguage(value)}
                valueStyle={{ color: token.colorPrimary, fontWeight: 700, fontSize: 30 }}
              />
            </Flex>
          </Card>

          <Card
            title={
              <Flex align="center" gap={10}>
                <UserOutlined style={{ color: token.colorPrimary }} />
                <span>{data?.name || t('account_profile.title')}</span>
              </Flex>
            }
            styles={{ body: { padding: screens.sm ? 24 : 16 } }}
          >
            <Descriptions
              items={descriptionItems}
              column={{ xs: 1, md: 2 }}
              labelStyle={{ color: token.colorTextSecondary, fontWeight: 500 }}
              contentStyle={{ color: token.colorText, fontWeight: 600 }}
            />
          </Card>
        </>
      )}
    </Flex>
  )
}

export default AccountProfilePage
