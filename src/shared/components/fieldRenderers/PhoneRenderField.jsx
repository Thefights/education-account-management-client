import PhoneInputField from '@/shared/components/textFields/PhoneInputField'
import useTranslation from '@/shared/hooks/useTranslation'
import { PHONE_REGEX } from '@/shared/utils/authValidateUtil'
import { Form } from 'antd'
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { isPossiblePhoneNumber } from 'react-phone-number-input'

const PhoneRenderField = ({ field, value, onChange, size = 'middle' }, ref) => {
  const { t } = useTranslation()
  const [error, setError] = useState('')
  const required = field.required ?? true

  const validate = useCallback(() => {
    if (!value) {
      const nextError = required ? t('error.required') : ''
      setError(nextError)
      return !nextError
    }

    if (!isPossiblePhoneNumber(value) || !PHONE_REGEX.test(value)) {
      setError(t('auth.error.phone'))
      return false
    }

    if (value.length > 16) {
      setError(t('auth.error.phone_max_length'))
      return false
    }

    setError('')
    return true
  }, [required, t, value])

  useImperativeHandle(
    ref,
    () => ({
      validate,
      resetValidation: () => setError(''),
    }),
    [validate]
  )

  return (
    <Form.Item
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      labelAlign="left"
      colon={false}
      label={field.title}
      required={required}
      validateStatus={error ? 'error' : undefined}
      help={error || undefined}
      style={{ marginBottom: error ? 8 : 0 }}
    >
      <PhoneInputField
        placeholder={field.placeholder}
        value={value || undefined}
        error={!!error}
        size={size}
        onChange={(nextValue) => {
          if (error) setError('')
          onChange?.(nextValue || '')
        }}
      />
    </Form.Item>
  )
}

export default forwardRef(PhoneRenderField)
