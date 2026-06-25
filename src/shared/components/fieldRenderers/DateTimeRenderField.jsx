import useTranslation from '@/shared/hooks/useTranslation'
import { Form, DatePicker } from 'antd'
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react'

const DateTimeRenderField = (
  {
    label,
    name,
    value,
    onChange,
    required = true,
    validate,
    validationContext,
    showTime = true,
    style,
    ...props
  },
  ref
) => {
  const [error, setError] = useState('')
  const { t } = useTranslation()
  const fieldLabel = label ? (
    <span style={{ whiteSpace: 'normal', lineHeight: 1.35 }}>{label}</span>
  ) : (
    label
  )

  const userRules = useMemo(() => {
    if (!validate) return []
    return Array.isArray(validate) ? validate : [validate]
  }, [validate])

  const runWith = useCallback(
    (nextValue, { skipEmpty = false } = {}) => {
      const isEmpty = nextValue === '' || nextValue === undefined || nextValue === null
      if (skipEmpty && isEmpty) {
        setError('')
        return true
      }
      if (required && isEmpty) {
        setError(t('error.required'))
        return false
      }
      for (const rule of userRules) {
        const result = rule(nextValue, validationContext)
        if (result !== true) {
          setError(result)
          return false
        }
      }
      setError('')
      return true
    },
    [required, t, userRules, validationContext]
  )

  const run = useCallback(() => runWith(value), [runWith, value])

  useImperativeHandle(
    ref,
    () => ({
      validate: run,
      resetValidation: () => setError(''),
    }),
    [run]
  )

  return (
    <Form.Item
      label={fieldLabel}
      required={required}
      validateStatus={error ? 'error' : undefined}
      help={error || undefined}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      labelAlign="left"
      colon={false}
      style={{ marginBottom: error ? 8 : 0 }}
    >
      <DatePicker
        name={name}
        value={value || null}
        showTime={showTime}
        onChange={(nextValue) => {
          if (error) runWith(nextValue, { skipEmpty: true })
          onChange?.({ target: { name, value: nextValue } })
        }}
        onBlur={run}
        style={{ width: '100%', height: 40, ...style }}
        {...props}
      />
    </Form.Item>
  )
}

export default forwardRef(DateTimeRenderField)
