import { useMemo } from 'react'

const normalizeSortValue = (value) => {
  if (value == null) return ''
  if (typeof value === 'number') return value

  const dateValue = Date.parse(value)
  if (typeof value === 'string' && Number.isFinite(dateValue) && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return dateValue
  }

  return String(value).toLowerCase()
}

export const useFasMockTable = ({
  rows = [],
  filters,
  filterRow = () => true,
  sort = { key: null, direction: 'asc' },
  page = 1,
  pageSize = 10,
}) => {
  const filteredRows = useMemo(
    () => rows.filter((row) => filterRow(row, filters)),
    [filterRow, filters, rows]
  )

  const sortedRows = useMemo(() => {
    if (!sort?.key) return filteredRows

    return [...filteredRows].sort((left, right) => {
      const leftValue = normalizeSortValue(left[sort.key])
      const rightValue = normalizeSortValue(right[sort.key])
      const direction = sort.direction === 'desc' ? -1 : 1

      if (leftValue > rightValue) return direction
      if (leftValue < rightValue) return -direction
      return 0
    })
  }, [filteredRows, sort])

  const totalCount = sortedRows.length
  const totalPage = Math.max(1, Math.ceil(totalCount / pageSize))
  const safePage = Math.min(page, totalPage)

  const collection = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return sortedRows.slice(start, start + pageSize)
  }, [pageSize, safePage, sortedRows])

  return {
    collection,
    totalCount,
    totalPage,
  }
}
