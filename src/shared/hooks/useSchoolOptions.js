/** Loads schools once for reusable name-based selectors. */
import { ApiUrls } from '@/shared/api/apiUrls'
import useFetch from '@/shared/hooks/useFetch'
import { useMemo } from 'react'

export default function useSchoolOptions() {
  const schools = useFetch(
    ApiUrls.SCHOOL_MANAGEMENT.INDEX,
    { page: 1, pageSize: 1000, sort: 'schoolName asc' },
    []
  )
  const options = useMemo(
    () =>
      (schools.data?.collection || []).map((school) => ({
        value: school.id,
        label: school.schoolName,
      })),
    [schools.data?.collection]
  )

  return { options, loading: schools.loading, refetch: schools.fetch }
}
