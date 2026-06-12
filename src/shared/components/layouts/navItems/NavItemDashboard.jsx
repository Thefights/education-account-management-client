import { DownOutlined } from '@ant-design/icons'
import { Button, Popover, Tooltip, theme } from 'antd'
import React from 'react'
import { useLocation } from 'react-router-dom'

const renderIcon = (icon) => {
  if (!icon) return null
  if (React.isValidElement(icon)) return icon

  const Icon = icon
  return <Icon />
}

const NavItemDashboard = ({
  item,
  expanded = {},
  collapsed = false,
  onToggleExpand = () => {},
  onNavigate = () => {},
}) => {
  const location = useLocation()
  const { token } = theme.useToken()

  const children = Array.isArray(item.of) ? item.of : []
  const hasChildren = children.length > 0
  const isExpanded = !!expanded[item.key]

  const active =
    item.url === location.pathname || children.some((child) => child.url === location.pathname)

  const Icon = renderIcon(item.icon)

  const activeBgColor = 'var(--app-sider-active-bg)'
  const hoverBgColor = 'var(--app-sider-hover-bg)'
  const activeTextColor = 'var(--app-sider-active-text)'
  const inactiveTextColor = 'var(--app-sider-text)'
  const mutedTextColor = 'var(--app-sider-text-muted)'
  const siderBorderColor = 'var(--app-sider-border)'

  const handleClick = () => {
    if (hasChildren) {
      if (!collapsed) onToggleExpand(item.key)
      return
    }

    if (item.url) onNavigate(item.url)
  }

  const childPopup = (
    <div
      style={{
        minWidth: 210,
        padding: 4,
      }}
    >
      <div
        style={{
          padding: '8px 10px',
          fontSize: 13,
          fontWeight: 700,
          color: token.colorText,
          borderBottom: `1px solid ${token.colorSplit}`,
          marginBottom: 4,
        }}
      >
        {item.label}
      </div>

      {children.map((child) => {
        const childActive = child.url === location.pathname

        return (
          <div
            key={child.key || child.url}
            onClick={() => child.url && onNavigate(child.url)}
            style={{
              height: 36,
              padding: '0 10px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              background: childActive ? token.colorFillSecondary : 'transparent',
              color: childActive ? token.colorPrimary : token.colorText,
              fontWeight: childActive ? 700 : 500,
              fontSize: 13,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(event) => {
              if (!childActive) event.currentTarget.style.background = token.colorFillTertiary
            }}
            onMouseLeave={(event) => {
              if (!childActive) event.currentTarget.style.background = 'transparent'
            }}
          >
            {child.label}
          </div>
        )
      })}
    </div>
  )

  const parentButton = (
    <Button
      type="text"
      block
      onClick={handleClick}
      style={{
        background: active ? activeBgColor : 'transparent',
        color: active ? activeTextColor : inactiveTextColor,
        fontWeight: active ? 700 : 500,
        height: collapsed ? 48 : 74,
        justifyContent: 'center',
        padding: collapsed ? '8px' : '8px 6px',
        overflow: 'hidden',
        borderRadius: 0,
      }}
      onMouseEnter={(event) => {
        if (!active) event.currentTarget.style.background = hoverBgColor
      }}
      onMouseLeave={(event) => {
        if (!active) event.currentTarget.style.background = 'transparent'
      }}
    >
      <span
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: collapsed ? 0 : 5,
          lineHeight: 1.15,
          minWidth: 0,
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            display: 'flex',
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {Icon}
        </span>

        {!collapsed && (
          <>
            <span
              title={item.label}
              style={{
                display: 'block',
                fontSize: 12,
                maxWidth: '100%',
                overflow: 'hidden',
                textAlign: 'center',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </span>

            {hasChildren && (
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isExpanded ? hoverBgColor : 'transparent',
                  color: active ? activeTextColor : mutedTextColor,
                }}
              >
                <DownOutlined
                  style={{
                    fontSize: 9,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </span>
            )}
          </>
        )}
      </span>
    </Button>
  )

  return (
    <div
      style={{
        padding: collapsed ? '4px 8px' : '3px 10px',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {collapsed && hasChildren ? (
        <Popover
          content={childPopup}
          placement="rightTop"
          trigger="hover"
          arrow
          styles={{
            body: {
              padding: 0,
            },
          }}
        >
          {parentButton}
        </Popover>
      ) : collapsed ? (
        <Tooltip title={item.label} placement="right">
          {parentButton}
        </Tooltip>
      ) : (
        parentButton
      )}

      {!collapsed && hasChildren && isExpanded && (
        <div
          style={{
            marginTop: 6,
            marginLeft: 22,
            paddingLeft: 12,
            paddingRight: 2,
            borderLeft: `1px solid ${siderBorderColor}`,
            overflow: 'hidden',
          }}
        >
          {children.map((child) => {
            const childActive = child.url === location.pathname

            return (
              <div
                key={child.key || child.url}
                onClick={() => child.url && onNavigate(child.url)}
                style={{
                  height: 32,
                  marginBottom: 2,
                  padding: '0 8px',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: childActive ? activeBgColor : 'transparent',
                  color: childActive ? activeTextColor : inactiveTextColor,
                  fontWeight: childActive ? 700 : 500,
                  overflow: 'hidden',
                }}
                onMouseEnter={(event) => {
                  if (!childActive) event.currentTarget.style.background = hoverBgColor
                }}
                onMouseLeave={(event) => {
                  if (!childActive) event.currentTarget.style.background = 'transparent'
                }}
              >
                <span
                  title={child.label}
                  style={{
                    display: 'block',
                    width: '100%',
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textAlign: 'left',
                    fontSize: 11,
                    lineHeight: '16px',
                  }}
                >
                  {child.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default NavItemDashboard
