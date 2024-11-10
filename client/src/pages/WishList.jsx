import React, { useState, useEffect } from 'react';
import { Typography, List, Skeleton, message } from 'antd';
import WishListRoomCard from '../components/WishListCard'
import { apiGetUserWishlistRooms, apiDeleteWishlist } from '../services'
import useAuthStore from '../stores/authStore';

const { Text, Title } = Typography;

const WishList = () => {

    const { user } = useAuthStore();
    const [wishlists, setWishlists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await apiGetUserWishlistRooms(user?._id);
                console.log(response.data.data);

                if (response.data.err === 0) {
                    setWishlists(response.data.data);
                } else {
                    throw new Error(response.msg);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching wishlist:', error);
                message.error('Failed to load wishlist. Please try again later.');
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    const handleRemoveFavorite = async (roomId) => {
        try {
            await apiDeleteWishlist({ roomId, userId: user._id });
            setWishlists(prevWishlist => prevWishlist.filter(item => item.roomId !== roomId));
            message.success('Đã xóa khỏi danh sách yêu thích');
        } catch (error) {
            console.error('Error removing wishlist:', error);
            message.error('Lỗi xóa khỏi danh sách yêu thích');
        }
    };

    return (
        <div className="container max-w-7xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Danh sách phòng yêu thích</h1>
            <List
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 2,
                    md: 3,
                    lg: 3,
                    xl: 4,
                    xxl: 4,
                }}
                dataSource={wishlists}
                renderItem={(wishlist) => (
                    <List.Item>
                        {loading ? (
                            <Skeleton active />
                        ) : (
                            <WishListRoomCard wishlist={wishlist} onRemove={handleRemoveFavorite} />
                        )}
                    </List.Item>
                )}
            />
            {!loading && wishlists.length === 0 && (
                <div className="text-center py-8">
                    <Text type="secondary" className="text-lg">
                        Bạn chưa có phòng yêu thích nào.
                    </Text>
                </div>
            )}
        </div>

    );
};

export default WishList;