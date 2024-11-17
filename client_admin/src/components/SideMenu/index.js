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
  let menuItems
  if (isAdmin) {
    const filteredMenuItems = adminMenuItems.filter(item => isAdmin.includes(item.value.toString()));

    // Kết hợp thẻ mặc định với các thẻ được lọc dựa trên quyền admin
    menuItems = [...defaultMenuItem, ...filteredMenuItems];
  }

  return (
    // fixed
    <div className="flex flex-col h-screen">
      <div className="flex justify-center items-center py-4">
        <img
          src="./logo3.png"
          alt="Logo"
          className="w-40 h-24 cursor-pointer"
          onClick={() => navigate('/')}
        />
      </div>
      <Menu
        className="sticky top-0 z-10"
        onClick={(item) => navigate(item.key)}
        theme="dark"
        items={menuItems}
      />
    </div>
  );
};

export default SideMenu;
