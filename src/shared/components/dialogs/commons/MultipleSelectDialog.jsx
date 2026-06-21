import SearchBar from '@/shared/components/generals/SearchBar'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Checkbox, Empty, Modal, Pagination, Space, Spin } from 'antd'
import { useEffect, useMemo, useState } from 'react'

const MultipleSelectDialog = ({
  open = false,
  onClose,
  options = [],
  value = [],
  onChange,
  renderOption,
  title = '',
  loadOptions,
  pageSize = 20,
}) => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [asyncState, setAsyncState] = useState({ options: [], totalCount: 0, loading: false })
  const [optionCache, setOptionCache] = useState({})
  const visibleOptions = loadOptions ? asyncState.options : options

  useEffect(() => {
    if (!open || !loadOptions) return undefined
    let active = true
    const timer = setTimeout(async () => {
      setAsyncState((current) => ({ ...current, loading: true }))
      try {
        const result = await loadOptions({ search: searchTerm.trim(), page, pageSize })
        if (!active) return
        const loaded = result?.options || []
        setAsyncState({ options: loaded, totalCount: result?.totalCount || 0, loading: false })
        setOptionCache((current) =>
          Object.fromEntries([
            ...Object.entries(current),
            ...loaded.map((option) => [String(option.value), option]),
          ])
        )
      } catch {
        if (!active) return
        setAsyncState({ options: [], totalCount: 0, loading: false })
      }
    }, 350)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [loadOptions, open, page, pageSize, searchTerm])
  const initialValues = Array.isArray(value) ? value : []
  const [draft, setDraft] = useState({ sourceValue: value, selectedValues: initialValues })
  const selectedValues = Object.is(draft.sourceValue, value) ? draft.selectedValues : initialValues

  const selectedSet = useMemo(() => new Set(selectedValues.map((v) => String(v))), [selectedValues])

  const unselectedOptions = useMemo(() => {
    return (visibleOptions || []).filter((opt) => !selectedSet.has(String(opt.value)))
  }, [selectedSet, visibleOptions])

  const selectedOptions = useMemo(() => {
    return selectedValues
      .map(
        (selectedValue) =>
          (visibleOptions || []).find((opt) => String(opt.value) === String(selectedValue)) ||
          optionCache[String(selectedValue)]
      )
      .filter(Boolean)
  }, [optionCache, selectedValues, visibleOptions])

  const filteredUnselectedOptions = useMemo(() => {
    if (loadOptions || !searchTerm.trim()) return unselectedOptions

    const lowerSearch = searchTerm.toLowerCase()
    return unselectedOptions.filter((opt) => {
      const label = String(opt.searchKey || opt.label || '').toLowerCase()
      return label.includes(lowerSearch)
    })
  }, [loadOptions, unselectedOptions, searchTerm])

  const disabledValueSet = useMemo(
    () =>
      new Set((visibleOptions || []).filter((opt) => opt.disabled).map((opt) => String(opt.value))),
    [visibleOptions]
  )

  const selectableUnselectedOptions = useMemo(
    () => filteredUnselectedOptions.filter((opt) => !opt.disabled),
    [filteredUnselectedOptions]
  )

  const handleToggle = (optionValue) => {
    const strValue = String(optionValue)
    if (disabledValueSet.has(strValue)) return

    if (selectedSet.has(strValue)) {
      setDraft({
        sourceValue: value,
        selectedValues: selectedValues.filter((v) => String(v) !== strValue),
      })
    } else {
      setDraft({
        sourceValue: value,
        selectedValues: [...selectedValues, optionValue],
      })
    }
  }

  const handleSelectAll = () => {
    setDraft({
      sourceValue: value,
      selectedValues: [...selectedValues, ...selectableUnselectedOptions.map((opt) => opt.value)],
    })
  }

  const handleDeselectAll = () => {
    setDraft({ sourceValue: value, selectedValues: [] })
  }

  const handleConfirm = () => {
    onChange?.(selectedValues)
    onClose?.()
  }

  const handleCancel = () => {
    onClose?.()
  }

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      onOk={handleConfirm}
      okText={t('button.confirm')}
      cancelText={t('button.cancel')}
      width={900}
    >
      <Space orientation="vertical" style={{ width: '100%' }} size="large">
        <SearchBar
          value={searchTerm}
          setValue={(value) => {
            setSearchTerm(value)
            setPage(1)
          }}
        />

        <div style={{ display: 'flex', gap: 16 }}>
          {/* Unselected Options */}
          <div style={{ flex: 1 }}>
            <h4>{t('text.available')}</h4>
            <Spin spinning={asyncState.loading}>
              <div role="list" style={{ minHeight: 180, maxHeight: 300, overflow: 'auto' }}>
                {!filteredUnselectedOptions.length && !asyncState.loading && (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
                {filteredUnselectedOptions.map((opt) => (
                  <div
                    key={String(opt.value)}
                    role="listitem"
                    style={{ cursor: opt.disabled ? 'not-allowed' : 'pointer', padding: '8px 0' }}
                    onClick={() => handleToggle(opt.value)}
                  >
                    <Space>
                      <Checkbox checked={false} disabled={opt.disabled} />
                      <span>{renderOption ? renderOption(opt.value, opt.label) : opt.label}</span>
                    </Space>
                  </div>
                ))}
              </div>
            </Spin>
            {loadOptions && (
              <Pagination
                current={page}
                pageSize={pageSize}
                total={asyncState.totalCount}
                showSizeChanger={false}
                onChange={setPage}
                size="small"
              />
            )}
            <Space style={{ marginTop: 12 }}>
              <Button type="primary" onClick={handleSelectAll} size="small">
                {t('button.select_all')}
              </Button>
              <Button onClick={handleDeselectAll} size="small">
                {t('button.deselect_all')}
              </Button>
            </Space>
          </div>

          {/* Selected Options */}
          <div style={{ flex: 1 }}>
            <h4>{t('text.selected')}</h4>
            <div role="list" style={{ maxHeight: 300, overflow: 'auto' }}>
              {selectedOptions.map((opt) => (
                <div
                  key={String(opt.value)}
                  role="listitem"
                  style={{ cursor: 'pointer', padding: '8px 0' }}
                  onClick={() => handleToggle(opt.value)}
                >
                  <Space>
                    <Checkbox checked={true} />
                    <span>{renderOption ? renderOption(opt.value, opt.label) : opt.label}</span>
                  </Space>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Space>
    </Modal>
  )
}

export default MultipleSelectDialog
