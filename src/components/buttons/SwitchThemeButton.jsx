import { useLocalStorage } from '@/hooks/useStorage'
import useTranslation from '@/hooks/useTranslation'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'

const SwitchThemeButton = () => {
	const [theme, setTheme] = useLocalStorage('theme', 'light')
	const { t } = useTranslation()

	return (
		<Tooltip title={t(theme === 'light' ? 'tooltip.switch_dark' : 'tooltip.switch_light')}>
			<Button
				type='text'
				size='large'
				onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
				icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
				style={{ borderRadius: 8 }}
			/>
		</Tooltip>
	)
}

export default SwitchThemeButton
