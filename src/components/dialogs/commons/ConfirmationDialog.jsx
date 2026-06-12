import useTranslation from '@/hooks/useTranslation.js'
import { Button, Modal, Space, theme } from 'antd'

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
  ...props
}) => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const modalProps = props
  const width = dialogWidth ?? 'fit-content'
  const isErrorConfirm = confirmButtonColor === 'error'
  const isFilledConfirm = confirmButtonColor === 'primary' || isErrorConfirm
  const dialogStyles = getConfirmationDialogStyles(token, Boolean(dialogWidth), confirmButtonColor)

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

      <Space style={dialogStyles.footer}>
        <Button onClick={onClose} style={dialogStyles.cancelButton}>
          {t('button.cancel')}
        </Button>
        <Button
          type={isFilledConfirm ? 'primary' : 'default'}
          danger={isErrorConfirm}
          loading={confirmButtonLoading}
          onClick={onConfirm}
          style={dialogStyles.confirmButton}
        >
          {confirmButtonText || t('button.confirm')}
        </Button>
      </Space>
    </Modal>
  )
}

export default ConfirmationDialog
