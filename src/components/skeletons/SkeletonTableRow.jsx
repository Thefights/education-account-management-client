import { Skeleton, Space } from 'antd'

const lineWidths = [92, 86, 78]

const SkeletonTableRow = ({ rows = 3, lineCount = 3 }) => {
	const lines = Array.from({ length: lineCount })
	const rowArr = Array.from({ length: rows })

	return (
		<Space
			orientation='vertical'
			size={12}
			style={{
				width: '100%',
				padding: '12px 0',
			}}
		>
			{rowArr.map((_, i) => (
				<Space key={i} orientation='vertical' style={{ width: '100%' }} size='small'>
					{lines.map((__, idx) => (
						<Skeleton.Input
							key={idx}
							active
							block
							style={{
								width: `${lineWidths[idx % lineWidths.length]}%`,
								height: 16,
							}}
						/>
					))}
				</Space>
			))}
		</Space>
	)
}

export default SkeletonTableRow
