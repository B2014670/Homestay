import React from 'react';
import { Form, Input, Button, Typography, Card } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

export default function Contact() {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log('Form values:', values);
        alert('Cảm ơn bạn đã gửi tin nhắn. Chúng tôi sẽ phản hồi bạn sớm!');
        form.resetFields();
    };

    return (
        <div className="container max-w-7xl mx-auto p-4">
            <Card className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Information Section */}
                    <div>
                        <Title level={2} className="text-center">HOMESTAY HON DON</Title>
                        <Paragraph>
                            <Text strong>Địa chỉ:</Text> ấp Thanh Bình, Xã Long Mỹ, Huyện Châu Thành, Kiên Giang
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Điện thoại:</Text> 0292 3333 333
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Email:</Text> homestayhondon@gmail.com
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Website:</Text> <a href="http://www.homestayhondon.vn" target="_blank" rel="noopener noreferrer">http://www.homestayhondon.vn</a>
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
                                rules={[{ required: true, message: 'Vui lòng nhập tên của bạn!' }]}>
                                <Input prefix={<UserOutlined />} placeholder="Nhập tên" aria-label="Tên" />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email của bạn!' },
                                    { type: 'email', message: 'Vui lòng nhập một email hợp lệ!' }
                                ]}>
                                <Input prefix={<MailOutlined />} placeholder="Nhập Email" aria-label="Email" />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                label="Số điện thoại">
                                <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" aria-label="Số điện thoại" />
                            </Form.Item>

                            <Form.Item
                                name="message"
                                label="Tin nhắn"
                                rules={[{ required: true, message: 'Vui lòng nhập tin nhắn của bạn!' }]}>
                                <TextArea placeholder="Nhập tin nhắn..." rows={4} aria-label="Tin nhắn" />
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
