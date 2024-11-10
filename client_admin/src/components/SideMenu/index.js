import React from 'react';
import { Menu } from 'antd';
import {
  AppstoreOutlined,
  ShoppingCartOutlined,
  HomeOutlined,
  UserOutlined,
  MenuFoldOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './SideMenu.css';

const SideMenu = () => {
  const navigate = useNavigate();
  const { isAdmin } = useSelector(state => state.auth);

  // Thẻ "Quản Lý DashBoard" luôn hiển thị
  const defaultMenuItem = [
    { label: 'Quản Lý DashBoard', icon: <AppstoreOutlined />, key: '/' },
  ];

  const adminMenuItems = [
    { label: 'Quản lý Nhân Viên', icon: <UsergroupAddOutlined />, key: '/nhanvien', value: 1 },
    { label: 'Quản Lý Khách Hàng', icon: <UserOutlined />, key: '/customers', value: 2 },
    { label: 'Quản Lý Đặt Phòng', icon: <ShoppingCartOutlined />, key: '/orders', value: 3 },
    { label: 'Quản Lý Khu Vực', icon: <MenuFoldOutlined />, key: '/sectors', value: 4 },
    { label: 'Quản Lý Phòng', icon: <HomeOutlined />, key: '/rooms', value: 5 },
  ];
  // let menuItems
  // if(isAdmin){
  //   const filteredMenuItems = adminMenuItems.filter(item => isAdmin.includes(item.value.toString()));

  // // Kết hợp thẻ mặc định với các thẻ được lọc dựa trên quyền admin
  //  menuItems = [...defaultMenuItem, ...filteredMenuItems];
  // }


  // const filteredMenuItems = Array.isArray(isAdmin) && isAdmin !== null ? adminMenuItems.filter(item => isAdmin.includes(item.value.toString())) : [];
  // Kết hợp thẻ mặc định với các thẻ được lọc dựa trên quyền admin
  const filteredMenuItems = adminMenuItems;
  const menuItems = [...defaultMenuItem, ...filteredMenuItems];

  return (
    <div className='SideMenu h-full'>
      <div className='flex justify-center items-center'>
        <img
          src={"https://cdn-icons-png.flaticon.com/512/6820/6820955.png"}
          alt='Logo'
          style={{ width: '170px', height: '100px', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        />
      </div>
      <Menu
        className='hg'
        onClick={(item) => {
          navigate(item.key);
        }}
        theme='dark'
        items={menuItems}
      ></Menu>
    </div>
  );
};

export default SideMenu;
