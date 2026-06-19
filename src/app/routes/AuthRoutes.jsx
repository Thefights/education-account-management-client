import { LoginPage } from '@/features/auth/pages/LoginPage'
import PageNotFound from '@/features/not-found/pages/PageNotFound'
import { routeUrls } from '@/shared/config/routeUrls'
import { Outlet, Route, Routes } from 'react-router-dom'

const authRoutes = [
  {
    path: routeUrls.AUTH.LOGIN,
    element: <LoginPage title="Login" />,
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
