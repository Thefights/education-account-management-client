import { getFacebookLoginRequest, getFacebookSdk } from '@/shared/config/facebookAuthConfig'
import { EnumConfig } from '@/shared/config/enumConfig'
import useSocialLoginSubmit from '@/shared/hooks/useSocialLoginSubmit'
import useTranslation from '@/shared/hooks/useTranslation'
import { showErrorToast } from '@/shared/utils/toastUtil'
import { useCallback, useState } from 'react'

export default function useFacebookSocialLogin() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const { submitProviderToken } = useSocialLoginSubmit()

  const setLoginError = useCallback(
    (error) => {
      const errorMessage = error?.errorMessage || ''
      showErrorToast(
        errorMessage
          ? t('auth.error.social_login_failed_detail', { error: errorMessage })
          : t('auth.error.social_login_failed')
      )
    },
    [t]
  )

  const startLogin = useCallback(async () => {
    try {
      setLoading(true)

      const FB = await getFacebookSdk()
      const response = await new Promise((resolve) => {
        FB.login(resolve, getFacebookLoginRequest())
      })

      if (response?.status !== 'connected') {
        setLoginError()
        setLoading(false)
        return
      }

      await submitProviderToken({
        provider: EnumConfig.SocialProvider.Facebook,
        providerToken: response?.authResponse?.accessToken,
      })
    } catch (error) {
      setLoginError(error)
    } finally {
      setLoading(false)
    }
  }, [setLoginError, submitProviderToken])

  return {
    loading,
    startLogin,
  }
}
