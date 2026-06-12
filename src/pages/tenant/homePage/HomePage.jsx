import ProductAppCard from '@/components/generals/ProductAppCard'
import EmptyBox from '@/components/placeholders/EmptyBox'
import SkeletonBox from '@/components/skeletons/SkeletonBox'
import useTranslation from '@/hooks/useTranslation'
import useFetch from '@/hooks/useFetch'
import useAxiosSubmit from '@/hooks/useAxiosSubmit'
import { ApiUrls } from '@/configs/apiUrls'
import { AppstoreOutlined, HomeOutlined, StarFilled, StarOutlined } from '@ant-design/icons'
import { Button, Col, Flex, Row, Space, theme } from 'antd'
import { useState } from 'react'

const homeTabConfigs = [
  {
    key: 'myApps',
    labelKey: 'tenant_home.dashboard.tabs.my_apps',
    icon: HomeOutlined,
  },
  {
    key: 'appStore',
    labelKey: 'tenant_home.dashboard.tabs.app_store',
    icon: AppstoreOutlined,
  },
]

const HomePage = () => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const [activeTab, setActiveTab] = useState('appStore') // Changed default tab

  const {
    data: myServicesData,
    loading: myServicesLoading,
    fetch: refetchMyServices,
  } = useFetch(ApiUrls.PRODUCT.MY_SERVICES, {}, [])

  const {
    data: appStoreData,
    loading: appStoreLoading,
    fetch: refetchAppStore,
  } = useFetch(ApiUrls.PRODUCT.APP_STORE, {}, [])

  const toggleFavoriteRequest = useAxiosSubmit({ method: 'POST' })

  const handleToggleFavorite = async (productId) => {
    const res = await toggleFavoriteRequest.submit({
      overrideUrl: ApiUrls.PRODUCT.FAVORITE(productId),
    })

    if (!res) return

    refetchMyServices()
    refetchAppStore()
  }

  const myApps = myServicesData ? myServicesData : []
  const appStoreApps = appStoreData ? appStoreData : []
  const loading = activeTab === 'myApps' ? myServicesLoading : appStoreLoading

  const visibleApps = activeTab === 'myApps' ? myApps : appStoreApps
  const emptyState =
    activeTab === 'myApps'
      ? {
          title: t('product.empty.my_apps_title'),
          description: t('product.empty.my_apps_description'),
          buttons: (
            <Button type="primary" onClick={() => setActiveTab('appStore')}>
              {t('product.button.browse_app_store')}
            </Button>
          ),
        }
      : {
          title: t('product.empty.app_store_title'),
          description: t('product.empty.app_store_description'),
        }

  return (
    <div style={{ width: '100%', padding: 24 }}>
      <Flex vertical gap={28}>
        <Space size={22} wrap>
          {homeTabConfigs.map((tab) => {
            const active = activeTab === tab.key
            const count = tab.key === 'myApps' ? myApps.length : appStoreApps.length
            const Icon = tab.icon

            return (
              <Button
                key={tab.key}
                type="text"
                icon={<Icon />}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  height: 34,
                  paddingInline: 0,
                  borderRadius: 0,
                  color: active ? token.colorTextHeading : token.colorTextSecondary,
                  borderBottom: active
                    ? `2px solid ${token.colorPrimary}`
                    : '2px solid transparent',
                  fontWeight: active ? 700 : 500,
                  fontSize: 16,
                }}
              >
                {t(tab.labelKey, { count })}
              </Button>
            )
          })}
        </Space>

        {loading ? (
          <Row gutter={[24, 24]}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Col key={index} xs={24} md={12} xl={8} xxl={6}>
                <SkeletonBox numberOfBoxes={1} heights={[390]} rounded />
              </Col>
            ))}
          </Row>
        ) : visibleApps.length === 0 ? (
          <EmptyBox
            title={emptyState.title}
            description={emptyState.description}
            buttons={emptyState.buttons}
            minHeight={420}
          />
        ) : (
          <Row gutter={[24, 24]}>
            {visibleApps.map((app) => (
              <Col key={app.id} xs={24} md={12} xl={8} xxl={6}>
                <ProductAppCard
                  app={app}
                  action={
                    <Button
                      type="text"
                      shape="circle"
                      onClick={() => handleToggleFavorite(app.id)}
                      loading={toggleFavoriteRequest.loading}
                      aria-label={
                        app.isFavorited
                          ? t('product.button.remove_favorite')
                          : t('product.button.add_favorite')
                      }
                      title={
                        app.isFavorited
                          ? t('product.button.remove_favorite')
                          : t('product.button.add_favorite')
                      }
                      icon={
                        app.isFavorited ? (
                          <StarFilled style={{ color: token.colorWarning }} />
                        ) : (
                          <StarOutlined style={{ color: token.colorTextSecondary }} />
                        )
                      }
                    />
                  }
                />
              </Col>
            ))}
          </Row>
        )}
      </Flex>
    </div>
  )
}

export default HomePage
