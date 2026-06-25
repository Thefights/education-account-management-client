import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import SortButton from '@/shared/components/buttons/SortButton'
import { EnumConfig } from '@/shared/config/enumConfig'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Col, Flex, Row, Space } from 'antd'
import { useMemo } from 'react'

const TuitionCourseFilterSection = ({
  filters,
  onFilter,
  onReset,
  schoolOptions,
  schoolsLoading,
  loading = false,
  onSort,
  sortStatus,
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

  console.log(sortStatus);

  const adminRoleOptions = useMemo(
    () => _enum.roleIdOptions.filter((option) => option.value !== EnumConfig.RoleId.AccountHolder),
    [_enum.roleIdOptions]
  )
  const fields = useMemo(
    () => [
      {
        key: 'search',
        title: 'Search',
        label: 'Search',
        placeholder: 'By Course ID, Name',
        type: 'search',
        required: false,
        reserveLabelSpace: true,
      },
      {
        key: 'statuses',
        title: t('admin_management.field.status'),
        type: 'multi-check-dropdown',
        options: _enum.tuitionstatus,
        required: false,
        placeholder: t('text.all'),
        selectAllText: t('general.select_all'),
        searchPlaceholder: t('general.input_keyword'),
        cancelText: t('general.cancel'),
        okText: t('general.ok'),
        selectedText: (count) => `${count} ${t('text.items')}`,
      }
    ],
    [t, adminRoleOptions, _enum.authAccountStatusOptions, schoolOptions, schoolsLoading]
  )

  const handleReset = () => {
    reset({ search: '', roles: [], statuses: [], schoolIds: [] })
    onReset?.()
  }

  return (
    <Card size="small">
      {/* <Row gutter={[16, 16]} align="bottom">
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
              <SortButton loading={loading} ascend={sortStatus === 'desc' ? false : true} onSortClick={() => onSort()}/>
            </Space>
          </Flex>
        </Col>
      </Row> */}


      <Row gutter={[16, 16]} align="bottom">
        {fields.map((field, index) => (
          <Col
            key={field.key}
            flex={index === 0 ? '2' : '1'}
          >
            {renderField(field)}
          </Col>
        ))}

        <Col flex="none">
          <Flex justify="end">
            <Space>
              <ResetFilterButton
                loading={loading}
                onResetFilterClick={handleReset}
              />

              <FilterButton
                loading={loading}
                onFilterClick={() => onFilter?.(values)}
              />

              <SortButton
                loading={loading}
                ascend={sortStatus !== 'desc'}
                onSortClick={onSort}
              />
            </Space>
          </Flex>
        </Col>
      </Row>


    </Card>
  )
}

export default TuitionCourseFilterSection
