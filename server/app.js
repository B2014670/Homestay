const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const config = require("./config");
const MongoDB = require("./utils/mongodb.util");

const userRouter = require("./routers/user.route");
const adminRouter = require("./routers/admin.route");
const dialogflowRouter = require("./routers/dialogflow.route");
const ApiError = require("./api-error");

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

// Initialize Socket.IO with CORS options
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log(`${socket.id} user just connected!`);

    // Listen for incoming messages
    socket.on('sendMessage', async (data) => {
        console.log('Message received:', data);

        // Use MongoDB to save message
        try {
            const db = MongoDB.getDb();  // Use existing MongoDB connection
            const result = await db.collection('messages').insertOne({
                sender: data.sender,
                content: data.content,
                timestamp: new Date(),
            });
            console.log('Message saved to MongoDB:', result.insertedId);

            // Broadcast the message to all clients
            io.emit('receiveMessage', {
                sender: data.sender,
                content: data.content,
                timestamp: new Date(),
            });
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`${socket.id} user disconnected!`);
    });
});


module.exports = { app, server }; 
