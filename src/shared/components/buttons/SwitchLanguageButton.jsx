import useTranslation from '@/shared/hooks/useTranslation'
import { GlobalOutlined } from '@ant-design/icons'
import { Button, Dropdown, Space, Typography } from 'antd'

const SwitchLanguageButton = () => {
  const { language, setLanguage } = useTranslation()

  const items = [
    {
      key: 'en',
      label: 'English (EN)',
      onClick: () => setLanguage('en'),
    },
    {
      key: 'vi',
      label: 'Tiếng Việt (VI)',
      onClick: () => setLanguage('vi'),
    },
    {
      key: 'zh',
      label: '中文 (ZH)',
      onClick: () => setLanguage('zh'),
    },
  ]

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
      <Button
        type="default"
        size="large"
        style={{
          paddingLeft: 10,
          paddingRight: 10,
          borderRadius: 999,
          border: '2px solid',
        }}
      >
        <Space size={8}>
          <GlobalOutlined />
          <Typography.Text style={{ fontWeight: 600, textTransform: 'uppercase' }}>
            {language}
          </Typography.Text>
        </Space>
      </Button>
    </Dropdown>
  )
}

export default SwitchLanguageButton
