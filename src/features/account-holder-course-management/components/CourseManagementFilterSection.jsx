import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Card, Col, Flex, Row, Space } from 'antd'

const emptyFilters = { search: '', statuses: [] }

const CourseManagementFilterSection = ({ tab, setTab, counts, filters, onFilter, onReset, loading }) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const { values, handleChange, setField, registerRef, reset } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const fields = [
    {
      key: 'search',
      title: t('course_management.placeholder.searchbyID'),
      label: t('course_management.placeholder.searchbyID'),
      type: 'search',
      required: false,
      reserveLabelSpace: true,
    },
  ]

  return (
    <>
      <Space style={{ marginBottom: 16 }}>

         <Button
          type={tab === 3 ? 'primary' : 'default'}
          onClick={() => setTab(3)}
        >
          {t('course_management.tab.upcoming')} ({counts?.upcoming ?? 0})
        </Button>

        <Button
          type={tab === 4 ? 'primary' : 'default'}
          onClick={() => setTab(4)}
        >
          {t('course_management.tab.in_progress')} ({counts?.inProgress ?? 0})
        </Button>

        <Button
          type={tab === 5 ? 'primary' : 'default'}
          onClick={() => setTab(5)}
        >
          {t('course_management.tab.closed')} ({counts?.closed ?? 0})
        </Button>

      </Space>
    
      <Card size="small">
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} md={12}>
            {renderField(fields[0])}
          </Col>
          <Col xs={24} md={6}>
            <Flex justify="end">
              <Space>
                <ResetFilterButton
                  loading={loading}
                  onResetFilterClick={() => {
                    reset(emptyFilters)
                    onReset?.()
                  }}
                />
                <FilterButton loading={loading} onFilterClick={() => onFilter?.(values)} />
              </Space>
            </Flex>
          </Col>
        </Row>
      </Card>
    </>
  )
}

export default CourseManagementFilterSection
