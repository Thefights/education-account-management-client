import axiosConfig from '@/shared/api/axiosClient'
import { isPlainObject } from '@/shared/utils/handleBooleanUtil'
import { appendPath } from '@/shared/utils/handleStringUtil'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * @param {string} url
 * @param {object} [params={}]
 * @param {Array} [dependencies=[]]
 * @param {boolean} [fetchOnMount=true]
 * @returns {{loading:boolean, error:Error|null, data:any, setData:function, fetch: () => Promise<import('axios').AxiosResponse<any> | undefined>}}
 */
export default function useFetch(url, params = {}, dependencies = [], fetchOnMount = true) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const isFirstRender = useRef(true)
  const reqIdRef = useRef(0)
  const paramsKey = JSON.stringify(params)

  const fetchData = useCallback(async () => {
    const controller = new AbortController()
    const currentReqId = Date.now()
    reqIdRef.current = currentReqId

    setError(null)
    setLoading(true)

    const parsedParams = JSON.parse(paramsKey)
    const isObjParams = isPlainObject(parsedParams)
    const finalUrl = isObjParams ? url : appendPath(url, parsedParams)
    const axiosParams = isObjParams ? parsedParams : undefined

    try {
      const response = await axiosConfig.get(finalUrl, {
        params: axiosParams,
        signal: controller.signal,
      })

      if (reqIdRef.current === currentReqId) {
        setError(null)
        setData(response.data)
        return response
      }
    } catch (error) {
      if (error.name !== 'CanceledError' && reqIdRef.current === currentReqId) {
        setError(error)
        return undefined
      }
    } finally {
      if (reqIdRef.current === currentReqId) {
        setLoading(false)
      }
    }
  }, [url, paramsKey])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false

      if (fetchOnMount) {
        queueMicrotask(() => fetchData())
      }

      return
    }

    if (dependencies.length > 0) {
      queueMicrotask(() => fetchData())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOnMount, fetchData, dependencies.length, ...dependencies])

  return { loading, error, data, setData, fetch: fetchData }
}
