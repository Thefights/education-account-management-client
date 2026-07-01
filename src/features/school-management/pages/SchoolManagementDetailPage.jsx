import { ApiUrls } from '@/shared/api/apiUrls'
import GenericDetail from '@/shared/components/details/GenericDetail'
import { defaultManagementStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { getEnumLabelByValue, renderEmptyFallback } from '@/shared/utils/handleStringUtil'
import { isEmail, maxLen } from '@/shared/utils/validateUtil'
import { Tag } from 'antd'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const SchoolManagementDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const _enum = useEnum()
  const detail = useFetch(ApiUrls.SCHOOL_MANAGEMENT.DETAIL(id))
  const updateSchool = useAxiosSubmit({
    url: ApiUrls.SCHOOL_MANAGEMENT.DETAIL(id),
    method: 'PUT',
  })
  const school = detail.data
  const statusLabel =
    getEnumLabelByValue(_enum.schoolStatusOptions, school?.status) || school?.status
  const initialValues = useMemo(
    () =>
      school
        ? {
            schoolName: school.schoolName,
            address: school.address,
            phoneNumber: school.phoneNumber,
            email: school.email,
          }
        : {},
    [school]
  )
  const fields = useMemo(
    () => [
      {
        key: 'schoolName',
        label: t('school_management.field.school_name'),
      },
      {
        key: 'address',
        label: t('school_management.field.address'),
      },
      {
        key: 'phoneNumber',
        label: t('school_management.field.phone_number'),
      },
      {
        key: 'email',
        label: t('school_management.field.email'),
      },
      {
        key: 'id',
        label: t('school_management.field.id'),
      },
      {
        key: 'status',
        label: t('school_management.field.status'),
        render: (value) =>
          value ? (
            <Tag color={defaultManagementStatusStyle(value)}>{statusLabel}</Tag>
          ) : (
            renderEmptyFallback(null)
          ),
      },
      {
        key: 'createdAt',
        label: t('audit_log.field.created_at'),
        render: (value) =>
          formatDatetimeStringBasedOnCurrentLanguage(value) || renderEmptyFallback(null),
      },
    ],
    [statusLabel, t]
  )
  const editableFields = [
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

  const handleSave = async ({ values }) => {
    const response = await updateSchool.submit({
      overrideData: {
        schoolName: values.schoolName,
        address: values.address,
        phoneNumber: values.phoneNumber,
        email: values.email,
      },
    })
    if (!response) return false

    await detail.fetch()
    return true
  }

  return (
    <GenericDetail
      title={t('school_management.title.detail')}
      data={school}
      fields={fields}
      loading={detail.loading}
      onBack={() => navigate(-1)}
      edit={{
        initialValues,
        fields: editableFields,
        loading: updateSchool.loading,
        onSubmit: handleSave,
      }}
    />
  )
}

export default SchoolManagementDetailPage
