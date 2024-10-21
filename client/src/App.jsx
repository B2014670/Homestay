import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { path } from './ultils/constant'

import Layout from './layouts/Layout';
import LoginPage from './pages/LoginPage';
import Register from './pages/RegisterPage';
import ForgetPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Rooms from './pages/Rooms';
import Terms from './pages/Terms';
import Policies from './pages/Policies';
import Account from './pages/Account';
import CaNhan from './pages/Canhan';
import useAuthStore from './stores/authStore';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  const { initializeAuth } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      initializeAuth();
      hasInitialized.current = true;
    }
  }, [initializeAuth]);

  return (

    <BrowserRouter>
      <Routes  >
        {/* Public Routes */}
        <Route path={path.HOME} element={<Layout />}>
          <Route index element={<Home />} /> {/* Default route for "/" */}
          <Route path={path.TRANGCHU} element={<Home />} />
          <Route path={path.LOGIN} element={<LoginPage />} />
          <Route path={path.REGISTER} element={<Register />} />
          <Route path={path.FORGET} element={<ForgetPassword />} />
          <Route path={`${path.NPASSWORD}/:token`} element={<ResetPassword />} />
          <Route path={path.ABOUT} element={<About />} />
          <Route path={path.CONTACT} element={<Contact />} />
          <Route path={path.ROOMS} element={<Rooms />} />
          <Route path={path.TERMS} element={<Terms />} />
          <Route path={path.POLICY} element={<Policies />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path={path.HOME} element={<Layout />}>
            <Route path={path.ACCOUNT} element={<Account />} />
            <Route path={path.ORDERROOM} element={<CaNhan />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter >
  )
}

export default App;