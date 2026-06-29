import { Card, Col, Flex, Row, Space } from 'antd'

const FilterSectionLayout = ({
  children,
  actions,
  cardProps = {},
  rowProps = {},
  actionColProps = { xs: 24 },
  actionFlexProps = {},
  actionSpaceProps = {},
  gutter = [16, 16],
  align = 'bottom',
}) => {
  const content = (
    <Row gutter={gutter} align={align} {...rowProps}>
      {children}
      {actions && (
        <Col {...actionColProps}>
          <Flex justify="end" {...actionFlexProps}>
            <Space {...actionSpaceProps}>{actions}</Space>
          </Flex>
        </Col>
      )}
    </Row>
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
