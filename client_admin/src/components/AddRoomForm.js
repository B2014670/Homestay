import React, { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { apiAddRoom, apiGetAllSector } from "../api";
import swal from "sweetalert";
import { Button, Form, Input, InputNumber, Select, Upload, Modal } from "antd";

const { TextArea } = Input;

const AddRoomForm = ({ isVisible, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState([]);
  const [nameRoom, setNameRoom] = useState("");
  const [giaRoom, setGiaRoom] = useState(0);
  const [sectorId, setSectorId] = useState("");
  const [loaiRoom, setLoaiRoom] = useState("1-2 người");
  const [discRoom, setDiscRoom] = useState("");
  const [sectors, setSectors] = useState([]);
  // const [selectedSectorId, setSelectedSectorId] = useState({});

  const [formData, setFormData] = useState({
    nameRoom: nameRoom,
    giaRoom: giaRoom,
    loaiRoom: loaiRoom,
    discRoom: discRoom,
    idSectorRoom: sectorId,
    imgRoom: selectedFile,
    discRoom: discRoom,
  });

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await apiGetAllSector();
        const data = response.data.sectors;
        setSectors(data);
      } catch (error) {
        console.error("Error fetching sectors:", error);
      }
    };
    fetchSectors();
  }, []);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  function beforeUpload(file) {
    const isImage = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'].includes(file.type);
    if (!isImage) {
      console.error("You can only upload JPG/PNG file!");
      swal(
        "Cảnh báo !",
        "Bạn không thể tải tệp không phải hình ảnh ! Vui lòng xóa tệp và tải lại",
        "warning"
      );
    }
    return isImage;
  }

  const uploadImage = async (file) => {
    const formdata = new FormData();
    formdata.append("file", file);
    formdata.append("upload_preset", "we6hizdj");
    await axios
      .post("https://api.cloudinary.com/v1_1/dwcrfnnov/image/upload", formdata)
      .then((response) => {
        setSelectedFile((prev) => [
          ...prev,
          {
            url: response.data.url,
            secure_url: response.data.secure_url,
            public_id: response.data.public_id,
            signature: response.data.signature,
            delete_token: response.data.delete_token,
          }
        ]);

        formData.imgRoom.push({
          url: response.data.url,
          secure_url: response.data.secure_url,
          public_id: response.data.public_id,
          signature: response.data.signature,
          delete_token: response.data.delete_token,
        });
      })
      .catch((err) => {
        console.error("Error uploading image:", err);
      });
  };

  const submitform = async () => {
    // console.log(formData)

    const result = await apiAddRoom(formData);

    if (result.status === 200) {
      swal("Thông báo !", "Thêm phòng mới thành công  !", "success").then(() => {
        onClose();
        onSuccess();
      })
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
        title="Thêm phòng"
        onCancel={onClose}
        footer={null}
        width={600}
        className="rounded-lg"
      >
        <Form
          onFinish={submitform}
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
              name="nameRoom"
              label="Tên phòng : "
              className=""
              rules={[
                { required: true, message: "Vui lòng nhập thông tin !" },
              ]}
            >
              <Input
                className="w-[200px]"
                onChange={(e) => {
                  setNameRoom(e.target.value);
                  setFormData({ ...formData, nameRoom: e.target.value });
                }}
                placeholder="Tên phòng ..."
              />
            </Form.Item>
            <Form.Item label="Loại Phòng : "
              rules={[
                { required: true, message: "Vui lòng nhập thông tin !" },
              ]}>
              <div className="flex row w-[200px]">
                <Select
                  name="loaiRoom"
                  onChange={(e) => {
                    setLoaiRoom(e);
                    setFormData({ ...formData, loaiRoom: e });
                  }}
                  defaultValue="1-2 người"
                >
                  <Select.Option value="1-2 người">1-2 người </Select.Option>
                  <Select.Option value="3-4 người">3-4 người </Select.Option>
                  <Select.Option value="5-7 người">5-7 người </Select.Option>
                </Select>
              </div>
            </Form.Item>
            <Form.Item
              label="Khu vực phòng : "
              rules={[{ required: true, message: 'Vui lòng nhập thông tin!' }]}
            >
              <div className="flex row w-[200px]">
                <Select
                  name="idSectorRoom"
                  placeholder="Chọn khu vực"
                  onChange={(option, label) => {
                    console.log(option, label)
                    setSectorId(option);
                    setFormData({ ...formData, idSectorRoom: option });
                  }}
                >
                  {sectors.map((sector) => (
                    <Select.Option key={sector._id} value={sector._id}>
                      {sector.nameSector}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </Form.Item>

            <Form.Item
              label="Giá phòng : "
              name="giaRoom"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số tiền 100000!",
                  type: "number",
                  min: 100000,
                },
              ]}
            >
              <InputNumber
                onChange={(e) => {
                  console.log(e);

                  setGiaRoom(e);
                  setFormData({ ...formData, giaRoom: e });
                }}
                className="w-[200px]"
                step={10000}
                placeholder=" Giá phòng ..."
                min={100000}
                formatter={(value) => `${value} VND`}
                parser={(value) => value.replace(" VND", "")}
              />
            </Form.Item>
            <Form.Item
              name="discRoom"
              label="Mô tả : "
              className=""
              rules={[
                { required: true, message: "Vui lòng nhập thông tin !" },
              ]}
            >
              <TextArea
                showCount
                maxLength={200}
                onChange={(e) => {
                  setDiscRoom(e.target.value);
                  setFormData({ ...formData, discRoom: e.target.value });
                }}
                placeholder="Mô tả..."
                style={{ height: 70, width: 400, resize: "none" }}
              />
            </Form.Item>
          </div>

          <div className="col">
            <Form.Item
              label="Hình ảnh:"
              name="imgRoom"
              valuePropName="file"
              getValueFromEvent={normFile}
              className=""
              rules={[
                {
                  required: true,
                  message: "Vui lòng cập nhật 3  hình ảnh !",
                  len: 3,
                  type: "array",
                },
              ]}
            >
              <Upload
                beforeUpload={beforeUpload}
                customRequest={dummyRequest}
                action={uploadImage}
                maxCount="3"
                listType="picture-card"
              >
                <PlusOutlined />
                <div>Tải lên</div>
              </Upload>
              
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
    </div>
  );
};

export default AddRoomForm;

