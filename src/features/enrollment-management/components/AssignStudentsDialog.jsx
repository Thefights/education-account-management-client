import { ApiUrls } from '@/shared/api/apiUrls'
import axiosConfig from '@/shared/api/axiosClient'
import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { useCallback, useMemo, useRef, useState } from 'react'

const getCourseLabel = (course) => `${course.courseCode} - ${course.courseName}`
const getStudentLabel = (student) => (
  <div
    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
    onClick={(e) => e.stopPropagation()}
  >
    {student.fullName && <span>{student.fullName}</span>}
    {student.fullName && student.accountNumber && <span>&middot;</span>}
    {student.accountNumber && <span>{student.accountNumber}</span>}
  </div>
)

const AssignStudentsDialog = ({ open, onClose, fixedCourse, onAssigned }) => {
  const { t } = useTranslation()
  const fixedCourseId = fixedCourse?.id || ''
  const [currentCourseId, setCurrentCourseId] = useState(fixedCourseId)
  const [studentOptionCache, setStudentOptionCache] = useState({})
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
        .filter((course) => course.status === 'Draft' || course.status === 'Enrolling')
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
      const students = result?.collection || []
      setStudentOptionCache((current) =>
        Object.fromEntries([
          ...Object.entries(current),
          ...students.map((student) => [String(student.id), student]),
        ])
      )
      return {
        options: students.map((student) => ({
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
              placeholder: 'Select a course',
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
        placeholder: 'Select one or more students',
        options: [],
        loadOptions: loadStudentOptions,
        renderOptionValue: (value) => studentOptionCache[String(value)]?.fullName || String(value),
        props: { disabled: !currentCourseId },
      },
    ],
    [
      courseOptions,
      courses.loading,
      currentCourseId,
      fixedCourse,
      loadStudentOptions,
      studentOptionCache,
      t,
    ]
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
