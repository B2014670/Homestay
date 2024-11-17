
const ApiError = require("../api-error");
const ConversationService = require("../services/conversation/conversation.service");
const AdminService = require("../services/admin/admin.service");
const MongoDB = require("../utils/mongodb.util");
const onlineAdmins = require("../utils/onlineAdmins");

exports.createConversation = async (req, res, next) => {
    try {

        const { customerId } = req.body;       
        if (!customerId) {
            return next(new ApiError(400, "Customer ID is required."));
        }

        const conversationService = new ConversationService(MongoDB.client);

        // Kiểm tra tồn tại
        const existingConversation = await conversationService.findConversationByCustomer(customerId);
        if (existingConversation) {
            return res.json(existingConversation);
        }

        // Lấy danh sách các admin online
        const onlineAdminPhones = onlineAdmins.getAdmins().map(admin => admin.phone);
        const selectedAdminPhone = onlineAdminPhones[0] || '0000000001';

        const adminService = new AdminService(MongoDB.client);
        const admin = await adminService.check({ phone: selectedAdminPhone }, { password: 0 });


        if (!admin[0]) {
            return next(new ApiError(404, "Admin not found."));
        }

        const newConversation = await conversationService.createOrGetConversation(customerId, admin[0]._id.toString());
        return res.status(201).json(newConversation);

    } catch (error) {
        console.error("Error creating conversation:", error);
        return next(new ApiError(500, "An error occurred while creating the conversation."));
    }
};

exports.addMessage = async (req, res, next) => {
    try {
        const { conversationId, senderId, role, text } = req.body;

        // Validate input
        if (!conversationId || !senderId || !text) {
            return next(new ApiError(400, "Conversation ID, Sender ID, and message text are required."));
        }

        const conversationService = new ConversationService(MongoDB.client);
        const result = await conversationService.addMessage(conversationId, senderId, role, text);
        return res.status(200).json(result);

    } catch (error) {
        console.error("Error adding message:", error);
        return next(new ApiError(500, "An error occurred while adding the message."));
    }
};

exports.findConversationByCustomer = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Check if conversation already exists
        const conversationService = new ConversationService(MongoDB.client);

        const existingConversation = await conversationService.findConversationByCustomer(userId);
        
        if (existingConversation) {
            return res.json(existingConversation);
        }

        return res.json(null);

    } catch (error) {
        console.error("Error finding or creating conversation:", error);
        return next(new ApiError(500, "An error occurred while findConversationByCustomer."));
    }
};

exports.getMessagesForConversation = async (req, res, next) => {
    try {
        const { conversationId } = req.params;

        const conversationService = new ConversationService(MongoDB.client);
        const messages = await conversationService.getMessagesWithUser(conversationId);
        return res.status(200).json(messages);

    } catch (error) {
        console.error("Error retrieving messages:", error);
        return next(new ApiError(500, "An error occurred while retrieving messages."));
    }
};

// End an active conversation
exports.endConversation = async (req, res, next) => {
    try {
        const { conversationId } = req.params;

        const conversationService = new ConversationService(MongoDB.client);
        const result = await conversationService.endConversation(conversationId);
        return res.status(200).json(result);

    } catch (error) {
        console.error("Error ending conversation:", error);
        return next(new ApiError(500, "An error occurred while ending the conversation."));
    }
};

// Change the admin handling the conversation
exports.updateAdmin = async (req, res, next) => {
    try {
        const { conversationId, newAdminId } = req.body;

        // Validate input
        if (!conversationId || !newAdminId) {
            return next(new ApiError(400, "Conversation ID and New Admin ID are required."));
        }

        const conversationService = new ConversationService(MongoDB.client);
        const updatedConversation = await conversationService.updateAdminInConversation(conversationId, newAdminId);
        return res.status(200).json(updatedConversation);

    } catch (error) {
        console.error("Error updating admin:", error);
        return next(new ApiError(500, "An error occurred while updating the admin."));
    }
};

exports.getConversationsForAdmin = async (req, res, next) => {
    try {
        const { adminId } = req.params;

        const conversationService = new ConversationService(MongoDB.client);
        const conversations = await conversationService.getConversationsForAdmin(adminId);
        return res.status(200).json(conversations);

    } catch (error) {
        console.error("Error fetching conversations for admin:", error);
        return next(new ApiError(500, "An error occurred while fetching conversations for the admin."));
    }
};