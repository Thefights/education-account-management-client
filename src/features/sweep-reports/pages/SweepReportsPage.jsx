import { ApiUrls } from '@/shared/api/apiUrls'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Alert, Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import SweepReportFilterSection from '../components/SweepReportFilterSection'
import SweepReportSummarySection from '../components/SweepReportSummarySection'
import SweepReportTargetsTable from '../components/SweepReportTargetsTable'

const getCurrentSingaporeDate = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

const SweepReportsPage = () => {
  const { t } = useTranslation()
  const [batchDate, setBatchDate] = useState(getCurrentSingaporeDate)
  const queryParams = useMemo(() => (batchDate ? { date: batchDate } : {}), [batchDate])
  const reportRequest = useFetch(ApiUrls.SWEEP_REPORT.INDEX, queryParams, [queryParams])
  const report = reportRequest.data

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('batch_report.title', 'Account Creation Report')}
        </Typography.Title>
        <SweepReportFilterSection
          key={batchDate}
          batchDate={batchDate}
          onFilter={setBatchDate}
          onReset={() => {
            const currentDate = getCurrentSingaporeDate()
            setBatchDate(currentDate)
            return currentDate
          }}
        />
        {report ? (
          <>
            <SweepReportSummarySection report={report} />
            {batchDate && <SweepReportTargetsTable key={batchDate} batchDate={batchDate} />}
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
