import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  AppstoreAddOutlined,
  ArrowRightOutlined,
  BankOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Button, Col, Row, Typography, theme } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

// Custom hook for scroll reveal animation
const useScrollReveal = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold }
    )
    const currentRef = ref.current
    if (currentRef) observer.observe(currentRef)
    return () => {
      if (currentRef) observer.disconnect()
    }
  }, [threshold])

  return [ref, isVisible]
}

// 3D Tilt Card Component
const TiltCard = ({ children, style, className }) => {
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const { left, top, width, height } = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - left) / width
    const y = (e.clientY - top) / height
    const rotateX = (0.5 - y) * 20
    const rotateY = (x - 0.5) * 20

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    cardRef.current.style.boxShadow = '0 30px 60px -15px rgba(0,0,0,0.15)'
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform =
      'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    cardRef.current.style.boxShadow = '0 10px 40px -10px rgba(0,0,0,0.08)'
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        ...style,
        transition: 'transform 0.1s ease-out, box-shadow 0.3s ease-out',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  )
}

const HomePage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { token } = theme.useToken()

  const [statsRef, statsVisible] = useScrollReveal(0.2)
  const [featuresRef, featuresVisible] = useScrollReveal(0.1)

  const handleLoginRedirect = () => {
    navigate(routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN))
  }

  const features = [
    {
      icon: <SafetyOutlined />,
      title: t('landing.home.feature1_title'),
      description: t('landing.home.feature1_desc'),
      gradient: 'linear-gradient(135deg, #ff7875 0%, #f5222d 100%)',
      shadowColor: '#f5222d',
      borderColor: '#ff4d4f',
    },
    {
      icon: <AppstoreAddOutlined />,
      title: t('landing.home.feature2_title'),
      description: t('landing.home.feature2_desc'),
      gradient: 'linear-gradient(135deg, #69c0ff 0%, #096dd9 100%)',
      shadowColor: '#096dd9',
      borderColor: '#1890ff',
    },
    {
      icon: <BarChartOutlined />,
      title: t('landing.home.feature3_title'),
      description: t('landing.home.feature3_desc'),
      gradient: 'linear-gradient(135deg, #95de64 0%, #389e0d 100%)',
      shadowColor: '#389e0d',
      borderColor: '#52c41a',
    },
  ]

  return (
    <div style={{ flex: 1, width: '100%', background: 'var(--app-bg)' }}>
      {/* Global styles for animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes gradientSweep {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .reveal-up {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .reveal-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '96px 32px 96px',
          background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, var(--app-bg) 50%, ${token.colorPrimaryBg} 100%)`,
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12} className="reveal-up visible">
              <Title
                level={1}
                style={{ fontSize: '48px', fontWeight: 900, marginBottom: '24px', lineHeight: 1.2 }}
              >
                {t('landing.home.title')} <br />
                <span
                  style={{
                    background: `linear-gradient(270deg, ${token.colorPrimary}, #13c2c2, ${token.colorPrimary})`,
                    backgroundSize: '200% auto',
                    color: 'transparent',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    animation: 'gradientSweep 4s ease infinite',
                  }}
                >
                  {t('landing.home.subtitle')}
                </span>
              </Title>
              <Paragraph
                style={{
                  fontSize: '18px',
                  color: 'var(--app-sider-text-muted)',
                  marginBottom: '40px',
                  lineHeight: 1.6,
                }}
              >
                {t('landing.home.description')}
              </Paragraph>
              <Button
                type="primary"
                size="large"
                style={{
                  height: '56px',
                  padding: '0 40px',
                  fontSize: '18px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
                onClick={handleLoginRedirect}
              >
                {t('landing.home.login_now')}
                <ArrowRightOutlined style={{ marginLeft: '8px' }} />
              </Button>
            </Col>

            <Col xs={24} md={12}>
              {/* Floating Mockup Showcase */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  border: `1px solid ${token.colorBorderSecondary}`,
                  overflow: 'hidden',
                  backgroundColor: 'var(--app-header-bg)',
                  animation: 'float 6s ease-in-out infinite',
                }}
              >
                <div
                  style={{
                    height: '32px',
                    background: 'var(--app-sider-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#ff5f56',
                      }}
                    />
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#ffbd2e',
                      }}
                    />
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#27c93f',
                      }}
                    />
                  </div>
                </div>
                <img
                  src="/images/dashboard_mockup.png"
                  alt="Dashboard Mockup"
                  style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                />
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Stats Section with Scroll Reveal */}
      <section
        ref={statsRef}
        style={{
          padding: '80px 32px',
          background: `linear-gradient(135deg, ${token.colorPrimary} 0%, #69c0ff 100%)`,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-10%',
            width: '300px',
            height: '300px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-50%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            filter: 'blur(60px)',
          }}
        />

        <div
          className={`reveal-up ${statsVisible ? 'visible' : ''}`}
          style={{
            maxWidth: '1152px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
            transitionDelay: '0.2s',
          }}
        >
          <Row gutter={[48, 48]} justify="center">
            {[
              {
                icon: <UserOutlined />,
                value: t('landing.home.stats.users'),
                label: t('landing.home.stats.users_label'),
              },
              {
                icon: <BankOutlined />,
                value: t('landing.home.stats.schools'),
                label: t('landing.home.stats.schools_label'),
              },
              {
                icon: <SafetyCertificateOutlined />,
                value: t('landing.home.stats.transactions'),
                label: t('landing.home.stats.transactions_label'),
              },
            ].map((stat, idx) => (
              <Col xs={24} sm={8} key={idx}>
                <div
                  style={{
                    textAlign: 'center',
                    transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      margin: '0 auto 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '24px',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }}
                  >
                    {React.cloneElement(stat.icon, { style: { fontSize: '36px', color: '#fff' } })}
                  </div>
                  <div
                    style={{
                      fontSize: '48px',
                      fontWeight: 900,
                      color: '#fff',
                      lineHeight: 1,
                      marginBottom: '8px',
                      textShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 500,
                      letterSpacing: '0.5px',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Features Section with 3D Tilt and Scroll Reveal */}
      <section
        ref={featuresRef}
        style={{ padding: '120px 32px', position: 'relative', overflow: 'hidden' }}
      >
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100vw',
            height: '500px',
            background: `radial-gradient(ellipse at center, ${token.colorPrimaryBg} 0%, rgba(255,255,255,0) 70%)`,
            zIndex: 0,
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />

        <div
          className={`reveal-up ${featuresVisible ? 'visible' : ''}`}
          style={{ maxWidth: '1152px', margin: '0 auto', position: 'relative', zIndex: 1 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <Title
              level={2}
              style={{
                fontWeight: 900,
                fontSize: '40px',
                letterSpacing: '-0.5px',
                marginBottom: '16px',
              }}
            >
              {t('landing.home.features_title')}
            </Title>
            <Paragraph
              style={{
                color: 'var(--app-sider-text-muted)',
                fontSize: '20px',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              {t('landing.home.features_desc')}
            </Paragraph>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '48px',
            }}
          >
            {features.map((feature, index) => (
              <TiltCard
                key={index}
                style={{
                  padding: '48px 32px',
                  borderRadius: '24px',
                  background: 'var(--app-header-bg)',
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
                  position: 'relative',
                  borderTop: `4px solid ${feature.borderColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'default',
                }}
              >
                <div
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '24px',
                    background: feature.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '32px',
                    boxShadow: `0 12px 24px -8px ${feature.shadowColor}`,
                    color: '#fff',
                    transform: 'translateZ(20px) rotate(-5deg)',
                    transition: 'transform 0.3s ease',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = 'translateZ(30px) rotate(0deg) scale(1.1)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = 'translateZ(20px) rotate(-5deg) scale(1)')
                  }
                >
                  {React.cloneElement(feature.icon, { style: { fontSize: '40px', color: '#fff' } })}
                </div>
                <Title
                  level={3}
                  style={{ marginBottom: '16px', fontWeight: 800, transform: 'translateZ(10px)' }}
                >
                  {feature.title}
                </Title>
                <Paragraph
                  style={{
                    color: 'var(--app-sider-text-muted)',
                    lineHeight: 1.7,
                    fontSize: '16px',
                    margin: 0,
                    transform: 'translateZ(5px)',
                  }}
                >
                  {feature.description}
                </Paragraph>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
