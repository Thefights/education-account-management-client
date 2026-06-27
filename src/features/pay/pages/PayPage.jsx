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
import { useOutletContext } from 'react-router-dom'
import { useLocation } from 'react-router-dom';



const defaultFilters = { search: '', statuses: [] }


const PayPage = () => {
  const { state } = useLocation();

  const selected = state?.selected ?? [];
  console.log(selected)
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
    <Flex vertical gap={24}>
  {/* TOP */}
  <Card bordered={false}>
    <CourseListSection selected={selected} />
  </Card>

  {/* BOTTOM */}
  <Card
    bordered={false}
    style={{
      width: '100%'
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
            <Input />
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
          placeholder="Name"
          style={{
            borderRadius: '6px 6px 0 0'
          }}
        />

        <Select
          defaultValue="United States"
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
          placeholder="Address"
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
          placeholder="1234 1234 1234 1234"
          style={{
            borderRadius: '6px 6px 0 0'
          }}
        />

        <Input.Group compact>
          <Input
            placeholder="MM / YY"
            style={{
              width: '50%',
              borderRadius: 0
            }}
          />

          <Input
            placeholder="CVC"
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
</Flex>
  )
}

export default PayPage

