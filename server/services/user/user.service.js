const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const hashpwd = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(12));

class UserService {
  constructor(client) {
    this.User = client.db().collection("users");
  }

  extractUserData(payload) {
    const user = {
      name: payload.name,
      email: payload.email,
      password: payload.password ? hashpwd(payload.password) : '',
      address: payload.address,
      phone: payload.phone,
      refreshToken: payload.refreshToken,
      img: payload.img,
      oauth: payload.oauth,
      isAdmin: payload.isAdmin,
    };
    Object.keys(user).forEach(
      (key) => user[key] === undefined && delete user[key]
    );
    return user;
  }

  async check(filter) {
    const projection = { order: 0, refreshToken: 0 };
    const cursor = await this.User.find(filter, { projection });
    return await cursor.toArray();
  }

  async checkDuplicatePhone(filter) {
    try {
      const user = await this.User.findOne(filter);
      return !!user;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async checkDuplicateEmailPhone(filter, projection = null) {
    try {
      const user = await this.User.findOne(filter, { projection });
      return user;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async fineOne(filter, projection = null) {
    try {
      const user = await this.User.findOne(filter, { projection });
      return user;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getInfoUser(filter) {
    try {
      const projection = { order: 0, password: 0, refreshToken: 0 };
      const user = await this.User.findOne(filter, { projection });
      console.log(user);
      return user;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateRefreshToken(userId, refreshToken) {
    try {
      const result = await this.User.findOneAndUpdate(
        { _id: userId },
        { $set: { refreshToken } },
        { new: true },
        { returnDocument: "after", upsert: true }
      );

      // Hide fields in the returned document
      delete result.password;
      delete result.order;
      delete result.refreshToken;

      return result;
    } catch (error) {
      console.error('Error updating refresh token:', error);
      return null;
    }
  }

  async create(payload) { 
    try {
      const data = this.extractUserData(payload);

      await this.User.findOneAndUpdate(
        data,
        { $set: { img: {}, order: [], refreshToken: null } },
        { returnDocument: "after", upsert: true }
      );

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async updateInfoUser(payload) {
    const idUser = payload.idUser;

    const updateFields = {};
    if (payload.email) updateFields.email = payload.email;
    if (payload.password) updateFields.password = payload.password;
    if (payload.name) updateFields.name = payload.name;
    if (payload.phone) updateFields.phone = payload.phone;
    if (payload.address) updateFields.address = payload.address;
    if (payload.img) updateFields.img = payload.img;
    // Thêm các trường khác tương tự

    const result = await this.User.findOneAndUpdate(
      {
        _id: ObjectId.isValid(idUser) ? new ObjectId(idUser) : null,
      },
      {
        $set: updateFields,
      },
      { returnDocument: "after" }
    );
    return result;
  }

  async updatePassword(payload) {
    console.log(payload)
    try {
      // Mã hóa mật khẩu mới
      const hashedNewPassword = bcrypt.hashSync(payload.newPassword, bcrypt.genSaltSync());
      // Cập nhật mật khẩu trong cơ sở dữ liệu
      const result = await this.User.findOneAndUpdate(
        { phone: payload.phone },
        { $set: { password: hashedNewPassword } },
        { returnDocument: "after" }
      );
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async OrderRoomUser(payload) {
    const idUser = payload.info.idUser;

    const result = await this.User.findOneAndUpdate(
      { _id: ObjectId.isValid(idUser) ? new ObjectId(idUser) : null },
      {
        $push: {
          order: payload.info,
        },
      },
      { returnDocument: "after" }
    );

    return result;
  }
  async CancleOrderRoomUser(payload) {
    const idUser = payload.idUser;
    const idOrder = payload.idOrder;
    console.log(payload);
    const result = await this.User.findOneAndUpdate(
      {
        _id: ObjectId.isValid(idUser) ? new ObjectId(idUser) : null,
        "order.idOrder": idOrder,
      },
      {
        $set: { "order.$.statusOrder": "10" },
      },
      { returnDocument: "after" }
    );

    return result;
  }

  async PayOrder(payload) {
    try {
      // Cập nhật trạng thái thanh toán của đơn hàng dựa trên idOrder
      const result = await this.User.findOneAndUpdate(
        { "order.idOrder": payload.idOrder },
        { $set: { "order.$.pay": "true" } },
        { returnDocument: "after" }
      );
      return result;
    } catch (error) {
      console.error(error);
      throw new Error("Có lỗi xảy ra khi cập nhật trạng thái thanh toán.");
    }
  }

  async ConfirmOrder(payload) {
    const idUser = payload.idUser;
    const idOrder = payload.idOrder;
    console.log(payload);
    const result = await this.User.findOneAndUpdate(
      {
        _id: ObjectId.isValid(idUser) ? new ObjectId(idUser) : null,
        "order.idOrder": idOrder,
      },
      {
        $set: { "order.$.statusOrder": "2" },
      },
      { returnDocument: "after" }
    );

    return result;
  }

  async completeOrderRoom(payload) {
    const idUser = payload.idUser;
    const idOrder = payload.idOrder;
    console.log(payload);
    const result = await this.User.findOneAndUpdate(
      {
        _id: ObjectId.isValid(idUser) ? new ObjectId(idUser) : null,
        "order.idOrder": idOrder,
      },
      {
        $set: {
          "order.$.statusOrder": "3",
          "order.$.pay": "true",
        },
      },
      { returnDocument: "after" }
    );

    return result;
  }

  async DeleteOrderRoom(payload) {
    const { idUser, idOrder } = payload;
    console.log(payload);
    if (!ObjectId.isValid(idUser)) {
      return null; // hoặc xử lý lỗi tương ứng
    }
    try {
      const result = await this.User.findOneAndUpdate(
        {
          _id: new ObjectId(idUser),
          "order.idOrder": idOrder,
        },
        {
          $pull: { order: { idOrder: idOrder } },
        },
        { returnDocument: "after" }
      );
      // console.log(result);
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async CancleOrderRoomByChatBot(payload) {
    const idOrder = payload.idOrder;

    // Tìm order dựa trên idOrder
    const order = await this.User.findOne({ "order.idOrder": idOrder });

    if (!order) {
      return "Không tìm thấy order nào có id " + idOrder;
    }

    const statusOrder = order.order.find((o) => o.idOrder === idOrder).statusOrder;

    if (statusOrder === "10") {
      return {
        status: 1,
        msg: "Đơn đặt phòng đã được hủy trước đó. !"
      };
    } else if (statusOrder === "1" || statusOrder === "2") {
      // Cập nhật statusOrder lên 10
      const result = await this.User.findOneAndUpdate(
        { "order.idOrder": idOrder },
        { $set: { "order.$.statusOrder": "10" } },
        { returnDocument: "after" }
      );
      console.log(result)
      return {
        result: result,
        status: 0,
      };
    } else if (statusOrder === 3) {
      return {
        status: 2,
        msg: "Đơn đặt phòng đã được hoàn thành nên không thể hủy !."
      };
    }
  }

  async GetInfoOrderRoomByChatBot(payload) {
    try {
      const idOrder = payload.idOrder;
      // Kiểm tra idOrder không phải là undefined hoặc null
      if (!idOrder) {
        throw new Error('idOrder không được cung cấp hoặc không hợp lệ.');
      }
      // Tìm user dựa trên idOrder
      const user = await this.User.findOne({ "order.idOrder": idOrder });
      // Kiểm tra user có tồn tại và có mảng orders
      if (!user || !user.order) {
        // console.log('Không tìm thấy user hoặc mảng orders với idOrder cung cấp.');
        return 2;
      }
      // Tìm order cụ thể trong mảng orders
      const specificOrder = user.order.find(order => order.idOrder === idOrder);
      // Kiểm tra specificOrder có tồn tại
      if (!specificOrder) {
        console.log('Không tìm thấy order cụ thể với idOrder cung cấp.');
        return null;
      }
      // Trả về order tìm được
      return specificOrder;
    } catch (error) {
      // Xử lý lỗi ở đây
      console.error('Lỗi khi tìm kiếm order:', error);
      return null;
    }
  }

  async DeleteUserById(payload) {
    console.log('Deleting user with id:', payload.idAdmin);
    if (!ObjectId.isValid(payload.idAdmin)) {
      return null; // hoặc xử lý lỗi tương ứng
    }
    try {
      const result = await this.User.findOneAndDelete({
        _id: new ObjectId(payload.idAdmin)
      });
      return result;
    } catch (error) {
      console.log(error);
    }
  }

}

module.exports = UserService;
