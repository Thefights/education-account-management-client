import { theme } from 'antd'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import './PhoneInputField.css'

const PhoneInputField = ({
  value,
  onChange,
  placeholder,
  error = false,
  size = 'middle',
  style,
  ...props
}) => {
  const { token } = theme.useToken()
  const controlHeight = size === 'large' ? token.controlHeightSM : token.controlHeight

  return (
    <PhoneInput
      className="app-phone-input"
      international
      countryCallingCodeEditable={false}
      defaultCountry="SG"
      placeholder={placeholder}
      value={value || undefined}
      onChange={(nextValue) => onChange?.(nextValue || '')}
      style={{
        border: `1px solid ${error ? token.colorError : token.colorBorder}`,
        borderRadius: token.borderRadius,
        minHeight: controlHeight + 6,
        padding: '0 11px',
        background: token.colorBgContainer,
        color: token.colorText,
        ...(style || {}),
      }}
      {...props}
    />
  )
}

export default PhoneInputField
