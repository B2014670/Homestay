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
    // console.log("Received values of form: ", values);
    // Thêm logic xử lý đăng nhập ở đây
    dispatch(actions.login(values,navigate))

  };
  return (
    <div className="flex justify-center items-center login_background  ">
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
                { required: true, message: "Please input your Username!" },
              ]}
              label="Số điện thoại : "
            >
              <Input placeholder="Username" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your Password!" },
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
