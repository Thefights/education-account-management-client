import axiosConfig from '@/shared/api/axiosClient'
import { ApiUrls } from '@/shared/api/apiUrls'
import useAuth from '@/shared/hooks/useAuth'
import useTranslation from '@/shared/hooks/useTranslation'
import { getReturnUrlByAuthTokens } from '@/shared/utils/authRouteUtil'
import { showErrorToast } from '@/shared/utils/toastUtil'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function useSingpassLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  const startLogin = useCallback(async () => {
    if (loading) return

    try {
      setLoading(true)

      const response = await axiosConfig.request({
        url: ApiUrls.AUTH.MOCK_SINGPASS_LOGIN,
        method: 'POST',
        data: undefined,
      })

      const loginResult = response?.data
      const tokens = loginResult?.tokens || loginResult
      const accessToken = tokens?.accessToken

      if (!accessToken) {
        showErrorToast(t('auth.error.missing_access_token'))
        return
      }

      await login(tokens)
      navigate(getReturnUrlByAuthTokens(tokens), { replace: true })
    } catch {
      return
    } finally {
      setLoading(false)
    }
  }, [loading, login, navigate, t])

  return {
    loading,
    startLogin,
  }
}
