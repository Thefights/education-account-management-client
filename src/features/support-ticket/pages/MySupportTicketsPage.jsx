import React, { useState } from 'react'
import { Table, Button, Modal, Input, message, Tag, Typography, Space } from 'antd'
import useFetch from '@/shared/hooks/useFetch'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import { ApiUrls } from '@/shared/api/apiUrls'
import dayjs from 'dayjs'
import { useSearchParams } from 'react-router-dom'

const MySupportTicketsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const questionParam = searchParams.get('question')

  const { data: tickets, loading, fetch: reload } = useFetch(ApiUrls.SUPPORT_TICKETS.INDEX)
  const createSubmit = useAxiosSubmit({})
  
  const [isModalOpen, setIsModalOpen] = useState(!!questionParam)
  const [title, setTitle] = useState('')
  const [questionMessage, setQuestionMessage] = useState(questionParam || '')
  const handleCreate = async () => {
    if (!title.trim()) {
      message.error('Title cannot be empty')
      return
    }
    if (!questionMessage.trim()) {
      message.error('Question cannot be empty')
      return
    }

    try {
      const response = await createSubmit.submit({
        overrideUrl: ApiUrls.SUPPORT_TICKETS.CREATE,
        method: 'POST',
        overrideData: { title, questionMessage }
      })
      
      if (response) {
        message.success('Ticket created successfully!')
        setIsModalOpen(false)
        setTitle('')
        setQuestionMessage('')
        
        // Remove query param
        if (questionParam) {
          searchParams.delete('question')
          setSearchParams(searchParams)
        }
        
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
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
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
      render: (_, record) => {
        if (record.status === 0 || record.status === 'Pending') {
          return <Tag color="warning">Pending</Tag>
        }
        return <Tag color="success">Resolved</Tag>
      },
      width: 100,
    },
    {
      title: 'Admin Response',
      dataIndex: 'adminResponse',
      key: 'adminResponse',
      render: (val) => val || <span className="text-gray-400">Waiting for response...</span>
    },
    {
      title: 'Resolved At',
      dataIndex: 'resolvedAt',
      key: 'resolvedAt',
      render: (val) => val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-',
      width: 150,
    },
  ]

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <Space className="w-full justify-between mb-4">
        <Typography.Title level={3} style={{ margin: 0 }}>My Support Tickets</Typography.Title>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>Create Ticket</Button>
      </Space>

      <Table 
        dataSource={tickets?.collection || []} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10, total: tickets?.totalCount || 0 }}
      />

      <Modal
        title="Submit a Support Ticket"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setTitle('')
          setQuestionMessage('')
          if (questionParam) {
            searchParams.delete('question')
            setSearchParams(searchParams)
          }
        }}
        onOk={handleCreate}
        confirmLoading={createSubmit.loading}
        okText="Submit"
      >
        <div className="text-gray-500 mb-2">Ticket Title:</div>
        <Input 
          className="mb-4"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Brief summary of your issue..."
        />
        <div className="text-gray-500 mb-2">Please describe your issue or question in detail:</div>
        <Input.TextArea 
          rows={5} 
          value={questionMessage}
          onChange={e => setQuestionMessage(e.target.value)}
          placeholder="I am having trouble with..."
        />
      </Modal>
    </div>
  )
}

export default MySupportTicketsPage
