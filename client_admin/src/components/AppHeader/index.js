import React from "react";
import { Badge, Button, Image, Space, Typography } from "antd";
import { MailOutlined, BellFilled } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import * as actions from '../../store/actions'
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
const AppHeader = () => {
  const { IsLoggedIn , nameUser } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  return (
    <div className="AppHeader ">
      <Space className="ml-5">
        {/* <Image
          className="rounded-full"
          src="https://i.pinimg.com/736x/c1/bd/1b/c1bd1b17381d4cb949dc9f41e9617bc8.jpg"
          width={40}
        ></Image> */}
         <div className='logo-container'>
        <img src={"https://cdn-icons-png.flaticon.com/512/6820/6820955.png"} alt='Logo'   style={{ width: '120px', height: '100px' }}  />
      </div> 
      </Space>
      <Space><Typography.Title>HOMESTAY ADMIN DASHBOARD</Typography.Title></Space>
      <Space className="mr-5">
        

        {/* <Badge count={10}>
          <MailOutlined style={{ fontSize: 24 }} />
        </Badge>
        <Badge count={20}>
          <BellFilled style={{ fontSize: 24 }} />
        </Badge> */}
       {IsLoggedIn ?  <Button
        type="danger"
        className="bg-red-500 ml-5"
        onClick={()=>{
          dispatch(actions.logout())
          swal({
            title: "Bạn có chắc chắn?",
            text: "Sau khi nhấn OK, bạn sẽ được chuyển đến trang đăng nhập.",
            icon: "warning",
            buttons: true,
            dangerMode: true,
          })
          .then((willDelete) => {
            if (willDelete) {
             navigate('./login')
            }
          });
          
          // window.location.reload();
        }}
        >
          Đăng Xuất
        </Button> :" "}
      </Space>
      
    </div>
  );
};

export default AppHeader;
