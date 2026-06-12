import { ApiUrls } from '@/shared/api/apiUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { CloseOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Drawer, Space } from 'antd'
import { useEffect, useState } from 'react'
import ProfileDetailsSection from './sections/ProfileDetailsSection'
import ProfileFormSection from './sections/ProfileFormSection'

const ProfilePage = ({ open, onClose }) => {
  const { t } = useTranslation()
  const [openEdit, setOpenEdit] = useState(false)

  const {
    data: profile,
    fetch: fetchProfile,
    loading: profileLoading,
  } = useFetch(ApiUrls.AUTH_ACCOUNT.ME, {}, [], false)

  const updateProfile = useAxiosSubmit({
    url: ApiUrls.AUTH_ACCOUNT.UPDATE_ME,
    method: 'PUT',
  })

  useEffect(() => {
    if (open) {
      fetchProfile()
    }
  }, [fetchProfile, open])

  const handleClose = () => {
    setOpenEdit(false)
    onClose?.()
  }

  return (
    <>
      <Drawer
        title={t('profile.title.myProfile')}
        placement="right"
        open={!!open}
        onClose={handleClose}
        size={560}
        closeIcon={<CloseOutlined />}
        styles={{
          body: { overflow: 'hidden', padding: '0 32px 72px' },
          footer: { textAlign: 'right' },
        }}
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose}>{t('button.close')}</Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setOpenEdit(true)}
              disabled={profileLoading || !profile}
            >
              {t('button.edit')}
            </Button>
          </Space>
        }
      >
        <ProfileDetailsSection profile={profile} loading={profileLoading} />
      </Drawer>

      <ProfileFormSection
        openEdit={openEdit}
        setOpenEdit={setOpenEdit}
        selectedRow={profile}
        onUpdateSubmit={updateProfile.submit}
        refetch={fetchProfile}
      />
    </>
  )
}

export default ProfilePage
