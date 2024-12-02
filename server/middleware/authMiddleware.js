const jwtMethod = require('../utils/jwt.util'); 
const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const UserService = require("../services/user/user.service");
exports.authMiddleware = async (req, res, next) => {
  const accessToken =
    req.headers["authorization"]?.split(" ")[1] || req.cookies["accessToken"];

  if (!accessToken) {
    return res
      .status(400)
      .json({ err: 1, msg: "Token không được để trống." });
  }

  try {
    // Verify the access token
    const verified = await jwtMethod.verifyToken(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (!verified) {
      return res.status(401).json({
        err: 1,
        msg: "Access token sai hoặc đã hết hạn.",
      });
    }

    // Fetch the user information based on the verified payload
    const userService = new UserService(MongoDB.client);
    const user = await userService.getInfoUser({
      phone: verified.payload.phone,
    });

    if (!user) {
      return res
        .status(404)
        .json({ err: -1, msg: "Không tìm thấy người dùng." });
    }

    // Attach user information to the request object for later use
    req.body.phone = verified.payload.phone;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Token validation error:", error);
    return next(
      new ApiError(500, "Xảy ra lỗi trong quá trình xác thực token!")
    );
  }
};