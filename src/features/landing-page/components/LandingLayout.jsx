import SwitchLanguageButton from '@/shared/components/buttons/SwitchLanguageButton'
import SwitchThemeButton from '@/shared/components/buttons/SwitchThemeButton'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Layout, Menu, Space, theme } from 'antd'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

const { Header, Content, Footer } = Layout

const LandingLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { token } = theme.useToken()

  const items = [
    {
      key: routeUrls.LANDING.HOME,
      label: <Link to={routeUrls.LANDING.HOME}>{t('landing.menu.home')}</Link>,
    },
    {
      key: routeUrls.LANDING.FAQ,
      label: <Link to={routeUrls.LANDING.FAQ}>{t('landing.menu.faq')}</Link>,
    },
    {
      key: routeUrls.LANDING.CONTACT,
      label: <Link to={routeUrls.LANDING.CONTACT}>{t('landing.menu.contact')}</Link>,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--app-bg)' }}>
      <Header
        style={{
          background: 'var(--app-header-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          borderBottom: `1px solid var(--app-border-color)`,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link
            to={routeUrls.LANDING.HOME}
            style={{ fontSize: '24px', fontWeight: 'bold', color: token.colorPrimary }}
          >
            EduManage
          </Link>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={items}
            style={{ border: 'none', width: '384px', fontSize: '16px', background: 'transparent' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Space size={8}>
            <SwitchThemeButton />
            <SwitchLanguageButton />
          </Space>
          <Button
            type="primary"
            size="large"
            style={{ fontWeight: 500 }}
            onClick={() => navigate(routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN))}
          >
            {t('landing.login')}
          </Button>
        </div>
      </Header>

      <Content style={{ background: 'var(--app-bg)', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Content>

      <Footer
        style={{
          background: 'var(--app-sider-bg)',
          color: 'var(--app-sider-text-muted)',
          padding: '48px 32px',
        }}
      >
        <div
          style={{
            maxWidth: '1152px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <span style={{ color: 'var(--app-sider-text)', fontSize: '20px', fontWeight: 'bold' }}>
              EduManage
            </span>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>{t('landing.footer.copyright')}</p>
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
            <Link
              to="#"
              style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={(e) => (e.target.style.color = token.colorPrimary)}
              onMouseLeave={(e) => (e.target.style.color = 'inherit')}
            >
              {t('landing.footer.privacy')}
            </Link>
            <Link
              to="#"
              style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={(e) => (e.target.style.color = token.colorPrimary)}
              onMouseLeave={(e) => (e.target.style.color = 'inherit')}
            >
              {t('landing.footer.terms')}
            </Link>
          </div>
        </div>
      </Footer>
    </Layout>
  )
}

export default LandingLayout
