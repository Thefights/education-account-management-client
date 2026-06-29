import { Card, Flex, Row, Space } from 'antd'

const FilterSectionLayout = ({
  children,
  actions,
  cardProps = {},
  rowProps = {},
  actionFlexProps = {},
  actionSpaceProps = {},
  gutter = [16, 16],
  align = 'bottom',
}) => {
  const content = (
    <Flex vertical gap={16}>
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
