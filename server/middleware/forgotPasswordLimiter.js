const rateLimit = require('express-rate-limit');

// Define the rate limit rule for the "Forgot Password" API
const forgotPasswordLimiter = rateLimit({
    windowMs: 60*1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per `window` (here, per minute)
    handler: (req, res) => {
        return res.status(429).json({
            err: -2,
            msg: 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau 1 phút.'
        });
    },
    headers: true, // Add rate limit info to the headers
});

module.exports = forgotPasswordLimiter;
