import React, { useState, useEffect } from 'react'
import { Tabs, Form, Input, Button, List, Tag, Card, message, Avatar, Upload } from 'antd'
import { UserOutlined, LockOutlined, HistoryOutlined, MessageOutlined, UploadOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { apiInfoUser, apiUpdateInfoUser, apiChangePassword } from '../services'
import axios from 'axios';
import io from 'socket.io-client';
import useAuthStore from '../stores/authStore';

const { TabPane } = Tabs

// Mock data for demonstration
const mockBookings = [
  { id: 1, homestay: 'Cozy Cabin', checkIn: '2023-10-15', checkOut: '2023-10-20', status: 'Completed' },
  { id: 2, homestay: 'Beach House', checkIn: '2023-11-20', checkOut: '2023-11-25', status: 'Upcoming' },
  { id: 3, homestay: 'Mountain Retreat', checkIn: '2023-12-05', checkOut: '2023-12-10', status: 'Cancelled' },
]

export default function AccountPage() {
  const { isLoggedIn } = useAuthStore();
  const [userInfo, setUserInfo] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [form] = Form.useForm();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      // Connect to the socket server
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      // Listen for messages from the server
      newSocket.on('receiveMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      // Clean up the socket connection when the component unmounts
      return () => {
        newSocket.off('receiveMessage');
        newSocket.disconnect(); // Disconnect when the component is unmounted
      };
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      fetchUserData(user);
    }
  }, []);

  const fetchUserData = async (user) => {
    try {
      const response = await apiInfoUser({ phone: user.phone });
      if (response.status === 200) {
        setUserInfo(response.data);
        form.setFieldsValue(response.data);
      } else {
        message.error('Failed to fetch user info: ' + response.data.message);
      }
    } catch (error) {
      message.error('Error fetching user info: ' + error.message);
    }
  };

  const handleUpdateProfile = async (values) => {
    let image = userInfo.img;
    try {
      const response = await apiUpdateInfoUser({ idUser: userInfo._id, img: image, ...values });
      if (response.status === 200) {
        setUserInfo({ ...userInfo, ...values });
        message.success('Hồ sơ được cập nhật thành công');
      } else {
        message.error('Failed to update profile: ' + response.data.message);
      }
    } catch (error) {
      message.error('Error updating profile: ' + error.message);
    }
  }

  const beforeUpload = () => {
    const allowedTypes = [
      "image/jpeg",  // JPEG
      "image/png",   // PNG
      "image/gif",   // GIF
      "image/bmp",   // BMP
      "image/tiff",  // TIFF
      "image/svg+xml" // SVG
    ];
    const isAllowed = allowedTypes.includes(file.type);
    if (!isAllowed) {
      console.error("You can only upload image files (JPEG, PNG, GIF, BMP, TIFF, SVG)!");
      swal(
        "Cảnh báo !",
        "Tệp tải lên phải là hình ảnh (JPEG, PNG, GIF, BMP, TIFF, SVG)!",
        "warning"
      );
    }
    return isAllowed;
  }

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'we6hizdj');
    await axios
      .post('https://api.cloudinary.com/v1_1/dwcrfnnov/image/upload', formData)
      .then((response) => {
        if (response.status === 200) {
          setUserInfo({
            ...userInfo,
            img: {
              url: response.data.secure_url,
              public_id: response.data.public_id,
              signature: response.data.signature,
              delete_token: response.data.delete_token,
            }
          });
          message.success('Image uploaded successfully!');
        } else {
          message.error('Image upload failed');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteImage = async (img) => {
    try {
      const response = await axios.post('https://api.cloudinary.com/v1_1/dwcrfnnov/delete_by_token', {
        token: img.delete_token,
      });
      if (response.status === 200) {
        message.success('Image deleted successfully!');
        setUserInfo({ ...userInfo, img: null });
      } else {
        message.error('Failed to delete image');
      }
    } catch (error) {
      console.error(error);
      message.error('Error deleting image');
    }
  };

  const handleRemove = async () => {
    if (userInfo.img && userInfo.img.delete_token) {
      deleteImage(userInfo.img);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      const response = await apiChangePassword({
        phone: userInfo.phone,
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (response.data.err === 0) {
        message.success('Password changed successfully');
        form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
      } else {
        message.error(response.data.msg);
      }
    } catch (error) {
      message.error(error.message);
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && socket && userInfo) {
      const messageData = {
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
        idUser: userInfo._id,
        name: userInfo.name,
        sender: 'User',
        content: newMessage,
        timestamp: new Date().toLocaleString(), // Add timestamp for local display
      };

      // Emit the message to the server
      socket.emit('sendMessage', messageData);

      // Add the message locally
      setMessages((prevMessages) => [...prevMessages, messageData]);

      // Clear input field
      setNewMessage('');
    }
  };

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <UserOutlined />
          Cài đặt tài khoản
        </span>
      ),
      children: (
        <div className="space-y-8">
          <Card title="Thông tin cá nhân">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar size={64} src={userInfo?.img?.url} icon={<UserOutlined />} />

              <Upload
                name="avatar"
                customRequest={({ file, onSuccess }) => {
                  uploadImage(file);
                  onSuccess("ok"); // Manually trigger success
                }}
                beforeUpload={beforeUpload}
                onRemove={handleRemove}
                showUploadList={true}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Đỗi ảnh đại diện</Button>
              </Upload>
            </div>
            <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
              <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} value={userInfo.name} onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} />
              </Form.Item>
              <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
                <Input prefix={<EnvironmentOutlined />} />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input prefix={<MailOutlined />} disabled />
              </Form.Item>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
                <Input prefix={<PhoneOutlined />} disabled />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Cập nhật hồ sơ
                </Button>
              </Form.Item>
            </Form>
          </Card>
          <Card title="Đỗi mật khẩu">
            <Form layout="vertical" onFinish={handleChangePassword}>
              <Form.Item name="currentPassword" label="Mật khẩu hiện tại" rules={[{ required: true }]}>
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true }]}>
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Hai mật khẩu mới không khớp'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Đỗi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <HistoryOutlined />
          Lịch sử đặt chỗ
        </span>
      ),
      children: (
        <List
          itemLayout="horizontal"
          dataSource={mockBookings}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.homestay}
                description={`Check-in: ${item.checkIn} | Check-out: ${item.checkOut}`}
              />
              <Tag color={item.status === 'Completed' ? 'green' : item.status === 'Upcoming' ? 'blue' : 'red'}>
                {item.status}
              </Tag>
            </List.Item>
          )}
        />
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <MessageOutlined />
          Trò chuyện với quản trị viên
        </span>
      ),
      children: (
        <div className="flex flex-col h-[400px]">
          <div className="flex-grow overflow-y-auto mb-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs p-3 rounded-lg ${msg.sender === 'User' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <p className="font-semibold">{msg.sender}</p>
                  <p>{msg.content}</p>
                  <p className="text-xs text-gray-500">{msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onPressEnter={handleSendMessage}
              placeholder="Type your message..."
              className="flex-grow"
            />
            <Button onClick={handleSendMessage} type="primary" className="ml-2">
              Send
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-4xl p-6 my-6 bg-white rounded-lg shadow-md">
      <Tabs defaultActiveKey="1" items={tabItems} />
    </div>
  )
}