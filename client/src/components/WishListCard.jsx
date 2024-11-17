import React, { useState } from 'react';
import { Card, Button, Typography, Carousel } from 'antd';
import { CloseOutlined, EnvironmentOutlined, UserOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { path } from '../utils/constant';

const { Text, Title } = Typography;

const WishListRoomCard = ({ wishlist, onRemove }) => {
    const navigate = useNavigate();
    const { roomDetails } = wishlist;
    const [isExpanded, setIsExpanded] = useState(false);


    const toggleExpand = () => setIsExpanded(!isExpanded);
    const limit = 25;

    return (
        <Card
            className="w-full hover:shadow-lg transition-shadow duration-300"
            cover={
                <div className="relative">
                    <Carousel autoplay autoplaySpeed={10000} arrows infinite={false}>
                        {roomDetails.imgRoom.map((img, index) => (
                            <div key={index}>
                                <img
                                    className="w-full object-cover h-48 cursor-pointer"
                                    onClick={() => navigate(`/${path.DETAILROOM}/${roomDetails._id}`)}
                                    src={img.secure_url}
                                    alt={roomDetails.nameRoom}
                                />
                            </div>
                        ))}
                    </Carousel>
                    <button
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-full p-2 focus:outline-none z-10"
                        onClick={() => onRemove(wishlist.roomId)}
                    >
                        <FaHeart size={20} />
                    </button>
                </div>
            }
        >
            <div className="px-4">
                <Title level={4} className="mb-2">
                    {roomDetails.nameRoom}
                </Title>
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
                        {roomDetails.danhgiaRoom.toFixed(1)}
                    </span>
                    <Text strong>Tuyệt vời</Text>
                    <Text type="secondary">· {roomDetails.cmtRoom.length} đánh giá</Text>
                </div>
                <div className="flex items-start gap-2 mb-2">
                    <EnvironmentOutlined className="mt-1 text-gray-500" />
                    <Text className="text-sm text-gray-600">
                        {roomDetails.sectorDetails.nameSector}
                    </Text>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <UserOutlined className="text-gray-500" />
                    <Text className="text-sm text-gray-600">{roomDetails.loaiRoom}</Text>
                </div>

                <div className="flex items-start gap-2 mb-2">
                    <UnorderedListOutlined className="text-gray-500 mt-1" />

                    <Text className="text-sm text-gray-600">
                        {isExpanded ? roomDetails.discRoom : `${roomDetails.discRoom.slice(0, limit)}${roomDetails.discRoom.length > limit ? '...' : ''}`}
                        {roomDetails.discRoom.length > limit && (
                            <span
                                onClick={toggleExpand}
                                className="text-blue-500 cursor-pointer ml-1"
                            >
                                {isExpanded ? 'Show Less' : 'Read More'}
                            </span>
                        )}
                    </Text>
                </div>


                <div className="border-t pt-3">
                    <div className="flex justify-between items-end">

                        <div className="text-right">
                            <Title level={4} className="mb-0">
                                VND {roomDetails.giaRoom.toLocaleString()}
                            </Title>
                            <Text type="secondary" className="text-xs">
                                Đã bao gồm thuế và phí
                            </Text>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default WishListRoomCard;
