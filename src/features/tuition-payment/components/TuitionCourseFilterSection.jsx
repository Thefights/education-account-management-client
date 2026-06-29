import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import SortButton from '@/shared/components/buttons/SortButton'
import { EnumConfig } from '@/shared/config/enumConfig'
import useEnum from '@/shared/hooks/useEnum'

import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Card, Col, Divider, Flex, Row, Space, Typography } from 'antd'
import { useMemo, useEffect } from 'react'

const TuitionCourseFilterSection = ({
  filters,
  onFilter,
  onReset,
  setFilter,
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
  useEffect(() => {
    reset(filters)
  }, [filters])

  console.log(values);

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
        onEnterDown: () => onFilter?.(values)
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

  const Divider = () => (
      <div
        style={{
          width: 1,
          height: 40,
          background: "#d9d9d9",
        }}
      />
    );

  return (
    <>
    <Space style={{ marginBottom: 16 }}>
      <Button
        type={
          (!values.statuses || values.statuses.length === 0) &&
          values.isInstallment !== true
            ? 'primary'
            : 'default'
        }
        onClick={() => {
          onFilter?.({
            ...values,
            statuses: [],
            isInstallment: undefined
          });
        }}
      >
        {t("text.all")}
      </Button>

      <Button
        type={
          values.statuses?.includes(
            EnumConfig.StudentTuitionFilterStatus.Overdue
          )
            ? 'primary'
            : 'default'
        }
        onClick={() => {
          onFilter?.({
            ...values,
            statuses: [EnumConfig.StudentTuitionFilterStatus.Overdue],
            isInstallment: false
          });
        }}
      >
        {t('text.overdue')}
      </Button>

      <Button
        type={
          values.statuses?.includes(
            EnumConfig.StudentTuitionFilterStatus.Due
          )
            ? 'primary'
            : 'default'
        }
        onClick={() => {
          onFilter?.({
            ...values,
            statuses: [EnumConfig.StudentTuitionFilterStatus.Due],
            isInstallment: false
          });
        }}
      >
        {t('text.due')}
      </Button>

      <Button
        type={values.isInstallment === true ? 'primary' : 'default'}
        onClick={() => {
          onFilter?.({
            ...values,
            statuses: undefined,
            isInstallment: true
          });
        }}
      >
        Installment
      </Button>

      <Button
        type={
          values.statuses?.includes(
            EnumConfig.StudentTuitionFilterStatus.Paid
          )
            ? 'primary'
            : 'default'
        }
        onClick={() => {
          onFilter?.({
            ...values,
            statuses: [EnumConfig.StudentTuitionFilterStatus.Paid],
            isInstallment: false
          });
        }}
      >
        {t('text.paid')}
      </Button>

      {/* <Divider />

      <Flex align='center' gap={5}>
        <SortButton
          loading={loading}
          ascend={sortStatus !== 'desc'}
          onSortClick={onSort}
        />
        <Flex vertical justify='flex-start' align='flex-start'>
          <Typography.Text type="secondary" style={{ fontSize: '0.75rem' }}>
            {`${sortStatus !== 'desc' ? 'accending' : 'descending' }`}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: '0.75rem' }}>
            {`by created date`}
          </Typography.Text>
        </Flex>
      </Flex> */}
    </Space>
    <Row gutter={[16, 16]} align="bottom">
        <Col
          flex={1}
        >
          {renderField(fields[0])}
        </Col>
      </Row>
    </>
  )
}

export default TuitionCourseFilterSection
