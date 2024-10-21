const dotenv = require('dotenv');
dotenv.config();

function mailOptions(to, type, data) {
    let subject;
    let text;
    let html = ''; // Optional: use if you want to send HTML emails

    switch (type) {
        case 'orderConfirmation':
            subject = 'Xác Nhận Đơn Hàng';
            text = `Cảm ơn bạn đã đặt hàng! Mã đơn hàng của bạn là: ${data.orderId}.`;
            html = `<p>Cảm ơn bạn đã đặt hàng! Mã đơn hàng của bạn là: <strong>${data.orderId}</strong>.</p>`;
            break;

        case 'resetPassword':
            subject = 'Yêu Cầu Đặt Lại Mật Khẩu';
            const resetUrl = `http://localhost:3000/resetmatkhau/${data.token}`;
            text = `Bạn nhận được email này vì bạn (hoặc một người khác) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\n` +
                `Vui lòng nhấp vào liên kết sau đây, hoặc dán vào trình duyệt của bạn để hoàn tất quy trình:\n\n` +
                `${resetUrl}\n\n` +
                `Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.`;
            html = `<p>Bạn nhận được email này vì bạn (hoặc một người khác) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>` +
                `<p>Vui lòng nhấp vào liên kết sau đây, hoặc dán vào trình duyệt của bạn để hoàn tất quy trình:</p>` +
                `<a href="${resetUrl}">${resetUrl}</a>` +
                `<p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>`;
            break;

        case 'promotion':
            subject = 'Khuyến Mãi Đặc Biệt Dành Cho Bạn!';
            text = `Đừng bỏ lỡ chương trình khuyến mãi đặc biệt của chúng tôi! Truy cập trang web của chúng tôi để biết thêm chi tiết.`;
            html = `<p>Đừng bỏ lỡ chương trình khuyến mãi đặc biệt của chúng tôi! <a href="http://yourwebsite.com/promotions">Truy cập trang web của chúng tôi</a> để biết thêm chi tiết.</p>`;
            break;

        default:
            subject = 'Thông Báo';
            text = 'Bạn có một thông báo mới từ dịch vụ của chúng tôi.';
            break;
    }

    const mailOptions = {
        to,
        from: process.env.EMAIL_USER,
        subject,
        text,
    };

    // Include HTML only if it's defined
    if (html) {
        mailOptions.html = html;
    }

    return mailOptions;
}

// Export the function
module.exports = mailOptions;
