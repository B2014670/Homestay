import React from 'react'
import avatar from '../../assets/avatar.jpg'
import oip from '../../assets/OIP.png'
import { Avatar, } from 'antd';
import { NavLink } from 'react-router-dom';
import {path} from '../../ultils/constant.js'
import icons from '../../ultils/icons'

require('../containers.css')

const {  FaLocationDot,
  FaPhoneVolume,
  MdMarkEmailUnread,
  FaClock, } = icons;

const Footer = () => {
  return (
    <div className='w-1100 h-[400px] footer flex  gap-5 pt-7 '>
      <div className='flex-col justify-center items-center row mt-3 w-[400px] h-[200px] '>
          <div className='flex justify-center '><Avatar src={avatar} size={200}></Avatar></div>
          <div className='flex justify-center items-center'>Nguyễn Lê Thế Anh</div>
          <div className='flex justify-center items-center'>Mssv : B1909878</div>
          <div className='flex justify-center items-center'>Gmail : anhb1909878@student.ctu.edu.vn</div>
      </div>
      <div>
        <div className=' font-medium'>Về Chúng Tôi</div>
        <div>
          <ul>
            <li className='ac'><NavLink to={path.TRANGCHU}>Giới thiệu</NavLink></li>
            <li className='ac'><NavLink to={path.REGISTER}>Liên Hệ</NavLink></li>
            <li className='ac'><NavLink to={path.LOGIN}>Tin Tức</NavLink></li>
          </ul>
        </div>
      </div>
      <div>
        <div className='font-medium'>Liên hệ với chúng tôi</div>
        <div>
          <div className='bc'><FaLocationDot size={20} className='mr-2' /> Khu 2, Đ. 3/2, P. Xuân Khánh, Q. Ninh Kiều, TP. CT</div>
          <div className='bc'><FaPhoneVolume size={20} className='mr-2' /> ĐT: +84292 3832 663</div>
          <div className='bc'><MdMarkEmailUnread size={20} className='mr-2' />dhct@ctu.edu.vn</div>
          <div className='bc'><FaClock size={20} className='mr-2' />8:00 - 17:00</div>
        </div>
        <img className=' flex justify-center w-[500px] h-[240px]' src={oip}></img>

      </div>

      
      
      
    </div>
  )
}

export default Footer