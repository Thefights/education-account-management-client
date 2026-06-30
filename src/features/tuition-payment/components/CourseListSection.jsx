import { Flex, Typography, Card, Tag, Button, Checkbox, Divider as AntDivider } from "antd"
import {
  CheckSquareOutlined,
  DownOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import "./CourseListSection.css";

const CourseEntry = ({ invoice, handleCheck, pay }) => {
    const navigate = useNavigate();
    const [view, setView] = useState('0px');
    const { token } = theme.useToken();
    const currInstallment = invoice?.installments?.find(e => e.status != 'Paid');
    
    return (
        <Card
            style={{ padding: "0", borderRadius: '12px', overflow: 'hidden' }}
            styles={{ body: { padding: 0 } }}
            className="course-entry-card"
        >
            <Flex justify="space-between" align="center" wrap="wrap" gap={24} style={{ padding: "20px 24px" }}>
                <Flex vertical gap={16}>
                    <Flex align="center" gap={16}>
                        <Checkbox 
                            disabled={invoice.isInstallment && currInstallment == null ? true : false} 
                            style={{ transform: 'scale(1.2)' }}
                            onChange={(e) => {handleCheck(invoice, e.target.checked)}} 
                        />

                        <div>
                            <Typography.Title level={5} style={{ margin: 0, lineHeight: 1.2 }}>
                                {invoice.courseName}
                            </Typography.Title>
                            <Typography.Text type="secondary">
                                {invoice.courseCode}
                            </Typography.Text>
                        </div>
                    </Flex>

                    <Flex gap={80} justify="space-around" align="center" style={{ minWidth: '350px' }}>
                        <InfoBlock
                            label="Gross fee"
                            value={`$${invoice.grossAmount.toLocaleString()}`}
                        />
                        <AntDivider type="vertical" style={{ height: '40px', background: 'var(--app-border-color, #e2eaf3)' }} />
                        <InfoBlock
                            label="Net payable"
                            value={`$${invoice.netPayable.toLocaleString()}`}
                        />
                        <AntDivider type="vertical" style={{ height: '40px', background: 'var(--app-border-color, #e2eaf3)' }} />
                        <InfoBlock
                            label="FAS"
                            value={invoice.hasFasApplication ? invoice.appliedFasSchemeName : "N/A"}
                        />
                        <AntDivider type="vertical" style={{ height: '40px', background: 'var(--app-border-color, #e2eaf3)' }} />
                        <InfoBlock
                            label="Due Date"
                            value={invoice.paymentDueDate?.split('T')[0]}
                        />
                    </Flex>
                </Flex>

                <Flex vertical align="flex-end" gap={4}>
                    <Typography.Title
                        level={5}
                        style={{
                            margin: 0,
                            color:
                                invoice.isInstallment && currInstallment?.status == 'Overdue' ? '#cf1322'
                                : invoice.isInstallment && currInstallment?.status == 'Paid' ? '#52c41a'
                                : invoice.isInstallment && currInstallment?.status == 'PendingPayment' ? 'var(--app-primary, geekblue)'
                                : invoice.remainingAmount > 0
                                    ? '#cf1322'
                                    : '#52c41a',
                        }}
                    >
                    ${currInstallment?.amount ?? invoice.remainingAmount.toLocaleString()}
                    </Typography.Title>

                    <Tag 
                        color={
                            invoice.paymentStatus === 'Paid' ? 'success'
                                : invoice.paymentStatus === 'Due' ? 'warning'
                                : invoice.paymentStatus === 'Overdue' ? 'error'
                                : currInstallment != null ? 'error'
                                : currInstallment == null ? 'success'
                                : invoice.isInstallment ? 'geekblue'
                                : 'default'
                        }
                        style={{
                            borderRadius: 20,
                            padding: '2px 10px',
                            margin: 0
                        }}
                    >
                        {invoice.isInstallment ? (currInstallment != null ? `installment • ${invoice.currentInstallmentNumber}/${invoice.totalInstallments}` : `installment • ${invoice.paymentStatus}`) : invoice.paymentStatus}
                    </Tag>
                </Flex>
            </Flex>

            <Flex align="center" justify="flex-start" className="expandable-bar" onClick={() => {setView(view === '0px' ? 'auto' : '0px')}}>
                <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                    Fee breakdown
                </Typography.Text>
            </Flex>
            
            <Flex
                vertical
                gap={view ? 5 : 0}
                style={{
                    height: view,
                    overflow: 'hidden',
                    padding: view === 'auto' ? "10px 12px" : "0 24px",
                    transition: 'all 0.3s ease'
                }}
            >
                <Flex justify="space-between">
                    <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                        Course Fee
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                        ${invoice.courseFee}
                    </Typography.Text>
                </Flex>

                <Flex justify="space-between" style={{ fontSize: '13px' }}>
                    <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                        MISC Fee
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                        ${invoice.miscFee}
                    </Typography.Text>
                </Flex>

                <Flex justify="space-between">
                    {invoice.hasFasApplication ? (
                        <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                            {`${invoice.appliedFasSchemeName} (${invoice.appliedFasTierName})`}
                        </Typography.Text> 
                    ) : (
                        <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                            No FAS
                        </Typography.Text>
                    )}
                    <Typography.Text type="secondary" style={{ fontSize: '13px', color: '#52c41a' }}>
                        {invoice.fasSubsidyAmount > 0
                            ? `-$${invoice.fasSubsidyAmount}`
                            : `$${invoice.fasSubsidyAmount}`}
                    </Typography.Text>
                </Flex>

                <Flex justify="space-between" align="center">
                    <Flex vertical>
                        <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                            GST 9%
                        </Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: '10px' }}>
                            {"= (CourseFee + MiscFee) x 9%"}
                        </Typography.Text>
                    </Flex>
                    <Typography.Text type="secondary">
                        ${invoice.gstAmount}
                    </Typography.Text>
                </Flex>

                <AntDivider style={{ margin: '8px 0', borderColor: 'var(--app-border-color, #e2eaf3)' }} />

                <Flex justify="space-between">
                    <Typography.Text style={{ margin: 0, color: '#52c41a', fontWeight: 'bold', fontSize: '16px' }}>
                        Net Payable
                    </Typography.Text>
                    <Typography.Text style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
                        ${invoice.netPayable}
                    </Typography.Text>
                </Flex>
            </Flex>

            <Flex align="center" justify="space-between" style={{ padding: "16px 24px", background: 'var(--app-bg, #f3f8fd)' }}>
                <Flex gap={4}>
                    <Typography.Text type="secondary">
                        {invoice.hasFasApplication ? "FAS:" : " "}
                    </Typography.Text>
                    <Typography.Text strong>
                        {invoice.appliedFasSchemeName}
                    </Typography.Text>
                </Flex>

                <Flex align="center" gap={16}>
                    {invoice.isInstallment && (
                        <Typography.Link 
                            onClick={() => navigate('../installment', { state: { invoice } })}
                            style={{ whiteSpace: 'nowrap', fontWeight: 600 }}
                        >
                            View plan &rarr;
                        </Typography.Link>
                    )}
                    {(currInstallment != null || !invoice.isInstallment) && (
                        <Button 
                            style={{ width: '8rem', borderRadius: '6px' }} 
                            disabled={invoice.isInstallment && currInstallment == null ? true : false} 
                            type='primary' 
                            onClick={() => {
                                handleCheck(invoice, true);
                                navigate('./pay', {
                                    state: { selected: [invoice] },
                                });
                            }}
                        >
                            Pay
                        </Button>
                    )}
                </Flex>
            </Flex>
        </Card>
    );
};

const InfoBlock = ({ label, value }) => (
  <Flex vertical align="center">
    <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
      {label}
    </Typography.Text>
    <Typography.Text strong style={{ fontSize: '15px' }}>
      {value}
    </Typography.Text>
  </Flex>
);

const CourseListSection = ({ collection, handleCheck, pay }) => {
    return (
        <div style={{ height: '500px', overflowY: 'auto', paddingRight: '12px' }}>
            <Flex vertical gap={16} style={{ flex: 1 }}>
                {collection.map((entry) => (
                    <CourseEntry key={entry.id} invoice={entry} handleCheck={handleCheck} pay={pay}/>
                ))}
            </Flex>
        </div>
    )
}

export default CourseListSection;