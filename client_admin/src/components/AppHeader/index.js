import React, { useEffect, useState} from "react";
import { Badge, Button, Space, Typography } from "antd";
import { BellFilled, LogoutOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import * as actions from '../../store/actions';
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import io from "socket.io-client";

const { Title } = Typography;

const AppHeader = () => {
  const { IsLoggedIn, nameUser, phoneUser } = useSelector(state => state.auth);
  const [socket, setSocket] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Only connect socket if logged in
    if (IsLoggedIn) {
      const newSocket = io("http://localhost:5000");
      setSocket(newSocket);

      // Emit admin online status
      newSocket.emit("adminOnline", phoneUser);

      // Listen for updates on online admins
      newSocket.on('updateOnlineAdmins', (admins) => {
        console.log('Online admins:', admins);
      });

      // Cleanup on component unmount or logout
      return () => {
        newSocket.emit("adminOffline", phoneUser);
        newSocket.disconnect();
      };
    }
  }, [IsLoggedIn, phoneUser]);

  const handleLogout = () => {
    swal({
      title: "Bạn có chắc chắn?",
      text: "Sau khi nhấn OK, bạn sẽ được chuyển đến trang đăng nhập.",
      icon: "warning",
      buttons: ["Hủy", "OK"],
      dangerMode: true,
    }).then((willLogout) => {
      if (willLogout) {
        if (socket) {
          // socket.emit("adminOffline", phoneUser);
          socket.disconnect();
        }
        dispatch(actions.logout());
        navigate('./login');
      }
    });
  };

  return (    
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Space className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-12 object-cover"></div>
            {/* <img src="/OIP.png" alt="Logo" className="w-24 h-12 object-cover" /> */}
          </div>
          <h1 level={4} className="m-0 hidden sm:block font-semibold text-lg text-gray-800">
            HOMESTAY ADMIN
          </h1>
        </Space>
        <Space className="flex items-center">
          {/* <Badge count={1} className="cursor-pointer">
            <BellFilled className="text-2xl text-gray-600 hover:text-gray-800 transition-colors" />
          </Badge> */}
          {IsLoggedIn && (
            <Space size="small" className="ml-4">
              <span className="hidden sm:inline text-gray-700">{nameUser}</span>
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className="flex items-center bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600 text-white"
              >
                <span className="hidden sm:inline">Đăng Xuất</span>
              </Button>
            </Space>
          )}
        </Space>
      </div>
    </header>
  );
};

export default AppHeader;
