import { MenuOutlined } from '@ant-design/icons'
import { Button } from 'antd'

const MobileMenuButton = ({ onOpen }) => (
	<Button
		type='text'
		size='large'
		shape='circle'
		icon={<MenuOutlined />}
		onClick={onOpen}
	/>
)

export default MobileMenuButton
