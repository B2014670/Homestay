import "./App.css";
import React, { useEffect, useState } from "react";
import AppHeader from "./components/AppHeader";
// import AppFooter from "./components/AppFooter";
import SideMenu from "./components/SideMenu";
import PageContent from "./components/PageContent";
// import { Space } from "antd";
import { useNavigate } from 'react-router-dom';
import { useSelector,useDispatch} from 'react-redux'
import { Layout } from "antd";
import "./App.css";
const { Sider } = Layout; //Header, Content, Footer, 
function App() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { IsLoggedIn ,  } = useSelector(state => state.auth) //nameUser
  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập từ localStorage
    // Nếu trạng thái đăng nhập không tồn tại hoặc là 'false', chuyển hướng đến trang đăng nhập
    if (!IsLoggedIn || IsLoggedIn === 'false') {
      navigate('/login'); // Thay '/login' bằng đường dẫn của trang đăng nhập của bạn
    }
    if (IsLoggedIn === 'true') {
      navigate('/'); // Thay '/login' bằng đường dẫn của trang đăng nhập của bạn
    }
  }, [navigate]);

  return (
    <div className=" App ">
      <Layout
        // style={{
        //   minHeight: "100vh",
        // }}
      >
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <div className="" />
          <SideMenu></SideMenu>
        </Sider>
        <Layout>
          <AppHeader></AppHeader>
          <PageContent></PageContent>
        </Layout>
      </Layout>
    </div>
  );
}

export default App;
