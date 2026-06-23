import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  isSingaporeDateTimeBefore,
  singaporeWallTimeToIso,
  toSingaporeDateTimeInput,
} from '@/shared/utils/dateTimeUtil'
import { maxLen, numberHigherThanOrEqual } from '@/shared/utils/validateUtil'
import { useMemo } from 'react'

const initialValues = {
  courseName: '',
  description: '',
  courseFeeAmount: '0',
  miscFeeAmount: '0',
  enrollmentDueDate: '',
  fasApplicationDueDate: '',
  startDate: '',
  endDate: '',
}

const normalizeInitialValues = (course = {}) => ({
  courseName: course.courseName ?? '',
  description: course.description ?? '',
  courseFeeAmount: String(course.courseFeeAmount ?? 0),
  miscFeeAmount: String(course.miscFeeAmount ?? 0),
  enrollmentDueDate: toSingaporeDateTimeInput(course.enrollmentDueDate),
  fasApplicationDueDate: toSingaporeDateTimeInput(course.fasApplicationDueDate),
  startDate: toSingaporeDateTimeInput(course.startDate),
  endDate: toSingaporeDateTimeInput(course.endDate),
  gstAmount: String(course.gstAmount ?? ''),
  totalFeeAmount: String(course.totalFeeAmount ?? ''),
  rowVersion: course.rowVersion ?? '',
})

const toPayload = (values, includeRowVersion = false) => ({
  courseName: values.courseName,
  description: values.description || null,
  courseFeeAmount: Number(values.courseFeeAmount),
  miscFeeAmount: Number(values.miscFeeAmount),
  enrollmentDueDate: singaporeWallTimeToIso(values.enrollmentDueDate),
  fasApplicationDueDate: singaporeWallTimeToIso(values.fasApplicationDueDate),
  startDate: singaporeWallTimeToIso(values.startDate),
  endDate: singaporeWallTimeToIso(values.endDate),
  ...(includeRowVersion ? { rowVersion: values.rowVersion } : {}),
})

const CourseManagementFormSection = ({
  openCreate,
  setOpenCreate,
  openUpdate,
  setOpenUpdate,
  selectedRow,
  onCreateSubmit,
  onUpdateSubmit,
  refetch,
}) => {
  const { t } = useTranslation()
  const amountValidation = useMemo(() => [numberHigherThanOrEqual(0)], [])

  const getFields = (basicInfoOnly = false, showServerFees = false) => [
    { key: 'courseName', title: t('course_management.field.course_name'), validate: [maxLen(150)] },
    {
      key: 'description',
      title: t('course_management.field.description'),
      multiline: true,
      minRows: 3,
      required: false,
      validate: [maxLen(1000)],
    },
    {
      key: 'courseFeeAmount',
      title: t('course_management.field.course_fee_amount'),
      type: 'number',
      minValue: 0,
      validate: amountValidation,
      props: { disabled: basicInfoOnly },
    },
    {
      key: 'miscFeeAmount',
      title: t('course_management.field.misc_fee_amount'),
      type: 'number',
      minValue: 0,
      validate: amountValidation,
      props: { disabled: basicInfoOnly },
    },
    ...(showServerFees
      ? [
          {
            key: 'gstAmount',
            title: t('course_management.field.gst_amount'),
            type: 'number',
            required: false,
            props: { readOnly: true },
          },
          {
            key: 'totalFeeAmount',
            title: t('course_management.field.total_fee_amount'),
            type: 'number',
            required: false,
            props: { readOnly: true },
          },
        ]
      : []),
    {
      key: 'enrollmentDueDate',
      title: `${t('course_management.field.enrollment_due_date')} (${t('text.singapore_time')})`,
      type: 'datetime-local',
      props: { disabled: basicInfoOnly },
    },
    {
      key: 'fasApplicationDueDate',
      title: `${t('course_management.field.fas_application_due_date')} (${t('text.singapore_time')})`,
      type: 'datetime-local',
      validate: [
        (value, values) =>
          !isSingaporeDateTimeBefore(value, values.enrollmentDueDate) ||
          t('course_management.validation.date_order'),
      ],
      props: { disabled: basicInfoOnly },
    },
    {
      key: 'startDate',
      title: `${t('course_management.field.start_date')} (${t('text.singapore_time')})`,
      type: 'datetime-local',
      validate: [
        (value, values) =>
          !isSingaporeDateTimeBefore(value, values.fasApplicationDueDate) ||
          t('course_management.validation.date_order'),
      ],
      props: { disabled: basicInfoOnly },
    },
    {
      key: 'endDate',
      title: `${t('course_management.field.end_date')} (${t('text.singapore_time')})`,
      type: 'datetime-local',
      validate: [
        (value, values) =>
          !isSingaporeDateTimeBefore(value, values.startDate) ||
          t('course_management.validation.date_order'),
      ],
      props: { disabled: basicInfoOnly },
    },
  ]

  const handleSubmit =
    (submit, includeRowVersion = false) =>
    async ({ values, closeDialog }) => {
      const response = await submit({ overrideData: toPayload(values, includeRowVersion) })
      if (!response) return
      closeDialog()
      await refetch()
    }

  const isEnrolling = selectedRow.status === 'Enrolling'

  return (
    <>
      <GenericFormDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title={t('course_management.title.create')}
        submitLabel={t('button.create')}
        initialValues={initialValues}
        fields={getFields()}
        destroyOnHidden
        onSubmit={handleSubmit(onCreateSubmit)}
      />
      <GenericFormDialog
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        title={t('course_management.title.update')}
        submitLabel={t('button.update')}
        initialValues={normalizeInitialValues(selectedRow)}
        fields={getFields(isEnrolling, true)}
        destroyOnHidden
        onSubmit={handleSubmit(onUpdateSubmit, true)}
      />
    </>
  )
}

export default CourseManagementFormSection
