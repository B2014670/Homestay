import React, { useEffect, useState, useRef } from "react";
import { IoMdCloseCircle } from "react-icons/io";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { apiAddExtraService } from "../api";
import swal from "sweetalert";

import { Button, Form, Input, InputNumber, Select, Modal } from "antd";
const { TextArea } = Input;

const AddServiceForm = ({ isVisible, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);

  const [formData, setFormData] = useState({
    name: name,
    description: description,
    price: price,
  });

  const submitForm = async () => {
    // console.log(loi)
    // console.log(formData);

    const result = await apiAddExtraService(formData);
    // console.log(result)
    if (result.status === 201) {
      swal("Thông báo !", "Thêm dịch vụ mới thành công  !", "success");
      onClose();
      onSuccess();
    } else {
      swal(
        "Thông báo !",
        "Đã xảy ra lỗi ! Vui lòng thực hiện lại  !",
        "warning"
      );
    }
  };

  return (
    <div>
      <Modal
        open={isVisible}
        title="Thêm dịch vụ"
        onCancel={onClose}
        footer={null}
        width={600}
        className="rounded-lg"
      >
        <Form
          onFinish={submitForm}
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
              name="name"
              label="Tên dịch vụ : "
              className=""
              rules={[
                { required: true, message: "Vui lòng nhập thông tin !" },
              ]}
            >
              <Input
                className="w-[400px]"
                onChange={(e) => {
                  setName(e.target.value);
                  setFormData({ ...formData, name: e.target.value });
                }}
                placeholder="tên khu vực ..."
              />
            </Form.Item>
            <Form.Item
              name="description"
              label="Mô tả: "
              rules={[
                { required: true, message: "Vui lòng nhập thông tin !" },
              ]}
            >
              <TextArea
                style={{ height: 70, width: 400, resize: "none" }}
                showCount
                maxLength={200}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setFormData({ ...formData, description: e.target.value });
                }}
                placeholder="Đặc điểm ..."
              />
            </Form.Item>
            <Form.Item
              label="Giá : "
              name="price"
              rules={[
                { required: true, message: "Vui lòng nhập thông tin !" },
                {
                  required: true,
                  message: "Vui lòng nhập số tiền 100000!",
                  type: "number",
                  min: 10000,
                },
              ]}
            >
              <InputNumber
                onChange={(e) => {
                  // console.log(e);
                  setPrice(e);
                  setFormData({ ...formData, price: e });
                }}
                className="w-[200px]"
                placeholder=" Giá ..."
                min={10000}
                formatter={(value) => `${value} VND`}
                parser={(value) => value.replace(" VND", "")}
              />
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

export default AddServiceForm;

