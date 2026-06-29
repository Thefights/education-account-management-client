import useTranslation from '@/shared/hooks/useTranslation'
import { DownloadOutlined } from '@ant-design/icons'
import { Button, Flex } from 'antd'

const ManagementActionLogManagementToolbarSection = ({ onExport }) => {
  const { t } = useTranslation()

  return (
    <Flex justify="flex-end" gap={8} wrap="wrap">
      <Button icon={<DownloadOutlined />} onClick={onExport}>
        {t('management_action_log.button.export')}
      </Button>
    </Flex>
  )
}

export default ManagementActionLogManagementToolbarSection
