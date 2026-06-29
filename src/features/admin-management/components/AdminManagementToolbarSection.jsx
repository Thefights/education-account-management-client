import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Flex, Space } from 'antd'

const AdminManagementToolbarSection = ({ onCreate, onImport }) => {
  const { t } = useTranslation()

  return (
    <Flex justify="end">
      <Space wrap>
        <Button onClick={onImport}>{t('button.import')}</Button>
        <Button type="primary" onClick={onCreate}>
          {t('button.create')}
        </Button>
      </Space>
    </Flex>
  )
}

export default AdminManagementToolbarSection
