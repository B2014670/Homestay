const { ObjectId } = require("mongodb");
class AdminService {
  constructor(client) {
    this.Admin = client.db().collection("admins");
  }

  extractAdminData(payload) {
    const admin = {
      userName: payload.userName,
      password: payload.password,
      birthYear: payload.birthYear,
      avatar: payload.avatar,
      phone: payload.phone,
      isAdmin: payload.isAdmin,
    };
    Object.keys(admin).forEach(
      (key) => admin[key] === undefined && delete admin[key]
    );
    return admin;
  }

  async check(filter, projection = null) {
    const projectionFields = projection || '';
    const cursor = await this.Admin.find(filter, { projection: projectionFields });
    return await cursor.toArray();
  }
  async checkById(payload) {
    // console.log( filter.email);
    const cursor = await this.Admin.find({
      _id: new ObjectId(payload.idAdmin),
    });
    console.log(cursor);
    return await cursor.toArray();
  }

  async register(payload) {
    const admin = await this.extractAdminData(payload);
    const result = await this.Admin.findOneAndUpdate(
      admin,
      { $set: { isAdmin: true } },
      { returnDocument: "after", upsert: true }
    );
    return result;
  }
  async addAdmin(payload) {
    // console.log(payload);
    const admin = await this.extractAdminData(payload);
    const result = await this.Admin.findOneAndUpdate(
      admin,
      { $set: { isAdmin: payload.isAdmin } },
      { returnDocument: "after", upsert: true }
    );
    return result;
  }
  async deleteAdmin(payload) {
    // console.log(payload);
    // const result = await this.Admin.deleteOne({ _id: payload.isAdmin });
    const result = await this.Admin.deleteOne({
      _id: new ObjectId(payload.idAdmin),
    });
    return result;
  }
  async EditAdmin(payload) {
    // Create a filter based on _id
    const filter = { _id: new ObjectId(payload._id) };

    // Remove _id and properties with empty string or empty array from payload
    const updateData = Object.entries(payload).reduce((acc, [key, value]) => {
      if (key !== "_id" && value !== "" && !Array.isArray(value) || (Array.isArray(value) && value.length > 0)) {
        acc[key] = value;
      }
      return acc;
    }, {});                                                                                                                                                                                                                                                    

    // Perform the update
    const result = await this.Admin.findOneAndUpdate(
      filter,
      { $set: updateData },
      { returnDocument: "after", upsert: true }
    );

    return result;
  }

  async getPhoneByAdminId(adminId) {
    const admin = await this.Admin.findOne({ _id: new ObjectId(adminId) });
    return admin ? admin.phone : null;
  }

}

module.exports = AdminService;
