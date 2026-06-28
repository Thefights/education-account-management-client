import { ApiUrls } from '@/shared/api/apiUrls'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Flex, Typography, theme, Button, Tag, Grid, Divider } from 'antd'
import { LockOutlined, ArrowLeftOutlined, WarningOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const InstallmentTrackerPage = () => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const navigate = useNavigate()

  const trackerData = {
    courseName: "Data Science Fundamentals",
    courseCode: "DSF1001",
    totalOutstanding: 480.00,
    nextPaymentAmt: 120.00,
    nextPaymentDate: "1 Aug 2026",
    progress: "2 of 6",
    status: "Active",
    lockedFas: {
      name: "MOE FAS Tier 1",
      amount: 119.40
    },
    timeline: [
      { id: 1, date: "1 Jun 2026", amount: 120.00, status: "Paid", overdue: false },
      { id: 2, date: "1 Jul 2026", amount: 120.00, status: "Overdue", overdue: true },
      { id: 3, date: "1 Aug 2026", amount: 120.00, status: "Upcoming", overdue: false },
      { id: 4, date: "1 Sep 2026", amount: 120.00, status: "Upcoming", overdue: false },
      { id: 5, date: "1 Oct 2026", amount: 120.00, status: "Upcoming", overdue: false },
      { id: 6, date: "1 Nov 2026", amount: 120.00, status: "Upcoming", overdue: false },
    ]
  }

  const { state } = useLocation();
  const wip = state?.invoice;
  console.log(wip);

  const fmt = (v) => Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <Flex vertical gap={24}>
      <Flex align="center" gap={12}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ fontSize: 16, fontWeight: 600, padding: 0 }}
        >
          Back
        </Button>
      </Flex>

      <Typography.Title level={3} style={{ margin: 0, letterSpacing: '-0.02em' }}>
        Installment Tracker
      </Typography.Title>

      <Card bordered={false}>
        <Flex vertical gap={24}>
          {/* Header Info */}
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {trackerData.courseName}
            </Typography.Title>
            <Typography.Text type="secondary">
              {trackerData.courseCode}
            </Typography.Text>
          </div>

          {/* Summary Cards */}
<div
  style={{
    display: 'grid',
    gridTemplateColumns: screens.md
      ? 'repeat(4, 1fr)'
      : 'repeat(2, 1fr)',
    gap: 12,
  }}
>
  <div
    style={{
      background: token.colorBgLayout,
      borderRadius: token.borderRadiusLG,
      padding: '16px',
    }}
  >
    <Typography.Text
      type="secondary"
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      Total outstanding
    </Typography.Text>

    <div style={{ marginTop: 4 }}>
      <Typography.Text
        strong
        style={{ fontSize: 20, color: token.colorPrimary }}
      >
        ${fmt(trackerData.totalOutstanding)}
      </Typography.Text>
    </div>
  </div>

  <div
    style={{
      background: token.colorBgLayout,
      borderRadius: token.borderRadiusLG,
      padding: '16px',
    }}
  >
    <Typography.Text
      type="secondary"
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      Next payment
    </Typography.Text>

    <div style={{ marginTop: 4 }}>
      <Typography.Text strong style={{ fontSize: 20 }}>
        ${fmt(trackerData.nextPaymentAmt)}
      </Typography.Text>

      <Typography.Text
        type="secondary"
        style={{ fontSize: 12, marginLeft: 6 }}
      >
        on {trackerData.nextPaymentDate}
      </Typography.Text>
    </div>
  </div>

  <div
    style={{
      background: token.colorBgLayout,
      borderRadius: token.borderRadiusLG,
      padding: '16px',
    }}
  >
    <Typography.Text
      type="secondary"
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      Plan progress
    </Typography.Text>

    <div style={{ marginTop: 4 }}>
      <Typography.Text strong style={{ fontSize: 20 }}>
        {`${wip.currentInstallmentNumber} of ${wip.totalInstallments}`}{' '}
        <span style={{ fontSize: 14 }}>months</span>
      </Typography.Text>
    </div>
  </div>

  <div
    style={{
      background: token.colorBgLayout,
      borderRadius: token.borderRadiusLG,
      padding: '16px',
    }}
  >
    <Typography.Text
      type="secondary"
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      Status
    </Typography.Text>

    <div style={{ marginTop: 4 }}>
      <Typography.Text
        strong
        style={{
          fontSize: 20,
          color: token.colorSuccess,
        }}
      >
        {trackerData.status}
      </Typography.Text>
    </div>
  </div>
</div>
          {/* Locked FAS Banner */}
          <div
            style={{
              background: '#EDFAF0',
              border: '1px solid #CDEBD3',
              borderRadius: token.borderRadiusLG,
              padding: '14px 16px',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}
          >
            <LockOutlined style={{ color: token.colorSuccess, fontSize: 16, marginTop: 2 }} />
            <Typography.Text style={{ color: '#247A39', fontSize: 13, lineHeight: 1.5 }}>
              Your <strong>{trackerData.lockedFas.name}</strong> deduction (−${fmt(trackerData.lockedFas.amount)}) is locked into this plan. Future FAS changes will not affect these installments.
            </Typography.Text>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          <Flex gap={32} wrap="wrap">
            
            {/* Left: Timeline */}
            <div style={{ flex: '1 1 400px' }}>
              <Typography.Title level={5} style={{ marginBottom: 20 }}>
                Installment schedule
              </Typography.Title>
              
              <Flex vertical gap={0}>
                {trackerData.timeline.map((item, index) => {
                  const isLast = index === trackerData.timeline.length - 1;
                  return (
                    <div key={item.id} style={{ position: 'relative', paddingLeft: 28, paddingBottom: isLast ? 0 : 24 }}>
                      {/* Line */}
                      {!isLast && (
                        <div style={{ position: 'absolute', left: 4, top: 20, bottom: -4, width: 2, background: token.colorBorder }} />
                      )}
                      
                      {/* Dot */}
                      <div 
                        style={{ 
                          position: 'absolute', 
                          left: 0, 
                          top: 4, 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          background: item.status === 'Paid' ? token.colorSuccess : item.overdue ? token.colorError : token.colorPrimary,
                          boxShadow: `0 0 0 4px ${token.colorBgContainer}`
                        }} 
                      />

                      <Flex vertical gap={4}>
                        <Flex align="center" gap={8} wrap="wrap">
                          <Typography.Text strong style={{ fontSize: 14 }}>
                            ${fmt(item.amount)}
                          </Typography.Text>
                          {item.status === 'Paid' && <Tag color="success" bordered={false} style={{ margin: 0, borderRadius: 20 }}>Paid</Tag>}
                          {item.status === 'Overdue' && <Tag color="error" bordered={false} style={{ margin: 0, borderRadius: 20 }}>Overdue</Tag>}
                          {item.status === 'Upcoming' && <Tag color="default" bordered={false} style={{ margin: 0, borderRadius: 20, color: token.colorTextSecondary }}>Upcoming</Tag>}
                        </Flex>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {item.date}
                        </Typography.Text>

                        {/* Overdue Box inside Timeline */}
                        {item.overdue && (
                          <div
                            style={{
                              marginTop: 8,
                              background: '#FFF0F2',
                              border: '1px solid #FFC9CF',
                              borderRadius: token.borderRadiusLG,
                              padding: '12px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 16,
                              flexWrap: 'wrap'
                            }}
                          >
                            <Flex gap={8} align="flex-start" style={{ flex: 1 }}>
                              <WarningOutlined style={{ color: token.colorError, marginTop: 3 }} />
                              <Typography.Text style={{ color: token.colorError, fontSize: 12, lineHeight: 1.5 }}>
                                Payment missed. Please pay this installment as soon as possible to avoid account restrictions.
                              </Typography.Text>
                            </Flex>
                            <Button type="primary" danger style={{ borderRadius: 8 }}>
                              Pay Now
                            </Button>
                          </div>
                        )}
                      </Flex>
                    </div>
                  );
                })}
              </Flex>
            </div>

            {/* Right: Quick Pay Box */}
            <div style={{ flex: '1 1 300px' }}>
              <div
                style={{
                  background: token.colorBgLayout,
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadiusLG,
                  padding: 24,
                  textAlign: 'center'
                }}
              >
                <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                  Want to settle everything now?
                </Typography.Text>
                
                <div style={{ marginBottom: 16 }}>
                  <Typography.Text strong style={{ fontSize: 36, color: token.colorPrimary, lineHeight: 1 }}>
                    ${fmt(trackerData.nextPaymentAmt)}
                  </Typography.Text>
                </div>

                <Button 
                  type="primary" 
                  size="large" 
                  block 
                  style={{ height: 48, fontWeight: 600, fontSize: 15 }}
                >
                  Pay Next Installment
                </Button>
                
                <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 12 }}>
                  This will cover your upcoming payment due on {trackerData.nextPaymentDate}.
                </Typography.Text>
              </div>

              <Button 
                block 
                style={{ marginTop: 16, height: 44 }}
              >
                Change Payment Plan
              </Button>
            </div>

          </Flex>
        </Flex>
      </Card>
    </Flex>
  )
}

export default InstallmentTrackerPage
