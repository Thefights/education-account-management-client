import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import LayoutAdmin from '@/app/layouts/AdminLayout'
import { getRoleFromAccessToken } from '@/shared/utils/authTokenUtil'
import React from 'react'

export const getReturnUrlByRole = (role) => {
  switch (String(role || '').toLowerCase()) {
    case EnumConfig.RoleEnum.Admin.toLowerCase():
      return routeUrls.BASE_ROUTE.ADMIN(routeUrls.ADMIN.AUDIT_LOG_MANAGEMENT.INDEX)
    default:
      return routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN)
  }
}

export const getLayoutByRole = (role) => {
  switch (String(role || '').toLowerCase()) {
    case EnumConfig.RoleEnum.Admin.toLowerCase():
      return LayoutAdmin
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
