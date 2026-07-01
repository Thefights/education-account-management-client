import { Route, Routes } from 'react-router-dom'
import InstallmentPlanPage from './InstallmentPlanPage'
import PaymentCallbackPage from './PaymentCallbackPage'
import TuitionChargesPage from './TuitionChargesPage'
import TuitionCheckoutPage from './TuitionCheckoutPage'

const TuitionPaymentPage = () => (
  <Routes>
    <Route index element={<TuitionChargesPage />} />
    <Route path="checkout" element={<TuitionCheckoutPage />} />
    <Route path="installments/:enrollmentId" element={<InstallmentPlanPage />} />
    <Route path="success" element={<PaymentCallbackPage callbackType="success" />} />
    <Route path="cancel" element={<PaymentCallbackPage callbackType="cancel" />} />
  </Routes>
)

export default TuitionPaymentPage
