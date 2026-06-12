import { ApiUrls } from '@/configs/apiUrls'
import useAuth from '@/hooks/useAuth'
import useAxiosSubmit from '@/hooks/useAxiosSubmit'
import useTranslation from '@/hooks/useTranslation'
import { getReturnUrlByAuthTokens } from '@/utils/authRouteUtil'
import { showErrorToast } from '@/utils/toastUtil'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export default function useSocialLoginSubmit() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useTranslation()

  const { submit: submitSocialLogin } = useAxiosSubmit({
    url: ApiUrls.AUTH.SOCIAL_LOGIN,
    method: 'POST',
  })

  const submitProviderToken = useCallback(
    async ({ provider, providerToken }) => {
      if (!providerToken) {
        showErrorToast(t('auth.error.social_login_missing_provider_token'))
        return false
      }

      const response = await submitSocialLogin({
        overrideData: {
          provider,
          providerToken,
        },
      })

      if (!response) {
        showErrorToast(t('auth.error.social_login_exchange_failed'))
        return false
      }

      const accessToken = response?.data?.accessToken

      if (!accessToken) {
        showErrorToast(t('auth.error.missing_access_token'))
        return false
      }

      await login(accessToken)
      navigate(getReturnUrlByAuthTokens(accessToken), { replace: true })
      return true
    },
    [login, navigate, submitSocialLogin, t]
  )

  return {
    submitProviderToken,
  }
}
