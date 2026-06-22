import AuthRoutes from '@/app/routes/AuthRoutes'
import GuestRoute from '@/app/routes/GuestRoute'
import RoleRoutes from '@/app/routes/RoleRoutes'
import LandingLayout from '@/features/landing-page/components/LandingLayout'
import ContactPage from '@/features/landing-page/pages/ContactPage'
import FaqPage from '@/features/landing-page/pages/FaqPage'
import HomePage from '@/features/landing-page/pages/HomePage'
import { routeUrls } from '@/shared/config/routeUrls'
import { Route, Routes } from 'react-router-dom'

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path={routeUrls.LANDING.HOME} element={<LandingLayout />}>
          <Route index element={<HomePage />} />
          <Route path={routeUrls.LANDING.FAQ} element={<FaqPage />} />
          <Route path={routeUrls.LANDING.CONTACT} element={<ContactPage />} />
        </Route>
      </Route>
      <Route path={`${routeUrls.BASE_ROUTE.AUTH()}/*`} element={<AuthRoutes />} />
      <Route path="/*" element={<RoleRoutes />} />
    </Routes>
  )
}

export default AppRoutes
