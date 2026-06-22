import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Flex, Space } from 'antd'

const SchoolManagementToolbarSection = ({ onCreate, onImport, selectedIds, onChangeStatus, loading }) => {
  const { t } = useTranslation()

  return (
    <Flex justify="end">
      <Space wrap>
        <Button
          loading={loading}
          disabled={!selectedIds?.length}
          onClick={() => onChangeStatus(1)}
        >
          {t('button.activate')}
        </Button>
        <Button
          danger
          loading={loading}
          disabled={!selectedIds?.length}
          onClick={() => onChangeStatus(2)}
        >
          {t('button.deactivate')}
        </Button>
        <Button onClick={onImport}>
          {t('button.import')}
        </Button>
        <Button type="primary" onClick={onCreate}>
          {t('button.create')}
        </Button>
      </Space>
    </Flex>
  )
}

export default SchoolManagementToolbarSection
