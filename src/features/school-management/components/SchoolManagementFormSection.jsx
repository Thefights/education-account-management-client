import GenericFormDrawer from '@/shared/components/dialogs/commons/GenericFormDrawer'
import useTranslation from '@/shared/hooks/useTranslation'
import { isEmail, maxLen } from '@/shared/utils/validateUtil'

const initialValues = { schoolName: '', address: '', phoneNumber: '', email: '' }

const SchoolManagementFormSection = ({ openCreate, setOpenCreate, openUpdate, setOpenUpdate, selectedRow, onCreateSubmit, onUpdateSubmit, refetch }) => {
  const { t } = useTranslation()
  const fields = [
    { key: 'schoolName', title: t('school_management.field.school_name'), validate: [maxLen(150)] },
    { key: 'address', title: t('school_management.field.address'), multiline: true, minRows: 3, validate: [maxLen(300)] },
    { key: 'phoneNumber', title: t('school_management.field.phone_number'), type: 'phone' },
    { key: 'email', title: t('school_management.field.email'), type: 'email', validate: [isEmail(), maxLen(320)] },
  ]
  const handleSubmit = (submit) => async ({ values, closeDrawer }) => {
    const response = await submit({ overrideData: values })
    if (!response) return
    closeDrawer()
    await refetch()
  }

  return <>
    <GenericFormDrawer open={openCreate} onClose={() => setOpenCreate(false)} title={t('school_management.title.create')} submitLabel={t('button.create')} initialValues={initialValues} fields={fields} destroyOnClose onSubmit={handleSubmit(onCreateSubmit)} />
    <GenericFormDrawer open={openUpdate} onClose={() => setOpenUpdate(false)} title={t('school_management.title.update')} submitLabel={t('button.update')} initialValues={{ ...initialValues, ...selectedRow }} fields={fields} destroyOnClose onSubmit={handleSubmit(onUpdateSubmit)} />
  </>
}

export default SchoolManagementFormSection
