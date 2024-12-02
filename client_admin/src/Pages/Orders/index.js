import React, { useEffect, useState, useRef } from "react";
import { Avatar, Button, Rate, Space, Table, Typography, Input, Select, Tooltip, message } from "antd";
import { SearchOutlined, CopyOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";

import {
  apiConfirmOrderRoom,
  apiGetAllUser,
  apiGetInfoRoom,
  apiGetAllRoom,
  apiCompleteOrderRoom,
  apiDeleteOrderRoom,
} from "../../api";
import AddSectorForm from "../../components/AddSectorForm";
import {
  EditOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import swal from "sweetalert";

const { Title: AntTitle } = Typography;

const Orders = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [data, setData] = useState([]);

  const getOrders = (data) => {
    setLoading(true);
    apiGetAllUser().then((res) => {
      setDataSource(res.data.users);
      setLoading(false);
    });
  }
  useEffect(() => {
    getOrders();
  }, []);

  useEffect(() => {

    if (dataSource.length > 0) {
      let allOrder = dataSource.reduce(
        (acc, user) => [...acc, ...user.order],
        []
      );
      allOrder.sort((a, b) => {
        if (a.statusOrder === "1") return -1;
        if (b.statusOrder === "1") return 1;
        if (a.statusOrder === "10") return 1;
        if (b.statusOrder === "10") return -1;
        if (a.statusOrder === "2" && b.statusOrder !== "1") return -1;
        if (b.statusOrder === "2" && a.statusOrder !== "1") return 1;
        return 0;
      });
      setData(allOrder);

    }
  }, [dataSource]);
  // console.log(data)

  const handleClickConfirmOrder = async (payload) => {
    const result = await apiConfirmOrderRoom(payload);
    console.log(result.data);
    if (result.data.status === 1) {
      swal({
        title: "Thành Công!",
        text: result.data.msg,
        icon: "success",
        button: "OK",
      }).then(() => {
        getOrders();
      });
    }
  };
  const handleClickCompleteOrder = async (payload) => {
    const result = await apiCompleteOrderRoom(payload);
    console.log(result.data);
    if (result.data.status === 1) {
      swal({
        title: "Thành Công!",
        text: result.data.msg,
        icon: "success",
        button: "OK",
      }).then(() => {
        getOrders();
      });
    }
  };
  const handleClickDeleteOrder = async (payload) => {
    console.log(payload);
    const result = await apiDeleteOrderRoom(payload);
    console.log(result.data);
    if (result.data.status === 1) {
      swal({
        title: "Thành Công!",
        text: result.data.msg,
        icon: "success",
        button: "OK",
      }).then(() => {
        getOrders();
      });
    }
  };

  const [roomNames, setRoomNames] = useState({});
  const [roomIds, setRoomIds] = useState([]);
  const getApiGetInfo = async (idRoom) => {
    const res = await apiGetInfoRoom({ idRoom });
    const nameRoom = res.data[0].nameRoom;
    setRoomNames((prevRoomNames) => ({ ...prevRoomNames, [idRoom]: nameRoom }));
  };

  useEffect(() => {
    // Assuming you have a list of room IDs you want to fetch names for
    const fetchRooms = async () => {
      const res = await apiGetAllRoom();
      // console.log(object)
      // console.log(res.data.rooms[0])

      res.data.rooms.forEach((room) => {
        setRoomIds((prev) => [...prev, room._id]);
      });
    };
    fetchRooms();
    // const roomIds = ["65b377dfdc9b573d146614dd","65deda99215212200ab94206"];
    roomIds.forEach((id) => getApiGetInfo(id));
  }, [data, dataSource]);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
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
            onClick={() => clearFilters && handleReset(clearFilters) && handleSearch(selectedKeys, confirm, dataIndex)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Đặt lại
          </Button>
          <Button
            type="link"
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

  return (
    <div className="p-5">
      <Space size={0} direction="vertical" className="w-full">
        <div className="flex">
          <AntTitle level={4} className="text-2xl font-semibold mb-4">QUẢN LÝ ĐẶT PHÒNG</AntTitle>
        </div>
        <Table
          loading={loading}
          rowKey="idOrder"
          columns={[
            {
              title: "Mã Đơn",
              dataIndex: "idOrder",
              width: "150px",
              sorter: (a, b) => a.idOrder.localeCompare(b.idOrder),
              // render: (value) => <span>{value}</span>,
              render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Tooltip title={text}>
                    {text.slice(0, 5)}...
                  </Tooltip>
                  <Button
                    icon={<CopyOutlined />}
                    size="small"
                    style={{ marginLeft: '8px' }}
                    onClick={() => navigator.clipboard.writeText(text).then(() => message.success('Đã sao chép vào bảng nhớ tạm!'))}
                  />
                </div>
              ),
            },
            {
              title: "Người sử dụng",
              dataIndex: "userInput",
              ...getColumnSearchProps("userInput"),
              sorter: (a, b) => a.userInput.length - b.userInput.length,
              sortDirections: ["descend", "ascend"],
            },
            {
              title: "Số điện thoại",
              dataIndex: "phoneInput",
              ...getColumnSearchProps("phoneInput"),
            },
            {
              title: "Tên phòng",
              dataIndex: "idRoom",
              render: (idRoom) => {
                // Use the roomNames state to access the room name
                const name = roomNames[idRoom];
                return <span>{name}</span>;
              },
            },
            {
              title: "Ngày đặt",
              dataIndex: "dateInput",
              sorter: (a, b) => {
                const dateA = a.dateInput[0].split('/').reverse().join('');
                const dateB = b.dateInput[0].split('/').reverse().join('');
                return dateA.localeCompare(dateB);
              },
              render: (value) => <span>{value[0]}</span>,
              align: 'center',
            },
            // {
            //   title: "Số ngày",
            //   dataIndex: "dateInput",
            //   sorter: (a, b) => a.dateInput.length - b.dateInput.length,
            //   render: (value) => <span>{value.length}</span>,
            //   align: 'center',
            // },
            {
              title: "Trạng thái",
              dataIndex: "statusOrder",
              filters: [
                { text: "Chờ xác nhận", value: "1" },
                { text: "Đã xác nhận", value: "2" },
                { text: "Đã hoàn thành", value: "3" },
                { text: "Đã hủy đặt", value: "10" },
              ],
              onFilter: (value, record) => record.statusOrder.indexOf(value) === 0,
              render: (value) => {
                let status;
                switch (value) {
                  case "1":
                    status = "Chờ xác nhận";
                    break;
                  case "2":
                    status = "Đã xác nhận";
                    break;
                  case "3":
                    status = "Đã hoàn thành";
                    break;
                  case "10":
                    status = "Đã hủy đặt";
                    break;
                  default:
                    status = "Không xác định";
                }
                return <span>{status}</span>;
              },
            },
            {
              title: "Thanh toán",
              dataIndex: "pay",
              filters: [
                { text: "Đã thanh toán", value: "true" },
                { text: "Chưa thanh toán", value: "false" },
              ],
              onFilter: (value, record) => record.pay.toString() === value,
              render: (value) => (
                <span>
                  {value === "true" ? "Đã thanh toán" : "Chưa thanh toán"}
                </span>
              ),
            },
            {
              title: "Xác Nhận",
              dataIndex: "statusOrder",
              align: 'center',
              render: (value, record) => (
                <span>
                  {value === "1" ? (
                    <Button
                      title="Xác nhận đơn đặt phòng"
                      className=" flex items-center justify-center"
                      style={{ fontSize: "18px", color: "green" }}
                      shape="round"
                      icon={<CheckCircleOutlined />}
                      onClick={() => {
                        handleClickConfirmOrder(record);
                      }}
                    >
                      Xác Nhận
                    </Button>
                  ) :
                    <span>Đã xác nhận</span>
                  }
                </span>
              ),
            },
            {
              title: "Xử lí",
              render: (index) => (
                <div className="flex justify-between">
                  {/* <UnorderedListOutlined
                    title="Xem chi tiết"
                    className="m-1 flex items-center justify-center"
                    style={{ fontSize: "20px", color: "green" }}
                    onClick={() => {}}
                  /> */}
                  <CheckCircleOutlined
                    title="Nhấn để hoàn thành đơn"
                    className="m-1 flex items-center justify-center"
                    style={{ fontSize: "20px", color: "blue" }}
                    onClick={() => {
                      // console.log(index)
                      handleClickCompleteOrder(index);
                    }}
                  />
                  <DeleteOutlined
                    title="Xóa đơn hàng"
                    className="m-1 flex items-center justify-center"
                    style={{ fontSize: "20px", color: "red" }}
                    onClick={() => {
                      // console.log(index)
                      handleClickDeleteOrder(index);
                    }}
                  />
                </div>
              ),
            },
          ]}
          dataSource={data}
          pagination={{
            pageSize: 8,
          }}
        ></Table>
      </Space>
    </div>
  );
};

export default Orders;
