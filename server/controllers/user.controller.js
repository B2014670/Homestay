const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const UserService = require("../services/user/user.service");
const RoomService = require("../services/room/room.service");
const SectorService = require("../services/sector/sector.service");
const RefundService = require("../services/payment/refund.service");
const WishlistService = require("../services/wishlist/wishlist.service");
const { ObjectId } = require("mongodb");
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const Yup = require('yup');
const bcrypt = require("bcrypt");
const jwtMethod = require('../utils/jwt.util');
const useragent = require('express-useragent');
const { sendEmail } = require('../utils/mailOptions.util');

// START USER
exports.register = async (req, res, next) => {

  try {
    const registerSchema = Yup.object({
      name: Yup.string()
        .min(2, 'Tên tài khoản quá ngắn!')
        .required('Vui lòng nhập tên tài khoản'),
      phone: Yup.string()
        .matches(/^[0-9]{10,}$/, 'Số điện thoại phải có ít nhất 10 số')
        .required('Vui lòng nhập số điện thoại'),
      email: Yup.string()
        .email('Email không hợp lệ')
        .required('Vui lòng nhập email'),
      address: Yup.string().required('Vui lòng nhập địa chỉ'),
      password: Yup.string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .required('Vui lòng nhập mật khẩu'),
    });

    // Clean phone input by removing all non-digit characters
    req.body.phone = req.body.phone.replace(/\D/g, '');
    await registerSchema.validate(req.body);

    const userService = new UserService(MongoDB.client);
    const registered = await userService.checkDuplicatePhone({ "phone": req.body.phone })

    if (registered) {
      return res.status(400).json({
        err: -1,
        msg: "Số điện thoại đã tạo tài khoản trước đó !"
      })
    }

    const newUser = await userService.create(req.body);

    if (!newUser) {
      return res.status(400).json({
        err: -1,
        msg: "Tạo tài khoản thất bại ",
      });
    }

    return res.status(200).json({
      err: 0, msg: "Tạo tài khoản thành công ",
    });
  } catch (error) {
    // Handle Yup validation errors
    if (error instanceof Yup.ValidationError) {
      return res.status(400).json({
        err: 1,
        msg: error.message,
      });
    }

    console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình Tạo tài khoản !"));
  }
};

exports.login = async (req, res, next) => {
  const { phone, password } = req.body;

  try {
    const loginSchema = Yup.object({
      phone: Yup.string()
        .required('Số điện thoại không được để trống')
        .matches(/^[0-9]{10,}$/, 'Số điện thoại phải có ít nhất 10 chữ số'),
      password: Yup.string()
        .required('Mật khẩu không được để trống')
        .min(6, 'Mật khẩu phải ít nhất 6 ký tự'),
    });

    // Clean phone input by removing all non-digit characters
    req.body.phone = req.body.phone.replace(/\D/g, '');
    await loginSchema.validate(req.body);

    const userService = new UserService(MongoDB.client);
    const user = await userService.fineOne({ "phone": req.body.phone })

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({
        err: -1,
        msg: "Nhập sai tài khoản hoặc mật Khẩu!"
      });
    }

    // Generate Tokens
    const accessToken = await jwtMethod.generateToken(
      { phone: user.phone },
      process.env.ACCESS_TOKEN_SECRET,
      process.env.ACCESS_TOKEN_LIFE
    );
    if (!accessToken) {
      return res.status(400).json('Đăng nhập không thành công, vui lòng thử lại.');
    }

    const refreshToken = await jwtMethod.generateToken(
      { phone: user.phone },
      process.env.REFRESH_TOKEN_SECRET,
      process.env.REFRESH_TOKEN_LIFE
    );

    const data = await userService.updateRefreshToken(user._id, refreshToken);

    const result = {
      err: 0,
      msg: "Đăng nhập thành công !",
      data: {
        user: data,
        accessToken: accessToken,
        refreshToken: refreshToken,
      }
    }
    return res.status(200).json(result)

  } catch (error) {
    // Handle Yup validation errors
    if (error instanceof Yup.ValidationError) {
      return res.status(400).json({
        err: 1,
        msg: error.message,
      });
    }

    console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình đăng nhập vào hệ thống !"));
  }
};

exports.checkEmailLinked = async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ err: 1, msg: "Thông tin không được để trống !" })
    }
    const userService = new UserService(MongoDB.client);
    const user = await userService.fineOne({ "email": req.body.email, "oauth": "google" })

    if (user) {
      return res.json(true);
    } else {
      return res.json(false);
    }

  } catch (error) {
    console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình đăng nhập vào hệ thống !"));
  }
};

exports.oauthLogin = async (req, res, next) => {
  const { phone, email, name, img } = req.body;

  try {
    let flag = false;
    if (!email || !name || !img || (!phone && req.body.phone !== undefined)) {
      return res.status(400).json({ err: 1, msg: "Thông tin không được để trống !" })
    }
    const userService = new UserService(MongoDB.client);

    let user = await userService.fineOne({ "email": req.body.email });

    if (user && user.oauth !== "google") {
      return res.status(400).json({
        err: -1,
        msg: "Email đã dùng cho phương thức đăng nhập khác!",
      });
    }

    if (!user && phone) {
      user = await userService.fineOne({ "phone": req.body.phone });

      if (user && user.oauth !== "google") {
        return res.status(400).json({
          err: -1,
          msg: "Số điện thoại đã dùng cho phương thức đăng nhập khác!",
        });
      }

      if (user === null) {
        const status = await userService.create(req.body);
        flag = true;
        if (!status) {
          flag = false;
          return res.status(400).json({
            err: -1,
            msg: "Tạo tài khoản thất bại ",
          });
        }

        user = await userService.fineOne({ "phone": req.body.phone });
      }
    }

    // Generate Tokens
    const accessToken = await jwtMethod.generateToken(
      { phone: user.phone },
      process.env.ACCESS_TOKEN_SECRET,
      process.env.ACCESS_TOKEN_LIFE
    );
    if (!accessToken) {
      return res.status(400).json('Đăng nhập không thành công, vui lòng thử lại.');
    }

    const refreshToken = await jwtMethod.generateToken(
      { phone: user.phone },
      process.env.REFRESH_TOKEN_SECRET,
      process.env.REFRESH_TOKEN_LIFE
    );

    const data = await userService.updateRefreshToken(user._id, refreshToken);

    const result = {
      err: 0,
      msg: flag ? "Liên kết thành công" : "Đăng nhập thành công !",
      data: {
        user: data,
        accessToken: accessToken,
        refreshToken: refreshToken,
      }
    }
    return res.status(200).json(result)

  } catch (error) {
    console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình đăng nhập vào hệ thống !"));
  }
};

exports.validateToken = async (req, res, next) => {
  const accessToken = req.headers['authorization']?.split(' ')[1] || req.cookies['accessToken'];

  if (!accessToken) {
    return res.status(400).json({ err: 1, msg: 'Token không được để trống.' });
  }

  try {
    const verified = await jwtMethod.verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET);

    if (!verified) {
      return res.status(401).json({ err: 1, msg: 'Access token sai hoặc đã hết hạn hết hạn' });
    }

    const userService = new UserService(MongoDB.client);
    const user = await userService.getInfoUser(
      { "phone": verified.payload.phone },
    );

    if (!user) {
      return res.status(404).json({ err: -1, msg: 'Không tìm thấy người dùng.' });
    }
    return res.status(200).json({
      err: 0,
      msg: 'Token hợp lệ.',
      data: {
        user: user,
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình xác thực token !"));
  }
}

exports.refreshToken = async (req, res, next) => {
  // Lấy access token từ header 
  const accessTokenFromHeader = req.headers['authorization']?.split(' ')[1] || req.cookies['accessToken'];

  if (!accessTokenFromHeader) {
    return res.status(400).json({ err: 1, msg: 'Không tìm thấy access token.' });
  }

  // Lấy refresh token từ body
  const refreshTokenFromBody = req.body.refreshToken || req.cookies['refreshToken'];
  if (!refreshTokenFromBody) {
    return res.status(400).json({ err: 1, msg: 'Không tìm thấy refresh token.' });
  }

  try {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
    const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE;

    // Decode access token đó
    const decoded = await jwtMethod.decodeToken(accessTokenFromHeader, accessTokenSecret);
    if (!decoded) {
      return res.status(400).json({ err: 1, msg: 'Access token không hợp lệ.' });
    }

    // Decode refresh token đó
    const verified = await jwtMethod.verifyToken(refreshTokenFromBody, refreshTokenSecret);
    if (!verified) {
      return res.status(400).json({ err: 1, msg: 'Refresh token không hợp lệ.' });
    }

    const phone = verified.payload.phone;
    const userService = new UserService(MongoDB.client);
    const user = await userService.fineOne({ "phone": phone });

    if (!user) {
      return res.status(404).json({ err: 1, msg: 'User không tồn tại.' });
    }

    if (refreshTokenFromBody !== user.refreshToken) {
      return res.status(400).json({ err: 1, msg: 'Refresh token không hợp lệ.' });
    }

    // Tạo access token mới
    const newAccessToken = await jwtMethod.generateToken({ phone: phone }, accessTokenSecret, accessTokenLife);
    if (!newAccessToken) {
      return res.status(400).send('Tạo access token không thành công, vui lòng thử lại.');
    }

    // Tạo refresh token mới
    const newRefreshToken = await jwtMethod.generateToken({ phone: phone }, refreshTokenSecret, refreshTokenLife);
    if (!newRefreshToken) {
      return res.status(400).send('Tạo refresh token không thành công, vui lòng thử lại.');
    }

    await userService.updateRefreshToken(user._id, newRefreshToken);


    return res.json({
      err: 0,
      msg: 'Cấp lại token thành công.',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }
    });
  } catch (error) {
    console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình cấp lại token !"));
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { phone, email } = req.body;

  try {
    const userService = new UserService(MongoDB.client);

    if (email) {
      registeredUser = await userService.check({ "email": email }, { order: 0, refreshToken: 0 });
    } else if (phone) {
      registeredUser = await userService.check({ "phone": phone }, { order: 0, refreshToken: 0 });
    }

    if (!registeredUser || !registeredUser[0]) {
      return res.status(400).json({
        err: -1,
        msg: "Tài khoản không tồn tại!"
      });
    }

    const token = await userService.generateResetToken(registeredUser[0].email);

    await sendEmail(registeredUser[0].email, 'resetPassword', { token });

    return res.status(200).json({
      err: 0,
      msg: "Email đặt lại mật khẩu đã được gửi, vui lòng kiểm tra email!"
    });

  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình thay đổi mật khẩu!"));
  }
};

exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const userService = new UserService(MongoDB.client);
    const response = await userService.resetPassword(token, newPassword);

    if (!response) {
      return res.status(400).json({
        err: -1,
        msg: "Token không hợp lệ hoặc đã hết hạn!"
      });
    }

    return res.status(200).json({
      err: 0,
      msg: "Mật khẩu đã được đặt lại thành công!"
    });

  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình đặt lại mật khẩu!"));
  }
};

exports.changePassword = async (req, res, next) => {
  const { phone, oldPassword, newPassword } = req.body;
  try {
    if (!oldPassword || !newPassword || !phone) {
      return res.status(200).json({ err: 1, msg: "Thông tin không được để trống!" });
    }
    const userService = new UserService(MongoDB.client);
    const registeredUser = await userService.check({ "phone": phone }, { order: 0, refreshToken: 0 });
    // console.log(registeredUser[0])
    if (!registeredUser[0]) {
      return res.status(200).json({
        err: -1,
        msg: "Tài khoản không tồn tại!"
      });
    } else {
      const isCorrect = bcrypt.compareSync(oldPassword, registeredUser[0].password)
      // console.log(isCorrect)
      if (isCorrect) {
        // Tiến hành cập nhật mật khẩu mới tại đây
        const updateResult = await userService.updatePassword(req.body);
        if (updateResult) {
          return res.status(200).json({
            err: 0,
            msg: "Thay đổi mật khẩu thành công!"
          });
        } else {
          return res.status(200).json({
            err: -1,
            msg: "Không thể cập nhật mật khẩu!"
          });
        }
      } else {
        return res.status(200).json({
          err: -1,
          msg: "Sai mật khẩu cũ!"
        });
      }
    }
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình thay đổi mật khẩu!"));
  }
};



exports.infoUser = async (req, res, next) => {
  // console.log(req)
  try {
    const userService = new UserService(MongoDB.client);
    const infoUser = await userService.check({ "phone": req.body.phone }, { order: 0, refreshToken: 0 })
    // console.log(infoUser)
    return res.send(infoUser[0])
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình đăng nhập vào hệ thống !"));
  }
};

exports.updateInfoUser = async (req, res, next) => {

  try {

    const userService = new UserService(MongoDB.client);
    const result = await userService.updateInfoUser(req.body)

    return res.send({
      "status": "1",
      "msg": "Cập nhật thông tin tài khoản thành công !"
    })
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong truy xuat phòng !"));
  }
};
// END USER


// // START ROOM
exports.searchRoom = async (req, res, next) => {

  try {
    const roomService = new RoomService(MongoDB.client);
    const { totalRooms, paginatedRooms } = await roomService.searchRoom(req.body);

    return res.send({
      totalRooms,
      paginatedRooms
    })
  } catch (error) {
    console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình truy xuất tất cả phòng !"));
  }
};
exports.getAllRoom = async (req, res, next) => {

  try {
    const roomService = new RoomService(MongoDB.client);
    const allRoom = await roomService.check()
    return res.send(allRoom)
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình truy xuất tất cả phòng !"));
  }
};

exports.orderRoom = async (req, res, next) => {
  const idv4 = uuidv4();
  const room = {
    idRoom: req.query.Room?._id ?? req.query.infoOrder.idRoom,
    dateOrderRoom: req.query.infoOrder.dateInput,
  }
  console.log(req.query.infoOrder)
  const infoOrder = {
    idUser: req.query.infoOrder.idUser,
    userInput: req.query.infoOrder.userInput,
    phoneInput: req.query.infoOrder.phoneInput,
    idRoom: req.query.infoOrder.idRoom,
    dateInput: req.query.infoOrder.dateInput,
    totalMoney: req.query.infoOrder.totalMoney,
    pay: req.query.infoOrder.pay,
    paymentMethod: req.query.infoOrder.paymentMethod,
    transactionId: req.query.infoOrder.transactionId || null,
    deposit: req.query.infoOrder.deposit || 0,
    statusOrder: req.query.infoOrder.statusOrder,
    extraServices: req.query.infoOrder.extraServices || null,
    idOrder: idv4
  }
  const user = {
    info: infoOrder,
  }
  // console.log(req.query)
  try {
    const userService = new UserService(MongoDB.client);
    const roomService = new RoomService(MongoDB.client);
    const result1 = await roomService.OrderRoom(room)
    const result2 = await userService.OrderRoomUser(user)
    return res.send(result2)
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình đặt phòng !"));
  }
};


exports.getInfoRoom = async (req, res, next) => {

  // console.log(req.body)
  try {

    const roomService = new RoomService(MongoDB.client);
    const result1 = await roomService.checkByIdRoom(req.body)

    return res.send(result1)
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong truy xuat phòng !"));
  }
};

exports.getRoomWithSector = async (req, res, next) => {
  try {
    const roomService = new RoomService(MongoDB.client);
    const roomId = ObjectId.isValid(req.body.idRoom) ? new ObjectId(req.body.idRoom) : req.body.idRoom;

    const result1 = await roomService.check({ "_id": roomId })

    return res.send(result1[0])
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Xảy ra lỗi trong truy xuất thông tin phòng!"));
  }
};

exports.cancelOrderRoom = async (req, res, next) => {
  const payload = {
    idUser: req.body.idUser,
    idOrder: req.body.idOrder,
  }
  try {
    const roomService = new RoomService(MongoDB.client);
    const userService = new UserService(MongoDB.client);
    const refundService = new RefundService(MongoDB.client);

    // Step 1: Cancel the user's order
    const orderResult = await userService.CancelOrderRoomUser(payload)
    if (!orderResult) {
      return res.status(400).json({
        err: -1,
        msg: 'Không tìm thấy đơn hàng hoặc không thể cập nhật!',
      });
    }

    // Step 2: Delete the room booking dates
    const roomResult = await roomService.deleteDateRoom(orderResult.order[0])

    // Step 3: If there is a transaction ID, perform the refund
    if (orderResult.order[0].transactionId) {
      const refundResult = await refundService.refundTransaction(orderResult.order[0].transactionId);
      if (refundResult.status === 'COMPLETED') {
        // Update refund status
        await userService.updateRefundStatus(orderResult.idUser, orderResult.order[0].idOrder, "true");
      } else {
        await userService.updateRefundStatus(orderResult.idUser, orderResult.order[0].idOrder, "false");
      }
    }

    return res.status(200).json({
      err: 0,
      msg: 'Đã cập nhật!',
      data: orderResult
    });
  } catch (error) {
    console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong hủy phòng !"));
  }
};


exports.updatePaypalOrder = async (req, res, next) => {
  const idUser = req.body.idUser;
  const idOrder = req.body.idOrder;
  // console.log(req.body)
  const payload = {
    idUser: idUser,
    idOrder: idOrder,
  }
  try {

    const userService = new UserService(MongoDB.client);
    const result1 = await userService.PayOrder(payload)

    return res.send(result1)
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong truy xuat phòng !"));
  }
};

exports.getInfoSector = async (req, res, next) => {

  // console.log(req.body)
  try {

    const sectorService = new SectorService(MongoDB.client);
    const result1 = await sectorService.checkByIdSector(req.body)
    // console.log(result1)
    return res.send(result1[0])
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong truy xuat Khu vực!"));
  }
};

exports.getAllSector = async (req, res, next) => {
  try {
    const sectorService = new SectorService(MongoDB.client);
    const data = await sectorService.check();
    const result = {
      sectors: data,
      length: data.length,
    }
    if (result) {
      return res.status(200).json(result);
    } else {
      return res.send("Đã xảy ra lỗi")
    }

  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình truy xuat khu vực !"));
  }
};

exports.createWishlist = async (req, res, next) => {
  try {
    const wishlistService = new WishlistService(MongoDB.client);
    const result = await wishlistService.createWishlist(req.body);

    if (!result.success) {
      return res.status(400).json({
        err: -1,
        msg: result.message,
      });
    }

    return res.status(200).json({
      err: 0, msg: "Lưu vào yêu thích thành công",
    });
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình lưu yêu thích!"));
  }
}

exports.getUserWishlist = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const wishlistService = new WishlistService(MongoDB.client);
    const items = await wishlistService.getWishlistByUserId(userId);

    return res.status(200).json({
      err: 0, msg: "Lấy danh sách yêu thích thành công",
      data: items,
    });
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi truy xuất danh sách yêu thích của người dùng."));
  }
}

exports.getUserWishlistRooms = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const wishlistService = new WishlistService(MongoDB.client);
    const items = await wishlistService.getWishlistRoomsByUserId(userId);

    return res.status(200).json({
      err: 0, msg: "Lấy danh sách phòng yêu thích thành công",
      data: items,
    });
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi truy xuất danh sách yêu thích của người dùng."));
  }
}

exports.updateWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const wishlistService = new WishlistService(MongoDB.client);
    const updatedItem = await wishlistService.updateWishlist(id, req.body);
    return res.status(200).json({
      err: 0, msg: "Sửa yêu thích thành công!"
    });
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi cập nhật danh sách yêu thích của người dùng."));
  }
}

exports.deleteWishlist = async (req, res, next) => {
  try {
    const wishlistService = new WishlistService(MongoDB.client);
    const result = await wishlistService.deleteWishlist(req.body);

    if (!result) {
      return res.status(400).json({
        err: -1,
        msg: "Không tìm thấy yêu thích!",
      });
    }
    return res.status(200).json({
      err: 0, msg: "Xoá yêu thích thành công!"
    });
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi xoá yêu thích của người dùng."));

  }
}

exports.createComment = async (req, res, next) => {
  const idv4 = uuidv4();
  const { idUser, idOrder, idRoom, rating, text } = req.body;

  const infoComment = {
    idComment: idv4,
    idUser,
    idOrder,
    idRoom,
    rating,
    text,
    createdDate: new Date(),
    updatedDate: null,
    isDeleted: false,
  };

  try {
    const userService = new UserService(MongoDB.client);
    const roomService = new RoomService(MongoDB.client);

    const isSuccess = await userService.verifyOrderSuccess(idUser, idOrder);

    if (!isSuccess) {
      return res.status(400).json({
        err: -1,
        msg: "Không tìm thấy đơn hàng hoàn thành!",
      });
    }

    const result = await roomService.addComment(infoComment);

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        err: -1,
        msg: "Đơn hàng này đã được bình luận trước đó.",
      });
    }

    return res.status(200).json({
      err: 0,
      msg: "Bình luận đã được thêm thành công!",
      data:
      {
        idComment: idv4,
      },
    });
  } catch (err) {
    console.error(err);
    return next(new ApiError(500, "Đã có lỗi xảy ra trong quá trình thêm bình luận."));
  }
}

exports.updateComment = async (req, res, next) => {
  const { idUser, idComment, rating, text } = req.body;

  try {
    const roomService = new RoomService(MongoDB.client);

    const comment = await roomService.getCommentsById(idComment);

    if (!comment) {
      return res.status(404).json({
        err: -1,
        msg: "Không tìm thấy bình luận.",
      });
    }

    if (comment?.idUser.toString() !== idUser) {
      return res.status(403).json({
        err: -1,
        msg: "Bạn không có quyền cập nhật bình luận này.",
      });
    }

    const result = await roomService.updateComment({
      idRoom: comment.idRoom,
      idComment: comment.idComment,
      rating,
      text
    });

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        err: -1,
        msg: "Bình luận đã được cập nhật trước đó.",
      });
    }

    return res.status(200).json({
      err: 0,
      msg: "Bình luận đã được cập nhật thành công!",
    });
  } catch (err) {
    console.error(err);
    return next(new ApiError(500, "Đã có lỗi xảy ra trong quá trình cập nhật bình luận."));
  }
}

exports.softDeleteComment = async (req, res, next) => {
  const { idUser, idComment } = req.body;

  try {
    const roomService = new RoomService(MongoDB.client);

    const comment = await roomService.getCommentsById(idComment);

    if (!comment) {
      return res.status(404).json({
        err: -1,
        msg: "Không tìm thấy bình luận.",
      });
    }

    if (comment.idUser.toString() !== idUser) {
      return res.status(403).json({
        err: -1,
        msg: "Bạn không có quyền xoá bình luận này.",
      });
    }

    const result = await roomService.deleteComment({ 
      idRoom: comment.idRoom, 
      idComment 
    });

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        err: -1,
        msg: "Bình luận không thể xóa.",
      });
    }

    return res.status(200).json({
      err: 0,
      msg: "Bình luận đã được đánh dấu là đã xóa thành công!",
    });
  } catch (err) {
    console.error(err);
    return next(new ApiError(500, "Đã có lỗi xảy ra trong quá trình đánh dấu xóa bình luận."));
  }
};

exports.getAllCommentOfUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const userService = new UserService(MongoDB.client);
    const roomService = new RoomService(MongoDB.client);

    const result = await userService.getInfoUser({ _id: ObjectId.isValid(userId) ? new ObjectId(userId) : null });

    if (!result) {
      return res.status(400).json({
        err: -1,
        msg: "Không tìm thấy người dùng!",
      });
    }
    const comments = await roomService.getCommentsByUser(userId);

    return res.status(200).json({
      err: 0,
      msg: "Danh sách bình luận của người dùng.",
      data: comments
    });
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Đã có lỗi xảy ra trong quá trình lấy bình luận của người dùng."));
  }
}

exports.getAllCommentOfRoom = async (req, res, next) => {
  const { roomId } = req.params;
  try {
    const roomService = new RoomService(MongoDB.client);

    const comments = await roomService.getCommentsByRoom(roomId);

    return res.status(200).json({
      err: 0,
      msg: "Danh sách bình luận",
      data: comments
    });
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Đã có lỗi xảy ra trong quá trình lấy bình luận."));
  }
}

exports.getOneComment = async (req, res, next) => {
  const { id } = req.params;
  try {
    const roomService = new RoomService(MongoDB.client);

    const comment = await roomService.getCommentsById(id);



    return res.status(200).json({
      err: 0,
      msg: "Dữ liệu bình luận",
      data: comment
    });
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Đã có lỗi xảy ra trong quá trình lấy bình luận."));
  }
}

exports.getAllOrderOfUser = async (req, res, next) => {

  try {
    const userService = new UserService(MongoDB.client);
    const result = await userService.getAllOrderOfUser(req.params);

    if (!result) {
      return res.status(400).json({
        err: -1,
        msg: "Không tìm thấy lịch sử đặt phòng nào!",
      });
    }
    return res.status(200).json({
      err: 0, msg: "Truy xuất lịch sử đặt phòng thành công!",
      data: result,
    });
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi xoá yêu thích của người dùng."));

  }
}

exports.getOneOrderOfUserById = async (req, res, next) => {

  try {
    const userService = new UserService(MongoDB.client);
    const result = await userService.getOneOrderOfUserById(req.params);

    if (!result) {
      return res.status(400).json({
        err: -1,
        msg: "Không tìm thấy lịch sử đặt phòng nào!",
      });
    }
    return res.status(200).json({
      err: 0, msg: "Truy xuất lịch sử đặt phòng thành công!",
      data: result,
    });
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi xoá yêu thích của người dùng."));

  }
}