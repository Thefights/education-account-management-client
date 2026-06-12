import { defaultAuthAccountStatusStyle } from '@/configs/defaultStylesConfig'
import useEnum from '@/hooks/useEnum'
import useTranslation from '@/hooks/useTranslation'
import { getEnumLabelByValue, renderEmptyFallback } from '@/utils/handleStringUtil'
import { Tag, theme } from 'antd'
import { useMemo } from 'react'

const ProfileInfoGridSection = ({ profile }) => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const _enum = useEnum()

  const rows = useMemo(
    () => [
      { key: 'fullName', label: t('profile.field.displayName') },
      { key: 'userIdText', label: t('profile.field.userId') },
      { key: 'email', label: t('profile.field.email') },
      {
        key: 'gender',
        label: t('profile.field.gender'),
        render: (value) => getEnumLabelByValue(_enum.genderOptions, value),
      },
      { key: 'phoneNumber', label: t('profile.field.phone') },
      {
        key: 'status',
        label: t('profile.field.status'),
        render: (value) => (
          <Tag color={defaultAuthAccountStatusStyle(value)}>
            {renderEmptyFallback(
              getEnumLabelByValue(_enum.authAccountStatusOptions, value) || value
            )}
          </Tag>
        ),
      },
    ],
    [t, _enum.authAccountStatusOptions, _enum.genderOptions]
  )

  return (
    <div style={{ width: '100%', maxWidth: 500, margin: '0 auto' }}>
      {rows.map(({ key, label, render }) => (
        <div
          key={key}
          style={{ display: 'grid', gridTemplateColumns: '170px minmax(0, 1fr)', minHeight: 40 }}
        >
          <div
            style={{
              background: token.colorFillQuaternary,
              borderBottom: `1px solid ${token.colorBgContainer}`,
              color: token.colorTextSecondary,
              fontWeight: 600,
              padding: '9px 12px',
            }}
          >
            {label}
          </div>
          <div
            style={{
              borderBottom: `1px solid ${token.colorFillQuaternary}`,
              color: token.colorText,
              overflowWrap: 'anywhere',
              padding: '9px 12px',
            }}
          >
            {renderEmptyFallback(render ? render(profile[key]) : profile[key])}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProfileInfoGridSection
