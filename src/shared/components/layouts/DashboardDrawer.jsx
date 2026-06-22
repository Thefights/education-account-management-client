import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Drawer, Grid, Layout, Tooltip } from 'antd'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SystemLogoAndName from './commons/SystemLogoAndName'
import NavItemDashboard from './navItems/NavItemDashboard'

const expandedDrawerWidth = 248
const collapsedDrawerWidth = 76

const DashboardDrawer = ({
  sections = [],
  mobileOpen = false,
  onMobileClose = () => {},
  homeUrl = '/',
}) => {
  const navigate = useNavigate()
  const screens = Grid.useBreakpoint()
  const isDesktop = !!screens.md

  const [collapsed, setCollapsed] = useState(false)
  const [expanded, setExpanded] = useState({})

  const drawerWidth = collapsed ? collapsedDrawerWidth : expandedDrawerWidth

  const handleToggleExpand = useCallback((key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const handleNavigate = useCallback(
    (url) => {
      navigate(url)
      onMobileClose?.()
    },
    [navigate, onMobileClose]
  )

  const renderContent = (isMobile = false) => {
    const actualCollapsed = isMobile ? false : collapsed

    return (
      <div
        style={{
          height: '100%',
          backgroundColor: 'var(--app-sider-bg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          role="banner"
          style={{
            height: 88,
            flexShrink: 0,
            color: 'var(--app-sider-text)',
            borderBottom: '1px solid var(--app-sider-border)',
            padding: actualCollapsed ? '14px 8px' : '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SystemLogoAndName collapsed={actualCollapsed} onClick={() => handleNavigate(homeUrl)} />
        </div>

        <nav
          role="navigation"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '10px 8px',
          }}
        >
          {sections.map((section, idx) => (
            <div
              key={`sec-${idx}`}
              style={{
                paddingBottom: 8,
              }}
            >
              {!actualCollapsed && section.title && (
                <div
                  style={{
                    paddingLeft: 16,
                    paddingRight: 16,
                    marginTop: idx === 0 ? 8 : 16,
                    marginBottom: 8,
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: '16px',
                      color: 'var(--app-sider-text-muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {section.title}
                  </span>
                </div>
              )}

              <div>
                {section.items.map((item) => (
                  <NavItemDashboard
                    key={item.key}
                    item={item}
                    collapsed={actualCollapsed}
                    expanded={expanded}
                    onToggleExpand={handleToggleExpand}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {!isMobile && (
          <div
            style={{
              height: 64,
              flexShrink: 0,
              borderTop: '1px solid var(--app-sider-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Tooltip title={collapsed ? 'Expand' : 'Collapse'} placement="right">
              <Button
                type="text"
                shape="circle"
                style={{
                  color: 'var(--app-sider-text)',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = 'var(--app-sider-hover-bg)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = 'transparent'
                }}
                icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
                onClick={() => setCollapsed((prev) => !prev)}
              />
            </Tooltip>
          </div>
        )}
      </div>
    )
  }

  return (
    <nav
      style={{
        width: isDesktop ? drawerWidth : 0,
        height: '100vh',
        flexShrink: 0,
      }}
    >
      <Drawer
        placement="left"
        onClose={onMobileClose}
        open={mobileOpen}
        closable={false}
        size={300}
        styles={{
          body: {
            padding: 0,
            height: '100%',
            overflow: 'hidden',
          },
          header: {
            display: 'none',
          },
          section: {
            backgroundColor: 'var(--app-sider-bg)',
          },
        }}
      >
        {renderContent(true)}
      </Drawer>

      {isDesktop && (
        <Layout.Sider
          width={drawerWidth}
          trigger={null}
          style={{
            borderRight: '1px solid var(--app-sider-border)',
            backgroundColor: 'var(--app-sider-bg)',
            borderRadius: 0,
            height: '100vh',
            overflow: 'hidden',
            boxShadow: 'var(--app-shell-shadow)',
          }}
        >
          {renderContent(false)}
        </Layout.Sider>
      )}
    </nav>
  )
}

export default DashboardDrawer
