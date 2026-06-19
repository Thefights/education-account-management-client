import GenericFormDrawer from '@/shared/components/dialogs/commons/GenericFormDrawer'
import useTranslation from '@/shared/hooks/useTranslation'
import { maxLen, numberHigherThanOrEqual } from '@/shared/utils/validateUtil'

const initialValues = {
  courseName: '',
  description: '',
  courseFeeAmount: '0',
  miscFeeAmount: '0',
  gstAmount: '0',
}
const normalizeInitialValues = (course = {}) => ({
  courseName: course.courseName ?? '',
  description: course.description ?? '',
  courseFeeAmount: String(course.courseFeeAmount ?? 0),
  miscFeeAmount: String(course.miscFeeAmount ?? 0),
  gstAmount: String(course.gstAmount ?? 0),
})
const toPayload = (values) => ({
  courseName: values.courseName,
  description: values.description || null,
  courseFeeAmount: Number(values.courseFeeAmount),
  miscFeeAmount: Number(values.miscFeeAmount),
  gstAmount: Number(values.gstAmount),
})

const CourseManagementFormSection = ({ openCreate, setOpenCreate, openUpdate, setOpenUpdate, selectedRow, onCreateSubmit, onUpdateSubmit, refetch }) => {
  const { t } = useTranslation()
  const amountValidation = [numberHigherThanOrEqual(0)]
  const fields = [
    { key: 'courseName', title: t('course_management.field.course_name'), validate: [maxLen(150)] },
    { key: 'description', title: t('course_management.field.description'), multiline: true, minRows: 3, required: false, validate: [maxLen(1000)] },
    { key: 'courseFeeAmount', title: t('course_management.field.course_fee_amount'), type: 'number', minValue: 0, validate: amountValidation },
    { key: 'miscFeeAmount', title: t('course_management.field.misc_fee_amount'), type: 'number', minValue: 0, validate: amountValidation },
    { key: 'gstAmount', title: t('course_management.field.gst_amount'), type: 'number', minValue: 0, validate: amountValidation },
  ]
  const handleSubmit = (submit) => async ({ values, closeDrawer }) => {
    const response = await submit({ overrideData: toPayload(values) })
    if (!response) return
    closeDrawer()
    await refetch()
  }

  return <>
    <GenericFormDrawer open={openCreate} onClose={() => setOpenCreate(false)} title={t('course_management.title.create')} submitLabel={t('button.create')} initialValues={initialValues} fields={fields} destroyOnClose onSubmit={handleSubmit(onCreateSubmit)} />
    <GenericFormDrawer open={openUpdate} onClose={() => setOpenUpdate(false)} title={t('course_management.title.update')} submitLabel={t('button.update')} initialValues={normalizeInitialValues(selectedRow)} fields={fields} destroyOnClose onSubmit={handleSubmit(onUpdateSubmit)} />
  </>
}

export default CourseManagementFormSection
