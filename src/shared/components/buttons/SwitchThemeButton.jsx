import { useLocalStorage } from '@/shared/hooks/useStorage'
import useTranslation from '@/shared/hooks/useTranslation'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'

const SwitchThemeButton = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  const { t } = useTranslation()

  return (
    <Tooltip title={t(theme === 'light' ? 'tooltip.switch_dark' : 'tooltip.switch_light')}>
      <Button
        type="text"
        size="large"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
        style={{ borderRadius: 10, border: '1px solid var(--app-border-color)' }}
      />
    </Tooltip>
  )
}

export default SwitchThemeButton
