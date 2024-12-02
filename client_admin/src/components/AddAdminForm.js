import React, { useState } from "react";
import axios from "axios";
import swal from "sweetalert";
import {
  Button,
  Form,
  Modal,
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

const { Option } = Select;
dayjs.extend(customParseFormat);

const AddAdminForm = ({ isVisible, onClose, onSuccess }) => {
  const [imageFile, setImageFile] = useState("https://th.bing.com/th/id/R.cf89e8e6daa9dabc8174c303e4d53d3a?rik=BcjJH68FR0CVvg&pid=ImgRaw&r=0");
  const dateFormat = "DD/MM/YYYY";

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
    const formData = new FormData();
    formData.append("file", e);
    formData.append("upload_preset", "we6hizdj");

    try {
      const response = await axios.post('https://api.cloudinary.com/v1_1/dwcrfnnov/image/upload', formData);
      setImageFile(response.data.secure_url);
    } catch (error) {
      console.error('Error uploading image:', error);
      swal(
        "Thông báo !",
        "Không thể tải hình ảnh lên",
        "error"
      );
    }
  };

  const onFinish = async (data) => {
    const inputData = {
      userName: data.userName,
      phone: data.phone,
      password: data.password,
      isAdmin: data.isAdmin,
      birthYear: formatDate(data.birthYear.$d),
      avatar: imageFile,
    };

    try {
      const response = await apiAddAdmin(inputData);
      if (response.data.status === -1) {
        swal("Thông Báo !", response.data.msg, "warning");
      }
      if (response.data.status === 0) {
        swal("Thành Công !", response.data.msg, "success").then(() => {
          onClose();
          onSuccess()
        });
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      swal(
        "Thông báo !",
        "Không thể thêm nhân viên",
        "error"
      );
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <div>
      <Modal
        open={isVisible}
        title="Thêm nhân viên"
        onCancel={onClose}
        footer={null}
        width={600}
        className="rounded-lg"
      >
        <Form
          onFinish={onFinish}
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 14,
          }}
          style={{
            maxWidth: 750,
          }}
        >
          <div className="col">
            <Form.Item
              name="userName"
              label="Họ và tên : "
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
            >
              <Input className="w-[400px]" placeholder="Vui lòng nhập họ và tên ..." />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại : "
              rules={[
                { required: true, message: "Vui lòng nhập  số điện thoại !" },
                { len: 10, message: "Số điện thoại gồm 10 số !", },
              ]}
            >
              <Input className="w-[400px]" placeholder="Vui lòng nhập  số điện thoại ..." />
            </Form.Item>

            <Form.Item
              name="birthYear"
              label="Ngày sinh : "
              rules={[{ required: true, message: "Vui lòng nhập ngày sinh!" }]}
            >
              <DatePicker
                className="w-[400px]"
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
              label="Mật khẩu : "
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu !" }]}
            >
              <Input.Password className="w-[400px]" />
            </Form.Item>

            <Form.Item
              name="isAdmin"
              rules={[{ required: true, message: "Vui lòng chọn chức vụ !" }]}
              label="Quyền truy cập : "
            >
              <Select mode="multiple" placeholder="Chọn chức vụ" style={{
                width: '400px',
              }}>
                <Option value={"1"}>Quản Lý Nhân Viên</Option>
                <Option value={"2"}>Quản Lý Tài Khoản</Option>
                <Option value={"3"}>Quản Lý Đặt Phòng</Option>
                <Option value={"4"}>Quản Lý Khu Vực</Option>
                <Option value={"5"}>Quản Lý Phòng</Option>
              </Select>
            </Form.Item>
          </div>

          <div className="flex justify-center items-center">
            <Button type="primary" htmlType="submit" className="bg-blue-500 hover:bg-blue-600 rounded">
              Thêm
            </Button>
            <Button onClick={onClose} className="ml-2 rounded">
              Hủy
            </Button>
          </div>
        </Form>
      </Modal>
    </div >
  );
};

export default AddAdminForm;
