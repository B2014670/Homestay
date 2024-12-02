const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
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

  async check(filter, projection = null) {
    // const projection = { order: 0, refreshToken: 0 };
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
        { $set: { img: data.img || {}, order: [], refreshToken: null } },
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
    // if (payload.email) updateFields.email = payload.email;
    // if (payload.password) updateFields.password = payload.password;
    // if (payload.phone) updateFields.phone = payload.phone;
    if (payload.name) updateFields.name = payload.name;
    if (payload.address) updateFields.address = payload.address;
    if (payload.img) updateFields.img = payload.img;

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

  async generateResetToken(email) {
    try {
      const user = await this.User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      const token = crypto.randomBytes(20).toString("hex");
      const expiration = Date.now() + 15 * 60 * 1000; // 15 minute

      await this.User.updateOne(
        { email },
        { $set: { reset_password_token: token, reset_password_expires: expiration } }
      );

      return token; // Return the token to send via email
    } catch (error) {
      console.error("Error generating reset token:", error);
      throw error; // Rethrow the error for further handling
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const user = await this.User.findOne({
        reset_password_token: token,
        reset_password_expires: { $gt: Date.now() },
      });

      if (!user) {
        return false;
      }

      const hashedNewPassword = hashpwd(newPassword);
      await this.User.updateOne(
        { _id: user._id },
        {
          $set: {
            password: hashedNewPassword,
            reset_password_token: undefined,
            reset_password_expires: undefined,
          },
        }
      );

      return true;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error; // Rethrow the error for further handling
    }
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

  // ORDER STARTING
  async getUserOrder(filter) {
    const projection = { refreshToken: 0 };
    const cursor = await this.User.find(filter, { projection });
    return await cursor.toArray();
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

  async getAllOrderOfUser(payload) {
    const result = await this.User.aggregate([
      {
        $match: { _id: ObjectId.isValid(payload.userId) ? new ObjectId(payload.userId) : null }
      },
      {
        $unwind: { path: '$order', preserveNullAndEmptyArrays: true }
      },
      {
        $match: { order: { $ne: null } }
      },
      {
        $match: { orders: { $ne: [] } }
      },
      {
        $addFields: {
          'order.idRoom': { $toObjectId: "$order.idRoom" }
        }
      },
      {
        $lookup: {
          from: 'rooms',
          localField: 'order.idRoom',
          foreignField: '_id',
          as: 'roomDetails',
        }
      },
      {
        $unwind: { path: '$roomDetails', preserveNullAndEmptyArrays: true }
      },
      {
        $addFields: {
          "roomDetails.idSectorRoom": { $toObjectId: "$roomDetails.idSectorRoom" }
        }
      },
      {
        $lookup: {
          from: 'sectors',
          localField: 'roomDetails.idSectorRoom',
          foreignField: '_id',
          as: 'roomDetails.sectorDetails'
        }
      },
      {
        $unwind: { path: '$roomDetails.sectorDetails', preserveNullAndEmptyArrays: true }
      },
      {
        $addFields: {
          'order.room': '$roomDetails'
        }
      },
      {
        // Filter out deleted comments for the room's comment array
        $addFields: {
          'order.room.cmtRoom': {
            $filter: {
              input: '$roomDetails.cmtRoom',  // Reference the correct cmtRoom array (from roomDetails)
              as: 'comment',
              cond: {
                $and: [
                  { $eq: ['$$comment.idOrder', '$order.idOrder'] },  // Match idOrder from the comment and order
                  { $eq: ['$$comment.isDeleted', false] }  // Only include non-deleted comments
                ]
              }
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: "$name" },
          phone: { $first: "$phone" },
          email: { $first: "$email" },
          address: { $first: "$address" },
          img: { $first: "$img" },
          orders: { $push: '$order' }
        }
      },
    ]).toArray();

    return result;
  }

  async getOneOrderOfUserById(payload) {
    const result = await this.User.aggregate([
      {
        $match: { _id: ObjectId.isValid(payload.userId) ? new ObjectId(payload.userId) : null }
      },
      {
        $unwind: { path: '$order', preserveNullAndEmptyArrays: true }
      },
      {
        $match: { order: { $ne: null } }
      },
      {
        $match: { 'order.idOrder': payload.idOrder }
      },
      {
        $addFields: {
          'order.idRoom': { $toObjectId: "$order.idRoom" }
        }
      },
      {
        $lookup: {
          from: 'rooms',
          localField: 'order.idRoom',
          foreignField: '_id',
          as: 'roomDetails',
        }
      },
      {
        $unwind: { path: '$roomDetails', preserveNullAndEmptyArrays: true }
      },
      {
        $addFields: {
          "roomDetails.idSectorRoom": { $toObjectId: "$roomDetails.idSectorRoom" }
        }
      },
      {
        $lookup: {
          from: 'sectors',
          localField: 'roomDetails.idSectorRoom',
          foreignField: '_id',
          as: 'roomDetails.sectorDetails'
        }
      },
      {
        $unwind: { path: '$roomDetails.sectorDetails', preserveNullAndEmptyArrays: true }
      },
      {
        $addFields: {
          'order.room': '$roomDetails'
        }
      },
      {
        // Filter out deleted comments for the room's comment array
        $addFields: {
          'order.room.cmtRoom': {
            $filter: {
              input: '$roomDetails.cmtRoom',  // Reference the correct cmtRoom array (from roomDetails)
              as: 'comment',
              cond: {
                $and: [
                  { $eq: ['$$comment.idOrder', '$order.idOrder'] },  // Match idOrder from the comment and order
                  { $eq: ['$$comment.isDeleted', false] }  // Only include non-deleted comments
                ]
              }
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: "$name" },
          phone: { $first: "$phone" },
          email: { $first: "$email" },
          address: { $first: "$address" },
          img: { $first: "$img" },
          orders: { $push: '$order' } // Collect all the filtered orders into an array
        }
      }
    ]).toArray();

    return result;
  }


  async verifyOrderSuccess(userId, orderId) {
    try {
      const userObjectId = new ObjectId(userId);
      const user = await this.User.findOne({
        _id: userObjectId,
        order: {
          $elemMatch: {
            idOrder: orderId,
            pay: "true",
            statusOrder: "3"
          }
        }
      });
      return !!user;
    } catch (error) {
      console.error("Verification failed:", error.message);
      return false;
    }
  }


  async CancelOrderRoomUser(payload) {
    const { idUser, idOrder } = payload;

    const result = await this.User.findOneAndUpdate(
      {
        _id: ObjectId.isValid(idUser) ? new ObjectId(idUser) : null,
        "order.idOrder": idOrder,
        "order.statusOrder": "1",
      },
      {
        $set: { "order.$.statusOrder": "10" },
      },
      { returnDocument: "after", projection: { order: { $elemMatch: { idOrder: idOrder } } } }
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

  async updateRefundStatus(userId, orderId, status) {
    const result = await this.User.updateOne(
      {
        _id: ObjectId.isValid(userId) ? new ObjectId(userId) : null,
        "order.idOrder": orderId,
      },
      {
        $set: { "order.$.refundStatus": status },  // Update refund status
      }
    );
    return result;
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

  async CancelOrderRoomByChatBot(payload) {
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
      console.log("idOrder: ",payload.idOrder);
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

}

module.exports = UserService;
