import axiosConfig from '@/shared/api/axiosClient'
import { isPlainObject } from '@/shared/utils/handleBooleanUtil'
import { getObjectConvertingToFormData } from '@/shared/utils/handleObjectUtil'
import { appendPath, getTrimString } from '@/shared/utils/handleStringUtil'
import { useCallback, useState } from 'react'

const emptyObject = {}
const defaultSuccessHandler = async (response) => Promise.resolve(response)
const defaultErrorHandler = async (error) => Promise.resolve(error)

/**
 * @param {Object} config
 * @param {string} config.url
 * @param {'POST'|'GET'|'PUT'|'DELETE'} [config.method='POST']
 * @param {Object} [config.data={}]
 * @param {Object|string} [config.params={}]
 * @param {(response) => Promise<any>} [config.onSuccess=async (response) => Promise.resolve(response)]
 * @param {(error) => Promise<any>} [config.onError=async (error) => Promise.resolve(error)]
 * @returns {{loading: boolean, error: Error|null, response: any|null, submit: function({ overrideData, overrideUrl, overrideParam }): Promise<any>}}
 */
export default function useAxiosSubmit({
  url = '',
  method = 'POST',
  data = emptyObject,
  params = emptyObject,
  onSuccess = defaultSuccessHandler,
  onError = defaultErrorHandler,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [response, setResponse] = useState(null)

  const submit = useCallback(
    async ({ overrideData, overrideUrl, overrideParam } = {}) => {
      if (loading) return undefined

      setLoading(true)
      setError(null)
      setResponse(null)

      const upper = String(method).toUpperCase()
      const queryOnly = upper === 'GET'
      const bodySource = overrideData !== undefined ? overrideData : data

      const finalParams = overrideParam !== undefined ? overrideParam : params
      const finalUrl = overrideUrl || url

      const isObjParams = isPlainObject(finalParams)
      const axiosUrl = isObjParams ? finalUrl : appendPath(finalUrl, finalParams)
      const axiosParams = isObjParams ? finalParams : undefined

      try {
        let payload = undefined
        if (!queryOnly) {
          if (bodySource instanceof FormData) {
            payload = bodySource
          } else {
            const trimmed = getTrimString(bodySource)
            payload = getObjectConvertingToFormData(trimmed)
          }
        }
        const response = await axiosConfig.request({
          url: axiosUrl,
          method: upper,
          params: axiosParams,
          data: payload,
        })

        setResponse(response)
        await onSuccess?.(response)
        return response
      } catch (err) {
        setError(err)
        await onError?.(err)
        return undefined
      } finally {
        setLoading(false)
      }
    },
    [loading, method, data, url, params, onSuccess, onError]
  )

  return { loading, error, response, submit }
}

// Example usage:
/* 
const postUser = useAxiosSubmit('/api/user/{selectedUser?.id}',
 'POST',
 { name: "Name", description: 'My file' },
)
*/

// await postUser.submit()
// postUser.loading
// postUser.error
// postUser.response
