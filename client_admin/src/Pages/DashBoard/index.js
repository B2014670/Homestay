import React, { useEffect, useState } from 'react';
import { Card, Space, Statistic, Table, Typography, Input } from 'antd';
import { Bar } from 'react-chartjs-2';
import dayjs from 'dayjs';
import {
  ShoppingCartOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { LuCircleDollarSign } from 'react-icons/lu';
import { LiaCommentsDollarSolid } from 'react-icons/lia';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import * as api from '../../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const { Title: AntTitle } = Typography;

const DashBoard = () => {
  const [stats, setStats] = useState({
    orders: 0,
    orderComplete: 0,
    inventor: 0,
    customer: 0,
    revenue: 0,
    totalMoney: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectors, rooms, users, orders] = await Promise.all([
          api.apiGetAllSector(),
          api.apiGetAllRoom(),
          api.apiGetAllUser(),
          api.apiGetAllUserOrder(),
        ]);

        const orderComplete = orders.data.users.reduce((acc, user) =>
          acc + user.order.filter(order => order.statusOrder === "3").length, 0);

        const totalOrders = orders.data.users.reduce((acc, user) => acc + user.order.length, 0);

        const totalMoney = orders.data.users.reduce((acc, user) =>
          acc + user.order.filter(order => order.statusOrder === "3")
            .reduce((sum, order) => sum + parseFloat(order.totalMoney), 0), 0);

        setStats({
          orders: totalOrders,
          orderComplete,
          inventor: sectors.data.length,
          customer: users.data.length,
          revenue: rooms.data.length,
          totalMoney,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="px-6 bg-gray-100">
      <AntTitle level={4} className="">Dashboard</AntTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
        <DashBoardCard
          icon={<ShoppingCartOutlined className="text-green-500 text-2xl" />}
          title="Tổng Đơn Đặt phòng"
          value={stats.orders}
        />
        <DashBoardCard
          icon={<LiaCommentsDollarSolid className="text-yellow-500 text-2xl" />}
          title="Đơn Hoàn Thành"
          value={stats.orderComplete}
        />
        <DashBoardCard
          icon={<LuCircleDollarSign className="text-yellow-500 text-2xl" />}
          title="Tổng Thu Nhập"
          value={`${stats.totalMoney.toLocaleString("vi-VN")} vnđ`}
        />
        <DashBoardCard
          icon={<MenuFoldOutlined className="text-purple-500 text-2xl" />}
          title="Khu Vực"
          value={stats.inventor}
        />
        <DashBoardCard
          icon={<HomeOutlined className="text-blue-500 text-2xl" />}
          title="Phòng"
          value={stats.revenue}
        />
        <DashBoardCard
          icon={<UserOutlined className="text-red-500 text-2xl" />}
          title="Khách Hàng"
          value={stats.customer}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <RecentOrder />
        <DashBoardChart />
      </div>
    </div>
  );
};

const DashBoardCard = ({ title, value, icon }) => (
  <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center">
      <div className="mr-2 rounded-full bg-gray-100">{icon}</div>
      <Statistic title={title} value={value} />
    </div>
  </Card>
);

const RecentOrder = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.apiGetAllUser();
        const roomData = await Promise.all(
          res.data.users.flatMap(user =>
            user.order
              .filter(order => order.statusOrder === "3")
              .map(async order => {
                const roomInfo = await api.apiGetInfoRoom({ idRoom: order.idRoom });
                const daysBooked = dayjs(order.dateInput[1], "DD/MM/YYYY").diff(
                  dayjs(order.dateInput[0], "DD/MM/YYYY"),
                  "day");
                return {
                  key: order.idRoom,
                  roomName: roomInfo.data[0].nameRoom,
                  giaRoom: roomInfo.data[0].giaRoom,
                  daysBooked: daysBooked,
                  totalRevenue: parseFloat(order.totalMoney),
                };
              })
          )
        );

        const aggregatedData = Object.values(roomData.reduce((acc, room) => {
          if (!acc[room.key]) {
            acc[room.key] = { ...room, count: 1 };
          } else {
            acc[room.key].daysBooked += room.daysBooked;
            acc[room.key].totalRevenue += room.totalRevenue;
            acc[room.key].count += 1;
          }
          return acc;
        }, {}));

        setDataSource(aggregatedData);
      } catch (error) {
        console.error("Error fetching recent order data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      key: "giaRoom",
      align: "center",
      render: (text) => `${text.toLocaleString()} VND`,
    },
    {
      title: "Tổng doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      align: "right",
      render: (text) => `${text.toLocaleString()} VND`,
    },
  ];

  return (
    <Card title="Danh Thu Các Phòng" className="shadow-md">
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={false}
        scroll={{ y: 300 }}
        className="overflow-x-auto"
      />
    </Card>
  );
};

const DashBoardChart = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState({});
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await api.apiGetAllUser();
        const orders = result.data.users.flatMap(user => user.order);
        const completedOrders = orders.filter(order => order.statusOrder === "3");

        const months = Array.from({ length: 12 }, (_, i) =>
          new Date(0, i).toLocaleString("vi-VN", { month: "short" }));

        const initialRevenueByMonth = months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {});

        completedOrders.forEach(order => {
          const [day, month, orderYear] = order.dateInput[order.dateInput.length - 1].split("/");
          if (parseInt(orderYear) === year) {
            const monthName = new Date(year, parseInt(month) - 1).toLocaleString("vi-VN", { month: "short" });
            initialRevenueByMonth[monthName] += parseFloat(order.totalMoney);
          }
        });

        setMonthlyRevenue(initialRevenueByMonth);
      } catch (error) {
        console.error("Error fetching order data for chart:", error);
      }
    };

    fetchOrders();
  }, [year]);

  const data = {
    labels: Object.keys(monthlyRevenue),
    datasets: [{
      label: 'Doanh thu',
      data: Object.values(monthlyRevenue),
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgb(255, 99, 132)',
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Biểu đồ doanh thu theo tháng',
      },
    },
  };

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span>Biểu Đồ Doanh Thu Trong Năm</span>
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{ width: 100 }}
          />
        </div>
      }
      className="shadow-md"
    >
      <Bar options={options} data={data} />
    </Card>
  );
};

export default DashBoard;
