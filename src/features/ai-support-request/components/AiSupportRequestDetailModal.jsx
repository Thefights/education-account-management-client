import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Modal } from 'antd'
import AiSupportRequestDetailPanel from './AiSupportRequestDetailPanel'

const AiSupportRequestDetailModal = ({ request, open, onClose, showAccountHolder = false }) => {
  const { t } = useTranslation()

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={t('ai_support_request.title.detail')}
      width={760}
      destroyOnHidden
      footer={<Button onClick={onClose}>{t('button.close')}</Button>}
    >
      <div style={{ marginTop: 12 }}>
        <AiSupportRequestDetailPanel
          request={request}
          showAccountHolder={showAccountHolder}
        />
      </div>
    </Modal>
  )
}

export default AiSupportRequestDetailModal
