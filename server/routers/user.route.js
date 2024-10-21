const express = require("express");
const users = require("../controllers/user.controller");
const forgotPasswordLimiter = require('../middleware/forgotPasswordLimiter');


const router = express.Router();



router.post("/register", users.register);

router.post("/login", users.login);

router.post("/checkEmailLinked", users.checkEmailLinked );

router.post("/oauthLogin", users.oauthLogin);

router.post("/validateToken", users.validateToken);

router.post("/token", users.refreshToken);

router.post("/info", users.infoUser);

router.post('/forgot-password', forgotPasswordLimiter,  users.forgotPassword);

router.post('/reset-password/:token', users.resetPassword);

router.post('/changePassword', users.changePassword);

router.post("/searchRoom", users.searchRoom);

router.get("/getAllRoom", users.getAllRoom);

router.post("/orderRoom", users.orderRoom);

router.post("/infoRoom", users.getInfoRoom);

router.post("/cancleOrderRoom", users.cancleOrderRoom);

router.post("/updatePaypalOrder", users.updatePaypalOrder);

router.post("/infoSector", users.getInfoSector);

router.post("/updateInfoUser", users.updateInfoUser);

router.get("/getAllSector", users.getAllSector);

// router.get("/getAllTypeRoom", users.getAllTypeRoom);
module.exports = router;
