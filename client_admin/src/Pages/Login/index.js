import React from "react";
import "./login.css";
import { useDispatch, useSelector } from 'react-redux'
import { Typography, Input, Form, Button } from "antd";
import * as actions from '../../store/actions'
import { useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const onFinish = (values) => {
    dispatch(actions.login(values,navigate))
  };
  return (
    <div className="flex justify-center items-center login_background  "
    style={{
      backgroundImage: `url('/bg.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
    >
      <div className="box_login bg-white rounded-md">
        <div className="flex justify-center items-center mt-5 ">
          <Typography.Title type="success"  level={4}>ĐĂNG NHẬP</Typography.Title>
        </div>
        <div className=" flex justify-center items-center ">
          <Form
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Hãy nhập số điện thoại!" },
              ]}
              label="Số điện thoại : "
            >
              <Input placeholder="Username" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Hãy nhập mật khẩu!" },
              ]}
              label="Mật Khẩu : "
            >
              <Input type="password" placeholder="Password" />
            </Form.Item>
            <Form.Item
            className="flex justify-center items-center">
              <Button
                type="danger"
                htmlType="submit"
                className=" button_submit"
              >
               Đăng Nhập
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;

// import React from "react";
// import { useDispatch } from 'react-redux';
// import { useNavigate } from "react-router-dom";
// import { Typography, Form, Input, Button } from "antd";
// import * as actions from '../../store/actions';

// const { Title } = Typography;

// const Login = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const onFinish = (values) => {
//     dispatch(actions.login(values, navigate));
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100"
//       style={{ backgroundImage: "url('../../bg.jpg')" }}
//     >
//       <div className="bg-white rounded-md shadow-md p-8 w-full max-w-md">
//         <div className="text-center mb-6">
//           <Title level={2} className="text-gray-800">
//             ĐĂNG NHẬP
//           </Title>
//         </div>
//         <Form
//           name="login"
//           initialValues={{ remember: true }}
//           onFinish={onFinish}
//           layout="vertical"
//           className="space-y-4"
//         >
//           <Form.Item
//             name="username"
//             label="Số điện thoại"
//             rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
//           >
//             <Input className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
//           </Form.Item>

//           <Form.Item
//             name="password"
//             label="Mật Khẩu"
//             rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
//           >
//             <Input.Password className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
//           </Form.Item>

//           <Form.Item>
//             <Button
//               type="primary"
//               htmlType="submit"
//               className="w-full bg-red-600 hover:bg-red-700 focus:bg-red-700 border-red-600 hover:border-red-700 focus:border-red-700 text-white font-medium rounded-md shadow-sm"
//             >
//               Đăng Nhập
//             </Button>
//           </Form.Item>
//         </Form>
//       </div>
//     </div>
//   );
// };

// export default Login;

