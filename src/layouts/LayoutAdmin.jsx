import DashboardDrawer from '@/components/layouts/DashboardDrawer'
import DashboardHeader from '@/components/layouts/DashboardHeader'
import AuthContext from '@/configs/AuthContext'
import { routeUrls } from '@/configs/routeUrls'
import {
  AuditOutlined,
  MailOutlined,
  ProductOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Layout } from 'antd'
import { useContext, useState } from 'react'
import { Outlet } from 'react-router-dom'

const adminMenuSections = [
  {
    items: [
      {
        key: 'audit-log',
        label: 'Audit Log',
        icon: AuditOutlined,
        url: routeUrls.BASE_ROUTE.ADMIN(routeUrls.ADMIN.AUDIT_LOG_MANAGEMENT.INDEX),
      },
      {
        key: 'mfa-setting',
        label: 'MFA Setting',
        icon: SafetyCertificateOutlined,
        url: routeUrls.BASE_ROUTE.ADMIN(routeUrls.ADMIN.MFA_SETTING.INDEX),
      },
      {
        icon: MailOutlined,
        key: 'email-notification',
        label: 'Email Notification',
        url: routeUrls.BASE_ROUTE.ADMIN(routeUrls.ADMIN.EMAIL_WHITELIST.INDEX),
      },
    ],
  },
  {
    items: [
      {
        key: 'account',
        label: 'Account ',
        icon: TeamOutlined,
        url: routeUrls.BASE_ROUTE.ADMIN(routeUrls.ADMIN.ACCOUNT_MANAGEMENT.INDEX),
      },
      {
        key: 'product',
        label: 'Product',
        icon: ProductOutlined,
        url: routeUrls.BASE_ROUTE.ADMIN(routeUrls.ADMIN.PRODUCT_MANAGEMENT.INDEX),
      },
    ],
  },
]

const LayoutAdmin = () => {
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
        sections={adminMenuSections}
        homeUrl={routeUrls.BASE_ROUTE.ADMIN(routeUrls.ADMIN.AUDIT_LOG_MANAGEMENT.INDEX)}
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

export default LayoutAdmin
