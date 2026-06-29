import SearchBar from '@/shared/components/generals/SearchBar'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Checkbox, Empty, Flex, Modal, Pagination, Space, Spin, Tag, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'

/**
 * Shared multi-select dialog using selected chips and a compact checkbox list.
 */
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

  const filteredAvailableOptions = useMemo(() => {
    if (loadOptions || !searchTerm.trim()) return visibleOptions || []

    const lowerSearch = searchTerm.toLowerCase()
    return (visibleOptions || []).filter((opt) => {
      const label = String(opt.searchKey || opt.label || '').toLowerCase()
      return label.includes(lowerSearch)
    })
  }, [loadOptions, searchTerm, visibleOptions])

  const disabledValueSet = useMemo(
    () =>
      new Set((visibleOptions || []).filter((opt) => opt.disabled).map((opt) => String(opt.value))),
    [visibleOptions]
  )

  const selectableAvailableOptions = useMemo(
    () =>
      filteredAvailableOptions.filter(
        (opt) => !opt.disabled && !selectedSet.has(String(opt.value))
      ),
    [filteredAvailableOptions, selectedSet]
  )

  const getOptionLabel = (option) => {
    if (!option) return ''
    return option.label ?? option.name ?? option.title ?? option.value
  }

  const getOptionDescription = (option) => {
    if (!option) return ''
    if (option.description) return option.description
    if (option.meta) return option.meta

    const details = [
      option.code,
      option.type,
      option.mode,
      option.duration,
    ].filter(Boolean)

    return details.join(' • ')
  }

  const getOptionStatus = (option) => option?.status || option?.statusLabel

  const renderOptionContent = (option) => {
    if (!option) return null
    if (renderOption) return renderOption(option.value, option.label)

    return (
      <Flex vertical gap={2} style={{ minWidth: 0 }}>
        <Typography.Text strong ellipsis>
          {getOptionLabel(option)}
        </Typography.Text>
        {getOptionDescription(option) && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }} ellipsis>
            {getOptionDescription(option)}
          </Typography.Text>
        )}
      </Flex>
    )
  }

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
      selectedValues: [...selectedValues, ...selectableAvailableOptions.map((opt) => opt.value)],
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

  const titleContent = (
    <Flex align="center" justify="space-between" gap={16} style={{ paddingRight: 32 }}>
      <Space size={8}>
        <Typography.Text strong>{title}</Typography.Text>
        <Typography.Text type="secondary">
          ({selectedValues.length} {t('text.selected').toLowerCase()})
        </Typography.Text>
      </Space>
      <Space size={4}>
        {selectableAvailableOptions.length > 0 && (
          <Button type="link" size="small" onClick={handleSelectAll}>
            {t('button.select_all')}
          </Button>
        )}
        {selectedValues.length > 0 && (
          <Button type="link" size="small" onClick={handleDeselectAll}>
            {t('button.clear')}
          </Button>
        )}
      </Space>
    </Flex>
  )

  return (
    <Modal
      title={titleContent}
      open={open}
      onCancel={handleCancel}
      width={760}
      styles={{ body: { paddingTop: 16, paddingBottom: 8 } }}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t('button.cancel')}
        </Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm}>
          {t('button.confirm')} ({selectedValues.length})
        </Button>,
      ]}
    >
      <Space orientation="vertical" style={{ width: '100%' }} size="middle">
        <SearchBar
          value={searchTerm}
          setValue={(value) => {
            setSearchTerm(value)
            setPage(1)
          }}
        />

        <Flex vertical gap={8}>
          <Flex align="center" justify="space-between" gap={12}>
            <Typography.Text strong>{t('text.all')}</Typography.Text>
          </Flex>
          <Spin spinning={asyncState.loading}>
            <Flex
              vertical
              gap={8}
              role="list"
              style={{
                minHeight: 220,
                maxHeight: 360,
                overflow: 'auto',
                paddingRight: 4,
              }}
            >
              {!filteredAvailableOptions.length && !asyncState.loading && (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
              {filteredAvailableOptions.map((opt) => {
                const status = getOptionStatus(opt)
                const isSelected = selectedSet.has(String(opt.value))
                return (
                  <Flex
                    key={String(opt.value)}
                    role="listitem"
                    align="flex-start"
                    gap={12}
                    style={{
                      cursor: opt.disabled ? 'not-allowed' : 'default',
                      padding: 12,
                      border: isSelected
                        ? '1px solid var(--ant-color-primary)'
                        : '1px solid var(--ant-color-border-secondary)',
                      borderRadius: 8,
                      background: opt.disabled
                        ? 'var(--ant-color-fill-tertiary)'
                        : isSelected
                          ? 'var(--ant-color-primary-bg)'
                          : 'var(--ant-color-bg-container)',
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={opt.disabled}
                      onChange={() => handleToggle(opt.value)}
                    />
                    <Flex flex={1} vertical style={{ minWidth: 0 }}>
                      {renderOptionContent(opt)}
                    </Flex>
                    {status && <Tag style={{ marginInlineEnd: 0 }}>{status}</Tag>}
                  </Flex>
                )
              })}
            </Flex>
          </Spin>
          {loadOptions && (
            <Pagination
              current={page}
              pageSize={pageSize}
              total={asyncState.totalCount}
              showSizeChanger={false}
              onChange={setPage}
              size="small"
              align="end"
            />
          )}
        </Flex>
      </Space>
    </Modal>
  )
}

export default MultipleSelectDialog
