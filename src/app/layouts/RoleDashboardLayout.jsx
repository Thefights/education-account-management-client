import AuthContext from '@/app/providers/AuthContext'
import DashboardDrawer from '@/shared/components/layouts/DashboardDrawer'
import DashboardHeader from '@/shared/components/layouts/DashboardHeader'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import { UserOutlined } from '@ant-design/icons'
import { Layout } from 'antd'
import { useContext, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'

const RoleDashboardLayout = ({
  homeUrl = '/',
  menuSections = [],
  userMenuItems: extraUserMenuItems = [],
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const authContext = useContext(AuthContext)
  const { t } = useTranslation()
  const userMenuItems = useMemo(
    () => [
      {
        key: 'profile',
        label: t('header.user_menu.profile'),
        icon: <UserOutlined />,
        url: `${homeUrl}${routeUrls.PROFILE.INDEX}`,
      },
      ...extraUserMenuItems,
    ],
    [extraUserMenuItems, homeUrl, t]
  )

  return (
    <Layout
      style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <DashboardDrawer
        sections={menuSections}
        homeUrl={homeUrl}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Layout
        style={{
          flex: 1,
          height: '100vh',
          width: 0,
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DashboardHeader
          profile={authContext?.auth}
          userMenuItems={userMenuItems}
          onLogout={authContext?.logout}
          onOpenDrawer={() => setMobileOpen(true)}
        />

        <Layout.Content
          style={{
            flex: 1,
            width: '100%',
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
            background: 'var(--app-bg)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            className="dashboard-content-scroll"
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: 'clamp(16px, 2.2vw, 30px)',
            }}
          >
            <Outlet />
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}

export default RoleDashboardLayout
