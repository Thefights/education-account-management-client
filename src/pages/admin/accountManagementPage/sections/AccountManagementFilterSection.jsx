import FilterButton from '@/components/buttons/FilterButton'
import ResetFilterButton from '@/components/buttons/ResetFilterButton'
import useEnum from '@/hooks/useEnum'
import useFieldRenderer from '@/hooks/useFieldRenderer'
import useForm from '@/hooks/useForm'
import useTranslation from '@/hooks/useTranslation'
import { Card, Col, Flex, Row, Space } from 'antd'
import { useMemo } from 'react'

const AccountManagementFilterSection = ({ filters = {}, onFilter, onReset, loading = false }) => {
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

  const filterFields = useMemo(
    () => [
      {
        key: 'search',
        title: t('account.placeholder.search_text'),
        label: t('account.placeholder.search_text'),
        type: 'search',
        required: false,
        reserveLabelSpace: true,
      },
      {
        key: 'status',
        title: t('account.field.status'),
        type: 'select',
        options: [{ value: '', label: t('text.all') }, ..._enum.authAccountStatusOptions],
        required: false,
      },
      {
        key: 'gender',
        title: t('account.field.gender'),
        type: 'select',
        options: [{ value: '', label: t('text.all') }, ..._enum.genderOptions],
        required: false,
      },
      {
        key: 'role',
        title: t('account.field.roles'),
        type: 'select',
        options: [{ value: '', label: t('text.all') }, ..._enum.roleOptions],
        required: false,
      },
    ],
    [t, _enum.authAccountStatusOptions, _enum.genderOptions, _enum.roleOptions]
  )

  const handleReset = () => {
    reset({})
    onReset?.()
  }

  return (
    <Card size="small">
      <Row gutter={[16, 16]} align="bottom">
        {filterFields.map((field, index) => (
          <Col key={field.key} xs={24} md={index === 0 ? 8 : 4}>
            {renderField(field)}
          </Col>
        ))}

        <Col xs={24} md={4}>
          <Flex justify="end" style={{ height: '100%' }}>
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

export default AccountManagementFilterSection
