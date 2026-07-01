import InlineAsyncMultiSelect from '@/shared/components/generals/InlineAsyncMultiSelect'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import GenericTable from '@/shared/components/tables/GenericTable'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDateBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { Button, Flex } from 'antd'
import { useMemo, useState } from 'react'
import { CompactEntityLabel, CourseStudentTableLabel } from './CourseEntityLabels'

const CourseStudentPicker = ({
  value = [],
  onChange,
  options,
  loadOptions,
  getStudentById,
  baseStudents = [],
  loading = false,
}) => {
  const { t } = useTranslation()
  const [pendingStudentIds, setPendingStudentIds] = useState([])
  const addedIds = useMemo(() => (Array.isArray(value) ? value : []), [value])
  const addedIdSet = useMemo(() => new Set(addedIds.map(String)), [addedIds])
  const baseStudentIds = useMemo(
    () => new Set(baseStudents.map((student) => String(student.id))),
    [baseStudents]
  )
  const displayStudents = useMemo(
    () => [
      ...baseStudents.map((student) => ({ ...student, isBase: true })),
      ...addedIds.map((studentId) => {
        const student = getStudentById(studentId)
        return { ...(student || { id: studentId }), isBase: false }
      }),
    ],
    [addedIds, baseStudents, getStudentById]
  )
  const fields = useMemo(
    () => [
      {
        key: 'accountNumber',
        title: t('school_student.field.account_number'),
        width: 180,
      },
      {
        key: 'nric',
        title: t('school_student.field.nric'),
        width: 160,
        render: (fieldValue) => <MaskedNric value={fieldValue} />,
      },
      {
        key: 'fullName',
        title: t('school_student.field.full_name'),
        width: 220,
        render: (fieldValue) => <CourseStudentTableLabel name={fieldValue} />,
      },
      {
        key: 'email',
        title: t('school_student.field.email'),
        width: 240,
      },
      {
        key: 'phoneNumber',
        title: t('school_student.field.phone_number'),
        width: 160,
      },
      {
        key: 'dateOfBirth',
        title: t('school_student.field.date_of_birth'),
        width: 160,
        render: formatDateBasedOnCurrentLanguage,
      },
      {
        key: 'action',
        title: '',
        width: 100,
        render: (_, row) =>
          row.isBase ? null : (
            <Button
              type="link"
              danger
              onClick={() =>
                onChange?.(addedIds.filter((studentId) => String(studentId) !== String(row.id)))
              }
            >
              {t('button.remove')}
            </Button>
          ),
      },
    ],
    [addedIds, onChange, t]
  )

  const handleAdd = () => {
    if (!pendingStudentIds.length) return
    onChange?.([
      ...addedIds,
      ...pendingStudentIds.filter((studentId) => !addedIdSet.has(String(studentId))),
    ])
    setPendingStudentIds([])
  }

  return (
    <Flex vertical gap={12}>
      <Flex gap={8} align="flex-start">
        <div style={{ flex: 1, minWidth: 0 }}>
          <InlineAsyncMultiSelect
            value={pendingStudentIds}
            onChange={setPendingStudentIds}
            placeholder={t('course_management.placeholder.select_students')}
            options={options}
            loadOptions={loadOptions}
            excludedValues={[...baseStudentIds, ...addedIds]}
            renderSelectedLabel={(studentId) => {
              const student = getStudentById(studentId)
              const label = student?.fullName || student?.accountNumber || String(studentId)
              return <CompactEntityLabel name={label} />
            }}
          />
        </div>
        <Button disabled={!pendingStudentIds.length} onClick={() => setPendingStudentIds([])}>
          {t('button.clear')}
        </Button>
        <Button type="primary" disabled={!pendingStudentIds.length} onClick={handleAdd}>
          {pendingStudentIds.length
            ? t('course_management.action.add_selected_students', {
                count: pendingStudentIds.length,
              })
            : t('course_management.action.add_students')}
        </Button>
      </Flex>
      <GenericTable data={displayStudents} fields={fields} rowKey="id" loading={loading} />
    </Flex>
  )
}

export default CourseStudentPicker
