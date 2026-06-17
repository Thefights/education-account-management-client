import { Typography, theme } from 'antd'

const RoleHomePage = ({ role }) => {
  const { token } = theme.useToken()

  return (
    <main
      style={{
        flex: 1,
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: token.colorBgLayout,
      }}
    >
      <Typography.Title level={1} style={{ margin: 0, textAlign: 'center' }}>
        {role}
      </Typography.Title>
    </main>
  )
}

export default RoleHomePage
