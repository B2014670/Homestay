import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { path } from './utils/constant'

import Layout from './layouts/Layout';
import LoginPage from './pages/LoginPage';
import Register from './pages/RegisterPage';
import ForgetPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Rooms from './pages/Rooms';
import DetailRoom from './pages/DetailRoom';
import Terms from './pages/Terms';
import Policies from './pages/Policies';
import Account from './pages/Account';
import useAuthStore from './stores/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

function App() {

  const { initializeAuth } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      initializeAuth();
      hasInitialized.current = true;
    }
  }, [initializeAuth]);

  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  return (
    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID }}>

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
            <Route path={`${path.DETAILROOM}/:id`} element={<DetailRoom />} />
            <Route path={path.TERMS} element={<Terms />} />
            <Route path={path.POLICY} element={<Policies />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path={path.HOME} element={<Layout />}>
              <Route path={path.ACCOUNT} element={<Account />} />
            </Route>
          </Route>

        </Routes>
      </BrowserRouter >
    </PayPalScriptProvider>
  )
}

export default App;