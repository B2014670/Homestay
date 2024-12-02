const { ObjectId } = require("mongodb");
class SectorService {
  constructor(client) {
    this.Sector = client.db().collection("sectors");
  }

  extractSectorData(payload) {
    const sector = {
      nameSector: payload.nameSector,
      discSector: payload.discSector,
      addressSector: payload.addressSector,
      totalRoomInSector: payload.totalRoomInSector,
      status: payload.status,
    };
    Object.keys(sector).forEach(
      (key) => sector[key] === undefined && delete sector[key]
    );
    return sector;
  }

  async check(filter) {
    // console.log(filter);
    const cursor = await this.Sector.find(filter);
    return await cursor.toArray();
  }

  async checkByIdSector(filter) {
    // console.log(filter);
    const cursor = await this.Sector.find({
      _id: ObjectId.isValid(filter.idSector)
        ? new ObjectId(filter.idSector)
        : null,
    });
    return await cursor.toArray();
  }

  async addSector(payload) {
    console.log(payload);
    const sector = await this.extractSectorData(payload);
    const result = await this.Sector.findOneAndUpdate(
      sector,
      { $set: { totalRoomInSector: 0, status: 1 } },
      { returnDocument: "after", upsert: true }
    );
    console.log(result);
    return result;
  }
  async addOneRoomInSector(payload) {
    // console.log(payload);

    const result = await this.Sector.findOneAndUpdate(
      {
        _id: ObjectId.isValid(payload.idSector)
          ? new ObjectId(payload.idSector)
          : null,
      },
      { $inc: { totalRoomInSector: 1 } },
      { returnDocument: "after", upsert: true }
    );
    console.log(result);
    return result;
  }

  async EditSector(payload) {
    // Sao chép payload và loại bỏ idSector
    const { idSector, ...updateData } = payload;
    // Loại bỏ các trường có giá trị null hoặc undefined
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === null || updateData[key] === undefined|| updateData[key] === "") {
        delete updateData[key];
      }
    });
    // Kiểm tra và chuyển đổi idSector thành ObjectId hợp lệ
    const filter = {
      _id: ObjectId.isValid(idSector) ? new ObjectId(idSector) : null,
    };
    // Thực hiện cập nhật với dữ liệu đã loại bỏ các trường null hoặc undefined
    const result = await this.Sector.findOneAndUpdate(
      filter,
      { $set: updateData },
      { returnDocument: "after", upsert: true }
    );

    return result;
  }


  async DeleteSector(payload) {
  // Kiểm tra và chuyển đổi idSector thành ObjectId hợp lệ
  const filter = {
    _id: ObjectId.isValid(payload.idSector) ? new ObjectId(payload.idSector) : null,
  };
  // Thực hiện xóa Sector với id tương ứng
  const result = await this.Sector.findOneAndDelete(filter);

  return result;
}
}

module.exports = SectorService;
