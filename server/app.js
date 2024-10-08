const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');

const userRouter = require("./routers/user.route");
const adminRouter = require("./routers/admin.route");
const dialogflowRouter = require("./routers/dialogflow.route");
const ApiError = require("./api-error");

const app = express();

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow credentials (cookies, authorization headers)
}));
// app.use(cors({
//     origin: 'http://localhost:3000', 
//     // origin: 'http://localhost:3001',
//     credentials: true, // Allow credentials (cookies, authorization headers)
// }));
app.use(express.json());
app.use(cookieParser());

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



module.exports = app;
