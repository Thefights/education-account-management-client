import { Table, Typography, Flex, Button, Divider, Tag } from "antd";
import { theme } from "antd";
import useEnum from "@/shared/hooks/useEnum";

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (v) =>
  Number(v ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const statusTagColor = (status) => {
  if (status === "Paid") return "success";
  if (status === "Overdue") return "error";
  if (status === "Upcoming") return "default";
  return "default";
};

// ─── expanded rows ──────────────────────────────────────────────────────────

const NormalExpandedRow = ({ record, token }) => (
  <Flex vertical gap={8} style={{ padding: "4px 0" }}>
    <Flex justify="space-between">
      <Typography.Text type="secondary">Course fee</Typography.Text>
      <Typography.Text strong>S${fmt(record.courseFee)}</Typography.Text>
    </Flex>

    <Flex justify="space-between">
      <Typography.Text type="secondary">Misc fee</Typography.Text>
      <Typography.Text strong>S${fmt(record.miscFee)}</Typography.Text>
    </Flex>

    <Flex justify="space-between">
      <Typography.Text type="secondary">Tax (GST 9%)</Typography.Text>
      <Typography.Text strong>S${fmt(record.gstAmount)}</Typography.Text>
    </Flex>

    <Divider style={{ margin: "4px 0" }} />

    <Flex justify="space-between">
      <Typography.Text strong>Gross amount</Typography.Text>
      <Typography.Text strong>S${fmt(record.grossAmount)}</Typography.Text>
    </Flex>

    <Flex justify="space-between">
      <Flex vertical>
        <Typography.Text style={{ color: token.colorSuccess }}>
          FAS deduction
        </Typography.Text>
        {record.appliedFasSchemeName && (
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            {record.appliedFasSchemeName}
            {record.appliedFasTierName ? ` – ${record.appliedFasTierName}` : ""}
          </Typography.Text>
        )}
      </Flex>
      <Typography.Text strong style={{ color: token.colorSuccess }}>
        {Number(record.fasSubsidyAmount || 0) > 0
          ? `-S$${fmt(record.fasSubsidyAmount)}`
          : "—"}
      </Typography.Text>
    </Flex>

    <Divider style={{ margin: "4px 0" }} />

    <Flex justify="space-between">
      <Typography.Text strong style={{ color: token.colorPrimary }}>
        Net payable
      </Typography.Text>
      <Typography.Text strong style={{ color: token.colorPrimary }}>
        ${fmt(record.netPayable)}
      </Typography.Text>
    </Flex>
  </Flex>
);

const InstallmentExpandedRow = ({ record, token }) => {
  const installments = record.installments ?? [];

  return (
    <Flex vertical gap={0} style={{ padding: "4px 0" }}>
      {/* Fee breakdown */}
      <Flex gap={24} wrap="wrap" style={{ marginBottom: 12 }}>
        <Flex gap={4}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Course fee:
          </Typography.Text>
          <Typography.Text strong style={{ fontSize: 12 }}>
            ${fmt(record.courseFee)}
          </Typography.Text>
        </Flex>
        <Flex gap={4}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Misc fee:
          </Typography.Text>
          <Typography.Text strong style={{ fontSize: 12 }}>
            ${fmt(record.miscFee)}
          </Typography.Text>
        </Flex>
        <Flex gap={4}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            GST:
          </Typography.Text>
          <Typography.Text strong style={{ fontSize: 12 }}>
            ${fmt(record.gstAmount)}
          </Typography.Text>
        </Flex>
        <Flex gap={4}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Gross Amount
          </Typography.Text>
          <Typography.Text strong style={{ fontSize: 12 }}>
            ${fmt(record.grossAmount)}
          </Typography.Text>
        </Flex>
        {Number(record.fasSubsidyAmount) > 0 && (
          <Flex gap={4}>
            <Typography.Text style={{ color: token.colorSuccess, fontSize: 12 }}>
              FAS:
            </Typography.Text>
            <Typography.Text
              strong
              style={{ color: token.colorSuccess, fontSize: 12 }}
            >
              -${fmt(record.fasSubsidyAmount)}
            </Typography.Text>
          </Flex>
        )}
      </Flex>

      {/* Progress bar */}
      <Flex justify="space-between" style={{ marginBottom: 6 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Already Paid
        </Typography.Text>
        <Typography.Text strong style={{ fontSize: 12 }}>
          ${fmt(record.paidAmount)} / ${fmt(record.netPayable)}
        </Typography.Text>
      </Flex>
      <div
        style={{
          height: 4,
          borderRadius: 99,
          background: token.colorBorder,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 99,
            width: `${Math.min(
              100,
              (Number(record.paidAmount) / Number(record.netPayable || 1)) * 100
            )}%`,
            background: token.colorSuccess,
          }}
        />
      </div>
    </Flex>
  );
};

// ─── main component ──────────────────────────────────────────────────────────

const CourseListSection = ({
  selected = [],
  plans = {},
  onPlanChange,
  getPayToday,
  totalDueToday = 0,
  totalGross = 0,
  singleinstallment
}) => {
  const { token } = theme.useToken();
  const _enum = useEnum();

  selected.forEach(e => {
    totalGross += e.grossAmount
  })

  const totalFasDeduction = selected.reduce(
    (sum, item) => sum + Number(item.fasSubsidyAmount || 0),
    0
  );

  const totalNetPayable = selected.reduce(
    (sum, item) => sum + Number(item.netPayable || 0),
    0
  );

  // ─── columns ───────────────────────────────────────────────────────────────

  const columns = [
    {
      title: "Course",
      key: "course",
      render: (_, record) => (
        <Flex vertical>
          <Typography.Text strong>{record.courseName}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.courseCode}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: "Net Payable",
      dataIndex: "netPayable",
      key: "netPayable",
      align: "right",
      render: (value) => (
        <Typography.Text strong style={{ color: token.colorPrimary }}>
          S${fmt(value)}
        </Typography.Text>
      ),
    },
    {
      // For installments: shows "X of Y · Status"
      // For regular: shows plan picker buttons
      title: "Payment Plan",
      key: "paymentPlan",
      align: "center",
      render: (_, record) => {
        if (record.isInstallment) {
          return (
            <Flex vertical align="center" gap={4}>
              <Typography.Text strong style={{ fontSize: 13 }}>
                {singleinstallment?.installmentNumber?? record.currentInstallmentNumber} of {record.totalInstallments}
              </Typography.Text>
              <Tag
                color={statusTagColor(singleinstallment?.status?? record.installments.find(e => e.installmentNumber == record.currentInstallmentNumber)?.status)}
                bordered={false}
                style={{ borderRadius: 20, margin: 0 }}
              >
                {singleinstallment?.status?? record.installments.find(e => e.installmentNumber == record.currentInstallmentNumber)?.status}
              </Tag>
            </Flex>
          );
        }

        const currentMonths = plans[record.courseCode] || 1;
        return (
          <Flex gap={4} wrap="wrap" justify="center">
            {_enum.paymentPlanOptions.map((opt) => (
              <Button
                key={opt.value}
                size="small"
                type={currentMonths === opt.value ? "primary" : "default"}
                style={{ borderRadius: 20, minWidth: 42, fontSize: 12 }}
                onClick={() => onPlanChange(record.courseCode, opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </Flex>
        );
      },
    },
    {
      title: "Pay Today",
      key: "payToday",
      align: "right",
      render: (_, record) => {
        if (record.isInstallment) {
          // For installments: show remaining amount
          const remaining = record.isInstallment ? Number(singleinstallment?.amount?? record.installments?.filter(e => e.status != 'Paid' && e.installmentNumber == record?.currentInstallmentNumber).reduce((sum, item) => sum + item.amount, 0)) : Number(record.remainingAmount ?? 0);
          const isOverdue = record.paymentStatus === "Overdue";
          return (
            <Flex vertical align="flex-end">
              <Typography.Text
                strong
                style={{
                  fontSize: 14,
                  color: isOverdue ? token.colorError : undefined,
                }}
              >
                S${fmt(remaining)}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                remaining
              </Typography.Text>
            </Flex>
          );
        }

        const payToday = getPayToday(record);
        const months = plans[record.courseCode] || 1;
        return (
          <Flex vertical align="flex-end">
            <Typography.Text strong style={{ fontSize: 14 }}>
              S${fmt(payToday)}
            </Typography.Text>
            {months > 1 && (
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                1 of {months} installments
              </Typography.Text>
            )}
          </Flex>
        );
      },
    },
  ];

  // ─── render ────────────────────────────────────────────────────────────────

  return (
    <Flex vertical gap={0}>
      <div style={{ marginBottom: 8 }}>
        <Typography.Text
          type="secondary"
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Selected courses
        </Typography.Text>
      </div>

      <Table
        rowKey={(record) => record.courseCode}
        columns={columns}
        dataSource={selected}
        pagination={false}
        scroll={{ y: 400 }}
        expandable={{
          expandedRowRender: (record) =>
            record.isInstallment ? (
              <InstallmentExpandedRow record={record} token={token} />
            ) : (
              <NormalExpandedRow record={record} token={token} />
            ),
        }}
      />

      {/* ── Footer totals ── */}
      <div
        style={{
          background: token.colorBgLayout,
          borderRadius: `0 0 ${token.borderRadiusLG}px ${token.borderRadiusLG}px`,
          padding: "14px 16px",
          borderTop: `1px solid ${token.colorBorder}`,
        }}
      >
        <Flex justify="space-between" style={{ marginBottom: 6 }}>
          <Typography.Text type="secondary">Total gross amount</Typography.Text>
          <Typography.Text strong>S${fmt(totalGross)}</Typography.Text>
        </Flex>

        <Flex justify="space-between" style={{ marginBottom: 6 }}>
          <Typography.Text style={{ color: token.colorSuccess }}>
            Total FAS deduction
          </Typography.Text>
          <Typography.Text strong style={{ color: token.colorSuccess }}>
            {totalFasDeduction > 0 ? `-S$${fmt(totalFasDeduction)}` : "—"}
          </Typography.Text>
        </Flex>

        <Flex justify="space-between" style={{ marginBottom: 6 }}>
          <Typography.Text type="secondary">Total net payable</Typography.Text>
          <Typography.Text strong>S${fmt(totalNetPayable)}</Typography.Text>
        </Flex>

        <Divider style={{ margin: "8px 0" }} />

        <Flex justify="space-between">
          <Typography.Title level={5} style={{ margin: 0 }}>
            Total due today
          </Typography.Title>
          <Typography.Title
            level={5}
            style={{ margin: 0, color: token.colorPrimary }}
          >
            S${fmt(totalDueToday)}
          </Typography.Title>
        </Flex>
      </div>
    </Flex>
  );
};

export default CourseListSection;