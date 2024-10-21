import React, { useState, useEffect } from 'react'
import { Layout, Row, Col, Form, Typography, Image, Input, Button, Upload, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import axios from 'axios'
import { apiInfoUser, apiUpdateInfoUser, apiChangePassword } from '../services'
import useAuthStore from '../stores/authStore';

const { Content } = Layout
const { Title } = Typography

export default function CaNhan() {
  const [userInfo, setUserInfo] = useState(null)
  const [avatar, setAvatar] = useState('https://www.pngall.com/wp-content/uploads/12/Avatar-PNG-Image.png')
  const [editInfo, setEditInfo] = useState(false)
  const [editPassword, setEditPassword] = useState(false)
  const { user } = useAuthStore();

  console.log(user);

  const [form] = Form.useForm()

  useEffect(() => {
    apiInfoUser({ phone: user.phone }).then((res) => {
      if (res.data.img?.secure_url) {
        setAvatar(res.data.img.secure_url);
      }
      setUserInfo(res.data);
      form.setFieldsValue(res.data);
    });
  }, [user.phone, form]);

  const handleUpdateInfo = async (values) => {
    try {
      const result = await apiUpdateInfoUser({ ...values, idUser, img: avatar })
      if (result.data.status === '1') {
        message.success('Cập nhật thông tin thành công')
        setEditInfo(false)
        setUserInfo({ ...userInfo, ...values })
      }
    } catch (error) {
      message.error('Cập nhật thông tin thất bại')
    }
  }

  const handleUpdatePassword = async (values) => {
    try {
      const result = await apiChangePassword({
        phone: phoneUser,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      })
      if (result.data.err === 0) {
        message.success('Đổi mật khẩu thành công')
        setEditPassword(false)
      } else {
        message.warning(result.data.msg)
      }
    } catch (error) {
      message.error('Đổi mật khẩu thất bại')
    }
  }

  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'btj12veg')
    try {
      const response = await axios.post('https://api.cloudinary.com/v1_1/dwcrfnnov/image/upload', formData)
      setAvatar(response.data.secure_url)
    } catch (error) {
      message.error('Tải ảnh lên thất bại')
    }
  }

  return (
    <Layout className="w-full max-w-4xl mx-auto bg-white p-8 my-6 rounded-lg shadow-md">
      <Content>
        <Row gutter={16}>
          <Col span={8} className="flex flex-col items-center">
            <Image
              className="rounded-full"
              src={avatar}
              alt="Avatar"
              width={250}
              height={250}
            />
            {editInfo && (
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={(file) => {
                  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
                  if (!isJpgOrPng) {
                    message.error('Bạn chỉ có thể tải lên file JPG/PNG!')
                  }
                  return isJpgOrPng
                }}
                customRequest={({ file }) => uploadImage(file)}
              >
                <Button icon={<PlusOutlined />} className="mt-4">Tải ảnh</Button>
              </Upload>
            )}
          </Col>
          <Col span={16}>
            <Title level={2} className="text-center mb-6">Thông Tin Cá Nhân</Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateInfo}
              initialValues={userInfo}
            >
              <Form.Item name="email" label="Email">
                <Input disabled={!editInfo} />
              </Form.Item>
              <Form.Item name="phone" label="Số điện thoại">
                <Input disabled={!editInfo} />
              </Form.Item>
              <Form.Item name="name" label="Họ và Tên">
                <Input disabled={!editInfo} />
              </Form.Item>
              <Form.Item name="address" label="Địa chỉ">
                <Input disabled={!editInfo} />
              </Form.Item>
              <Form.Item>
                {editInfo ? (
                  <>
                    <Button type="primary" htmlType="submit">Lưu</Button>
                    <Button className="ml-4" onClick={() => setEditInfo(false)}>Hủy</Button>
                  </>
                ) : (
                  <Button onClick={() => setEditInfo(true)}>Cập nhật thông tin</Button>
                )}
              </Form.Item>
            </Form>
            {!editPassword ? (
              <Button onClick={() => setEditPassword(true)}>Cập nhật mật khẩu</Button>
            ) : (
              <Form onFinish={handleUpdatePassword} layout="vertical">
                <Form.Item
                  name="oldPassword"
                  label="Mật khẩu cũ"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="newPassword"
                  label="Mật khẩu mới"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                    { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">Đổi mật khẩu</Button>
                  <Button className="ml-4" onClick={() => setEditPassword(false)}>Hủy</Button>
                </Form.Item>
              </Form>
            )}
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}