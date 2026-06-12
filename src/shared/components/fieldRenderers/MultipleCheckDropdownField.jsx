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
  cancelText,
  okText,
  selectedText,
}) => {
  const { token } = theme.useToken()
  const [open, setOpen] = useState(false)
  const [draftValue, setDraftValue] = useState(value)
  const [keyword, setKeyword] = useState('')

  const filteredOptions = useMemo(
    () =>
      options.filter((item) => String(item.label).toLowerCase().includes(keyword.toLowerCase())),
    [keyword, options]
  )

  const allValues = useMemo(() => options.map((item) => item.value), [options])
  const checkedAll = draftValue.length > 0 && draftValue.length === allValues.length

  const displayText =
    value.length === 0
      ? placeholder
      : value.length === allValues.length
        ? selectAllText
        : selectedText(value.length)

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen)

    if (nextOpen) {
      setDraftValue(value)
      setKeyword('')
    }
  }

  const handleCancel = () => {
    setDraftValue(value)
    setOpen(false)
  }

  const handleOk = () => {
    onApply(draftValue)
    setOpen(false)
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
        <Space orientation="vertical" size={12}>
          <Checkbox
            checked={checkedAll}
            indeterminate={draftValue.length > 0 && draftValue.length < allValues.length}
            onChange={(event) => setDraftValue(event.target.checked ? allValues : [])}
          >
            {selectAllText}
          </Checkbox>

          <Checkbox.Group value={draftValue} onChange={setDraftValue}>
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

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          padding: 12,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgElevated,
        }}
      >
        <Button onClick={handleCancel}>{cancelText}</Button>
        <Button type="primary" loading={loading} onClick={handleOk}>
          {okText}
        </Button>
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
