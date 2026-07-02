import { DownOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Checkbox, Dropdown, Input, Space, theme } from 'antd'
import { useMemo, useState } from 'react'

const MultipleCheckDropdownField = ({
  value = [],
  options = [],
  placeholder,
  loading,
  disabled,
  onApply,
  selectAllText,
  searchPlaceholder,
  selectedText,
}) => {
  const { token } = theme.useToken()
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')

  const filteredOptions = useMemo(
    () =>
      options.filter((item) => String(item.label).toLowerCase().includes(keyword.toLowerCase())),
    [keyword, options]
  )

  const allValues = useMemo(() => options.map((item) => item.value), [options])
  const filteredValues = useMemo(() => filteredOptions.map((item) => item.value), [filteredOptions])
  const allFilteredChecked =
    filteredValues.length > 0 && filteredValues.every((item) => value.includes(item))
  const someFilteredChecked = filteredValues.some((item) => value.includes(item))
  const displayText =
    value.length === 0 || value.length === allValues.length
      ? placeholder
      : selectedText(value.length)

  const normalizeValue = (nextValue) => (nextValue.length === allValues.length ? [] : nextValue)

  const applyValue = (nextValue) => {
    onApply(normalizeValue(nextValue))
  }

  const toggleFilteredOptions = (checked) => {
    const nextValue = checked
      ? Array.from(new Set([...value, ...filteredValues]))
      : value.filter((item) => !filteredValues.includes(item))

    applyValue(nextValue)
  }

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen)

    if (nextOpen) {
      setKeyword('')
    }
  }

  const dropdownContent = (
    <div
      style={{
        width: 420,
        maxWidth: 'calc(100vw - 32px)',
        background: token.colorBgElevated,
        color: token.colorText,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div style={{ padding: 12 }}>
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder={searchPlaceholder}
          suffix={<SearchOutlined />}
          style={{ height: 40 }}
        />
      </div>

      <div style={{ maxHeight: 320, overflowY: 'auto', padding: '0 16px 12px' }}>
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          <Checkbox
            checked={allFilteredChecked}
            indeterminate={!allFilteredChecked && someFilteredChecked}
            disabled={filteredValues.length === 0}
            onChange={(event) => toggleFilteredOptions(event.target.checked)}
          >
            {selectAllText}
          </Checkbox>
          <Checkbox.Group value={value} onChange={applyValue}>
            <Space orientation="vertical" size={12}>
              {filteredOptions.map((item) => (
                <Checkbox key={String(item.value)} value={item.value} disabled={item.disabled}>
                  {item.label}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </Space>
      </div>
    </div>
  )

  return (
    <Dropdown
      trigger={['click']}
      open={open}
      onOpenChange={handleOpenChange}
      popupRender={() => dropdownContent}
    >
      <Button
        block
        disabled={disabled || loading}
        style={{
          height: 40,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{displayText}</span>
        <DownOutlined />
      </Button>
    </Dropdown>
  )
}

export default MultipleCheckDropdownField
