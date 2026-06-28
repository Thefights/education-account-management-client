import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import FilterSectionLayout from '@/shared/components/filters/FilterSectionLayout'
import { Col, DatePicker, Form } from 'antd'
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
  <FilterSectionLayout
    actions={
      <>
        <ResetFilterButton onResetFilterClick={handleReset} />
        <FilterButton onFilterClick={() => onFilter?.(selectedDate)} />
      </>
    }
  >
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
  </FilterSectionLayout>
  )
}

export default SweepReportFilterSection
