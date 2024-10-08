import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { path } from './ultils/constant'

import Layout from './layouts/Layout';
import LoginPage from './pages/LoginPage';
import Register from './pages/RegisterPage';
import Home from './pages/Home';
import About from './pages/About';
import Rooms from './pages/Rooms';
import HotelBooking from './pages/Search';
import useAuthStore from './stores/authStore';

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
      <Routes>
        <Route path={path.HOME} element={<Layout />}>

          <Route index element={<Home />} /> {/* Default route for "/" */}
          <Route path={path.TRANGCHU} element={<Home />}></Route>
          <Route path={path.LOGIN} element={<LoginPage />}></Route>
          <Route path={path.REGISTER} element={<Register />}></Route>
          <Route path={path.ABOUT} element={<About />}></Route>
          <Route path={path.ROOMS} element={<Rooms />}></Route>

          {/* <Route path="/" element={<Navigate replace to="/trangchu" />} />
          <Route path={"trangchu"} element={<TrangChu />}></Route>
          <Route path={"xemphong"} element={<Rooms />}></Route>
          <Route path={"chitietphong"} element={<DetailRoom />}></Route>

          <Route path={"datphong"} element={<OrderRoom />}></Route>
          <Route path={"canhan"} element={<CaNhan />}></Route>
          <Route path={"gioithieu"} element={<About />}></Route>

          <Route path={"dangnhap"} element={<LoginPage />}></Route>
          <Route path={"dangky"} element={<Register />}></Route> */}

        </Route>
      </Routes>
    </BrowserRouter >
  )
}

export default App;