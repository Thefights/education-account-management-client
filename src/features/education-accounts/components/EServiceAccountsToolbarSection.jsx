import useTranslation from '@/shared/hooks/useTranslation'
import { ImportOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Flex, Space } from 'antd'

const EServiceAccountsToolbarSection = ({
  onImport,
  onCreate,
  selectedIds,
  onChangeStatus,
  loading,
}) => {
  const { t } = useTranslation()

  return (
    <Flex justify="end">
      <Space wrap>
        <Button loading={loading} disabled={!selectedIds?.length} onClick={() => onChangeStatus(1)}>
          {t('button.activate')}
        </Button>
        <Button
          danger
          loading={loading}
          disabled={!selectedIds?.length}
          onClick={() => onChangeStatus(3)}
        >
          {t('button.deactivate')}
        </Button>
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
