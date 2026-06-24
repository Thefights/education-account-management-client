import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Flex } from 'antd'

const TopupConfigurationToolbarSection = ({ onCreate, loading }) => {
  const { t } = useTranslation()

  return (
    <Flex justify="end">
      <Button type="primary" loading={loading} onClick={onCreate}>
        {t('button.create')}
      </Button>
    </Flex>
  )
}

export default TopupConfigurationToolbarSection
