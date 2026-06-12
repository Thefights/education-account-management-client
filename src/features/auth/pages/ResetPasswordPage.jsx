import { ApiUrls } from '@/shared/api/apiUrls'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useTranslation from '@/shared/hooks/useTranslation'
import { PASSWORD_REGEX } from '@/shared/utils/authValidateUtil'
import { Alert, Button, Form, Grid, Input, Typography } from 'antd'
import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { LayoutAuth } from '@/app/layouts/LayoutAuth'

export function ResetPasswordPage({ onSuccess }) {
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const { t } = useTranslation()
  const token = searchParams.get('token') || params.token || ''
  const [resetAttemptFailed, setResetAttemptFailed] = useState(false)

  const resetPasswordSubmit = useAxiosSubmit({
    url: ApiUrls.AUTH.RESET_PASSWORD,
    method: 'POST',
  })

  const goToForgotPassword = () => {
    navigate(routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.FORGOT_PASSWORD))
  }

  const handleSubmit = async (values) => {
    setResetAttemptFailed(false)

    const response = await resetPasswordSubmit.submit({
      overrideData: {
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      },
    })

    if (!response) {
      setResetAttemptFailed(true)
      return
    }

    onSuccess?.()
    navigate(routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN))
  }

  return (
    <LayoutAuth>
      <Form
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
            margin: '0 0 14px',
            fontSize: isMobile ? 26 : 32,
            textAlign: 'center',
          }}
        >
          {t('auth.reset_password.title')}
        </Typography.Title>

        <Typography.Paragraph
          style={{
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          {t('auth.reset_password.description')}
        </Typography.Paragraph>

        {!token && (
          <Alert
            type="error"
            showIcon
            title={t('auth.error.reset_token_missing')}
            action={
              <Button size="small" onClick={goToForgotPassword}>
                {t('auth.reset_password.request_new_link')}
              </Button>
            }
            style={{ marginBottom: 16 }}
          />
        )}

        {token && resetAttemptFailed && (
          <Alert
            type="warning"
            showIcon
            title={t('auth.reset_password.request_new_link_description')}
            action={
              <Button size="small" onClick={goToForgotPassword}>
                {t('auth.reset_password.request_new_link')}
              </Button>
            }
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item
          label={t('auth.field.new_password')}
          name="newPassword"
          rules={[
            {
              required: true,
              message: t('error.required'),
            },
            {
              pattern: PASSWORD_REGEX,
              message: t('auth.error.password'),
            },
          ]}
        >
          <Input.Password size={isMobile ? 'middle' : 'large'} />
        </Form.Item>

        <Form.Item
          label={t('auth.field.confirm_password')}
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            {
              required: true,
              message: t('error.required'),
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve()
                }

                return Promise.reject(new Error(t('auth.error.confirm_password')))
              },
            }),
          ]}
        >
          <Input.Password size={isMobile ? 'middle' : 'large'} />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={resetPasswordSubmit.loading}
          disabled={!token}
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
