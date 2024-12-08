const { ObjectId } = require("mongodb");
require("dotenv").config();

class WishlistService {
  constructor(client) {
    this.Wishlist = client.db().collection("wishlists");
    this.User = client.db().collection("users");
    this.Room = client.db().collection("rooms");

  }

  extractWishlistData(payload) {
    const wishlist = {
      userId: payload.userId,
      roomId: payload.roomId,
      createdAt: payload.createdAt || new Date(),
      updatedAt: payload.updatedAt || new Date(),
    };
    // Loại bỏ các trường không được định nghĩa
    Object.keys(wishlist).forEach(
      (key) => wishlist[key] === undefined && delete wishlist[key]
    );

    return wishlist;
  }

  async check(filter) {
    // console.log(filter);
    const cursor = await this.Wishlist.find(filter);
    return await cursor.toArray();
  }

  async createWishlist(payload) {
    try {
      // Extract necessary data from the payload
      const data = this.extractWishlistData(payload);

      // Check if user exists
      const userExists = await this.User.findOne({ _id: ObjectId.isValid(data.userId) ? new ObjectId(data.userId) : null });
      if (!userExists) {
        return {
          success: false,
          message: "Id người dùng không hợp lệ. Người dùng không tồn tại.",
        };
      }

      // Check if room exists
      const roomExists = await this.Room.findOne({ _id: ObjectId.isValid(data.roomId) ? new ObjectId(data.roomId) : null });
      if (!roomExists) {
        return {
          success: false,
          message: "Id phòng không hợp lệ. Phòng không tồn tại.",
        };
      }

      // Check if the wishlist item already exists for this user and room
      const existingWishlistItem = await this.Wishlist.findOne({
        userId: data.userId,
        roomId: data.roomId,
      });

      if (existingWishlistItem) {
        return {
          success: false,
          message: "Mục này đã có trong danh sách mong muốn của người dùng.",
        };
      }

      // Add item to wishlist
      await this.Wishlist.insertOne(data, { upsert: true });

      return {
        success: true,
        message: "Mục được thêm vào danh sách yêu thích thành công.",
      };
    } catch (error) {
      console.error("Error creating wishlist item:", error);
      return {
        success: false,
        message: "Đã xảy ra lỗi khi thêm mục vào danh sách yêu thích.",
      };
    }
  }
  async getWishlistByUserId(userId) {
    return await this.Wishlist.find({ userId: userId }).toArray();
  }

  async getWishlistRoomsByUserId(userId) {
    return await this.Wishlist.aggregate([
      {
        $match: { userId: userId }
      },
      {
        $addFields: {
          roomId: { $toObjectId: "$roomId" } // Convert string to ObjectId
        }
      },
      // Lookup the 'rooms' collection to get the details of each room
      {
        $lookup: {
          from: 'rooms',
          localField: 'roomId', 
          foreignField: '_id', 
          as: 'roomDetails'
        }
      },
      // Unwind the roomDetails array to flatten the results
      {
        $unwind: { path: '$roomDetails' } //, preserveNullAndEmptyArrays: true
      },
      {
        $addFields: {
          "roomDetails.idSectorRoom": { $toObjectId: "$roomDetails.idSectorRoom"  } // Convert string to ObjectId
        }
      },
      // Lookup the 'sectors' collection to get the details of the sector for each room
      {
        $lookup: {
          from: 'sectors', 
          localField: 'roomDetails.idSectorRoom', 
          foreignField: '_id', 
          as: 'roomDetails.sectorDetails' 
        }
      },
      // Unwind the sectorDetails array
      {
        $unwind: { path: '$roomDetails.sectorDetails', preserveNullAndEmptyArrays: true }
      },
    ]).toArray();
  }


  async updateWishlist(id, data) {
    const wishlistData = this.extractWishlistData(data);
    const result = await this.Wishlist.updateOne(
      { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
      { $set: { ...wishlistData, updatedAt: new Date() } },
      { returnDocument: "after", upsert: true }
    );
    return result;
  }

  async deleteWishlist(payload) {
    const { userId, roomId } = this.extractWishlistData(payload);
    const result = await this.Wishlist.findOneAndDelete(
      { userId: userId, roomId: roomId }
    );
    if (result)
      return true;
    return false;
  }

}

module.exports = WishlistService;
