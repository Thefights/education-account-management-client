import React, { useState } from 'react'
import { Table, Button, Modal, Input, message, Tag, Typography } from 'antd'
import useFetch from '@/shared/hooks/useFetch'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import { ApiUrls } from '@/shared/api/apiUrls'
import dayjs from 'dayjs'

const SupportTicketManagement = () => {
  const { data: tickets, loading, fetch: reload } = useFetch(ApiUrls.SUPPORT_TICKETS.PENDING)
  const replySubmit = useAxiosSubmit({})
  
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      message.error('Reply message cannot be empty')
      return
    }

    try {
      const response = await replySubmit.submit({
        overrideUrl: ApiUrls.SUPPORT_TICKETS.REPLY(selectedTicket.id),
        method: 'POST',
        overrideData: { replyMessage }
      })
      if (response) {
        message.success('Reply sent and user notified!')
        setSelectedTicket(null)
        setReplyMessage('')
        reload()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Account Holder',
      dataIndex: 'accountHolderName',
      key: 'accountHolderName',
      width: 200,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 150,
    },
    {
      title: 'Question',
      dataIndex: 'questionMessage',
      key: 'questionMessage',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val) => dayjs(val).format('YYYY-MM-DD HH:mm'),
      width: 150,
    },
    {
      title: 'Status',
      key: 'status',
      render: () => <Tag color="warning">Pending</Tag>,
      width: 100,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => setSelectedTicket(record)}>
          Reply
        </Button>
      ),
      width: 100,
    },
  ]

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <Typography.Title level={3}>Support Tickets (Pending)</Typography.Title>
      <Table 
        dataSource={tickets?.collection || []} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10, total: tickets?.totalCount || 0 }}
      />

      <Modal
        title={`Reply to Ticket #${selectedTicket?.id}`}
        open={!!selectedTicket}
        onCancel={() => {
          setSelectedTicket(null)
          setReplyMessage('')
        }}
        onOk={handleReply}
        confirmLoading={replySubmit.loading}
        okText="Send Reply"
      >
        <div className="mb-4">
          <div className="text-gray-500 mb-1">Title:</div>
          <div className="p-3 bg-gray-50 rounded text-gray-800 font-medium">
            {selectedTicket?.title}
          </div>
        </div>
        <div className="mb-4">
          <div className="text-gray-500 mb-1">User Question:</div>
          <div className="p-3 bg-gray-50 rounded text-gray-800 whitespace-pre-wrap">
            {selectedTicket?.questionMessage}
          </div>
        </div>
        <div className="text-gray-500 mb-1">Your Reply:</div>
        <Input.TextArea 
          rows={4} 
          value={replyMessage}
          onChange={e => setReplyMessage(e.target.value)}
          placeholder="Type your response to the user. They will receive a notification."
        />
      </Modal>
    </div>
  )
}

export default SupportTicketManagement
