import { ApiUrls } from '@/shared/api/apiUrls'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useTranslation from '@/shared/hooks/useTranslation'
import { Alert, Button, Form, Grid, Input, Space, Typography } from 'antd'
import { useEffect, useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { useNavigate } from 'react-router-dom'
import { LayoutAuth } from '@/app/layouts/AuthLayout'

const RESEND_COOLDOWN_SECONDS = 60

export function ForgotPasswordPage({ onSuccess }) {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const { t } = useTranslation()
  const recaptchaRef = useRef(null)
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaError, setCaptchaError] = useState('')
  const [sentUserId, setSentUserId] = useState('')
  const [cooldownRemaining, setCooldownRemaining] = useState(0)

  const forgotPasswordSubmit = useAxiosSubmit({
    url: ApiUrls.AUTH.FORGOT_PASSWORD,
    method: 'POST',
  })

  useEffect(() => {
    if (cooldownRemaining <= 0) return undefined

    const timer = window.setInterval(
      () => setCooldownRemaining((current) => Math.max(0, current - 1)),
      1000
    )

    return () => window.clearInterval(timer)
  }, [cooldownRemaining])

  const handleSubmit = async (values) => {
    setCaptchaError('')

    if (!captchaToken) {
      setCaptchaError(t('auth.error.captcha_required'))
      return
    }

    const response = await forgotPasswordSubmit.submit({
      overrideData: {
        userId: values.userId,
        captchaToken,
      },
    })

    recaptchaRef.current?.reset()
    setCaptchaToken('')

    if (!response) return
    setSentUserId(values.userId)
    setCooldownRemaining(RESEND_COOLDOWN_SECONDS)
    onSuccess?.()
  }

  return (
    <LayoutAuth contentMaxWidth={560}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Typography.Title
          level={1}
          style={{
            margin: '0 0 14px',
            fontSize: isMobile ? 26 : 32,
            textAlign: 'center',
          }}
        >
          {t('auth.forgot_password.title')}
        </Typography.Title>

        <Typography.Paragraph
          style={{
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          {t('auth.forgot_password.description')}
        </Typography.Paragraph>

        {sentUserId && (
          <Alert
            type="success"
            showIcon
            title={t('auth.forgot_password.email_sent', { userId: sentUserId })}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item
          label={t('auth.field.user_id')}
          name="userId"
          rules={[
            {
              required: true,
              message: t('error.required'),
            },
          ]}
        >
          <Input
            size={isMobile ? 'middle' : 'large'}
            placeholder={t('auth.field.user_id')}
            onChange={() => setSentUserId('')}
          />
        </Form.Item>

        <div style={{ margin: '22px 0' }}>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={(token) => {
              setCaptchaToken(token || '')
              setCaptchaError('')
            }}
            onExpired={() => {
              setCaptchaToken('')
              setCaptchaError(t('auth.error.captcha_expired'))
            }}
          />

          {captchaError && (
            <Typography.Text
              type="danger"
              style={{
                display: 'block',
                marginTop: 8,
                fontSize: 13,
              }}
            >
              {captchaError}
            </Typography.Text>
          )}
        </div>

        <Space orientation="vertical" size={10} style={{ width: '100%' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={forgotPasswordSubmit.loading}
            disabled={cooldownRemaining > 0}
            block
            size={isMobile ? 'middle' : 'large'}
            style={{
              height: isMobile ? 44 : 48,
              fontWeight: 700,
            }}
          >
            {sentUserId ? t('auth.forgot_password.resend_email') : t('button.submit')}
          </Button>

          {cooldownRemaining > 0 && (
            <Typography.Text type="secondary" style={{ textAlign: 'center' }}>
              {t('auth.forgot_password.resend_countdown', { seconds: cooldownRemaining })}
            </Typography.Text>
          )}
        </Space>

        <Button
          type="link"
          block
          onClick={() => navigate(routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN))}
        >
          {t('auth.link.already_have_account')}
        </Button>
      </Form>
    </LayoutAuth>
  )
}
