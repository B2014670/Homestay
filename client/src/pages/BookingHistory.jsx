import React, { useState, useEffect } from 'react'
import { Table, Tag, Button, Modal, Form, Input, Rate, message, Spin, Typography, Tooltip, Carousel } from 'antd'
import { StarOutlined, CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { apiHistoryOrder, apiCancelRoom, apiAddComment, apiUpdateComment, apiDeleteComment } from '../services'
import useAuthStore from '../stores/authStore'
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"

dayjs.extend(customParseFormat)
const dateFormat = "DD/MM/YYYY"

const { TextArea } = Input
const { Text } = Typography

export default function BookingHistory() {
    const { user } = useAuthStore()
    const [bookingData, setBookingData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [isCommentModalVisible, setIsCommentModalVisible] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [currentComment, setCurrentComment] = useState(null)
    const [form] = Form.useForm()

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)

    useEffect(() => {
        fetchBookingHistory()
    }, [])

    const fetchBookingHistory = async () => {
        try {
            const response = await apiHistoryOrder(user?._id)
            const data = response.data
            if (data.err === 0) {
                setBookingData(data)
            } else {
                throw new Error(data.msg || 'Không tìm nạp được lịch sử đặt chỗ')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const showModal = (order, comment = null) => {
        setSelectedOrder(order)
        setCurrentComment(comment)
        setIsModalVisible(true)
        setIsEditMode(!!comment)

        if (comment) {
            form.setFieldsValue({
                rating: comment.rating,
                text: comment.text,
            })
        }
    }

    const showCommentModal = (order) => {
        setSelectedOrder(order)
        setIsCommentModalVisible(true)
    }

    const handleCancel = () => {
        setIsModalVisible(false)
        setIsCommentModalVisible(false)
        form.resetFields()
        setCurrentComment(null)
        setSelectedOrder(null)
    }

    const handleCancelCommentModal = () => {
        setIsCommentModalVisible(false)
        form.resetFields()
    }

    const handleCancelOrder = async (record) => {
        const payload = {
            idUser: record.idUser,
            idOrder: record.idOrder,
        }
        try {
            const response = await apiCancelRoom(payload)
            if (response.status === 200) {
                message.success('Đơn hàng đã hủy thành công!')
                fetchBookingHistory()
            } else {
                message.warning(response.data.msg || 'Không thể hủy đơn hàng')
            }
        } catch (err) {
            message.error(err.response?.data?.msg || err.message || 'Có lỗi xảy ra')
        }
    }

    const onFinish = async (values) => {
        try {
            const payload = {
                idUser: user?._id,
                idOrder: selectedOrder.idOrder,
                idRoom: selectedOrder.idRoom,
                rating: values.rating,
                text: values.text,
            }

            let response
            if (isEditMode && currentComment) {
                response = await apiUpdateComment({
                    idComment: currentComment.idComment,
                    ...payload,
                })
            } else {
                response = await apiAddComment(payload)
            }

            const data = await response.data
            if (data.err === 0) {
                message.success(isEditMode ? 'Cập nhật bình luận thành công!' : 'Cảm ơn bạn đã để lại phản hồi!')
                setIsModalVisible(false)
                setIsCommentModalVisible(false)
                form.resetFields()
                fetchBookingHistory()
            } else {
                throw new Error(data.msg || (isEditMode ? 'Cập nhật không thành công' : 'Không thể gửi bình luận'))
            }
        } catch (err) {
            message.error(err.response?.data?.msg || err.message || 'Có lỗi xảy ra')
        }
    }

    const handleDeleteComment = async (comment) => {
        try {
            const response = await apiDeleteComment({
                idUser: user?._id,
                idComment: comment.idComment
            })
            if (response.status === 200) {
                message.success('Đã xóa bình luận')
                setIsCommentModalVisible(false)
                fetchBookingHistory()
            } else {
                message.warning(response.data.msg || 'Không thể xóa bình luận')
            }
        } catch (err) {
            message.error(err.response?.data?.msg || err.message || 'Có lỗi xảy ra')
        }
    }

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page)
        setPageSize(pageSize)
    }

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'idOrder',
            key: 'idOrder',
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title={text}>
                        {text.slice(0, 10)}...
                    </Tooltip>
                    <Button
                        icon={<CopyOutlined />}
                        size="small"
                        style={{ marginLeft: '8px' }}
                        onClick={() => navigator.clipboard.writeText(text).then(() => message.success('Đã sao chép vào bảng nhớ tạm!'))}
                    />
                </div>
            ),
        },
        {
            title: 'Check-in',
            dataIndex: ['dateInput', 0],
            key: 'checkIn',
        },
        {
            title: 'Check-out',
            dataIndex: ['dateInput', 1],
            key: 'checkOut',
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalMoney',
            key: 'totalMoney',
            render: (text) => `${parseInt(text).toLocaleString()} VND`,
        },
        {
            title: 'Đặt cọc',
            dataIndex: 'deposit',
            key: 'deposit',
            render: (text) => {
                const depositAmount = parseInt(text)
                return isNaN(depositAmount) ? '0 VND' : `${depositAmount.toLocaleString()} VND`
            }
        },
        {
            title: 'Phương thức',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (text) => text ?? 'at counter'
        },
        {
            title: 'Trạng thái',
            key: 'statusOrder',
            dataIndex: 'statusOrder',
            render: (status) => {
                const statusMap = {
                    '1': { color: 'orange', text: 'Processing' },
                    '2': { color: 'green', text: 'Confirmed' },
                    '3': { color: 'geekblue', text: 'Completed' },
                    default: { color: 'volcano', text: 'Canceled' },
                }

                const { color, text } = statusMap[status] || statusMap.default
                return <Tag color={color}>{text}</Tag>
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => {
                const hasRated = record.room?.cmtRoom.some(comment => comment.idOrder === record.idOrder && !comment.isDeleted)
                return (
                    <div className="flex space-x-2">
                        <Button
                            disabled={record.statusOrder != 3}
                            icon={<StarOutlined />}
                            onClick={() => { hasRated ? showCommentModal(record) : showModal(record); }}
                            className={`${hasRated ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'} min-w-[110px] hover:opacity-80 px-4 py-2 rounded-lg transition duration-150 ease-in-out`}
                        >
                            {hasRated ? 'Xem' : 'Đánh giá'}
                        </Button>

                        <Button
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => handleCancelOrder(record)}
                            disabled={record.statusOrder !== '1'}
                        >
                            Hủy
                        </Button>
                    </div>
                )
            }
        },
    ]

    const expandedRowRender = (record) => {
        return (
            <div className="container bg-white overflow-hidden shadow-lg rounded-lg flex flex-col md:flex-row p-4 mb-4">
                {/* Image Carousel */}
                <div className="md:w-[500px] w-full h-[200px]">
                    <Carousel
                        autoplay
                        autoplaySpeed={10000}
                        arrows
                        infinite={false}
                        className="w-full"
                    >
                        {record.room.imgRoom.length > 0 ? (
                            record.room.imgRoom.map((img, index) => (
                                <div key={index} className="w-full h-[200px]">
                                    <img
                                        className="object-cover w-full h-full"
                                        src={img.secure_url}
                                        alt={record.room.nameRoom}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <span className="text-gray-500">No Image Available</span>
                            </div>
                        )}
                    </Carousel>
                </div>

                {/* Room Details */}
                <div className="flex-1 pl-4 mt-4 md:mt-0">
                    <div className="flex justify-between items-center mb-4">
                        <div className="mb-1">
                            <h2 className="text-xl font-bold text-black mb-1">{record.room.nameRoom}</h2>
                            <p className="text-sm text-gray-500">{record.room.sectorDetails.nameSector}</p>
                            <p className="text-sm text-gray-500">{record.room.loaiRoom}</p>
                        </div>
                        <div className="mb-1 text-right">
                            {/* Rating */}
                            <Rate disabled defaultValue={record.room.danhgiaRoom} allowHalf className="text-yellow-400" />
                            <span className="block text-gray-600 text-sm mt-1">{record.room.cmtRoom.length} đánh giá</span>
                        </div>
                    </div>

                    {/* Price and Rating Section */}
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-left">
                            <p className="text-sm text-gray-500">{record.room.discRoom}</p>
                        </div>

                        <div className="text-right">
                            <p className="text-2xl font-bold text-black">
                                VND {parseInt(record.room.giaRoom).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">Đã bao gồm thuế và phí</p>
                            <Button type="primary" className="mt-2">Xem chỗ trống</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };



    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Text className="text-red-500 text-xl">{error}</Text>
            </div>
        )
    }

    return (
        <div className="container max-w-7xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Đơn đặt phòng</h1>
            {bookingData?.data?.length > 0 && bookingData.data[0]?.orders.length !== 0 ? (
                <>
                    <Table
                        columns={columns}
                        dataSource={bookingData?.data[0]?.orders || []}
                        rowKey="idOrder"
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            showSizeChanger: true,
                            pageSizeOptions: ['5', '10', '20'],
                            onChange: handlePageChange,
                            showTotal: (total) => `Tổng ${total} đơn`,
                        }}
                        scroll={{ x: true }}
                        expandable={{ expandedRowRender }}
                    />

                    <Modal
                        title="Để lại đánh giá"
                        open={isModalVisible}
                        onCancel={handleCancel}
                        footer={null}
                        className='z-100'
                    >
                        <Form form={form} layout="vertical" onFinish={onFinish} className='z-100'>
                            <Form.Item
                                name="rating"
                                label="Số sao"
                                rules={[{ required: true, message: 'Xin vui lòng chọn mức độ hài lòng!' }]}
                            >
                                <Rate />
                            </Form.Item>
                            <Form.Item
                                name="text"
                                label="Bình luận"
                                rules={[{ required: true, message: 'Vui lòng để lại bình luận!' }]}
                            >
                                <TextArea rows={4} />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                                    Gửi phản hồi
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>

                    <Modal
                        title="Xem đánh giá"
                        open={isCommentModalVisible}
                        onCancel={handleCancelCommentModal}
                        footer={null}
                        className='z-0'
                    >
                        {selectedOrder && selectedOrder.room?.cmtRoom
                            .filter((comment) => comment.idOrder === selectedOrder.idOrder && !comment.isDeleted)
                            .map((comment, index) => (
                                <div key={index} className="mb-4 border-b pb-4 z-0" >
                                    <div>
                                        <strong className="font-medium">Đánh giá: </strong><Rate disabled value={comment.rating} />
                                    </div>
                                    <p className="mt-2">
                                        <strong className="font-medium">Nội dung: </strong>
                                        <span className="text-gray-700">{comment.text}</span>
                                    </p>
                                    {comment.updatedDate ? (
                                        <p className="mt-2">
                                            <strong className="font-medium">Cập nhật lần cuối: </strong>
                                            <span className="text-gray-600">{dayjs(comment.updatedDate).format('DD/MM/YYYY')}</span>
                                        </p>
                                    ) : (
                                        <p className="mt-2">
                                            <strong className="font-medium">Ngày tạo: </strong>
                                            <span className="text-gray-600">{dayjs(comment.createdDate).format('DD/MM/YYYY')}</span>
                                        </p>
                                    )}
                                    <div className="mt-4 flex space-x-2">
                                        <Button
                                            icon={<EditOutlined />}
                                            onClick={() => showModal(selectedOrder, comment)}
                                            disabled={comment.updatedDate}
                                        >
                                            Cập nhật
                                        </Button>
                                        {/* <Button
                                            icon={<DeleteOutlined />}
                                            danger
                                            onClick={() => handleDeleteComment(comment)}
                                        >
                                            Xóa
                                        </Button> */}
                                    </div>
                                </div>
                            ))}
                    </Modal>
                </>
            ) : (
                <div className="text-center py-8">
                    <Text type="secondary" className="text-lg">
                        Bạn chưa có đơn đặt phòng nào.
                    </Text>
                </div>
            )}
        </div>
    )
}