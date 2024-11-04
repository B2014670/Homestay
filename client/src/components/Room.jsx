import React, { useState, useEffect } from 'react';
import { Card, Typography, Descriptions, Rate, Button, DatePicker, message, Tag, Divider, Form, Input, List, Avatar, Image } from 'antd';
import { UserOutlined, EnvironmentOutlined, DollarOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const dateFormat = "DD/MM/YYYY";

const RoomDetail = ({ roomId }) => {
    const [homestayData, setHomestayData] = useState(null);
    const [disabledDateData, setDisabledDateData] = useState([]);
    const [selectedDateRange, setSelectedDateRange] = useState([]);
    const [comments, setComments] = useState([]);
    const [commentValue, setCommentValue] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        const fetchRoom = async () => {
            // Simulated API call
            const response = {
                data: {
                    _id: "room123",
                    nameRoom: "Phòng Deluxe Hướng Biển",
                    imgRoom: [
                        { secure_url: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80" },
                        { secure_url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80" },
                        { secure_url: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80" },
                        { secure_url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80" },
                        { secure_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80" }
                    ],
                    danhgiaRoom: 4.8,
                    loaiRoom: "2-3 người",
                    giaRoom: 2500000,
                    sectorDetails: {
                        nameSector: "Bãi biển Mỹ Khê",
                        addressSector: "Đà Nẵng",
                        discSector: "Gần trung tâm thành phố, 5 phút đi bộ ra biển"
                    },
                    discRoom: "Phòng suite sang trọng với view biển tuyệt đẹp, thiết kế hiện đại và đầy đủ tiện nghi cao cấp.",
                    ordersRoom: [
                        ["11/08/2024", "12/08/2024"],
                        ["14/08/2024", "15/08/2024"],
                        ["31/08/2024", "01/09/2024"]
                    ]
                }
            };
            setHomestayData(response.data);
        };

        if (roomId) {
            fetchRoom();
        }
    }, [roomId]);

    useEffect(() => {
        if (homestayData && homestayData.ordersRoom) {
            const newDisabledDateData = homestayData.ordersRoom.flatMap(([start, end]) =>
                getDatesBetween(start, end)
            );
            setDisabledDateData(newDisabledDateData);
        }
    }, [homestayData]);

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

    const handleDateChange = (dates) => {
        if (!dates || dates.length !== 2) {
            setSelectedDateRange([]);
            setTotalAmount(0);
            return;
        }
        setSelectedDateRange(dates);
        const nights = dates[1].diff(dates[0], 'day');
        setTotalAmount(nights * homestayData.giaRoom);
    };

    const disabledDate = (current) => {
        const formattedDisabledDays = disabledDateData.map((day) => dayjs(day, dateFormat));
        return current < dayjs().startOf("day") || formattedDisabledDays.some((disabledDay) => current.isSame(disabledDay, "day"));
    };

    const handleBooking = () => {
        if (!selectedDateRange || selectedDateRange.length !== 2) {
            message.error('Vui lòng chọn ngày nhận phòng và trả phòng');
            return;
        }
        message.success('Đặt phòng thành công!');
    };

    const handleCommentSubmit = () => {
        if (!commentValue) {
            message.error('Vui lòng nhập bình luận');
            return;
        }
        setSubmitting(true);
        setTimeout(() => {
            setComments([
                ...comments,
                {
                    author: 'Khách hàng',
                    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
                    content: commentValue,
                    datetime: new Date().toLocaleString(),
                },
            ]);
            setCommentValue('');
            setSubmitting(false);
            message.success('Bình luận đã được thêm thành công!');
        }, 1000);
    };

    if (!homestayData) {
        return <div className="text-center p-8">Đang tải thông tin phòng...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
            <Card className="shadow-lg rounded-lg overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-2/3 lg:pr-8">
                        <Title level={2} className="mb-4">{homestayData.nameRoom}</Title>
                        <div className="p-4">
                            <Image.PreviewGroup>
                                <div className="grid grid-cols-3 gap-2">
                                    {/* Hình ảnh lớn ở bên trái */}
                                    <div className="col-span-2">
                                        <Image
                                            src={homestayData.imgRoom[0].secure_url}
                                            alt="Phòng chính"
                                            className="w-full h-96 object-cover rounded-lg"
                                        />
                                    </div>

                                    {/* Cột bên phải với tối đa ba hình ảnh nhỏ */}
                                    <div className="flex flex-col gap-1">
                                        {homestayData.imgRoom.slice(1, 3).map((img, index) => (
                                            <div className="relative" key={index}>
                                                <Image
                                                    src={img.secure_url}
                                                    alt={`Phòng ${index + 2}`}
                                                    className="w-full h-44 object-cover rounded-lg"
                                                />
                                                {/* Hiển thị số lượng ảnh bị ẩn nếu là ảnh cuối */}
                                                {index === 1 && homestayData.imgRoom.length > 3 && (
                                                    <div className="absolute bottom-2 right-2 flex items-center justify-center bg-black bg-opacity-60 text-white text-lg font-semibold rounded-full px-3 py-1">
                                                        +{homestayData.imgRoom.length - 3} ảnh
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {homestayData.imgRoom.slice(3,).map((img, index) => (
                                            <Image
                                                key={index}
                                                src={img.secure_url}
                                                alt={`Phòng ${index + 2}`}
                                                className="hidden"
                                            />
                                        ))}
                                    </div>
                                </div>

                            </Image.PreviewGroup>
                        </div>

                        <Descriptions title="Thông tin phòng" bordered className="mb-8">
                            <Descriptions.Item label="Đánh giá" span={3}>
                                <Rate disabled defaultValue={homestayData.danhgiaRoom} /> ({homestayData.danhgiaRoom})
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại phòng" span={3}>
                                <Tag icon={<UserOutlined />} color="blue">{homestayData.loaiRoom}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá" span={3}>
                                <Tag icon={<DollarOutlined />} color="green">{homestayData.giaRoom.toLocaleString()} VND / đêm</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Khu vực" span={3}>
                                <Tag icon={<EnvironmentOutlined />} color="orange">{homestayData.sectorDetails.nameSector}</Tag>
                                {homestayData.sectorDetails.addressSector}, {homestayData.sectorDetails.discSector}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider />
                        <Title level={4}>Mô tả</Title>
                        <Paragraph className="mb-8">{homestayData.discRoom}</Paragraph>
                        <Divider />
                        <Title level={4} className="mb-4">Bình luận</Title>
                        {}
                        <List
                            className="comment-list mb-8"
                            header={`${comments.length} bình luận`}
                            itemLayout="horizontal"
                            dataSource={comments}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar src={item.avatar} />}
                                        title={item.author}
                                        description={item.content}
                                    />
                                    <div>{item.datetime}</div>
                                </List.Item>
                            )}
                        />
                        <Form.Item>
                            <TextArea rows={4} onChange={(e) => setCommentValue(e.target.value)} value={commentValue} />
                        </Form.Item>
                        <Form.Item>
                            <Button htmlType="submit" loading={submitting} onClick={handleCommentSubmit} type="primary">
                                Thêm bình luận
                            </Button>
                        </Form.Item>
                    </div>
                    <div className="lg:w-1/3 lg:pl-8 mt-8 lg:mt-0 border-t lg:border-t-0 lg:border-l">
                        <Card title="Đặt phòng" className="sticky top-8">
                            <Form layout="vertical">
                                <Form.Item
                                    label="Chọn ngày nhận và trả phòng"
                                    name="dateOrder"
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày đặt phòng!' }]}
                                >
                                    <RangePicker
                                        disabledDate={disabledDate}
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
                                        {homestayData.giaRoom.toLocaleString()} VND
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Tổng tiền">
                                        {totalAmount.toLocaleString()} VND
                                    </Descriptions.Item>
                                </Descriptions>
                                <Button type="primary" onClick={handleBooking} className="w-full">
                                    Đặt phòng
                                </Button>
                            </Form>
                        </Card>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default RoomDetail;