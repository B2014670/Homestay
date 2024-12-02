import React from 'react'
import { Routes,Route} from 'react-router-dom'
import DashBoard from '../../Pages/DashBoard'

import Customers from '../../Pages/Customer'
import Orders from '../../Pages/Orders'
import Room from '../../Pages/Room'
import Sector from '../../Pages/Sector'
import Login from '../../Pages/Login'
import NhanVien from '../../Pages/NhanVien'
import Service from '../../Pages/Service'
import Comment from '../../Pages/Comment'

const AppRoutes = () => {
  return (
   
        <Routes>
            <Route path="/" element={<DashBoard/>}></Route>
            <Route path="/customers" element={<Customers/>}></Route>
            <Route path="/orders" element={<Orders/>}></Route>
            <Route path="/sectors" element={<Sector/>}></Route>
            <Route path="/rooms" element={<Room/>}></Route>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/staffs" element={<NhanVien/>}></Route>
            <Route path="/services" element={<Service/>}></Route>
            <Route path="/comments" element={<Comment/>}></Route>
        </Routes>
   
  )
}

export default AppRoutes
