import { LayoutAuth } from '@/app/layouts/AuthLayout'
import useMicrosoftSocialLogin from '@/features/auth/hooks/useMicrosoftSocialLogin'
import useSingpassLogin from '@/features/auth/hooks/useSingpassLogin'
import useTranslation from '@/shared/hooks/useTranslation'
import { IdcardOutlined, WindowsOutlined } from '@ant-design/icons'
import { Button, Grid, Typography, theme } from 'antd'

export function LoginPage() {
  const { t } = useTranslation()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const { token } = theme.useToken()
  const controlHeight = isMobile ? 44 : 48

  const { loading: microsoftLoading, startLogin: startMicrosoftLogin } = useMicrosoftSocialLogin()
  const { loading: singpassLoading, startLogin: startSingpassLogin } = useSingpassLogin()

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

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Button type="link" onClick={() => (window.location.href = '/')}>
          &larr; Back to Home Page
        </Button>
      </div>
    </LayoutAuth>
  )
}
