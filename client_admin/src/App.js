import React, { useEffect, useState } from "react";
import AppHeader from "./components/AppHeader";
import SideMenu from "./components/SideMenu";
import PageContent from "./components/PageContent";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'
import { Layout } from "antd";

const { Sider } = Layout;
function App() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { IsLoggedIn } = useSelector(state => state.auth)

  useEffect(() => {
    if (!IsLoggedIn || IsLoggedIn === 'false') {
      navigate('/login');
    }
    if (IsLoggedIn === 'true') {
      navigate('/');
    }
  }, [IsLoggedIn, navigate]);

  return (
    <div className="">
      <Layout style={{ minHeight: '100vh' }}>
        {IsLoggedIn && (<Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
          <SideMenu />
        </Sider>
        )}
        <Layout>
          <AppHeader />
          <PageContent />
        </Layout>
      </Layout>
    </div>
  );
}

export default App;
