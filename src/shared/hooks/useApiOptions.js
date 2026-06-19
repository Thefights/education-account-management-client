import useFetch from '@/shared/hooks/useFetch'
import { useMemo } from 'react'

export default function useApiOptions({ url, valueKey, labelKey, fetchOnMount = true }) {
  const request = useFetch(url, {}, [], fetchOnMount)
  const options = useMemo(
    () =>
      (Array.isArray(request.data) ? request.data : []).map((item) => ({
        value: item[valueKey],
        label: item[labelKey],
      })),
    [labelKey, request.data, valueKey]
  )

  return {
    options,
    loading: request.loading,
    refetch: request.fetch,
  }
}
