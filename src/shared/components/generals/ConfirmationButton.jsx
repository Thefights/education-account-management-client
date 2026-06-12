import useConfirm from '@/shared/hooks/useConfirm'
import { Button } from 'antd'

/**
 * @typedef {Object} CustomProps
 * @property {string} props.confirmationTitle
 * @property {string} props.confirmationDescription
 * @property {number|string} props.dialogWidth
 * @property {string} props.confirmButtonText
 * @property {'primary'|'error'|'warning'|'info'|'success'|'default'} props.confirmButtonColor
 * @property {function} props.onConfirm
 */

/**
 * @param {Button.ButtonProps & CustomProps} props
 */
const ConfirmationButton = ({
  confirmationTitle,
  confirmationDescription,
  confirmButtonColor = 'primary',
  confirmButtonText,
  dialogWidth,
  onConfirm,
  children,
  ...props
}) => {
  const confirm = useConfirm()

  const handleClick = async () => {
    const isConfirmed = await confirm({
      title: confirmationTitle,
      description: confirmationDescription,
      confirmColor: confirmButtonColor,
      confirmText: confirmButtonText,
      width: dialogWidth,
    })

    if (isConfirmed && onConfirm) {
      onConfirm()
    }
  }

  return (
    <Button type="primary" {...props} onClick={handleClick}>
      {children}
    </Button>
  )
}
export default ConfirmationButton
