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
  //   try {
  //     const roomsWithSectors = await this.Room.aggregate([
  //       { $match: filter || {} }, // Apply the filter
  //       {
  //         $addFields: {
  //           idSectorRoom: { $toObjectId: "$idSectorRoom" }, // Convert string to ObjectId
  //           cmtRoom: {
  //             $filter: {
  //               input: "$cmtRoom", // The comments array
  //               as: "comment", // Alias for each comment
  //               cond: { $eq: ["$$comment.isDeleted", false] } // Only include comments that are not deleted
  //             }
  //           }
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "sectors",
  //           localField: "idSectorRoom",
  //           foreignField: "_id",
  //           as: "sectorDetails",
  //         },
  //       },
  //       {
  //         $unwind: {
  //           path: "$sectorDetails",
  //           preserveNullAndEmptyArrays: true
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "users", // Join with users to fetch order details
  //           let: { roomId: "$_id" },
  //           pipeline: [
  //             { $unwind: "$order" }, // Flatten orders array
  //             { $match: { $expr: { $eq: ["$order.idRoom", "$$roomId"] } } }, // Match room ID
  //             {
  //               $project: {
  //                 _id: 0,
  //                 idUser: "$order.idUser",
  //                 userInput: "$order.userInput",
  //                 phoneInput: "$order.phoneInput",
  //                 dateInput: "$order.dateInput",
  //                 totalMoney: "$order.totalMoney",
  //                 pay: "$order.pay",
  //                 paymentMethod: "$order.paymentMethod",
  //                 transactionId: "$order.transactionId",
  //                 deposit: "$order.deposit",
  //                 statusOrder: "$order.statusOrder",
  //                 extraServices: "$order.extraServices",
  //                 idOrder: "$order.idOrder"
  //               }
  //             }
  //           ],
  //           as: "orderDetails"
  //         }
  //       }
  //     ]).toArray();

  //     return roomsWithSectors;
  //   } catch (error) {
  //     console.error("Error in fetching rooms with sectors:", error);
  //     throw error;
  //   }
  // }

  async check(filter) {
    try {
      const roomsWithDetails = await this.Room.aggregate([
        { $match: filter || {} }, // Apply the filter
        {
          $addFields: {
            idSectorRoom: { $toObjectId: "$idSectorRoom" }, // Convert string to ObjectId
            cmtRoom: {
              $filter: {
                input: "$cmtRoom", // Filter comments
                as: "comment",
                cond: { $eq: ["$$comment.isDeleted", false] }
              }
            }
          }
        },
        {
          $lookup: {
            from: "sectors", // Join with sectors
            localField: "idSectorRoom",
            foreignField: "_id",
            as: "sectorDetails"
          }
        },
        {
          $unwind: {
            path: "$sectorDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "users", // Join with users to fetch order details
            let: { roomId: { $toString: "$_id" } },
            pipeline: [
              { $unwind: "$order" }, // Flatten orders array
              { $match: { $expr: { $eq: ["$order.idRoom", "$$roomId"] } } }, // Match room ID
              {
                $project: {
                  _id: 0,
                  idUser: "$order.idUser",
                  userInput: "$order.userInput",
                  phoneInput: "$order.phoneInput",
                  dateInput: "$order.dateInput",
                  totalMoney: "$order.totalMoney",
                  pay: "$order.pay",
                  paymentMethod: "$order.paymentMethod",
                  transactionId: "$order.transactionId",
                  deposit: "$order.deposit",
                  statusOrder: "$order.statusOrder",
                  extraServices: "$order.extraServices",
                  idOrder: "$order.idOrder"
                }
              }
            ],
            as: "orderDetails"
          }
        }        
      ]).toArray();

      return roomsWithDetails;
    } catch (error) {
      console.error("Error in fetching rooms with details:", error);
      throw error;
    }
  }

  async checkByIdRoom(filter) {
    try {
      const cursor = await this.Room.aggregate([
        {
          $match: {
            _id: ObjectId.isValid(filter.idRoom) ? new ObjectId(filter.idRoom) : null,
          },
        },
        {
          $addFields: {
            cmtRoom: {
              $filter: {
                input: "$cmtRoom", // The comments array
                as: "comment", // Alias for each comment
                cond: { $eq: ["$$comment.isDeleted", false] } // Only include comments that are not deleted
              }
            }
          }
        },
        {
          $lookup: {
            from: "users", // Join with users to fetch order details
            let: { roomId: { $toString: "$_id" } },
            pipeline: [
              { $unwind: "$order" }, // Flatten orders array
              { $match: { $expr: { $eq: ["$order.idRoom", "$$roomId"] } } }, // Match room ID
              {
                $project: {
                  _id: 0,
                  idUser: "$order.idUser",
                  userInput: "$order.userInput",
                  phoneInput: "$order.phoneInput",
                  dateInput: "$order.dateInput",
                  totalMoney: "$order.totalMoney",
                  pay: "$order.pay",
                  paymentMethod: "$order.paymentMethod",
                  transactionId: "$order.transactionId",
                  deposit: "$order.deposit",
                  statusOrder: "$order.statusOrder",
                  extraServices: "$order.extraServices",
                  idOrder: "$order.idOrder"
                }
              }
            ],
            as: "orderDetails"
          }
        }
      ]);

      return cursor.toArray();
    } catch (error) {
      console.error("Error in fetching room with filtered comments:", error);
      throw error;
    }
  }

  async searchRoom(queryParams) {
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
          idSectorRoom: { $toObjectId: "$idSectorRoom" }, // Convert string to ObjectId
          cmtRoom: {
            $filter: {
              input: "$cmtRoom", // The comments array
              as: "comment", // Alias for each comment
              cond: { $eq: ["$$comment.isDeleted", false] }
            }
          }
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

    // console.log(rooms.length);

    if (!dateRange) {
      // Manually paginate the results
      const startIndex = (page - 1) * limit;
      const paginatedRooms = rooms.slice(startIndex, startIndex + limit);
      return { totalRooms: rooms.length, paginatedRooms };
    }

    const [inputStartDate, inputEndDate] = dateRange?.split(',').map(date => new Date(date));

    function parseDate(dateStr) {
      const [day, month, year] = dateStr.split("/").map(Number);
      return new Date(Date.UTC(year, month - 1, day)); // Months are zero-indexed
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

    const result = await this.Room.deleteOne({
      _id: ObjectId.isValid(payload._id) ? new ObjectId(payload._id) : null,
    });
    return result;
  }

  async deleteDateRoom(payload) {

    const result = await this.Room.updateOne(
      { _id: ObjectId.isValid(payload.idRoom) ? new ObjectId(payload.idRoom) : null },
      { $pull: { ordersRoom: payload.dateInput } },
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

  async deleteOrderRoom(payload) {
    const { idRoom, dateOrderRoom } = payload;

    // Ensure the room ID is valid
    if (!ObjectId.isValid(idRoom)) {
      throw new Error('Invalid room ID');
    }

    // Ensure dateOrderRoom is an array
    if (!Array.isArray(dateOrderRoom)) {
      throw new Error('Invalid dateOrderRoom format');
    }

    // Perform the update to remove the specified date range from ordersRoom
    const result = await this.Room.findOneAndUpdate(
      {
        _id: new ObjectId(idRoom), // Find the room by its ID
        ordersRoom: { $elemMatch: { $eq: dateOrderRoom } }, // Match the exact array in ordersRoom
      },
      {
        $pull: { ordersRoom: { $eq: dateOrderRoom } }, // Remove the matching array from ordersRoom
      },
      { returnDocument: 'after' } // Return the updated document
    );

    // Return the result of the update
    return result;
  }


  // async findRoomByIdSector(filter) {
  //   // console.log(filter);
  //   const cursor = await this.Room.find({
  //     idSectorRoom: filter.enKhuVuc,
  //     // 'cmtRoom.isDeleted': { $ne: true } 
  //   });    
  //   return await cursor.toArray();
  // }

  async findRoomByIdSector(filter) {
    try {
      const roomsWithSectors = await this.Room.aggregate([
        {
          $match: { idSectorRoom: filter.enKhuVuc }
        },
        {
          $addFields: {
            idSectorRoom: { $toObjectId: "$idSectorRoom" }, // Convert string to ObjectId
            cmtRoom: {
              $filter: {
                input: "$cmtRoom", // The comments array
                as: "comment", // Alias for each comment
                cond: { $eq: ["$$comment.isDeleted", false] } // Only include comments that are not deleted
              }
            }
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

    return await cursor.toArray();
  }


  async findAvailableRooms(datesArray) {

    // Tìm tất cả các phòng
    const rooms = await this.Room.find({}).toArray();

    function parseDate(dateStr) {
      const [day, month, year] = dateStr.split("/").map(Number);
      return new Date(Date.UTC(year, month - 1, day)); // Months are zero-indexed
    }

    // Chuyển đổi `datesArray` thành các ngày đầu và cuối
    const [inputStartDate, inputEndDate] = datesArray.map(parseDate);

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

    return availableRooms;
  }

  async EditRoom(payload) {

    const currentRoom = await this.Room.findOne({ _id: ObjectId.isValid(payload._id) ? new ObjectId(payload._id) : null });

    if (!currentRoom) {
      throw new Error('Room not found');
    }

    let updatedImgRoom = currentRoom.imgRoom;
    payload.imgRoom.forEach((newItem, index) => {
      if (Object.keys(newItem).length > 0) {  // Nếu phần tử mới không rỗng
        updatedImgRoom[index] = newItem;  // Thay thế phần tử trong mảng
      }
    });

    const updateObject = Object.keys(payload).reduce((acc, key) => {
      // Chỉ thêm các trường có giá trị khác rỗng vào đối tượng cập nhật
      if (key !== "_id" && payload[key] !== "") {
        acc[key] = payload[key];
      }
      return acc;
    }, {});

    // Cập nhật lại imgRoom nếu đã thay đổi
    if (updatedImgRoom.length > 0) {
      updateObject.imgRoom = updatedImgRoom;
    }

    //Nếu updateObject không trống, tiến hành cập nhật
    if (Object.keys(updateObject).length > 0) {
      const result = await this.Room.findOneAndUpdate(
        {
          _id: ObjectId.isValid(payload._id) ? new ObjectId(payload._id) : null,
        },
        { $set: updateObject },
        { returnDocument: "after", upsert: true }
      );

      return result;
    } else {
      console.log("Không có giá trị nào khác rỗng để cập nhật.");
      return null;
    }
  }

  async getAllCommentsIncludeHide() {
    const comments = await this.Room.aggregate([
      { $unwind: "$cmtRoom" },
      {
        $addFields: {
          "cmtRoom.idUser": { $toObjectId: "$cmtRoom.idUser" }
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
          // nameRoom: "$nameRoom",
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

    // If there are any comments, return the array of all comments
    return comments.length > 0 ? comments.map(item => item.cmtRoom) : [];
  }

  async getAllComments() {
    const comments = await this.Room.aggregate([
      { $unwind: "$cmtRoom" },
      {
        $match: {
          "cmtRoom.isDeleted": { $ne: true } // Ensure the comments are not deleted
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

    // If there are any comments, return the array of all comments
    return comments.length > 0 ? comments.map(item => item.cmtRoom) : [];
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

  async getCommentsByIdIncludeHide(idComment) {
    const comment = await this.Room.aggregate([
      { $unwind: "$cmtRoom" },
      {
        $match: {
          "cmtRoom.idComment": idComment,
          // "cmtRoom.isDeleted": { $ne: true }
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
          "nameRoom": 1,
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
          // "cmtRoom.isDeleted": { $ne: true }
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

  async restoreComment(payload) {
    const { idRoom, idComment } = payload;

    const result = await this.Room.updateOne(
      {
        _id: ObjectId.isValid(idRoom) ? new ObjectId(idRoom) : null,
        "cmtRoom.idComment": idComment,
        "cmtRoom.isDeleted": true,
      },
      {
        $set: { "cmtRoom.$.isDeleted": false, },
        $unset: { "comments.$.deletedDate": "" }
      }
    );

    return result;
  }

}

module.exports = RoomService;
