import React, { useState, useMemo, useEffect } from "react";
import { DatePicker, Card, Button, Input, Pagination, Modal, Form, InputNumber, theme, Checkbox, Radio, Space, message } from "antd";
import { CalendarOutlined, CoffeeOutlined } from "@ant-design/icons";
import BreakfastBooking from "./BreakfastBooking";
import { apiPostOrderRoom} from "../api";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";
import swal from "sweetalert";

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
const dateFormat = "DD/MM/YYYY";
const { RangePicker } = DatePicker;

const RoomManagement = ({ data, serviceData, getRooms }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [homestayData, setHomestayData] = useState(null);
  const [disabledDateData, setDisabledDateData] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('at counter');
  const [isBreakfastIncluded, setIsBreakfastIncluded] = useState(false);

  const initialFormData = {
    idUser: "675712db20560b7d05e19276",
    userInput: "",
    phoneInput: "",
    idRoom: "",
    dateInput: [],
    totalMoney: 0,
    pay: false,
    paymentMethod: "at counter",
    transactionId: null,
    deposit: 0,
    statusOrder: 1,
    extraServices: [],
  };

  const [formData, setFormData] = useState(initialFormData);

  const { token } = theme.useToken();

  const roomsPerPage = 12; // 4 cột x 3 hàng
  const filteredRooms = useMemo(() => {
    return data.filter((room) =>
      room.nameRoom.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  const handleCloseModal = () => {
    getRooms();
    setIsModalOpen(false);
  };

  const paginatedRooms = useMemo(() => {
    return filteredRooms.slice(
      (currentPage - 1) * roomsPerPage,
      currentPage * roomsPerPage
    );
  }, [filteredRooms, currentPage]);

  const checkRoomStatus = (orderDetails) => {
    const today = dayjs();
    return orderDetails.some(
      ({ statusOrder, dateInput }) =>
        ["1", "2"].includes(statusOrder) &&
        today.isBetween(dayjs(dateInput[0], "DD/MM/YYYY"), dayjs(dateInput[1], "DD/MM/YYYY"), null, "[]")
    );
  };

  const findNextOrder = (orderDetails) => {
    const today = dayjs();
    const filteredOrders = orderDetails
      .filter(({ statusOrder }) => ["1", "2"].includes(statusOrder))
      .sort((a, b) =>
        dayjs(a.dateInput[0], "DD/MM/YYYY").diff(dayjs(b.dateInput[0], "DD/MM/YYYY"))
      );

    return filteredOrders.find(({ dateInput }) =>
      dayjs(dateInput[0], "DD/MM/YYYY").isAfter(today)
    );
  };

  // Các hàm sử lý đặt
  const disabledDate = (current) => {
    return current < dayjs().startOf("day")
  };

  // Chuyển đổi mảng ngày đã đặt thành định dạng ngày phù hợp với Ant Design
  const formatBookedDates = disabledDateData.map(date => date.replace(/\//g, '-'));

  const style = {
    border: `1px solid ${token.colorPrimary}`,
    borderRadius: '50%',
    backgroundColor: 'lightblue',
    color: 'white',
  };
  // Hàm render ô ngày
  const cellRender = (current, info) => {
    if (info.type !== 'date') {
      return info.originNode;
    }
    const isBooked = formatBookedDates.includes(current.format('DD-MM-YYYY'));

    // Nếu là ngày đã đặt, tô màu
    if (isBooked) {
      return (
        <div className="ant-picker-cell-inner" style={style}>
          {current.date()}
        </div>
      );
    }

    return (
      <div className="ant-picker-cell-inner">
        {current.date()}
      </div>
    );
  };

  const resetDateSelection = () => {
    setSelectedDateRange([]);
    setTotalAmount(0);
    setFormData(prev => ({ ...prev, dateInput: [], totalMoney: 0 }));
  };

  const getDatesBetweenBooking = (start, end) => {
    const dates = [];
    let currentDate = dayjs(start, dateFormat);
    const endDate = dayjs(end, dateFormat);
    while (currentDate <= endDate) {
      dates.push(currentDate.format(dateFormat));
      currentDate = currentDate.add(1, 'day');
    }
    return dates;
  };

  const getDatesBetweenInput = (start, end) => {
    const dates = [];
    let currentDate = dayjs(start, dateFormat);
    const endDate = dayjs(end, dateFormat);

    // Kiểm tra xem start và end có liền kề hay không
    const isAdjacent = currentDate.add(1, 'day').isSame(endDate);

    if (isAdjacent) {
      // Nếu liền kề thì lấy cả hai ngày đầu và cuối
      dates.push(currentDate.format(dateFormat));
      dates.push(endDate.format(dateFormat));
    } else {
      // Nếu không liền kề thì chỉ lấy các ngày ở giữa
      currentDate = currentDate.add(1, 'day'); // Bỏ qua ngày đầu
      while (currentDate < endDate) {
        dates.push(currentDate.format(dateFormat));
        currentDate = currentDate.add(1, 'day');
      }
    }

    return dates;
  };

  const handleDateChange = (dates) => {
    // console.log(dates);
    if (!Array.isArray(dates) || dates.length !== 2) {
      resetDateSelection();
      return;
    }

    const dateArray = getDatesBetweenInput(dates[0], dates[1]);

    // Kiểm tra xem 2 ngày có liên tiếp hay không
    const areConsecutiveDates = dates[1].isSame(dates[0].add(1, 'day'), 'day');

    // Nếu là 2 ngày liên tiếp, kiểm tra xem tất cả các ngày trong dateArray có nằm trong disabledDateData không
    const isOverlap = areConsecutiveDates
      ? dateArray.every((date) => disabledDateData.includes(date)) // Kiểm tra trùng tất cả ngày dateArray
      : dateArray.some((date) => disabledDateData.includes(date)); // Kiểm tra xem có tồn tại ngày trùng

    if (isOverlap) {
      resetDateSelection();
      swal("Thông báo !", "Vui lòng không chọn những ngày đã được đặt trước đó !", "warning");
      return;
    }

    if (homestayData) {
      setSelectedDateRange(dates);
      const nights = dates[1].diff(dates[0], 'day');
      const money = nights * homestayData.giaRoom;
      const formattedDates = dates.map(date => dayjs(date).format(dateFormat));
      setTotalAmount(money);
      setFormData(prev => ({
        ...prev,
        dateInput: formattedDates,
        totalMoney: money,
      }));
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBookRoom = (room) => {
    if (room?.ordersRoom) {
      const newDisabledDateData = [];
      room.ordersRoom.forEach(order => {
        if (Array.isArray(order) && order.length === 2) {
          const [start, end] = order;
          const datesInRange = getDatesBetweenBooking(start, end);
          newDisabledDateData.push(...datesInRange);
        }
      });
      setDisabledDateData(newDisabledDateData);
    }
    setHomestayData(room)
    setSelectedRoom(room);
    setFormData((prev) => ({
      ...prev,
      idRoom: room._id,
    }));
    setIsModalOpen(true);
  };

  const handleBooking = async (transactionId = null) => {

    const dataInput = {
      infoOrder: { ...formData },
    };

    try {
      // console.log(dataInput);
      const response = await apiPostOrderRoom(dataInput);
      if (response.status === 200) {
        swal("Thành Công !", " Đặt phòng thành công !", "success")
          .then((value) => {
            getRooms();
          });
      } else {
        message.error(response.data?.message || 'Đặt phòng thất bại');
      }
    } catch (error) {
      console.error("Lỗi khi đặt phòng:", error);
      message.error(error.response?.data?.message || 'Đặt phòng thất bại do lỗi hệ thống');
    }


  };

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <Input.Search
          placeholder="Tìm kiếm phòng..."
          allowClear
          onSearch={(value) => setSearchText(value)}
          style={{ width: 304 }}
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {paginatedRooms.map((room) => {
          const isOccupied = checkRoomStatus(room.orderDetails);
          const nextOrder = findNextOrder(room.orderDetails);
          return (
            <Card
              key={room._id}
              title={room.nameRoom}
              extra={
                <span className={`${isOccupied ? "text-red-500" : "text-green-500"} font-bold`}>
                  {isOccupied ? "Đang có khách" : "Trống"}
                </span>
              }
              className="border border-gray-200 shadow-lg"
            >
              <p>{room.giaRoom.toLocaleString()} VND ({room.loaiRoom})</p>
              <p>
                Đơn sắp đến: {nextOrder ? `${nextOrder.dateInput[0]} - ${nextOrder.dateInput[1]}` : "Không có"}
              </p>
              <div className="flex justify-between mt-4">
                <Button icon={<CalendarOutlined />} onClick={() => handleBookRoom(room)}>
                  Đặt
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end mt-5">
        <Pagination
          current={currentPage}
          pageSize={roomsPerPage}
          total={filteredRooms.length}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>

      <Modal
        title={`Đặt phòng: ${selectedRoom?.nameRoom || ""}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" style={{ maxWidth: 500 }} >
          <Form.Item
            label="Tên khách hàng"
            name="nameInput"
            rules={[{ required: true, message: "Nhập tên khách hàng!" }]}
          >
            <Input
              value={formData.nameInput}
              onChange={(e) => handleChange("userInput", e.target.value)}
              placeholder="Nhập tên khách hàng"
            />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phoneInput"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              { pattern: /^\d{10,11}$/, message: "Số điện thoại phải là 10-11 chữ số!" },
              {
                validator: (_, value) => {
                  if (!value || /^[0-9]+$/.test(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Số điện thoại chỉ được chứa số!"));
                },
              },
            ]}
          >
            <Input
              value={formData.phoneInput}
              onChange={(e) => handleChange("phoneInput", e.target.value)}
              placeholder="Nhập số điện thoại"
            />
          </Form.Item>

          <Form.Item
            label="Nhập ngày nhận và trả phòng :"
            name="dateOrder"
            rules={[{ required: true, message: 'Vui lòng nhập thông tin ngày đặt phòng !' }]}
          >
            <RangePicker
              disabledDate={disabledDate}
              cellRender={cellRender}
              value={selectedDateRange}
              placeholder={['Ngày Đi', 'Ngày Về']}
              format={dateFormat}
              onChange={handleDateChange}
              className="w-full"
            />
          </Form.Item>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Giá phòng/đêm:</span>
              <span className="font-medium text-lg">{homestayData?.giaRoom.toLocaleString()} VND</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Số đêm:</span>
              <span className="font-medium">x{selectedDateRange.length === 2 ? selectedDateRange[1].diff(selectedDateRange[0], 'day') : 0}</span>
            </div>

            <Form.Item
              label="Dịch vụ đi kèm:"
              name="isBreakfast"
              valuePropName="checked"
              initialValue={isBreakfastIncluded}
            >
              <Checkbox
                checked={isBreakfastIncluded}
                onChange={() => {
                  setIsBreakfastIncluded(!isBreakfastIncluded);
                }}
              >
                <CoffeeOutlined className="mr-2 font-semibold" /> Đặt Bữa Sáng
              </Checkbox>
            </Form.Item>

            {isBreakfastIncluded && (
              <BreakfastBooking
                onBookingChange={(bookingData) => {
                  const priceRoom = selectedDateRange[1].diff(selectedDateRange[0], 'day') * homestayData?.giaRoom;
                  setTotalAmount(priceRoom + bookingData.totalServiceCost);
                  setFormData((prev) => ({
                    ...prev,
                    totalMoney: priceRoom + bookingData.totalServiceCost,
                    extraServices: [bookingData]
                  }));
                }}
                serviceData={serviceData}
                loaiRoom={homestayData?.loaiRoom}
                selectedDateRange={selectedDateRange}
              />
            )}

            <div className="flex justify-between">
              <span className="text-gray-600">Tổng tiền:</span>
              <span className="font-medium text-xl">{totalAmount.toLocaleString()} VND</span>
            </div>

            {paymentMethod === 'paypal deposit' && (
              <div className="flex justify-between">
                <span className="text-gray-600">Đặt cọc:</span>
                <span className="font-medium text-xl"> {(totalAmount * 0.5).toLocaleString()} VND</span>
              </div>
            )}
          </div>

          {/* <Radio.Group onChange={handlePaymentMethodChange} value={paymentMethod} className='mb-4'>
              <Space direction="vertical">
                <Radio value={'paypal'}>Thanh toán qua tài khoản ngân hàng.</Radio>
                <Radio value={'paypal deposit'}>Đặt cọc.</Radio>
                <Radio value={'at counter'}>Nhận phòng và thanh toán tại quầy.</Radio>
              </Space>
            </Radio.Group> */}

          {/* <Button
            disabled={totalAmount <= 0}
            className={`text-xl py-5 font-bold bg-[#0070BA] text-white transition duration-300 ${totalAmount <= 0 ? 'opacity-50' : 'opacity-100'}`}
            type="submit"
            block
            onClick={() => handleBooking()}
          >
            Đặt phòng
          </Button> */}
          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={handleCloseModal} type="default">
                Hủy
              </Button>
              <Button
                htmlType="submit"
                disabled={totalAmount <= 0}
                className={`bg-[#0070BA] text-white transition duration-300 ${totalAmount <= 0 ? 'opacity-50' : 'opacity-100'}`}
                onClick={() => handleBooking()}
              >
                Đặt phòng
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomManagement;