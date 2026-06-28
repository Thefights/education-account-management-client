import { Table, Typography, Flex, Button, Divider } from "antd";
import { theme } from "antd";
import useEnum from "@/shared/hooks/useEnum";

const CourseListSection = ({
  selected = [],
  plans = {},
  onPlanChange,
  getPayToday,
  totalDueToday = 0,
  totalGross = 0,
}) => {
  const { token } = theme.useToken();
  const _enum = useEnum();

  const totalFasDeduction = selected.reduce(
    (sum, item) => sum + Number(item.fasSubsidyAmount || 0),
    0
  );

  const totalNetPayable = selected.reduce(
    (sum, item) => sum + Number(item.netPayable || 0),
    0
  );

  const fmt = (v) =>
    Number(v || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

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
          ${fmt(value)}
        </Typography.Text>
      ),
    },
    {
      title: "Payment Plan",
      key: "paymentPlan",
      align: "center",
      render: (_, record) => {
        const currentMonths = plans[record.courseCode] || 1;
        return (
          <Flex gap={4} wrap="wrap" justify="center">
            {_enum.paymentPlanOptions.map((opt) => (
              <Button
                key={opt.value}
                size="small"
                type={currentMonths === opt.value ? "primary" : "default"}
                style={{
                  borderRadius: 20,
                  minWidth: 42,
                  fontSize: 12,
                }}
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
        const payToday = getPayToday(record);
        const months = plans[record.courseCode] || 1;
        return (
          <Flex vertical align="flex-end">
            <Typography.Text strong style={{ fontSize: 14 }}>
              ${fmt(payToday)}
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
          expandedRowRender: (record) => (
            <Flex vertical gap={8} style={{ padding: "4px 0" }}>
              <Flex justify="space-between">
                <Typography.Text type="secondary">Course fee</Typography.Text>
                <Typography.Text strong>${fmt(record.courseFee)}</Typography.Text>
              </Flex>

              <Flex justify="space-between">
                <Typography.Text type="secondary">Misc fee</Typography.Text>
                <Typography.Text strong>${fmt(record.miscFee)}</Typography.Text>
              </Flex>

              <Flex justify="space-between">
                <Typography.Text type="secondary">Tax (GST 9%)</Typography.Text>
                <Typography.Text strong>${fmt(record.gstAmount)}</Typography.Text>
              </Flex>

              <Divider style={{ margin: "4px 0" }} />

              <Flex justify="space-between">
                <Typography.Text strong>Gross amount</Typography.Text>
                <Typography.Text strong>
                  ${fmt(
                    Number(record.courseFee || 0) +
                      Number(record.miscFee || 0) +
                      Number(record.gstAmount || 0)
                  )}
                </Typography.Text>
              </Flex>

              <Flex justify="space-between">
                <Flex vertical>
                  <Typography.Text style={{ color: token.colorSuccess }}>
                    FAS deduction
                  </Typography.Text>
                  {record.appliedFasSchemeName && (
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      {record.appliedFasSchemeName}
                    </Typography.Text>
                  )}
                </Flex>
                <Typography.Text strong style={{ color: token.colorSuccess }}>
                  {Number(record.fasSubsidyAmount || 0) > 0
                    ? `-$${fmt(record.fasSubsidyAmount)}`
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
          ),
        }}
      />

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
          <Typography.Text strong>${fmt(totalGross)}</Typography.Text>
        </Flex>

        <Flex justify="space-between" style={{ marginBottom: 6 }}>
          <Typography.Text style={{ color: token.colorSuccess }}>
            Total FAS deduction
          </Typography.Text>
          <Typography.Text strong style={{ color: token.colorSuccess }}>
            {totalFasDeduction > 0 ? `-$${fmt(totalFasDeduction)}` : "—"}
          </Typography.Text>
        </Flex>

        <Flex justify="space-between" style={{ marginBottom: 6 }}>
          <Typography.Text type="secondary">Total net payable</Typography.Text>
          <Typography.Text strong>${fmt(totalNetPayable)}</Typography.Text>
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
            ${fmt(totalDueToday)}
          </Typography.Title>
        </Flex>
      </div>
    </Flex>
  );
};

export default CourseListSection;