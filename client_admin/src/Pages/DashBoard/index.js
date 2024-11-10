import {
  //   DollarCircleOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  ShoppingCartOutlined,
  //   ShoppingOutlined,
  UserOutlined,
  //   MoneyCollectOutlined,
} from "@ant-design/icons";
import {
  // Avatar,
  Card,
  Space,
  Statistic,
  Table,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { LuCircleDollarSign } from "react-icons/lu";
import { LiaCommentsDollarSolid } from "react-icons/lia";
import {
  getOrders,
  getRevenue,
  apiGetAllUser,
  apiGetInfoRoom,
} from "../../api";
import * as api from "../../api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashBoard = () => {
  const [orders, setOrders] = useState(0);
  const [orderComplete, setOrderComplete] = useState(0);
  const [inventor, setInventor] = useState(0);
  const [customer, setcustomer] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [totalMoney, setTotalMoney] = useState(0);

  const getAllSector = async () => {
    const result = await api.apiGetAllSector();
    // console.log(result.data)
    const lengthdata = result.data.length;
    // console.log(lengthdata)
    setInventor(lengthdata);
    return lengthdata;
  };
  const getAllRoom = async () => {
    const result = await api.apiGetAllRoom();
    // console.log(result.data)
    const lengthdata = result.data.length;
    // console.log(lengthdata)
    setRevenue(lengthdata);
    return lengthdata;
  };
  const getAllUser = async () => {
    const result = await api.apiGetAllUser();
    // console.log(result.data);
    const lengthdata = result.data.length;
    // console.log(lengthdata)
    setcustomer(lengthdata);
    return lengthdata;
  };
  const getAllOrderComplete = async () => {
    const result = await api.apiGetAllUserOrder();
    // console.log(result.data);
    let totalOrdersWithStatusTen = 0;

    result.data.users.forEach((user) => {
      // console.log(user)
      // Lọc các order có statusOrder bằng 10 và đếm
      const ordersWithStatusTen = user.order.filter(
        (order) => order.statusOrder === "3"
      ).length;
      totalOrdersWithStatusTen += ordersWithStatusTen;
    });

    // console.log(`Tổng số order có statusOrder bằng 10 là: ${totalOrdersWithStatusTen}`);
    setOrderComplete(totalOrdersWithStatusTen); // Cập nhật state với số lượng order mới
    // return totalOrdersWithStatusTen; // Trả về tổng số lượng order có statusOrder bằng 10
  };
  const getAllOrder = async () => {
    const result = await api.apiGetAllUserOrder();
    // console.log(result.data);
    let totalOrdersWithStatusTen = 0;

    result.data.users.forEach((user) => {
      const ordersWithStatusTen = user.order.length;
      totalOrdersWithStatusTen += ordersWithStatusTen;
    });

    // console.log(`Tổng số order có statusOrder bằng 10 là: ${totalOrdersWithStatusTen}`);
    setOrders(totalOrdersWithStatusTen); // Cập nhật state với số lượng order mới
    // return totalOrdersWithStatusTen; // Trả về tổng số lượng order có statusOrder bằng 10
  };
  const getAllOrderTotalMoney = async () => {
    const result = await api.apiGetAllUserOrder();
    let totalOrdersWithStatusThree = 0;
    let totalMoney = 0;

    result.data.users.forEach((user) => {
      // Lọc các order có statusOrder bằng 3 và đếm
      const ordersWithStatusThree = user.order.filter(
        (order) => order.statusOrder === "3"
      );
      totalOrdersWithStatusThree += ordersWithStatusThree.length;

      // Tính tổng totalMoney của các order có statusOrder bằng 3
      // Chuyển đổi chuỗi số tiền thành số thực (double) trước khi cộng
      const moneyForStatusThree = ordersWithStatusThree.reduce(
        (sum, order) => sum + parseFloat(order.totalMoney),
        0
      );
      totalMoney += moneyForStatusThree;
    });
    // console.log(`Tổng số order có statusOrder bằng 10 là: ${totalOrdersWithStatusTen}`);
    setTotalMoney(totalMoney); // Cập nhật state với số lượng order mới
    // return totalOrdersWithStatusTen; // Trả về tổng số lượng order có statusOrder bằng 10
  };
  useEffect(() => {
    getAllSector();
    getAllRoom();
    getAllUser();
    getAllOrderComplete();
    getAllOrder();
    getAllOrderTotalMoney();
  }, []);

  return (
    <div className="ml-5">
      <Space size={20} direction="vertical">
        {/* <div className="flex justify-center items-center">
       <Typography.Title level={3}> DashBoard</Typography.Title>
       </div> */}
        <Space direction="horizontal">
          <DashBoardCard
            icon={
              <ShoppingCartOutlined
                style={{
                  color: "green",
                  backgroundColor: "rgba(0,255,0,0.25)",
                  borderRadius: 20,
                  fontSize: 24,
                  padding: 8,
                }}
              />
            }
            title={"Tổng Đơn Đặt phòng"}
            value={orders}
          ></DashBoardCard>
          <DashBoardCard
            icon={
              <LiaCommentsDollarSolid
                style={{
                  color: "RGB(255, 178, 43)",
                  backgroundColor: "RGB(255, 216, 150)",
                  borderRadius: 20,
                  fontSize: 38,
                  padding: 8,
                }}
              />
            }
            title={"Đơn Hoàn Thành"}
            value={orderComplete}
          ></DashBoardCard>

          <DashBoardCard
            icon={
              <LuCircleDollarSign
                // size={24}
                style={{
                  color: "RGB(255, 178, 43)",
                  backgroundColor: "RGB(255, 216, 150)",
                  borderRadius: 20,
                  fontSize: 38,
                  padding: 8,
                }}
              />
            }
            title={"Tổng Thu Nhập"}
            value={`${totalMoney.toLocaleString("vi-VN")} vnđ`}
          ></DashBoardCard>
          <DashBoardCard
            icon={
              <MenuFoldOutlined
                style={{
                  color: "purplr",
                  backgroundColor: "rgba(0,255,255,0.25)",
                  borderRadius: 20,
                  fontSize: 24,
                  padding: 8,
                }}
              />
            }
            title={"Khu Vực"}
            value={inventor}
          ></DashBoardCard>

          <DashBoardCard
            icon={
              <HomeOutlined
                style={{
                  color: "blue",
                  backgroundColor: "rgba(0,0,255,0.25)",
                  borderRadius: 20,
                  fontSize: 24,
                  padding: 8,
                }}
              />
            }
            title={"Phòng"}
            value={revenue}
          ></DashBoardCard>
          <DashBoardCard
            icon={
              <UserOutlined
                style={{
                  color: "red",
                  backgroundColor: "rgba(255,0,0,0.25)",
                  borderRadius: 20,
                  fontSize: 24,
                  padding: 8,
                }}
              />
            }
            title={"Khách Hàng"}
            value={customer}
          ></DashBoardCard>
        </Space>
        <Space>
          <RecentOrder></RecentOrder>
          <DashBoardChart></DashBoardChart>
        </Space>
        {/* <Space>
          <RecentOrder></RecentOrder>
          <DashBoardChart></DashBoardChart>
        </Space> */}
      </Space>
    </div>
  );
};

const DashBoardCard = ({ title, value, icon }) => {
  return (
    <div>
      <Space direction="horizontal">
        <Card>
          <Space>
            {icon}
            <Statistic title={title} value={value}></Statistic>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

const RecentOrder = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiGetAllUser().then(async (res) => {
      const users = res.data.users;
      const roomData = await Promise.all(
        users.flatMap((user) =>
          user.order
            .filter((order) => order.statusOrder === "3")
            .map(async (order) => {
              // console.log(order)
              const roomName = await apiGetInfoRoom({ idRoom: order.idRoom });
              // console.log(roomName) // Lấy tên phòng từ idRoom
              return {
                key: order.idRoom,
                roomName: roomName.data[0].nameRoom,
                giaRoom: roomName.data[0].giaRoom,
                daysBooked: order.dateInput.length, // Tổng số ngày được đặt
                totalRevenue: parseFloat(order.totalMoney), // Tổng doanh thu
              };
            })
        )
      );

      // Tính toán tổng số ngày và doanh thu cho mỗi phòng
      const aggregatedData = roomData.reduce((acc, room) => {
        if (!acc[room.key]) {
          acc[room.key] = { ...room, count: 1 };
        } else {
          acc[room.key].daysBooked += room.daysBooked;
          acc[room.key].totalRevenue += room.totalRevenue;
          acc[room.key].count += 1;
        }
        return acc;
      }, {});

      // Chuyển đổi đối tượng thành mảng cho dataSource
      const formattedData = Object.values(aggregatedData).map((item) => ({
        idRoom: item.key,
        roomName: item.roomName,
        giaRoom: item.giaRoom,
        daysBooked: item.daysBooked,
        totalRevenue: item.totalRevenue,
      }));

      setDataSource(formattedData);
      setLoading(false);
    });
  }, []);

  const columns = [
    {
      title: "Tên phòng",
      dataIndex: "roomName",
      key: "roomName",
      align: "left",
    },
    {
      title: "Số ngày được đặt",
      dataIndex: "daysBooked",
      key: "daysBooked",
      align: "center",
    },
    {
      title: "Đơn giá phòng",
      dataIndex: "giaRoom",
      key: "daysBooked",
      align: "center",
      render: (text) => `${text.toLocaleString()} VND`,
    },
    {
      title: "Tổng doanh thu",
      dataIndex: "totalRevenue",
      render: (text) => `${text.toLocaleString()} VND`,
      align: "right",
    },
  ];

  return (
    <div>
      {/* <Typography.Text>Danh Sách Phòng Đã Đặt</Typography.Text>
      <Table
        columns={columns}
        rowKey={"idRoom"}
        loading={loading}
        dataSource={dataSource}
        pagination={false}
      /> */}
      <Card
        title="Danh Thu Các Phòng"
        style={{ width: "650px", height: "480px" }}
      >
        <Table
          columns={columns}
          rowKey="idRoom"
          loading={loading}
          dataSource={dataSource}
          pagination={false}
          scroll={{ y: 300 }} // Điều chỉnh giá trị y tùy theo kích thước bạn muốn
        />
      </Card>
    </div>
  );
};


const DashBoardChart = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState({});
  const [year, setYear] = useState(new Date().getFullYear()); // State mới để lưu trữ năm

  useEffect(() => {
    const fetchOrders = async () => {
      const result = await api.apiGetAllUser();
      const orders = result.data.users.flatMap((user) => user.order);
      const completedOrders = orders.filter(
        (order) => order.statusOrder === "3"
      );

      // Tạo một mảng chứa tên của tất cả các tháng trong năm
      const months = Array.from({ length: 12 }, (_, i) => {
        return new Date(0, i).toLocaleString("vi-VN", { month: "short" });
      });

      // Khởi tạo đối tượng với tất cả các tháng và giá trị mặc định là 0
      const initialRevenueByMonth = months.reduce((acc, month) => {
        acc[month] = 0;
        return acc;
      }, {});

      // Cập nhật doanh thu cho các tháng có dữ liệu và nằm trong năm được chọn
      completedOrders.forEach((order) => {
        const dateParts =
          order.dateInput[order.dateInput.length - 1].split("/");
        const date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
        if (date.getFullYear() === year) { // Kiểm tra nếu đơn hàng nằm trong năm được chọn
          const month = date.toLocaleString("vi-VN", { month: "short" });
          initialRevenueByMonth[month] += parseFloat(order.totalMoney);
        }
      });

      setMonthlyRevenue(initialRevenueByMonth);
    };

    fetchOrders();
  }, [year]); // Thêm year vào dependency array để refetch khi năm thay đổi

  const handleYearChange = (e) => {
    setYear(Number(e.target.value)); // Cập nhật năm khi người dùng nhập vào
  };

  const data = {
    labels: Object.keys(monthlyRevenue).sort(
      (a, b) => new Date(a) - new Date(b)
    ),
    datasets: [
      {
        label: "Doanh thu",
        data: Object.values(monthlyRevenue),
        backgroundColor: "rgba(255, 0, 0, 1)", // Màu đỏ cho tất cả các cột
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1.5,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        ticks: {
          autoSkip: false, // Không tự động bỏ qua nhãn
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Biểu đồ doanh thu theo tháng",
      },
    },
  };

  return (
    <Card
      title={
        <>
          Biểu Đồ Doanh Thu Trong Năm
          <input
            type="number"
            className="border "
            value={year}
            onChange={handleYearChange}
            style={{ marginLeft: '10px',  width:'60px' }} // Thêm input để nhập năm
          />
        </>
      }
      style={{ width: "550px", height: "480px" }}
    >
      <Bar
        data={data}
        options={options}
        style={{ width: "100%", height: "100%" }}
      />
    </Card>
  );
};

export default DashBoard;
