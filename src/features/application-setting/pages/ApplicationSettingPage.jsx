import { ApiUrls } from '@/shared/api/apiUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Alert, Button, Card, Flex, InputNumber, Skeleton, Switch, Typography, theme } from 'antd'
import { useMemo, useState } from 'react'

const ApplicationSettingPage = () => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const [draftValues, setDraftValues] = useState(null)
  const getSetting = useFetch(ApiUrls.APPLICATION_SETTING.INDEX)
  const updateSetting = useAxiosSubmit({
    url: ApiUrls.APPLICATION_SETTING.INDEX,
    method: 'PUT',
  })

  const hasSetting = !!getSetting.data
  const savedValues = getSetting.data
  const formValues = draftValues ?? savedValues

  const handleSubmit = async () => {
    const response = await updateSetting.submit({ overrideData: formValues })
    if (response?.data) {
      getSetting.setData(response.data)
      setDraftValues(null)
    }
  }

  const hasChanges = useMemo(() => {
    if (!draftValues || !savedValues) return false

    return (
      draftValues.isAiFeatureEnabled !== savedValues.isAiFeatureEnabled ||
      Number(draftValues.taxRate) !== Number(savedValues.taxRate) ||
      Number(draftValues.installmentDueDay) !== Number(savedValues.installmentDueDay)
    )
  }, [draftValues, savedValues])

  const setField = (key, value) => {
    if (!savedValues) return

    setDraftValues((prev) => ({ ...(prev ?? savedValues), [key]: value }))
  }

  return (
    <Card>
      <Flex vertical gap={24}>
        <div>
          <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
            {t('application_setting.title')}
          </Typography.Title>
          <Typography.Text type="secondary">{t('application_setting.description')}</Typography.Text>
        </div>

        {getSetting.loading && !hasSetting ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : getSetting.error ? (
          <Alert
            showIcon
            type="error"
            title={t('application_setting.load_error')}
            action={
              <Button size="small" onClick={getSetting.fetch}>
                {t('application_setting.retry')}
              </Button>
            }
          />
        ) : hasSetting ? (
          <Flex vertical gap={16}>
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
                  {t('application_setting.ai_feature_label')}
                </Typography.Text>
                <br />
                <Typography.Text type="secondary">
                  {t(
                    formValues.isAiFeatureEnabled
                      ? 'application_setting.enabled_description'
                      : 'application_setting.disabled_description'
                  )}
                </Typography.Text>
              </div>
              <Switch
                checked={formValues.isAiFeatureEnabled}
                checkedChildren={t('application_setting.enabled')}
                unCheckedChildren={t('application_setting.disabled')}
                onChange={(checked) => setField('isAiFeatureEnabled', checked)}
                disabled={updateSetting.loading}
              />
            </Flex>

            <Flex gap={16} wrap="wrap">
              <Flex vertical gap={8} style={{ minWidth: 220, flex: '1 1 220px' }}>
                <Typography.Text strong>{t('application_setting.tax_rate_label')}</Typography.Text>
                <InputNumber
                  value={formValues.taxRate}
                  min={0}
                  max={1}
                  step={0.0001}
                  precision={4}
                  style={{ width: '100%' }}
                  onChange={(value) => setField('taxRate', value ?? 0)}
                  disabled={updateSetting.loading}
                />
                <Typography.Text type="secondary">
                  {t('application_setting.tax_rate_description')}
                </Typography.Text>
              </Flex>

              <Flex vertical gap={8} style={{ minWidth: 220, flex: '1 1 220px' }}>
                <Typography.Text strong>
                  {t('application_setting.installment_due_day_label')}
                </Typography.Text>
                <InputNumber
                  value={formValues.installmentDueDay}
                  min={1}
                  max={28}
                  precision={0}
                  style={{ width: '100%' }}
                  onChange={(value) => setField('installmentDueDay', value ?? 1)}
                  disabled={updateSetting.loading}
                />
                <Typography.Text type="secondary">
                  {t('application_setting.installment_due_day_description')}
                </Typography.Text>
              </Flex>
            </Flex>
          </Flex>
        ) : null}

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
  )
}

export default ApplicationSettingPage
