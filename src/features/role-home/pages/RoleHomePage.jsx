import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import { Typography, theme } from 'antd'
import { Navigate } from 'react-router-dom'

const RoleHomePage = ({ role }) => {
  const { token } = theme.useToken()

  if (role === EnumConfig.RoleEnum.FinanceAdmin) {
    return (
      <Navigate
        replace
        to={routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.INDEX)}
      />
    )
  }

  if (role === EnumConfig.RoleEnum.SchoolAdmin) {
    return <Navigate replace to={routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.FAS_ADMIN.SCHEMES)} />
  }

  if (role === EnumConfig.RoleEnum.AccountHolder) {
    return <Navigate replace to={routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY)} />
  }

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
