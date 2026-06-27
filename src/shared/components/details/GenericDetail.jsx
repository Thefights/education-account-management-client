import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Card, Descriptions, Flex, Skeleton, Typography } from 'antd'
import { useMemo } from 'react'
import { getObjectValueFromStringPath } from '@/shared/utils/handleObjectUtil'
import { renderEmptyFallback } from '@/shared/utils/handleStringUtil'

const defaultColumn = { xs: 1, md: 2 }

const GenericDetail = ({
  title,
  data,
  fields = [],
  loading = false,
  onBack,
  extra,
  column = defaultColumn,
  bordered = true,
  cardProps,
  descriptionsProps,
}) => {
  const visibleFields = useMemo(
    () => fields.filter((field) => field && field.hidden !== true),
    [fields]
  )

  const renderValue = (field) => {
    const value = field.key ? getObjectValueFromStringPath(data || {}, field.key) : undefined

    if (field.render) return field.render(value, data)

    if (field.code || field.copyable) {
      return (
        <Typography.Text code={field.code} copyable={field.copyable}>
          {renderEmptyFallback(value)}
        </Typography.Text>
      )
    }

    return renderEmptyFallback(value)
  }

  return (
    <Card {...cardProps}>
      <Flex vertical gap={16}>
        {(title || onBack || extra) && (
          <Flex align="center" justify="space-between" gap={12} wrap>
            <Flex align="center" gap={12}>
              {onBack && <Button icon={<ArrowLeftOutlined />} onClick={onBack} />}
              {title && (
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {title}
                </Typography.Title>
              )}
            </Flex>
            {extra}
          </Flex>
        )}

        {loading && !data ? (
          <Skeleton active />
        ) : (
          <Descriptions
            bordered={bordered}
            column={column}
            {...descriptionsProps}
          >
            {visibleFields.map((field) => (
              <Descriptions.Item
                key={field.key || field.label}
                label={field.label ?? field.title}
                span={field.span}
              >
                {renderValue(field)}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Flex>
    </Card>
  )
}

export default GenericDetail
