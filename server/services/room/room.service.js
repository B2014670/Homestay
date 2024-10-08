const { ObjectId } = require("mongodb");
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
    console.log(payload);

    const result = await this.Room.updateOne(
      { _id: ObjectId.isValid(payload.idRoom) ? new ObjectId(payload.idRoom) : null },
      { $pull: { ordersRoom: { $in: payload.dateOrderRoom } } }
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


}

module.exports = RoomService;
