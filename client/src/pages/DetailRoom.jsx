import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Form, Card, Carousel, Typography, Descriptions, Rate, Button, DatePicker, message, Tag, Divider, Image, Radio, Space } from 'antd';
import { UserOutlined, EnvironmentOutlined, DollarOutlined, LoginOutlined } from '@ant-design/icons';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { PayPalButtons } from "@paypal/react-paypal-js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import CommentList from '../components/CommentList';
import Editor from '../components/Editor';
import useAuthStore from '../stores/authStore';
import { apiGetRoomWithSector, apiPostOrderRoom, apiGetUserWishlist, apiCreateWishlist, apiDeleteWishlist } from '../services';
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
  const [disabledDateData, setDisabledDateData] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const [comments, setComments] = useState([]);
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [formData, setFormData] = useState({
    idUser: user ? user._id : null,
    userInput: user ? user.name : '',
    phoneInput: user ? user.phone : '',
    idRoom: id,
    dateInput: [],
    totalMoney: totalAmount,
    pay: paymentMethod,
    statusOrder: 1,
  });

  useEffect(() => {
    if (id) {
      fetchRoom();
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
      swal("Thông báo !", "Vui lòng không chọn những ngày đã vô hiệu hóa trước đó !", "warning");
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
    setPaymentMethod(e.target.value);
    setFormData({ ...formData, pay: e.target.value });
  };

  const handleBooking = async () => {
    const datainput = {
      // Room: location.state.detailData,
      infoOrder: formData,
    };
    console.log(formData);
    // const response = await apiPostOrderRoom(datainput);
    // if (response.status === 200)
    //   swal("Thành Công !", " Đặt phòng thành công !", "success").then((value) => {
    //     window.location.reload();
    //   });
  };

  const handleCommentChange = (e) => setValue(e.target.value);

  const handleCommentSubmit = () => {
    if (!value) {
      message.error('Please enter a comment');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const newComment = {
        author: 'User',
        content: value,
        datetime: new Date().toLocaleString(),
      };
      setComments([...comments, newComment]);
      setValue('');
      setSubmitting(false);
      message.success('Comment added successfully!');
    }, 1000);
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
        setIsWishlisted(false);
        message.success('Đã xóa khỏi danh sách yêu thích');
      } catch (error) {
        message.error('Lỗi xóa khỏi danh sách yêu thích');
      }
    } else {
      // Add room to wishlist
      try {
        await apiCreateWishlist({ roomId: id, userId: user._id });
        setIsWishlisted(true);
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
          <div className="lg:w-2/3 lg:pr-8 relative">
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

                <Descriptions
                  className="w-full px-4 md:px-6 lg:px-8"
                  title="Room Details"
                  bordered
                  column={{ xs: 1, sm: 1, md: 2, lg: 2 }}
                >
                  <Descriptions.Item label="Rating" span={2}>
                    <Rate disabled defaultValue={homestayData.danhgiaRoom} />
                  </Descriptions.Item>

                  <Descriptions.Item label="Loại phòng">
                    <Tag icon={<UserOutlined />} color="blue">
                      {homestayData.loaiRoom}
                    </Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Khu vực" span={2}>
                    <Tag icon={<EnvironmentOutlined />} color="orange">
                      {homestayData.sectorDetails.nameSector}
                    </Tag>
                    <span>
                      {homestayData.sectorDetails.addressSector}, {homestayData.sectorDetails.discSector}
                    </span>
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
                <div className="comment-section">
                  {comments.length > 0 && <CommentList comments={comments} />}
                  <Editor
                    onSubmit={handleCommentSubmit}
                    submitting={submitting}
                    value={value}
                    onChange={handleCommentChange}
                  />
                </div>
              </>
            ) : (
              <div>Loading room details...</div>
            )}
          </div>


          {/* Right Section - Booking */}
          <div className="mt-8 md:mt-0 md:w-1/3 pl-0 md:pl-8 border-l">
            <Card title="Đặt phòng" className="sticky top-8">
              <Form layout="vertical" style={{ maxWidth: 500 }} onFinish={handleBooking}>
                <Form.Item
                  label="Nhập ngày nhận và trả phòng :"
                  name="dateOrder"
                  rules={[{ required: true, message: 'Vui lòng nhập thông tin ngày đặt phòng !' }]}
                >
                  <RangePicker
                    disabledDate={disabledDate}
                    placeholder={['Ngày Đi', 'Ngày Về']}
                    format={dateFormat}
                    onChange={handleDateChange}
                    className="w-full"
                  />
                </Form.Item>
                <Descriptions column={1} className="mb-4">
                  <Descriptions.Item label="Số đêm">
                    {selectedDateRange.length === 2 ? selectedDateRange[1].diff(selectedDateRange[0], 'day') : 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá phòng/đêm">
                    {homestayData?.giaRoom.toLocaleString()} VND
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng tiền">
                    {totalAmount.toLocaleString()} VND
                  </Descriptions.Item>
                </Descriptions>

                <Radio.Group onChange={handlePaymentMethodChange} value={paymentMethod}>
                  <Space direction="vertical">
                    <Radio value={'paypal'}>Thanh toán qua tài khoản ngân hàng.</Radio>
                    <Radio value={'cod'}>
                      Nhận phòng và thanh toán tại quầy.
                    </Radio>
                  </Space>
                </Radio.Group>
                {isLoggedIn ? (
                  paymentMethod == 'paypal' ? (
                    <PayPalButtons
                      style={{ layout: 'horizontal', label: 'paypal', color: 'blue', tagline: false }}
                      disabled={totalAmount <= 0}
                      forceReRender={[totalAmount]}
                      fundingSource={undefined}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [
                            {
                              amount: {
                                value: (totalAmount / 24000).toFixed(2),
                              },
                            },
                          ],
                        })
                      }}
                      onApprove={(data, actions) => {
                        return actions.order.capture().then(async (details) => {
                          const transactionId = details.id; // PayPal transaction ID
                          console.log("Transaction completed. ID:", transactionId);
                          handleBooking();
                        });
                      }}
                    />
                  ) : (
                    <Button
                      disabled={totalAmount <= 0}
                      className={`text-xl py-5 font-bold bg-[#0070BA] text-white transition duration-300 ${totalAmount <= 0 ? 'opacity-50' : 'opacity-100'}`}
                      type="submit"
                      block
                      onClick={handleBooking}
                    >
                      Đặt phòng
                    </Button>
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

