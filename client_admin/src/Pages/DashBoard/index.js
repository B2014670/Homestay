import React, { useEffect, useState } from 'react';
import { Card, Statistic, Table, Typography, DatePicker, ConfigProvider, Button } from 'antd';
import { Bar, Line, Pie } from 'react-chartjs-2';
import dayjs from 'dayjs';
import locale from 'antd/es/date-picker/locale/vi_VN'; // Locale DatePicker tiếng Việt
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  HomeOutlined,
  AreaChartOutlined,
  DollarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { BsCartCheck, BsCart } from "react-icons/bs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import * as api from '../../api';
dayjs.extend(customParseFormat);

ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

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
        const [sectorsData, roomsData, usersData, ordersData] = await Promise.all([
          api.apiGetAllSector(),
          api.apiGetAllRoom(),
          api.apiGetAllUser(),
          api.apiGetAllUserOrder(),
        ]);

        const orderComplete = ordersData.data.users.reduce((acc, user) =>
          acc + user.order.filter(order => order.statusOrder === "3").length, 0);

        const totalOrders = ordersData.data.users.reduce((acc, user) => acc + user.order.length, 0);

        const totalMoney = ordersData.data.users.reduce((acc, user) =>
          acc + user.order.filter(order => order.statusOrder === "3")
            .reduce((sum, order) => sum + parseFloat(order.totalMoney), 0), 0);

        setStats({
          orders: totalOrders,
          orderComplete,
          inventor: sectorsData.data.length,
          customer: usersData.data.length,
          revenue: roomsData.data.length,
          totalMoney,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="px-6 bg-gray-100 min-h-screen">
      <AntTitle level={4} className="text-2xl font-semibold mb-4">Dashboard</AntTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <DashBoardCard
          icon={<BsCart className="text-green-500 text-3xl" />}
          title="Tổng Đơn Đặt phòng"
          value={stats.orders}
        />
        <DashBoardCard
          icon={<BsCartCheck className="text-yellow-500 text-3xl" />}
          title="Đơn Hoàn Thành"
          value={stats.orderComplete}
        />
        <DashBoardCard
          icon={<DollarOutlined className="text-blue-500 text-3xl" />}
          title="Tổng Thu Nhập"
          value={`${stats.totalMoney.toLocaleString("vi-VN")} vnđ`}
        />
        <DashBoardCard
          icon={<AreaChartOutlined className="text-purple-500 text-3xl" />}
          title="Khu Vực"
          value={stats.inventor}
        />
        <DashBoardCard
          icon={<HomeOutlined className="text-blue-600 text-3xl" />}
          title="Phòng"
          value={stats.revenue}
        />
        <DashBoardCard
          icon={<UserOutlined className="text-red-500 text-3xl" />}
          title="Khách Hàng"
          value={stats.customer}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentOrder />
        <DashBoardChart />
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4">
        <DashBoardChartByMonth />
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

        // const months = Array.from({ length: 12 }, (_, i) =>
        //   new Date(0, i).toLocaleString("vi-VN", { month: "short" }));
        // Tạo danh sách tháng với định dạng T1, T2, ...
      const months = Array.from({ length: 12 }, (_, i) => `T${i + 1}`);

        const initialRevenueByMonth = months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {});

        completedOrders.forEach(order => {
          const [day, month, orderYear] = order.dateInput[order.dateInput.length - 1].split("/");
          if (parseInt(orderYear) === year) {
            // const monthName = new Date(year, parseInt(month) - 1).toLocaleString("vi-VN", { month: "short" });
            const monthIndex = parseInt(month) - 1; // Lấy index tháng (0-11)
            const monthName = `T${monthIndex + 1}`;
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
      label: 'Doanh thu (VNĐ)',
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
      className="border border-gray-600"
      title={
        <div className="flex justify-between items-center">
          <span>Biểu Đồ Doanh Thu Trong Năm</span>
          <DatePicker
            value={year ? dayjs(`${year}-01-01`, 'YYYY-MM-DD') : null}
            onChange={(date, dateString) => setYear(Number(dateString))}
            picker="year"
            style={{ width: 120 }}
          />
        </div>
      }
    >
      <Bar options={options} data={data} />
    </Card>
  );
};

// const DashBoardChartByMonth = () => {
//   const [dailyRevenue, setDailyRevenue] = useState({});
//   const [dailyOrderCount, setDailyOrderCount] = useState({}); // Số đơn hàng mỗi ngày
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [chartType, setChartType] = useState("bar"); // Quản lý loại biểu đồ

//   const handleMonthChange = (date) => {
//     setSelectedDate(date); // Cập nhật tháng được chọn
//   };

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const result = await api.apiGetAllUser();
//         const orders = result.data.users.flatMap((user) => user.order);
//         const completedOrders = orders.filter((order) => order.statusOrder === "3");

//         const year = selectedDate.year();
//         const month = selectedDate.month(); // Lấy tháng (0-11)

//         // Khởi tạo doanh thu theo ngày trong tháng
//         const daysInMonth = dayjs(selectedDate).daysInMonth();
//         const initialData  = Array.from({ length: daysInMonth }, (_, i) => ({
//           day: i + 1,
//           revenue: 0,
//         }));

//         // Tính doanh thu theo từng ngày
//         completedOrders.forEach((order) => {
//           const [day, orderMonth, orderYear] = order.dateInput[order.dateInput.length - 1].split("/");
//           if (parseInt(orderYear, 10) === year && parseInt(orderMonth, 10) === month + 1) {
//             const dayIndex = parseInt(day, 10) - 1;
//             initialData[dayIndex].revenue += parseFloat(order.totalMoney);
//             initialData[dayIndex].orderCount += 1; // Cộng thêm số đơn hàng
//           }
//         });

//         // Chuyển dữ liệu thành đối tượng
//         const revenueData = initialData.reduce(
//           (acc, { day, revenue }) => ({ ...acc, [day]: revenue }),
//           {}
//         );
//         const orderCountData = initialData.reduce(
//           (acc, { day, orderCount }) => ({ ...acc, [day]: orderCount }),
//           {}
//         );

//         setDailyRevenue(revenueData);
//         setDailyOrderCount(orderCountData);
//       } catch (error) {
//         console.error("Error fetching order data for chart:", error);
//       }
//     };

//     fetchOrders();
//   }, [selectedDate]);

//   let filteredRevenue = Object.entries(dailyRevenue);
//   let filteredOrderCount = Object.entries(dailyOrderCount);

//   // If chart type is "pie", filter out days with no revenue
//   if (chartType === "pie") {
//     filteredRevenue = filteredRevenue.filter(([day, revenue]) => revenue > 0);
//   }

//   // Dữ liệu cho biểu đồ
//   const data = {
//     labels: filteredRevenue.map(([day, revenue]) => {
//       // Định dạng lại ngày
//       return `Ngày ${day}`;
//     }),
//     datasets: [
//       {
//         label: "Doanh thu (VNĐ)",
//         data: Object.values(dailyRevenue), // Doanh thu theo ngày
//         backgroundColor: chartType === "pie" ? [
//           "rgba(255, 99, 132, 0.5)",
//           "rgba(54, 162, 235, 0.5)",
//           "rgba(255, 206, 86, 0.5)",
//           "rgba(75, 192, 192, 0.5)",
//           "rgba(153, 102, 255, 0.5)",
//         ] : "rgba(54, 162, 235, 0.5)",
//         borderColor: chartType === "pie" ? [
//           "rgba(255, 99, 132, 1)",
//           "rgba(54, 162, 235, 1)",
//           "rgba(255, 206, 86, 1)",
//           "rgba(75, 192, 192, 1)",
//           "rgba(153, 102, 255, 1)",
//         ] : "rgba(54, 162, 235, 1)",
//         borderWidth: 1,
//       },
//     ],
//   };

//   // Tùy chọn biểu đồ
//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: "top",
//       },
//       title: {
//         display: true,
//         text: `Biểu đồ doanh thu theo ngày trong tháng ${selectedDate ? selectedDate.format("MM/YYYY") : "Không xác định"
//           }`,
//       },
//     },
//     // Tùy chọn riêng cho pie chart
//     maintainAspectRatio: chartType === "pie" ? false : true, // Allow to scale freely
//     aspectRatio: chartType === "pie" ? 1 : undefined, // Specific aspect ratio for pie chart
//   };
//   const pieChartStyle = chartType === "pie" ? { height: "400px", width: "400px" } : {}; // Adjust 50% size for Pie chart

//   return (
//     <ConfigProvider locale={locale}>
//       <Card
//         className="border border-gray-600 mb-2"
//         title={
//           <div className="flex justify-between items-center">
//             <span>Biểu Đồ Doanh Thu Theo Tháng</span>
//             {/* Nút chuyển đổi biểu đồ */}
//             <div className="flex gap-x-4">
//               <Button
//                 type={chartType === "bar" ? "primary" : "default"}
//                 className={`rounded-lg font-semibold ${chartType === "bar" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
//                 onClick={() => setChartType("bar")}
//               >
//                 Biểu đồ cột
//               </Button>
//               <Button
//                 type={chartType === "line" ? "primary" : "default"}
//                 className={`rounded-lg font-semibold ${chartType === "line" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
//                 onClick={() => setChartType("line")}
//               >
//                 Biểu đồ đường
//               </Button>
//               {/* <Button
//                 type={chartType === "pie" ? "primary" : "default"}
//                 className={`rounded-lg font-semibold ${chartType === "pie" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
//                 onClick={() => setChartType("pie")}
//               >
//                 Biểu đồ tròn
//               </Button> */}
//             </div>
//             <DatePicker
//               value={selectedDate}
//               onChange={handleMonthChange}
//               picker="month"
//               style={{ width: 150 }}
//               format={(date) => (date ? `Tháng ${date.format("M")}/${date.format("YYYY")}` : "")}
//             />
//           </div>
//         }
//       >
//         {/* Hiển thị biểu đồ dựa trên loại */}
//         {chartType === "bar" && <Bar options={options} data={data} />}
//         {chartType === "line" && <Line options={options} data={data} />}
//         {/* {chartType === "pie" && <Pie data={data} options={options} style={pieChartStyle} />} */}
//       </Card>
//     </ConfigProvider>
//   );
// };
const DashBoardChartByMonth = () => {
  const [dailyRevenue, setDailyRevenue] = useState({});
  const [dailyOrderCount, setDailyOrderCount] = useState({}); // Số đơn hàng mỗi ngày
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [chartType, setChartType] = useState("bar");

  const handleMonthChange = (date) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await api.apiGetAllUser();
        const orders = result.data.users.flatMap((user) => user.order);
        const completedOrders = orders.filter((order) => order.statusOrder === "3");

        const year = selectedDate.year();
        const month = selectedDate.month(); // Lấy tháng (0-11)

        const daysInMonth = dayjs(selectedDate).daysInMonth();
        const initialData = Array.from({ length: daysInMonth }, (_, i) => ({
          day: i + 1,
          revenue: 0,
          orderCount: 0,
        }));

        completedOrders.forEach((order) => {
          const [day, orderMonth, orderYear] = order.dateInput[order.dateInput.length - 1].split("/");
          if (parseInt(orderYear, 10) === year && parseInt(orderMonth, 10) === month + 1) {
            const dayIndex = parseInt(day, 10) - 1;
            initialData[dayIndex].revenue += parseFloat(order.totalMoney);
            initialData[dayIndex].orderCount += 1; // Cộng thêm số đơn hàng
          }
        });

        const revenueData = initialData.reduce(
          (acc, { day, revenue }) => ({ ...acc, [day]: revenue }),
          {}
        );
        const orderCountData = initialData.reduce(
          (acc, { day, orderCount }) => ({ ...acc, [day]: orderCount }),
          {}
        );

        setDailyRevenue(revenueData);
        setDailyOrderCount(orderCountData);
      } catch (error) {
        console.error("Error fetching order data for chart:", error);
      }
    };

    fetchOrders();
  }, [selectedDate]);

  const filteredRevenue = Object.entries(dailyRevenue);
  const filteredOrderCount = Object.entries(dailyOrderCount);

  const data = {
    labels: filteredRevenue.map(([day]) => `Ngày ${day}`),
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data: Object.values(dailyRevenue),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Số đơn hàng",
        data: Object.values(dailyOrderCount),
        backgroundColor: "rgba(255, 206, 86, 0.5)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Biểu đồ doanh thu và số đơn hàng trong tháng ${selectedDate.format("MM/YYYY")}`,
      },
    },
    maintainAspectRatio: true,
  };

  return (
    <ConfigProvider locale={locale}>
      <Card
        className="border border-gray-600 mb-2"
        title={
          <div className="flex justify-between items-center">
            <span>Biểu Đồ Doanh Thu Theo Tháng</span>
            <div className="flex gap-x-4">
              <Button
                type={chartType === "bar" ? "primary" : "default"}
                className={`rounded-lg ${chartType === "bar" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                onClick={() => setChartType("bar")}
              >
                Biểu đồ cột
              </Button>
              <Button
                type={chartType === "line" ? "primary" : "default"}
                className={`rounded-lg ${chartType === "line" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                onClick={() => setChartType("line")}
              >
                Biểu đồ đường
              </Button>
            </div>
            <DatePicker
              value={selectedDate}
              onChange={handleMonthChange}
              picker="month"
              style={{ width: 150 }}
              format={(date) => (date ? `Tháng ${date.format("M")}/${date.format("YYYY")}` : "")}
            />
          </div>
        }
      >
        {chartType === "bar" && <Bar options={options} data={data} />}
        {chartType === "line" && <Line options={options} data={data} />}
      </Card>
    </ConfigProvider>
  );
};

export default DashBoard;
