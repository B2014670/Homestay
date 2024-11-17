const { ObjectId } = require("mongodb");
require("dotenv").config();

class ConversationService {
    constructor(client) {
        this.Conversation = client.db().collection("conversations");
    }

    extractConversationData(payload) {
        const conversation = {
            customerId: payload.customerId,
            adminIds: [payload.adminId], // Start with the initial admin
            messages: [],
            active: true,
            startedAt: new Date(),
        };

        // Remove undefined fields
        Object.keys(conversation).forEach(
            (key) => conversation[key] === undefined && delete conversation[key]
        );

        return conversation;
    }

    async findById(conversationId) {
        try {
            return await this.Conversation.findOne({
                _id: new ObjectId(conversationId),
                active: true,
            });
        } catch (error) {
            throw new Error("Error finding conversation: " + error.message);
        }
    }

    // Find an active conversation by customerId
    async findConversationByCustomer(customerId) {
        console.log('customerId', customerId);
        try {
            const conversation = await this.Conversation.findOne({
                customerId: customerId,
                active: true
            });
            return conversation;
        } catch (error) {
            console.log(error);
            throw new Error("Error finding conversation: " + error.message);
        }
    }

    // Create or get a conversation for a customer
    async createOrGetConversation(customerId, adminId) {
        try {
            const existingConversation = await this.Conversation.findOne({
                customerId: customerId,
                active: true,
            });

            if (existingConversation) {
                // If the conversation exists, add the adminId if not already present
                if (!existingConversation.adminIds.includes(adminId)) {
                    await this.Conversation.updateOne(
                        { _id: existingConversation._id },
                        { $addToSet: { adminIds: adminId } }
                    );
                }
                return existingConversation; // Return existing conversation
            }

            const newConversation = this.extractConversationData({
                customerId,
                adminId,
            });

            const result = await this.Conversation.insertOne(newConversation);
            return result.ops[0] || newConversation;
        } catch (error) {
            throw new Error("Error creating or getting conversation: " + error.message);
        }
    }

    // Add a message to a conversation
    async addMessage(conversationId, senderId, role, text) {
        try {
            if (!ObjectId.isValid(conversationId) || !ObjectId.isValid(senderId)) {
                throw new Error("Invalid conversationId or senderId format");
            }

            const message = {
                senderId: senderId,
                text,
                role,
                timestamp: new Date()
            };

            const result = await this.Conversation.updateOne(
                { _id: new ObjectId(conversationId) },
                {
                    $push: {
                        messages: message,
                    },
                }
            );

            if (result.modifiedCount === 0) {
                throw new Error("Message not added, conversation not found.");
            }

            const messages = await this.Conversation.aggregate([
                { $match: { _id: new ObjectId(conversationId) } },
                // Get only the last message in the messages array
                { $project: { messages: { $slice: ["$messages", -1] } } },
                {
                    $unwind: {
                        path: "$messages",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        "messages.senderId": { $toObjectId: "$messages.senderId" }
                    }
                },
                {
                    $lookup: {
                        from: "admins",
                        localField: "messages.senderId",
                        foreignField: "_id",
                        as: "adminInfo"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "messages.senderId",
                        foreignField: "_id",
                        as: "userInfo"
                    }
                },
                {
                    $addFields: {
                        senderInfo: {
                            $cond: {
                                if: { $eq: ["$messages.role", "admin"] },
                                then: { $arrayElemAt: ["$adminInfo", 0] },
                                else: { $arrayElemAt: ["$userInfo", 0] }
                            }
                        }
                    }
                },
                {
                    $project: {
                        message: "$messages.text",
                        timestamp: "$messages.timestamp",
                        role: "$messages.role",
                        senderInfo: {
                            _id: 1,
                            phone: 1,
                            img: 1,
                            name: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                }
            ]).toArray();

            return messages[0]
        } catch (error) {
            throw new Error("Error adding message: " + error.message);
        }
    }

    // Update the admin handling the conversation
    async getMessagesWithUser(conversationId) {
        try {
            // Ensure valid ObjectId format
            if (!ObjectId.isValid(conversationId)) {
                throw new Error("Invalid conversation ID");
            }

            const messages = await this.Conversation.aggregate([
                {
                    $match: {
                        _id: new ObjectId(conversationId)
                    }
                },
                {
                    $unwind: {
                        path: "$messages",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        "messages.senderId": { $toObjectId: "$messages.senderId" }
                    }
                },
                {
                    $lookup: {
                        from: "admins",
                        localField: "messages.senderId",
                        foreignField: "_id",
                        as: "adminInfo"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "messages.senderId",
                        foreignField: "_id",
                        as: "userInfo"
                    }
                },
                {
                    $project: {
                        message: "$messages.text",
                        timestamp: "$messages.timestamp",
                        role: "$messages.role",
                        senderInfo: {
                            $cond: {
                                if: { $eq: ["$messages.role", "admin"] },
                                then: {
                                    $arrayElemAt: ["$adminInfo", 0]
                                },
                                else: {
                                    $arrayElemAt: ["$userInfo", 0]
                                }
                            }
                        }
                    }
                },
                // After projecting the senderInfo, include only the necessary fields
                {
                    $project: {
                        message: 1,
                        timestamp: 1,
                        role: 1,
                        senderInfo: {
                            _id: 1,
                            phone: 1,
                            img: 1,
                            name: 1,
                            username: 1,
                            avatar: 1,
                        }
                    }
                }
            ]).toArray();

            // Handle case where there are no messages found
            if (!messages || messages.length === 0) {
                throw new Error("Conversation not found or has no messages.");
            }

            return messages;
        } catch (error) {
            console.error("Error retrieving messages:", error);
            throw new Error("Error retrieving messages: " + error.message);
        }
    }

    async updateAdminInConversation(conversationId, newAdminId) {
        try {
            if (!ObjectId.isValid(conversationId) || !ObjectId.isValid(newAdminId)) {
                throw new Error("Invalid conversationId or newAdminId format");
            }

            const result = await this.Conversation.updateOne(
                { _id: new ObjectId(conversationId) },
                { $addToSet: { adminIds: newAdminId } }
            );

            if (result.modifiedCount === 1) {
                return await this.Conversation.findOne({ _id: new ObjectId(conversationId) });
            }

            throw new Error("Admin update failed, no conversation found.");
        } catch (error) {
            throw new Error("Error updating admin: " + error.message);
        }
    }

    // End a conversation by marking it inactive
    async endConversation(conversationId) {
        try {
            if (!ObjectId.isValid(conversationId)) {
                throw new Error("Invalid conversationId format");
            }

            const result = await this.Conversation.updateOne(
                { _id: new ObjectId(conversationId) },
                { $set: { active: false, endedAt: new Date() } }
            );

            if (result.modifiedCount === 0) {
                throw new Error("Conversation not found or already ended.");
            }
            return result;
        } catch (error) {
            throw new Error("Error ending conversation: " + error.message);
        }
    }

    // Retrieve all conversations for a specific admin
    async getConversationsForAdmin(adminId) {
        try {
            if (!ObjectId.isValid(adminId)) {
                throw new Error("Invalid adminId format");
            }

            return await this.Conversation.find({ adminIds: adminId }).toArray();
        } catch (error) {
            throw new Error("Error fetching conversations for admin: " + error.message);
        }
    }
}

module.exports = ConversationService;