import { Routes, Route, Outlet } from "react-router-dom";
import CoursesTuition from "./CouresTuition";
import PayPage from "@/features/pay/pages/PayPage";
import { routeUrls } from '@/shared/config/routeUrls'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Child routes will appear here */}
      <Outlet />
    </div>
  );
}

function Profile() {
  return <h2>Profile Page</h2>;
}

function Settings() {
  return <h2>Settings Page</h2>;
}

function TuitionPaymentLayout() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
    const handleCheck = (invoice, checked) => {
        if (checked) {
            setSelected(prev => [...prev, invoice]);
        }
        else {
            setSelected(prev => prev.filter(item => item !== invoice));
        }
        console.log(selected);
    }
    function nvPay() {
    navigate('../../pay', {
      state: {
        selected,
      },
    });
  }
  return (
    <>
      <Outlet context={{ nvPay, handleCheck }} />
    </>
  );
}

function TuitionPaymentlPage() {
  return (
    <Routes>
      <Route path="/" element={<TuitionPaymentLayout  />}>
        <Route index element={<CoursesTuition/>} />
        <Route path="pay" element={<CoursesTuition />} />
      </Route>
  </Routes>
  );
}

export default TuitionPaymentlPage