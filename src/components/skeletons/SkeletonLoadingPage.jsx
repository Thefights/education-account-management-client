import { Skeleton, Space } from 'antd'
import SkeletonBox from './SkeletonBox'

const SkeletonLoadingPage = () => {
	return (
		<div
			style={{
				height: '100vh',
				overflow: 'hidden',
				padding: '16px',
			}}
		>
			<Space orientation='vertical' style={{ width: '100%', height: '100%' }} size='large'>
				<div>
					<Skeleton paragraph={{ rows: 3 }} />
				</div>
				<SkeletonBox direction='horizontal' numberOfBoxes={3} heights={[110]} rounded />
				<SkeletonBox numberOfBoxes={4} heights={[56]} />
				<div style={{ flex: 1, overflow: 'hidden' }}>
					<SkeletonBox direction='horizontal' numberOfBoxes={2} heights={[180]} rounded />
				</div>
			</Space>
		</div>
	)
}

export default SkeletonLoadingPage
