import AuthContext from '@/app/providers/AuthContext'
import DashboardDrawer from '@/shared/components/layouts/DashboardDrawer'
import DashboardHeader from '@/shared/components/layouts/DashboardHeader'
import { Layout } from 'antd'
import { useContext, useState } from 'react'
import { Outlet } from 'react-router-dom'

const RoleDashboardLayout = ({ homeUrl = '/', menuSections = [] }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const authContext = useContext(AuthContext)

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
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              overflowX: 'hidden',
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
