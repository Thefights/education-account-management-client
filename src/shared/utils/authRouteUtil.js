import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import LayoutAdmin from '@/app/layouts/LayoutAdmin'
import LayoutTenant from '@/app/layouts/LayoutTenant'
import { getRoleFromAccessToken } from '@/shared/utils/authTokenUtil'
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
