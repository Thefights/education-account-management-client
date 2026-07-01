import { Avatar, Space, Tag, Typography } from 'antd'

const avatarColors = ['#1677ff', '#13c2c2', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96']

const getAvatarColor = (text = '') => {
  const charSum = String(text)
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return avatarColors[charSum % avatarColors.length]
}

const getInitials = (text = '') => {
  const words = String(text).trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '-'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
}

export const EntityAvatar = ({ name, size = 28 }) => (
  <Avatar
    size={size}
    style={{
      flex: '0 0 auto',
      backgroundColor: getAvatarColor(name),
      fontSize: size <= 20 ? 10 : 12,
      fontWeight: 700,
    }}
  >
    {getInitials(name)}
  </Avatar>
)

export const CompactEntityLabel = ({ name }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
    <EntityAvatar name={name} size={18} />
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
  </span>
)

export const CourseStudentTableLabel = ({ name }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
    <EntityAvatar name={name} />
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
  </span>
)

export const CourseStudentOptionLabel = ({ student }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <EntityAvatar name={student.fullName || student.accountNumber} />
    <div style={{ minWidth: 0 }}>
      <Space size={6} wrap>
        {student.fullName && <Typography.Text strong>{student.fullName}</Typography.Text>}
        {student.accountNumber && <Typography.Text code>{student.accountNumber}</Typography.Text>}
      </Space>
      <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
        {[student.nric, student.email, student.phoneNumber].filter(Boolean).join(' · ') || '-'}
      </Typography.Text>
    </div>
  </div>
)

export const CourseFasSchemeOptionLabel = ({ scheme }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <EntityAvatar name={scheme.schemeName || scheme.schemeCode} />
    <div style={{ minWidth: 0 }}>
      <Space size={6} wrap>
        <Typography.Text strong>{scheme.schemeName}</Typography.Text>
        {scheme.schemeCode && <Typography.Text code>{scheme.schemeCode}</Typography.Text>}
        {scheme.status && (
          <Tag color={scheme.status === 'Active' ? 'green' : 'default'}>{scheme.status}</Tag>
        )}
      </Space>
      <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
        {scheme.subsidyType || '-'} · {scheme.isPerComponent ? 'Per component' : 'Standard'} ·{' '}
        {scheme.durationInMonths || 0} months
      </Typography.Text>
    </div>
  </div>
)
