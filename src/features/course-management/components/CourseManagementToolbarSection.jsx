import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Flex, Space } from 'antd'

const CourseManagementToolbarSection = ({
  onCreate,
  onImport,
  onPublish,
  onDeleteSelected,
  selectedIds,
  loading,
}) => {
  const { t } = useTranslation()

  return (
    <Flex justify="end">
      <Space wrap>
        <Button loading={loading} disabled={!selectedIds?.length} onClick={onPublish}>
          {t('course_management.action.publish')}
        </Button>
        <Button danger loading={loading} disabled={!selectedIds?.length} onClick={onDeleteSelected}>
          {t('course_management.action.delete_selected')}
        </Button>
        <Button onClick={onImport}>{t('button.import')}</Button>
        <Button type="primary" onClick={onCreate}>
          {t('button.create')}
        </Button>
      </Space>
    </Flex>
  )
}

export default CourseManagementToolbarSection
