import useTranslation from '@/shared/hooks/useTranslation'
import { ArrowRightOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Empty, Flex, Row, Skeleton, Table, Tag, Typography, theme } from 'antd'

const chartColors = ['#2563eb', '#14b8a6', '#f59e0b', '#e5e7eb', '#ef4444', '#8b5cf6']

export const DashboardPage = ({ title, eyebrow, description, children, action }) => {
  const { token } = theme.useToken()

  return (
    <Flex vertical gap={24}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
        <div>
          {eyebrow ? (
            <Typography.Text
              strong
              style={{
                display: 'block',
                color: token.colorPrimary,
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              {eyebrow}
            </Typography.Text>
          ) : null}
          <Typography.Title level={1} style={{ margin: 0, fontSize: 'clamp(30px, 4vw, 44px)' }}>
            {title}
          </Typography.Title>
          {description ? (
            <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 16 }}>
              {description}
            </Typography.Text>
          ) : null}
        </div>
        {action}
      </Flex>
      {children}
    </Flex>
  )
}

export const DashboardState = ({ loading, error, children }) => {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    )
  }

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message={t('dashboard.common.load_failed')}
        description={t('dashboard.common.load_failed_description')}
      />
    )
  }

  return children
}

export const DashboardKpiCard = ({ title, value, subtitle, icon, tone = 'blue' }) => {
  const { token } = theme.useToken()
  const toneMap = {
    blue: { bg: token.colorPrimaryBg, color: token.colorPrimary },
    green: { bg: token.colorSuccessBg, color: token.colorSuccess },
    orange: { bg: token.colorWarningBg, color: token.colorWarning },
    red: { bg: token.colorErrorBg, color: token.colorError },
  }
  const colorSet = toneMap[tone] || toneMap.blue

  return (
    <Card style={{ height: '100%', borderRadius: 18, overflow: 'hidden' }}>
      <Flex justify="space-between" gap={16}>
        <Flex vertical gap={18} style={{ minWidth: 0 }}>
          <Typography.Text strong type="secondary">
            {title}
          </Typography.Text>
          <Typography.Title level={2} style={{ margin: 0, fontSize: 34 }}>
            {value}
          </Typography.Title>
          {subtitle ? <Typography.Text type="secondary">{subtitle}</Typography.Text> : null}
        </Flex>
        {icon ? (
          <Flex
            align="center"
            justify="center"
            style={{
              width: 48,
              height: 48,
              flex: '0 0 48px',
              borderRadius: 16,
              background: colorSet.bg,
              color: colorSet.color,
              fontSize: 22,
            }}
          >
            {icon}
          </Flex>
        ) : null}
      </Flex>
    </Card>
  )
}

export const DashboardSectionCard = ({ title, description, action, children }) => (
  <Card style={{ height: '100%', borderRadius: 18 }}>
    <Flex vertical gap={18}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: action ? 'minmax(0, 1fr) auto' : '1fr',
          columnGap: 16,
          rowGap: 4,
          alignItems: 'start',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
        </div>
        {action ? <div style={{ justifySelf: 'end', whiteSpace: 'nowrap' }}>{action}</div> : null}
        {description ? (
          <Typography.Text
            type="secondary"
            style={{
              display: 'block',
              gridColumn: '1 / -1',
            }}
          >
            {description}
          </Typography.Text>
        ) : null}
      </div>
      {children}
    </Flex>
  </Card>
)

export const DashboardLinkButton = ({ children, onClick }) => (
  <Button type="link" onClick={onClick} style={{ paddingInline: 0, fontWeight: 700 }}>
    {children} <ArrowRightOutlined />
  </Button>
)

export const DashboardDonutBreakdown = ({ totalLabel, total, items = [] }) => {
  const { token } = theme.useToken()
  const normalizedTotal = items.reduce((sum, item) => sum + Number(item.count || 0), 0)
  const segmentPercents = items.map((item) => {
    const value = Number(item.count || 0)
    return normalizedTotal > 0 ? (value / normalizedTotal) * 100 : 0
  })

  return (
    <Row gutter={[24, 20]} align="middle">
      <Col xs={24} md={10}>
        <div style={{ position: 'relative', width: 210, maxWidth: '100%', aspectRatio: '1 / 1' }}>
          <svg viewBox="0 0 42 42" width="100%" height="100%">
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke={token.colorFillSecondary} strokeWidth="5" />
            {items.map((item, index) => {
              const percent = segmentPercents[index]
              const dashOffset =
                25 - segmentPercents.slice(0, index).reduce((sum, item) => sum + item, 0)
              return (
                <circle
                  key={item.label}
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke={chartColors[index % chartColors.length]}
                  strokeWidth="5"
                  strokeDasharray={`${percent} ${100 - percent}`}
                  strokeDashoffset={dashOffset}
                />
              )
            })}
          </svg>
          <Flex
            vertical
            align="center"
            justify="center"
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          >
            <Typography.Title level={2} style={{ margin: 0 }}>
              {total}
            </Typography.Title>
            <Typography.Text type="secondary">{totalLabel}</Typography.Text>
          </Flex>
        </div>
      </Col>
      <Col xs={24} md={14}>
        <Flex vertical gap={10}>
          {items.map((item, index) => (
            <Flex
              key={item.label}
              justify="space-between"
              align="center"
              gap={12}
              style={{
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: 12,
                padding: '9px 12px',
                background: token.colorFillQuaternary,
              }}
            >
              <Flex align="center" gap={10} style={{ minWidth: 0 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 4,
                    background: chartColors[index % chartColors.length],
                    flex: '0 0 auto',
                  }}
                />
                <Typography.Text ellipsis>{item.label}</Typography.Text>
              </Flex>
              <Typography.Text strong>{item.count}</Typography.Text>
            </Flex>
          ))}
        </Flex>
      </Col>
    </Row>
  )
}

export const DashboardStatusList = ({ items = [] }) => {
  const { token } = theme.useToken()

  if (!items.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />

  return (
    <Flex vertical>
      {items.map((item, index) => (
        <Flex
          key={`${item.label}-${index}`}
          justify="space-between"
          align="center"
          gap={12}
          style={{
            padding: '14px 0',
            borderBottom: index === items.length - 1 ? 'none' : `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Flex align="center" gap={14} style={{ minWidth: 0 }}>
            <Flex
              align="center"
              justify="center"
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: item.background || token.colorFillSecondary,
                color: item.color || token.colorText,
                fontWeight: 800,
              }}
            >
              {item.count}
            </Flex>
            <div style={{ minWidth: 0 }}>
              <Typography.Text strong ellipsis style={{ display: 'block' }}>
                {item.label}
              </Typography.Text>
              {item.description ? (
                <Typography.Text type="secondary" ellipsis style={{ display: 'block' }}>
                  {item.description}
                </Typography.Text>
              ) : null}
            </div>
          </Flex>
          {item.status ? <Tag color={item.statusColor || 'default'}>{item.status}</Tag> : null}
        </Flex>
      ))}
    </Flex>
  )
}

export const DashboardMiniTrend = ({ points = [], valueKey = 'count' }) => {
  const { token } = theme.useToken()
  const values = points.map((point) => Number(point[valueKey] || 0))
  const max = Math.max(...values, 1)

  if (!points.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />

  return (
    <Flex align="end" gap={8} style={{ minHeight: 150, paddingTop: 16 }}>
      {points.slice(-14).map((point) => {
        const value = Number(point[valueKey] || 0)
        return (
          <Flex
            key={point.date}
            vertical
            justify="end"
            align="center"
            gap={8}
            style={{ flex: 1, minWidth: 12 }}
          >
            <div
              title={`${point.date}: ${value}`}
              style={{
                width: '100%',
                minWidth: 8,
                maxWidth: 26,
                height: Math.max(10, (value / max) * 118),
                borderRadius: 8,
                background: token.colorPrimary,
              }}
            />
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              {String(point.date || '').slice(5)}
            </Typography.Text>
          </Flex>
        )
      })}
    </Flex>
  )
}

export const DashboardLineTrend = ({ points = [], series = [], maxPoints = 14 }) => {
  const { token } = theme.useToken()
  const visiblePoints = points.slice(-maxPoints)
  const chartMinWidth = Math.max(visiblePoints.length * 96, 620)
  const width = chartMinWidth
  const height = 260
  const padding = { top: 18, right: 18, bottom: 44, left: 18 }
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom

  if (!visiblePoints.length || !series.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />

  const xForIndex = (index) =>
    padding.left + (visiblePoints.length === 1 ? innerWidth / 2 : (index / (visiblePoints.length - 1)) * innerWidth)

  const maxBySeries = series.reduce((result, item) => {
    const values = visiblePoints.map((point) => Number(point[item.key] || 0))
    const scaleMax = Number(item.scaleMax || 0)
    return { ...result, [item.key]: Math.max(scaleMax, ...values, 1) }
  }, {})

  const yForValue = (value, key) => {
    const normalized = Number(value || 0) / maxBySeries[key]
    return padding.top + innerHeight - normalized * innerHeight
  }

  const buildPath = (item) =>
    visiblePoints
      .map((point, index) => {
        const x = xForIndex(index)
        const y = yForValue(point[item.key], item.key)
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')

  return (
    <Flex vertical gap={14}>
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Dashboard line trend"
          style={{ display: 'block', minWidth: chartMinWidth }}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + innerHeight * ratio
            return (
              <line
                key={ratio}
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke={token.colorBorderSecondary}
                strokeWidth="1"
              />
            )
          })}
          {series.map((item) => (
            <path
              key={item.key}
              d={buildPath(item)}
              fill="none"
              stroke={item.color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {series.map((item) =>
            visiblePoints.map((point, index) => {
              const value = Number(point[item.key] || 0)
              const label = item.formatValue ? item.formatValue(value) : value

              return (
                <circle
                  key={`${item.key}-${point.date}`}
                  cx={xForIndex(index)}
                  cy={yForValue(value, item.key)}
                  r={item.showMarkers === false ? 0 : 5}
                  fill={item.color}
                >
                  <title>{`${point.date} ${item.label}: ${label}`}</title>
                </circle>
              )
            })
          )}
          {visiblePoints.map((point, index) => (
            <text
              key={point.date}
              x={xForIndex(index)}
              y={height - 14}
              textAnchor="middle"
              fill={token.colorTextSecondary}
              fontSize="12"
            >
              {String(point.date || '').slice(5)}
            </text>
          ))}
        </svg>
      </div>
      <Flex
        wrap="wrap"
        style={{
          columnGap: 28,
          rowGap: 10,
        }}
      >
        {series.map((item) => (
          <Flex key={item.key} align="center" gap={10}>
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: 999,
                background: item.color,
                flexShrink: 0,
              }}
            />
            <Typography.Text type="secondary">{item.label}</Typography.Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  )
}

export const DashboardGroupedTrend = ({ points = [], series = [], maxPoints = 14 }) => {
  const { token } = theme.useToken()
  const visiblePoints = points.slice(-maxPoints)
  const values = visiblePoints.flatMap((point) =>
    series.map((item) => Number(point[item.key] || 0))
  )
  const maxValue = Math.max(...values, 1)
  const chartMinWidth = Math.max(visiblePoints.length * 54, 520)

  if (!visiblePoints.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />

  return (
    <Flex vertical gap={16}>
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <Flex align="end" gap={14} style={{ minHeight: 180, minWidth: chartMinWidth, paddingTop: 8 }}>
          {visiblePoints.map((point) => (
            <Flex
              key={point.date}
              vertical
              justify="end"
              align="center"
              gap={8}
              style={{ flex: 1, minWidth: 42 }}
            >
              <Flex
                align="end"
                justify="center"
                gap={5}
                style={{
                  width: '100%',
                  minHeight: 134,
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  paddingInline: 2,
                }}
              >
                {series.map((item) => {
                  const value = Number(point[item.key] || 0)
                  const height = value > 0 ? Math.max(8, (value / maxValue) * 126) : 0

                  return (
                    <div
                      key={item.key}
                      title={`${point.date} ${item.label}: ${value}`}
                      style={{
                        width: 10,
                        height,
                        borderRadius: '8px 8px 0 0',
                        background: item.color,
                      }}
                    />
                  )
                })}
              </Flex>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                {String(point.date || '').slice(5)}
              </Typography.Text>
            </Flex>
          ))}
        </Flex>
      </div>
      <Flex
        wrap="wrap"
        style={{
          columnGap: 28,
          rowGap: 10,
          marginTop: 4,
        }}
      >
        {series.map((item) => (
          <Flex key={item.key} align="center" gap={10}>
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: 4,
                background: item.color,
                flexShrink: 0,
              }}
            />
            <Typography.Text type="secondary">{item.label}</Typography.Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  )
}

export const DashboardDataTable = ({ columns, dataSource, rowKey = 'id' }) => (
  <Table
    size="middle"
    rowKey={rowKey}
    columns={columns}
    dataSource={dataSource}
    pagination={false}
    locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
    scroll={{ x: true }}
  />
)
