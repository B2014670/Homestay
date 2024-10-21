import React, { useState } from 'react'
import { Tabs, Form, Input, Button, List, Tag, Card, message, Avatar, Upload } from 'antd'
import { UserOutlined, LockOutlined, HistoryOutlined, MessageOutlined, UploadOutlined  } from '@ant-design/icons'

const { TabPane } = Tabs

// Mock data for demonstration
const mockBookings = [
  { id: 1, homestay: 'Cozy Cabin', checkIn: '2023-10-15', checkOut: '2023-10-20', status: 'Completed' },
  { id: 2, homestay: 'Beach House', checkIn: '2023-11-20', checkOut: '2023-11-25', status: 'Upcoming' },
  { id: 3, homestay: 'Mountain Retreat', checkIn: '2023-12-05', checkOut: '2023-12-10', status: 'Cancelled' },
]

const mockMessages = [
  { id: 1, sender: 'Admin', content: 'Hello! How can I help you today?', timestamp: '2023-09-15 10:30' },
  { id: 2, sender: 'User', content: 'I have a question about my booking.', timestamp: '2023-09-15 10:32' },
  { id: 3, sender: 'Admin', content: 'Sure, what would you like to know?', timestamp: '2023-09-15 10:33' },
]

export default function AccountPage() {
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    avatar: null,
  })
  const [messages, setMessages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState('')

  const handleUpdateProfile = (values) => {
    setUserInfo(values)
    message.success('Profile updated successfully')
  }

  const handleChangePassword = (values) => {
    // Implement password change logic here
    message.success('Password changed successfully')
  }

  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      setUserInfo({ ...userInfo, avatar: info.file.response.url })
      message.success('Avatar updated successfully')
    } else if (info.file.status === 'error') {
      message.error('Avatar upload failed')
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: 'User',
          content: newMessage,
          timestamp: new Date().toLocaleString(),
        },
      ])
      setNewMessage('')
    }
  }

  return (
    <div className="w-full max-w-4xl p-6 my-6 bg-white rounded-lg shadow-md">
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <span>
              <UserOutlined />
              Account Settings
            </span>
          }
          key="1"
        >
          <div className="space-y-8">
            <Card title="Profile Information">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar
                  size={64}
                  src={userInfo.avatar}
                  icon={<UserOutlined />}
                />
                <Upload
                  name="avatar"
                  action="/api/upload" // Replace with your actual upload API endpoint
                  onChange={handleAvatarChange}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>Change Avatar</Button>
                </Upload>
              </div>
              <Form
                layout="vertical"
                initialValues={userInfo}
                onFinish={handleUpdateProfile}
              >
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="phone" label="Phone">
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Update Profile
                  </Button>
                </Form.Item>
              </Form>
            </Card>
            <Card title="Change Password">
              <Form layout="vertical" onFinish={handleChangePassword}>
                <Form.Item name="currentPassword" label="Current Password" rules={[{ required: true }]}>
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                <Form.Item name="newPassword" label="New Password" rules={[{ required: true }]}>
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                <Form.Item name="confirmPassword" label="Confirm New Password" rules={[{ required: true }]}>
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Change Password
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </TabPane>
        <TabPane
          tab={
            <span>
              <HistoryOutlined />
              Booking History
            </span>
          }
          key="2"
        >
          <List
            itemLayout="horizontal"
            dataSource={mockBookings}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={item.homestay}
                  description={`Check-in: ${item.checkIn} | Check-out: ${item.checkOut}`}
                />
                <Tag color={
                  item.status === 'Completed' ? 'green' :
                    item.status === 'Upcoming' ? 'blue' : 'red'
                }>
                  {item.status}
                </Tag>
              </List.Item>
            )}
          />
        </TabPane>
        <TabPane
          tab={
            <span>
              <MessageOutlined />
              Chat with Admin
            </span>
          }
          key="3"
        >
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
        </TabPane>
      </Tabs>
    </div>
  )
}