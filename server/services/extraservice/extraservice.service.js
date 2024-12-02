const { ObjectId } = require("mongodb");

class ExtraServiceService {
    constructor(client) {
        this.ExtraService = client.db().collection("services");
    }

    extractExtraServiceData(payload) {
        const extraService = {
            name: payload.name,
            description: payload.description,
            price: payload.price,
            status: payload.status, // 0: inactive, 1: active
        };
        Object.keys(extraService).forEach(
            (key) => extraService[key] === undefined && delete extraService[key]
        );
        return extraService;
    }

    async getAll(filter = {}) {
        try {
            const cursor = await this.ExtraService.find(filter);
            return { success: true, data: await cursor.toArray() };
        } catch (error) {
            console.error("Error in getAll:", error);
            return { success: false, message: "Unable to retrieve extra services" };
        }
    }

    async getById(idExtraService) {
        try {
            const filter = {
                _id: ObjectId.isValid(idExtraService) ? new ObjectId(idExtraService) : null,
            };
            const result = await this.ExtraService.findOne(filter);
            return result
                ? { success: true, data: result }
                : { success: false, message: "Extra service not found" };
        } catch (error) {
            console.error("Error in getById:", error);
            return { success: false, message: "Invalid service ID" };
        }
    }

    async createExtraService(payload) {
        try {
            const extraService = this.extractExtraServiceData(payload);

            const filter = { name: extraService.name };
            const update = {
                $set: {
                    description: extraService.description,
                    price: extraService.price,
                    status: 1,
                },
            };

            const options = { returnDocument: "after", upsert: true };
            const result = await this.ExtraService.findOneAndUpdate(filter, update, options);

            return { success: true, data: result };
        } catch (error) {
            console.error("Error in createExtraService:", error);
            return { success: false, message: "Unable to create extra service" };
        }
    }

    async updateExtraService(payload) {
        try {
            const { id, ...updateData } = payload;

            // Loại bỏ các trường có giá trị null hoặc undefined
            Object.keys(updateData).forEach((key) => {
                if (updateData[key] === null || updateData[key] === undefined || updateData[key] === "") {
                    delete updateData[key];
                }
            });

            const filter = {
                _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
            };

            if (!filter._id) {
                return { success: false, message: "Invalid Extra Service ID" };
            }

            const result = await this.ExtraService.findOneAndUpdate(
                filter,
                { $set: updateData },
                { returnDocument: "after", upsert: true }
            );

            return result
        } catch (error) {
            console.error("Error in updateExtraService:", error);
            return { success: false, message: "Unable to update extra service" };
        }
    }

    async deleteExtraService(idExtraService) {
        try {
            const filter = {
                _id: ObjectId.isValid(idExtraService) ? new ObjectId(idExtraService) : null,
            };

            if (!filter._id) {
                return { success: false, message: "Invalid Extra Service ID" };
            }

            const result = await this.ExtraService.findOneAndDelete(filter);
            if (result) {
                return { success: true };
            }

            return { success: false, message: "Extra service not found" };
        } catch (error) {
            console.error("Error in deleteExtraService:", error);
            return { success: false, message: "Unable to delete extra service" };
        }
    }
}

module.exports = ExtraServiceService;
