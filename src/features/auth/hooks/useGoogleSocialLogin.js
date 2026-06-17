import { EnumConfig } from '@/shared/config/enumConfig'
import useSocialLoginSubmit from '@/features/auth/hooks/useSocialLoginSubmit'
import useTranslation from '@/shared/hooks/useTranslation'
import { showErrorToast } from '@/shared/utils/toastUtil'
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
