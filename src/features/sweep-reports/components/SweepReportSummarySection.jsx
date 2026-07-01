import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Col, Row, Statistic, theme } from 'antd'

const SweepReportSummarySection = ({ report }) => {
  const { t } = useTranslation()
  const { token } = theme.useToken()

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title={t('batch_report.created_successfully', 'Created')}
              value={report.accountsCreatedSuccessfully}
              valueStyle={{ color: token.colorSuccess }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title={t('batch_report.extended', 'Extended')}
              value={report.accountsExtended}
              valueStyle={{ color: token.colorPrimary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title={t('batch_report.closed', 'Closed')}
              value={report.accountsClosed}
              valueStyle={{ color: token.colorWarning }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title={t('batch_report.failed', 'Failed')}
              value={report.accountsFailedManualHandling}
              valueStyle={{ color: token.colorError }}
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default SweepReportSummarySection
