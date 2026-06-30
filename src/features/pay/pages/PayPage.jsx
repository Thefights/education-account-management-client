import { ApiUrls } from '@/shared/api/apiUrls'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { BankOutlined } from '@ant-design/icons'
import { notification , Button, Card, Divider, Flex, Form, Grid, Input, InputNumber, Select, Skeleton, Typography, theme } from 'antd'
import { QrcodeOutlined } from '@ant-design/icons'
import { useState } from 'react'
import CourseListSection from '../components/CourseListSection'
import { useLocation } from 'react-router-dom'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import { useSearchParams } from 'react-router-dom';


const PayPage = () => {
  const [searchParams] = useSearchParams();
  const { state } = useLocation();
  const selected = state?.selected ?? [];
  const [singleinstallment, setSingleInstallment] = useState(null);

  const { t } = useTranslation()
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()

  const tuitionSummary = useFetch(ApiUrls.ACCOUNT_HOLDER.TUITION_SUMMARY)
  const availableBalance = tuitionSummary.data?.educationAccountBalance ?? 0

    const [plans, setPlans] = useState(() => {
    const initial = {};
    selected.forEach((item) => {
      initial[item.courseCode] = 1;
    });
    return initial;
  });


  const openNotification = (message, succeeded) => {
    notification[succeeded ? 'success' : 'error']({
      message,
      description: succeeded
        ? 'Your payment has been processed successfully.'
        : 'Your payment could not be processed.',
      placement: 'topRight',
    });
  };


  const getPayToday = (record) => {
    const net = Number(record.netPayable || 0);
    const months = record.isInstallment ? record.totalInstallments :  Number(plans[record.courseCode]);
    return Math.ceil((net / months) * 100) / 100;
  };

  const totalDueToday = selected.reduce(
    (sum, item) => sum + getPayToday(item),
    0
  )

  const handlePlanChange = (courseCode, months) => {
    setPlans((prev) => ({ ...prev, [courseCode]: months }));
  };

  const [balanceInput, setBalanceInput] = useState(null)

  const maxUsable = Math.min(availableBalance, totalDueToday)
  const balanceUsed = balanceInput !== null
    ? Math.min(Math.max(Number(balanceInput) || 0, 0), maxUsable)
    : 0
  const onlinePayment = Math.max(totalDueToday - balanceUsed, 0)
  const exceedsBalance = (Number(balanceInput) || 0) > availableBalance

  const fmt = (v) =>
    Number(v || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })


  
  class BillItem {
    constructor( chargeId,intent,paymentPlanMonths) {
      this.chargeId = chargeId;
      this.intent = intent;
      this.paymentPlanMonths = paymentPlanMonths;
    }
  } 
  
  
  const pay = useAxiosSubmit({
     url: ApiUrls.PAYMENT.HANDLE,
     method: 'POST',
  })

  
  const handlePay = async () => {
    var bill = [];
    const formData = new FormData()
    selected.forEach((e, index) => {
        formData.append(
          `chargePaymentRequestInfors[${index}].chargeId`,
          e.chargeId
        );

        formData.append(
          `chargePaymentRequestInfors[${index}].intent`,
          e.isInstallment ? 3 : plans[e.courseCode] == 1 ? 1 : 2
        );

        if(plans[e.courseCode] > 1) {
          formData.append(
            `chargePaymentRequestInfors[${index}].paymentPlanMonths`,
            plans[e.courseCode]
          );
        };
    });
    formData.append(
          `CreditBalanceApplied`,
          balanceInput?? 0
        );

    if(exceedsBalance) openNotification("Exceed Balance", false);
    else {
      const response = await pay.submit({
        overrideData: formData,
      })


      const stripeUrl = response?.data?.link;

      if (stripeUrl) {
        window.location.href = stripeUrl;
      }
    }
  }






  return (
    <Flex vertical gap={24}>
      <Card bordered={false}>
        <CourseListSection
          selected={selected}
          plans={plans}
          onPlanChange={handlePlanChange}
          getPayToday={getPayToday}
          totalDueToday={totalDueToday}
          singleinstallment={singleinstallment}
        />
      </Card>

      <Card bordered={false}>
        <Flex vertical gap={12}>
          <Typography.Text
            type="secondary"
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            From education account
          </Typography.Text>

          <Flex align="center" gap={8} wrap="wrap">
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Available balance
            </Typography.Text>
            <Typography.Text strong style={{ fontSize: 13, color: token.colorSuccess }}>
              {tuitionSummary.loading ? '...' : `S$${fmt(availableBalance)}`}
            </Typography.Text>
          </Flex>

          <InputNumber
            style={{ width: '100%', fontSize: 17, fontWeight: 500 }}
            size="large"
            placeholder="0.00"
            min={0}
            max={maxUsable}
            precision={2}
            prefix="S$"
            value={balanceInput}
            status={exceedsBalance ? 'error' : undefined}
            onChange={(val) => setBalanceInput(val)}
          />

          {exceedsBalance ? (
            <Typography.Text type="danger" style={{ fontSize: 11 }}>
              Exceeds available balance of S${fmt(availableBalance)}
            </Typography.Text>
          ) : (
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              Enter amount to use from balance (max S${fmt(maxUsable)}). Leave blank to pay fully online.
            </Typography.Text>
          )}

          <div
            style={{
              padding: 12,
              borderRadius: token.borderRadius,
              background: token.colorBgLayout,
            }}
          >
            <Flex justify="space-between" align="center">
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 3 }}>
                  Online payment (PayNow / bank transfer)
                </Typography.Text>
                <Typography.Text strong style={{ fontSize: 16, color: token.colorInfo }}>
                  S${fmt(onlinePayment)}
                </Typography.Text>
              </div>
              <BankOutlined style={{ fontSize: 22, color: token.colorTextSecondary }} />
            </Flex>
          </div>
        </Flex>
      </Card>

      <Card bordered={false}>
        <Flex vertical gap={8}>
          <Typography.Text
            type="secondary"
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Summary
          </Typography.Text>

          <Flex justify="space-between">
            <Typography.Text type="secondary">Total due today</Typography.Text>
            <Typography.Text strong>S${fmt(totalDueToday)}</Typography.Text>
          </Flex>

          <Flex justify="space-between">
            <Typography.Text type="secondary">From balance</Typography.Text>
            <Typography.Text strong style={{ color: token.colorSuccess }}>
              {balanceUsed > 0 ? `-S$${fmt(balanceUsed)}` : 'S$0.00'}
            </Typography.Text>
          </Flex>

          <Flex justify="space-between">
            <Typography.Text type="secondary">Online payment</Typography.Text>
            <Typography.Text strong style={{ color: token.colorInfo }}>
              S${fmt(onlinePayment)}
            </Typography.Text>
          </Flex>

          <Divider style={{ margin: '4px 0' }} />

          <Flex justify="space-between">
            <Typography.Text strong style={{ fontSize: 14 }}>Charge today</Typography.Text>
            <Typography.Text strong style={{ fontSize: 14, color: token.colorPrimary }}>
              S${fmt(totalDueToday)}
            </Typography.Text>
          </Flex>

          <Button
            type="primary"
            size="large"
            block
            style={{
              marginTop: 10,
              height: 48,
              fontWeight: 600,
            }}
            onClick={handlePay}
          >
            Confirm & Pay
          </Button>
        </Flex>
      </Card>
    </Flex>
  )
}

export default PayPage
