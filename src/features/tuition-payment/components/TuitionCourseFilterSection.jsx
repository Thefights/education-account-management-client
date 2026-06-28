import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import SortButton from '@/shared/components/buttons/SortButton'
import { EnumConfig } from '@/shared/config/enumConfig'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Card, Col, Divider, Flex, Row, Space } from 'antd'
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
        type={(values.statuses?.length === 0 ) ? 'primary' : 'default'}
        onClick={() => {
            onFilter?.({
              ...values,
              statuses: [],
              isInstallment: false
            })
          }
        }
      >
        {t("text.all")}
      </Button>

      <Button
        type={values.statuses?.includes(1) ? 'primary' : 'default'}
        onClick={() => {
            onFilter?.({
              ...values,
              statuses: [1],
              isInstallment: false
            })
          }
        }
      >
        {t('text.overdue')}
      </Button>

      <Button
        type={values.statuses?.includes(2) ? 'primary' : 'default'}
        onClick={() => {
            onFilter?.({
              ...values,
              statuses: [2],
              isInstallment: false
            })
          }
        }
      >
        {t('text.due')}
      </Button>

      <Button
        type={values.isInstallment ? 'primary' : 'default'}
        onClick={() => {
            onFilter?.({
              ...values,
              statuses: undefined,
              isInstallment: true
            })
          }
        }
      >
        {"Installment"}
      </Button>

      <Button
        type={values.statuses?.includes(4) ? 'primary' : 'default'}
        onClick={() => {
            onFilter?.({
              ...values,
              statuses: [4]
            })
          }
        }
      >
        {t('text.paid')}
      </Button>

      <Divider />

      <SortButton
                loading={loading}
                ascend={sortStatus !== 'desc'}
                onSortClick={onSort}
              />
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
