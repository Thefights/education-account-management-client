import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, Divider, Flex, Row, Skeleton, Space, Tag, theme, Typography } from 'antd'
import { defaultManagementStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { getEnumLabelByValue } from '@/shared/utils/handleStringUtil'

const CourseDetailSection = ({ course, loading, onBack }) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const { token } = theme.useToken()

  if (loading && !course) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    )
  }

  if (!course) return null

  const statusLabel = getEnumLabelByValue(_enum.courseStatusOptions, course.status) || course.status
  const statusColor = defaultManagementStatusStyle(course.status)
  const coursePeriod = [
    formatDatetimeStringBasedOnCurrentLanguage(course.startDate),
    formatDatetimeStringBasedOnCurrentLanguage(course.endDate),
  ]
    .filter(Boolean)
    .join(' - ')
  const fasDeduction = course.fasDeductionAmount ?? 0

  const paymentRows = [
    {
      label: t('course_management.field.course_fee_amount'),
      value: course.courseFeeAmount,
    },
    {
      label: t('course_management.field.misc_fee_amount'),
      value: course.miscFeeAmount,
    },
    {
      label: t('course_management.field.gst_amount'),
      value: course.gstAmount,
    },
    {
      label: t('course_management.field.gross_amount'),
      value: course.grossAmount,
      strong: true,
    },
    {
      label: t('course_management.field.fas_deduction_amount'),
      value: fasDeduction ? -Math.abs(fasDeduction) : 0,
      accent: 'success',
    },
  ]

  return (
    <Flex vertical gap={16}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ alignSelf: 'flex-start' }}
      >
        {t('course_management.action.back_to_courses')}
      </Button>

      <Card>
        <Flex vertical gap={14}>
          <Flex justify="space-between" gap={12} wrap="wrap">
            <Space direction="vertical" size={4}>
              <Space size={8} wrap>
                <Typography.Text type="secondary">{course.courseCode}</Typography.Text>
                <Tag color={statusColor}>{statusLabel}</Tag>
              </Space>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {course.courseName}
              </Typography.Title>
            </Space>
          </Flex>

          <Row gutter={[12, 12]}>
            <Col xs={24} md={12}>
              <Flex gap={10} align="center">
                <CalendarOutlined style={{ color: token.colorPrimary }} />
                <Flex vertical>
                  <Typography.Text type="secondary">
                    {t('course_management.field.enrollment_deadline')}
                  </Typography.Text>
                  <Typography.Text strong>
                    {formatDatetimeStringBasedOnCurrentLanguage(course.enrollmentDeadline) || '-'}
                  </Typography.Text>
                </Flex>
              </Flex>
            </Col>
            <Col xs={24} md={12}>
              <Flex gap={10} align="center">
                <CalendarOutlined style={{ color: token.colorPrimary }} />
                <Flex vertical>
                  <Typography.Text type="secondary">
                    {t('course_management.field.course_period')}
                  </Typography.Text>
                  <Typography.Text strong>{coursePeriod || '-'}</Typography.Text>
                </Flex>
              </Flex>
            </Col>
          </Row>
        </Flex>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <Card
            title={
              <Space>
                <DollarOutlined />
                {t('course_management.title.payment_summary')}
              </Space>
            }
          >
            <Flex vertical gap={12}>
              {paymentRows.map((item, index) => (
                <Flex key={item.label} vertical gap={12}>
                  {index === 3 && <Divider style={{ margin: 0 }} />}
                  <Flex justify="space-between" align="center" gap={12}>
                    <Typography.Text type="secondary">{item.label}</Typography.Text>
                    <Typography.Text
                      strong={item.strong}
                      type={item.accent}
                      style={{ fontSize: item.strong ? 16 : undefined }}
                    >
                      {formatCurrencyBasedOnCurrentLanguage(item.value)}
                    </Typography.Text>
                  </Flex>
                </Flex>
              ))}

              <Divider style={{ margin: '4px 0' }} />
              <Flex justify="space-between" align="flex-end" gap={12} wrap="wrap">
                <Flex vertical>
                  <Typography.Text strong>
                    {t('course_management.field.total_to_pay')}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {t('course_management.message.total_to_pay_hint')}
                  </Typography.Text>
                </Flex>
                <Typography.Title level={2} style={{ margin: 0, color: token.colorPrimary }}>
                  {formatCurrencyBasedOnCurrentLanguage(course.totalToPay)}
                </Typography.Title>
              </Flex>
            </Flex>
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card
            title={
              <Space>
                <SafetyCertificateOutlined />
                {t('course_management.title.financial_assistance')}
              </Space>
            }
            style={{ height: '100%' }}
          >
            {course.appliedFasSchemeName ? (
              <Flex vertical gap={14}>
                <Flex vertical gap={4}>
                  <Typography.Text type="secondary">
                    {t('course_management.field.applied_fas')}
                  </Typography.Text>
                  <Typography.Text strong>{course.appliedFasSchemeName}</Typography.Text>
                </Flex>
                <Flex vertical gap={4}>
                  <Typography.Text type="secondary">
                    {t('course_management.field.approved_tier')}
                  </Typography.Text>
                  <Typography.Text strong>{course.appliedFasTierName || '-'}</Typography.Text>
                </Flex>
                <Flex vertical gap={4}>
                  <Typography.Text type="secondary">
                    {t('course_management.field.deduction')}
                  </Typography.Text>
                  <Typography.Title level={4} style={{ margin: 0, color: token.colorSuccess }}>
                    {formatCurrencyBasedOnCurrentLanguage(fasDeduction)}
                  </Typography.Title>
                </Flex>
              </Flex>
            ) : (
              <Typography.Text type="secondary">
                {t('course_management.message.no_applied_fas')}
              </Typography.Text>
            )}
          </Card>
        </Col>
      </Row>
    </Flex>
  )
}

export default CourseDetailSection
