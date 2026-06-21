import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import { Card, Col, DatePicker, Flex, Form, Row, Space } from 'antd'
import dayjs from 'dayjs'
import useTranslation from '@/shared/hooks/useTranslation'
import { useState } from 'react'
import { CalendarOutlined } from '@ant-design/icons'
import { Typography } from 'antd'

const FieldBox = ({ title, children }) => (
  <div>
    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
      {title}
    </Typography.Text>
    {children}
  </div>
)

const SweepReportFilterSection = ({ batchDate, onFilter, onReset }) => {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(batchDate)

  const handleReset = () => {
    const resetDate = onReset?.()
    if (resetDate) setSelectedDate(resetDate)
  }

  return (
  <Card size="small">
    <Row gutter={[16, 16]} align="bottom">
      <Col xs={24} sm={12} lg={8}>
        <FieldBox title={t('batch_report.batch_date')}>
          <Form.Item style={{ marginBottom: 0 }}>
            <DatePicker
              value={selectedDate ? dayjs(selectedDate) : null}
              onChange={(date) => setSelectedDate(date ? date.format('YYYY-MM-DD') : '')}
              allowClear={false}
              suffixIcon={<CalendarOutlined />}
              style={{ width: '100%', height: 40 }}
              placeholder={t('batch_report.select_date')}
            />
          </Form.Item>
        </FieldBox>
      </Col>
      <Col xs={24} sm={12} lg={16}>
        <Flex justify="end">
          <Space>
            <ResetFilterButton onResetFilterClick={handleReset} />
            <FilterButton onFilterClick={() => onFilter?.(selectedDate)} />
          </Space>
        </Flex>
      </Col>
    </Row>
  </Card>
  )
}

export default SweepReportFilterSection
