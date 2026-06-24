import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultManagementStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { useState } from 'react'
import { Button, Flex, Typography } from 'antd'
import { data } from 'react-router'

const formatAmount = (value) => (value == null ? null : Number(value).toLocaleString())

const CourseManagementTableSection = ({
  courses,
  loading,
  sort,
  setSort,
}) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const { t } = useTranslation()
  const _enum = useEnum()
  const fields = [
    {
      key: 'id',
      title: t('course_management.field.id'),
      width: 80,
      fixedColumn: true,
    },
    {
      key: 'courseName',
      title: t('course_management.field.course_name'),
      width: 220
    },
    { 
      key: 'schoolName', 
      title: t('course_management.field.school'), 
      width: 200
    },
    {
      key: 'status',
      title: t('course_management.field.status'),
      width: 120,
      type: 'tag',
      options: _enum.courseStatusOptions,
      color: defaultManagementStatusStyle,
    },
    {
      key: 'startDate',
      title: t('course_management.field.start_date'),
      sortable: true,
    },
    {
      key: 'endDate',
      title: t('course_management.field.end_date'),
      sortable: true,
    },
    {
      key: 'id',
      title: t('FAS'),
      render: (_, record) => (
      <>
        <Button
          onClick={() => handleExpand(record.key)}
          style={{ width:'100px' }}
        >
          Select FAS
        </Button>
        {record.name}
      </>
    ),
    }
  ]

  const handleExpand = key => {
    setExpandedRowKeys(keys =>
      keys.includes(key)
        ? keys.filter(k => k !== key)
        : [...keys, key]
    );
  };

  const FAS = ({ prop }) => {
    return (
      <div>
        <Typography.Title level={4} style={{ margin: 0, lineHeight: 1.2, color:'#2962cc' }}>
          Select FAS for {courses.find(a => a.id === prop.key).courseName}
        </Typography.Title>
        <p>{prop.key}</p>
      </div>
    )
  }

  return (
    <GenericTable
      data={courses}
      fields={fields}
      rowKey="id"
      loading={loading}
      sort={sort}
      setSort={setSort}
      expandedRowKeys={expandedRowKeys}
      expandelement={<FAS />}
    />
  )
}

export default CourseManagementTableSection
