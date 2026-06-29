import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import useTranslation from '@/shared/hooks/useTranslation'
import { maxLen } from '@/shared/utils/validateUtil'

const SchoolStudentFormSection = ({ openCreate, setOpenCreate, onCreateSubmit, refetch }) => {
  const { t } = useTranslation()

  const createFields = [
    {
      key: 'nric',
      title: t('school_student.field.nric'),
      placeholder: 'e.g. S1234567D',
      validate: [maxLen(20)],
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
        title={t('school_student.title.create')}
        submitLabel={t('button.create')}
        initialValues={{ nric: '' }}
        fields={createFields}
        destroyOnHidden
        onSubmit={handleSubmit(onCreateSubmit)}
      />
    </>
  )
}

export default SchoolStudentFormSection
