import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import {
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  CreditCardOutlined,
  DownloadOutlined,
  FileDoneOutlined,
  FileProtectOutlined,
  InfoCircleOutlined,
  ReadOutlined,
  SafetyCertificateFilled,
  UserOutlined,
} from '@ant-design/icons'
import { Button, Flex, Modal, Table, Typography, message } from 'antd'
import './transactionReceipt.css'

const ReceiptDetail = ({ icon, label, children, wide = false }) => (
  <div className={`transaction-receipt__detail${wide ? ' is-wide' : ''}`}>
    <span className="transaction-receipt__detail-icon">{icon}</span>
    <div className="transaction-receipt__detail-content">
      <Typography.Text className="transaction-receipt__detail-label">{label}</Typography.Text>
      <div className="transaction-receipt__detail-value">{children}</div>
    </div>
  </div>
)

const TransactionReceiptDialog = ({ transaction, onClose }) => {
  const { t } = useTranslation()
  const receipt = transaction?.receipt

  const copyTransactionCode = async () => {
    await navigator.clipboard.writeText(transaction.transactionCode)
    message.success(t('transaction.receipt.copied'))
  }

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
      width: 130,
      align: 'center',
      render: (value) => value ?? t('transaction.receipt.full_payment'),
    },
    {
      title: t('transaction.amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: formatCurrencyBasedOnCurrentLanguage,
    },
  ]

  return (
    <Modal
      open={Boolean(transaction)}
      width={1080}
      footer={null}
      title={null}
      centered
      destroyOnHidden
      className="transaction-receipt-modal"
      onCancel={onClose}
    >
      {receipt && (
        <article className="transaction-receipt">
          <header className="transaction-receipt__eyebrow">
            <FileProtectOutlined />
            <Typography.Text strong>{t('transaction.receipt.title')}</Typography.Text>
          </header>

          <section className="transaction-receipt__brand">
            <span className="transaction-receipt__brand-mark">
              <SafetyCertificateFilled />
              <ReadOutlined className="transaction-receipt__brand-book" />
            </span>
            <div>
              <Typography.Title level={2}>{t('transaction.receipt.system_name')}</Typography.Title>
              <Typography.Text>{t('transaction.receipt.system_receipt')}</Typography.Text>
            </div>
          </section>

          <section className="transaction-receipt__code-row">
            <div>
              <Typography.Text className="transaction-receipt__detail-label">
                {t('transaction.code')}
              </Typography.Text>
              <Flex align="center" gap={10} wrap="wrap">
                <Typography.Text strong className="transaction-receipt__code">
                  {transaction.transactionCode}
                </Typography.Text>
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  aria-label={t('transaction.receipt.copy_code')}
                  onClick={copyTransactionCode}
                />
              </Flex>
            </div>
            <span className="transaction-receipt__paid-badge">
              <CheckCircleOutlined /> {t('transaction.receipt.paid')}
            </span>
          </section>

          <section className="transaction-receipt__details-grid">
            <ReceiptDetail icon={<ClockCircleOutlined />} label={t('transaction.receipt.paid_at')}>
              {formatDatetimeStringBasedOnCurrentLanguage(receipt.paidAt || transaction.createdAt)}
            </ReceiptDetail>
            <ReceiptDetail
              icon={<CreditCardOutlined />}
              label={t('transaction.receipt.payment_method')}
            >
              {t(`transaction.receipt.payment_methods.${receipt.paymentMethod}`)}
            </ReceiptDetail>
            <ReceiptDetail icon={<UserOutlined />} label={t('transaction.receipt.paid_by')}>
              {receipt.citizenFullName}
            </ReceiptDetail>
            <ReceiptDetail icon={<BankOutlined />} label={t('transaction.receipt.nric')}>
              {receipt.citizenNric}
            </ReceiptDetail>
            <ReceiptDetail
              icon={<ReadOutlined />}
              label={t('transaction.receipt.account_number')}
            >
              {receipt.accountNumber}
            </ReceiptDetail>
            <ReceiptDetail
              icon={<FileDoneOutlined />}
              label={t('transaction.receipt.external_reference')}
              wide
            >
              <span className="transaction-receipt__reference">
                {receipt.externalReference || '-'}
              </span>
            </ReceiptDetail>
          </section>

          <section className="transaction-receipt__table">
            <Table
              rowKey={(item, index) =>
                `${item.courseName}-${item.installmentNumber ?? 'full'}-${index}`
              }
              columns={columns}
              dataSource={receipt.items || []}
              pagination={false}
              scroll={{ x: 720 }}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3} align="right">
                    <Typography.Text strong>{t('transaction.receipt.total_paid')}</Typography.Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <Typography.Title level={3} className="transaction-receipt__total">
                      {formatCurrencyBasedOnCurrentLanguage(receipt.totalAmount)}
                    </Typography.Title>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </section>

          <section className="transaction-receipt__notice no-print">
            <InfoCircleOutlined />
            <div>
              <Typography.Text strong>{t('transaction.receipt.thank_you')}</Typography.Text>
              <Typography.Text>{t('transaction.receipt.keep_record')}</Typography.Text>
            </div>
            <Button
              className="transaction-receipt__download"
              icon={<DownloadOutlined />}
              onClick={() => window.print()}
            >
              {t('transaction.receipt.download_pdf')}
            </Button>
          </section>

          <footer className="no-print">{t('transaction.receipt.signature_note')}</footer>
        </article>
      )}
    </Modal>
  )
}

export default TransactionReceiptDialog
