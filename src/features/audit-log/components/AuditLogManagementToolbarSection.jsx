import useTranslation from '@/shared/hooks/useTranslation'
import { DownloadOutlined } from '@ant-design/icons'
import { Button, Flex } from 'antd'

const AuditLogManagementToolbarSection = ({ onExport }) => {
  const { t } = useTranslation()

  return (
    <Flex justify="end" align="center" gap={12} wrap="wrap">
      <Button icon={<DownloadOutlined />} onClick={onExport}>
        {t('audit_log.button.export')}
      </Button>
    </Flex>
  )
}

export default AuditLogManagementToolbarSection
