import { ApiUrls } from '@/shared/api/apiUrls'
import axiosConfig from '@/shared/api/axiosClient'
import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { useCallback, useMemo, useRef, useState } from 'react'

const getCourseLabel = (course) => `${course.courseCode} - ${course.courseName}`
const getStudentLabel = (student) =>
  [student.fullName, student.nric, student.accountNumber].filter(Boolean).join(' · ')

const AssignStudentsDialog = ({ open, onClose, fixedCourse, onAssigned }) => {
  const { t } = useTranslation()
  const fixedCourseId = fixedCourse?.id || ''
  const [currentCourseId, setCurrentCourseId] = useState(fixedCourseId)
  const previousCourseIdRef = useRef(fixedCourseId)
  const courses = useFetch(fixedCourse ? '' : ApiUrls.COURSE_MANAGEMENT.GET_ALL)
  const assignFromEnrollment = useAxiosSubmit({
    url: ApiUrls.ENROLLMENT_MANAGEMENT.INDEX,
    method: 'POST',
  })
  const assignFromCourse = useAxiosSubmit({
    url: fixedCourseId ? ApiUrls.COURSE_MANAGEMENT.ENROLLMENTS(fixedCourseId) : '',
    method: 'POST',
  })

  const courseOptions = useMemo(
    () =>
      (courses.data || [])
        .filter((course) => course.status === 'Draft')
        .map((course) => ({ value: course.id, label: getCourseLabel(course) })),
    [courses.data]
  )

  const loadStudentOptions = useCallback(
    async ({ search, page, pageSize }) => {
      if (!currentCourseId) return { options: [], totalCount: 0 }
      const response = await axiosConfig.get(
        ApiUrls.COURSE_MANAGEMENT.ELIGIBLE_STUDENTS(currentCourseId),
        { params: { search, page, pageSize } }
      )
      const result = response?.data
      return {
        options: (result?.collection || []).map((student) => ({
          value: student.id,
          label: getStudentLabel(student),
        })),
        totalCount: result?.totalCount || 0,
      }
    },
    [currentCourseId]
  )

  const fields = useMemo(
    () => [
      ...(!fixedCourse
        ? [
            {
              key: 'courseId',
              title: t('enrollment_management.field.course'),
              type: 'select',
              options: courseOptions,
              props: {
                loading: courses.loading,
                showSearch: true,
                optionFilterProp: 'label',
              },
            },
          ]
        : []),
      {
        key: 'schoolStudentIds',
        title: t('enrollment_management.field.students'),
        type: 'select',
        multiple: true,
        options: [],
        loadOptions: loadStudentOptions,
        props: { disabled: !currentCourseId },
      },
    ],
    [courseOptions, courses.loading, currentCourseId, fixedCourse, loadStudentOptions, t]
  )

  const handleClose = () => {
    setCurrentCourseId(fixedCourseId)
    previousCourseIdRef.current = fixedCourseId
    onClose?.()
  }

  const handleValuesChange = useCallback((values, { setField }) => {
    const nextCourseId = values.courseId || ''
    if (
      previousCourseIdRef.current &&
      previousCourseIdRef.current !== nextCourseId &&
      values.schoolStudentIds?.length
    ) {
      setField('schoolStudentIds', [])
    }
    previousCourseIdRef.current = nextCourseId
    setCurrentCourseId((current) => (current === nextCourseId ? current : nextCourseId))
  }, [])

  const handleSubmit = async ({ values, closeDialog }) => {
    const response = fixedCourse
      ? await assignFromCourse.submit({
          overrideData: { schoolStudentIds: values.schoolStudentIds },
        })
      : await assignFromEnrollment.submit({
          overrideData: {
            courseId: values.courseId,
            schoolStudentIds: values.schoolStudentIds,
          },
        })
    if (!response) return
    closeDialog()
    await onAssigned?.()
  }

  return (
    <GenericFormDialog
      open={open}
      onClose={handleClose}
      title={
        fixedCourse
          ? t('enrollment_management.title.add_students_to_course', {
              course: getCourseLabel(fixedCourse),
            })
          : t('enrollment_management.title.assign_students')
      }
      submitLabel={t('enrollment_management.action.assign')}
      initialValues={{ courseId: fixedCourseId, schoolStudentIds: [] }}
      fields={fields}
      onValuesChange={handleValuesChange}
      destroyOnHidden
      onSubmit={handleSubmit}
    />
  )
}

export default AssignStudentsDialog
