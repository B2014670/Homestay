const transporter = require('../config/nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

function compileTemplate(templateName) {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf-8');
    return handlebars.compile(source);
}
function generateMailOptions(to, type, data) {
    let subject;
    let template;
    let context;

    switch (type) {
        case 'orderConfirmation':
            subject = 'Xác Nhận Đơn Hàng';
            template = 'orderConfirmation';
            context = { 
                orderId: data.idOrder,
                userInput: data.userInput,
                phoneInput: data.phoneInput,
                idRoom: data.idRoom,
                dateInput: data.dateInput.length === 2 ? data.dateInput.join(' đến ') : 'Invalid dates', // Combine start and end dates
                totalMoney: data.totalMoney,
                pay: data.pay === "true" ? 'Đã thanh toán' : 'Chưa thanh toán',
                paymentMethod: data.paymentMethod,
                transactionId: data.transactionId || 'Chưa có',
                deposit: data.deposit,
                statusOrder: data.statusOrder === '1' ? 'Chưa xác nhận' : 'Đã xác nhận',
                extraServices: data.extraServices.length > 0 ? data.extraServices[0] : 'Không có',
                serviceType: data.extraServices.length > 0 ? data.extraServices[0].serviceType : 'Không có',
                guests: data.extraServices.length > 0 ? data.extraServices[0].guests : 'Không có',
                dates: data.extraServices.length > 0 ? data.extraServices[0].dates.join(', ') : 'Không có', // Join the dates into a string
                pricePerUnit: data.extraServices.length > 0 ? data.extraServices[0].pricePerUnit : 'Không có',
                totalServiceCost: data.extraServices.length > 0 ? data.extraServices[0].totalServiceCost : 'Không có'
            };
            break;

        case 'resetPassword':
            subject = 'Yêu Cầu Đặt Lại Mật Khẩu';
            template = 'resetPassword';
            context = { resetUrl: `http://localhost:3000/resetmatkhau/${data.token}` };
            break;

        case 'promotion':
            subject = 'Khuyến Mãi Đặc Biệt Dành Cho Bạn!';
            template = 'promotion';
            context = {};
            break;

        default:
            subject = 'Thông Báo';
            text = 'Bạn có một thông báo mới từ dịch vụ của chúng tôi.';
            break;
    }

    const compiledTemplate = compileTemplate(template);
    const html = compiledTemplate(context);

    return {
        to,
        from: process.env.EMAIL_USER,
        subject,
        html,
    };
}

async function sendEmail(to, type, data) {
    try {
        const mailOptions = generateMailOptions(to, type, data);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email: ', error);
        throw error;
    }
}

// Export the function
module.exports = { sendEmail };
