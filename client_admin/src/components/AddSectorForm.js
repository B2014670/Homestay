import React, { useEffect, useState, useRef } from "react";
import { IoMdCloseCircle } from "react-icons/io";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { apiAddSector } from "../api";
import swal from "sweetalert";

import { Button, Form, Input, InputNumber, Select, Upload, Modal } from "antd";
const { TextArea } = Input;

const AddSectorForm = ({ isVisible, onClose, onSuccess }) => {
  const [nameSector, setNameSector] = useState("");
  const [addressSector, setAddressSector] = useState(0);
  const [discSector, setDiscSector] = useState("");


  const [formData, setFormData] = useState({
    nameSector: nameSector,
    discSector: discSector,
    addressSector: addressSector,
  });

  const submitForm = async () => {
    // console.log(loi)
    console.log(formData);

    const result = await apiAddSector(formData);
    // console.log(result)
    if (result.status === 200) {
      swal("Thông báo !", "Thêm khu vực mới thành công  !", "success");
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
        title="Thêm khu vực"
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
              name="nameSector"
              label="Tên khu vực : "
              className=""
              rules={[
                { required: true, message: "Vui lòng nhập thông tin !" },
              ]}
            >
              <Input
                className="w-[400px]"
                onChange={(e) => {
                  setNameSector(e.target.value);
                  setFormData({ ...formData, nameSector: e.target.value });
                }}
                placeholder="tên khu vực ..."
              />
            </Form.Item>
            <Form.Item
              name="discSector"
              label="Đặc điểm : "
              rules={[
                { required: true, message: "Vui lòng nhập thông tin !" },
              ]}
            >
              <TextArea
                style={{ height: 70, width: 400, resize: "none" }}
                showCount
                maxLength={200}
                onChange={(e) => {
                  setDiscSector(e.target.value);
                  setFormData({ ...formData, discSector: e.target.value });
                }}
                placeholder="Đặc điểm ..."
              />
            </Form.Item>
            <Form.Item
              name="addressSector"
              label="Vị trí   : "
              rules={[
                { required: true, message: "Vui lòng nhập thông tin !" },
              ]}
            >
              <TextArea
                style={{ height: 70, width: 400, resize: "none" }}
                showCount
                maxLength={200}
                onChange={(e) => {
                  setAddressSector(e.target.value);
                  setFormData({
                    ...formData,
                    addressSector: e.target.value,
                  });
                }}
                placeholder="Mô tả..."
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

export default AddSectorForm;

