import { Card, Flex, Typography } from 'antd'
import { AppstoreOutlined } from '@ant-design/icons'
import { getImageFromCloud } from '@/utils/commons'

const ProductAppCard = ({ app, action }) => {
  // Use app.icon if it exists, otherwise provide a default icon
  const Icon = app.icon || AppstoreOutlined
  const imagePath = app.imageUrl
  const imageUrl = getImageFromCloud(imagePath)

  return (
    <Card
      hoverable
      style={{
        height: '100%',
        borderRadius: 8,
        border: '1px solid var(--app-border-color)',
        boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
      }}
      styles={{ body: { padding: 12 } }}
    >
      <Flex vertical gap={18}>
        <Flex align="flex-start" justify="space-between" gap={12}>
          <Typography.Title level={4} style={{ margin: '16px 0 0 20px', fontWeight: 700, flex: 1 }}>
            {app.name}
          </Typography.Title>
          {action && <div style={{ marginTop: 10, marginRight: 8, flexShrink: 0 }}>{action}</div>}
        </Flex>

        <Flex
          align="center"
          justify="center"
          style={{
            position: 'relative',
            minHeight: 310,
            borderRadius: 8,
            overflow: 'hidden',
            background: app.background,
          }}
        >
          {/* If there's an imageUrl from backend, show the image */}
          {imagePath ? (
            <img
              src={imageUrl}
              alt={app.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.82))',
                }}
              />
              <Icon
                style={{
                  position: 'relative',
                  fontSize: 128,
                  color: '#111827',
                  filter: `drop-shadow(-12px 10px 0 ${app.accent || '#7b83d8'})`, // Provide fallback accent
                }}
              />
            </>
          )}
        </Flex>
      </Flex>
    </Card>
  )
}

export default ProductAppCard
