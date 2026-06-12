import { ApiUrls } from '@/configs/apiUrls'
import useAxiosSubmit from '@/hooks/useAxiosSubmit'
import useFetch from '@/hooks/useFetch'
import useTranslation from '@/hooks/useTranslation'
import { EditOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons'
import { Button, Card, Checkbox, Divider, Flex, Typography, theme } from 'antd'
import { useMemo, useState } from 'react'

const defaultMfaValues = {
  sourceKey: '',
  mfaEnabled: false,
  emailEnabled: false,
  smsEnabled: false,
}

const getResponseData = (responseData) => responseData?.data || responseData

const getBooleanValue = (source, camelKey, pascalKey) => {
  if (!source) return false

  return !!(source[camelKey] ?? source[pascalKey])
}

const getMfaValues = (mfaSetting) => ({
  sourceKey: JSON.stringify(mfaSetting),
  mfaEnabled: getBooleanValue(mfaSetting, 'isEnabled', 'IsEnabled'),
  emailEnabled: getBooleanValue(mfaSetting, 'emailEnabled', 'EmailEnabled'),
  smsEnabled: getBooleanValue(mfaSetting, 'smsEnabled', 'SmsEnabled'),
})

const MfaSettingPage = () => {
  const { t } = useTranslation()
  const { token } = theme.useToken()

  const [mfaValues, setMfaValues] = useState(defaultMfaValues)
  const [isEditing, setIsEditing] = useState(false)

  const getMfaSetting = useFetch(ApiUrls.MFA_SETTING.INDEX)

  const updateMfaSetting = useAxiosSubmit({
    url: ApiUrls.MFA_SETTING.INDEX,
    method: 'PUT',
  })

  const loading = getMfaSetting.loading && !getMfaSetting.data
  const saving = updateMfaSetting.loading
  const mfaSetting = getResponseData(getMfaSetting.data)
  const serverMfaValues = useMemo(
    () => (mfaSetting ? getMfaValues(mfaSetting) : defaultMfaValues),
    [mfaSetting]
  )
  const currentMfaValues =
    mfaSetting && mfaValues.sourceKey !== serverMfaValues.sourceKey ? serverMfaValues : mfaValues

  const handleReset = () => {
    if (!mfaSetting) return

    setMfaValues(serverMfaValues)
    setIsEditing(false)
  }

  const handleSave = async () => {
    const updateValues = {
      IsEnabled: currentMfaValues.mfaEnabled,
      EmailEnabled: currentMfaValues.emailEnabled,
      SmsEnabled: currentMfaValues.smsEnabled,
    }

    const response = await updateMfaSetting.submit({
      overrideData: updateValues,
    })

    if (!response) return

    setMfaValues(getMfaValues(getResponseData(response.data) || updateValues))
    setIsEditing(false)
    getMfaSetting.fetch()
  }

  return (
    <Flex justify="center">
      <Card
        loading={loading}
        variant="borderless"
        styles={{
          body: {
            padding: 0,
          },
        }}
        style={{
          width: '100%',
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowSecondary,
        }}
      >
        <div role="list">
          <Flex
            role="listitem"
            justify="space-between"
            align="center"
            gap={24}
            style={{ padding: '28px 32px' }}
          >
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {t('mfa_setting.title.two_factor_authentication')}
              </Typography.Title>
              <Typography.Paragraph
                type="secondary"
                style={{ maxWidth: 1040, margin: 0, marginTop: 8 }}
              >
                {t('mfa_setting.description.two_factor_authentication')}
              </Typography.Paragraph>
            </div>
            <div>
              <Checkbox
                checked={currentMfaValues.mfaEnabled}
                disabled={loading || saving || !isEditing}
                onChange={(event) =>
                  setMfaValues({
                    ...currentMfaValues,
                    mfaEnabled: event.target.checked,
                  })
                }
              />
            </div>
          </Flex>

          <div role="listitem" style={{ padding: '28px 32px' }}>
            <Flex vertical gap={6}>
              <Checkbox
                checked={currentMfaValues.emailEnabled}
                disabled={loading || saving || !isEditing || !currentMfaValues.mfaEnabled}
                onChange={(event) =>
                  setMfaValues({
                    ...currentMfaValues,
                    emailEnabled: event.target.checked,
                  })
                }
              >
                <span style={{ fontWeight: 500 }}>{t('mfa_setting.method.email')}</span>
              </Checkbox>

              <Typography.Text type="secondary" italic style={{ marginLeft: 28 }}>
                {t('mfa_setting.method.email_description')}
              </Typography.Text>
            </Flex>
          </div>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* Action Buttons */}
        <Flex justify="flex-end" gap={12} style={{ padding: '18px 32px' }}>
          <Button icon={<UndoOutlined />} disabled={loading || saving} onClick={handleReset}>
            {t('button.cancel')}
          </Button>

          {isEditing ? (
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
              {t('button.save')}
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<EditOutlined />}
              disabled={loading || saving}
              onClick={() => setIsEditing(true)}
            >
              {t('button.edit')}
            </Button>
          )}
        </Flex>
      </Card>
    </Flex>
  )
}

export default MfaSettingPage
