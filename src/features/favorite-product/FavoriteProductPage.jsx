import ProductAppCard from '@/shared/components/generals/ProductAppCard'
import EmptyBox from '@/shared/components/placeholders/EmptyBox'
import SkeletonBox from '@/shared/components/skeletons/SkeletonBox'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import useFetch from '@/shared/hooks/useFetch'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import { ApiUrls } from '@/shared/api/apiUrls'
import { StarFilled } from '@ant-design/icons'
import { Button, Col, Flex, Row, Space, theme } from 'antd'
import { useNavigate } from 'react-router-dom'

const FavoriteProductPage = () => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const navigate = useNavigate()

  const { data, loading, fetch: refetch } = useFetch(ApiUrls.PRODUCT.GET_FAVORITES, {}, [])
  const toggleFavoriteRequest = useAxiosSubmit({ method: 'POST' })
  const favoriteProducts = data ? data : []

  const handleToggleFavorite = async (productId) => {
    const res = await toggleFavoriteRequest.submit({
      overrideUrl: ApiUrls.PRODUCT.FAVORITE(productId),
    })

    if (!res) return

    refetch()
  }

  return (
    <div style={{ width: '100%', padding: 24 }}>
      <Flex vertical gap={28}>
        <Space size={22} wrap>
          <Button
            type="text"
            icon={<StarFilled />}
            style={{
              height: 34,
              paddingInline: 0,
              borderRadius: 0,
              color: token.colorTextHeading,
              borderBottom: `2px solid ${token.colorPrimary}`,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {t('product.text.favorite_apps_count', {
              count: favoriteProducts.length,
            })}
          </Button>
        </Space>

        {loading ? (
          <Row gutter={[24, 24]}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Col key={index} xs={24} md={12} xl={8} xxl={6}>
                <SkeletonBox numberOfBoxes={1} heights={[390]} rounded />
              </Col>
            ))}
          </Row>
        ) : favoriteProducts.length === 0 ? (
          <EmptyBox
            title={t('product.empty.favorite_title')}
            description={t('product.empty.favorite_description')}
            buttons={
              <Button
                type="primary"
                onClick={() => navigate(routeUrls.BASE_ROUTE.TENANT(routeUrls.TENANT.HOME))}
              >
                {t('product.button.browse_app_store')}
              </Button>
            }
            minHeight={420}
          />
        ) : (
          <Row gutter={[24, 24]}>
            {favoriteProducts.map((product) => (
              <Col key={product.id} xs={24} md={12} xl={8} xxl={6}>
                <ProductAppCard
                  app={product}
                  action={
                    <Button
                      type="text"
                      shape="circle"
                      onClick={() => handleToggleFavorite(product.id)}
                      loading={toggleFavoriteRequest.loading}
                      aria-label={t('product.button.remove_favorite')}
                      title={t('product.button.remove_favorite')}
                      icon={<StarFilled style={{ color: token.colorWarning }} />}
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

export default FavoriteProductPage
