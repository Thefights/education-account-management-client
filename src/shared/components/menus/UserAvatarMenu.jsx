import useTranslation from '@/shared/hooks/useTranslation'
import { getImageFromCloud } from '@/shared/utils/commons'
import { DownOutlined, LogoutOutlined } from '@ant-design/icons'
import { Avatar, Button, Dropdown, Space, Typography, theme } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const UserAvatarMenu = ({ profile, items = [], onLogout }) => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const name = profile?.name || profile?.fullName || ''
  const email = profile?.email || ''
  const avatarUrl = profile?.image ? getImageFromCloud(profile.image) : null
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const menuItems = [
    {
      key: 'profile-header',
      label: (
        <div style={{ padding: '16px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <Avatar
            src={avatarUrl}
            alt={name}
            size={40}
            style={{ backgroundColor: token.colorPrimary }}
          >
            {!avatarUrl && initials}
          </Avatar>
          <div style={{ minWidth: 0 }}>
            <Typography.Text
              style={{ fontWeight: 700, lineHeight: 1.2, display: 'block' }}
              ellipsis
            >
              {name}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ display: 'block' }} ellipsis>
              {email}
            </Typography.Text>
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },

    ...items.map((item) => ({
      key: item.key || item.url || item.label,
      label: item.label,
      icon: item.icon,
      onClick: () => {
        setOpen(false)
        if (item.onClick) {
          item.onClick()
          return
        }
        navigate(item.url)
      },
    })),

    { type: 'divider' },

    {
      key: 'logout',
      label: t('header.user_menu.logout'),
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => {
        setOpen(false)
        if (onLogout) onLogout()
        else navigate('/logout')
      },
    },
  ]

  return (
    <Dropdown
      menu={{ items: menuItems }}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button
        type="text"
        style={{
          borderRadius: '999px',
          border: `2px solid ${token.colorBorder}`,
          padding: '4px 8px',
          height: 'auto',
        }}
      >
        <Space size={8} style={{ height: 32 }}>
          <Avatar
            src={avatarUrl}
            alt={name}
            size={32}
            style={{ backgroundColor: token.colorPrimary }}
          >
            {!avatarUrl && initials}
          </Avatar>
          <DownOutlined style={{ fontSize: 12 }} />
        </Space>
      </Button>
    </Dropdown>
  )
}

export default UserAvatarMenu
