import useTranslation from '@/shared/hooks/useTranslation'
import { CloseOutlined, SearchOutlined } from '@ant-design/icons'
import { AutoComplete, Input } from 'antd'

const SearchBar = ({
  widthPercent = 100,
  value,
  setValue,
  options = [],
  getOptionLabel = (opt) => opt?.label || opt,
  onEnterDown = () => {},
}) => {
  const { t } = useTranslation()
  const isAutocomplete = Array.isArray(options) && options.length > 0
  const width = widthPercent !== 0 ? { width: widthPercent + '%' } : {}

  if (isAutocomplete) {
    const autocompleteOptions = options.map((opt) => ({
      label: getOptionLabel(opt),
      value: getOptionLabel(opt),
    }))

    return (
      <AutoComplete
        options={autocompleteOptions}
        value={value}
        onChange={(newValue) => setValue(newValue)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (e.defaultPrevented) return
            e.preventDefault()
            onEnterDown?.()
          }
        }}
        style={width}
        size="large"
        placeholder={t('text.search_placeholder')}
        allowClear
      />
    )
  }

  return (
    <Input
      prefix={<SearchOutlined />}
      suffix={value && <CloseOutlined onClick={() => setValue('')} style={{ cursor: 'pointer' }} />}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          if (e.defaultPrevented) return
          e.preventDefault()
          onEnterDown?.()
        }
      }}
      style={width}
      size="large"
      placeholder={t('text.search_placeholder')}
      allowClear
    />
  )
}

export default SearchBar

// Usage example:

/*
<SearchBar
	widthPercent={50}
	value={searchTerm}
	setValue={setSearchTerm}
/>
*/
