import { ApiUrls } from '@/configs/apiUrls'
import useAuth from '@/hooks/useAuth'
import useAxiosSubmit from '@/hooks/useAxiosSubmit'
import useTranslation from '@/hooks/useTranslation'
import { getReturnUrlByAuthTokens } from '@/utils/authRouteUtil'
import { MailOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, Form, Grid, Input, Space, Typography, theme } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutAuth } from '@/layouts/LayoutAuth'

const MFA_EXPIRATION_MS = 3 * 60 * 1000

const getFallbackExpiresAt = () => new Date(Date.now() + MFA_EXPIRATION_MS).toISOString()

const getResponseData = (responseData) => responseData?.data || responseData

const normalizeMfaSession = (session) => {
  if (!session?.sessionId) return null

  return {
    sessionId: session.sessionId,
    staySignedIn: Boolean(session.staySignedIn),
    expiresAt: session.expiresAt || getFallbackExpiresAt(),
  }
}

const getRemainingMilliseconds = (expiresAt, now) => {
  if (!expiresAt) return 0

  const expiresAtTime = new Date(expiresAt).getTime()
  if (Number.isNaN(expiresAtTime)) return 0

  return Math.max(0, expiresAtTime - now)
}

const formatRemainingTime = (milliseconds) => {
  const totalSeconds = Math.ceil(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function TwoFactorPage({ mfaSession, onSuccess }) {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { t } = useTranslation()
  const { token } = theme.useToken()

  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md

  const sessionFromRoute = location.state?.mfaSession
  const sourceSession = mfaSession || sessionFromRoute
  const [session, setSession] = useState(() => normalizeMfaSession(sourceSession))
  const [now, setNow] = useState(() => Date.now())
  const [pageMessage, setPageMessage] = useState('')

  useEffect(() => {
    if (!session?.expiresAt) return undefined

    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [session?.expiresAt])

  const remainingMilliseconds = useMemo(
    () => getRemainingMilliseconds(session?.expiresAt, now),
    [now, session?.expiresAt]
  )
  const isExpired = !!session?.expiresAt && remainingMilliseconds <= 0
  const remainingText = formatRemainingTime(remainingMilliseconds)

  const verifyOtpSubmit = useAxiosSubmit({
    url: ApiUrls.AUTH.VERIFY_OTP,
    method: 'POST',
  })
  const resendOtpSubmit = useAxiosSubmit({
    url: ApiUrls.AUTH.RESEND_MFA_OTP,
    method: 'POST',
  })

  const handleSubmit = async (values) => {
    if (!session?.sessionId || isExpired) {
      setPageMessage(t('auth.two_factor.expired'))
      return
    }

    const response = await verifyOtpSubmit.submit({
      overrideData: {
        sessionId: session?.sessionId,
        otpCode: values.otpCode,
        staySignedIn: Boolean(session?.staySignedIn),
      },
    })

    if (!response) return
    const tokens = response.data
    await login(tokens)
    onSuccess?.()
    navigate(getReturnUrlByAuthTokens(tokens), { replace: true })
  }

  const handleResend = async () => {
    if (!session?.sessionId) return

    const response = await resendOtpSubmit.submit({
      overrideData: {
        sessionId: session.sessionId,
      },
    })

    if (!response) return

    const result = getResponseData(response.data) || {}
    setSession(
      normalizeMfaSession({
        ...session,
        sessionId: result.sessionId || session.sessionId,
        expiresAt: result.expiresAt || getFallbackExpiresAt(),
      })
    )
    form.resetFields(['otpCode'])
    setNow(Date.now())
    setPageMessage(t('auth.two_factor.resent'))
  }

  return (
    <LayoutAuth>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{
          width: 560,
          maxWidth: '100%',
        }}
      >
        <Typography.Title
          level={1}
          style={{
            margin: '0 0 20px',
            fontSize: isMobile ? 26 : 32,
            textAlign: 'center',
          }}
        >
          {t('auth.two_factor.title')}
        </Typography.Title>

        <Flex
          style={{
            alignItems: 'flex-start',
            gap: 10,
            marginBottom: 20,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          <MailOutlined
            style={{
              fontSize: 18,
              color: token.colorPrimary,
              marginTop: 2,
              flexShrink: 0,
            }}
          />
          <Typography.Text>{t('auth.two_factor.email_notice')}</Typography.Text>
        </Flex>

        <Space orientation="vertical" size={10} style={{ width: '100%', marginBottom: 16 }}>
          <Typography.Text strong>
            {t('auth.two_factor.countdown', { time: remainingText })}
          </Typography.Text>

          {!session?.sessionId && (
            <Alert type="error" showIcon title={t('auth.two_factor.session_missing')} />
          )}

          {isExpired && (
            <Alert type="warning" showIcon title={t('auth.two_factor.expired')} />
          )}

          {pageMessage && !isExpired && (
            <Alert type="success" showIcon title={pageMessage} />
          )}
        </Space>

        <Form.Item label={t('auth.field.verification_code')}>
          <Flex
            style={{
              flexDirection: isMobile ? 'column' : 'row',
              gap: 8,
            }}
          >
            <Form.Item
              name="otpCode"
              rules={[
                {
                  required: true,
                  message: t('error.required'),
                },
                {
                  len: 6,
                  message: t('auth.error.otp_length'),
                },
              ]}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <Input
                size={isMobile ? 'middle' : 'large'}
                maxLength={6}
                disabled={!session?.sessionId || isExpired}
                style={{ flex: 1 }}
              />
            </Form.Item>
          </Flex>
        </Form.Item>

        <Space orientation="vertical" size={10} style={{ width: '100%' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={verifyOtpSubmit.loading}
            disabled={!session?.sessionId || isExpired}
            block
            size={isMobile ? 'middle' : 'large'}
            style={{
              height: isMobile ? 44 : 48,
              fontWeight: 700,
            }}
          >
            {t('button.submit')}
          </Button>

          <Button
            block
            loading={resendOtpSubmit.loading}
            disabled={!session?.sessionId}
            onClick={handleResend}
          >
            {t('auth.two_factor.resend_code')}
          </Button>
        </Space>
      </Form>
    </LayoutAuth>
  )
}
