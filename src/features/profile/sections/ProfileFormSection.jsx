import GenericFormDrawer from '@/shared/components/dialogs/commons/GenericFormDrawer'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { maxLen } from '@/shared/utils/validateUtil'
import { useMemo } from 'react'

const ProfileFormSection = ({ openEdit, setOpenEdit, selectedRow, onUpdateSubmit, refetch }) => {
  const { t } = useTranslation()
  const _enum = useEnum()

  const fields = useMemo(
    () => [
      {
        key: 'imageUrl',
        title: t('profile.field.imageUrl'),
        type: 'image',
        required: false,
      },
      {
        key: 'userIdText',
        title: t('profile.field.userId'),
        required: false,
        validate: [maxLen(256)],
      },
      {
        key: 'fullName',
        title: t('profile.field.displayName'),
      },
      {
        key: 'phoneNumber',
        title: t('profile.field.phone'),
        type: 'phone',
        required: false,
      },
      {
        key: 'gender',
        title: t('profile.field.gender'),
        type: 'select',
        required: false,
        options: _enum.genderOptions,
      },
    ],
    [_enum.genderOptions, t]
  )

  const handleUpdateSubmit = async ({ values, closeDrawer }) => {
    const response = await onUpdateSubmit({ overrideData: values })

    if (!response) return

    closeDrawer()
    refetch()
  }

  if (!selectedRow) return null

  return (
    <GenericFormDrawer
      open={openEdit}
      onClose={() => setOpenEdit(false)}
      title={t('profile.title.editProfile')}
      fields={fields}
      initialValues={selectedRow}
      submitLabel={t('button.save')}
      width={560}
      onSubmit={handleUpdateSubmit}
      destroyOnClose
    />
  )
}

export default ProfileFormSection
