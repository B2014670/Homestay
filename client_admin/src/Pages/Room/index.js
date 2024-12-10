import React, { useEffect, useState, useRef } from "react";
import {
  Space,
  Table,
  Typography,
  Image,
  Button,
  Input,
  Select,
  Popconfirm,
  InputNumber,
  Upload,
  Tabs,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  SaveOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { apiDeleteRoom, apiEditRoom, apiGetAllRoom, apiGetAllSector, apiGetExtraService } from "../../api";
import Highlighter from "react-highlight-words";
import AddRoomForm from "../../components/AddRoomForm";
import swal from "sweetalert";
import axios from "axios"

import RoomManagement from "../../components/RoomManagement";

const { Option } = Select;
const { TextArea } = Input;
const { Title: AntTitle } = Typography;
const { TabPane } = Tabs;

const Room = () => {
  const [loading, setLoading] = useState(false);
  const [serviceData, setServiceDataData] = useState(null);
  const [dataSource, setDataSource] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  //tim kiem + sap xep
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [showAddRoomPopup, setShowAddRoomPopup] = useState(false);
  const [editData, setEditData] = useState({
    _id: "",
    nameRoom: "",
    imgRoom: [{}, {}, {}],
    giaRoom: "",
    loaiRoom: "",
    discRoom: "",
    idSectorRoom: "",
  })
  const [sectors, setSectors] = useState({});

  const maxLength = 60; // Số ký tự tối đa để hiển thị
  const [expanded, setExpanded] = React.useState(false);


  useEffect(() => {
    getRooms()
    fetchExtraService()
  }, []);

  const getRooms = () => {
    setLoading(true);
    apiGetAllRoom().then((res) => {
      setDataSource(res.data.rooms);
      // console.log(res.data.rooms)
      setLoading(false);
    });
  }

  const fetchExtraService = async () => {
    try {
      const response = await apiGetExtraService();
      if (response?.data.data) {
        setServiceDataData(response.data.data);
      } else {
        console.error('No data returned from API');
      }
    } catch (error) {
      console.error('Error fetching room:', error);
    }
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Đặt lại
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  useEffect(() => {
    // Gọi API để lấy thông tin khu vực
    const fetchSectors = async () => {
      try {
        const response = await apiGetAllSector();
        // console.log(response)
        const sectorsData = response.data.sectors.reduce((acc, sector) => {
          acc[sector._id] = sector.nameSector; // Tạo một map từ id sang name
          return acc;
        }, {});
        setSectors(sectorsData);
      } catch (error) {
        console.error("Có lỗi xảy ra khi lấy thông tin khu vực:", error);
      }
    };

    fetchSectors();
    // console.log(sectors)
  }, []);
  const roomTypes = [
    { label: "1-2 người", value: "1-2 người" },
    { label: "3-4 người", value: "3-4 người" },
    { label: "5-7 người", value: "5-7 người" },
  ];

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
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "we6hizdj");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dwcrfnnov/image/upload",
        formData
      );

      // Trả về kết quả cần thiết để sử dụng
      return {
        url: response.data.url,
        secure_url: response.data.secure_url,
        public_id: response.data.public_id,
        signature: response.data.signature,
        delete_token: response.data.delete_token,
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      // Hiển thị cảnh báo hoặc xử lý lỗi
      swal(
        "Lỗi tải lên!",
        "Đã xảy ra lỗi khi tải ảnh lên Cloudinary. Vui lòng thử lại.",
        "error"
      );
      return null; // Trả về null nếu upload thất bại
    }
  };

  const columns = [
    {
      title: "Tên Phòng",
      dataIndex: "nameRoom",
      ...getColumnSearchProps("nameRoom"),
      sorter: (a, b) => a.nameRoom.length - b.nameRoom.length,
      sortDirections: ["descend", "ascend"],
      render: (text, record) => {
        if (record._id === editingRow) {
          return (
            <Input
              defaultValue={text}
              onChange={(e) => setEditData({ ...editData, nameRoom: e.target.value })}
            />
          );
        }
        return text;
      },
    },
    {
      title: "Giá Phòng",
      dataIndex: "giaRoom",
      // render: (value) => <span>{value} vnđ</span>,
      sorter: (a, b) => a.giaRoom - b.giaRoom,
      sortDirections: ["ascend", "descend"],
      render: (text, record) => {
        if (record._id === editingRow) {
          return (
            <InputNumber
              step={10000}
              defaultValue={text}
              onChange={(e) => setEditData({ ...editData, giaRoom: e })}
            />
          );
        }
        return <span>{text.toLocaleString("vi-VN")} vnđ</span>;
      },
    },
    {
      title: "Loại Phòng",
      dataIndex: "loaiRoom",
      ...getColumnSearchProps("loaiRoom"),
      render: (text, record) => {
        if (record._id === editingRow) {
          return (
            <Select
              defaultValue={text}
              style={{ width: 120 }}
              onChange={(value) =>
                setEditData({ ...editData, loaiRoom: value })
                // console.log(value)
              }
            >
              {roomTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          );
        }
        return text;
      },
    },
    {
      title: "Khu vực",
      dataIndex: "idSectorRoom",

      ...getColumnSearchProps("idSectorRoom"),
      // render: (idSectorRoom) => sectors[idSectorRoom] || "Loading...",
      render: (text, record) => {
        if (record._id === editingRow) {
          return (
            <Select
              defaultValue={text}
              style={{ width: 120 }}
              onChange={(e) =>
                setEditData({ ...editData, idSectorRoom: e })
                // console.log(e)
              }
            >
              {Object.entries(sectors).map(([id, name]) => (
                <Option key={id} value={id}>
                  {name}
                </Option>
              ))}
            </Select>
          );
        }
        return <span>{sectors[text] || "Loading..."} </span>;
      },
    },
    {
      title: "Hình Ảnh 1",
      render: (value, record) => {
        if (record._id === editingRow) {
          return (
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={beforeUpload}
              customRequest={dummyRequest}
              onChange={async (info) => {
                if (info.file.status === "done") {
                  const uploadedFile = await uploadImage(info.file.originFileObj);

                  if (uploadedFile) {
                    // Cập nhật dữ liệu nếu upload thành công
                    setEditData((prev) => ({
                      ...prev,
                      imgRoom: [ // Cập nhật ảnh thứ 1
                        {
                          url: uploadedFile.url,
                          secure_url: uploadedFile.secure_url,
                          public_id: uploadedFile.public_id,
                          signature: uploadedFile.signature,
                          delete_token: uploadedFile.delete_token,
                        },
                        ...prev.imgRoom.slice(1),
                      ],
                    }));
                  }
                }
              }}
            >
              {editData.imgRoom && editData.imgRoom[0]?.secure_url ? (
                <Image
                  width={100}
                  src={editData.imgRoom[0].secure_url}
                  preview={false}
                />
              ) : (
                <div>Upload</div>
              )}
            </Upload>
          );
        }
        return <Image width={100} src={value.imgRoom[0].secure_url} />
      },
    },
    {
      title: "Hình Ảnh 2",
      render: (value, record) => {
        if (record._id === editingRow) {
          return (
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={beforeUpload}
              customRequest={dummyRequest}
              onChange={async (info) => {
                if (info.file.status === "done") {
                  const uploadedFile = await uploadImage(info.file.originFileObj);

                  if (uploadedFile) {
                    // Cập nhật dữ liệu nếu upload thành công
                    setEditData((prev) => ({
                      ...prev,
                      imgRoom: [ // Cập nhật ảnh thứ 2
                        ...prev.imgRoom.slice(0, 1),
                        {
                          url: uploadedFile.url,
                          secure_url: uploadedFile.secure_url,
                          public_id: uploadedFile.public_id,
                          signature: uploadedFile.signature,
                          delete_token: uploadedFile.delete_token,
                        },
                        ...prev.imgRoom.slice(2),
                      ],
                    }));
                  }
                }
              }}
            >
              {
                editData.imgRoom && editData.imgRoom[1]?.secure_url ? (
                  <Image
                    width={100}
                    src={editData.imgRoom[1].secure_url}
                    preview={true}
                  />
                ) : (
                  <div>Upload</div>
                )
              }
            </Upload >
          );
        }
        return <Image width={100} src={value.imgRoom[1].secure_url} />
      },
    },
    {
      title: "Hình Ảnh 3",
      render: (value, record) => {
        if (record._id === editingRow) {
          return (
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={beforeUpload}
              customRequest={dummyRequest}
              onChange={async (info) => {
                if (info.file.status === "done") {
                  const uploadedFile = await uploadImage(info.file.originFileObj);

                  if (uploadedFile) {
                    // Cập nhật dữ liệu nếu upload thành công
                    setEditData((prev) => ({
                      ...prev,
                      imgRoom: [ // Cập nhật ảnh thứ 3
                        ...(prev.imgRoom.slice(0, 2)),
                        {
                          url: uploadedFile.url,
                          secure_url: uploadedFile.secure_url,
                          public_id: uploadedFile.public_id,
                          signature: uploadedFile.signature,
                          delete_token: uploadedFile.delete_token,
                        }
                      ],
                    }));
                  }
                }
              }}
            >
              {editData.imgRoom && editData.imgRoom[2]?.secure_url ? (
                <Image
                  width={100}
                  src={editData.imgRoom[2].secure_url}
                  preview={false}
                />
              ) : (
                <div>Upload</div>
              )}
            </Upload>
          );
        }
        return <Image width={100} src={value.imgRoom[2].secure_url} />;
      },
    },
    {
      title: "Mô tả",
      key: "discRoom",
      width: "250px",
      dataIndex: "discRoom",
      ...getColumnSearchProps("discRoom"),
      sorter: (a, b) => a.discRoom.length - b.discRoom.length,
      sortDirections: ["descend", "ascend"],
      render: (text, record) => {
        if (record._id === editingRow) {
          return (
            <TextArea
              showCount
              defaultValue={text}
              onChange={(e) =>
                setEditData({ ...editData, discRoom: e.target.value })
              }
            />
          );
        }

        return (
          <div>
            <Typography.Text>
              {expanded ? text : `${text.substring(0, maxLength)}...`}
            </Typography.Text>
            {text.length > maxLength && (
              <Button
                type="link"
                onClick={() => setExpanded(!expanded)}
                style={{ padding: 0, marginLeft: 5 }}
              >
                {expanded ? "Ẩn bớt" : "Xem thêm"}
              </Button>
            )}
          </div>
        );
      },
    },
    {
      title: "Chỉnh sửa",
      render: (_, record) => {
        if (record._id === editingRow) {
          return (
            <div className="flex">
              <SaveOutlined
                className="m-1 flex items-center justify-center"
                style={{ fontSize: "20px", color: "green" }}
                onClick={() => handleSaveClick(record)}
              >
                Lưu
              </SaveOutlined>
              <CloseCircleOutlined
                className="m-1 flex items-center justify-center"
                onClick={() => setEditingRow(null)}
                style={{ fontSize: "20px", color: "red" }}
              />
            </div>
          );
        }
        return (
          <div className="flex">
            <EditOutlined
              className="m-1 flex items-center justify-center"
              style={{ fontSize: "20px", color: "green" }}
              onClick={() => {
                // console.log(record._id);
                handleEditClick(record);
              }}
            >
              Chỉnh sửa
            </EditOutlined>
            <Popconfirm
              okType="danger"
              //  okButtonProps={{ style: {  backgroundColor: 'red'  }}}
              title="Bạn có chắc chắn muốn xóa không?"
              onConfirm={async () => {
                // console.log(record);
                const result = await apiDeleteRoom({ "_id": record._id });
                // console.log(result)
                if (result.data.status === 0) {
                  swal("Thành Công !", "Xóa phòng thành công !", "success").then((value) => {
                    getRooms();
                  });
                } else {
                  console.log("Có lỗi xảy ra!");
                }
              }}
              onCancel={() => {
                console.log("Hủy bỏ thao tác xóa");
              }}
              okText="Có"
              cancelText="Không"
            >
              <DeleteOutlined
                className="m-1 flex items-center justify-center"
                style={{ fontSize: "20px", color: "red" }}
              />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const handleEditClick = (record) => {
    setEditingRow(record._id);
    setEditData({ ...editData, _id: record._id });
  };

  const handleSaveClick = async (record) => {
    if (editData) {
      const result = await apiEditRoom(editData)
      // console.log(result)
      if (result.data.status === 1) {
        swal("Thành Công!", result.data.msg, "success").then((value) => { setEditingRow(null); setEditData(); getRooms() })
      } else {
        swal("Thông báo !", result.data.msg, "warning").then((value) => { getRooms() })
      }
    }
  };

  const tabs = [
    {
      label: 'Quản lý trạng thái phòng',
      key: '1',
      children: <RoomManagement data={dataSource} serviceData={serviceData} getRooms={getRooms}/>,
    },
    {
      label: 'Quản lý thông tin phòng',
      key: '2',
      children: (
        <Space size={0} direction="vertical" className="w-full">
          <div className="flex justify-between">
            <Button
              className="bg-primary border text-green"
              size={40}
              icon={<PlusOutlined />}
              onClick={() => {
                setShowAddRoomPopup(true);
              }}
            >
              Thêm phòng
            </Button>
          </div>
          <Table
            loading={loading}
            bordered
            rowKey="_id"
            columns={columns}
            dataSource={dataSource}
            pagination={{
              pageSize: 4,
            }}
          />
        </Space>
      ),
    },
  ];


  return (
    <div className="m-5">

      <AddRoomForm
        isVisible={showAddRoomPopup}
        onClose={() => setShowAddRoomPopup(false)}
        onSuccess={() => getRooms()}
      />

      <Tabs defaultActiveKey="1" items={tabs} />

      {/* <Tabs defaultActiveKey="1">
        <TabPane tab="Quản lý trạng thái phòng" key="1">
          <RoomManagement data={dataSource} serviceData={serviceData} />
        </TabPane>

        <TabPane tab="Quản lý thông tin phòng" key="2">
          <Space size={0} direction="vertical" className="w-full">
            <div className="flex justify-between">
              <Button
                className="bg-primary border text-green"
                size={40}
                icon={<PlusOutlined />}
                onClick={() => {
                  setShowAddRoomPopup(true);
                }}
              >
                Thêm phòng
              </Button>
            </div>
            <Table
              loading={loading}
              bordered
              rowKey="_id"
              columns={columns}
              dataSource={dataSource}
              pagination={{
                pageSize: 4,
              }}
            />
          </Space>
        </TabPane>
      </Tabs> */}
    </div >

  );
};




export default Room;
