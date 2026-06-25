import { Flex, Typography, Card, Tag } from "antd"
import {
  CheckSquareOutlined,
  DownOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const CourseEntry = ({ invoice }) => {
    const [view, setView] = useState('0px');
    return (
        <Card
            style={{
                padding: "8px 12px",
            }}
            bodyStyle={{ padding: 0 }}
        >
            <Flex justify="space-between" align="flex-start" gap={24}>
                <Flex vertical gap={12} align="flex-start" justify="space-between">
                    <Flex gap={12} align="center" gap={12}>
                    
                        <CheckSquareOutlined style={{ fontSize: 20 }} />

                        <div>
                            <Typography.Title
                                level={4}
                                style={{
                                    margin: 0,
                                    lineHeight: 1.2,
                                }}
                            >
                            {invoice.courseName}
                            </Typography.Title>

                            <Typography.Text type="secondary">
                                {invoice.courseCode}
                            </Typography.Text>
                        </div>
                    </Flex>

                    <Flex wrap="wrap"
                        gap={24}
                        style={{
                            marginTop: 12,
                        }}>
                    <InfoBlock
                        
                        label="Net payable"
                        value={`$${invoice.netPayable.toLocaleString()}`}
                    />

                    <Divider />

                    <InfoBlock
                        label="FAS"
                        value={invoice.fas}
                    />

                    <Divider />

                    <InfoBlock
                        label="Paid"
                        value={`$${invoice.paidAmount.toLocaleString()}`}
                    />

                    <Divider />

                    <InfoBlock
                        label="Due Date"
                        value={invoice.paymentDueDate?.split('T')[0]}
                    />
                    </Flex>
                </Flex>
                <Flex vertical align="flex-end" gap={4}>
                    <Typography.Title
                        level={3}
                        style={{
                            margin: 0,
                            color:
                                invoice.remainingAmount > 0
                                    ? '#cf1322'
                                    : '#52c41a',
                        }}
                    >
                    ${invoice.remainingAmount.toLocaleString()}
                    </Typography.Title>

                    <Tag color="error"
                        style={{
                            borderRadius: 20,
                            padding: '2px 10px',
                        }}
                    >{invoice.paymentStatus}</Tag>

                    <button onClick={() => {setView(view === '0px' ? 'auto' : '0px')}} style={{border:'none',outline:'none',background:'none'}}>
                        {view !== '0px' ? <DownOutlined /> : <LeftOutlined />}
                    </button>
                </Flex>
            </Flex>
            
            <Flex vertical
                gap={14}
                style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: '1px solid #f0f0f0',
                    height: view,
                    overflow: 'hidden',
                }}
            >
                <Flex justify="space-between">
                    <Typography.Title
                        level={4}
                        style={{ margin: 0, color:'gray' }}s
                        >
                            
                        Course Fee
                    </Typography.Title>


                    <Typography.Title
                        level={4}
                        style={{ margin: 0}}
                        >
                        ${invoice.courseFee}
                    </Typography.Title>
                </Flex>
                <Flex justify="space-between">
                    <Typography.Title
                        level={4}
                        style={{ margin: 0, color:'gray' }}
                        >
                        MISC Fee
                    </Typography.Title>
                    <Typography.Title
                        level={4}
                        style={{ margin: 0}}
                        >
                        ${invoice.miscFee}
                    </Typography.Title>
                </Flex>
                <Flex justify="space-between">
                    <Typography.Title
                        level={4}
                        style={{ margin: 0, color:'gray' }}
                        >
                        FAS Income T1
                    </Typography.Title>
                    <Typography.Title
                        level={4}
                        style={{ margin: 0, color:'green'}}
                        >
                            {invoice.fasSubsidyAmount > 0
                            ? `-$${invoice.fasSubsidyAmount}`
                            : `$${invoice.fasSubsidyAmount}`}
                    </Typography.Title>
                </Flex>
                <Flex justify="space-between">
                    <Typography.Title
                        level={4}
                        style={{ margin: 0, color:'gray' }}
                        >
                        GST 9%
                    </Typography.Title>
                    <Typography.Title
                        level={4}
                        style={{ margin: 0}}
                        >
                        ${invoice.gstAmount}
                    </Typography.Title>
                </Flex>

                <div style={{borderTop:'1px solid lightgray'}}></div>


                <Flex justify="space-between">
                    <Typography.Title
                        level={4}
                        style={{ margin: 0, color:'green' }}
                        >
                        Net Payable
                    </Typography.Title>
                    <Typography.Title
                        level={4}
                        style={{ margin: 0}}
                        >
                        ${invoice.netPayable}
                    </Typography.Title>
                </Flex>


            </Flex>
        </Card>
    );
};

const InfoBlock = ({ label, value }) => (
  <Flex vertical align="center" style={{ padding: "0 32px" }}>
    <Typography.Text type="secondary">
      {label}
    </Typography.Text>

    <Typography.Text strong>
      {value}
    </Typography.Text>
  </Flex>
);

const Divider = () => (
  <div
    style={{
      width: 1,
      height: 40,
      background: "#d9d9d9",
    }}
  />
);

const CourseListSection = ( {collection} ) => {
    return (

        <div style={{height:'500px', overflowY:'scroll'}}>
            <Flex vertical gap={5} style={{ flex: 1 }}>
                {collection.map((entry) => (
                <CourseEntry invoice={entry}/>
                ))}
            </Flex>
        </div>
    )
}

export default CourseListSection