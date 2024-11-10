import React, { useEffect, useState, useRef } from "react";
import {
  Rate,
  Space,
  Table,
  Typography,
  Image,
  Button,
  Input,
  Select,
  Popconfirm,
  InputNumber,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { apiDeleteRoom, apiEditRoom, apiGetAllRoom, apiGetAllSector } from "../../api";
import Highlighter from "react-highlight-words";
import AddRoomForm from "../../components/AddRoomForm";
import swal from "sweetalert";

const { Option } = Select;
const Room = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  //tim kiem + sap xep
  const [searchText, setSearchText] = useState("");

  const [searchedColumn, setSearchedColumn] = useState("");

  const searchInput = useRef(null);

  const [showAddRoomPopup, setShowAddRoomPopup] = useState(false);

  const [editData, setEditData] = useState({
    _id: "",
    nameRoom: "",
    giaRoom: "",
    loaiRoom  : "",
    discRoom: "",
    idSectorRoom: "",
  })


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
      close,
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
            Xóa
          </Button>
          <Button
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Lọc
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Đóng
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

  const [sectors, setSectors] = useState({});

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
              onChange={(e) => setEditData({...editData, nameRoom: e.target.value})}
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
              onChange={(e) => setEditData({...editData, giaRoom: e})}
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
                setEditData({...editData,  loaiRoom : value})
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
                setEditData({...editData, idSectorRoom: e})
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
      render: (value) => (
        <Image width={100} src={value.imgRoom[0].secure_url} />
      ),
    },
    {
      title: "Hình Ảnh 2",
      render: (value) => (
        <Image width={100} src={value.imgRoom[1].secure_url} />
      ),
    },
    {
      title: "Hình Ảnh 3",
      render: (value) => (
        <Image width={100} src={value.imgRoom[2].secure_url} />
      ),
    },
    // {
    //   title: "Đánh giá",
    //   key: "danhgiaRoom",
    //   dataIndex: "danhgiaRoom",
    //   render: (rating) => {
    //     return <Rate value={rating} allowHalf disabled></Rate>;
    //   },
    // },
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
            <Input
              defaultValue={text}
              onChange={(e) => 
                setEditData({...editData, discRoom: e.target.value})
                // console.log(e.target.value)
              }
            />
          );
        }
        return text;
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
              <DeleteOutlined
                className="m-1 flex items-center justify-center"
                style={{ fontSize: "20px", color: "red" }}
                onClick={async () => {
                  const result = await apiDeleteRoom(record);
                  if (result.status === 0) {
                    swal("Thành Công !", result.msg, "success");
                  }
                }}
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
                        console.log(record);
                        const result = await apiDeleteRoom({"_id" : record._id});
                        console.log(result)
                        if (result.data.status === 0) {
                          swal("Thành Công !", "Xóa phòng thành công !", "success").then((value) => {
                            window.location.reload();
                          });;
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

  useEffect(() => {
    setLoading(true);
    apiGetAllRoom().then((res) => {
      setDataSource(res.data.rooms);
      // console.log(res.data.rooms)
      setLoading(false);
    });
  }, []);

  const [editingRow, setEditingRow] = useState(null);

  const handleEditClick = (record) => {
    setEditingRow(record._id);
    setEditData({...editData, _id: record._id});
  };
  const handleSaveClick = async(record) => {
    if(editData){
      const result = await apiEditRoom(editData)
      console.log(result)
    if(result.data.status === 1){
      swal("Thành Công!" , result.data.msg, "success").then((value) => { window.location.reload();})
    }else{
      swal("Thông báo !" , result.data.msg, "warning").then((value) => { window.location.reload();})
    }
    }
    
  };

  return (
    <div className="p-5">
      {showAddRoomPopup && (
        <AddRoomForm setShowAddRoomPopup={setShowAddRoomPopup}></AddRoomForm>
      )}

      <Space size={20} direction="vertical">
        <div className="flex justify-around">
          <Typography.Title level={3}>QUẢN LÝ PHÒNG HOMESTAY</Typography.Title>
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
          // style={{ height: "500px", overflow: "auto" }}
          loading={loading}
          bordered
          rowKey="_id"
          columns={columns}
          dataSource={dataSource}
          pagination={{
            pageSize: 4,
          }}
        ></Table>
      </Space>
    </div>
  );
};

export default Room;
