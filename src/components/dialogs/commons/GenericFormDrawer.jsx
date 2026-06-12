import useFieldRenderer from '@/hooks/useFieldRenderer'
import useForm from '@/hooks/useForm'
import useTranslation from '@/hooks/useTranslation'
import { CloseOutlined } from '@ant-design/icons'
import { Button, Drawer, Space } from 'antd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const GenericFormDrawer = ({
  open,
  onClose,
  title = 'Form',
  fields = [],
  initialValues = {},
  submitLabel,
  submitButtonColor = 'primary',
  width = 640,
  placement = 'right',
  onValuesChange = (values) => Promise.resolve(values),
  textFieldVariant = 'outlined',
  textFieldSize = 'middle',
  onSubmit = ({ values, closeDrawer, setField }) =>
    Promise.resolve({ values, closeDrawer, setField }),
  additionalButtons = [],
  showSubmit = true,
  destroyOnClose = false,
  children,
}) => {
  const startValues = useMemo(() => {
    const values = { ...initialValues }
    for (const field of fields) {
      if (values[field.key] === undefined) {
        values[field.key] =
          field.defaultValue ??
          (field.type === 'file' ||
          (field.type === 'image' && (field.imageInput ?? 'file') === 'file')
            ? null
            : '')
      }
    }
    return values
  }, [fields, initialValues])

  const [submitState, setSubmitState] = useState({ open, submitted: false })
  const submitted = Object.is(submitState.open, open) ? submitState.submitted : false
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()
  const { values, handleChange, setField, reset, registerRef, validateAll, resetValidation } =
    useForm(startValues)
  const { renderField, hasRequiredMissing } = useFieldRenderer(
    values,
    setField,
    handleChange,
    registerRef,
    submitted,
    textFieldVariant,
    textFieldSize
  )
  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      reset(startValues)
      resetValidation()
    }

    if (!open && wasOpenRef.current) {
      resetValidation()
    }

    wasOpenRef.current = open
  }, [open, reset, resetValidation, startValues])

  useEffect(() => {
    onValuesChange?.(values, { setField })
  }, [values, onValuesChange, setField])

  const handleClose = useCallback(() => {
    reset(startValues)
    resetValidation()
    setSubmitState({ open: false, submitted: false })
    onClose?.()
  }, [onClose, reset, resetValidation, startValues])

  const handleSubmit = useCallback(async () => {
    setSubmitState({ open, submitted: true })
    const ok = validateAll()
    const missingField = hasRequiredMissing(fields)
    if (missingField || !ok) return

    if (typeof onSubmit !== 'function') return

    setLoading(true)
    try {
      await onSubmit({ values, closeDrawer: handleClose, setField })
    } finally {
      setLoading(false)
    }
  }, [fields, handleClose, hasRequiredMissing, onSubmit, open, setField, validateAll, values])

  return (
    <Drawer
      title={title}
      placement={placement}
      onClose={handleClose}
      open={!!open}
      size={width}
      closeIcon={<CloseOutlined />}
      destroyOnHidden={destroyOnClose}
      styles={{
        body: { paddingBottom: 88 },
        footer: { textAlign: 'right' },
      }}
      footer={
        <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
          <Button onClick={handleClose} disabled={loading}>
            {t('button.cancel')}
          </Button>
          {additionalButtons.map((btn, idx) => (
            <Button
              key={`btn-${idx}`}
              onClick={() => btn.onClick({ values, closeDrawer: handleClose, setField })}
              type={btn.type || 'default'}
              danger={btn.color === 'danger'}
              loading={loading}
            >
              {btn.label}
            </Button>
          ))}
          {showSubmit && (
            <Button
              onClick={handleSubmit}
              type="primary"
              danger={submitButtonColor === 'danger'}
              loading={loading}
            >
              {submitLabel || t('button.submit')}
            </Button>
          )}
        </Space>
      }
    >
      <Space orientation="vertical" style={{ width: '100%' }} size={16}>
        {fields.map((field, index) =>
          renderField(
            index === 0 ? { ...field, props: { ...field.props, autoFocus: true } } : field
          )
        )}
        {children}
      </Space>
    </Drawer>
  )
}

export default GenericFormDrawer
