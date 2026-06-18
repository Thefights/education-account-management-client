import { routeUrls } from '@/shared/config/routeUrls'
import useGoogleSocialLogin from '@/features/auth/hooks/useGoogleSocialLogin'
import useMicrosoftSocialLogin from '@/features/auth/hooks/useMicrosoftSocialLogin'
import useSingpassLogin from '@/features/auth/hooks/useSingpassLogin'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  GoogleOutlined,
  IdcardOutlined,
  WindowsOutlined,
} from '@ant-design/icons'
import { GoogleLogin } from '@react-oauth/google'
import { Button, Divider, Grid, Typography, theme } from 'antd'
import { useNavigate } from 'react-router-dom'
import { LayoutAuth } from '@/app/layouts/AuthLayout'

export function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const { token } = theme.useToken()
  const controlHeight = isMobile ? 44 : 48

  const {
    loading: microsoftLoading,
    startLogin: startMicrosoftLogin,
  } = useMicrosoftSocialLogin()
  const { loading: singpassLoading, startLogin: startSingpassLogin } = useSingpassLogin()
  const {
    loading: googleLoading,
    handleSuccess: handleGoogleSuccess,
    handleError: handleGoogleError,
  } = useGoogleSocialLogin()
  const socialLoading = microsoftLoading || singpassLoading || googleLoading

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
        loading={singpassLoading}
        disabled={socialLoading}
        onClick={startSingpassLogin}
        style={{
          height: controlHeight,
          marginBottom: isMobile ? 10 : 14,
          borderRadius: token.borderRadius,
          fontWeight: 600,
          whiteSpace: 'normal',
        }}
      >
        <IdcardOutlined style={{ color: token.colorSuccess, marginRight: 8 }} />
        {t('auth.login.sign_in_with_singpass')}
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
