import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import React, { useEffect, useState, useRef } from "react";
import { Avatar, Button, Rate, Space, Table, Typography, Input, Select, Tooltip, message, Modal, Popconfirm } from "antd";
import Highlighter from "react-highlight-words";
import dayjs from "dayjs";

import {
  apiGetAllUserOrder,
  apiConfirmOrderRoom,
  apiCheckinOrderRoom,
  apiCompleteOrderRoom,
  apiDeleteOrderRoom,
  apiCancelOrderRoom,
} from "../../api";
// import AddSectorForm from "../../components/AddSectorForm";
import {
  SearchOutlined,
  CopyOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import swal from "sweetalert";

const { Title: AntTitle } = Typography;

const Orders = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [data, setData] = useState([]);

  const getOrders = (data) => {
    setLoading(true);
    apiGetAllUserOrder().then((res) => {
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

      // allOrder.sort((a, b) => {
      //   if (a.statusOrder === "1") return -1;
      //   if (b.statusOrder === "1") return 1;
      //   if (a.statusOrder === "10") return 1;
      //   if (b.statusOrder === "10") return -1;
      //   if (a.statusOrder === "2" && b.statusOrder !== "1") return -1;
      //   if (b.statusOrder === "2" && a.statusOrder !== "1") return 1;
      //   return 0;
      // });

      allOrder.sort((a, b) => {
        const priority = { "1": 1, "2": 2, "10": 3 };
        return (priority[a.statusOrder] || 4) - (priority[b.statusOrder] || 4);
      });
      setData(allOrder);
      console.log('allOrder', allOrder);

    }
  }, [dataSource]);

  const handleClickConfirmOrder = async (payload) => {
    try {
      const result = await apiConfirmOrderRoom(payload);
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
    } catch (error) {
      swal({ title: "Error", text: error.message, icon: "error", button: "OK" });
    }
  };
  const handleClickCompleteOrder = async (payload) => {
    const result = await apiCompleteOrderRoom(payload);
    // console.log(result.data);
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
    // console.log(payload);
    const result = await apiDeleteOrderRoom(payload);
    // console.log(result.data);
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
  const handleClickCancelOrder = async (payload) => {
    const result = await apiCancelOrderRoom(payload);
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

  function handleCheckInOut(record) {
    if (!record.cccd) {
      swal({
        text: "Vui lòng nhập chứng minh thư (12 số)",
        content: "input",
        buttons: {
          confirm: {
            text: "Xác nhận",
            value: true,
            visible: true,
            closeModal: false,
          },
          cancel: {
            text: "Đóng",
            value: false,
            visible: true,
            closeModal: true,
          },
        },
      }).then((value) => {
        const trimmedValue = value ? value.trim() : "";

        if (!trimmedValue) {
          swal({
            title: "Cảnh báo!",
            text: "Checking chưa hoàn tất",
            icon: "warning",
            button: "OK",
          });
          return;
        }

        if (!/^\d{12}$/.test(trimmedValue)) {
          swal({
            title: "Lỗi!",
            text: "Chứng minh thư phải là 12 số.",
            icon: "error",
            button: "OK",
          });
          return;
        }


        // Handle valid CCCD input
        apiCheckinOrderRoom({ ...record, cccd: trimmedValue })
          .then(() => {
            swal("Thành công!", "Chứng minh thư đã được cập nhật.", "success");
            getOrders();
          })
          .catch((err) => {
            swal(
              "Lỗi!",
              err?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật.",
              "error"
            );
          });
      });
    } else {
      Modal.info({
        title: "Hóa đơn",
        content: (
          <div style={{ lineHeight: "1.5" }}>
            <p><strong>Mã đơn:</strong> {record.idOrder}</p>
            <p><strong>Người sử dụng:</strong> {record.userInput}</p>
            <p><strong>Căn cước:</strong> {record.cccd}</p>
            <p><strong>Số điện thoại:</strong> {record.phoneInput}</p>
            <p><strong>Phòng:</strong> {record.room?.nameRoom}</p>
            <p>
              <strong>Giá:</strong> {record.room?.giaRoom.toLocaleString()} VND x{" "}
              {record.dateInput && record.dateInput.length === 2
                ? dayjs(record.dateInput[1], "DD/MM/YYYY").diff(
                  dayjs(record.dateInput[0], "DD/MM/YYYY"),
                  "day"
                )
                : "Chưa xác định"}{" "}
              đêm
            </p>
            <div>
              <strong>Dịch vụ:</strong>
              {record.extraServices && record.extraServices.length > 0 ? (
                <ul>
                  {record.extraServices.map((service, index) => (
                    <li key={index}>
                      {service.serviceType || "Dịch vụ không xác định"} {" "}
                      ({Number(service.pricePerUnit).toLocaleString()} VND) x
                      {service.guests || 0} (khách) x
                      {(Array.isArray(service.dates) ? service.dates.length : "Không rõ")} (ngày)
                    </li>
                  ))}
                </ul>
              ) : (
                "Không có dịch vụ bổ sung"
              )}
            </div>
            <p>
              <strong>Trả trước:</strong>{" "}
              {Number(record.deposit || 0).toLocaleString()} VND
            </p>
            <hr style={{ margin: "10px 0" }} />
            <p>
              <strong>Thành tiền:</strong>{" "}
              {(Number(record.totalMoney || 0) - Number(record.deposit || 0)).toLocaleString()} VND
            </p>
          </div>
        ),
        onOk() { },
        footer: (
          <div style={{ textAlign: "right" }}>
            <Button
              onClick={() => printInvoice(record)}
              style={{ marginRight: 8 }}
            >
              In hóa đơn
            </Button>
            <Button
              onClick={() => handleClickCompleteOrder(record)}
              style={{ marginRight: 8 }}
            >
              Hoàn thành đơn
            </Button>
            <Button onClick={() => Modal.destroyAll()}>Đóng</Button>
          </div>
        ),
      });
    }
  }

  function viewOrderDetails(record) {
    const modal = Modal.info({
      title: "Chi tiết đơn hàng",
      content: (
        <div style={{ lineHeight: "1.5" }}>
          <p><strong>Mã đơn:</strong> {record.idOrder}</p>
          <p><strong>Người sử dụng:</strong> {record.userInput}</p>
          <p><strong>Căn cước:</strong> {record.cccd || "Chưa xác định"}</p>
          <p><strong>Số điện thoại:</strong> {record.phoneInput || "Chưa xác định"}</p>
          <p><strong>Phòng:</strong> {record.room?.nameRoom || "Chưa xác định"}</p>
          <p>
            <strong>Giá:</strong>{" "}
            {record.room?.giaRoom.toLocaleString()} VND x{" "}
            {record.dateInput && record.dateInput.length === 2
              ? dayjs(record.dateInput[1], "DD/MM/YYYY").diff(
                  dayjs(record.dateInput[0], "DD/MM/YYYY"),
                  "day"
                )
              : "Chưa xác định"}{" "}
            đêm
          </p>
          <div>
            <strong>Dịch vụ:</strong>
            {record.extraServices && record.extraServices.length > 0 ? (
              <ul>
                {record.extraServices.map((service, index) => (
                  <li key={index}>
                    {service.serviceType || "Dịch vụ không xác định"} {" "}
                    ({Number(service.pricePerUnit).toLocaleString()} VND) x
                    {service.guests || 0} (khách) x
                    {(Array.isArray(service.dates) ? service.dates.length : "Không rõ")} (ngày)
                  </li>
                ))}
              </ul>
            ) : (
              "Không có dịch vụ bổ sung"
            )}
          </div>
          <p>
            <strong>Trả trước:</strong>{" "}
            {Number(record.deposit || 0).toLocaleString()} VND
          </p>
          <hr style={{ margin: "10px 0" }} />
          <p>
            <strong>Thành tiền:</strong>{" "}
            {(Number(record.totalMoney || 0) - Number(record.deposit || 0)).toLocaleString()} VND
          </p>
        </div>
      ),
      footer: (
        <div style={{ textAlign: "right" }}>
          <Button onClick={() => modal.destroy()}>
            Đóng
          </Button>
        </div>
      ),
    });
  }
  
  function printInvoice(record) {
    if (!record || !record.idOrder) {
      alert('Không tìm thấy thông tin đơn hàng!');
      return;
    }

    const userDetails = record.user || { name: "N/A", phone: "N/A", email: "N/A" };
    const roomDetails = record.room || {};
    const startDate = dayjs(record.dateInput?.[0], "DD/MM/YYYY");
    const endDate = dayjs(record.dateInput?.[1], "DD/MM/YYYY");
    const night = startDate.isValid() && endDate.isValid() ? endDate.diff(startDate, "day") : 0;

    const totalAmount = Number(record.totalMoney || 0);
    const deposit = Number(record.deposit || 0);

    const extraServices = Array.isArray(record.extraServices) ? record.extraServices : [];
    const serviceRows = extraServices.map((service, index) => `
        <tr>
            <td>${service.serviceType || "Dịch vụ không xác định"}</td>
            <td>${Number(service.pricePerUnit || 0).toLocaleString()} VND</td>            
            <td>${service.guests || 0} khách x${(Array.isArray(service.dates) ? service.dates.length : "Không rõ")} ngày</td>
            <td>${Number(service.totalServiceCost || 0).toLocaleString()} VND</td>
        </tr>
    `).join('');

    const newWindow = window.open('', '_blank', 'width=800,height=600');
    newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hóa Đơn Khách Sạn</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 10px;
                }
                .header { text-align: center; margin-bottom: 10px; }
                .header h1 { color: #2c3e50; margin-bottom: 5px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 10px; }
                .info-section h2 {
                    color: #2c3e50; border-bottom: 2px solid #3498db;
                    padding-bottom: 5px; margin-bottom: 10px;
                }
                table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .total-section { text-align: right; }
                .total-row { font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; font-style: italic; color: #7f8c8d; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Hóa Đơn Khách Sạn</h1>
                <p>Mã Đơn Hàng: ${record.idOrder}</p>
                <p>Ngày lập: ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="info-grid">
                <div class="info-section">
                    <h2>Thông tin khách hàng</h2>
                    <p><strong>Tên:</strong> ${userDetails.name}</p>
                    <p><strong>Số điện thoại:</strong> ${userDetails.phone}</p>
                    <p><strong>Email:</strong> ${userDetails.email}</p>
                </div>
                <div class="info-section">
                    <h2>Thông tin nhà cung cấp</h2>
                    <p><strong>Tên:</strong> Homestay</p>                    
                    <p><strong>Điện thoại:</strong> 0292 2222 222</p>
                    <p><strong>Địa chỉ:</strong> Bãi Bàng, Lại Sơn, Kiên Hải, Kiên Giang.</p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Mô tả</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${roomDetails.nameRoom || "Phòng không xác định"}</td>
                        <td>${(roomDetails.giaRoom || 0).toLocaleString()} VND</td>
                        <td>${night} đêm</td>
                        <td>${(roomDetails.giaRoom * night || 0).toLocaleString()} VND</td>
                    </tr>
                    ${serviceRows}
                </tbody>
            </table>

            <div class="total-section">
                <p><strong>Tổng cộng:</strong> ${totalAmount.toLocaleString()} VND</p>
                <p><strong>Đã trả trước:</strong> ${deposit.toLocaleString()} VND</p>
                <p class="total-row"><strong>Số tiền cần thanh toán:</strong> ${(totalAmount - deposit).toLocaleString()} VND</p>
            </div>

            <div class="footer">
                <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
                <p>Chúc quý khách có một kỳ nghỉ vui vẻ.</p>
            </div>
        </body>
        </html>
    `);

    newWindow.onload = function () {
      newWindow.print();
      newWindow.close();
    };
  }

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
    filterDropdownProps: {
      onOpenChange: (open) => {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    // onOpenChange: (visible) => {
    //   if (visible) {
    //     setTimeout(() => searchInput.current?.select(), 100);
    //   }
    // },
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

  const getColumnSearchProps2 = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          placeholder={`Search ${dataIndex}`}
          onPressEnter={() => handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            onClick={() => handleSearch(selectedKeys, confirm)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      // Safely access nested property using optional chaining
      const data = dataIndex.split('.').reduce((acc, key) => acc?.[key], record) || '';
      return data.toString().toLowerCase().includes(value.toLowerCase());
    },
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
              width: "100px",
              ...getColumnSearchProps("idOrder"),
              sorter: (a, b) => a.idOrder.localeCompare(b.idOrder),
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
              // sorter: (a, b) => a.userInput.length - b.userInput.length,
              // sortDirections: ["descend", "ascend"],
            },
            {
              title: "Điện thoại",
              dataIndex: "phoneInput",
              ...getColumnSearchProps("phoneInput"),
            },
            {
              title: "Tên phòng",
              dataIndex: ['room', 'nameRoom'],
              key: 'nameRoom',
              ...getColumnSearchProps2('room.nameRoom'),
              // render: (room) => {
              //   return <span>{room?.nameRoom}</span>;
              // },
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
            {
              title: "Số ngày",
              dataIndex: "dateInput",
              sorter: (a, b) => a.dateInput.length - b.dateInput.length,
              render: (value) => {
                console.log(value);
                const start = dayjs(value[0], "DD/MM/YYYY");
                const end = dayjs(value[1], "DD/MM/YYYY");
                const days = end.diff(start, "day");
                return <span>{days}</span>;
              },
              align: 'center',
            },
            {
              title: "Thanh toán",
              dataIndex: "pay",
              filters: [
                { text: "Rồi", value: "true" },
                { text: "Chưa", value: "false" },
              ],
              onFilter: (value, record) => record.pay.toString() === value,
              render: (value) => (
                <span>
                  {value === "true" ? "Rồi" : "Chưa"}
                </span>
              ),
            },
            {
              title: "Trạng thái",
              dataIndex: "statusOrder",
              filters: [
                { text: "Chờ xác nhận", value: "1" },
                { text: "Đã xác nhận", value: "2" },
                { text: "Đã hoàn thành", value: "3" },
                { text: "Đã hủy đặt", value: "10" },
              ],
              onFilter: (value, record) => record.statusOrder === value,
              render: (value) => {
                let status;
                switch (value) {
                  case '1': status = 'Chờ xác nhận'; break;
                  case '2': status = 'Đã xác nhận'; break;
                  case '3': status = 'Đã hoàn thành'; break;
                  case '10': status = 'Đã hủy đặt'; break;
                  default: status = 'Không xác định';
                }
                return <span>{status}</span>;
              },
            },
            {
              title: "Xử lí",
              render: (_, record) => (
                <div className="flex justify-between">
                  {record.statusOrder === '2' && (
                    <Button
                      className="max-w-[110px] bg-blue-500 text-white hover:opacity-80 hover:bg-white  rounded-lg transition duration-150 ease-in-out"
                      onClick={() => {
                        handleCheckInOut(record);
                      }}

                    >
                      CheckIn/Out
                    </Button>
                  )}
                  {record.statusOrder === '1' && (
                    <Button
                      className="w-[110px] bg-green-500 text-white hover:opacity-80 hover:bg-white  rounded-lg transition duration-150 ease-in-out"
                      onClick={() => {
                        handleClickConfirmOrder(record);
                      }}
                    >
                      Xác nhận
                    </Button>
                  )}
                </div>
              ),
            },
            {
              title: "Thao Tác",
              align: 'center',
              fixed: 'right',
              render: (_, record) => (
                <div className="flex space-x-2">
                  <Button
                    color="default" variant="outlined"
                    onClick={() => viewOrderDetails(record)}
                  >
                    Chi tiết
                  </Button>

                  <Popconfirm
                    okType="danger"                   
                    title="Bạn có chắc chắn muốn xóa không?"
                    onConfirm={
                      () => {
                        handleClickCancelOrder(record);
                      }
                    }
                    onCancel={() => {
                      console.log("Hủy bỏ thao tác xóa");
                    }}
                    okText="Có"
                    cancelText="Không"
                  >
                    <Button
                      danger
                      disabled={record.statusOrder !== '1' && record.statusOrder !== '2'}
                    >
                      Hủy
                    </Button>
                  </Popconfirm>
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

    </div >
  );
};

export default Orders;
