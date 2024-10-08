import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#203167]">
      <Header />

      <main className="flex-grow w-full max-w-full flex flex-col items-center justify-start bg-green-100">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};


export default Layout;