const ApiError = require("../api-error");
const UserService = require("../services/user/user.service");
const MongoDB = require("../utils/mongodb.util");
const RoomService = require("../services/room/room.service");
const SectorService = require("../services/sector/sector.service");
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const Yup = require('yup');
const bcrypt = require("bcrypt");
const jwtMethod = require('../utils/jwt.util');
const useragent = require('express-useragent');
const transporter = require('../config/nodemailer');
const mailOptions = require('../utils/mailOptions.util');

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
        msg: "Tài khoản đã được tạo trước đó !"
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
      registeredUser = await userService.check({ "email": email });
    } else if (phone) {
      registeredUser = await userService.check({ "phone": phone });
    }

    if (!registeredUser || !registeredUser[0]) {
      return res.status(400).json({
        err: -1,
        msg: "Tài khoản không tồn tại!"
      });
    }

    const token = await userService.generateResetToken(registeredUser[0].email);

    const options = mailOptions(registeredUser[0].email, 'resetPassword', { token });

    await transporter.sendMail(options);

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
      msg: "Mật khẩu đã được thay đổi thành công!"
    });

  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình thay đổi mật khẩu!"));
  }
};

exports.changePassword = async (req, res, next) => {
  const { phone, oldPassword, newPassword } = req.body;
  console.log(req.body)
  try {
    if (!oldPassword || !newPassword || !phone) {
      return res.status(200).json({ err: 1, msg: "Thông tin không được để trống!" });
    }
    const userService = new UserService(MongoDB.client);
    const registeredUser = await userService.check({ "phone": phone });
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
    const infoUser = await userService.check({ "phone": req.body.phone })
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

  // console.log(req.body);
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
    idRoom: req.query.Room._id,
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
    statusOrder: req.query.infoOrder.statusOrder,
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


exports.cancleOrderRoom = async (req, res, next) => {
  const idUser = req.body.idUser;
  const idOrder = req.body.idOrder;
  // console.log(req.body.dateInput)
  // console.log(req.body)
  const payload = {
    idUser: idUser,
    idOrder: idOrder,
    dateOrderRoom: req.body.dateInput,
    idRoom: req.body.idRoom,
  }
  try {
    const roomService = new RoomService(MongoDB.client);
    const userService = new UserService(MongoDB.client);
    const result1 = await userService.CancleOrderRoomUser(payload)
    const result2 = await roomService.deleteDateRoom(payload)
    return res.send(result1)
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong truy xuat phòng !"));
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










