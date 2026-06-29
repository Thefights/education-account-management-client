import useConfirm from './useConfirm'
import useTranslation from './useTranslation'

export default function useReasonConfirm() {
  const confirm = useConfirm()
  const { t } = useTranslation()

  return async (options = {}) => {
    const result = await confirm({
      ...options,
      reasonRequired: true,
      reasonLabel: options.reasonLabel || t('text.reason'),
      reasonPlaceholder: options.reasonPlaceholder || t('text.reason_placeholder'),
      reasonMinLength: options.reasonMinLength ?? 10,
      reasonMaxLength: options.reasonMaxLength ?? 500,
      width: options.width ?? 520,
    })

    return result?.confirmed ? result.reason : null
  }
}
