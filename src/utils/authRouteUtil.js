import { EnumConfig } from '@/configs/enumConfig'
import { routeUrls } from '@/configs/routeUrls'
import LayoutAdmin from '@/layouts/LayoutAdmin'
import LayoutTenant from '@/layouts/LayoutTenant'
import { getRoleFromAccessToken } from '@/utils/authTokenUtil'
import React from 'react'

export const getReturnUrlByRole = (role) => {
  switch (String(role || '').toLowerCase()) {
    case EnumConfig.RoleEnum.Admin.toLowerCase():
      return routeUrls.BASE_ROUTE.ADMIN(routeUrls.ADMIN.AUDIT_LOG_MANAGEMENT.INDEX)
    case EnumConfig.RoleEnum.TenantUser.toLowerCase():
      return routeUrls.BASE_ROUTE.TENANT(routeUrls.TENANT.HOME)
    default:
      return routeUrls.BASE_ROUTE.TENANT(routeUrls.TENANT.HOME)
  }
}

export const getLayoutByRole = (role) => {
  switch (String(role || '').toLowerCase()) {
    case EnumConfig.RoleEnum.Admin.toLowerCase():
      return LayoutAdmin
    case EnumConfig.RoleEnum.TenantUser.toLowerCase():
      return LayoutTenant
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
