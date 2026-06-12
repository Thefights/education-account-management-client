import PhoneInputField from '@/shared/components/textFields/PhoneInputField'
import { ApiUrls } from '@/shared/api/apiUrls'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useTranslation from '@/shared/hooks/useTranslation'
import { PASSWORD_REGEX, PHONE_REGEX, USER_ID_REGEX } from '@/shared/utils/authValidateUtil'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Alert, Button, Form, Grid, Input, Radio, Tooltip, Typography, theme } from 'antd'
import { useState } from 'react'
import { isPossiblePhoneNumber } from 'react-phone-number-input'
import { useNavigate } from 'react-router-dom'
import { LayoutAuth } from '@/app/layouts/LayoutAuth'

const initialValues = {
  userId: '',
  email: '',
  fullName: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  otpCode: '',
  gender: '',
}

const fieldLabelStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
}

function FieldLabel({ label, required = false, tooltip }) {
  const { token } = theme.useToken()

  return (
    <span style={fieldLabelStyle}>
      <span>
        {label}
        {required && <span style={{ color: token.colorError }}> *</span>}
      </span>

      {tooltip && (
        <Tooltip title={tooltip}>
          <InfoCircleOutlined
            style={{
              color: token.colorTextTertiary,
              cursor: 'pointer',
            }}
          />
        </Tooltip>
      )}
    </span>
  )
}

export function RegisterPage({ onSuccess }) {
  const [form] = Form.useForm()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const [emailOtpSession, setEmailOtpSession] = useState(null)
  const [verifiedEmail, setVerifiedEmail] = useState('')
  const [emailOtpVerified, setEmailOtpVerified] = useState(false)
  const [emailOtpMessage, setEmailOtpMessage] = useState('')

  const registerSubmit = useAxiosSubmit({
    url: ApiUrls.AUTH.REGISTER,
    method: 'POST',
  })
  const sendRegisterEmailOtpSubmit = useAxiosSubmit({
    url: ApiUrls.AUTH.SEND_REGISTER_EMAIL_OTP,
    method: 'POST',
  })
  const verifyRegisterEmailOtpSubmit = useAxiosSubmit({
    url: ApiUrls.AUTH.VERIFY_REGISTER_EMAIL_OTP,
    method: 'POST',
  })

  const resetEmailOtpState = () => {
    setEmailOtpSession(null)
    setVerifiedEmail('')
    setEmailOtpVerified(false)
    setEmailOtpMessage('')
    form.setFieldsValue({ otpCode: '' })
  }

  const handleEmailChange = (event) => {
    const nextEmail = event.target.value
    if (emailOtpSession?.email && nextEmail !== emailOtpSession.email) {
      resetEmailOtpState()
    }
  }

  const handleSendEmailOtp = async () => {
    const { email } = await form.validateFields(['email'])
    const response = await sendRegisterEmailOtpSubmit.submit({
      overrideData: { email },
    })

    const session = response?.data
    if (!session?.sessionId) return

    setEmailOtpSession({
      email,
      sessionId: session.sessionId,
      expiresAt: session.expiresAt,
    })
    setVerifiedEmail('')
    setEmailOtpVerified(false)
    setEmailOtpMessage(t('auth.register.email_otp_sent'))
    form.setFieldsValue({ otpCode: '' })
  }

  const handleVerifyEmailOtp = async () => {
    const { email, otpCode } = await form.validateFields(['email', 'otpCode'])
    if (!emailOtpSession?.sessionId || email !== emailOtpSession.email) {
      setEmailOtpMessage(t('auth.error.email_otp_send_required'))
      return
    }

    const response = await verifyRegisterEmailOtpSubmit.submit({
      overrideData: {
        sessionId: emailOtpSession.sessionId,
        email,
        otpCode,
      },
    })

    if (!response) return

    setVerifiedEmail(email)
    setEmailOtpVerified(true)
    setEmailOtpMessage(t('auth.register.email_verified'))
  }

  const handleSubmit = async (values) => {
    const normalizedPhoneNumber = values.phoneNumber || undefined
    if (!emailOtpVerified || verifiedEmail !== values.email || !emailOtpSession?.sessionId) {
      form.setFields([
        {
          name: 'otpCode',
          errors: [t('auth.error.email_otp_verify_required')],
        },
      ])
      setEmailOtpMessage(t('auth.error.email_otp_verify_required'))
      return
    }

    const response = await registerSubmit.submit({
      overrideData: {
        userId: values.userId,
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        phoneNumber: normalizedPhoneNumber,
        gender: values.gender,
        emailVerificationSessionId: emailOtpSession.sessionId,
      },
    })

    if (!response) return
    onSuccess?.()
    navigate(routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN))
  }

  return (
    <LayoutAuth contentMaxWidth={700}>
      <Typography.Title
        level={1}
        style={{
          margin: '0 0 14px',
          fontSize: isMobile ? 26 : 32,
          textAlign: 'center',
        }}
      >
        {t('auth.register.title')}
      </Typography.Title>

      <Typography.Paragraph
        style={{
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        {t('auth.register.description')}
      </Typography.Paragraph>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
        style={{
          background: token.colorBgContainer,
          borderRadius: 8,
          boxShadow: token.boxShadowSecondary,
          padding: isMobile ? '20px 16px 0' : '28px 32px 0',
        }}
      >
        <Typography.Paragraph
          style={{
            color: token.colorTextSecondary,
            fontSize: 12,
            fontStyle: 'italic',
          }}
        >
          {t('auth.register.required_note')}
        </Typography.Paragraph>

        <Typography.Title level={4}>{t('auth.register.provide_information')}</Typography.Title>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: isMobile ? 0 : 20,
          }}
        >
          <Form.Item
            label={
              <FieldLabel
                label={t('auth.field.user_id')}
                required
                tooltip={t('auth.tooltip.user_id')}
              />
            }
          >
            <Form.Item
              name="userId"
              noStyle
              rules={[
                { required: true, message: t('error.required') },
                {
                  min: 6,
                  max: 256,
                  message: t('auth.error.user_id_length'),
                },
                {
                  pattern: USER_ID_REGEX,
                  message: t('auth.error.user_id'),
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Form.Item>

          <Form.Item
            label={
              <FieldLabel
                label={t('auth.field.email')}
                required
                tooltip={t('auth.tooltip.email')}
              />
            }
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
                gap: 8,
              }}
            >
              <Form.Item
                name="email"
                noStyle
                rules={[
                  { required: true, message: t('error.required') },
                  {
                    type: 'email',
                    message: t('auth.error.email'),
                  },
                ]}
              >
                <Input onChange={handleEmailChange} />
              </Form.Item>

              <Button
                onClick={handleSendEmailOtp}
                loading={sendRegisterEmailOtpSubmit.loading}
                disabled={verifyRegisterEmailOtpSubmit.loading}
              >
                {emailOtpSession?.sessionId
                  ? t('auth.register.resend_verification_code')
                  : t('auth.register.get_verification_code')}
              </Button>
            </div>
          </Form.Item>
        </div>

        <Form.Item label={<FieldLabel label={t('auth.field.verification_code')} required />}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
              gap: 8,
            }}
          >
            <Form.Item
              name="otpCode"
              noStyle
              rules={[
                { required: true, message: t('error.required') },
                { len: 6, message: t('auth.error.otp_length') },
              ]}
            >
              <Input maxLength={6} disabled={!emailOtpSession?.sessionId || emailOtpVerified} />
            </Form.Item>

            <Button
              type="primary"
              onClick={handleVerifyEmailOtp}
              loading={verifyRegisterEmailOtpSubmit.loading}
              disabled={!emailOtpSession?.sessionId || emailOtpVerified}
            >
              {t('auth.register.verify_email')}
            </Button>
          </div>
        </Form.Item>

        {emailOtpMessage && (
          <Alert
            type={emailOtpVerified ? 'success' : 'info'}
            showIcon
            title={emailOtpMessage}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item
          label={
            <FieldLabel
              label={t('auth.field.full_name')}
              required
              tooltip={t('auth.tooltip.full_name')}
            />
          }
        >
          <Form.Item
            name="fullName"
            noStyle
            rules={[
              { required: true, message: t('error.required') },
              {
                min: 1,
                max: 100,
                message: t('auth.error.full_name_length'),
              },
              {
                validator: (_, value) => {
                  if (!value || value.trim()) return Promise.resolve()
                  return Promise.reject(new Error(t('auth.error.full_name_blank')))
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form.Item>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: isMobile ? 0 : 20,
          }}
        >
          <Form.Item
            label={
              <FieldLabel
                label={t('auth.field.password')}
                required
                tooltip={t('auth.tooltip.password')}
              />
            }
          >
            <Form.Item
              name="password"
              noStyle
              rules={[
                { required: true, message: t('error.required') },
                {
                  pattern: PASSWORD_REGEX,
                  message: t('auth.error.password'),
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Form.Item>

          <Form.Item label={<FieldLabel label={t('auth.field.confirm_password')} required />}>
            <Form.Item
              name="confirmPassword"
              noStyle
              dependencies={['password']}
              rules={[
                { required: true, message: t('error.required') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }

                    return Promise.reject(new Error(t('auth.error.confirm_password')))
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Form.Item>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: isMobile ? 0 : 20,
          }}
        >
          <Form.Item
            label={
              <FieldLabel
                label={t('auth.field.phone_number')}
                tooltip={t('auth.tooltip.phone_number')}
              />
            }
          >
            <Form.Item
              name="phoneNumber"
              noStyle
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve()
                    if (!isPossiblePhoneNumber(value) || !PHONE_REGEX.test(value)) {
                      return Promise.reject(new Error(t('auth.error.phone')))
                    }
                    if (value.length > 16) {
                      return Promise.reject(new Error(t('auth.error.phone_max_length')))
                    }

                    return Promise.resolve()
                  },
                },
              ]}
            >
              <PhoneInputField placeholder={t('auth.field.phone_number')} />
            </Form.Item>
          </Form.Item>
        </div>

        <Form.Item label={<FieldLabel label={t('auth.field.gender')} required />}>
          <Form.Item
            name="gender"
            noStyle
            rules={[{ required: true, message: t('error.required') }]}
          >
            <Radio.Group>
              <Radio value={1}>{t('auth.option.male')}</Radio>
              <Radio value={2}>{t('auth.option.female')}</Radio>
            </Radio.Group>
          </Form.Item>
        </Form.Item>

        <div
          style={{
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            margin: isMobile ? '20px -16px 0' : '24px -32px 0',
            padding: isMobile ? 12 : 16,
            textAlign: 'center',
          }}
        >
          <Button
            type="primary"
            htmlType="submit"
            loading={registerSubmit.loading}
            style={{
              width: isMobile ? '100%' : 'auto',
              minWidth: 96,
              height: isMobile ? 40 : 36,
              fontWeight: 700,
            }}
          >
            {t('button.submit')}
          </Button>
        </div>
      </Form>

      <Button
        type="link"
        block
        onClick={() => navigate(routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN))}
      >
        {t('auth.link.already_have_account')}
      </Button>
    </LayoutAuth>
  )
}
