import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Flex } from 'antd'

const CourseManagementToolbarSection = ({ onCreate }) => {
  const { t } = useTranslation()

  return (
    <Flex justify="end">
      <Button type="primary" onClick={onCreate}>
        {t('button.create')}
      </Button>
    </Flex>
  )
}

export default CourseManagementToolbarSection
