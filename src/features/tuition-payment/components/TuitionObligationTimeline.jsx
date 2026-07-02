import { CalendarOutlined, DownOutlined, RightOutlined } from '@ant-design/icons'
import { Checkbox, Empty, Flex, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'

const obligationKey = (item) =>
  item.installmentId ? `installment:${item.installmentId}` : `charge:${item.chargeId}`

const statusColor = {
  Overdue: 'error',
  Due: 'processing',
  Upcoming: 'default',
  Paid: 'success',
}

const getDaysUntilPayable = (paymentOpenDate) => {
  if (!paymentOpenDate) return 0
  return dayjs(paymentOpenDate).startOf('day').diff(dayjs().startOf('day'), 'day')
}

const TuitionObligationTimeline = ({
  months,
  year,
  selectedKeys,
  onToggle,
  onToggleMonth,
}) => {
  const { t } = useTranslation()
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const [openMonths, setOpenMonths] = useState(
    () => new Set(year === currentYear ? [currentMonth] : [])
  )

  const toggleMonth = (month) => {
    setOpenMonths((current) => {
      const next = new Set(current)
      if (next.has(month)) next.delete(month)
      else next.add(month)
      return next
    })
  }

  const toggleItem = (item, checked) => {
    if (!item.isPayable) return
    onToggle(item, checked)
  }

  const handleItemKeyDown = (event, item, checked) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    toggleItem(item, checked)
  }

  return (
    <div className="tuition-timeline">
      {months.map((month) => {
        const monthName = dayjs().month(month.month - 1).format('MMMM')
        const monthShortName = dayjs().month(month.month - 1).format('MMM').toUpperCase()
        const hasOverdue = month.items.some((item) => item.status === 'Overdue')
        const hasDue = month.items.some((item) => item.status === 'Due')
        const featuredStatus = hasOverdue
          ? 'Overdue'
          : hasDue
            ? 'Due'
            : month.items.find((item) => item.status !== 'Paid')?.status
        const isCurrentMonth = year === currentYear && month.month === currentMonth
        const isOpen = openMonths.has(month.month)
        const payableItems = month.items.filter((item) => item.isPayable)
        const selectedPayableCount = payableItems.filter((item) =>
          selectedKeys.has(obligationKey(item))
        ).length
        return (
          <section
            key={month.month}
            className={`tuition-month${hasOverdue ? ' tuition-month--attention' : ''}${
              isCurrentMonth ? ' tuition-month--current' : ''
            }${isOpen ? ' tuition-month--open' : ''}${
              month.items.length > 0 ? ' tuition-month--has-items' : ' tuition-month--empty'
            }`}
          >
            <header className="tuition-month__header">
              <span className="tuition-month__node" />
              <Checkbox
                checked={payableItems.length > 0 && selectedPayableCount === payableItems.length}
                indeterminate={
                  selectedPayableCount > 0 && selectedPayableCount < payableItems.length
                }
                disabled={payableItems.length === 0}
                aria-label={t('tuition-payment.timeline.select_month', { month: monthName })}
                onChange={(event) => onToggleMonth(month.items, event.target.checked)}
              />
              <button
                type="button"
                className="tuition-month__toggle"
                aria-expanded={isOpen}
                onClick={() => toggleMonth(month.month)}
              >
                <span className="tuition-month__badge" aria-hidden="true">
                  <span className="tuition-month__badge-month">{monthShortName}</span>
                  <span className="tuition-month__badge-year">{year}</span>
                </span>
                <span className="tuition-month__calendar"><CalendarOutlined /></span>
                <span className="tuition-month__main">
                  <Typography.Title level={4} className="tuition-month__title">
                    {monthName} {year}
                  </Typography.Title>
                  <span className="tuition-month__meta">
                    <span className="tuition-month__mini-chip tuition-month__mini-chip--count">
                      {t('tuition-payment.timeline.obligations_count', {
                        count: month.items.length,
                      })}
                    </span>
                    {featuredStatus && (
                      <Tag
                        color={statusColor[featuredStatus]}
                        className="tuition-month__status-chip"
                      >
                        {t(`tuition-payment.status.${featuredStatus}`)}
                      </Tag>
                    )}
                  </span>
                </span>
                <span className="tuition-month__summary">
                  <span className="tuition-month__amount-pill">
                    {formatCurrencyBasedOnCurrentLanguage(month.totalAmount)}
                  </span>
                  <span className="tuition-month__chevron-wrap">
                    {isOpen ? (
                      <DownOutlined className="tuition-month__chevron" />
                    ) : (
                      <RightOutlined className="tuition-month__chevron" />
                    )}
                  </span>
                </span>
              </button>
            </header>

            {isOpen && <div className="tuition-month__items">
              {month.items.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t('tuition-payment.timeline.empty_month')}
                />
              ) : (
                month.items.map((item) => {
                  const key = obligationKey(item)
                  const isInstallment = item.obligationType === 'Installment'
                  const isSelected = selectedKeys.has(key)
                  const daysUntilPayable =
                    item.status === 'Upcoming' && !item.isPayable
                      ? getDaysUntilPayable(item.paymentOpenDate)
                      : 0
                  return (
                    <div
                      key={key}
                      className={`tuition-obligation${
                        isSelected ? ' tuition-obligation--selected' : ''
                      }${item.isPayable ? ' tuition-obligation--payable' : ' tuition-obligation--disabled'}`}
                      role="checkbox"
                      aria-checked={isSelected}
                      aria-disabled={!item.isPayable}
                      tabIndex={item.isPayable ? 0 : -1}
                      onClick={() => toggleItem(item, !isSelected)}
                      onKeyDown={(event) => handleItemKeyDown(event, item, !isSelected)}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={!item.isPayable}
                        aria-label={item.courseName}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => toggleItem(item, event.target.checked)}
                      />
                      <Flex vertical gap={2} className="tuition-obligation__course">
                        <Typography.Text type="secondary" className="tuition-obligation__label">
                          {t('tuition-payment.charge.course')}
                        </Typography.Text>
                        <Typography.Text strong>{item.courseName}</Typography.Text>
                        <Typography.Text type="secondary">{item.courseCode}</Typography.Text>
                        {item.priorOverdueInstallments?.length > 0 && (
                          <Typography.Text type="danger" className="tuition-obligation__debt">
                            {t('tuition-payment.timeline.previous_overdue', {
                              count: item.priorOverdueInstallments.length,
                            })}
                          </Typography.Text>
                        )}
                      </Flex>
                      <div className="tuition-obligation__type">
                        <Typography.Text type="secondary" className="tuition-obligation__label">
                          {isInstallment
                            ? t('tuition-payment.timeline.installment')
                            : t('tuition-payment.timeline.payment_type')}
                        </Typography.Text>
                        {isInstallment ? (
                          <>
                            <Typography.Text strong>
                              {item.installmentNumber} / {item.totalInstallments}
                            </Typography.Text>
                          </>
                        ) : (
                          <Typography.Text>{t('tuition-payment.timeline.full_payment')}</Typography.Text>
                        )}
                      </div>
                      <Flex vertical gap={3} className="tuition-obligation__date">
                        <Typography.Text type="secondary" className="tuition-obligation__label">
                          {t('tuition-payment.charge.due_date')}
                        </Typography.Text>
                        <Typography.Text><CalendarOutlined /> {dayjs(item.dueDate).format('DD MMM YYYY')}</Typography.Text>
                      </Flex>
                      <Flex vertical gap={3} className="tuition-obligation__amount">
                        <Typography.Text type="secondary" className="tuition-obligation__label">
                          {t('tuition-payment.timeline.amount')}
                        </Typography.Text>
                        <Typography.Text strong>{formatCurrencyBasedOnCurrentLanguage(item.amount)}</Typography.Text>
                      </Flex>
                      <Flex vertical gap={3} className="tuition-obligation__status">
                        <Typography.Text type="secondary" className="tuition-obligation__label">
                          {t('tuition-payment.timeline.status')}
                        </Typography.Text>
                        <Tag color={statusColor[item.status]}>{t(`tuition-payment.status.${item.status}`)}</Tag>
                        {daysUntilPayable > 0 && (
                          <Typography.Text
                            type="secondary"
                            className="tuition-obligation__availability"
                          >
                            {t('tuition-payment.timeline.payable_in_days', {
                              count: daysUntilPayable,
                            })}
                          </Typography.Text>
                        )}
                      </Flex>
                    </div>
                  )
                })
              )}
            </div>}
          </section>
        )
      })}
    </div>
  )
}

export default TuitionObligationTimeline
