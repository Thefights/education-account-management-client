import { RightOutlined } from '@ant-design/icons'
import { Breadcrumb, Grid, Layout, Space, Typography, theme } from 'antd'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MobileMenuButton from '../buttons/MobileMenuButton'
import SwitchLanguageButton from '../buttons/SwitchLanguageButton'
import SwitchThemeButton from '../buttons/SwitchThemeButton'
import UserAvatarMenu from '../menus/UserAvatarMenu'

const DashboardHeader = ({ onOpenDrawer, profile, userMenuItems = [], onLogout = () => {} }) => {
  const screens = Grid.useBreakpoint()
  const isDownMd = !screens.md
  const isDownSm = !screens.sm
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()

  const { crumbs, currentLabel } = useMemo(() => {
    const rawPath = location?.pathname || '/'
    const pathWithoutQuery = rawPath.split('?')[0].split('#')[0]
    const segments = pathWithoutQuery.split('/').filter(Boolean)

    const items = segments.map((seg, idx) => {
      const cumulative = '/' + segments.slice(0, idx + 1).join('/')
      const labelMaker = (seg) => seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      return {
        label: labelMaker(decodeURIComponent(seg), cumulative),
        path: cumulative,
        isLast: idx === segments.length - 1,
      }
    })

    if (items.length === 0) {
      return { crumbs: [], currentLabel: 'Dashboard' }
    }

    return {
      crumbs: items.slice(0, -1),
      currentLabel: items[items.length - 1].label,
    }
  }, [location])

  const breadcrumbItems = [
    {
      title: (
        <a
          onClick={() => navigate('/')}
          style={{
            cursor: 'pointer',
            color: location.pathname !== '/' ? token.colorPrimary : token.colorTextSecondary,
          }}
        >
          Home
        </a>
      ),
    },
    ...crumbs.map((c) => ({
      title: (
        <a
          onClick={() => navigate(c.path)}
          style={{ cursor: 'pointer', color: token.colorPrimary, whiteSpace: 'nowrap' }}
          title={c.label}
        >
          {c.label}
        </a>
      ),
    })),
    {
      title: (
        <span
          style={{
            cursor: 'default',
            color: token.colorTextSecondary,
            whiteSpace: 'nowrap',
          }}
        >
          {currentLabel}
        </span>
      ),
    },
  ]

  return (
    <Layout.Header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        color: token.colorText,
        borderBottom: `1px solid ${token.colorBorder}`,
        padding: `0 ${isDownMd ? 8 : 16}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        justifyItems: 'center',
        gap: isDownSm ? 8 : 12,
        lineHeight: 'normal',
        minHeight: screens.sm ? 64 : 56,
      }}
    >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isDownSm ? 8 : 12,
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {isDownMd && <MobileMenuButton onOpen={onOpenDrawer} />}

          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              overflow: 'hidden',
              minWidth: 0,
              flex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 64,
                transform: 'translateY(1px)',
                minWidth: 0,
                width: '100%',
              }}
            >
              {isDownSm ? (
                <Typography.Text
                  strong
                  ellipsis={{ tooltip: currentLabel }}
                  style={{
                    maxWidth: '100%',
                    minWidth: 0,
                    fontSize: 15,
                    color: token.colorText,
                  }}
                >
                  {currentLabel}
                </Typography.Text>
              ) : (
                <Breadcrumb
                  items={breadcrumbItems}
                  separator={
                    <RightOutlined
                      style={{
                        fontSize: 12,
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    />
                  }
                  style={{
                    fontSize: 16,
                    lineHeight: '20px',
                    margin: 0,
                    maxWidth: '100%',
                    minWidth: 0,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                  itemRender={(route) => (
                    <span
                      style={{
                        display: 'inline-block',
                        maxWidth: screens.lg ? 220 : 140,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        verticalAlign: 'bottom',
                        whiteSpace: 'nowrap',
                      }}
                      title={typeof route.title === 'string' ? route.title : undefined}
                    >
                      {route.title}
                    </span>
                  )}
                />
              )}
            </div>
          </nav>
        </div>
        <Space
          size={isDownSm ? 4 : 8}
          align="center"
          style={{ flex: '0 0 auto', lineHeight: 'normal' }}
        >
          <SwitchThemeButton />
          <SwitchLanguageButton />
          <UserAvatarMenu profile={profile} items={userMenuItems} onLogout={onLogout} />
        </Space>
    </Layout.Header>
  )
}

export default DashboardHeader
