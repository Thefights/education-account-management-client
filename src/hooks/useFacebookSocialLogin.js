import { getFacebookLoginRequest, getFacebookSdk } from '@/configs/facebookAuthConfig'
import { EnumConfig } from '@/configs/enumConfig'
import useSocialLoginSubmit from '@/hooks/useSocialLoginSubmit'
import useTranslation from '@/hooks/useTranslation'
import { showErrorToast } from '@/utils/toastUtil'
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
