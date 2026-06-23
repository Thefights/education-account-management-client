import useTranslation from '@/shared/hooks/useTranslation'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Flex } from 'antd'

const EnrollmentManagementToolbarSection = ({
  onAssign,
  onDeleteSelected,
  selectedIds = [],
  loading = false,
}) => {
  const { t } = useTranslation()

  return (
    <Flex justify="flex-end" gap={8} style={{ marginBottom: 16 }}>
      {selectedIds.length > 0 && (
        <Button danger loading={loading} onClick={onDeleteSelected}>
          {t('enrollment_management.action.delete_selected')} ({selectedIds.length})
        </Button>
      )}
      <Button type="primary" icon={<PlusOutlined />} onClick={onAssign}>
        {t('enrollment_management.title.assign_students')}
      </Button>
    </Flex>
  )
}

export default EnrollmentManagementToolbarSection
