import React from 'react'
import { NavLink } from 'react-router-dom';
import { path } from '../utils/constant.js'
import icons from '../utils/icons'

import './containers.css';

const { FaLocationDot,
  FaPhoneVolume,
  MdMarkEmailUnread,
  FaClock, } = icons;

const Footer = () => {
  return (
    <footer className="w-full bg-[#203167] text-white pt-4 border-t-2 border-solid">
      <div className="container mx-auto lg:px-20 md:px-2 px-1 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* First Column */}
        <div className='col-span-2'>
          <h3 className="text-xl font-semibold mb-4">Homestay</h3>
          <ul className="space-y-2">
            <li className="flex items-center">
              <FaLocationDot size={20} className='mr-2' />
              <span>ấp Bãi Bàng, Lại Sơn, Kiên Hải, Kiên Giang.</span>
            </li>
            <li className="flex items-center">
              <FaPhoneVolume size={20} className='mr-2' />
              <span>ĐT: 0292 2222 222</span>
            </li>
            <li className="flex items-center">
              <MdMarkEmailUnread size={20} className='mr-2' />
              <span>homestay@gmail.com</span>
            </li>
            <li className="flex items-center">
              <FaClock size={20} className='mr-2' />
              <span>8:00 - 17:00</span>
            </li>
          </ul>
        </div>
        {/* Second Column */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Về chúng tôi</h4>
          <ul className="space-y-2">
            <li><NavLink to={path.ABOUT}>Giới thiệu</NavLink></li>
            <li><NavLink to={path.CONTACT}>Liên Hệ</NavLink></li>
            <li><NavLink to={path.NEWS}>Tin Tức</NavLink></li>
          </ul>
        </div>
        {/* Third Column */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Điều khoản và Chính sách</h4>
          <ul className="space-y-2">
            <li><NavLink to={path.TERMS}>Điều khoản thanh toán</NavLink></li>
            <li><NavLink to={path.POLICY}>Chính sách bảo mật</NavLink></li>
          </ul>
        </div>
      </div>
      <div className="text-center py-4">
        <p className="text-sm">Copyright © 2024 Homestay. All rights reserved.</p>
      </div>
    </footer>
  );
};


export default Footer