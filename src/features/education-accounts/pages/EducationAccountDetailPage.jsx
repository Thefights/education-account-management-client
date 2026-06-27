import { ApiUrls } from '@/shared/api/apiUrls'
import GenericDetail from '@/shared/components/details/GenericDetail'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { renderEmptyFallback } from '@/shared/utils/handleStringUtil'
import { Flex, Tag } from 'antd'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TransactionHistorySection from '../components/TransactionHistorySection'

const statusColors = {
  Active: 'success',
  Extended: 'processing',
  Closed: 'default',
}

const EducationAccountDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const detail = useFetch(ApiUrls.EDUCATION_ACCOUNT.DETAIL(id))
  const account = detail.data
  const fields = useMemo(
    () => [
      {
        key: 'accountNumber',
        label: t('education_account.account_number'),
      },
      {
        key: 'name',
        label: t('education_account.name'),
      },
      {
        key: 'status',
        label: t('education_account.status'),
        render: (value) =>
          value ? <Tag color={statusColors[value]}>{value}</Tag> : renderEmptyFallback(null),
      },
      {
        key: 'dateOfBirth',
        label: t('education_account.dob'),
      },
      {
        key: 'nric',
        label: t('education_account.nric_full'),
        render: (value) => <MaskedNric value={value} />,
      },
      {
        key: 'balance',
        label: t('education_account.balance'),
        render: (value) => formatCurrencyBasedOnCurrentLanguage(value),
      },
      {
        key: 'createdAt',
        label: t('education_account.created_at'),
        render: (value) =>
          formatDatetimeStringBasedOnCurrentLanguage(value) || renderEmptyFallback(null),
      },
    ],
    [t]
  )

  return (
    <Flex vertical gap={16}>
      <GenericDetail
        title={t('education_account.detail_title')}
        data={account}
        fields={fields}
        loading={detail.loading}
        onBack={() => navigate(-1)}
      />
      <TransactionHistorySection url={ApiUrls.EDUCATION_ACCOUNT.TRANSACTIONS(id)} />
    </Flex>
  )
}

export default EducationAccountDetailPage
