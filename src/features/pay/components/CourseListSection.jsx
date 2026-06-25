import { Flex, Typography, Card, Tag } from "antd"
import {
  CheckSquareOutlined,
  DownOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const invoices = [
  {
    id: "CRS-2026-000160",
    title: "Intro to AI",
    netPayable: 11445.0,
    fas: "Income T1",
    paid: 5000.0,
    dueDate: "23/01/2026",
    amountDue: 1445.0,
    status: "Overdue"
  },
  {
    id: "CRS-2026-000161",
    title: "Data Science Fundamentals",
    netPayable: 9850.0,
    fas: "Income T1",
    paid: 4000.0,
    dueDate: "28/01/2026",
    amountDue: 1350.0,
    status: "Overdue"
  },
  {
    id: "CRS-2026-000162",
    title: "Machine Learning Basics",
    netPayable: 12500.0,
    fas: "Income T1",
    paid: 6000.0,
    dueDate: "05/02/2026",
    amountDue: 1250.0,
    status: "Overdue"
  },
  {
    id: "CRS-2026-000163",
    title: "Python for Data Analysis",
    netPayable: 8300.0,
    fas: "Income T1",
    paid: 3000.0,
    dueDate: "12/02/2026",
    amountDue: 1300.0,
    status: "Overdue"
  },
  {
    id: "CRS-2026-000164",
    title: "Deep Learning Essentials",
    netPayable: 14200.0,
    fas: "Income T1",
    paid: 7000.0,
    dueDate: "19/02/2026",
    amountDue: 1700.0,
    status: "Overdue"
  },
  {
    id: "CRS-2026-000165",
    title: "Natural Language Processing",
    netPayable: 10750.0,
    fas: "Income T1",
    paid: 4500.0,
    dueDate: "26/02/2026",
    amountDue: 1250.0,
    status: "Overdue"
  },
  {
    id: "CRS-2026-000166",
    title: "AI Ethics and Governance",
    netPayable: 7900.0,
    fas: "Income T1",
    paid: 3000.0,
    dueDate: "05/03/2026",
    amountDue: 1150.0,
    status: "Overdue"
  },
  {
    id: "CRS-2026-000167",
    title: "Computer Vision",
    netPayable: 11800.0,
    fas: "Income T1",
    paid: 5500.0,
    dueDate: "11/03/2026",
    amountDue: 1500.0,
    status: "Overdue"
  },
  {
    id: "CRS-2026-000168",
    title: "Generative AI Applications",
    netPayable: 13650.0,
    fas: "Income T1",
    paid: 8000.0,
    dueDate: "18/03/2026",
    amountDue: 950.0,
    status: "Overdue"
  },
  {
    id: "CRS-2026-000169",
    title: "Big Data Engineering",
    netPayable: 9500.0,
    fas: "Income T1",
    paid: 2500.0,
    dueDate: "25/03/2026",
    amountDue: 1800.0,
    status: "Overdue"
  }
];

const CourseEntry = ({ invoice }) => {
    const [view, setView] = useState('autoset');
    return (
        <Card
        style={{
            padding: "8px 12px",
            borderRadius: 0
        }}
        bodyStyle={{ padding: 0 }}
        >
            <Flex justify="space-between">
                <Flex vertical align="flex-start" justify="space-between">
                    <Flex align="center" gap={12}>
                    {/* <CheckSquareOutlined style={{ fontSize: 20 }} /> */}

                    <div>
                        <Typography.Title
                        level={4}
                        style={{
                            margin: 0,
                            lineHeight: 1.2,
                        }}
                        >
                        {invoice.title}
                        </Typography.Title>

                        <Typography.Text type="secondary">
                        {invoice.id}
                        </Typography.Text>
                    </div>
                    </Flex>
                </Flex>
                <Flex vertical align="flex-end" gap={4}>
                    <Typography.Title
                    level={3}
                    style={{ margin: 0 }}
                    >
                    ${invoice.amountDue.toLocaleString()}
                    </Typography.Title>

                    <Tag color="error">{invoice.status}</Tag>
                </Flex>
            </Flex>
            <Flex vertical gap={12} style={{ marginTop:'5px',height:view,overflow:'hidden'}}>
                <div style={{borderTop:'1px solid lightgray'}}></div>
                <Flex justify="space-between">
                    <Typography.Title
                        level={5}
                        style={{ margin: 0, color:'gray' }}
                        >
                        Course Fee
                    </Typography.Title>
                    <Typography.Title
                        level={5}
                        style={{ margin: 0}}
                        >
                        $1000000
                    </Typography.Title>
                </Flex>
                <div style={{borderTop:'1px solid lightgray'}}></div>
                <Flex justify="space-between">
                    <Typography.Title
                        level={5}
                        style={{ margin: 0, color:'gray' }}
                        >
                        MISC Fee
                    </Typography.Title>
                    <Typography.Title
                        level={5}
                        style={{ margin: 0}}
                        >
                        $1000000
                    </Typography.Title>
                </Flex>
                <div style={{borderTop:'1px solid lightgray'}}></div>
                <Flex justify="space-between">
                    <Typography.Title
                        level={5}
                        style={{ margin: 0, color:'gray' }}
                        >
                        FAS Income T1
                    </Typography.Title>
                    <Typography.Title
                        level={5}
                        style={{ margin: 0, color:'green'}}
                        >
                        -$1000000
                    </Typography.Title>
                </Flex>
                <div style={{borderTop:'1px solid lightgray'}}></div>
                <Flex justify="space-between">
                    <Typography.Title
                        level={5}
                        style={{ margin: 0, color:'gray' }}
                        >
                        GST 9%
                    </Typography.Title>
                    <Typography.Title
                        level={5}
                        style={{ margin: 0}}
                        >
                        $1000000
                    </Typography.Title>
                </Flex>
                    <div style={{border:'3px solid lightgray'}}>
                        <Flex justify="space-between">
                            <Typography.Title
                                level={5}
                                style={{ margin: 0, color:'green' }}
                                >
                                Net Payable
                            </Typography.Title>
                            <Typography.Title
                                level={5}
                                style={{ margin: 0}}
                                >
                                $1000000
                            </Typography.Title>
                        </Flex>
                    </div>
            </Flex>
        </Card>
    );
};

const InfoBlock = ({ label, value }) => (
  <Flex vertical style={{ padding: "0 32px" }}>
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

const CourseListSection = () => {
    return (
        <>
            <div style={{height:'650px', overflowY:'scroll'}}>
                <Flex vertical gap={5} style={{ flex: 1 }}>
                    {invoices.map((entry) => (
                    <CourseEntry invoice={entry}/>
                    ))}
                </Flex>
            </div>

            <div>
                <Flex justify="space-between">
                    <Typography.Title
                        level={5}
                        style={{ margin: 0, color:'gray' }}
                        >
                        Balance
                    </Typography.Title>
                    <Typography.Title
                        level={5}
                        style={{ margin: 0, color:'green'}}
                        >
                        -$1000000
                    </Typography.Title>
                </Flex>
                <div style={{borderTop:'1px solid lightgray'}}></div>
                <Flex justify="space-between">
                    <Typography.Title
                        level={5}
                        style={{ margin: 0, color:'gray' }}
                        >
                        Total
                    </Typography.Title>
                    <Typography.Title
                        level={5}
                        style={{ margin: 0}}
                        >
                        $1000000
                    </Typography.Title>
                </Flex>
            </div>
        </>
    )
}

export default CourseListSection