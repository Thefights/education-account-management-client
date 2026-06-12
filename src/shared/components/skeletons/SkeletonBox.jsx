import { Skeleton, Space } from 'antd'

/**
 * @param {Object} props
 * @param {number} props.numberOfBoxes
 * @param {'vertical' | 'horizontal'} props.direction
 * @param {number[]} props.heights
 * @param {boolean} props.rounded
 */
const SkeletonBox = ({
	numberOfBoxes = 3,
	direction = 'vertical',
	heights = [100, 200, 300],
	rounded = false,
}) => {
	const items = Array.from({ length: numberOfBoxes }).map((_, index) => ({
		height: heights[index % heights.length] || 200,
	}))

	return (
		<Space orientation={direction} style={{ width: '100%' }} size='large'>
			{items.map((item, index) => (
				<Skeleton
					key={index}
					block
					style={{
						height: item.height,
						width: '100%',
						borderRadius: rounded ? 8 : 0,
					}}
				/>
			))}
		</Space>
	)
}

export default SkeletonBox
