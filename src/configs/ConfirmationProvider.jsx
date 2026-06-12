import { useCallback, useEffect, useRef, useState } from 'react'
import ConfirmationDialog from '../components/dialogs/commons/ConfirmationDialog'
import { ConfirmationContext } from './ConfirmationContext'

export default function ConfirmationProvider({ children }) {
  const [open, setOpen] = useState(false)
  const resolverRef = useRef(null)
  const [opts, setOpts] = useState({
    title: '',
    description: '',
    confirmColor: 'primary',
    confirmText: undefined,
    confirmLoading: false,
    disableBackdropClose: true,
    keyboard: false,
    width: undefined,
  })

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      if (resolverRef.current) {
        resolverRef.current(false)
      }

      setOpts({
        title: options.title ?? '',
        description: options.description ?? '',
        confirmColor: options.confirmColor ?? 'primary',
        confirmText: options.confirmText,
        confirmLoading: options.confirmLoading ?? false,
        disableBackdropClose: options.disableBackdropClose ?? true,
        keyboard: options.keyboard ?? false,
        width: options.width,
      })
      resolverRef.current = resolve
      setOpen(true)
    })
  }, [])

  const handleClose = useCallback((result) => {
    setOpen(false)
    if (resolverRef.current) {
      resolverRef.current(result)
      resolverRef.current = null
    }
  }, [])

  const onClose = useCallback(() => {
    handleClose(false)
  }, [handleClose])

  useEffect(() => {
    return () => {
      if (resolverRef.current) {
        resolverRef.current(false)
        resolverRef.current = null
      }
    }
  }, [])

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      <ConfirmationDialog
        open={open}
        onClose={onClose}
        onConfirm={() => handleClose(true)}
        title={opts.title}
        description={opts.description}
        confirmButtonText={opts.confirmText}
        confirmButtonColor={opts.confirmColor}
        confirmButtonLoading={opts.confirmLoading}
        dialogWidth={opts.width}
        keyboard={!opts.disableBackdropClose && opts.keyboard}
      />
    </ConfirmationContext.Provider>
  )
}
