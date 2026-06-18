/**
 * System administrator page for enabling or disabling the AI Assistant feature.
 */
import { ApiUrls } from '@/shared/api/apiUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Alert, Button, Card, Flex, Skeleton, Switch, Typography, theme } from 'antd'
import { useState } from 'react'

const AiAssistantSettingPage = () => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const [pendingValue, setPendingValue] = useState(null)
  const getSetting = useFetch(ApiUrls.AI_ASSISTANT_SETTING.INDEX)
  const updateSetting = useAxiosSubmit({
    url: ApiUrls.AI_ASSISTANT_SETTING.INDEX,
    method: 'PUT',
    asJson: true,
  })

  const handleSubmit = async () => {
    const response = await updateSetting.submit({ overrideData: { isEnabled } })
    if (typeof response?.data?.isEnabled === 'boolean') {
      getSetting.setData(response.data)
    } else if (response) {
      getSetting.setData({ isEnabled })
    }
    if (response) setPendingValue(null)
  }

  const savedValue = getSetting.data?.isEnabled
  const isEnabled = pendingValue ?? savedValue ?? false
  const hasChanges = pendingValue !== null && pendingValue !== savedValue

  return (
    <main style={{ flex: 1, width: '100%', minHeight: '100%', display: 'flex' }}>
      <Card
        style={{ flex: 1, width: '100%', border: 0, borderRadius: 0 }}
        styles={{ body: { height: '100%' } }}
      >
        <Flex vertical gap={24}>
          <div>
            <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
              {t('ai_assistant_setting.title')}
            </Typography.Title>
            <Typography.Text type="secondary">
              {t('ai_assistant_setting.description')}
            </Typography.Text>
          </div>

          {getSetting.loading && getSetting.data == null ? (
            <Skeleton active paragraph={{ rows: 2 }} />
          ) : getSetting.error ? (
            <Alert
              showIcon
              type="error"
              title={t('ai_assistant_setting.load_error')}
              action={
                <Button size="small" onClick={getSetting.fetch}>
                  {t('ai_assistant_setting.retry')}
                </Button>
              }
            />
          ) : (
            <Flex
              align="center"
              justify="space-between"
              gap={24}
              style={{
                padding: 20,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusLG,
                background: token.colorFillAlter,
              }}
            >
              <div>
                <Typography.Text strong>
                  {t('ai_assistant_setting.field_label')}
                </Typography.Text>
                <br />
                <Typography.Text type="secondary">
                  {t(
                    isEnabled
                      ? 'ai_assistant_setting.enabled_description'
                      : 'ai_assistant_setting.disabled_description'
                  )}
                </Typography.Text>
              </div>
              <Switch
                checked={isEnabled}
                checkedChildren={t('ai_assistant_setting.enabled')}
                unCheckedChildren={t('ai_assistant_setting.disabled')}
                onChange={setPendingValue}
                disabled={updateSetting.loading}
              />
            </Flex>
          )}

          <Button
            type="primary"
            onClick={handleSubmit}
            loading={updateSetting.loading}
            disabled={getSetting.loading || !!getSetting.error || !hasChanges}
            style={{ alignSelf: 'flex-start' }}
          >
            {t('button.save')}
          </Button>
        </Flex>
      </Card>
    </main>
  )
}

export default AiAssistantSettingPage
