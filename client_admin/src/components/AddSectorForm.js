import React, { useEffect, useState, useRef } from "react";
import { IoMdCloseCircle } from "react-icons/io";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { apiAddSector } from "../api";
import swal from "sweetalert";

import { Button, Form, Input, InputNumber, Select, Upload } from "antd";
const { TextArea } = Input;

const AddSectorForm = (props) => {
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
      swal("Thông báo !", "Thêm phòng mới thành công  !", "success");
      props.setShowAddSectorPopup(false);
      window.location.reload();
    } else {
      swal(
        "Thông báo !",
        "Đã xảy ra lỗi ! Vui lòng thực hiện lại  !",
        "warning"
      );
    }
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
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "700px",
          }}
        >
          <div className="flex justify-center items-center font-semibold">
            <h1>Thêm Khu Vực Mới</h1>
          </div>
        </div>
        <div className=" w-[750px] mt-4  flex flex-col">
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
                label="Tên Khu Vực : "
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
                <div className="flex row ">
                  <TextArea
                    showCount
                    maxLength={200}
                    onChange={(e) => {
                      setDiscSector(e.target.value);
                      setFormData({ ...formData, discSector: e.target.value });
                    }}
                    placeholder="Đặc điểm ..."
                    style={{ height: 70, width: 400, resize: "none" }}
                  />
                </div>
              </Form.Item>
              <Form.Item
                name="addressSector"
                label="Vị trí   : "
                rules={[
                  { required: true, message: "Vui lòng nhập thông tin !" },
                ]}
              >
                <div className="flex row ">
                  <TextArea
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
                    style={{ height: 70, width: 400, resize: "none" }}
                  />
                </div>
              </Form.Item>
            </div>

            <div className="flex justify-center items-center">
              <Button
                htmlType="submit"
                className="border border-blue m-3  bg-green-400"
              >
                Save
              </Button>
              <Button
                onClick={props.setShowAddSectorPopup.bind("", false)}
                className="border border-blue m-3 bg-gray-400"
              >
                Close
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddSectorForm;
