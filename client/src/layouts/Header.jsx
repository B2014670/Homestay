import React, { useCallback, useState, useEffect } from 'react'
import { Avatar, Dropdown, Menu } from 'antd';
import { UserOutlined, LogoutOutlined, OrderedListOutlined } from '@ant-design/icons';
import { DownOutlined, SettingOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import icons from '../utils/icons'
import oip from '../assets/OIP.png'
import { Link, useNavigate, NavLink } from 'react-router-dom'
import { path } from '../utils/constant'
import useAuthStore from '../stores/authStore';
import './containers.css'

const { CgLogIn, CgLogOut, CgNotes } = icons;

const Header = () => {

    const { isLoggedIn, user, logout } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const navigate = useNavigate()

    const toggleMenu = () => setIsOpen(!isOpen);

    const goLogin = useCallback(() => {
        if (windowWidth < 1024) {
            toggleMenu();
        }
        setIsOpen(false);
        navigate(path.LOGIN)
    }, [])

    const goRegister = useCallback(() => {
        if (windowWidth < 1024) {
            toggleMenu();
        }
        setIsOpen(false);
        navigate(path.REGISTER)
    }, [])

    const handleResize = () => {
        setWindowWidth(window.innerWidth);
    };

    useEffect(() => {
        // Set initial window width
        setWindowWidth(window.innerWidth);
        // Add resize event listener
        window.addEventListener('resize', handleResize);
        // Clean up event listener on component unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Optionally, adjust component behavior based on window width
    useEffect(() => {
        if (windowWidth > 1024) { // Example breakpoint for desktop
            setIsOpen(false); // Close menu on desktop
        }
    }, [windowWidth]);

    const menuItems = [
        {
            key: 'account',
            icon: <UserOutlined />,
            label: <NavLink to={path.ACCOUNT}>Cá Nhân</NavLink>,
        },
        {
            key: 'orderroom',
            icon: <OrderedListOutlined />,
            label: <NavLink to={path.ORDERROOM}>Đơn Đặt Phòng</NavLink>,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: (
                <div onClick={logout}>
                    Đăng Xuất
                </div>
            ),
        },
    ];

    return (
        <header className="w-full bg-white shadow-md dark:bg-gray-800 headerSticky h-auto">
            <nav className="container mx-auto lg:px-20 md:px-2 px-1 flex justify-between items-center">
                {/* Logo */}
                <Link to={path.TRANGCHU}>
                    <img className='w-[200px] h-[70px] object-cover'
                        src={oip}
                        alt='logo'
                    />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center space-x-4">
                    <div className="justify-center">
                        <ul className="flex items-center justify-center gap-4 font-medium">
                            {[
                                { label: "Trang Chủ", path: path.TRANGCHU },
                                { label: "Giới Thiệu", path: path.ABOUT },
                                { label: "Xem Phòng", path: path.ROOMS },
                                { label: "Liên hệ", path: path.CONTACT },
                            ].map(({ label, path }) => (
                                <NavLink
                                    key={path}
                                    to={path}
                                    style={({ isActive }) => ({
                                        color: isActive ? "#2563EB" : "#1F2937",
                                    })}
                                    className="hover:text-blue-500"
                                >
                                    {label}
                                </NavLink>
                            ))}
                        </ul>
                    </div>

                    {!isLoggedIn ? (
                        <>
                            <button
                                onClick={goLogin}
                                className="text-gray-800 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Đăng Nhập
                            </button>
                            <button
                                onClick={goRegister}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Đăng Ký
                            </button>
                        </>
                    ) : (
                        <>                            
                            <Dropdown menu={{ items: menuItems }}  trigger={['click']} placement="bottomRight">
                                <Avatar
                                    src={user?.avatarUrl}
                                    icon={!user?.avatarUrl && <UserOutlined />}
                                    size="large"
                                    className="cursor-pointer bg-gray-200 text-gray-600 hover:bg-gray-300 hover:shadow-md transition-all duration-300 ease-in-out"
                                />
                            </Dropdown>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="lg:hidden text-gray-700 dark:text-gray-200 focus:outline-none"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
            </nav>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden bg-white dark:bg-gray-800 shadow-md">
                    <ul className="space-y-4 py-4 px-4">
                        <li>
                            <Link
                                to={path.TRANGCHU}
                                onClick={toggleMenu}
                                className="block font-medium text-gray-700 dark:text-gray-200 hover:text-blue-500"
                            >
                                Trang chủ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to={path.ABOUT}
                                onClick={toggleMenu}
                                className="block font-medium text-gray-700 dark:text-gray-200 hover:text-blue-500"
                            >
                                Giới thiệu
                            </Link>
                        </li>
                        <li>
                            <Link
                                to={path.ROOMS}
                                onClick={toggleMenu}
                                className="block font-medium text-gray-700 dark:text-gray-200 hover:text-blue-500"
                            >
                                Xem Phòng
                            </Link>
                        </li>
                        <li>
                            <Link
                                to={path.CONTACT}
                                onClick={toggleMenu}
                                className="block font-medium text-gray-700 dark:text-gray-200 hover:text-blue-500"
                            >
                                Liên hệ
                            </Link>
                        </li>
                        {isLoggedIn ? (
                            <>
                                <li>
                                    <Link
                                        to={path.ORDERROOM}
                                        onClick={toggleMenu}
                                        className="block font-medium text-gray-700 dark:text-gray-200 hover:text-blue-500"
                                    >
                                        Đơn Đặt Phòng
                                    </Link>
                                </li><li>
                                    <Link
                                        to={path.ACCOUNT}
                                        onClick={toggleMenu}
                                        className="block font-medium text-gray-700 dark:text-gray-200 hover:text-blue-500"
                                    >
                                        Cá Nhân
                                    </Link>
                                </li>

                            </>
                        ) : (
                            <>
                            </>
                        )}
                        {!isLoggedIn ? (
                            <>
                                <li>
                                    <button
                                        onClick={goLogin}
                                        className="block font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                    >
                                        Đăng Nhập
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={goRegister}
                                        className="block font-medium text-white bg-blue-600 hover:bg-blue-700 text-left py-2 px-4 rounded-lg"
                                    >
                                        Đăng Ký
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <button
                                        onClick={logout}
                                        className="block text-white bg-red-600 hover:bg-red-700 w-full py-2 px-4 rounded-lg"
                                    >
                                        Đăng Xuất
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </header>
    );
};

export default Header
