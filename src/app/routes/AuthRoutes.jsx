import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { TwoFactorPage } from '@/features/auth/pages/TwoFactorPage'
import PageNotFound from '@/features/not-found/pages/PageNotFound'
import { routeUrls } from '@/shared/config/routeUrls'
import { Outlet, Route, Routes } from 'react-router-dom'

const authRoutes = [
  {
    path: routeUrls.AUTH.LOGIN,
    element: <LoginPage title="Login" />,
  },
  {
    path: routeUrls.AUTH.REGISTER,
    element: <RegisterPage />,
  },
  {
    path: routeUrls.AUTH.FORGOT_PASSWORD,
    element: <ForgotPasswordPage />,
  },
  {
    path: routeUrls.AUTH.VERIFY_OTP,
    element: <TwoFactorPage />,
  },
  {
    path: routeUrls.AUTH.RESET_PASSWORD,
    element: <ResetPasswordPage />,
  },
  {
    path: `${routeUrls.AUTH.RESET_PASSWORD}/`,
    element: <ResetPasswordPage />,
  },
  {
    path: `${routeUrls.AUTH.RESET_PASSWORD}/:token`,
    element: <ResetPasswordPage />,
  },
]

const AuthRoutes = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        {authRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

export default AuthRoutes
