import React, { useState, useEffect } from 'react'
import { Table, Tag, Button, Modal, Form, Input, Rate, message, Spin, Typography, Tooltip, Carousel, Card, Divider, List, Avatar, Space } from 'antd'
import { StarOutlined, CopyOutlined, DeleteOutlined, EditOutlined, CalendarOutlined, CoffeeOutlined, SearchOutlined } from '@ant-design/icons'
import { apiHistoryOrder, apiCancelRoom, apiAddComment, apiUpdateComment, apiDeleteComment } from '../services'
import useAuthStore from '../stores/authStore'
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"

dayjs.extend(customParseFormat)
const dateFormat = "DD/MM/YYYY"

const { TextArea } = Input
const { Text, Paragraph } = Typography

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
    const [searchText, setSearchText] = useState('')
    const [searchedColumn, setSearchedColumn] = useState('')

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

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.select(), 100)
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Tooltip title={text}>
                    {text.toString().length > 10 ? `${text.toString().slice(0, 10)}...` : text}
                </Tooltip>
            ) : (
                text
            ),
    })

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm()
        setSearchText(selectedKeys[0])
        setSearchedColumn(dataIndex)
    }

    const handleReset = (clearFilters) => {
        clearFilters()
        setSearchText('')
        setSearchedColumn(dataIndex)
    }

    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: 'idOrder',
            key: 'idOrder',
            ...getColumnSearchProps('idOrder'),
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title={text}>
                        {text.slice(0, 5)}...
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
            title: 'Tên phòng',
            dataIndex: ['dateInput', 0],
            key: 'checkIn',
            render: (_, record) => record.room?.nameRoom || 'Không có dữ liệu',
        },

        {
            title: 'Ngày nhận',
            dataIndex: ['dateInput', 0],
            key: 'checkIn',
            sorter: (a, b) => dayjs(a.dateInput[0], dateFormat).unix() - dayjs(b.dateInput[0], dateFormat).unix(),
        },
        {
            title: 'Ngày trả',
            dataIndex: ['dateInput', 1],
            key: 'checkOut',
            sorter: (a, b) => dayjs(a.dateInput[1], dateFormat).unix() - dayjs(b.dateInput[1], dateFormat).unix(),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalMoney',
            key: 'totalMoney',
            sorter: (a, b) => parseInt(a.totalMoney) - parseInt(b.totalMoney),
            render: (text) => `${parseInt(text).toLocaleString()} VND`,
        },
        {
            title: 'Đặt cọc',
            dataIndex: 'deposit',
            key: 'deposit',
            sorter: (a, b) => parseInt(a.deposit) - parseInt(b.deposit),
            render: (text) => {
                const depositAmount = parseInt(text)
                return isNaN(depositAmount) ? '0 VND' : `${depositAmount.toLocaleString()} VND`
            }
        },
        {
            title: 'Phương thức',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            filters: [
                { text: 'Paypal', value: 'paypal' },
                { text: 'Tại quầy', value: 'at counter' },
                { text: 'Đặt cọc', value: 'paypal deposit' },
            ],
            onFilter: (value, record) => {
                return (record.paymentMethod || 'at counter') === value;
            },
            render: (text) =>
                text === 'at counter'
                    ? "tại quầy"
                    : (text === 'paypal' ? 'paypal' : 'paypal deposit')
            // text ?? 'at counter'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'statusOrder',
            key: 'statusOrder',
            filters: [
                { text: 'Đang xử lý', value: '1' },
                { text: 'Xác nhận', value: '2' },
                { text: 'Hoàn thành', value: '3' },
                { text: 'Đã hủy', value: '10' },
            ],
            onFilter: (value, record) => {
                // Corrected to compare with statusOrder instead of paymentMethod
                return record.statusOrder === value;
            },
            render: (status) => {
                const statusMap = {
                    '1': { color: 'orange', text: 'Đang xử lý' },
                    '2': { color: 'green', text: 'Xác nhận' },
                    '3': { color: 'geekblue', text: 'Hoàn thành' },
                    '10': { color: 'volcano', text: 'Đã hủy' },
                };

                const { color, text } = statusMap[status] || { color: 'default', text: 'Unknown' };
                return <Tag color={color}>{text}</Tag>;
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
                            icon={hasRated ? <StarOutlined /> : ''}
                            onClick={() => { hasRated ? showCommentModal(record) : showModal(record); }}
                            className={`${hasRated ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'} min-w-[80px] hover:opacity-80 px-4 py-2 rounded-lg transition duration-150 ease-in-out`}
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
            <Card className="overflow-hidden shadow-lg rounded-lg mb-4">
                <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-[500px] w-[250px] h-[250px] lg:h-auto">
                        <Carousel
                            autoplay
                            autoplaySpeed={5000}
                            arrows={true}
                            dots={true}
                            infinite
                            className="w-full h-full"
                        >
                            {record.room.imgRoom.length > 0 ? (
                                record.room.imgRoom.map((img, index) => (
                                    <div key={index} className="h-[250px]">
                                        <img
                                            className="object-cover w-full h-full"
                                            src={img.secure_url}
                                            alt={`${record.room.nameRoom} - Image ${index + 1}`}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    <span className="text-gray-500">Không có hình ảnh</span>
                                </div>
                            )}
                        </Carousel>
                    </div>

                    <div className="lg:w-2/3 p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-primary mb-2">{record.room.nameRoom}</h2>
                                <Tag color="blue">{record.room.sectorDetails.nameSector}</Tag>
                                <Tag color="green">{record.room.loaiRoom}</Tag>
                            </div>
                            <div className="mt-2 md:mt-0 text-right">
                                <Rate disabled defaultValue={record.room.danhgiaRoom} allowHalf className="text-yellow-400" />
                            </div>
                        </div>


                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="mb-4 md:mb-0">
                                <h3 className="text-lg font-semibold mb-2">Mô tả phòng</h3>
                                <Paragraph
                                    className="text-gray-600"
                                    ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}
                                >
                                    {record.room.discRoom}
                                </Paragraph>
                            </div>
                            <div className="text-right min-w-[250px]">
                                <p className="text-3xl font-bold text-primary">
                                    {parseInt(record.room.giaRoom).toLocaleString()} VND
                                </p>
                                <p className="text-sm text-gray-500">Đã bao gồm thuế và phí</p>
                                <Button type="primary" icon={<CalendarOutlined />} className="mt-2">
                                    Xem chỗ trống
                                </Button>
                            </div>
                        </div>

                        {record.extraServices && record.extraServices.length > 0 && (
                            <>
                                <Divider orientation="left">Dịch vụ bổ sung</Divider>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={record.extraServices}
                                    renderItem={(service, index) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<Avatar icon={<CoffeeOutlined />} />}
                                                title={<span className="font-semibold">{service.serviceType}</span>}
                                                description={
                                                    <div>
                                                        <p>Số khách: {service.guests}</p>
                                                        <p>Ngày sử dụng: {service.dates.join(", ")}</p>
                                                        <p>Giá mỗi đơn vị: {parseInt(service.pricePerUnit).toLocaleString()} VND</p>
                                                    </div>
                                                }
                                            />
                                            <div className="text-right">
                                                <p className="font-bold">
                                                    Giá dịch vụ: {parseInt(service.totalServiceCost).toLocaleString()} VND
                                                </p>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </>
                        )}
                    </div>
                </div>
            </Card>
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
                        title="Xem đánh giá"
                        open={isCommentModalVisible}
                        onCancel={handleCancelCommentModal}
                        footer={null}
                        className='z-0'
                        zIndex={10}
                    >
                        {selectedOrder && selectedOrder.room?.cmtRoom
                            // .filter((comment) => comment.idOrder === selectedOrder.idOrder && !comment.isDeleted)
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
                                    </div>
                                </div>
                            ))}
                    </Modal>
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
                                    Gửi đánh giá
                                </Button>
                            </Form.Item>
                        </Form>
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