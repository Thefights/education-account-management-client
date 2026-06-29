import useTranslation from '@/shared/hooks/useTranslation.js'
import { Button, Input, Modal, Space, Typography, theme } from 'antd'
import { useEffect, useMemo, useState } from 'react'

const getToneButtonStyle = (tone, token) => {
  const toneTokens = {
    success: {
      background: token.colorSuccess,
      borderColor: token.colorSuccess,
      color: token.colorTextLightSolid,
    },
    warning: {
      background: token.colorWarning,
      borderColor: token.colorWarning,
      color: token.colorTextLightSolid,
    },
    info: {
      background: token.colorInfo,
      borderColor: token.colorInfo,
      color: token.colorTextLightSolid,
    },
  }

  return toneTokens[tone] || {}
}

const getConfirmationDialogStyles = (token, hasCustomWidth, confirmButtonColor) => ({
  modal: {
    content: {
      borderRadius: token.borderRadiusLG,
      boxShadow: token.boxShadowSecondary,
      maxWidth: 'min(720px, calc(100vw - 48px))',
      minWidth: 'min(420px, calc(100vw - 48px))',
      padding: 0,
      width: hasCustomWidth ? undefined : 'fit-content',
    },
    header: {
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      margin: 0,
      padding: '10px 0px 10px',
    },
    body: {
      color: token.colorTextSecondary,
      fontSize: token.fontSizeLG,
      maxWidth: 640,
    },
    mask: {
      backgroundColor: token.colorBgMask,
    },
  },
  title: {
    color: token.colorTextHeading,
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 30,
    width: '100%',
  },
  reasonBlock: {
    marginTop: 18,
  },
  reasonLabel: {
    display: 'block',
    fontWeight: 600,
    marginBottom: 8,
  },
  cancelButton: {
    borderColor: token.colorBorder,
    borderRadius: token.borderRadiusSM,
    color: token.colorText,
    fontWeight: 700,
    height: 45,
    minWidth: 108,
  },
  confirmButton: {
    borderRadius: token.borderRadiusSM,
    fontWeight: 700,
    height: 45,
    minWidth: 108,
    ...getToneButtonStyle(confirmButtonColor, token),
  },
})

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {Function} props.onConfirm
 * @param {string} [props.title]
 * @param {import('react').ReactNode} [props.description]
 * @param {string} [props.confirmButtonText]
 * @param {'primary'|'error'|'warning'|'info'|'success'|'default'} [props.confirmButtonColor='primary']
 * @param {boolean} [props.confirmButtonLoading=false]
 * @param {number|string} [props.dialogWidth]
 * @param {boolean} [props.reasonRequired=false]
 */
const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmButtonText,
  confirmButtonColor = 'primary',
  confirmButtonLoading = false,
  dialogWidth,
  keyboard = false,
  reasonRequired = false,
  reasonLabel,
  reasonPlaceholder,
  reasonMinLength = 10,
  reasonMaxLength = 500,
  ...props
}) => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const [reason, setReason] = useState('')
  const [confirmAttempted, setConfirmAttempted] = useState(false)
  const modalProps = props
  const width = dialogWidth ?? 'fit-content'
  const isErrorConfirm = confirmButtonColor === 'error'
  const isFilledConfirm = confirmButtonColor === 'primary' || isErrorConfirm
  const dialogStyles = getConfirmationDialogStyles(token, Boolean(dialogWidth), confirmButtonColor)
  const trimmedReason = reason.trim()
  const reasonError = useMemo(() => {
    if (!reasonRequired) return ''
    if (!trimmedReason) return t('error.required')
    if (trimmedReason.length < reasonMinLength) {
      return t('error.min_length', { min: reasonMinLength, current: trimmedReason.length })
    }
    if (trimmedReason.length > reasonMaxLength) {
      return t('error.max_length', { max: reasonMaxLength, current: trimmedReason.length })
    }
    return ''
  }, [reasonMaxLength, reasonMinLength, reasonRequired, t, trimmedReason])
  const visibleReasonError = confirmAttempted ? reasonError : ''

  const handleConfirm = () => {
    if (reasonRequired) {
      setConfirmAttempted(true)
      if (reasonError) return
    }

    onConfirm(trimmedReason)
  }

  useEffect(() => {
    if (open) {
      setReason('')
      setConfirmAttempted(false)
    }
  }, [open])

  return (
    <Modal
      title={<span style={dialogStyles.title}>{title}</span>}
      open={open}
      centered
      closable={false}
      footer={null}
      width={width}
      onCancel={onClose}
      mask={{ closable: false }}
      keyboard={keyboard}
      styles={dialogStyles.modal}
      {...modalProps}
    >
      {typeof description === 'string' ? (
        <p style={{ lineHeight: 1.55, margin: 0 }}>{description}</p>
      ) : (
        description
      )}

      {reasonRequired && (
        <div style={dialogStyles.reasonBlock}>
          <Typography.Text style={dialogStyles.reasonLabel}>
            {reasonLabel || t('text.reason')}
          </Typography.Text>
          <Input.TextArea
            autoFocus
            value={reason}
            maxLength={reasonMaxLength}
            placeholder={reasonPlaceholder || t('text.reason_placeholder')}
            rows={4}
            showCount
            status={visibleReasonError ? 'error' : undefined}
            onChange={(event) => setReason(event.target.value)}
          />
          {visibleReasonError && (
            <Typography.Text type="danger" style={{ display: 'block', marginTop: 6 }}>
              {visibleReasonError}
            </Typography.Text>
          )}
        </div>
      )}

      <Space style={dialogStyles.footer}>
        <Button onClick={onClose} style={dialogStyles.cancelButton}>
          {t('button.cancel')}
        </Button>
        <Button
          type={isFilledConfirm ? 'primary' : 'default'}
          danger={isErrorConfirm}
          loading={confirmButtonLoading}
          onClick={handleConfirm}
          style={dialogStyles.confirmButton}
        >
          {confirmButtonText || t('button.confirm')}
        </Button>
      </Space>
    </Modal>
  )
}

export default ConfirmationDialog
