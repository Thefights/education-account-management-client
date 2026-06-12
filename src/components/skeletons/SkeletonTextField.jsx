import { Skeleton, Space } from 'antd'

const SkeletonTextField = ({ numberOfRow = 3, withTitle = false, withLabel = false }) => {
	return (
		<Space orientation='vertical' style={{ width: '100%' }} size='large'>
			{withTitle && <Skeleton.Input active block style={{ height: 50, width: 200 }} />}
			<Space orientation='vertical' style={{ width: '100%' }} size='middle'>
				{Array.from({ length: numberOfRow }).map((_, i) => (
					<Space key={i} orientation='vertical' style={{ width: '100%' }} size='small'>
						{withLabel && <Skeleton.Input active block style={{ height: 30, width: 100 }} />}
						<Skeleton.Input active block style={{ height: 50 }} />
					</Space>
				))}
			</Space>
		</Space>
	)
}

export default SkeletonTextField
