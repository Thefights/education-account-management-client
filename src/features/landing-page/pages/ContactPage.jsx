import useTranslation from '@/shared/hooks/useTranslation'
import {
  AlertOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons'
import { Badge, Card, theme, Typography } from 'antd'
import { useEffect, useState } from 'react'

const { Title, Paragraph } = Typography

const ContactPage = () => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const [isOnline, setIsOnline] = useState(true)

  // Simple logic to check if current time is within working hours (8:00 - 17:30, Mon-Fri)
  useEffect(() => {
    const checkWorkingHours = () => {
      const now = new Date()
      const day = now.getDay()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const time = hours + minutes / 60

      // Mon = 1, Fri = 5
      if (day >= 1 && day <= 5 && time >= 8 && time <= 17.5) {
        setIsOnline(true)
      } else {
        setIsOnline(false)
      }
    }
    checkWorkingHours()
    const interval = setInterval(checkWorkingHours, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ flex: 1, width: '100%', background: 'var(--app-bg)', padding: '80px 32px' }}>
      <div
        style={{ maxWidth: '896px', margin: '0 auto', textAlign: 'center', marginBottom: '64px' }}
      >
        <Title level={1} style={{ fontSize: '36px', fontWeight: 'bold' }}>
          {t('landing.contact.title')}
        </Title>
        <Paragraph
          style={{
            fontSize: '18px',
            color: 'var(--app-sider-text-muted)',
            maxWidth: '672px',
            margin: '0 auto',
          }}
        >
          {t('landing.contact.desc')}
        </Paragraph>

        {/* Live Status Indicator */}
        <div
          style={{
            marginTop: '24px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: isOnline ? 'rgba(82, 196, 26, 0.1)' : 'rgba(250, 140, 22, 0.1)',
            borderRadius: '24px',
            border: `1px solid ${isOnline ? token.colorSuccess : token.colorWarning}`,
          }}
        >
          <Badge
            status={isOnline ? 'success' : 'warning'}
            className={isOnline ? 'animate-pulse' : ''}
          />
          <span
            style={{
              color: isOnline ? token.colorSuccessText : token.colorWarningText,
              fontWeight: 500,
              fontSize: '14px',
            }}
          >
            {isOnline ? t('landing.contact.status_online') : t('landing.contact.status_offline')}
          </span>
        </div>
      </div>

      <div
        style={{
          maxWidth: '896px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        <Card
          style={{
            boxShadow: 'var(--app-card-shadow)',
            border: '1px solid var(--app-border-color)',
            borderRadius: '16px',
            background: 'var(--app-header-bg)',
          }}
          bodyStyle={{ padding: '48px' }}
        >
          <Title
            level={3}
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: token.colorPrimary,
              textAlign: 'center',
              borderBottom: `1px solid var(--app-border-color)`,
              paddingBottom: '24px',
              marginBottom: '32px',
            }}
          >
            Education Account Management System
          </Title>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: token.colorPrimaryBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <EnvironmentOutlined style={{ fontSize: '20px', color: token.colorPrimary }} />
              </div>
              <div>
                <h4
                  style={{
                    fontWeight: 600,
                    fontSize: '18px',
                    marginBottom: '4px',
                    color: token.colorText,
                  }}
                >
                  {t('landing.contact.office')}
                </h4>
                <p style={{ color: 'var(--app-sider-text-muted)', margin: 0 }}>
                  {t('landing.contact.office_address')}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: token.colorPrimaryBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MailOutlined style={{ fontSize: '20px', color: token.colorPrimary }} />
              </div>
              <div>
                <h4
                  style={{
                    fontWeight: 600,
                    fontSize: '18px',
                    marginBottom: '4px',
                    color: token.colorText,
                  }}
                >
                  {t('landing.contact.email')}
                </h4>
                <p style={{ color: 'var(--app-sider-text-muted)', margin: 0 }}>
                  {t('landing.contact.email_address')}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: token.colorPrimaryBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <PhoneOutlined style={{ fontSize: '20px', color: token.colorPrimary }} />
              </div>
              <div>
                <h4
                  style={{
                    fontWeight: 600,
                    fontSize: '18px',
                    marginBottom: '4px',
                    color: token.colorText,
                  }}
                >
                  {t('landing.contact.phone')}
                </h4>
                <p style={{ color: 'var(--app-sider-text-muted)', margin: 0 }}>
                  {t('landing.contact.phone_number')}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: token.colorPrimaryBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ClockCircleOutlined style={{ fontSize: '20px', color: token.colorPrimary }} />
              </div>
              <div>
                <h4
                  style={{
                    fontWeight: 600,
                    fontSize: '18px',
                    marginBottom: '4px',
                    color: token.colorText,
                  }}
                >
                  {t('landing.contact.time')}
                </h4>
                <p style={{ color: 'var(--app-sider-text-muted)', margin: 0 }}>
                  {t('landing.contact.time_details1')}
                </p>
                <p style={{ color: 'var(--app-sider-text-muted)', margin: 0 }}>
                  {t('landing.contact.time_details2')}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Emergency Support Card */}
        <div
          style={{
            background: `linear-gradient(135deg, ${token.colorErrorBg} 0%, rgba(255,241,240,0.4) 100%)`,
            border: `1px solid ${token.colorErrorBorder}`,
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            boxShadow: '0 10px 25px -5px rgba(255, 77, 79, 0.1)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: token.colorError,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertOutlined style={{ fontSize: '32px', color: '#fff' }} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: token.colorError,
                margin: '0 0 8px 0',
              }}
            >
              {t('landing.contact.emergency_title')}
            </h3>
            <p style={{ color: token.colorTextSecondary, margin: 0, fontSize: '15px' }}>
              {t('landing.contact.emergency_desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
