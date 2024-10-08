import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
// import Chatbot from "../../Chatbot/Chatbot";
import { FloatButton } from "antd";
import { IoChatbubbleEllipses } from "react-icons/io5";

import "../containers.css";
const Home = () => {
  return (
    <div className="w-full flex flex-col items-center justify-start  h-full   ">
      <Header className="" />
      <Navigation className="" />
      <div className="w-1100 flex flex-col items-center justify-start mb-5">
        <Outlet></Outlet>
      </div>
      {/* <FloatButton.Group
        trigger="click"
        type="primary"
        // style={{ right: 24 }}
        icon={<IoChatbubbleEllipses />}
      >
 
      </FloatButton.Group> */}
      {/* <Chatbot /> */}
      <Footer></Footer>
    </div>
  );
};

export default Home;
