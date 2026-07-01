import { ApiUrls } from '@/shared/api/apiUrls'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Alert, Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import SweepReportFilterSection from '../components/SweepReportFilterSection'
import SweepReportSummarySection from '../components/SweepReportSummarySection'
import SweepReportTargetsTable from '../components/SweepReportTargetsTable'

const defaultDateRange = { dateFrom: '', dateTo: '' }

const SweepReportsPage = () => {
  const { t } = useTranslation()
  const [dateRange, setDateRange] = useState(defaultDateRange)
  const hasDateRange = !!dateRange.dateFrom && !!dateRange.dateTo
  const queryParams = useMemo(
    () => (hasDateRange ? { dateFrom: dateRange.dateFrom, dateTo: dateRange.dateTo } : {}),
    [dateRange.dateFrom, dateRange.dateTo, hasDateRange]
  )
  const reportRequest = useFetch(ApiUrls.SWEEP_REPORT.INDEX, queryParams, [queryParams])
  const report = reportRequest.data

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('batch_report.title')}
        </Typography.Title>
        <SweepReportFilterSection
          key={`${dateRange.dateFrom}-${dateRange.dateTo}`}
          dateRange={dateRange}
          onFilter={setDateRange}
          onReset={() => {
            setDateRange(defaultDateRange)
            return defaultDateRange
          }}
        />
        {report ? (
          <>
            <SweepReportSummarySection report={report} />
            <SweepReportTargetsTable
              key={`${dateRange.dateFrom}-${dateRange.dateTo}`}
              dateRange={dateRange}
            />
          </>
        ) : (
          <Alert
            type="info"
            showIcon
            message={t(
              'batch_report.no_report',
              'No report data available for the selected criteria.'
            )}
          />
        )}
      </Flex>
    </Card>
  )
}

export default SweepReportsPage
