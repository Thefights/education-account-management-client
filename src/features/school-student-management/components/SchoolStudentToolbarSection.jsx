import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Flex } from 'antd'

const SchoolStudentToolbarSection = ({ onAddClick, onImport }) => {
  const { t } = useTranslation()

  return (
    <Flex justify="end" align="center" gap={12} wrap="wrap">
      <Button onClick={onImport}>{t('button.import')}</Button>
      <Button type="primary" onClick={onAddClick}>
        {t('button.create')}
      </Button>
    </Flex>
  )
}

export default SchoolStudentToolbarSection
