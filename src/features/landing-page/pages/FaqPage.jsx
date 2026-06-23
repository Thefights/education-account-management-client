import useTranslation from '@/shared/hooks/useTranslation'
import { SearchOutlined } from '@ant-design/icons'
import { Collapse, Empty, Input, Tabs, theme, Typography } from 'antd'
import { useState } from 'react'

const { Title, Paragraph } = Typography

const FaqPage = () => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const faqData = [
    {
      key: '1',
      category: 'account',
      label: <span style={{ fontWeight: 600, fontSize: '16px' }}>{t('landing.faq.q1')}</span>,
      children: <p style={{ color: 'var(--app-sider-text-muted)' }}>{t('landing.faq.a1')}</p>,
      textLabel: t('landing.faq.q1'),
      textContent: t('landing.faq.a1'),
    },
    {
      key: '2',
      category: 'account',
      label: <span style={{ fontWeight: 600, fontSize: '16px' }}>{t('landing.faq.q2')}</span>,
      children: <p style={{ color: 'var(--app-sider-text-muted)' }}>{t('landing.faq.a2')}</p>,
      textLabel: t('landing.faq.q2'),
      textContent: t('landing.faq.a2'),
    },
    {
      key: '3',
      category: 'topup',
      label: <span style={{ fontWeight: 600, fontSize: '16px' }}>{t('landing.faq.q3')}</span>,
      children: <p style={{ color: 'var(--app-sider-text-muted)' }}>{t('landing.faq.a3')}</p>,
      textLabel: t('landing.faq.q3'),
      textContent: t('landing.faq.a3'),
    },
    {
      key: '4',
      category: 'topup',
      label: <span style={{ fontWeight: 600, fontSize: '16px' }}>{t('landing.faq.q4')}</span>,
      children: <p style={{ color: 'var(--app-sider-text-muted)' }}>{t('landing.faq.a4')}</p>,
      textLabel: t('landing.faq.q4'),
      textContent: t('landing.faq.a4'),
    },
    {
      key: '5',
      category: 'account',
      label: <span style={{ fontWeight: 600, fontSize: '16px' }}>{t('landing.faq.q5')}</span>,
      children: <p style={{ color: 'var(--app-sider-text-muted)' }}>{t('landing.faq.a5')}</p>,
      textLabel: t('landing.faq.q5'),
      textContent: t('landing.faq.a5'),
    },
  ]

  const tabItems = [
    { key: 'all', label: t('landing.faq.tabs.all') },
    { key: 'account', label: t('landing.faq.tabs.account') },
    { key: 'topup', label: t('landing.faq.tabs.topup') },
  ]

  const filteredFaqs = faqData.filter((faq) => {
    const matchesTab = activeTab === 'all' || faq.category === activeTab
    const searchLower = searchText.toLowerCase()
    const matchesSearch =
      !searchText ||
      faq.textLabel.toLowerCase().includes(searchLower) ||
      faq.textContent.toLowerCase().includes(searchLower)

    return matchesTab && matchesSearch
  })

  return (
    <div style={{ flex: 1, width: '100%', background: 'var(--app-bg)', padding: '80px 32px' }}>
      <div style={{ maxWidth: '768px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Title level={1} style={{ fontSize: '36px', fontWeight: 'bold' }}>
            {t('landing.faq.title')}
          </Title>
          <Paragraph
            style={{ fontSize: '18px', color: 'var(--app-sider-text-muted)', marginBottom: '32px' }}
          >
            {t('landing.faq.desc')}
          </Paragraph>

          <Input.Search
            placeholder={t('landing.faq.search_placeholder')}
            allowClear
            size="large"
            prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
            style={{
              maxWidth: '500px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderRadius: '8px',
            }}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div
          style={{
            background: 'var(--app-header-bg)',
            padding: '16px 32px 32px',
            borderRadius: '16px',
            boxShadow: 'var(--app-card-shadow)',
            border: '1px solid var(--app-border-color)',
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            style={{ marginBottom: '16px' }}
          />

          {filteredFaqs.length > 0 ? (
            <Collapse
              // eslint-disable-next-line no-unused-vars
              items={filteredFaqs.map(({ textLabel, textContent, ...item }) => item)}
              bordered={false}
              defaultActiveKey={['1']}
              expandIconPosition="end"
              style={{ background: 'transparent' }}
            />
          ) : (
            <Empty style={{ padding: '48px 0' }} description="No matching FAQs found" />
          )}
        </div>
      </div>
    </div>
  )
}

export default FaqPage
