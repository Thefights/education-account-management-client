import { ConfirmationContext } from '@/app/providers/ConfirmationContext'
import { useContext } from 'react'

/**
 * @typedef {Object} ConfirmOptions
 * @property {string} title
 * @property {string|import('react').ReactNode} description
 * @property {'primary'|'error'|'warning'|'info'|'success'|'default'} confirmColor
 * @property {string} confirmText
 * @property {boolean} confirmLoading
 * @property {boolean} disableBackdropClose
 * @property {boolean} keyboard
 * @property {number|string} width
 */

/**
 * @returns {(options: ConfirmOptions) => Promise<boolean>}
 */
export default function useConfirm() {
  const ctx = useContext(ConfirmationContext)
  if (!ctx) throw new Error('useConfirm must be used within <ConfirmationProvider/>')

  return (options) => ctx(options)
}
