const ApiError = require("../api-error");
const UserService = require("../services/user/user.service");
const MongoDB = require("../utils/mongodb.util");
const RoomService = require("../services/room/room.service");
const SectorService = require("../services/sector/sector.service");
// import { Jwt } from "jsonwebtoken";
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.getAllRoom = async (req, res, next) => {
  try {
    const roomService = new RoomService(MongoDB.client);
    const allRoom = await roomService.check();
    return allRoom;
  } catch (error) {
    // console.log(error)
    return next(
      new ApiError(500, "Xảy ra lỗi trong quá trình truy xuất tất cả phòng !")
    );
  }
};

exports.orderRoom = async (req, res, next) => {
  const idv4 = uuidv4();
  const room = {
    idRoom: req.query.Room._id,
    dateOrderRoom: req.query.infoOrder.dateInput,
  };
  console.log(req.query.infoOrder);
  const infoOrder = {
    idUser: req.query.infoOrder.idUser,
    userInput: req.query.infoOrder.userInput,
    phoneInput: req.query.infoOrder.phoneInput,
    idRoom: req.query.infoOrder.idRoom,
    dateInput: req.query.infoOrder.dateInput,
    totalMoney: req.query.infoOrder.totalMoney,
    pay: req.query.infoOrder.pay,
    statusOrder: req.query.infoOrder.statusOrder,
    idOrder: idv4,
  };
  const user = {
    info: infoOrder,
  };
  // console.log(req.query)
  try {
    const userService = new UserService(MongoDB.client);
    const roomService = new RoomService(MongoDB.client);
    const result1 = await roomService.OrderRoom(room);
    const result2 = await userService.OrderRoomUser(user);
    return res.send(result2);
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình đặt phòng !"));
  }
};

exports.getInfoRoom = async (payload) => {
  console.log(payload)
  try {
    const roomService = new RoomService(MongoDB.client);
    const result1 = await roomService.checkByIdRoom(payload);

    return result1[0]
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong truy xuat phòng !"));
  }
};

exports.cancleOrderRoom = async (req, res, next) => {
  const idUser = req.body.idUser;
  const idOrder = req.body.idOrder;
  console.log(req.body);
  const payload = {
    idUser: idUser,
    idOrder: idOrder,
  };
  try {
    const userService = new UserService(MongoDB.client);
    const result1 = await userService.CancleOrderRoomUser(payload);
    return res.send(result1);
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong truy xuat phòng !"));
  }
};

exports.updatePaypalOrder = async (payload) => {
  // const idUser = "661361f72f203bf3cd806c4f";
  const idOrder = payload.idOrder;
  // console.log(req.body)
  const input = {

    idOrder: idOrder,
  };
  try {
    const userService = new UserService(MongoDB.client);
    const result1 = await userService.PayOrder(input);
    return result1
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong truy xuất phòng !"));
  }
};

exports.getInfoSector = async (req, res, next) => {
  // console.log(req.body)
  try {
    const sectorService = new SectorService(MongoDB.client);
    const result1 = await sectorService.checkByIdSector(req.body);
    // console.log(result1)
    return res.send(result1[0]);
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
    };

    return res.status(200).json(result);

  } catch (error) {
    // console.log(error)
    return next(
      new ApiError(500, "Xảy ra lỗi trong quá trình truy xuất khu vực !")
    );
  }
};

exports.getAllSectorChatbot = async (req, res, next) => {
  try {
    const sectorService = new SectorService(MongoDB.client);
    const data = await sectorService.check();

    const result = {
      sectors: data,
      length: data.length,
    };

    return result;

  } catch (error) {
    return next(
      new ApiError(500, "Xảy ra lỗi trong quá trình truy xuất khu vực !")
    );
  }
};

exports.findRoomsByIdSector = async (req, res, next) => {
  try {
    const roomService = new RoomService(MongoDB.client);
    const data = await roomService.findRoomByIdSector(req);

    return data;


  } catch (error) {
    // console.log(error)
    return next(
      new ApiError(500, "Xảy ra lỗi trong quá trình truy xuat khu vực !")
    );
  }
};

exports.orderRoomByChatBot = async (payload) => {
  const idv4 = uuidv4();
  const room = {
    idRoom: payload.enTenPhong,
    dateOrderRoom: payload.dateOrderRoom,
  };

  const infoOrder = {
    idUser: "6716e891ad9c5603b1499655",// user ảo đóng vai trò là bot
    userInput: payload.enTen,
    phoneInput: payload.enSdt,
    idRoom: payload.enTenPhong,
    dateInput: payload.dateOrderRoom,
    totalMoney: payload.totalMoney,
    pay: false,
    statusOrder: "1",
    idOrder: idv4,
  };
  const user = {
    info: infoOrder,
  };
  // console.log(req.query)
  try {
    const userService = new UserService(MongoDB.client);
    const roomService = new RoomService(MongoDB.client);
    const result1 = await roomService.OrderRoom(room);
    const result2 = await userService.OrderRoomUser(user);
    return result2;
  } catch (error) {
    // console.log(error)
    return next(new ApiError(500, "Xảy ra lỗi trong quá trình đặt phòng !"));
  }
};

exports.checkRoomByChatBot = async (payload) => {
  const date = payload.date
  // console.log(date)
  try {
    const roomService = new RoomService(MongoDB.client);
    const result = await roomService.findAvailableRooms(date)
    // console.log(result)

    return result;
  } catch (error) {
    console.log(error)
    // return next(new ApiError(500, "Xảy ra lỗi trong quá trình đặt phòng !"));
  }
};

exports.cancleOrderRoomByChatBot = async (payload) => {
  try {
    const userService = new UserService(MongoDB.client);
    const result = await userService.CancleOrderRoomByChatBot(payload)
    return result;
  } catch (error) {
    console.log(error)
    // return next(new ApiError(500, "Xảy ra lỗi trong quá trình đặt phòng !"));
  }
};


exports.getInfoOrderRoomByChatBot = async (payload) => {
  try {
    const userService = new UserService(MongoDB.client);
    const result = await userService.GetInfoOrderRoomByChatBot(payload)
    return result;
  } catch (error) {
    console.log(error)
    // return next(new ApiError(500, "Xảy ra lỗi trong quá trình đặt phòng !"));
  }
};




