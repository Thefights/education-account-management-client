import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthStateFromAccessToken } from '@/utils/authTokenUtil'
import { ApiUrls } from './apiUrls'
import AuthContext from './AuthContext'
import { clearAccessToken, getAccessToken, setAccessToken } from './authTokenStore'
import axiosConfig, { refreshAccessTokenFromCookie } from './axiosConfig'
import { isPublicRoute, routeUrls } from './routeUrls'

const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [accessTokenState, setAccessTokenState] = useState(() => getAccessToken())
  const [auth, setAuth] = useState({})
  const [error, setError] = useState(null)
  const [initialized, setInitialized] = useState(false)

  const fetchCurrentAccount = useCallback(async () => {
    setAuth({})
    setError(null)
    setInitialized(true)
  }, [])

  useEffect(() => {
    let alive = true

    const bootstrapAuth = async () => {
      if (isPublicRoute()) {
        clearAccessToken()
        if (!alive) return
        setAccessTokenState(undefined)
        setAuth({})
        setError(null)
        setInitialized(true)
        return
      }

      try {
        const tokens = await refreshAccessTokenFromCookie({ silent: true })
        const accessToken = tokens?.accessToken
        if (!alive) return
        setAccessTokenState(accessToken)
        setAuth(getAuthStateFromAccessToken(accessToken))
        setError(null)
      } catch {
        clearAccessToken()
        if (!alive) return
        setAccessTokenState(undefined)
        setAuth({})
        setError(null)
      } finally {
        if (alive) {
          setInitialized(true)
        }
      }
    }

    bootstrapAuth()

    return () => {
      alive = false
    }
  }, [])

  const login = useCallback(async (tokens) => {
    const nextAccessToken = typeof tokens === 'string' ? tokens : tokens?.accessToken

    setAccessToken(nextAccessToken)
    setAccessTokenState(nextAccessToken)
    setAuth(getAuthStateFromAccessToken(nextAccessToken))
    setError(null)
  }, [])

  const logout = useCallback(async () => {
    try {
      await axiosConfig.post(
        ApiUrls.AUTH.LOGOUT,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    } finally {
      clearAccessToken()
      setAccessTokenState(undefined)
      setAuth({})
      setError(null)
      setInitialized(true)
      navigate(routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN))
    }
  }, [navigate])

  const value = useMemo(
    () => ({
      accessToken: accessTokenState,
      auth,
      error,
      login,
      logout,
      initialized,
      refreshAuth: fetchCurrentAccount,
    }),
    [accessTokenState, auth, error, fetchCurrentAccount, initialized, login, logout]
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
