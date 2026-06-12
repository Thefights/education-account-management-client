import DashboardDrawer from '@/components/layouts/DashboardDrawer'
import DashboardHeader from '@/components/layouts/DashboardHeader'
import AuthContext from '@/configs/AuthContext'
import { routeUrls } from '@/configs/routeUrls'
import useTranslation from '@/hooks/useTranslation'
import { HomeOutlined, ProductOutlined } from '@ant-design/icons'
import { Layout } from 'antd'
import { useContext, useState } from 'react'
import { Outlet } from 'react-router-dom'

const LayoutTenant = () => {
  const { t } = useTranslation()

  const [mobileOpen, setMobileOpen] = useState(false)
  const authContext = useContext(AuthContext)

  const tenantMenuSections = [
    {
      title: t('sidebar.shared.general'),
      items: [
        {
          key: 'tenant-home',
          label: t('sidebar.items.home'),
          icon: HomeOutlined,
          url: routeUrls.BASE_ROUTE.TENANT(routeUrls.TENANT.HOME),
        },
      ],
    },
    {
      title: t('sidebar.shared.favorites'),
      items: [
        {
          key: 'tenant-favorite-products',
          label: t('sidebar.items.favorite_products'),
          icon: ProductOutlined,
          url: routeUrls.BASE_ROUTE.TENANT(routeUrls.TENANT.FAVORITE_PRODUCT.INDEX),
        },
      ],
    },
  ]

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
        sections={tenantMenuSections}
        homeUrl={routeUrls.BASE_ROUTE.TENANT(routeUrls.TENANT.HOME)}
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

export default LayoutTenant
