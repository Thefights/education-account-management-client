import { theme } from 'antd'
import { forwardRef, useState } from 'react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import './PhoneInputField.css'

const SINGAPORE_CALLING_CODE = '+65'

const formatSingaporeDisplayValue = (phoneNumber = '') => {
  const digits = String(phoneNumber).replace(/\D/g, '')
  const nationalDigits = digits.startsWith('65') ? digits.slice(2) : digits
  const formattedNationalDigits = [
    nationalDigits.slice(0, 4),
    nationalDigits.slice(4, 8),
    nationalDigits.slice(8),
  ]
    .filter(Boolean)
    .join(' ')

  return formattedNationalDigits
    ? `${SINGAPORE_CALLING_CODE} ${formattedNationalDigits}`
    : SINGAPORE_CALLING_CODE
}

const PhoneNumberInput = forwardRef(({ value, selectedCountry, ...props }, ref) => (
  <input
    {...props}
    ref={ref}
    value={selectedCountry === 'SG' ? formatSingaporeDisplayValue(value) : value}
  />
))

PhoneNumberInput.displayName = 'PhoneNumberInput'

const PhoneInputField = ({
  value,
  onChange,
  placeholder,
  error = false,
  size = 'middle',
  style,
  onCountryChange,
  ...props
}) => {
  const { token } = theme.useToken()
  const [selectedCountry, setSelectedCountry] = useState('SG')
  const controlHeight = size === 'large' ? token.controlHeightSM : token.controlHeight

  return (
    <PhoneInput
      className="app-phone-input"
      international
      smartCaret={false}
      inputComponent={PhoneNumberInput}
      numberInputProps={{ selectedCountry }}
      countryCallingCodeEditable={false}
      defaultCountry="SG"
      placeholder={placeholder}
      value={value || undefined}
      onCountryChange={(nextCountry) => {
        setSelectedCountry(nextCountry || 'SG')
        onCountryChange?.(nextCountry)
      }}
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
