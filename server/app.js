const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const config = require("./config");
const MongoDB = require("./utils/mongodb.util");
const ConversationService = require("./services/conversation/conversation.service");
const AdminService = require("./services/admin/admin.service");
const chat = require("./controllers/chat.controller");

const userRouter = require("./routers/user.route");
const adminRouter = require("./routers/admin.route");
const dialogflowRouter = require("./routers/dialogflow.route");
const ApiError = require("./api-error");
const jwtMethod = require('./utils/jwt.util');
const onlineAdmins = require("./utils/onlineAdmins");

const app = express();

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

// CORS setup
app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Define API routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/dialogflow", dialogflowRouter);

app.get("/", (req, res) => {
    res.json({ message: "Welcome to website book homestay." });
});
app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});

app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
    });
});

// Setup HTTP server
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

// Socket.IO cho các sự kiện thời gian thực
let users = [];

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on('addUser', userId => {
        const isUserExist = users.find(user => user.userId === userId);
        if (!isUserExist) {
            const user = { userId, socketId: socket.id };
            users.push(user);
            io.emit('getUsers', users);
        }
    });

    // Listen for admin coming online
    socket.on("adminOnline", (phone) => {
        onlineAdmins.addAdmin(phone, socket.id);
        io.emit("updateOnlineAdmins", onlineAdmins.getAdmins());
    });

    // // Listen for admin going offline
    // socket.on("adminOffline", (phone) => {
    //     console.log('object', onlineAdmins.getAdmins());
    //     onlineAdmins.removeAdmin(phone);
    //     console.log('object', onlineAdmins.getAdmins());
    //     io.emit("updateOnlineAdmins", onlineAdmins.getAdmins());
    // });


    // Nhận tin nhắn và phát tới phòng
    socket.on("sendMessage", async (data) => {
        try {
            const { conversationId, senderId, role, text } = data;
            const conversationService = new ConversationService(MongoDB.client);
            const adminService = new AdminService(MongoDB.client);

            const conversation = await conversationService.findById(conversationId);

            if (!conversation) {
                console.log("Conversation not found");
                return;
            }

            const result = await conversationService.addMessage(conversationId, senderId, role, text);

            // Notify the customer (if they are online)
            const customer = users.find(user => user.userId === conversation.customerId);
            if (customer) {
                io.to(customer.socketId).emit("getMessage", result);
            }

            // Notify each online admin
            const adminPhones = await Promise.all(
                conversation.adminIds.map(adminId => adminService.getPhoneByAdminId(adminId))
            );

            adminPhones.forEach(phone => {
                if (phone) {  // Only proceed if phone is found
                    const onlineAdmin = onlineAdmins.getAdmins().find(admin => admin.phone === phone);
                    if (onlineAdmin) {
                        io.to(onlineAdmin.socketId).emit("getMessage", result);
                    }
                }
            });
           
        } catch (error) {
            console.error('Error in sendMessage event:', error);
        }
    });

    socket.on('disconnect', () => {
        users = users.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', users);
 
        const admin = onlineAdmins.getAdmins().find(admin => admin.socketId === socket.id);
        console.log('admin', admin);
        if (admin) {
            onlineAdmins.removeAdmin(admin.phone);
        }

        console.log('User disconnected:', socket.id);
    });
});


module.exports = { app, server }; 
