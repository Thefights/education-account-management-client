import { EnumConfig } from '@/configs/enumConfig'
import useSocialLoginSubmit from '@/hooks/useSocialLoginSubmit'
import useTranslation from '@/hooks/useTranslation'
import { showErrorToast } from '@/utils/toastUtil'
import { useCallback, useState } from 'react'

export default function useGoogleSocialLogin() {
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

  const handleSuccess = useCallback(
    async (credentialResponse) => {
      setLoading(true)

      try {
        await submitProviderToken({
          provider: EnumConfig.SocialProvider.Google,
          providerToken: credentialResponse?.credential,
        })
      } finally {
        setLoading(false)
      }
    },
    [submitProviderToken]
  )

  const handleError = useCallback(() => {
    setLoginError()
    setLoading(false)
  }, [setLoginError])

  return {
    loading,
    handleSuccess,
    handleError,
  }
}
