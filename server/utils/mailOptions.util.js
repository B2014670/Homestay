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
            context = { orderId: data.orderId };
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

// function mailOptions(to, type, data) {
//     let subject;
//     let text;
//     let html = ''; // Optional: use if you want to send HTML emails

//     switch (type) {
//         case 'orderConfirmation':
//             subject = 'Xác Nhận Đơn Hàng';
//             text = `Cảm ơn bạn đã đặt hàng! Mã đơn hàng của bạn là: ${data.orderId}.`;
//             html = `<p>Cảm ơn bạn đã đặt hàng! Mã đơn hàng của bạn là: <strong>${data.orderId}</strong>.</p>`;
//             break;

//         case 'resetPassword':
//             subject = 'Yêu Cầu Đặt Lại Mật Khẩu';
//             const resetUrl = `http://localhost:3000/resetmatkhau/${data.token}`;
//             text = `Bạn nhận được email này vì bạn (hoặc một người khác) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\n` +
//                 `Vui lòng nhấp vào liên kết sau đây, hoặc dán vào trình duyệt của bạn để hoàn tất quy trình:\n\n` +
//                 `${resetUrl}\n\n` +
//                 `Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.`;
//             html = `<p>Bạn nhận được email này vì bạn (hoặc một người khác) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>` +
//                 `<p>Vui lòng nhấp vào liên kết sau đây, hoặc dán vào trình duyệt của bạn để hoàn tất quy trình:</p>` +
//                 `<a href="${resetUrl}">${resetUrl}</a>` +
//                 `<p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>`;
//             break;

//         case 'promotion':
//             subject = 'Khuyến Mãi Đặc Biệt Dành Cho Bạn!';
//             text = `Đừng bỏ lỡ chương trình khuyến mãi đặc biệt của chúng tôi! Truy cập trang web của chúng tôi để biết thêm chi tiết.`;
//             html = `<p>Đừng bỏ lỡ chương trình khuyến mãi đặc biệt của chúng tôi! <a href="http://yourwebsite.com/promotions">Truy cập trang web của chúng tôi</a> để biết thêm chi tiết.</p>`;
//             break;

//         default:
//             subject = 'Thông Báo';
//             text = 'Bạn có một thông báo mới từ dịch vụ của chúng tôi.';
//             break;
//     }

//     const mailOptions = {
//         to,
//         from: process.env.EMAIL_USER,
//         subject,
//         text,
//     };

//     // Include HTML only if it's defined
//     if (html) {
//         mailOptions.html = html;
//     }

//     return mailOptions;
// }

// Export the function
module.exports = { sendEmail };
