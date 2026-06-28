import { Flex, Typography, Card, Tag, Button } from "antd"
import {
  CheckSquareOutlined,
  DownOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { theme } from 'antd';
import { useNavigate } from 'react-router-dom';


const CourseEntry = ({ invoice, handleCheck, pay }) => {
    const navigate = useNavigate();
    const [view, setView] = useState('0px');
    const { token } = theme.useToken();
    return (
        <Card
            style={{
                padding: "0",
            }}
            bodyStyle={{ padding: 0 }}
        >
            <Flex justify="space-between" align="flex-start" gap={24}>
                <Flex vertical gap={12} align="flex-start" justify="space-between" style={{padding: "8px 12px"}}>
                    <Flex gap={12} align="center" gap={12}>
                
                        <input type="checkbox" style={{ fontSize: 50 }} onChange={(e) => {handleCheck(invoice, e.target.checked)}}></input>

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
                        gap={24}>
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
                <Flex vertical align="flex-end" gap={4} style={{padding: "8px 12px"}}>
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
                </Flex>
            </Flex>

            <Flex align="center" onClick={() => {setView(view === '0px' ? 'auto' : '0px')}} style={{padding: "8px 12px", borderTop:'1px solid lightgray',borderBottom:'1px solid lightgray',outline:'none', flex:'1', height:'2rem'}}>
                {view !== '0px' ? <DownOutlined /> : <RightOutlined />}
            </Flex>
            
            <Flex
                vertical
                gap={view ? 14 : 0}
                style={{
                    height: view,
                    overflow: 'hidden',
                    padding: view === 'auto' ? "8px 12px" : 0,
                }}
            >
                <Flex justify="space-between">
                    <Typography.Title
                        level={5}
                        style={{ margin: 0, color:'gray' }}s
                        >
                            
                        Course Fee
                    </Typography.Title>


                    <Typography.Title
                        level={5}
                        style={{ margin: 0}}
                        >
                        ${invoice.courseFee}
                    </Typography.Title>
                </Flex>
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
                        ${invoice.miscFee}
                    </Typography.Title>
                </Flex>
                <Flex justify="space-between">
                    <Typography.Title
                        level={5}
                        style={{ margin: 0, color:'gray' }}
                        >
                        {`${invoice.appliedFasSchemeName} (${invoice.appliedFasTierName})`}
                    </Typography.Title>
                    <Typography.Title
                        level={5}
                        style={{ margin: 0, color:'green'}}
                        >
                            {invoice.fasSubsidyAmount > 0
                            ? `-$${invoice.fasSubsidyAmount}`
                            : `$${invoice.fasSubsidyAmount}`}
                    </Typography.Title>
                </Flex>
                <Flex justify="space-between" align="center">
                    <Flex vertical>
                        <Typography.Title
                            level={5}
                            style={{ margin: 0, color:'gray' }}
                            >
                            GST 9%
                        </Typography.Title>
                        <Typography.Title
                            type="secondary"
                            level={5}
                            style={{
                                margin: 0,
                                fontSize: '12px',
                            }}
                            >
                            {"= (CourseFee + MiscFee) x 9%"}
                        </Typography.Title>
                    </Flex>
                    <Typography.Title
                        level={5}
                        style={{ margin: 0}}
                        >
                        ${invoice.gstAmount}
                    </Typography.Title>
                </Flex>

                <div style={{borderTop:'1px solid lightgray'}}></div>


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
                        ${invoice.netPayable}
                    </Typography.Title>
                </Flex>
            </Flex>
            <Flex align="center" justify="space-between" style={{padding: "8px 12px"}}>
                <Flex gap={3}>
                    <Typography.Text type="secondary">
                        FAS:
                    </Typography.Text>

                    <Typography.Text strong>
                        {invoice.appliedFasSchemeName}
                    </Typography.Text>
                </Flex>

                <Flex align="center" gap={12}>
                    {invoice.isInstallment && (
                        <Typography.Link 
                            onClick={() => navigate('../installment', {
                                state: {
                                    invoice,
                                },
                            })}
                            style={{ whiteSpace: 'nowrap', fontWeight: 600 }}
                        >
                            View plan &rarr;
                        </Typography.Link>
                    )}
                    <Button style={{width:'8rem'}} type='primary' onClick={() => {
                        handleCheck(invoice, true);
                        navigate('./pay', {
                            state: {
                                selected: [invoice],
                            },
                        });}}>Pay</Button>
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

const CourseListSection = ( {collection, handleCheck, pay } ) => {
    return (

        <div style={{height:'500px', overflowY:'scroll'}}>
            <Flex vertical gap={5} style={{ flex: 1 }}>
                {collection.map((entry) => (
                <CourseEntry invoice={entry} handleCheck={handleCheck} pay={pay}/>
                ))}
            </Flex>
        </div>
    )
}

export default CourseListSection