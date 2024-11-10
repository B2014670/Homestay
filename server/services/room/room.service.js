const { ObjectId } = require("mongodb");
const moment = require('moment');

class RoomService {
  constructor(client) {
    this.Room = client.db().collection("rooms");
    this.Sector = client.db().collection("sectors");
  }

  extractRoomData(payload) {
    const room = {
      nameRoom: payload.nameRoom,
      idSectorRoom: payload.idSectorRoom,
      giaRoom: payload.giaRoom,
      loaiRoom: payload.loaiRoom,
      statusRoom: payload.statusRoom,
      imgRoom: payload.imgRoom,
      danhgiaRoom: payload.danhgiaRoom,
      ordersRoom: payload.ordersRoom,
      cmtRoom: payload.cmtRoom,
      discRoom: payload.discRoom,
    };
    Object.keys(room).forEach(
      (key) => room[key] === undefined && delete room[key]
    );
    return room;
  }

  // async check(filter) {
  //   // console.log(filter);
  //   const cursor = await this.Room.find(filter);
  //   return await cursor.toArray();
  // }


  async check(filter) {
    try {
      const roomsWithSectors = await this.Room.aggregate([
        { $match: filter || {} }, // Apply the filter
        {
          $addFields: {
            idSectorRoom: { $toObjectId: "$idSectorRoom" } // Convert string to ObjectId
          }
        },
        {
          $lookup: {
            from: "sectors",
            localField: "idSectorRoom",
            foreignField: "_id",
            as: "sectorDetails",
          },
        },
        {
          $unwind: {
            path: "$sectorDetails",
            preserveNullAndEmptyArrays: true
          }
        } // Flatten the result
      ]).toArray();

      return roomsWithSectors;
    } catch (error) {
      console.error("Error in fetching rooms with sectors:", error);
      throw error;
    }
  }

  async checkByIdRoom(filter) {
    // console.log(filter);
    const cursor = await this.Room.find({
      _id: ObjectId.isValid(filter.idRoom) ? new ObjectId(filter.idRoom) : null,
    });
    return await cursor.toArray();
  }

  async searchRoom(queryParams) {
    console.log(queryParams);
    const { place, dateRange, roomType, sector, page = 1, limit = 10 } = queryParams;
    const query = {};

    if (place) {
      query.nameRoom = { $regex: new RegExp(place, "i") };
    }

    if (roomType) {
      query.loaiRoom = roomType;
    }

    if (sector) {
      query.idSectorRoom = sector;
    }

    const rooms = await this.Room.aggregate([
      { $match: query },
      {
        $addFields: {
          idSectorRoom: { $toObjectId: "$idSectorRoom" } // Convert string to ObjectId
        }
      },
      {
        $lookup: {
          from: "sectors",
          localField: "idSectorRoom",
          foreignField: "_id",
          as: "sectorDetails", // Fetch sector details
        }
      },
      {
        $unwind: {
          path: "$sectorDetails", // Unwind the array to get a single sector detail
          preserveNullAndEmptyArrays: true // In case there is no match, preserve the room
        }
      },
    ]).toArray();

    console.log(rooms.length);

    if (!dateRange) {
      // Manually paginate the results
      const startIndex = (page - 1) * limit;
      const paginatedRooms = rooms.slice(startIndex, startIndex + limit);
      return { totalRooms: rooms.length, paginatedRooms };
    }

    const [inputStartDate, inputEndDate] = dateRange?.split(',').map(date => new Date(date));

    function parseDate(dateStr) {
      const [day, month, year] = dateStr.split("/").map(Number);
      return new Date(year, month - 1, day); // Months are zero-indexed
    }

    // Check for availability based on the provided date range
    const availableRooms = rooms.filter(room => {

      // Ensure that the room has 'ordersRoom' array and process it
      if (!Array.isArray(room.ordersRoom)) {
        return true; // If no orders, room is available
      }

      return !room.ordersRoom.some(booking => {
        if (!Array.isArray(booking) || booking.length < 2) {
          return false; // Skip invalid bookings
        }
        const bookingStartDate = parseDate(booking[0]);
        const bookingEndDate = parseDate(booking[1]);

        return (
          // Check date overlaps
          (inputStartDate < bookingEndDate && inputEndDate > bookingStartDate)
        );
      });
    });

    // Manually paginate the results
    const startIndex = (page - 1) * limit;
    const paginatedRooms = availableRooms.slice(startIndex, startIndex + limit);

    return { totalRooms: availableRooms.length, paginatedRooms };
  }

  async addRoom(payload) {
    // console.log(payload)
    const room = await this.extractRoomData(payload);
    const result = await this.Room.findOneAndUpdate(
      room,
      {
        $set: {
          statusRoom: 0,
          ordersRoom: [],
          danhgiaRoom: 5,
          cmtRoom: [],
        },
      },
      { returnDocument: "after", upsert: true }
    );
    return result;
  }

  async deleteRoom(payload) {
    console.log(payload);

    const result = await this.Room.deleteOne({
      _id: ObjectId.isValid(payload._id) ? new ObjectId(payload._id) : null,
    });
    return result;
  }

  async deleteDateRoom(payload) {

    const result = await this.Room.updateOne(
      { _id: ObjectId.isValid(payload.idRoom) ? new ObjectId(payload.idRoom) : null },
      { $pull: { ordersRoom: payload.dateInput } }, //{ $in: payload.dateOrderRoom }
    );
    return result;
  }

  async OrderRoom(payload) {
    // console.log(payload);

    const result = await this.Room.findOneAndUpdate(
      {
        _id: ObjectId.isValid(payload.idRoom) ? new ObjectId(payload.idRoom) : null,
      },
      {
        $push: {
          ordersRoom: payload.dateOrderRoom,
        },
      },
      { returnDocument: "after", }
    );
    // console.log(result)
    return result;
  }
  async findRoomByIdSector(filter) {
    // console.log(filter);
    const cursor = await this.Room.find({
      idSectorRoom: filter.enKhuVuc,
    });
    return await cursor.toArray();
  }

  async findAvailableRooms(datesArray) {
    // Tìm tất cả các phòng
    const cursor = await this.Room.find({});
    const allRooms = await cursor.toArray();

    // Lọc ra các phòng không có đơn đặt phòng nào trùng với mảng ngày đầu vào
    const availableRooms = allRooms.filter(room => {
      // Biến đổi mảng ordersRoom thành mảng các chuỗi ngày để so sánh
      const orderDates = room.ordersRoom.flatMap(order => order);

      // Kiểm tra xem có ngày nào trong ordersRoom trùng với ngày trong datesArray không
      return !datesArray.some(date => orderDates.includes(date));
    });
    console.log(availableRooms)
    return availableRooms;
  }


  async EditRoom(payload) {
    const updateObject = Object.keys(payload).reduce((acc, key) => {
      // Chỉ thêm các trường có giá trị khác rỗng vào đối tượng cập nhật
      if (payload[key] !== "") {
        acc[key] = payload[key];
      }
      return acc;
    }, {});
    delete updateObject._id;

    // Nếu updateObject không trống, tiến hành cập nhật
    if (Object.keys(updateObject).length > 0) {
      const result = await this.Room.findOneAndUpdate(
        {
          _id: ObjectId.isValid(payload._id) ? new ObjectId(payload._id) : null,
        },
        { $set: updateObject },
        { returnDocument: "after", upsert: true }
      );
      console.log(result);
      return result;
    } else {
      console.log("Không có giá trị nào khác rỗng để cập nhật.");
      return null;
    }
  }

  async getCommentsById(idComment) {
    const comment = await this.Room.aggregate([
      { $unwind: "$cmtRoom" },
      {
        $match: {
          "cmtRoom.idComment": idComment,
          "cmtRoom.isDeleted": { $ne: true }
        }
      },
      {
        $addFields: {
          "cmtRoom.idUser": { $toObjectId: "$cmtRoom.idUser" } // Convert string to ObjectId
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "cmtRoom.idUser",
          foreignField: "_id",
          as: "cmtRoom.userDetails",
        },
      },
      {
        $unwind: {
          path: "$cmtRoom.userDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          "cmtRoom.idComment": 1,
          "cmtRoom.idUser": 1,
          "cmtRoom.idOrder": 1,
          "cmtRoom.idRoom": 1,
          "cmtRoom.rating": 1,
          "cmtRoom.text": 1,
          "cmtRoom.createdDate": 1,
          "cmtRoom.updatedDate": 1,
          "cmtRoom.isDeleted": 1,
          "cmtRoom.userDetails._id": 1,
          "cmtRoom.userDetails.name": 1,
          "cmtRoom.userDetails.img": 1
        }
      }

    ]).toArray();

    return comment.length > 0 ? comment[0].cmtRoom : null;
  }

  async getCommentsByUser(idUser) {
    const comments = await this.Room.aggregate([
      { $unwind: "$cmtRoom" },
      {
        $match: {
          "cmtRoom.idUser": idUser,
          "cmtRoom.isDeleted": { $ne: true }
        }
      },
      {
        $addFields: {
          "cmtRoom.idUser": { $toObjectId: "$cmtRoom.idUser" } // Convert string to ObjectId
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "cmtRoom.idUser",
          foreignField: "_id",
          as: "cmtRoom.userDetails",
        },
      },
      {
        $unwind: {
          path: "$cmtRoom.userDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          "cmtRoom.idComment": 1,
          "cmtRoom.idUser": 1,
          "cmtRoom.idOrder": 1,
          "cmtRoom.idRoom": 1,
          "cmtRoom.rating": 1,
          "cmtRoom.text": 1,
          "cmtRoom.createdDate": 1,
          "cmtRoom.updatedDate": 1,
          "cmtRoom.isDeleted": 1,
          "cmtRoom.userDetails._id": 1,
          "cmtRoom.userDetails.name": 1,
          "cmtRoom.userDetails.img": 1
        }
      }

    ]).toArray();

    const formattedComments = comments.map(comment => comment.cmtRoom);

    return formattedComments
  }

  async getCommentsByRoom(idRoom) {
    const comments = await this.Room.aggregate([
      { $unwind: "$cmtRoom" },
      {
        $match: {
          _id: ObjectId.isValid(idRoom) ? new ObjectId(idRoom) : null,
          "cmtRoom.isDeleted": { $ne: true }
        }
      },
      {
        $addFields: {
          "cmtRoom.idUser": { $toObjectId: "$cmtRoom.idUser" } // Convert string to ObjectId
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "cmtRoom.idUser",
          foreignField: "_id",
          as: "cmtRoom.userDetails",
        },
      },
      {
        $unwind: {
          path: "$cmtRoom.userDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          "cmtRoom.idComment": 1,
          "cmtRoom.idUser": 1,
          "cmtRoom.idOrder": 1,
          "cmtRoom.idRoom": 1,
          "cmtRoom.rating": 1,
          "cmtRoom.text": 1,
          "cmtRoom.createdDate": 1,
          "cmtRoom.updatedDate": 1,
          "cmtRoom.isDeleted": 1,
          "cmtRoom.userDetails._id": 1,
          "cmtRoom.userDetails.name": 1,
          "cmtRoom.userDetails.img": 1
        }
      }

    ]).toArray();

    const formattedComments = comments.map(comment => comment.cmtRoom);

    return formattedComments
  }

  async addComment(payload) {
    const result = await this.Room.updateOne(
      {
        _id: ObjectId.isValid(payload.idRoom) ? new ObjectId(payload.idRoom) : null,
        $or: [
          { "cmtRoom.idOrder": { $ne: payload.idOrder } },
          { "cmtRoom.idOrder": payload.idOrder, "cmtRoom.isDeleted": true }
        ]
      },
      {
        $push: {
          cmtRoom: payload
        }
      },
      { returnDocument: "after" }
    );
    return result;
  }

  async updateComment(payload) {
    const { idRoom, idComment, rating, text } = payload;

    const result = await this.Room.updateOne(
      {
        _id: ObjectId.isValid(idRoom) ? new ObjectId(idRoom) : null,
        "cmtRoom.idComment": idComment,
        "cmtRoom.updatedDate": null,
        "cmtRoom.isDeleted": false,
      },
      {
        $set: {
          "cmtRoom.$.text": text,
          "cmtRoom.$.rating": rating,
          "cmtRoom.$.updatedDate": new Date()
        }
      },
      { returnDocument: "after", }
    );
    return result;
  }

  async deleteComment(payload) {
    const { idRoom, idComment } = payload;

    const result = await this.Room.updateOne(
      {
        _id: ObjectId.isValid(idRoom) ? new ObjectId(idRoom) : null,
        "cmtRoom.idComment": idComment,
        "cmtRoom.isDeleted": false,
      },
      {
        $set: {
          "cmtRoom.$.isDeleted": true,
          "cmtRoom.$.deletedDate": new Date()
        }
      },
      { returnDocument: "after", }
    );
    return result;
  }

}

module.exports = RoomService;
