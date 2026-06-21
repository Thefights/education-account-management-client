import { ImportOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Flex, Space } from 'antd'
import useTranslation from '@/shared/hooks/useTranslation'

const EServiceAccountsToolbarSection = ({ onImport, onCreate }) => {
  const { t } = useTranslation()

  return (
    <Flex justify="end">
      <Space>
        <Button icon={<ImportOutlined />} onClick={onImport}>
          {t('education_account.batch_import')}
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          {t('button.create')}
        </Button>
      </Space>
    </Flex>
  )
}

export default EServiceAccountsToolbarSection
