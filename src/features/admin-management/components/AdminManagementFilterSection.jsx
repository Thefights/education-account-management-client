import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import { EnumConfig } from '@/shared/config/enumConfig'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Col, Flex, Row, Space } from 'antd'
import { useMemo } from 'react'

const AdminManagementFilterSection = ({
  filters,
  onFilter,
  onReset,
  schoolOptions,
  schoolsLoading,
  loading = false,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const { values, handleChange, setField, registerRef, reset } = useForm(filters)
  const { renderField } = useFieldRenderer(
    values,
    setField,
    handleChange,
    registerRef,
    false,
    'outlined',
    'medium'
  )

  const adminRoleOptions = useMemo(
    () => _enum.roleIdOptions.filter((option) => option.value !== EnumConfig.RoleId.AccountHolder),
    [_enum.roleIdOptions]
  )
  const fields = useMemo(
    () => [
      {
        key: 'search',
        title: t('admin_management.label.search'),
        label: t('admin_management.label.search'),
        placeholder: t('admin_management.placeholder.search'),
        type: 'search',
        required: false,
        reserveLabelSpace: true,
      },
      {
        key: 'roles',
        title: t('admin_management.field.role'),
        type: 'select',
        multiple: true,
        options: adminRoleOptions,
        required: false,
        props: { allowClear: true, placeholder: t('text.all') },
      },
      {
        key: 'statuses',
        title: t('admin_management.field.status'),
        type: 'select',
        multiple: true,
        options: _enum.authAccountStatusOptions,
        required: false,
        props: { allowClear: true, placeholder: t('text.all') },
      },
      {
        key: 'schoolIds',
        title: t('admin_management.field.school'),
        type: 'select',
        multiple: true,
        options: schoolOptions,
        props: {
          loading: schoolsLoading,
          showSearch: true,
          allowClear: true,
          optionFilterProp: 'label',
          placeholder: t('text.all'),
        },
        required: false,
      },
    ],
    [t, adminRoleOptions, _enum.authAccountStatusOptions, schoolOptions, schoolsLoading]
  )

  const handleReset = () => {
    reset({ search: '', roles: [], statuses: [], schoolIds: [] })
    onReset?.()
  }

  return (
    <Card size="small">
      <Row gutter={[16, 16]} align="bottom">
        {fields.map((field) => (
          <Col key={field.key} xs={24} md={6}>
            {renderField(field)}
          </Col>
        ))}
        <Col xs={24} md={{ span: 20, offset: 4 }}>
          <Flex justify="end">
            <Space>
              <ResetFilterButton loading={loading} onResetFilterClick={handleReset} />
              <FilterButton loading={loading} onFilterClick={() => onFilter?.(values)} />
            </Space>
          </Flex>
        </Col>
      </Row>
    </Card>
  )
}

export default AdminManagementFilterSection
