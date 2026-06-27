import { Table, Typography, Tag, Flex } from "antd";

const CourseListSection = ({ selected = [] }) => {
  const totalAmount = selected.reduce(
    (sum, item) => sum + (item.remainingAmount || 0),
    0
  );

  const columns = [
    {
      title: "Course",
      key: "course",
      render: (_, record) => (
        <Flex vertical>
          <Typography.Text strong>
            {record.courseName}
          </Typography.Text>

          <Typography.Text type="secondary">
            {record.courseCode}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: "Remaining Amount",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      align: "right",
      render: (value) => (
        <Typography.Text strong>
          ${Number(value || 0).toLocaleString()}
        </Typography.Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      align: "center",
      render: (status) => (
        <Tag color="error">
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <Flex vertical gap={16}>
      <Table
        rowKey={(record) => record.courseCode}
        columns={columns}
        dataSource={selected}
        pagination={false}
        scroll={{
          y: 600,
        }}
        expandable={{
          expandedRowRender: (record) => (
            <Flex vertical gap={12}>
              <Flex justify="space-between">
                <Typography.Text type="secondary">
                  Course Fee
                </Typography.Text>

                <Typography.Text strong>
                  ${Number(record.courseFee || 0).toLocaleString()}
                </Typography.Text>
              </Flex>

              <Flex justify="space-between">
                <Typography.Text type="secondary">
                  Misc Fee
                </Typography.Text>

                <Typography.Text strong>
                  ${Number(record.miscFee || 0).toLocaleString()}
                </Typography.Text>
              </Flex>

              <Flex justify="space-between">
                <Typography.Text type="secondary">
                  FAS Income T1
                </Typography.Text>

                <Typography.Text style={{ color: "green" }} strong>
                  -$1,000,000
                </Typography.Text>
              </Flex>

              <Flex justify="space-between">
                <Typography.Text type="secondary">
                  GST 9%
                </Typography.Text>

                <Typography.Text strong>
                  $1,000,000
                </Typography.Text>
              </Flex>

              <div
                style={{
                  padding: 12,
                  border: "1px solid #d9d9d9",
                  borderRadius: 8,
                }}
              >
                <Flex justify="space-between">
                  <Typography.Text
                    strong
                    style={{ color: "green" }}
                  >
                    Net Payable
                  </Typography.Text>

                  <Typography.Text strong>
                    ${Number(record.netPayable || 0).toLocaleString()}
                  </Typography.Text>
                </Flex>
              </div>
            </Flex>
          ),
        }}
      />

      <div
        style={{
          borderTop: "1px solid #f0f0f0",
          paddingTop: 16,
        }}
      >
        <Flex justify="space-between">
          <Typography.Title
            level={5}
            style={{
              margin: 0,
              color: "gray",
            }}
          >
            Balance
          </Typography.Title>

          <Typography.Title
            level={5}
            style={{
              margin: 0,
              color: "green",
            }}
          >
            -$1,000,000
          </Typography.Title>
        </Flex>

        <Flex
          justify="space-between"
          style={{
            marginTop: 8,
          }}
        >
          <Typography.Title
            level={5}
            style={{
              margin: 0,
              color: "gray",
            }}
          >
            Total
          </Typography.Title>

          <Typography.Title
            level={5}
            style={{
              margin: 0,
            }}
          >
            ${totalAmount.toLocaleString()}
          </Typography.Title>
        </Flex>
      </div>
    </Flex>
  );
};

export default CourseListSection;