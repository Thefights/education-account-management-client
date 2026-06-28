import { theme, Button, Tag, Grid, Divider, Card, Flex, Typography } from 'antd'
import { LockOutlined, ArrowLeftOutlined, WarningOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import useTranslation from '@/shared/hooks/useTranslation'

const InstallmentTrackerPage = () => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const navigate = useNavigate()
  const { state } = useLocation()

  /** Full invoice object passed via navigate(path, { state: { invoice } }) */
  const wip = state?.invoice

  // ─── Formatters ─────────────────────────────────────────────────────────────
  const fmt = (v) =>
    Number(v ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  const fmtDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-SG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // ─── Values straight from the invoice root ──────────────────────────────────
  const netPayable      = wip?.netPayable      ?? 0
  const paidAmount      = wip?.paidAmount      ?? 0
  const remainingAmount = wip?.remainingAmount ?? 0
  const totalInstallments = wip?.totalInstallments ?? 1
  const perMonth        = totalInstallments > 0 ? netPayable / totalInstallments : 0

  // ─── Installment list ───────────────────────────────────────────────────────
  const installments = wip?.installments ?? []
  const timeline = [...installments].sort((a, b) => a.installmentNumber - b.installmentNumber)

  const overdueInstallments = installments.filter((i) => i.status === 'Overdue')
  const paidInstallments    = installments.filter((i) => i.status === 'Paid')
  const nextInstallment     = [...installments]
    .filter((i) => i.status === 'Upcoming')
    .sort((a, b) => a.installmentNumber - b.installmentNumber)[0] ?? null

  // ─── Plan status ─────────────────────────────────────────────────────────────
  const planStatus =
    overdueInstallments.length > 0
      ? 'Overdue'
      : paidInstallments.length === installments.length && installments.length > 0
      ? 'Completed'
      : 'Active'

  const hasFas = wip?.hasFasApplication && wip?.appliedFasSchemeName

  // ─── Dot colour ─────────────────────────────────────────────────────────────
  const dotColor = (status) =>
    status === 'Paid' ? token.colorSuccess
    : status === 'Overdue' ? token.colorError
    : token.colorPrimary

  return (
    <Flex vertical gap={24}>

      {/* Back */}
      <Flex align="center" gap={12}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ fontSize: 16, fontWeight: 600, padding: 0 }}
        >
          Back
        </Button>
      </Flex>

      <Typography.Title level={3} style={{ margin: 0, letterSpacing: '-0.02em' }}>
        Installment Tracker
      </Typography.Title>

      <Card bordered={false}>
        <Flex vertical gap={24}>

          {/* ── Header ── */}
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {wip?.courseName ?? '—'}
            </Typography.Title>
            <Typography.Text type="secondary">{wip?.courseCode ?? '—'}</Typography.Text>
          </div>

          {/* ── Four summary cards ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: screens.md ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
              gap: 12,
            }}
          >
            <SummaryCard token={token}>
              <CardLabel>Net total</CardLabel>
              <CardValue color={token.colorPrimary}>${fmt(netPayable)}</CardValue>
            </SummaryCard>

            <SummaryCard token={token}>
              <CardLabel>Paid so far</CardLabel>
              <CardValue color={token.colorSuccess}>${fmt(paidAmount)}</CardValue>
            </SummaryCard>

            <SummaryCard token={token}>
              <CardLabel>Remaining</CardLabel>
              <CardValue color={overdueInstallments.length > 0 ? token.colorError : undefined}>
                ${fmt(remainingAmount)}
              </CardValue>
            </SummaryCard>

            <SummaryCard token={token}>
              <CardLabel>Per month</CardLabel>
              <CardValue>
                ${fmt(perMonth)}{' '}
                <span style={{ fontSize: 13, fontWeight: 400, color: token.colorTextSecondary }}>
                  × {totalInstallments}
                </span>
              </CardValue>
            </SummaryCard>
          </div>

          {/* ── FAS banner (only when FAS applied) ── */}
          {hasFas && (
            <div
              style={{
                background: '#EDFAF0',
                border: '1px solid #CDEBD3',
                borderRadius: token.borderRadiusLG,
                padding: '14px 16px',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <LockOutlined style={{ color: token.colorSuccess, fontSize: 16, marginTop: 2 }} />
              <Typography.Text style={{ color: '#247A39', fontSize: 13, lineHeight: 1.5 }}>
                Your <strong>{wip.appliedFasSchemeName}{wip.appliedFasTierName ? ` – ${wip.appliedFasTierName}` : ''}</strong> subsidy
                (−${fmt(wip.fasSubsidyAmount)}) is locked into this plan. Future FAS changes will
                not affect these installments.
              </Typography.Text>
            </div>
          )}

          <Divider style={{ margin: '8px 0' }} />

          <Flex gap={32} wrap="wrap">

            {/* ── Left: Timeline ── */}
            <div style={{ flex: '1 1 400px' }}>
              <Typography.Title level={5} style={{ marginBottom: 20 }}>
                Installment schedule
              </Typography.Title>

              <Flex vertical gap={0}>
                {timeline.map((item, index) => {
                  const isLast = index === timeline.length - 1
                  const isOverdue = item.status === 'Overdue'

                  return (
                    <div
                      key={item.id}
                      style={{
                        position: 'relative',
                        paddingLeft: 28,
                        paddingBottom: isLast ? 0 : 24,
                      }}
                    >
                      {/* Connector line */}
                      {!isLast && (
                        <div
                          style={{
                            position: 'absolute',
                            left: 4,
                            top: 20,
                            bottom: -4,
                            width: 2,
                            background: token.colorBorder,
                          }}
                        />
                      )}

                      {/* Dot */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 4,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: dotColor(item.status),
                          boxShadow: `0 0 0 4px ${token.colorBgContainer}`,
                        }}
                      />

                      <Flex vertical gap={4}>
                        <Flex align="center" gap={8} wrap="wrap">
                          <Typography.Text strong style={{ fontSize: 14 }}>
                            Installment {item.installmentNumber} — ${fmt(item.amount)}
                          </Typography.Text>

                          {item.status === 'Paid' && (
                            <Tag color="success" bordered={false} style={{ margin: 0, borderRadius: 20 }}>
                              Paid
                            </Tag>
                          )}
                          {item.status === 'Overdue' && (
                            <Tag color="error" bordered={false} style={{ margin: 0, borderRadius: 20 }}>
                              Overdue
                            </Tag>
                          )}
                          {item.status === 'Upcoming' && (
                            <Tag
                              color="default"
                              bordered={false}
                              style={{ margin: 0, borderRadius: 20, color: token.colorTextSecondary }}
                            >
                              Upcoming
                            </Tag>
                          )}
                        </Flex>

                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          Due: {fmtDate(item.dueDate)}
                        </Typography.Text>

                        {isOverdue && item.becameOverdueAt && (
                          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                            Overdue since: {fmtDate(item.becameOverdueAt)}
                          </Typography.Text>
                        )}

                        {/* Overdue action box */}
                        {isOverdue && (
                          <div
                            style={{
                              marginTop: 8,
                              background: '#FFF0F2',
                              border: '1px solid #FFC9CF',
                              borderRadius: token.borderRadiusLG,
                              padding: '12px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 16,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Flex gap={8} align="flex-start" style={{ flex: 1 }}>
                              <WarningOutlined style={{ color: token.colorError, marginTop: 3 }} />
                              <Typography.Text
                                style={{ color: token.colorError, fontSize: 12, lineHeight: 1.5 }}
                              >
                                Payment missed. Please pay this installment as soon as possible to
                                avoid account restrictions.
                              </Typography.Text>
                            </Flex>
                            <Button color='red' danger style={{ borderRadius: 8 }}>
                              Pay Now
                            </Button>
                          </div>
                        )}

                        {/* Payment allocations */}
                        {item.paymentAllocations?.length > 0 && (
                          <Flex gap={4} wrap="wrap" style={{ marginTop: 4 }}>
                            {item.paymentAllocations.map((alloc, ai) => (
                              <Tag key={ai} color="blue" style={{ fontSize: 11 }}>
                                Paid ${fmt(alloc.amount)} on {fmtDate(alloc.paidAt)}
                              </Tag>
                            ))}
                          </Flex>
                        )}
                      </Flex>
                    </div>
                  )
                })}
              </Flex>
            </div>

            {/* ── Right: Pay panel ── */}
            <div style={{ flex: '1 1 300px' }}>

              {/* Overdue summary strip */}
              {overdueInstallments.length > 0 && (
                <div
                  style={{
                    background: '#FFF0F2',
                    border: '1px solid #FFC9CF',
                    borderRadius: token.borderRadiusLG,
                    padding: '12px 16px',
                    marginBottom: 12,
                  }}
                >
                  <Flex gap={8} align="center">
                    <WarningOutlined style={{ color: token.colorError }} />
                    <Typography.Text strong style={{ color: token.colorError, fontSize: 13 }}>
                      {overdueInstallments.length} overdue installment
                      {overdueInstallments.length > 1 ? 's' : ''}
                    </Typography.Text>
                  </Flex>
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: 12, marginTop: 4, display: 'block' }}
                  >
                    Total overdue: ${fmt(overdueInstallments.reduce((s, i) => s + i.amount, 0))}
                  </Typography.Text>
                </div>
              )}

              {/* Pay remaining early box */}
              <div
                style={{
                  background: token.colorBgLayout,
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadiusLG,
                  padding: 24,
                  textAlign: 'center',
                }}
              >
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 12, display: 'block', marginBottom: 4 }}
                >
                  Remaining balance
                </Typography.Text>

                <div style={{ marginBottom: 4 }}>
                  <Typography.Text
                    strong
                    style={{ fontSize: 36, color: token.colorPrimary, lineHeight: 1 }}
                  >
                    ${fmt(remainingAmount)}
                  </Typography.Text>
                </div>

                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 12, display: 'block', marginBottom: 16 }}
                >
                  {paidAmount > 0
                    ? `$${fmt(paidAmount)} already paid of $${fmt(netPayable)}`
                    : `Nothing paid yet — full amount of $${fmt(netPayable)} outstanding`}
                </Typography.Text>

                <Button
                  type="primary"
                  size="large"
                  block
                  style={{ height: 48, fontWeight: 600, fontSize: 15 }}
                  onClick={() => {
                    navigate('../pay', {
                                state: {
                                    selected: [wip],
                                },
                            });
                  }}
                >
                  Pay Remaining Early
                </Button>

                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 11, display: 'block', marginTop: 10 }}
                >
                  Settle your full remaining balance in one payment.
                </Typography.Text>
              </div>

              {nextInstallment && (
                <Button block style={{ marginTop: 12, height: 44 }}>
                  Pay Next Installment (${fmt(nextInstallment.amount)})
                </Button>
              )}

              <Button block style={{ marginTop: 8, height: 44 }} >
                Change Payment Plan
              </Button>
            </div>

          </Flex>
        </Flex>
      </Card>
    </Flex>
  )
}

// ── Small reusable pieces ─────────────────────────────────────────────────────

const SummaryCard = ({ token, children }) => (
  <div
    style={{
      background: token.colorBgLayout,
      borderRadius: token.borderRadiusLG,
      padding: '16px',
    }}
  >
    {children}
  </div>
)

const CardLabel = ({ children }) => (
  <Typography.Text
    type="secondary"
    style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}
  >
    {children}
  </Typography.Text>
)

const CardValue = ({ children, color }) => (
  <div style={{ marginTop: 4 }}>
    <Typography.Text strong style={{ fontSize: 20, ...(color ? { color } : {}) }}>
      {children}
    </Typography.Text>
  </div>
)

export default InstallmentTrackerPage