import { Card, Col, Row, Statistic } from 'antd'
import useTranslation from '@/shared/hooks/useTranslation'

const SweepReportSummarySection = ({ report }) => {
  const { t } = useTranslation()
  return (
  <>
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12}>
        <Card size="small"><Statistic title={t('batch_report.batch_date')} value={report.batchDate} /></Card>
      </Col>
      <Col xs={24} sm={12}>
        <Card size="small"><Statistic title={t('batch_report.total_duration')} value={report.totalDuration} /></Card>
      </Col>
    </Row>
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <Statistic title={t('batch_report.created_successfully', 'Created')} value={report.accountsCreatedSuccessfully} valueStyle={{ color: '#0E8845' }} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <Statistic title={t('batch_report.extended', 'Extended')} value={report.accountsExtended} valueStyle={{ color: '#1677ff' }} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <Statistic title={t('batch_report.closed', 'Closed')} value={report.accountsClosed} valueStyle={{ color: '#faad14' }} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <Statistic title={t('batch_report.failed', 'Failed')} value={report.accountsFailedManualHandling} valueStyle={{ color: '#C8102E' }} />
        </Card>
      </Col>
    </Row>
  </>
  )
}

export default SweepReportSummarySection
