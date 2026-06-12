import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { TwoFactorPage } from '@/features/auth/pages/TwoFactorPage'
import DataDeletion from '@/features/data-deletion/DataDeletion'
import PageNotFound from '@/features/not-found/PageNotFound'
import { Outlet, Route, Routes } from 'react-router-dom'
import { routeUrls } from '@/shared/config/routeUrls'

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
