import { Select } from 'antd'
import { useEffect, useMemo, useState } from 'react'

const mergeOptions = (...optionGroups) => {
  const optionMap = new Map()
  optionGroups.flat().forEach((option) => {
    if (option?.value == null) return
    optionMap.set(String(option.value), option)
  })
  return Array.from(optionMap.values())
}

const InlineAsyncMultiSelect = ({
  value = [],
  onChange,
  options = [],
  loadOptions,
  placeholder,
  renderSelectedLabel,
  pageSize = 30,
  disabled = false,
  excludedValues = [],
}) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [loadedOptions, setLoadedOptions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !loadOptions) return undefined

    let active = true
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const result = await loadOptions({ search: search.trim(), page: 1, pageSize })
        if (active) setLoadedOptions(result?.options || [])
      } finally {
        if (active) setLoading(false)
      }
    }, 300)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [loadOptions, open, pageSize, search])

  const displayOptions = useMemo(() => {
    const selectedValues = new Set([
      ...(Array.isArray(value) ? value : []).map(String),
      ...(Array.isArray(excludedValues) ? excludedValues : []).map(String),
    ])

    if (search.trim()) {
      return loadedOptions.filter((option) => !selectedValues.has(String(option.value)))
    }

    return mergeOptions(options, loadedOptions).filter(
      (option) => !selectedValues.has(String(option.value))
    )
  }, [excludedValues, loadedOptions, options, search, value])

  const keepOpen = () => {
    queueMicrotask(() => setOpen(true))
  }

  const handleSelect = () => {
    setSearch('')
    setLoadedOptions([])
    keepOpen()
  }

  return (
    <Select
      mode="multiple"
      value={Array.isArray(value) ? value : []}
      options={displayOptions}
      open={open}
      loading={loading}
      disabled={disabled}
      showSearch
      allowClear
      filterOption={false}
      searchValue={search}
      placeholder={placeholder}
      autoClearSearchValue
      maxTagCount="responsive"
      style={{ width: '100%' }}
      onSearch={(nextSearch) => {
        setSearch(nextSearch)
        setLoadedOptions([])
      }}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setSearch('')
      }}
      onChange={(nextValue) => onChange?.(nextValue)}
      onSelect={handleSelect}
      labelRender={({ value: selectedValue, label }) =>
        renderSelectedLabel?.(selectedValue, label) ?? label
      }
    />
  )
}

export default InlineAsyncMultiSelect
