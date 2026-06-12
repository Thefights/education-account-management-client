import { ForgotPasswordPage } from '@/pages/general/authPage/ForgotPasswordPage'
import { LoginPage } from '@/pages/general/authPage/LoginPage'
import { RegisterPage } from '@/pages/general/authPage/RegisterPage'
import { ResetPasswordPage } from '@/pages/general/authPage/ResetPasswordPage'
import { TwoFactorPage } from '@/pages/general/authPage/TwoFactorPage'
import DataDeletion from '@/pages/general/dataDeletionPage/DataDeletion'
import PageNotFound from '@/pages/general/PageNotFound/PageNotFound'
import { Outlet, Route, Routes } from 'react-router-dom'
import { routeUrls } from '../configs/routeUrls'

const RouteAuth = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path={routeUrls.AUTH.DATA_DELETION} element={<DataDeletion />} />
        <Route path={routeUrls.AUTH.LOGIN} element={<LoginPage title="Login" />} />
        <Route path={routeUrls.AUTH.REGISTER} element={<RegisterPage />} />
        <Route path={routeUrls.AUTH.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={routeUrls.AUTH.VERIFY_OTP} element={<TwoFactorPage />} />
        <Route path={routeUrls.AUTH.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={`${routeUrls.AUTH.RESET_PASSWORD}/`} element={<ResetPasswordPage />} />
        <Route path={`${routeUrls.AUTH.RESET_PASSWORD}/:token`} element={<ResetPasswordPage />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

export default RouteAuth
