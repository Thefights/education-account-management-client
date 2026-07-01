import { ApiUrls } from '@/shared/api/apiUrls'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useTranslation from '@/shared/hooks/useTranslation'
import { showErrorToast, showSuccessToast } from '@/shared/utils/toastUtil'
import { Button, Result, Spin } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const PaymentSessionStatus = {
  Succeeded: 'Succeeded',
  Canceled: 'Canceled',
}

const PaymentCallbackPage = ({ callbackType }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const handled = useRef(false)
  const [failed, setFailed] = useState(false)
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
      showSuccessToast(t('tuition-payment.callback.succeeded'))
      returnToCharges()
      return
    }
    if (result?.status === PaymentSessionStatus.Canceled) {
      showErrorToast(t('tuition-payment.callback.canceled'))
      returnToCharges()
      return
    }

    if (result?.status) {
      showErrorToast(t('tuition-payment.callback.status', { status: result.status }))
    }
    setFailed(true)
  }, [returnToCharges, sessionId, submit, t])

  useEffect(() => {
    if (handled.current) return
    handled.current = true
    finalizePayment()
  }, [finalizePayment])

  if (failed) {
    return (
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
    )
  }

  return <Result icon={<Spin size="large" />} title={t('tuition-payment.callback.processing')} />
}

export default PaymentCallbackPage
