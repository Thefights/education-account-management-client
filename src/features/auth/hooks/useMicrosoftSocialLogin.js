import {
  getMicrosoftClient,
  getMicrosoftLoginRequest,
} from '@/features/auth/config/microsoftAuthConfig'
import { ApiUrls } from '@/shared/api/apiUrls'
import axiosConfig from '@/shared/api/axiosClient'
import useAuth from '@/shared/hooks/useAuth'
import useTranslation from '@/shared/hooks/useTranslation'
import { getReturnUrlByAuthTokens } from '@/shared/utils/authRouteUtil'
import { showErrorToast } from '@/shared/utils/toastUtil'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

let microsoftRedirectResultPromise
let microsoftRedirectExchangeStarted = false

const getMicrosoftRedirectResult = async () => {
  if (!microsoftRedirectResultPromise) {
    microsoftRedirectResultPromise = (async () => {
      const microsoftClient = await getMicrosoftClient()

      return microsoftClient.handleRedirectPromise({
        navigateToLoginRequestUrl: false,
      })
    })()
  }

  return microsoftRedirectResultPromise
}

export default function useMicrosoftSocialLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  const setLoginError = useCallback(
    (error) => {
      const errorMessage = error?.errorMessage
      showErrorToast(
        errorMessage
          ? t('auth.error.social_login_failed_detail', { error: errorMessage })
          : t('auth.error.social_login_failed')
      )
    },
    [t]
  )

  const completeLogin = useCallback(
    async (idToken) => {
      if (!idToken) {
        showErrorToast(t('auth.error.social_login_missing_provider_token'))
        return
      }

      const response = await axiosConfig.request({
        url: ApiUrls.AUTH.ADMIN_AZURE_AD_LOGIN,
        method: 'POST',
        data: {
          idToken,
        },
      })

      if (!response) return

      const loginResult = response?.data
      const tokens = loginResult?.tokens || loginResult
      const accessToken = tokens?.accessToken

      if (!accessToken) {
        showErrorToast(t('auth.error.missing_access_token'))
        return
      }

      await login(tokens)
      navigate(getReturnUrlByAuthTokens(tokens), { replace: true })
    },
    [login, navigate, t]
  )

  useEffect(() => {
    let alive = true

    const handleRedirectResult = async () => {
      try {
        const result = await getMicrosoftRedirectResult()

        if (!alive) return

        if (microsoftRedirectExchangeStarted) {
          return
        }

        if (!result) {
          const hasMicrosoftResponse =
            window.location.hash.includes('code=') ||
            window.location.hash.includes('error=') ||
            window.location.search.includes('code=') ||
            window.location.search.includes('error=')

          if (hasMicrosoftResponse) {
            showErrorToast(t('auth.error.microsoft_redirect_response_missing'))
          }

          return
        }

        microsoftRedirectExchangeStarted = true
        setLoading(true)
        await completeLogin(result.idToken)
      } catch (error) {
        if (alive) {
          setLoginError(error)
        }
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    }

    handleRedirectResult()

    return () => {
      alive = false
    }
  }, [completeLogin, setLoginError, t])

  const startLogin = useCallback(async () => {
    try {
      setLoading(true)

      const loginRequest = getMicrosoftLoginRequest()

      const microsoftClient = await getMicrosoftClient()
      await microsoftClient.loginRedirect(loginRequest)
    } catch (error) {
      setLoginError(error)
      setLoading(false)
    }
  }, [setLoginError])

  return {
    loading,
    startLogin,
  }
}
