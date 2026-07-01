import { ApiUrls } from '@/shared/api/apiUrls'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { showErrorToast } from '@/shared/utils/toastUtil'
import { Button, Card, Descriptions, Flex, Result, Spin, Steps, Typography } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const PaymentSessionStatus = {
  Succeeded: 'Succeeded',
  Canceled: 'Canceled',
}

const CompletedSteps = ({ t }) => (
  <Steps
    size="small"
    current={3}
    items={[
      { title: t('tuition-payment.flow.charges') },
      { title: t('tuition-payment.flow.summary') },
      { title: t('tuition-payment.flow.payment') },
      { title: t('tuition-payment.flow.completed') },
    ]}
  />
)

const PaymentCallbackPage = ({ callbackType }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const handled = useRef(false)
  const [failed, setFailed] = useState(false)
  const [callbackResult, setCallbackResult] = useState(null)
  const endpoint = callbackType === 'success' ? ApiUrls.PAYMENT.SUCCESS : ApiUrls.PAYMENT.CANCEL
  const { submit, loading } = useAxiosSubmit({ url: endpoint, method: 'POST' })
  const sessionId = searchParams.get('session_id')

  const returnToCharges = useCallback(() => {
    navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.TUITION_PAYMENT.INDEX), {
      replace: true,
    })
  }, [navigate])

  const finalizePayment = useCallback(async () => {
    if (!sessionId) {
      showErrorToast(t('tuition-payment.callback.missing_session'))
      setFailed(true)
      return
    }

    setFailed(false)
    const response = await submit({ overrideData: { sessionId } })
    const result = response?.data
    if (result?.status === PaymentSessionStatus.Succeeded) {
      setCallbackResult(result)
      return
    }
    if (result?.status === PaymentSessionStatus.Canceled) {
      setCallbackResult(result)
      return
    }

    if (result?.status) {
      showErrorToast(t('tuition-payment.callback.status', { status: result.status }))
    }
    setFailed(true)
  }, [sessionId, submit, t])

  useEffect(() => {
    if (handled.current) return
    handled.current = true
    finalizePayment()
  }, [finalizePayment])

  if (failed) {
    return (
      <Flex vertical gap={18} style={{ width: '100%', maxWidth: 980, margin: '0 auto' }}>
        <CompletedSteps t={t} />
        <Result
          status="error"
          title={t('tuition-payment.callback.failed')}
          subTitle={t('tuition-payment.callback.failed_description')}
          extra={[
            <Button key="retry" type="primary" loading={loading} onClick={finalizePayment}>
              {t('tuition-payment.callback.retry')}
            </Button>,
            <Button key="back" onClick={returnToCharges}>
              {t('tuition-payment.action.back_to_charges')}
            </Button>,
          ]}
        />
      </Flex>
    )
  }

  if (!callbackResult) {
    return (
      <Flex vertical gap={18} style={{ width: '100%', maxWidth: 980, margin: '0 auto' }}>
        <CompletedSteps t={t} />
        <Result icon={<Spin size="large" />} title={t('tuition-payment.callback.processing')} />
      </Flex>
    )
  }

  const succeeded = callbackResult.status === PaymentSessionStatus.Succeeded
  const resultStatus = succeeded ? 'success' : 'warning'

  return (
    <Flex vertical gap={18} style={{ width: '100%', maxWidth: 980, margin: '0 auto' }}>
      <CompletedSteps t={t} />
      <Card>
        <Result
          status={resultStatus}
          title={
            succeeded
              ? t('tuition-payment.callback.success_title')
              : t('tuition-payment.callback.cancel_title')
          }
          subTitle={
            succeeded
              ? t('tuition-payment.callback.success_description')
              : t('tuition-payment.callback.cancel_description')
          }
          extra={[
            <Button key="back" type="primary" onClick={returnToCharges}>
              {t('tuition-payment.action.back_to_charges')}
            </Button>,
            <Button
              key="transactions"
              onClick={() =>
                navigate(
                  routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.TRANSACTION_HISTORY.INDEX),
                  { replace: true }
                )
              }
            >
              {t('tuition-payment.callback.view_transactions')}
            </Button>,
          ]}
        />
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label={t('tuition-payment.checkout.payment_mode')}>
            {callbackResult.paymentMode || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('tuition-payment.checkout.total_amount')}>
            <Typography.Text strong>
              {formatCurrencyBasedOnCurrentLanguage(callbackResult.totalAmount ?? 0)}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('tuition-payment.checkout.wallet_amount')}>
            {formatCurrencyBasedOnCurrentLanguage(callbackResult.walletAmount ?? 0)}
          </Descriptions.Item>
          <Descriptions.Item label={t('tuition-payment.checkout.online_amount')}>
            {formatCurrencyBasedOnCurrentLanguage(callbackResult.onlineAmount ?? 0)}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Flex>
  )
}

export default PaymentCallbackPage
