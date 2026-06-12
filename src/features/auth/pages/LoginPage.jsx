import { ApiUrls } from '@/shared/api/apiUrls'
import { routeUrls } from '@/shared/config/routeUrls'
import useAuth from '@/shared/hooks/useAuth'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFacebookSocialLogin from '@/shared/hooks/useFacebookSocialLogin'
import useGoogleSocialLogin from '@/shared/hooks/useGoogleSocialLogin'
import useMicrosoftSocialLogin from '@/shared/hooks/useMicrosoftSocialLogin'
import useTranslation from '@/shared/hooks/useTranslation'
import { getReturnUrlByAuthTokens } from '@/shared/utils/authRouteUtil'
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  FacebookOutlined,
  GoogleOutlined,
  WindowsOutlined,
} from '@ant-design/icons'
import { GoogleLogin } from '@react-oauth/google'
import { Button, Checkbox, Divider, Form, Grid, Input, Typography, theme } from 'antd'
import { useNavigate } from 'react-router-dom'
import { LayoutAuth } from '@/app/layouts/LayoutAuth'
import { showErrorToast } from '@/shared/utils/toastUtil'

export function LoginPage({ onMfaRequired }) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useTranslation()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const { token } = theme.useToken()
  const controlHeight = isMobile ? 44 : 48

  const {
    loading: microsoftLoading,
    startLogin: startMicrosoftLogin,
  } = useMicrosoftSocialLogin()
  const {
    loading: facebookLoading,
    startLogin: startFacebookLogin,
  } = useFacebookSocialLogin()
  const {
    loading: googleLoading,
    handleSuccess: handleGoogleSuccess,
    handleError: handleGoogleError,
  } = useGoogleSocialLogin()
  const { loading: loginLoading, submit: submitLogin } = useAxiosSubmit({
    url: ApiUrls.AUTH.LOGIN,
    method: 'POST',
  })

  const socialLoading = microsoftLoading || facebookLoading || googleLoading

  const handleSubmit = async (values) => {
    const response = await submitLogin({
      overrideData: {
        userId: values.userId,
        password: values.password,
        staySignedIn: Boolean(values.staySignedIn),
      },
    })
    if (!response) return

    const loginResult = response.data
    const tokens = loginResult?.tokens
    const accessToken = tokens?.accessToken
    const mfaRequired = Boolean(loginResult?.mfaRequired)

    if (mfaRequired) {
      const mfaSession = {
        sessionId: loginResult?.sessionId,
        expiresAt: loginResult?.expiresAt,
        staySignedIn: Boolean(values.staySignedIn),
      }

      onMfaRequired?.(mfaSession)

      navigate(routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.VERIFY_OTP), {
        state: {
          mfaSession,
        },
      })

      return
    }

    if (!accessToken) {
      showErrorToast(t('auth.error.missing_access_token'))
      return
    }

    await login(tokens)
    navigate(getReturnUrlByAuthTokens(tokens), { replace: true })
  }

  return (
    <LayoutAuth imageSrc="/login-bg-mp.png" imageLayout contentMaxWidth={520} showBrand={false}>
      <Typography.Title
        level={1}
        style={{
          fontSize: isMobile ? 28 : 34,
          margin: isMobile ? '0 0 20px' : '0 0 28px',
          fontWeight: 800,
        }}
      >
        {t('auth.login.title')}
      </Typography.Title>

      <Button
        block
        size={isMobile ? 'middle' : 'large'}
        loading={microsoftLoading}
        disabled={socialLoading}
        onClick={startMicrosoftLogin}
        style={{
          height: controlHeight,
          marginBottom: isMobile ? 10 : 14,
          borderRadius: token.borderRadius,
          fontWeight: 600,
          whiteSpace: 'normal',
        }}
      >
        <WindowsOutlined style={{ color: token.colorInfo, marginRight: 8 }} />
        {t('auth.login.sign_in_with_microsoft')}
      </Button>

      <Button
        block
        size={isMobile ? 'middle' : 'large'}
        loading={facebookLoading}
        disabled={socialLoading}
        onClick={() => {
          startFacebookLogin()
        }}
        style={{
          height: controlHeight,
          marginBottom: isMobile ? 10 : 14,
          borderRadius: token.borderRadius,
          fontWeight: 600,
          whiteSpace: 'normal',
        }}
      >
        <FacebookOutlined style={{ color: token.colorInfo, marginRight: 8 }} />
        {t('auth.login.sign_in_with_facebook')}
      </Button>

      <div style={{ position: 'relative', marginBottom: isMobile ? 10 : 14 }}>
        <Button
          block
          size={isMobile ? 'middle' : 'large'}
          loading={googleLoading}
          disabled={socialLoading}
          style={{
            height: controlHeight,
            borderRadius: token.borderRadius,
            fontWeight: 600,
            whiteSpace: 'normal',
          }}
        >
          <GoogleOutlined style={{ color: token.colorError, marginRight: 8 }} />
          {t('auth.login.sign_in_with_google')}
        </Button>
        {!socialLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.01,
              overflow: 'hidden',
            }}
          >
            <GoogleLogin
              width={isMobile ? '320' : '520'}
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>
        )}
      </div>

      <Divider plain>{t('auth.login.or')}</Divider>

      <Form
        layout="vertical"
        initialValues={{
          userId: '',
          password: '',
          staySignedIn: true,
        }}
        onFinish={handleSubmit}
      >
        <Form.Item
          label={t('auth.field.user_id')}
          name="userId"
          rules={[{ required: true, message: t('error.required') }]}
        >
          <Input size={isMobile ? 'middle' : 'large'} />
        </Form.Item>

        <Form.Item
          label={t('auth.field.password')}
          name="password"
          rules={[{ required: true, message: t('error.required') }]}
        >
          <Input.Password
            size={isMobile ? 'middle' : 'large'}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <Button
          type="link"
          style={{ height: 'auto', marginBottom: 12, padding: 0 }}
          onClick={() => navigate(routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.FORGOT_PASSWORD))}
        >
          {t('auth.login.forgot_password')}
        </Button>

        <Form.Item name="staySignedIn" valuePropName="checked" style={{ marginBottom: 0 }}>
          <Checkbox>{t('auth.login.stay_signed_in')}</Checkbox>
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size={isMobile ? 'middle' : 'large'}
          block
          loading={loginLoading}
          style={{
            height: controlHeight,
            borderRadius: 7,
            fontWeight: 700,
            marginTop: 16,
          }}
        >
          {t('auth.login.submit')}
        </Button>
      </Form>

      <Button
        type="link"
        block
        onClick={() => navigate(routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.REGISTER))}
      >
        {t('auth.login.register_as_user')}
      </Button>
    </LayoutAuth>
  )
}
