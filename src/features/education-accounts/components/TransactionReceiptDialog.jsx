import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { Descriptions, Divider, Flex, Modal, Table, Typography } from 'antd'

const TransactionReceiptDialog = ({ transaction, onClose }) => {
  const { t } = useTranslation()
  const receipt = transaction?.receipt

  const columns = [
    {
      title: t('transaction.receipt.course'),
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: t('transaction.receipt.school'),
      dataIndex: 'schoolName',
      key: 'schoolName',
    },
    {
      title: t('transaction.receipt.installment'),
      dataIndex: 'installmentNumber',
      key: 'installmentNumber',
      width: 120,
      render: (value) => value ?? t('transaction.receipt.full_payment'),
    },
    {
      title: t('transaction.amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      align: 'right',
      render: formatCurrencyBasedOnCurrentLanguage,
    },
  ]

  return (
    <Modal
      open={Boolean(transaction)}
      title={t('transaction.receipt.title')}
      width={880}
      footer={null}
      destroyOnHidden
      onCancel={onClose}
    >
      {receipt && (
        <Flex vertical gap={16}>
          <Flex vertical align="center" gap={4}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {t('transaction.receipt.system_name')}
            </Typography.Title>
            <Typography.Text type="secondary">
              {t('transaction.receipt.system_receipt')}
            </Typography.Text>
          </Flex>

          <Divider style={{ margin: 0 }} />

          <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label={t('transaction.code')} span={2}>
              <Typography.Text copyable>{transaction.transactionCode}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('transaction.receipt.paid_at')}>
              {formatDatetimeStringBasedOnCurrentLanguage(receipt.paidAt || transaction.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label={t('transaction.receipt.payment_method')}>
              {t(`transaction.receipt.payment_methods.${receipt.paymentMethod}`)}
            </Descriptions.Item>
            <Descriptions.Item label={t('transaction.receipt.paid_by')}>
              {receipt.citizenFullName}
            </Descriptions.Item>
            <Descriptions.Item label={t('transaction.receipt.nric')}>
              {receipt.citizenNric}
            </Descriptions.Item>
            <Descriptions.Item label={t('transaction.receipt.account_number')}>
              {receipt.accountNumber}
            </Descriptions.Item>
            <Descriptions.Item label={t('transaction.receipt.external_reference')}>
              {receipt.externalReference || '-'}
            </Descriptions.Item>
          </Descriptions>

          <Table
            rowKey={(item, index) => `${item.courseName}-${item.installmentNumber ?? 'full'}-${index}`}
            columns={columns}
            dataSource={receipt.items || []}
            pagination={false}
            size="small"
            scroll={{ x: 680 }}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3} align="right">
                  <Typography.Text strong>{t('transaction.receipt.total_paid')}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <Typography.Text strong>
                    {formatCurrencyBasedOnCurrentLanguage(receipt.totalAmount)}
                  </Typography.Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Flex>
      )}
    </Modal>
  )
}

export default TransactionReceiptDialog
