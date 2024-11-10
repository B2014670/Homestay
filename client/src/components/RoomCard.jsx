// RoomCard.js
import React from 'react';
import { Carousel, Rate, Button } from 'antd';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';

const RoomCard = ({ room, isLoggedIn, handleWishlistToggle, wishlists }) => {
    const isWishlisted = wishlists.some(item => item.roomId === room._id);

    return (
        <div className="bg-white overflow-hidden shadow-lg rounded-lg flex flex-col md:flex-row p-4 mb-4">
            {/* Image Carousel */}
            <div className="md:w-1/3 w-full h-[200px] relative">
                <Carousel autoplay autoplaySpeed={10000} arrows infinite={false}>
                    {room.imgRoom.length > 0 ? (
                        room.imgRoom.map((img, index) => (
                            <div key={index}>
                                <img className="w-full object-cover h-[200px]" src={img.secure_url} alt={room.nameRoom} />
                            </div>
                        ))
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-gray-500">No Image Available</span>
                        </div>
                    )}
                </Carousel>

                {/* Wishlist Button */}
                {isLoggedIn && (
                    <button
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-full p-2 focus:outline-none z-10"
                        onClick={() => handleWishlistToggle(room._id)}
                    >
                        {isWishlisted ? (
                            <FaHeart size={20} />
                        ) : (
                            <FaRegHeart size={20} className="text-black" />
                        )}
                    </button>
                )}
            </div>

            {/* Room Details */}


            <div className="flex-1 pl-4">
                <div className="flex justify-between items-center mt-4">
                    <div className="mb-1">
                        <h2 className="text-xl font-bold text-black mb-1">{room.nameRoom}</h2>
                        <p className="text-sm text-gray-500">{room.sectorDetails.nameSector}</p>
                        <p className="text-sm text-gray-500">{room.loaiRoom}</p>
                    </div>
                    <div className="mb-1 text-right">
                        {/* Rating */}
                        <Rate disabled defaultValue={room.danhgiaRoom} allowHalf className="text-yellow-400" />
                        <span className="block text-gray-600 text-sm mt-1">{room.cmtRoom.length} đánh giá</span>
                    </div>
                </div>

                {/* Price and Rating Section */}
                <div className="flex justify-between items-center mt-4">
                    <div className="text-left">
                        <p className="text-sm text-gray-500">{room.discRoom}</p>


                    </div>

                    <div className="text-right">
                        <p className="text-2xl font-bold text-black">
                            VND {parseInt(room.giaRoom).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">Đã bao gồm thuế và phí</p>
                        <Button type="primary" className="mt-2">Xem chỗ trống</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomCard;
