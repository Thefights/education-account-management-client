import TransactionHistorySection from '@/features/education-accounts/components/TransactionHistorySection'
import { ApiUrls } from '@/shared/api/apiUrls'

const AccountTransactionHistoryPage = () => (
  <TransactionHistorySection url={ApiUrls.ACCOUNT_HOLDER.TRANSACTIONS} />
)

export default AccountTransactionHistoryPage
