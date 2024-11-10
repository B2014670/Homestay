import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Form, Card, Typography, Descriptions, Rate, Button, DatePicker, message, Tag, Divider, Image, Radio, Space, Checkbox } from 'antd';
import { UserOutlined, EnvironmentOutlined, DollarOutlined, LoginOutlined, CoffeeOutlined } from '@ant-design/icons';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { PayPalButtons } from "@paypal/react-paypal-js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import CommentViewer from '../components/CommentViewer';
import BreakfastBooking from '../components/BreakfastBooking';
import useAuthStore from '../stores/authStore';
import { apiGetRoomWithSector, apiPostOrderRoom, apiGetUserWishlist, apiCreateWishlist, apiDeleteWishlist, apiGetAllComment } from '../services';
import { path } from '../utils/constant';

dayjs.extend(customParseFormat);
const dateFormat = "DD/MM/YYYY";

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const DetailRoom = () => {
  const { id } = useParams();
  const { isLoggedIn, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [homestayData, setHomestayData] = useState(null);
  const [comments, setComments] = useState([]);
  const [disabledDateData, setDisabledDateData] = useState([]);
  const [pay, setPay] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isBreakfastIncluded, setIsBreakfastIncluded] = useState(false);

  const [formData, setFormData] = useState({
    idUser: user ? user._id : null,
    userInput: user ? user.name : '',
    phoneInput: user ? user.phone : '',
    idRoom: id,
    dateInput: [],
    totalMoney: totalAmount,
    pay: pay,
    paymentMethod: paymentMethod,
    transactionId: null,
    deposit: deposit,
    statusOrder: 1,
    extraServices:[]
  });

  useEffect(() => {
    if (id) {
      fetchRoom();
      fetchComment();
    }
  }, [id]);

  useEffect(() => {
    if (user?._id) {
      fetchUserWishlist(user._id);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        idUser: user._id,
        userInput: user.name,
        phoneInput: user.phone,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (homestayData?.ordersRoom) {
      const newDisabledDateData = [];
      homestayData.ordersRoom.forEach(order => {
        if (Array.isArray(order) && order.length === 2) {
          const [start, end] = order;
          const datesInRange = getDatesBetween(start, end);
          newDisabledDateData.push(...datesInRange);
        }
      });
      setDisabledDateData(newDisabledDateData);
    }
  }, [homestayData]);

  const fetchRoom = async () => {
    try {
      const response = await apiGetRoomWithSector({ idRoom: id });
      if (response?.data) {
        setHomestayData(response.data);
      } else {
        console.error('No data returned from API');
      }
    } catch (error) {
      console.error('Error fetching room:', error);
    }
  };

  const fetchComment = async () => {
    try {
      const response = await apiGetAllComment(id);
      if (response?.data) {
        setComments(response.data.data);
      } else {
        console.error('Không có dữ liệu nào được trả về từ API');
      }
    } catch (error) {
      console.error('Error fetching comment:', error);
    }
  };

  const fetchUserWishlist = async (userId) => {
    try {
      const response = await apiGetUserWishlist(userId);
      const wishlist = response.data.data || [];
      const isInWishlist = wishlist.some(item => item.roomId === id);
      setIsWishlisted(isInWishlist);  // Check if the current room is in the wishlist
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const handleDateChange = (dates) => {
    if (!Array.isArray(dates) || dates.length !== 2) {
      resetDateSelection();
      return;
    }

    const dateArray = getDatesBetween(dates[0], dates[1]);
    const isOverlap = dateArray.some((date) => disabledDateData.includes(date));
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

  const resetDateSelection = () => {
    setSelectedDateRange([]);
    setTotalAmount(0);
    setFormData(prev => ({ ...prev, dateInput: [], totalMoney: 0 }));
  };

  const getDatesBetween = (start, end) => {
    const dates = [];
    let currentDate = dayjs(start, dateFormat);
    const endDate = dayjs(end, dateFormat);

    while (currentDate <= endDate) {
      dates.push(currentDate.format(dateFormat));
      currentDate = currentDate.add(1, 'day');
    }
    return dates;
  };

  const disabledDate = (current) => {
    const formattedDisabledDays = disabledDateData.map((day) => dayjs(day, dateFormat));
    return current < dayjs().startOf("day") || formattedDisabledDays.some((disabledDay) => current.isSame(disabledDay, "day"));
  };

  const handlePaymentMethodChange = (e) => {
    const selectedMethod = e.target.value;
    let updatedDeposit = 0;
    let updatedPay = true;

    if (selectedMethod === "paypal deposit") {
      updatedDeposit = formData.totalMoney * 0.5; // Calculate a 50% deposit
    } else if (selectedMethod === 'at counter') {
      updatedPay = false;
    }

    setPaymentMethod(selectedMethod);
    setDeposit(updatedDeposit);
    setPay(updatedPay);
    setFormData({
      ...formData,
      paymentMethod: selectedMethod,
      deposit: updatedDeposit,
      pay: updatedPay,
    });
  };

  const handleBooking = async (transactionId = null) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      transactionId: transactionId || prevFormData.transactionId,
    }));

    const dataInput = {
      infoOrder: {
        ...formData,
        transactionId: transactionId || formData.transactionId,
      },
    };
    console.log(dataInput.infoOrder);
    const response = await apiPostOrderRoom(dataInput);
    if (response.status === 200)
      swal("Thành Công !", " Đặt phòng thành công !", "success").then((value) => {
        fetchRoom();
      });
  };

  const handleWishlistToggle = async () => {
    if (!isLoggedIn) {
      message.error('Please log in to add to wishlist');
      return;
    }

    if (isWishlisted) {
      // Remove room from wishlist
      try {
        await apiDeleteWishlist({ roomId: id, userId: user._id });
        setIsWishlisted(!isWishlisted);
        message.success('Đã xóa khỏi danh sách yêu thích');
      } catch (error) {
        message.error('Lỗi xóa khỏi danh sách yêu thích');
      }
    } else {
      // Add room to wishlist
      try {
        await apiCreateWishlist({ roomId: id, userId: user._id });
        setIsWishlisted(!isWishlisted);
        message.success('Đã thêm vào danh sách yêu thích');
      } catch (error) {
        message.error('Lỗi thêm vào danh sách yêu thích');
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <Card className="shadow-lg rounded-lg overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Section - Room Details */}
          <div className="lg:w-3/4 lg:pr-8 relative">
            {homestayData ? (
              <>
                <Title level={2} className="mb-4 text-2xl font-semibold text-gray-900">
                  {homestayData.nameRoom}
                </Title>
                {isLoggedIn ? (
                  <Button
                    type="default"
                    shape="circle"
                    icon={isWishlisted ? <FaHeart style={{ color: 'red' }} /> : <FaRegHeart />}
                    size="large"
                    onClick={handleWishlistToggle}
                    className="absolute top-2 right-2 bg-transparent hover:bg-gray-100 text-gray-700 hover:text-red-500 border border-gray-300 hover:border-red-500 rounded-full p-2 transition-all duration-300"
                  />
                ) : null}

                <div className="px-4">
                  <Image.PreviewGroup>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {/* Main large image on the left */}
                      <div className="md:col-span-2">
                        <Image
                          src={homestayData.imgRoom[0].secure_url}
                          alt="Main Room"
                          height={300}
                          className="w-full object-fill rounded-lg"
                        />
                      </div>

                      {/* Right column with up to three smaller images */}
                      <div className="grid grid-rows-2 gap-1">
                        {homestayData.imgRoom.slice(1, 3).map((img, index) => (
                          <div className="relative" key={index}>
                            <Image
                              src={img.secure_url}
                              alt={`Room ${index + 2}`}
                              height={146}
                              className="w-full object-cover rounded-lg"
                            />
                            {/* Hiển thị số lượng ảnh bị ẩn nếu là ảnh cuối */}
                            {index === 1 && homestayData.imgRoom.length > 3 && (
                              <div className="absolute bottom-2 right-2 flex items-center justify-center bg-black bg-opacity-60 text-white text-lg font-semibold rounded-full px-3 py-1">
                                +{homestayData.imgRoom.length - 3} ảnh
                              </div>
                            )}
                          </div>
                        ))}
                        {homestayData.imgRoom.slice(3).map((img, index) => (
                          <Image
                            key={index}
                            src={img.secure_url}
                            alt={`Hidden Room ${index + 4}`}
                            className="hidden"
                          />
                        ))}
                      </div>
                    </div>
                  </Image.PreviewGroup>
                </div>

                <Divider />

                <Title level={4}>Chi tiết phòng</Title>
                <Descriptions
                  className="w-full"
                  bordered
                  column={{ xs: 1, sm: 1, md: 2, lg: 2 }}
                >
                  <Descriptions.Item label="Rating" span={1}>
                    <Rate disabled defaultValue={homestayData.danhgiaRoom} />
                  </Descriptions.Item>

                  <Descriptions.Item label="Loại phòng">
                    <Tag icon={<UserOutlined />} color="blue">
                      {homestayData.loaiRoom}
                    </Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Khu vực" span={1}>
                    <Tag icon={<EnvironmentOutlined />} color="orange">
                      {homestayData.sectorDetails.nameSector}
                    </Tag>
                    <h5>
                      {homestayData.sectorDetails.addressSector}, {homestayData.sectorDetails.discSector}
                    </h5>
                  </Descriptions.Item>

                  <Descriptions.Item label="Giá">
                    <Tag icon={<DollarOutlined />} color="green">
                      {homestayData.giaRoom.toLocaleString()} VND/đêm
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
                <Divider />

                <Title level={4}>Mô tả</Title>
                <Paragraph>{homestayData.discRoom}</Paragraph>
                <Divider />

                {/* Comments Section */}
                <Title level={4} className="mb-4">Bình luận</Title>
                <CommentViewer comments={comments} />
              </>
            ) : (
              <div>Loading room details...</div>
            )}
          </div>


          {/* Right Section - Booking */}
          <div className="lg:w-1/3 mx-auto lg:mt-0 bg-gray-100 rounded-lg shadow-md">
            <Card title="Đặt phòng">
              <Form layout="vertical" style={{ maxWidth: 500 }} >
                <Form.Item
                  label="Nhập ngày nhận và trả phòng :"
                  name="dateOrder"
                  rules={[{ required: true, message: 'Vui lòng nhập thông tin ngày đặt phòng !' }]}
                >
                  <RangePicker
                    disabledDate={disabledDate}
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
                        setFormData((prev) => ({
                          ...prev,
                          extraServices: [bookingData]
                        }));
                        setTotalAmount((prev) => prev + bookingData.totalServiceCost);
                      }}
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

                <Radio.Group onChange={handlePaymentMethodChange} value={paymentMethod} className='mb-4'>
                  <Space direction="vertical">
                    <Radio value={'paypal'}>Thanh toán qua tài khoản ngân hàng.</Radio>
                    <Radio value={'paypal deposit'}>Đặt cọc.</Radio>
                    <Radio value={'at counter'}>Nhận phòng và thanh toán tại quầy.</Radio>
                  </Space>
                </Radio.Group>

                {isLoggedIn ? (
                  paymentMethod == 'at counter' ? (
                    <Button
                      disabled={totalAmount <= 0}
                      className={`text-xl py-5 font-bold bg-[#0070BA] text-white transition duration-300 ${totalAmount <= 0 ? 'opacity-50' : 'opacity-100'}`}
                      type="submit"
                      block
                      onClick={() => handleBooking()}
                    >
                      Đặt phòng
                    </Button>
                  ) : (
                    <PayPalButtons
                      style={{ layout: 'horizontal', label: 'paypal', color: 'blue', tagline: false }}
                      disabled={totalAmount <= 0}
                      forceReRender={[deposit, totalAmount]}
                      fundingSource={undefined}
                      createOrder={(data, actions) => {
                        const amountToCharge = paymentMethod === 'paypal deposit' ? deposit : totalAmount;
                        return actions.order.create({
                          purchase_units: [
                            {
                              amount: {
                                value: (amountToCharge / 24000).toFixed(2),
                              },
                            },
                          ],
                        })
                      }}
                      onApprove={(data, actions) => {
                        return actions.order.capture().then(async (details) => {
                          await handleBooking(details.id);// This is the transaction ID (orderId)
                        });
                      }}
                    />
                  )

                ) : (
                  <Button
                    type="primary"
                    icon={<LoginOutlined />}
                    onClick={() => navigate(`/${path.LOGIN}`, { state: { from: location } })}
                    block
                  >Đăng nhập để đặt phòng
                  </Button>
                )}
              </Form>
            </Card>
          </div>
        </div>
      </Card >
    </div >
  );
};

export default DetailRoom;

