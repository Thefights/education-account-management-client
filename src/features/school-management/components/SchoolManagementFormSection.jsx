import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import useTranslation from '@/shared/hooks/useTranslation'
import { isEmail, maxLen } from '@/shared/utils/validateUtil'

const initialValues = { schoolName: '', address: '', phoneNumber: '', email: '' }

const SchoolManagementFormSection = ({ openCreate, setOpenCreate, onCreateSubmit, refetch }) => {
  const { t } = useTranslation()
  const fields = [
    {
      key: 'schoolName',
      title: t('school_management.field.school_name'),
      placeholder: 'e.g. Northview Secondary School',
      validate: [maxLen(150)],
    },
    {
      key: 'address',
      title: t('school_management.field.address'),
      placeholder: 'e.g. 123 Example Road, Singapore 123456',
      multiline: true,
      minRows: 3,
      validate: [maxLen(300)],
    },
    {
      key: 'phoneNumber',
      title: t('school_management.field.phone_number'),
      type: 'phone',
      placeholder: 'e.g. 61234567',
    },
    {
      key: 'email',
      title: t('school_management.field.email'),
      type: 'email',
      placeholder: 'e.g. contact@school.edu.sg',
      validate: [isEmail(), maxLen(320)],
    },
  ]
  const handleSubmit =
    (submit) =>
    async ({ values, closeDialog }) => {
      const response = await submit({ overrideData: values })
      if (!response) return
      closeDialog()
      await refetch()
    }

  return (
    <>
      <GenericFormDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title={t('school_management.title.create')}
        submitLabel={t('button.create')}
        initialValues={initialValues}
        fields={fields}
        destroyOnHidden
        onSubmit={handleSubmit(onCreateSubmit)}
      />
    </>
  )
}

export default SchoolManagementFormSection
