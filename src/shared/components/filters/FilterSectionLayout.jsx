import { Card, Flex, Row, Space } from 'antd'

const FilterSectionLayout = ({
  children,
  actions,
  onEnterFilter,
  cardProps = {},
  rowProps = {},
  actionFlexProps = {},
  actionSpaceProps = {},
  gutter = [16, 16],
  align = 'bottom',
}) => {
  const handleKeyDownCapture = (event) => {
    if (event.key !== 'Enter' || !onEnterFilter) return
    if (event.target?.tagName === 'TEXTAREA') return
    event.preventDefault()
    onEnterFilter(event)
  }

  const content = (
    <Flex vertical gap={16} onKeyDownCapture={handleKeyDownCapture}>
      <Row gutter={gutter} align={align} {...rowProps}>
        {children}
      </Row>
      {actions && (
        <Flex justify="end" wrap="wrap" {...actionFlexProps}>
          <Space wrap {...actionSpaceProps}>
            {actions}
          </Space>
        </Flex>
      )}
    </Flex>
  )

  if (cardProps === false) return content

  const { size = 'small', ...restCardProps } = cardProps

  return (
    <Card size={size} {...restCardProps}>
      {content}
    </Card>
  )
}

export default FilterSectionLayout
