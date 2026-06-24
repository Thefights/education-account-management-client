import { ApiUrls } from '@/shared/api/apiUrls'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { BankOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Descriptions, Flex, Grid, Skeleton, Statistic, Typography, theme } from 'antd'
import TuitionCourseFilterSection from '../components/TuitionCourseFilterSection'
import { useState, useMemo } from 'react'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import { minLen } from '@/shared/utils/validateUtil'
import CourseListSection from '../components/CourseListSection'
import FilterButton from '@/shared/components/buttons/FilterButton'
import { useNavigate } from 'react-router-dom';



const defaultFilters = { search: '', statuses: [] }


const TuitionPaymentlPage = () => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const profile = useFetch(ApiUrls.ACCOUNT_HOLDER.PROFILE)
  const data = profile.data

  const navigate = useNavigate();


  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ key: 'createdDate', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [openCreate, setOpenCreate] = useState(() => Boolean(location.state?.openCreate))
  const [openImport, setOpenImport] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const { submit: submitAccounts } = useAxiosSubmit({
    url: ApiUrls.EDUCATION_ACCOUNT.INDEX,
    method: 'POST',
  })
  const { submit: submitImport } = useAxiosSubmit({
    url: ApiUrls.EDUCATION_ACCOUNT.IMPORT,
    method: 'POST',
  })
  const updateStatus = useAxiosSubmit({
    url: ApiUrls.EDUCATION_ACCOUNT.UPDATE_STATUS,
    method: 'PUT',
  })
  const queryParams = useMemo(
    () => ({ ...filters, sort: `${sort.key} ${sort.direction}`, page, pageSize }),
    [filters, page, pageSize, sort]
  )
  const createFields = useMemo(
    () => [
      {
        key: 'nric',
        title: t('education_account.nric'),
        type: 'custom',
        render: ({ value, onChange }) => (
          <NricInput value={value} onChange={onChange} placeholder="S1234567D" />
        ),
      },
      {
        key: 'reason',
        title: t('education_account.reason'),
        multiple: 5,
        validate: [minLen(20, t('education_account.reason_min'))],
        props: {
          placeholder: t('education_account.reason_placeholder'),
        },
      },
    ],
    [t]
  )


  const descriptionItems = [
    {
      key: 'accountNumber',
      label: t('account_profile.account_number'),
      children: data?.accountNumber,
    },
    { key: 'name', label: t('account_profile.name'), children: data?.name },
    { key: 'nric', label: t('account_profile.nric'), children: <MaskedNric value={data?.nric} /> },
    { key: 'dateOfBirth', label: t('account_profile.date_of_birth'), children: data?.dateOfBirth },
    {
      key: 'expectedClosingDate',
      label: t('education_account.expected_closing_date'),
      children: data?.expectedClosingDate,
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
        {t('tuition-payment.title')}
      </Typography.Title>

      {profile.loading && !data ? (
        <Card>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      ) : (
        <>
          <Flex align="center" justify="flex-start" gap={20} wrap="wrap">
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
                    {/* <Typography.Text type="secondary">
                      {t('account_profile.account_number')}
                    </Typography.Text> */}
                    {/* <Typography.Title level={4} style={{ margin: '2px 0 0' }}>
                      {data?.accountNumber || '-'}
                    </Typography.Title> */}
                  </div>
                </Flex>

                <Flex vertical> 
                  <Statistic
                    title={t('tuition-payment.total_outstanding')}
                    value={data?.balance}
                    precision={2}
                    valueStyle={{ color: token.colorPrimary, fontWeight: 700, fontSize: 30 }}
                  />
                  <Typography.Text 
                    type="secondary"
                    style={{ fontSize: '12px' }}>
                      {t('tuition-payment.unpaid_invoice')}
                    </Typography.Text>
                </Flex>
                

              </Flex>
            </Card>



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
                    {/* <Typography.Text type="secondary">
                      {t('account_profile.account_number')}
                    </Typography.Text>
                    <Typography.Title level={4} style={{ margin: '2px 0 0' }}>
                      {data?.accountNumber || '-'}
                    </Typography.Title> */}
                  </div>
                </Flex>

                <Flex vertical>
                  <Statistic
                    title={t('account_profile.balance')}
                    value={data?.balance}
                    precision={2}
                    valueStyle={{ color: token.colorPrimary, fontWeight: 700, fontSize: 30 }}
                  />

                  <Typography.Text 
                    type="secondary"
                    style={{ fontSize: '12px' }}>
                      {t('tuition-payment.topup_from_moe')}
                    </Typography.Text>

                </Flex>

              </Flex>

            </Card>

          </Flex>




          <Typography.Title level={3} style={{ margin: 0, letterSpacing: '-0.02em' }}>
            {t('course_management.title.list_of_course')}
          </Typography.Title>
          
          <TuitionCourseFilterSection
            filters={filters}
            onFilter={(values) => {
              setFilters(values)
              setPage(1)
              setSelectedIds([])
            }}
            onReset={() => {
              setFilters(defaultFilters)
              setPage(1)
              setSelectedIds([])
            }}
          />

          <CourseListSection/>

          <Button 
            style={{alignSelf:'flex-end', width:'100px'}}
            onClick={() => navigate('../pay')}
          >
            Pay
          </Button>
        </>
      )}
    </Flex>
  )
}

export default TuitionPaymentlPage

