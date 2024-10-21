import React from 'react';
import { Form, Input, Button, Typography, Card } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

export default function Contact() {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log('Form values:', values);
        alert('Thank you for your message. We will get back to you soon!');
        form.resetFields();
    };

    return (
        <div className="container mx-auto lg:px-20 md:px-2 px-1 sm:px-6 py-8">
            <Card className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Information Section */}
                    <div>
                        <Title level={2} className="text-center">HOMESTAY HON SON</Title>
                        <Paragraph>
                            <Text strong>Địa chỉ:</Text> ấp Bãi Bàng, Lại Sơn, Kiên Hải, Kiên Giang
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Điện thoại:</Text> 0292 2222 222
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Email:</Text> homestay@gmail.com
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Website:</Text> <a href="http://www.homestayhonson.vn" target="_blank" rel="noopener noreferrer">http://www.homestayhonson.vn</a>
                        </Paragraph>
                    </div>

                    {/* Contact Form Section */}
                    <div>
                        <Form
                            form={form}
                            name="contact"
                            onFinish={onFinish}
                            layout="vertical"
                        >
                            <Form.Item
                                name="name"
                                label="Tên"
                                rules={[{ required: true, message: 'Vui lòng nhập tên của bạn!' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Nhập tên" aria-label="Tên" />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email của bạn!' },
                                    { type: 'email', message: 'Vui lòng nhập một email hợp lệ!' }
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="Nhập Email" aria-label="Email" />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                label="Số điện thoại"
                            >
                                <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" aria-label="Số điện thoại" />
                            </Form.Item>

                            <Form.Item
                                name="message"
                                label="Tin nhắn"
                                rules={[{ required: true, message: 'Vui lòng nhập tin nhắn của bạn!' }]}
                            >
                                <TextArea
                                    placeholder="Nhập tin nhắn..."
                                    rows={4}
                                    aria-label="Tin nhắn"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="w-full">
                                    Gửi tin nhắn
                                </Button>
                            </Form.Item>                            
                        </Form>
                    </div>

                </div>
            </Card>
        </div>
    );
}
