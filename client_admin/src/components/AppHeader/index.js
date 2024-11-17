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
    <header className="bg-white shadow-md mb-4 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Space className="flex items-center">
          <div>
            <img src="/logo3.png" alt="Logo" className="w-[120px] h-[80px] object-contain" />
          </div>
          <Title level={4} className="m-0 hidden sm:block">HOMESTAY ADMIN DASHBOARD</Title>
        </Space>
        <Space className="flex items-center">
          <Badge count={1} className="cursor-pointer">
            <BellFilled style={{ fontSize: 24 }} className="text-gray-600" />
          </Badge>
          {IsLoggedIn && (
            <Space size="small" className="ml-4">
              <span className="hidden sm:inline text-gray-700">{nameUser}</span>
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className="flex items-center bg-red-500 hover:bg-red-600"
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
