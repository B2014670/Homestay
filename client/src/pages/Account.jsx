import React, { useState, useEffect, useRef } from 'react'
import { Tabs, Form, Input, Button, List, Tag, Card, message, Avatar, Upload } from 'antd'
import { UserOutlined, LockOutlined, HistoryOutlined, MessageOutlined, UploadOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, DeleteOutlined } from '@ant-design/icons'
import { apiInfoUser, apiUpdateInfoUser, apiChangePassword } from '../services'
import {
  apiCreateConversation,
  apiAddMessage,
  apiGetConversationsForUser,
  apiGetMessagesForConversation,
  apiEndConversation,
  apiUpdateAdmin,
  apiGetConversationsForAdmin,
  apiGetAdmins
} from '../services'
import axios from 'axios';
import io from 'socket.io-client';
import useAuthStore from '../stores/authStore';
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const { TabPane } = Tabs

export default function AccountPage() {
  const { isLoggedIn, user, setUser } = useAuthStore();
  const [userInfo, setUserInfo] = useState({});
  const [conversation, setConversation] = useState({})
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [form] = Form.useForm();
  const endOfMessagesRef = useRef(null)

  useEffect(() => {
    if (isLoggedIn) {
      const newSocket = io(import.meta.env.VITE_REACT_APP_SERVER);
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('addUser', user._id);

      socket.on('getUsers', (users) => {
        console.log('Active users:', users);
      });

      socket?.on('getMessage', data => {
        setMessages(prevMessages => [...prevMessages, data]);
      });

      return () => {
        socket.off('getUsers');
      };
    }
  }, [socket, user?._id]);

  useEffect(() => {
    // Scroll to the last message when messages change
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const fetchConversationsAndMessages = async () => {
      try {
        const responseConversation = await apiGetConversationsForUser(user?._id);
        let conversationData;

        if (!responseConversation?.data) {
          const newConversation = await apiCreateConversation({ customerId: user?._id });
          conversationData = newConversation.data;
        } else {
          conversationData = responseConversation.data;
        }

        setConversation(conversationData);

        // Fetch messages for the current conversation
        const responseMessages = await apiGetMessagesForConversation(conversationData._id);
        setMessages(responseMessages.data);

      } catch (error) {
        console.error("Error fetching conversations or messages:", error);
      }
    };

    fetchConversationsAndMessages();
  }, [user?._id])

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    socket?.emit('sendMessage', {
      conversationId: conversation?._id,
      senderId: user?._id,
      role: 'user',
      text: newMessage,
    });

    setNewMessage('');
    // try {
    //     // Save the message via API
    //     const response = await apiAddMessage({
    //         conversationId: messages.conversation._id,
    //         senderId: user._id,
    //         role: 'user',
    //         text: message,
    //     });

    //     if (response.status === 200) { 
    //         setMessage(''); 
    //     } else {
    //         console.error("Failed to add message:", response);
    //     }
    // } catch (error) {
    //     console.error("Message sending failed:", error);
    // }

  };

  // TAB 1
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
        message.error('Không tìm nạp được thông tin người dùng: ' + response.data.message);
      }
    } catch (error) {
      message.error('Lỗi tìm nạp thông tin người dùng: ' + error.message);
    }
  };

  const handleUpdateProfile = async (values) => {
    let image = userInfo.img;
    try {
      const response = await apiUpdateInfoUser({ idUser: userInfo._id, img: image, ...values });
      if (response.status === 200) {
        setUserInfo({ ...userInfo, ...values });
        setUser({ ...userInfo, ...values });
        message.success('Hồ sơ được cập nhật thành công');
        // form.resetFields();
      } else {
        message.error('Không thể cập nhật hồ sơ: ' + response.data.message);
      }
    } catch (error) {
      message.error('Lỗi cập nhật hồ sơ: ' + error.message);
    }
  }

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    const isLt2M = file.size / 1024 / 1024 < 20; // File size must be less than 20MB

    if (!isImage) {
      message.error('You can only upload image files!');
    }

    if (!isLt2M) {
      message.error('Image must be smaller than 200MB!');
    }

    return isImage && isLt2M;
  };

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
          setUser({
            ...userInfo,
            img: {
              url: response.data.secure_url,
              public_id: response.data.public_id,
              signature: response.data.signature,
              delete_token: response.data.delete_token,
            }
          });
          message.success('Hình ảnh được tải lên thành công!');
        } else {
          message.error('Tải hình ảnh lên không thành công!');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteImageByDelete_token = async (delete_token) => {
    try {
      const response = await axios.post('https://api.cloudinary.com/v1_1/dwcrfnnov/delete_by_token', {
        token: delete_token,
      });
      if (response.status === 200) {
        setUserInfo({
          ...userInfo,
          img: {}
        });
        setUser({
          ...userInfo,
          img: {}
        });
        message.success('Đã xóa hình ảnh thành công!');
        return;
      }
    } catch (error) {
      console.error('Error deleting image by token:', error);
      message.error('Không thể xóa hình ảnh: token đã hết hạn hoặc không hợp lệ.');
    }
  };

  const handleRemove = async () => {
    if (userInfo.img && userInfo.img.delete_token) {
      deleteImageByDelete_token(userInfo.img.delete_token);
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
        message.success('Đỗi mật khẩu thành công');
        form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
      } else {
        message.error(response.data.msg);
      }
    } catch (error) {
      message.error(error.message);
    }
  }

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
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative inline-block group">
                {/* Avatar component */}
                <Avatar
                  size={64}
                  src={userInfo?.img?.url}
                  icon={<UserOutlined />}
                  className="cursor-pointer border-black group-hover:bg-white group-hover:opacity-50"
                />

                {/* Delete button (visible on hover) */}
                <Button
                  icon={<DeleteOutlined style={{ fontSize: '32px' }} />}
                  type="text"
                  size="large"
                  onClick={handleRemove}
                  className="absolute inset-0 m-auto rounded-full hidden group-hover:block"
                />
              </div>
              <Upload
                name="avatar"
                customRequest={({ file, onSuccess }) => {
                  uploadImage(file).then(() => onSuccess("ok")).catch((err) => {
                    console.error(err);
                    message.error('Image upload failed. Please try again.');
                  });
                }}
                accept="image/*"
                beforeUpload={beforeUpload}
                onRemove={handleRemove}
                showUploadList={true}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Đỗi ảnh đại diện</Button>
              </Upload>
            </div>
            <Form form={form} layout="vertical" onFinish={handleUpdateProfile} initialValues={userInfo}>
              <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} value={userInfo.name} />
              </Form.Item>
              <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
                <Input prefix={<EnvironmentOutlined />} />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                <Input prefix={<MailOutlined />} disabled />
              </Form.Item>
              <Form.Item name="phone" label="Số điện thoại">
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
          <MessageOutlined />
          Trò chuyện với quản trị viên
        </span>
      ),
      children: (
        <div className="flex flex-col h-[300px]">
          <div className="flex-grow overflow-y-auto space-y-4">
            {messages?.length === 0 ? (
              <div className='text-center text-lg font-semibold mt-24'>
                Không có tin nhắn nào
              </div>
            ) : (
              <>
                {messages?.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-black'}`}>
                      <p>{typeof msg.message === 'string' ? msg.message : JSON.stringify(msg.message)}</p>
                      <p className="text-xs opacity-50">{dayjs(msg.timestamp).format('HH:mm DD/MM/YYYY')}</p>
                    </div>
                  </div>
                ))}
                {/* Place the ref to the last element */}
                <div ref={endOfMessagesRef} />
              </>
            )}
          </div>
          <div className="flex">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onPressEnter={sendMessage}
              placeholder="Nhập tin nhắn của bạn..."
              className="flex-grow"
            />
            <Button onClick={sendMessage} type="primary" className="ml-2">
              Gửi
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-4xl p-4 my-2 bg-red-50 rounded-lg shadow-md">
      <Tabs defaultActiveKey="1" items={tabItems} />
    </div>
  )
}