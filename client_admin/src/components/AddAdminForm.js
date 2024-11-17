import React, { useState } from "react";
import "./components.css";
import axios from "axios";

import swal from "sweetalert";
import {
  Avatar,
  Button,
  Rate,
  Space,
  Form,
  Table,
  Typography,
  Input,
  DatePicker,
  Select,
  Upload,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import moment from "moment";
import { apiAddAdmin } from "../api";
// import { useNavigate } from "react-router-dom";

const { Option } = Select;
dayjs.extend(customParseFormat);

const AddAdminForm = (props) => {
  // const navigate = useNavigate()
  const [imageFile, setImageFile] = useState(
    "https://th.bing.com/th/id/R.cf89e8e6daa9dabc8174c303e4d53d3a?rik=BcjJH68FR0CVvg&pid=ImgRaw&r=0"
  );
  const dateFormat = "DD/MM/YYYY";
  //   const [formData, setFormData] = useState({
  //     userName: "",
  //     phone: "",
  //     birthYear: 0,
  //     avatar:imageFile,
  //     password: "",
  //     isAdmin: false,
  //   });

  function formatDate(date) {
    let day = ("0" + date.getDate()).slice(-2);
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function beforeUpload(file) {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      console.error("You can only upload JPG/PNG file!");
      swal(
        "Cảnh báo !",
        "Bạn không thể tải tệp không phải hình ảnh ! Vui lòng xóa tệp và tải lại",
        "warning"
      );
    }
    return isJpgOrPng;
  }

  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };
  const uploadImage = async (e) => {
    const form = new FormData();
    form.append("file", e);
    form.append("upload_preset", "we6hizdj");
    // eslint-disable-next-line no-undef
    await axios
      .post("https://api.cloudinary.com/v1_1/dwcrfnnov/image/upload", form)
      .then((response) => {
        // console.log(response.data);
        setImageFile(response.data.secure_url);
        // setFormData({...formData,avatar : response.data.secure_url});
        // setFormData([...FormData, avatar: response.data.secure_url]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const apiPostAddAdmin = async (payload) => {
    // console.log(payload)
    try {
      const result = await apiAddAdmin(payload);
      return result.data; // Đảm bảo rằng bạn trả về dữ liệu chính xác từ API
    } catch (error) {
      console.error("Error when calling apiAddAdmin:", error);
      throw error; // Ném lỗi để có thể xử lý ở nơi gọi hàm này
    }
  };

  const onFinish = async (data) => {
    // console.log(data.birthYear;l.$d);
    // console.log(imageFile)
    const date = formatDate(data.birthYear.$d);
    const inputData = {
      userName: data.userName,
      phone: data.phone,
      password: data.password,
      isAdmin: data.isAdmin,
      birthYear: date,
      avatar: imageFile,
    };

    const response = await apiAddAdmin(inputData);
    // console.log(inputData)
    console.log(response.data)
    if (response.data.status === -1) {
      swal("Thông Báo !", response.data.msg, "warning");
      props.closeForm();
      // window.location.reload()
    }
    if (response.data.status === 0) {
      swal("Thành Công !", response.data.msg, "success").then(() => {
        window.location.reload();
      });
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <div
      style={{
        position: "absolute",
        backgroundColor: "rgba(0,0,0,0.5)",
        bottom: "0",
        top: "0",
        left: "0",
        right: "0",
        zIndex: "2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "white",
          width: "800px",
          borderRadius: "8px",
          padding: "20px 10px",
        }}
        className=" "
      >
        <div className="flex justify-center items-center">
          <Typography.Title level={4}>THÊM NHÂN VIÊN</Typography.Title>
        </div>

        <div className=" flex justify-center items-center ">
          <Form
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              name="userName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
              label="Họ và tên : "
            >
              <Input placeholder="Vui lòng nhập họ và tên ..." />
            </Form.Item>
            <Form.Item
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập  số điện thoại !" },
                {
                  required: true,
                  len: 10,
                  message: "Số điện thoại gồm 10 số !",
                },
              ]}
              label="Số điện thoại : "
            >
              <Input placeholder="Vui lòng nhập  số điện thoại ..." />
            </Form.Item>
            <Form.Item
              name="birthYear"
              rules={[{ required: true, message: "Vui lòng nhập ngày sinh!" }]}
              label="Ngày sinh : "
            >
              <DatePicker
                placeholder="Chọn ngày"
                initialValues={moment()}
                format={dateFormat}
              />
            </Form.Item>

            <Form.Item
              name="avatar"
              label="Hình ảnh"
              valuePropName="file"
              getValueFromEvent={normFile}
              extra="Chọn hình ảnh đại diện"
              rules={[
                { required: true, message: "Vui lòng cập nhật hình ảnh !" },
                {
                  required: true,
                  message: "Chỉ được upload 1 tấm ảnh !",
                  len: 1,
                  type: "array",
                },
              ]}
            >
              <Upload
                beforeUpload={beforeUpload}
                customRequest={dummyRequest}
                action={uploadImage}
                listType="picture-card"
                name="avatar"
                maxCount="1"
              >
                <PlusOutlined />
                <div>Uploads</div>
              </Upload>
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu !" }]}
              label="Mật khẩu : "
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="isAdmin"
              rules={[{ required: true, message: "Vui lòng chọn chức vụ !" }]}
              label="Quyền truy cập : "
            >
              <Select mode="multiple" placeholder="Chọn chức vụ">
                <Option value={"1"}>Quản Lý Nhân Viên</Option>
                <Option value={"2"}>Quản Lý Tài Khoản</Option>
                <Option value={"3"}>Quản Lý Đặt Phòng</Option>
                <Option value={"4"}>Quản Lý Khu Vực</Option>
                <Option value={"5"}>Quản Lý Phòng</Option>
              </Select>
            </Form.Item>

            <Form.Item className="flex justify-center items-center gap-10  ">
              <Button
                type="danger"
                htmlType="submit"
                className=" button_submit"
              >
                Tạo Nhân Viên
              </Button>
              <Button
                type="danger"
                onClick={props.closeForm}
                className=" button_submit ml-5 cancle_button"
              >
                Hủy
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddAdminForm;
