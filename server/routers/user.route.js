const express = require("express");
const users = require("../controllers/user.controller");
const chat = require("../controllers/chat.controller");
const forgotPasswordLimiter = require('../middleware/forgotPasswordLimiter');


const router = express.Router();



router.post("/register", users.register);

router.post("/login", users.login);

router.post("/checkEmailLinked", users.checkEmailLinked );

router.post("/oauthLogin", users.oauthLogin);

router.post("/validateToken", users.validateToken);

router.post("/token", users.refreshToken);

router.post("/info", users.infoUser);

router.post("/updateInfoUser", users.updateInfoUser);

router.post('/forgot-password', forgotPasswordLimiter,  users.forgotPassword);

router.post('/reset-password/:token', users.resetPassword);

router.post('/changePassword', users.changePassword);

router.post("/searchRoom", users.searchRoom);

router.get("/getAllRoom", users.getAllRoom);

router.post("/orderRoom", users.orderRoom);

router.post("/infoRoom", users.getInfoRoom);

router.post("/getRoomWithSector", users.getRoomWithSector);

router.post("/cancelOrderRoom", users.cancelOrderRoom);

router.post("/updatePaypalOrder", users.updatePaypalOrder);

router.post("/infoSector", users.getInfoSector);

router.get("/getAllSector", users.getAllSector);

// router.get("/getAllTypeRoom", users.getAllTypeRoom);

router.post('/wishlist', users.createWishlist);

router.get('/wishlist/:userId', users.getUserWishlist);

router.get('/wishlist/:userId/room', users.getUserWishlistRooms);

router.put('/wishlist/:id', users.updateWishlist);

router.delete('/wishlist', users.deleteWishlist);

router.get("/:userId/orders", users.getAllOrderOfUser);

router.get("/:userId/orders/:idOrder", users.getAllOrderOfUserById);

router.get("/:userId/comments", users.getAllCommentOfUser);

router.get("/comments/room/:roomId", users.getAllCommentOfRoom);

router.get("/comments/:id", users.getOneComment);

router.post("/comments", users.createComment);

router.put("/comments", users.updateComment);

router.delete("/comments", users.softDeleteComment);

router.post("/conversation", chat.createConversation);

router.post("/conversation/message", chat.addMessage);

router.get("/:userId/conversation", chat.findConversationByCustomer);

router.get("/conversation/:conversationId/message", chat.getMessagesForConversation)

router.delete("/conversation/:conversationId", chat.endConversation);

router.put("/conversation/update-admin", chat.updateAdmin);

router.get('/admins/:adminId/conversations', chat.getConversationsForAdmin);

module.exports = router;
