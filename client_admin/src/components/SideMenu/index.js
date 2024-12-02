import React from 'react';
import { Menu } from 'antd';
import {
  AppstoreOutlined,
  ShoppingCartOutlined,
  HomeOutlined,
  UserOutlined,
  MenuFoldOutlined,
  UsergroupAddOutlined,
  StarOutlined,
  CoffeeOutlined,
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
    { label: 'Quản Lý Đặt Phòng', icon: <ShoppingCartOutlined />, key: '/orders', value: 3 },
    { label: 'Quản Lý Khu Vực', icon: <MenuFoldOutlined />, key: '/sectors', value: 4 }, 
    { label: 'Quản Lý Phòng', icon: <HomeOutlined />, key: '/rooms', value: 5 },   
    { label: 'Quản Lý Dịch Vụ', icon: <CoffeeOutlined />, key: '/services', value: 6 },    
    { label: 'Quản Lý Đánh Giá', icon: <StarOutlined  />, key: '/comments', value: 7 },
    { label: 'Quản lý Nhân Viên', icon: <UsergroupAddOutlined />, key: '/staffs', value: 1 },
    { label: 'Quản Lý Khách Hàng', icon: <UserOutlined />, key: '/customers', value: 2 },
  ];
  let menuItems 
  if (isAdmin) {
    const filteredMenuItems = adminMenuItems.filter(item => isAdmin.includes(item.value.toString()));

    // Kết hợp thẻ mặc định với các thẻ được lọc dựa trên quyền admin
    menuItems = [...defaultMenuItem, ...filteredMenuItems];
  }

  return (
    <div className="flex flex-col h-full">
      <div className='sticky top-0 z-10'>
        <div className="bg-[#001529]">
          <header  className="flex justify-center items-center py-4">
            <img
              src="./logo3.png"
              alt="Logo"
              className="w-24 cursor-pointer"
              onClick={() => navigate('/')}
            />
          </header >
        </div>
        <Menu
          className="flex-grow"
          onClick={(item) => navigate(item.key)}
          theme="dark"
          items={menuItems}
        />
      </div>
    </div>
  );
};

export default SideMenu;
