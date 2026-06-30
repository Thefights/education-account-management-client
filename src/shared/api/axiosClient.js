import { envConfig } from '@/shared/config/envConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import { showErrorToast, showSuccessToast } from '@/shared/utils/toastUtil'
import axios from 'axios'
import { ApiUrls } from './apiUrls'
import { clearAccessToken, getAccessToken, setAccessToken } from './authTokenStore'

const axiosConfig = axios.create({
  baseURL: envConfig.api.baseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'X-Requested-With',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
  paramsSerializer: {
    serialize: (params) => {
      return Object.entries(params)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return value.map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&')
          }
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        })
        .join('&')
    },
  },
})

const refreshSkippedUrls = new Set([
  ApiUrls.AUTH.ADMIN_AZURE_AD_LOGIN,
  ApiUrls.AUTH.MOCK_SINGPASS_LOGIN,
  ApiUrls.AUTH.REFRESH_TOKEN,
])

const shouldSkipRefresh = (url) => refreshSkippedUrls.has(url)

axiosConfig.interceptors.request.use(
  (request) => {
    const token = getAccessToken()
    if (token) {
      request.headers.Authorization = `Bearer ${token}`
    }
    return request
  },
  (error) => Promise.reject(error)
)

axiosConfig.interceptors.response.use(
  (response) => {
    const { message } = response.data
    if (message) {
      showSuccessToast(message)
    }

    return response.data
  },
  async (error) => {
    const response = error?.response
    const status = response?.status || error?.status
    const originalRequest = error.config || {}

    if (status === 401 && !originalRequest._retry && !shouldSkipRefresh(originalRequest.url)) {
      originalRequest._retry = true

      try {
        const tokens = await refreshAccessTokenFromCookie()
        const accessToken = tokens.accessToken
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${accessToken}`,
        }

        return axiosConfig(originalRequest)
      } catch (ex) {
        clearAccessToken()
        setTimeout(() => {
          window.location.href = routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN)
        }, 1500)

        return Promise.reject(ex)
      }
    }

    let errorMessages = response?.data?.error

    if (typeof errorMessages === 'string') {
      errorMessages = [errorMessages]
    } else if (
      errorMessages &&
      typeof errorMessages === 'object' &&
      !Array.isArray(errorMessages)
    ) {
      errorMessages = Object.entries(errorMessages).map(([key, value]) => `[${key}] ${value}`)
    }

    switch (status) {
      case 400:
      case 401:
      case 403:
      case 404:
      case 409:
      case 422:
      case 429:
      case 499:
      case 503:
      case 504:
        if (errorMessages?.length) {
          errorMessages.forEach((msg) => showErrorToast(msg))
        } else {
          showErrorToast(response?.data?.message || 'Request failed')
        }
        break

      case 500:
      default:
        showErrorToast(response?.data?.message || 'Internal server error')
        break
    }
    return Promise.reject(error)
  }
)

export default axiosConfig

export const refreshAccessTokenFromCookie = async ({ silent = false } = {}) => {
  try {
    const resp = await axios.post(
      ApiUrls.AUTH.REFRESH_TOKEN,
      {},
      {
        baseURL: axiosConfig.defaults.baseURL,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    const tokens = resp.data?.data
    const accessToken = tokens?.accessToken
    if (!accessToken) {
      throw new Error('No access token in refresh response')
    }

    setAccessToken(accessToken)
    return tokens
  } catch (error) {
    if (!silent) {
      throw error
    }

    return undefined
  }
}
