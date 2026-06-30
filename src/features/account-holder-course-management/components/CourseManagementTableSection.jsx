import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultManagementStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { useState } from 'react'
import { Button, Flex, Typography, Modal, Tag, Card, Divider} from 'antd'

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

  const [open, setOpen] = useState(false);

  const [fas, setFas] = useState(null);

  const mockData = [
    {
      id: 1,
      courseCode: 'CS101',
      courseName: 'Computer Science',
      schoolName: 'NUS',
      status: 'Active',
      startDate: '2026-01-15',
      endDate: '2029-12-15',
      fas: 'MOE Tuition Grant',
    },
    {
      id: 2,
      courseCode: 'IT202',
      courseName: 'Information Technology',
      schoolName: 'NTU',
      status: 'Active',
      startDate: '2025-08-01',
      endDate: '2028-05-30',
      fas: 'Study Loan',
    },
    {
      id: 3,
      courseCode: 'BUS303',
      courseName: 'Business Administration',
      schoolName: 'SMU',
      status: 'Pending',
      startDate: '2026-07-01',
      endDate: '2030-06-30',
      fas: 'CPF Education Loan',
    },
    {
      id: 4,
      courseCode: 'ENG404',
      courseName: 'Engineering',
      schoolName: 'SIT',
      status: 'Completed',
      startDate: '2022-01-10',
      endDate: '2025-12-10',
      fas: 'Scholarship',
    },
    {
      id: 5,
      courseCode: 'DS505',
      courseName: 'Data Science',
      schoolName: 'SUSS',
      status: 'Active',
      startDate: '2026-03-01',
      endDate: '2029-02-28',
      fas: 'Bursary',
    },
  ]

  const fields = [
    {
      key: 'courseCode',
      title: t('course_management.field.id'),
      width: 80,
      fixedColumn: true,
    },
    {
      key: 'courseName',
      title: t('course_management.field.course_name'),
      width: 220,
    },
    {
      key: 'schoolName',
      title: t('course_management.field.school'),
      width: 200,
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
    },
    {
      key: 'id',
      title: ' ',
      width: 120,
      render: (_, record) => (
        <>
          <Button
            onClick={() => handleExpand(record.key)}
            style={{ width: '180' }}
            >
              ...
          </Button>
        </>
      )
    },
  ]
;
  const handleExpand = key => {
    setFas(mockData.find(e => e.id === key));
    setOpen(true);
  };


  const FAS = ({ prop }) => {
    const mockData = {
      tier: 'Tier 2',
      subsidy: '30% of course fee',
      courseFee: '$1,500.00',
      miscFee: '$100.00',
      tax: '$144.00',
      grossAmount: '$1,744.00',
      fasDeduction: '-$350.00',
      netPayable: '$1,394.00',
    }

    return (
      <div>
        <Typography.Title
          level={2}
          style={{
            marginBottom: 24,
          }}
        >
          {prop.courseName}
        </Typography.Title>

        <Typography.Text
          strong
          style={{
            color: '#8A94A6',
            letterSpacing: 1,
          }}
        >
          COURSE INFORMATION
        </Typography.Text>

        <div style={{ marginTop: 16 }}>
          <InfoRow
            label="Course ID"
            value={prop.courseCode}
          />

          <InfoRow
            label="Course name"
            value={prop.courseName}
          />

          <InfoRow
            label="School"
            value={prop.schoolName}
          />

          <InfoRow
            label="Start date"
            value={prop.startDate}
          />

          <InfoRow
            label="End date"
            value={prop.endDate}
          />
        </div>
      </div>
    )
  }

  const InfoRow = ({ label, value }) => (
    <Flex
      justify="space-between"
      style={{
        padding: '14px 0',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <Typography.Text type="secondary">
        {label}
      </Typography.Text>

      <Typography.Text strong>
        {value}
      </Typography.Text>
    </Flex>
  )

  const FeeRow = ({
    label,
    value,
    valueStyle,
  }) => (
    <Flex
      justify="space-between"
      style={{
        padding: '6px 0',
      }}
    >
      <Typography.Text>
        {label}
      </Typography.Text>

      <Typography.Text style={valueStyle}>
        {value}
      </Typography.Text>
    </Flex>
  )

  return (
    <>
      <Modal
        open={open}
        footer={null}
        width={750}
        onCancel={() => setOpen(false)}
      >
        <FAS prop = {fas}/>
      </Modal>

      <GenericTable
        data={courses}
        fields={fields}
        rowKey="id"
        loading={loading}
        sort={sort}
        setSort={setSort}
      />
    
    </>
  )
}

export default CourseManagementTableSection
