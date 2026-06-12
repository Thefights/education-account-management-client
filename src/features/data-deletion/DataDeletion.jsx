import { Card, Space, Typography } from 'antd'

const { Title, Paragraph, Text } = Typography

export default function DataDeletion() {
  return (
    <div style={{ minHeight: '100vh', padding: 24, background: '#f5f7fa' }}>
      <Card style={{ maxWidth: 800, margin: '40px auto' }}>
        <Space direction="vertical" size="middle">
          <Title level={2}>User Data Deletion Instructions</Title>

          <Paragraph>
            If you signed in to AvePoint MOS Platform using Facebook Login and would like your data
            deleted, please contact us by email.
          </Paragraph>

          <Paragraph>
            Send your deletion request to:
            <br />
            <Text strong>c-sterling.quach@avepoint.com</Text>
          </Paragraph>

          <Paragraph>
            Please include your name and the email address associated with your Facebook account so
            we can identify your account.
          </Paragraph>

          <Paragraph>
            After receiving your request, we will delete all associated Facebook login data from our
            system within 30 days.
          </Paragraph>

          <Paragraph type="secondary">Last updated: {new Date().getFullYear()}</Paragraph>
        </Space>
      </Card>
    </div>
  )
}
