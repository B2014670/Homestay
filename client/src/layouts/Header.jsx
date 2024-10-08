import React, { useCallback, useState, useEffect } from 'react'
import Navigation from './Navigation';
import Button from '../components/Button'
import icons from '../ultils/icons'
import oip from '../assets/OIP.png'
import logo from '../assets/logo.png'
import { Link, useNavigate, NavLink } from 'react-router-dom'
import { path } from '../ultils/constant'
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
                            {isLoggedIn ? (
                                <>
                                    <NavLink
                                        to={path.ORDERROOM}
                                        style={({ isActive }) => ({
                                            color: isActive ? "#2563EB" : "#1F2937",
                                        })}
                                    >
                                        Đơn Đặt Phòng
                                    </NavLink>

                                    <NavLink
                                        to={path.CANHAN}
                                        style={({ isActive }) => ({
                                            color: isActive ? "#2563EB" : "#1F2937",
                                        })}
                                    >
                                        Cá Nhân
                                    </NavLink>
                                </>
                            ) : (
                                <>
                                </>
                            )}
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
                            <button
                                onClick={logout}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                            >
                                Đăng Xuất
                            </button>
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
                                className="block text-gray-700 dark:text-gray-200 hover:text-blue-500"
                            >
                                Trang chủ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to={path.ABOUT}
                                onClick={toggleMenu}
                                className="block text-gray-700 dark:text-gray-200 hover:text-blue-500"
                            >
                                Giới thiệu
                            </Link>
                        </li>
                        <li>
                            <Link
                                to={path.ROOMS}
                                onClick={toggleMenu}
                                className="block text-gray-700 dark:text-gray-200 hover:text-blue-500"
                            >
                                Xem Phòng
                            </Link>
                        </li>
                        {isLoggedIn ? (
                            <>
                                <li>
                                    <Link
                                        to={path.ORDERROOM}
                                        onClick={toggleMenu}
                                        className="block text-gray-700 dark:text-gray-200 hover:text-blue-500"
                                    >
                                        Đơn Đặt Phòng
                                    </Link>
                                </li><li>
                                    <Link
                                        to={path.CANHAN}
                                        onClick={toggleMenu}
                                        className="block text-gray-700 dark:text-gray-200 hover:text-blue-500"
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
                                        className="block text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                    >
                                        Đăng Nhập
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={goRegister}
                                        className="block text-white bg-blue-600 hover:bg-blue-700 w-full py-2 px-4 rounded-lg"
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
