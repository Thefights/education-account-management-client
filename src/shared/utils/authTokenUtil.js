const roleClaimKeys = [
  'role',
  'roles',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
]

const claimKeys = {
  id: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  authId: 'AuthId',
  userId: 'UserId',
}

const decodeJwtPayload = (token) => {
  if (!token) return {}

  try {
    const payload = token.split('.')[1]
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(normalizedPayload)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    )

    return JSON.parse(json)
  } catch {
    return {}
  }
}

export const getRoleFromAccessToken = (accessToken) => {
  const payload = decodeJwtPayload(accessToken)

  for (const key of roleClaimKeys) {
    const value = payload?.[key]
    if (Array.isArray(value)) return value[0]
    if (value) return value
  }

  return undefined
}

export const getAuthStateFromAccessToken = (accessToken) => {
  const payload = decodeJwtPayload(accessToken)
  const role = getRoleFromAccessToken(accessToken)

  return {
    id: payload?.[claimKeys.id],
    authId: payload?.[claimKeys.authId],
    userId: payload?.[claimKeys.userId],
    name: payload?.[claimKeys.name],
    role,
  }
}
