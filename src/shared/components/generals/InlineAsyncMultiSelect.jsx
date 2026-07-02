import { Checkbox, Select } from 'antd'
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
    const excludedValueSet = new Set(
      (Array.isArray(excludedValues) ? excludedValues : []).map(String)
    )

    if (search.trim()) {
      return loadedOptions.filter((option) => !excludedValueSet.has(String(option.value)))
    }

    return mergeOptions(options, loadedOptions).filter(
      (option) => !excludedValueSet.has(String(option.value))
    )
  }, [excludedValues, loadedOptions, options, search])

  const selectedValueSet = useMemo(
    () => new Set((Array.isArray(value) ? value : []).map(String)),
    [value]
  )

  const keepOpen = () => {
    queueMicrotask(() => setOpen(true))
  }

  const handleSelect = () => {
    setSearch('')
    setLoadedOptions([])
    keepOpen()
  }

  const handleChange = (nextValue = []) => {
    const currentValueSet = new Set((Array.isArray(value) ? value : []).map(String))
    const addedValues = nextValue.filter((item) => !currentValueSet.has(String(item)))

    if (!addedValues.length) {
      onChange?.(nextValue)
      return
    }

    onChange?.([
      ...addedValues.reverse(),
      ...nextValue.filter((item) => currentValueSet.has(String(item))),
    ])
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
      style={{ width: '100%' }}
      onSearch={(nextSearch) => {
        setSearch(nextSearch)
        setLoadedOptions([])
      }}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setSearch('')
      }}
      onChange={handleChange}
      onSelect={handleSelect}
      onDeselect={handleSelect}
      optionRender={(option) => (
        <Checkbox
          checked={selectedValueSet.has(String(option.value))}
          disabled={option.data.disabled}
          style={{ pointerEvents: 'none' }}
        >
          {option.label}
        </Checkbox>
      )}
      labelRender={({ value: selectedValue, label }) =>
        renderSelectedLabel?.(selectedValue, label) ?? label
      }
    />
  )
}

export default InlineAsyncMultiSelect
