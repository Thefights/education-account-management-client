import { ApiUrls } from '@/shared/api/apiUrls'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { BankOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Col, Divider, Flex, Form, Grid, Input, Row, Select, Skeleton, Typography, theme } from 'antd'
import { QrcodeOutlined } from '@ant-design/icons'
import TuitionCourseFilterSection from '../components/TuitionCourseFilterSection'
import { useState, useMemo } from 'react'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import { minLen } from '@/shared/utils/validateUtil'
import CourseListSection from '../components/CourseListSection'
import FilterButton from '@/shared/components/buttons/FilterButton'



const defaultFilters = { search: '', statuses: [] }


const PayPage = () => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const profile = useFetch(ApiUrls.ACCOUNT_HOLDER.PROFILE)
  const data = profile.data


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
          <NricInput value={value} onChange={onChange} placeholder="e.g. S1234567D" />
        ),
      },
      {
        key: 'reason',
        title: t('education_account.reason'),
        multiple: 5,
        validate: [minLen(20, t('education_account.reason_min'))],
        props: {
          placeholder: 'e.g. Newly naturalised citizen missed by the nightly batch.',
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
        Pay Now
      </Typography.Title>

      {profile.loading && !data ? (
        <Card>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      ) : (
        <>
          
          <Row gutter={24} align="top">
            {/* LEFT */}
            <Col xs={24} lg={12}>
              <Flex vertical gap={16}>
                <CourseListSection />
              </Flex>
            </Col>

            {/* RIGHT */}
            <Col xs={24} lg={12}>
              <Card
                bordered={false}
                style={{
                  height: '100%'
                }}
              >
                <Flex vertical gap={24}>
                  {/* QR */}
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<QrcodeOutlined />}
                  >
                    QR Code
                  </Button>

                  {/* Divider */}
                  <Divider style={{ margin: 0 }}>
                    Or pay with card
                  </Divider>

                  {/* SHIPPING INFO */}
                  <div>
                    <Typography.Title
                      level={4}
                      style={{ marginBottom: 16 }}
                    >
                      Shipping information
                    </Typography.Title>

                    <Form layout="vertical">
                      <Form.Item
                        label="Email"
                        style={{ marginBottom: 16 }}
                      >
                        <Input placeholder="e.g. user@example.com" />
                      </Form.Item>
                    </Form>
                  </div>

                  {/* SHIPPING ADDRESS */}
                  <div>
                    <Typography.Text
                      strong
                      style={{
                        display: 'block',
                        marginBottom: 8
                      }}
                    >
                      Shipping address
                    </Typography.Text>

                    <Input
                      placeholder="e.g. Tan Wei Ming"
                      style={{
                        borderRadius: '6px 6px 0 0'
                      }}
                    />

                    <Select
                      defaultValue="United States"
                      placeholder="Select country"
                      style={{
                        width: '100%'
                      }}
                      options={[
                        {
                          label: 'United States',
                          value: 'United States'
                        }
                      ]}
                    />

                    <Input
                      placeholder="e.g. 123 Example Road"
                      style={{
                        borderRadius: '0 0 6px 6px'
                      }}
                    />
                  </div>

                  {/* PAYMENT DETAILS */}
                  <div>
                    <Typography.Title
                      level={4}
                      style={{ marginBottom: 16 }}
                    >
                      Payment details
                    </Typography.Title>

                    <Typography.Text
                      style={{
                        display: 'block',
                        marginBottom: 8
                      }}
                    >
                      Card information
                    </Typography.Text>

                    <Input
                      placeholder="e.g. 1234 1234 1234 1234"
                      style={{
                        borderRadius: '6px 6px 0 0'
                      }}
                    />

                    <Input.Group compact>
                      <Input
                        placeholder="e.g. MM / YY"
                        style={{
                          width: '50%',
                          borderRadius: 0
                        }}
                      />

                      <Input
                        placeholder="e.g. CVC"
                        style={{
                          width: '50%',
                          borderRadius: 0
                        }}
                      />
                    </Input.Group>
                  </div>

                  {/* PAY BUTTON */}
                  <Button
                    type="primary"
                    size="large"
                    block
                    style={{
                      marginTop: 12,
                      height: 48,
                      fontWeight: 600
                    }}
                  >
                    Pay $2,445.00
                  </Button>
                </Flex>
              </Card>
            </Col>


          </Row>
          <Button style={{alignSelf:'flex-end', width:'100px'}}>Pay</Button>
        </>
      )}
    </Flex>
  )
}

export default PayPage

