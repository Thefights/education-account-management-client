import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Modal, Space } from 'antd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const GenericFormDialog = ({
  open,
  onClose,
  title = 'Form',
  fields = [],
  initialValues = {},
  submitLabel,
  submitButtonColor = 'primary',
  width = 640,
  onValuesChange = (values) => Promise.resolve(values),
  textFieldVariant = 'outlined',
  textFieldSize = 'middle',
  onSubmit = ({ values, closeDialog, setField }) =>
    Promise.resolve({ values, closeDialog, setField }),
  additionalButtons = [],
  showSubmit = true,
  isSubmitDisabled = () => false,
  destroyOnHidden = false,
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
      await onSubmit({ values, closeDialog: handleClose, setField })
    } finally {
      setLoading(false)
    }
  }, [fields, handleClose, hasRequiredMissing, onSubmit, open, setField, validateAll, values])

  return (
    <Modal
      title={title}
      onCancel={handleClose}
      open={!!open}
      width={width}
      destroyOnHidden={destroyOnHidden}
      footer={
        <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
          <Button onClick={handleClose} disabled={loading}>
            {t('button.cancel')}
          </Button>
          {additionalButtons.map((btn, idx) => (
            <Button
              key={`btn-${idx}`}
              onClick={() => btn.onClick({ values, closeDialog: handleClose, setField })}
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
              disabled={loading || isSubmitDisabled(values)}
            >
              {submitLabel || t('button.submit')}
            </Button>
          )}
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%', marginTop: 16 }} size={16}>
        {fields.map((field, index) =>
          renderField(
            index === 0 ? { ...field, props: { ...field.props, autoFocus: true } } : field
          )
        )}
        {children}
      </Space>
    </Modal>
  )
}

export default GenericFormDialog
