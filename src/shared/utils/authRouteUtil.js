import AccountHolderLayout from '@/app/layouts/AccountHolderLayout'
import FinanceAdminLayout from '@/app/layouts/FinanceAdminLayout'
import SchoolAdminLayout from '@/app/layouts/SchoolAdminLayout'
import SystemAdminLayout from '@/app/layouts/SystemAdminLayout'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import { getRoleFromAccessToken } from '@/shared/utils/authTokenUtil'
import React from 'react'

export const getReturnUrlByRole = (role) => {
  switch (String(role || '').toLowerCase()) {
    case EnumConfig.RoleEnum.SystemAdmin.toLowerCase():
      return routeUrls.BASE_ROUTE.SYSTEM_ADMIN()
    case EnumConfig.RoleEnum.FinanceAdmin.toLowerCase():
      return routeUrls.BASE_ROUTE.FINANCE_ADMIN()
    case EnumConfig.RoleEnum.SchoolAdmin.toLowerCase():
      return routeUrls.BASE_ROUTE.SCHOOL_ADMIN()
    case EnumConfig.RoleEnum.AccountHolder.toLowerCase():
      return routeUrls.BASE_ROUTE.ACCOUNT_HOLDER()
    default:
      return routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN)
  }
}

export const getLayoutByRole = (role) => {
  switch (String(role || '').toLowerCase()) {
    case EnumConfig.RoleEnum.SystemAdmin.toLowerCase():
      return SystemAdminLayout
    case EnumConfig.RoleEnum.FinanceAdmin.toLowerCase():
      return FinanceAdminLayout
    case EnumConfig.RoleEnum.SchoolAdmin.toLowerCase():
      return SchoolAdminLayout
    case EnumConfig.RoleEnum.AccountHolder.toLowerCase():
      return AccountHolderLayout
    default:
      return React.Fragment
  }
}

export const getReturnUrlByAuthTokens = (tokens) => {
  const accessToken = typeof tokens === 'string' ? tokens : tokens?.accessToken
  const role = getRoleFromAccessToken(accessToken)

  return getReturnUrlByRole(role)
}

export const getPostLoginRoute = getReturnUrlByAuthTokens
