import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Flex } from 'antd'

const SchoolStudentToolbarSection = ({
  onAddClick,
  onImport,
  selectedIds,
  onChangeStatus,
  loading,
}) => {
  const { t } = useTranslation()

  return (
    <Flex justify="end" align="center" gap={12} wrap="wrap">
      <Button loading={loading} disabled={!selectedIds?.length} onClick={() => onChangeStatus(1)}>
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
      <Button onClick={onImport}>{t('button.import')}</Button>
      <Button type="primary" onClick={onAddClick}>
        {t('button.create')}
      </Button>
    </Flex>
  )
}

export default SchoolStudentToolbarSection
