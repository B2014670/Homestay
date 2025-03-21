const ApiError = require("../api-error");
const AdminService = require("../services/admin/admin.service");
const SectorService = require("../services/sector/sector.service");
const RoomService = require("../services/room/room.service");
const UserService = require("../services/user/user.service");
const ExtraServiceService = require("../services/extraservice/extraservice.service");
const MongoDB = require("../utils/mongodb.util");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const multer = require("multer");
const RefundService = require("../services/payment/refund.service");

// Admin
exports.register = async (req, res, next) => {
  const { username, password, phone } = req.body;
  // console.log(req.body)
  try {
    if (!username || !password || !phone) {
      return res.status(200).json({ err: 1, msg: "Thông tin không được để trống !" })
    }
    const adminService = new AdminService(MongoDB.client);
    const isRegisted = await adminService.check({ "phone": req.body.phone })
    // console.log(isRegisted)
    if (isRegisted != 0) {
      return res.send(200, {
        err: -1,
        msg: "Tài khoản đã được tạo trước đó !"
      })
    }
    else {
      const document = await adminService.register(req.body);
      return res.status(200).json({
        err: 0, msg: "Tạo tài khoản thành công ",
        data: document
      });
    }
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình Tạo tài khoản !"));
  }
};

exports.login = async (req, res, next) => {
  // console.log(req.body)
  const { username, password } = req.body;
  try {
    if (!password || !username) {
      return res.status(200).json({ err: 1, msg: "Thông tin không được để trống !" })
    }
    const adminService = new AdminService(MongoDB.client);
    const isRegisted = await adminService.check({ "phone": req.body.username })

    if (!isRegisted[0]) {
      return res.status(200).json({
        err: -1,
        msg: " Tài khoản không tồn tại !"
      });
    }
    else {      
      if (bcrypt.compareSync(password, isRegisted[0].password))  { //(password === isRegisted[0].password)
        const { password, ...adminWithoutPassword } = isRegisted[0];

        return res.status(200).json({
          err: 0,
          msg: "Đăng Nhập thành Công",
          admin: adminWithoutPassword
        });
      }
      else
        return res.status(200).json({
          err: -1,
          msg: " Sai mật khẩu hoặc tài khoản !"
        });
    }

  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình đăng nhập vào hệ thống !"));
  }
};

exports.getAllAdmin = async (req, res, next) => {
  try {
    const adminService = new AdminService(MongoDB.client);
    const data = await adminService.check({ "phone" : {$ne :"0000000001"}}, { password: 0 });
    const result = {
      admins: data,
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

exports.infoAdmin = async (req, res, next) => {
  console.log(req.body)
  try {
    const adminService = new AdminService(MongoDB.client);
    const infoAdmin = await adminService.check({ "phone": req.body.phone })
    // console.log(infoUser)
    return res.send(infoAdmin[0])
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình đăng nhập vào hệ thống !"));
  }
};

exports.deleteAdmin = async (req, res, next) => {
  // console.log(req.body)
  try {
    const adminService = new AdminService(MongoDB.client);
    const result = await adminService.deleteAdmin(req.body)
    // const result = await adminService.deleteAdmin(req.body);
    // console.log(result)
    if (result.deletedCount === 0) {
      return res.status(200).json({
        status: -1,
        data: result,
        msg: "Không tìm thấy admin để xóa.!"
      });

    }
    if (result) {
      return res.status(200).json({
        status: 1,
        data: result,
        msg: "Xóa tài khoản quản trị viên thành công !"
      });
    }
    else {
      return res.status(200).json("code lỗi");
    }
  } catch (error) {
    console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình xóa tài khoản quản trị viên !"));
  }
};

exports.addAdmin = async (req, res, next) => {
  // console.log(req.body)
  try {
    const adminService = new AdminService(MongoDB.client);
    const phone = await adminService.check({ "phone": req.body.phone });

    if (phone.length > 0) {
      return res.status(200).json({
        status: -1,
        msg: "Tài khoản quản trị viên đã tồn tại !"
      });
    }


    const result = await adminService.addAdmin(req.body);
    if (result) {
      return res.status(200).json({
        status: 0,
        msg: "Tạo Tài khoản quản trị viên Thành Công !",
        data: result,
      });
      // return res.status(200).json(result);
    }
    else {
      return res.send("Đã xảy ra lỗi")
    }

  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình tạo account admin !"));
  }
};

exports.editAdmin = async (req, res, next) => {
  // console.log(req.body)
  try {
    const adminService = new AdminService(MongoDB.client);
    const result = await adminService.EditAdmin(req.body)

    if (result) {
      return res.status(200).json({
        status: 1,
        data: result,
        msg: "Thay đổi tài khoản quản trị viên thành công !"
      });
    }
    else {
      return res.status(200).json("code lỗi");
    }
  } catch (error) {
    console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình xóa tài khoản quản trị viên !"));
  }
};

// Sector
exports.addSector = async (req, res, next) => {
  // console.log(req.body)
  // console.log(req.file);
  try {

    const sectorService = new SectorService(MongoDB.client);
    const isInvalids = await sectorService.check({ "nameSector": req.body.nameSector });
    if (isInvalids.length > 0) return res.send({ status: 1, msg: "Đã tồn tại khu vực có cùng tên !" })
    if (isInvalids.length == 0) {
      const input = {
        nameSector: req.body.nameSector,
        discSector: req.body.discSector,
        noteSector: req.body.noteSector,
        imgSector: req.file
      }
      console.log(input)
      const result = await sectorService.addSectorService(input)
      return res.send({
        status: 0, msg: "Tạo Khu vực thành công !"
      })
    }
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình tạo khu vực !"));
  }
};

exports.addSector = async (req, res, next) => {
  // console.log(req.body)

  try {
    const sectorService = new SectorService(MongoDB.client);
    const result = await sectorService.addSector(req.body);
    if (result) {
      return res.status(200).json(result);
    }
    else {
      return res.send("Đã xảy ra lỗi")
    }

  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình tạo phong !"));
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

exports.getInfoSector = async (req, res, next) => {

  // console.log("req.body")
  try {

    const sectorService = new SectorService(MongoDB.client);
    const result1 = await sectorService.checkByIdSector(req.body)

    return res.send(result1[0])
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong truy xuat Khu vực!"));
  }
};

exports.addRoomInSector = async (req, res, next) => {

  console.log(req.body)
  try {

    const sectorService = new SectorService(MongoDB.client);
    const result1 = await sectorService.addOneRoomInSector(req.body)

    return res.send(result1)
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong truy xuat Khu vực!"));
  }
};


exports.editSector = async (req, res, next) => {

  // console.log(req.body)
  try {

    const sectorService = new SectorService(MongoDB.client);
    const result1 = await sectorService.EditSector(req.body)

    return res.send(result1)
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong truy xuat Khu vực!"));
  }
};

exports.deleteSector = async (req, res, next) => {

  // console.log(req.body)
  try {

    const sectorService = new SectorService(MongoDB.client);
    const data = await sectorService.DeleteSector(req.body)
    const result = {
      status: 0,
      data: data,
    }
    return res.send(result)
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong truy xuat Khu vực!"));
  }
};


// Room
exports.addRoom = async (req, res, next) => {
  // console.log(req.body.idSectorRoom)

  try {
    const inputData = {
      nameRoom: req.body.nameRoom,
      idSectorRoom: req.body.idSectorRoom,
      discRoom: req.body.discRoom,
      giaRoom: req.body.giaRoom,
      loaiRoom: req.body.loaiRoom,
      imgRoom: req.body.imgRoom
    }

    const sectorService = new SectorService(MongoDB.client);
    const roomService = new RoomService(MongoDB.client);
    const result1 = await sectorService.addOneRoomInSector({ "idSector": inputData.idSectorRoom })
    const result = await roomService.addRoom(inputData);
    if (result1) {
      return res.status(200).json(result1);
    }
    if (result) {
      return res.status(200).json("result");
    }
    else {
      return res.send("Đã xảy ra lỗi")
    }

  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình tạo phong !"));
  }
};

exports.deleteRoom = async (req, res, next) => {
  // console.log(req.body)
  try {
    const roomService = new RoomService(MongoDB.client);
    const room = await roomService.checkByIdRoom({ "idRoom": req.body._id })
    const result = await roomService.deleteRoom({ _id: room[0]._id });
    if (result.deletedCount > 0) {

      try {
        const sectorService = new SectorService(MongoDB.client);
        const updateSectorResult = await sectorService.deleteOneRoomInSector({ "idSector": room[0].idSectorRoom });

        if (!updateSectorResult) {
          console.error("Failed to update totalRoomInSector");
          return res.status(200).json({
            status: 1,
            msg: "Xóa phòng thành công, nhưng không thể cập nhật số lượng phòng trong khu vực.",
          });
        }
      } catch (sectorError) {
        console.error(sectorError);
        return res.status(500).json({
          status: 1,
          msg: "Xóa phòng thành công, nhưng xảy ra lỗi khi cập nhật khu vực.",
        });
      }

      return res.status(200).json({
        status: 0,
        msg: "Xóa phòng thành công!"
      });
    }
    else {
      return res.status(200).json("code lỗi");
    }

  } catch (error) {
    console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình xóa phòng!"));
  }
};

exports.editRoom = async (req, res, next) => {
  // console.log(req.body)
  try {
    const roomService = new RoomService(MongoDB.client);
    const result = await roomService.EditRoom(req.body)

    if (result) {
      return res.status(200).json({
        status: 1,
        data: result,
        msg: "Thay đổi thông tin phòng thành công !"
      });
    }
    else {
      return res.status(200).json({
        status: 0,
        data: result,
        msg: "Thay đổi thông tin phòng không thành công !"
      });
    }
  } catch (error) {
    console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình cật nhật thông tin phòng !"));
  }
};

exports.getAllRoom = async (req, res, next) => {
  try {
    const roomService = new RoomService(MongoDB.client);
    const data = await roomService.check();
    const result = {
      rooms: data,
      length: data.length,
    }
    if (result) {
      return res.status(200).json(result);
    } else {
      return res.send("Đã xảy ra lỗi")
    }

  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình truy xuat phong !"));
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

// User
exports.getAllUser = async (req, res, next) => {
  try {
    const userService = new UserService(MongoDB.client);
    const data = await userService.check();
    const result = {
      users: data,
      length: data.length,
    }
    if (result) {
      return res.status(200).json(result);
    } else {
      return res.send("Đã xảy ra lỗi")
    }

  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình truy xuat phong !"));
  }
};

exports.deleteCustomer = async (req, res, next) => {

  // console.log(req.body)
  try {

    const userService = new UserService(MongoDB.client);
    const data = await userService.DeleteUserById(req.body)
    const result = {
      status: 1,
    }
    return res.send(result)
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong truy xuat Khu vực!"));
  }
};

// Order
exports.getAllUserOrder = async (req, res, next) => {
  try {
    const userService = new UserService(MongoDB.client);
    const data = await userService.getUserOrder();
    const result = {
      users: data,
      length: data.length,
    }
    if (result) {
      return res.status(200).json(result);
    } else {
      return res.send("Đã xảy ra lỗi")
    }

  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình truy xuat phong !"));
  }
};

exports.getAllOrderOfAllUserForAdmin = async (req, res, next) => {

  try {
    const userService = new UserService(MongoDB.client);
    const result = await userService.getAllOrdersForAllUsers();

    if (!result) {
      return res.status(400).json({
        err: -1,
        msg: "Không tìm thấy lịch sử đặt phòng nào!",
      });
    }
    return res.status(200).json({
      length: result.length,
      users: result,      
    });
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi xoá yêu thích của người dùng."));

  }
}

exports.confirmOrderRoom = async (req, res, next) => {
  // console.log(req.body)
  try {
    const userService = new UserService(MongoDB.client);
    const result = await userService.ConfirmOrder(req.body);
    // console.log(result)
    if (result) {
      return res.status(200).json({
        status: 1,
        data: result,
        msg: "Xác nhận đơn thành công !"
      });
    }
    else {
      return res.status(200).json("code lỗi");
    }

  } catch (error) {
    console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình xác nhận đơn đặt phòng !"));
  }
};

exports.checkinOrderRoom = async (req, res, next) => {
  const { idUser, idOrder, cccd } = req.body;

  if (!idUser || !idOrder || !cccd) {
    return res.status(400).json({
      status: 0,
      msg: "Thiếu thông tin (idUser, idOrder, hoặc CCCD)"
    });
  }

  try {
    if (!/^\d{12}$/.test(cccd)) {
      return res.status(400).json({
        status: 0,
        msg: "Chứng minh thư phải là 12 số"
      });
    }

    const userService = new UserService(MongoDB.client);
    const result = await userService.InsertCCCD(req.body);
    // console.log(result)
    if (result) {
      return res.status(200).json({
        status: 1,
        data: result,
        msg: "Checkin đơn thành công!"
      });
    }
    else {
      return res.status(400).json({
        status: 0,
        msg: "Không tìm thấy đơn hoặc không thể cập nhật CCCD"
      });
    }

  } catch (error) {
    console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình checkin đơn đặt phòng!"));
  }
};

exports.completeOrderRoom = async (req, res, next) => {

  try {
    const userService = new UserService(MongoDB.client);
    const roomService = new RoomService(MongoDB.client);

    // Step 1: Complete the user's order
    const result = await userService.completeOrderRoom(req.body);

    // Step 2: Delete the room booking dates
    const roomResult = await roomService.deleteDateRoom(result.order[0])
    // console.log(roomResult);

    if (result &&  roomResult.acknowledged && roomResult.modifiedCount > 0) {
      return res.status(200).json({
        status: 1,
        data: result,
        msg: "Hoàn thành đơn thành công !"
      });
    }
    else {
      return res.status(200).json("code lỗi");
    }

  } catch (error) {
    console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình hoàn thành đơn đặt phòng !"));
  }
};

exports.deleteOrderRoom = async (req, res, next) => {
  try {
    const userService = new UserService(MongoDB.client);
    const roomService = new RoomService(MongoDB.client);
    const result = await userService.DeleteOrderRoom(req.body);

    const room = {
      idRoom: req.body.idRoom,
      dateOrderRoom: req.body.dateInput,
    };

    // Xóa ngày đặt phòng khỏi phòng
    const result1 = await roomService.deleteOrderRoom(room);


    if (result) {
      if (result1)
        return res.status(200).json({
          status: 1,
          data: result,
          msg: "Xóa ngày đặt thành công !"
        });
      else
        return res.status(200).json({
          status: 1,
          data: result,
          msg: "Xóa đơn hàng thành công !"
        });
    }
    else {
      return res.status(200).json("code lỗi");
    }

  } catch (error) {
    console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình xóa đơn đặt phòng !"));
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
    const orderResult = await userService.CancelOrderRoomAdmin(payload)
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
      status: 1,
      data: orderResult,
      msg: "Xóa đơn hàng thành công !"
    });
  } catch (error) {
    console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong hủy phòng !"));
  }
};

// Service
exports.getAllExtraServices = async (req, res, next) => {
  try {
    const extraServiceService = new ExtraServiceService(MongoDB.client);
    const data = await extraServiceService.getAll({ status: 1 });
    const result = {
      extraServices: data,
      total: data.length,
    };

    if (result) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json({ message: "Đã xảy ra lỗi" });
    }
  } catch (error) {
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình truy xuất dịch vụ bổ sung!"));
  }
};

exports.getExtraServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const extraServiceService = new ExtraServiceService(MongoDB.client);
    const data = await extraServiceService.getById(id);

    if (data) {
      return res.status(200).json(data);
    } else {
      return res.status(404).json({ message: "Không tìm thấy dịch vụ bổ sung!" });
    }
  } catch (error) {
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình truy xuất dịch vụ bổ sung!"));
  }
};

exports.createExtraService = async (req, res, next) => {
  try {
    const payload = req.body;
    const extraServiceService = new ExtraServiceService(MongoDB.client);
    const data = await extraServiceService.createExtraService(payload); // Giả định `createExtraService()` thêm dịch vụ mới

    if (data) {
      return res.status(201).json(data);
    } else {
      return res.status(400).json({ message: "Không thể tạo dịch vụ bổ sung!" });
    }
  } catch (error) {
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình thêm dịch vụ bổ sung!"));
  }
};

exports.updateExtraService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const extraServiceService = new ExtraServiceService(MongoDB.client);
    const data = await extraServiceService.updateExtraService({ ...payload, id });

    if (data) {
      return res.status(200).json(data);
    } else {
      return res.status(400).json({ message: "Không thể cập nhật dịch vụ bổ sung!" });
    }
  } catch (error) {
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình cập nhật dịch vụ bổ sung!"));
  }
};

exports.deleteExtraService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const extraServiceService = new ExtraServiceService(MongoDB.client);
    const result = await extraServiceService.deleteExtraService(id);


    if (result.success) {
      return res.status(200).json({
        status: 0,
        msg: "Dịch vụ bổ sung đã được xóa!"
      });
    }

    return res.status(400).json({ msg: result.message });

  } catch (error) {
    console.error("Error in deleteExtraService:", error);
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình xóa dịch vụ bổ sung!"));
  }
};

// Comment
exports.getAllComment = async (req, res, next) => {
  try {
    const roomService = new RoomService(MongoDB.client);

    const comments = await roomService.getAllCommentsIncludeHide();

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

    // if (comment.idUser.toString() !== idUser) {
    //   return res.status(403).json({
    //     err: -1,
    //     msg: "Bạn không có quyền xoá bình luận này.",
    //   });
    // }

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

exports.unSoftDeleteComment = async (req, res, next) => {
  const { idComment } = req.body;

  try {
    const roomService = new RoomService(MongoDB.client);

    const comment = await roomService.getCommentsByIdIncludeHide(idComment);

    if (!comment) {
      return res.status(404).json({
        err: -1,
        msg: "Không tìm thấy bình luận.",
      });
    }

    // Update the comment's status to "active" or the appropriate non-deleted status
    const result = await roomService.restoreComment({
      idRoom: comment.idRoom,
      idComment,
    });

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        err: -1,
        msg: "Không thể khôi phục bình luận.",
      });
    }

    return res.status(200).json({
      err: 0,
      msg: "Bình luận đã được khôi phục thành công!",
    });
  } catch (err) {
    console.error(err);
    return next(
      new ApiError(500, "Đã có lỗi xảy ra trong quá trình khôi phục bình luận.")
    );
  }
};

