import { ApiUrls } from '@/shared/api/apiUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { SaveOutlined, UndoOutlined } from '@ant-design/icons'
import { Button, Card, Divider, Flex, Input, Space, Switch, Typography, theme } from 'antd'
import { useMemo, useState } from 'react'

const getEmailWhitelistText = (items) => {
  if (!Array.isArray(items)) return ''

  return items
    .map((item) => item?.value)
    .filter(Boolean)
    .join(';')
}

const EmailNotificationPage = () => {
  const { t } = useTranslation()
  const { token } = theme.useToken()

  // Draft state stays null until the user edits the field, so API data remains the source of truth.
  const [enabledDraft, setEnabledDraft] = useState(null)
  const [emailTextDraft, setEmailTextDraft] = useState(null)

  const whitelistSetting = useFetch(ApiUrls.EMAIL_WHITELIST_SETTING.INDEX)
  const whitelist = useFetch(ApiUrls.EMAIL_WHITELIST.GET_ALL)
  const updateWhitelistSetting = useAxiosSubmit({
    url: ApiUrls.EMAIL_WHITELIST_SETTING.INDEX,
    method: 'PUT',
  })
  const saveWhitelist = useAxiosSubmit({
    url: ApiUrls.EMAIL_WHITELIST.INDEX,
    method: 'PUT',
  })

  const loading = whitelistSetting.loading || whitelist.loading
  const saving = updateWhitelistSetting.loading || saveWhitelist.loading
  const initialEnabled = Boolean(whitelistSetting.data?.isEnabled)
  const initialEmailText = getEmailWhitelistText(whitelist.data)
  // Prefer unsaved draft values while editing; otherwise display the latest saved API values.
  const enabled = enabledDraft ?? initialEnabled
  const emailText = emailTextDraft ?? initialEmailText
  // Used to enable Save/Cancel only when the visible values differ from the saved values.
  const hasChanges = useMemo(
    () => enabled !== initialEnabled || emailText !== initialEmailText,
    [enabled, emailText, initialEnabled, initialEmailText]
  )

  const handleCancel = () => {
    // Clearing drafts restores the UI back to the current saved API values.
    setEnabledDraft(null)
    setEmailTextDraft(null)
  }

  const handleSave = async () => {
    // Save the list first; if it fails validation, keep the setting unchanged.
    const whitelistResponse = await saveWhitelist.submit({
      overrideData: {
        values: emailText,
      },
    })

    if (!whitelistResponse) return

    const settingResponse = await updateWhitelistSetting.submit({
      overrideData: {
        isEnabled: enabled,
      },
    })

    if (!settingResponse) return

    // Treat successful responses as the new saved baseline, then clear unsaved drafts.
    whitelist.setData(whitelistResponse.data)
    whitelistSetting.setData(settingResponse.data)
    setEmailTextDraft(null)
    setEnabledDraft(null)
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
          {/* Enable Allow List Section */}
          <Flex
            role="listitem"
            justify="space-between"
            align="center"
            gap={24}
            style={{ padding: '28px 32px' }}
          >
            <div>
              <Space align="center" size={10}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {t('email_notification.title.enable_allow_list')}
                </Typography.Title>
              </Space>
              <Typography.Paragraph
                type="secondary"
                style={{ maxWidth: 1040, margin: 0, marginTop: 8 }}
              >
                {t('email_notification.description.enable_allow_list')}
              </Typography.Paragraph>
            </div>
            <div>
              <Switch
                checked={enabled}
                onChange={setEnabledDraft}
                disabled={saving}
                aria-label={t('email_notification.title.enable_allow_list')}
              />
            </div>
          </Flex>

          {/* Allow List Section */}
          <div role="listitem" style={{ padding: '28px 32px 32px' }}>
            <Flex vertical gap={10} style={{ width: '100%' }}>
              <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                {t('email_notification.description.allow_list')}
              </Typography.Paragraph>

              <Input.TextArea
                value={emailText}
                onChange={(event) => setEmailTextDraft(event.target.value)}
                disabled={saving || !enabled}
                rows={5}
                style={{
                  resize: 'vertical',
                }}
              />

              <Typography.Text type="secondary">{t('email_notification.example')}</Typography.Text>
            </Flex>
          </div>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* Action Buttons */}
        <Flex justify="flex-end" gap={12} style={{ padding: '18px 32px' }}>
          <Button icon={<UndoOutlined />} disabled={saving || !hasChanges} onClick={handleCancel}>
            {t('button.cancel')}
          </Button>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            disabled={!hasChanges}
            onClick={handleSave}
          >
            {t('button.save')}
          </Button>
        </Flex>
      </Card>
    </Flex>
  )
}

export default EmailNotificationPage
