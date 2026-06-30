import { ApiUrls } from '@/shared/api/apiUrls'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { BankOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Descriptions, Flex, Grid, Skeleton, Statistic, Typography, theme, Space } from 'antd'
import TuitionCourseFilterSection from '../components/TuitionCourseFilterSection'
import { useState, useMemo, useEffect } from 'react'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import { minLen } from '@/shared/utils/validateUtil'
import CourseListSection from '../components/CourseListSection'
import FilterButton from '@/shared/components/buttons/FilterButton'
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom'



const defaultFilters = { search: ''}


const CouresTuition = () => {
  const profile = useFetch(ApiUrls.ACCOUNT_HOLDER.TUITION_SUMMARY)
  const { nvPay, handleCheck, selected, resetSelected } = useOutletContext()
  
  const data = profile.data
  console.log(profile)

  const navigate = useNavigate();
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()

  
  const { t } = useTranslation()
    const [filters, setFilters] = useState(defaultFilters)
    const [tab, setTab] = useState(3)
    const [sort, setSort] = useState({key: 'createdAt', direction: 'desc',})
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const queryParams = useMemo(
      () => ({
        Tab: tab,
        Sort: `${sort.key} ${sort.direction}`,
        Status: filters.statuses,
        IsInstallment: filters.isInstallment,
        Search: filters.search,
        PageSize: pageSize,
      }),
      [tab, sort, filters, page, pageSize]
    )
    
    const charges = useFetch(ApiUrls.ACCOUNT_HOLDER.TUITION_CHARGES, queryParams, [queryParams])
  
    const charges_data = charges.data
    console.log(charges)
  
    const inProgressCount = useFetch(
      ApiUrls.ACCOUNT_HOLDER.TUITION_CHARGES,
      { Tab: 4, Page: 1, PageSize: 1 },
      []
    )
  
    const closedCount = useFetch(
      ApiUrls.ACCOUNT_HOLDER.TUITION_CHARGES,
      { Tab: 5, Page: 1, PageSize: 1 },
      []
    )

    useEffect(() => {
      resetSelected();
    }, [])
  
    const counts = {
      upcoming: charges.data?.totalCount ?? 0,
      inProgress: inProgressCount.data?.totalCount ?? 0,
      closed: closedCount.data?.totalCount ?? 0,
    }
    const handleFilter = (values) => {
      setFilters(values)
      setPage(1)
    }

  return (

    
    <Flex vertical gap={18} style={{ width: '100%', maxWidth: 1400, margin: '0 auto' }}>
      <Typography.Title level={3} style={{ margin: 0, letterSpacing: '-0.02em' }}>
        {t('tuition-payment.title')}
      </Typography.Title>
      <Card>
        <Flex vertical gap={20}>

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
                    </Flex>

                    <Flex vertical> 
                      <Statistic
                        title={t('tuition-payment.total_outstanding')}
                        value={data?.totalOutstandingAmount}
                        precision={2}
                        valueStyle={{ color: token.colorPrimary, fontWeight: 700, fontSize: 30 }}
                      />
                      <Typography.Text 
                        type="secondary"
                        style={{ fontSize: '12px' }}
                        >
                          {data?.pendingPaymentInvoicesCount + ' '} 
                          {data?.pendingPaymentInvoicesCount > 1 ? t('tuition-payment.pending_payment_invoices') : t('tuition-payment.pending_payment_invoice')}
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
                    </Flex>

                    <Flex vertical>
                      <Statistic
                        title={t('account_profile.balance')}
                        value={data?.educationAccountBalance}
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
                  setFilters({...values})
                  setPage(1)
                }}
                onSort={() => {
                    setSort((sort) => ({
                      key: 'createdAt',
                      direction: sort?.direction === 'desc' ? 'asc' : 'desc',
                    }))
                  }
                }
                setFilter={setFilters}
                sortStatus={sort.direction}
                onReset={() => {
                  setFilters(defaultFilters)
                  setPage(1)
                  setSelectedIds([])
                }}
              />

              <Flex justify="space-between" align="center">
                <Typography.Text 
                        type="secondary"
                        style={{ fontSize: '13px' }}>
                          {`${selected.length} selected — or use Pay Now on each course`}
                </Typography.Text>
                
                <Button 
                  type='primary'
                  style={{alignSelf:'flex-end', width:'8rem', fontSize: '13px', height: '2rem'}}
                  onClick={nvPay}
                  disabled={selected.length > 0 ? false : true}
                >
                  Pay Selected
                </Button>
              </Flex>

              <CourseListSection pay={nvPay} collection = {charges?.data?.collection?? []} handleCheck={handleCheck}/>

            </>
          )}
        </Flex>
      </Card>
    </Flex>
  )
}

export default CouresTuition

