const express = require("express");
const admins = require("../controllers/admin.controller");
const multer = require("multer");

const router = express.Router();



router.post("/register", admins.register);

router.post("/login", admins.login);

router.post("/info", admins.infoAdmin);

router.post('/addSector', admins.addSector);

router.get("/getAllSector", admins.getAllSector);

router.post('/addRoom', admins.addRoom);

router.post('/deleteRoom', admins.deleteRoom);

router.post('/deleteAdmin', admins.deleteAdmin);

router.get("/getAllRoom", admins.getAllRoom);

router.get("/getAllUser", admins.getAllUser);

router.get("/getAllUserOrder", admins.getAllUserOrder);

router.get("/getAllAdmin", admins.getAllAdmin);

router.post('/confirmOrderRoom', admins.confirmOrderRoom);

router.post("/infoRoom", admins.getInfoRoom);

router.post('/completeOrderRoom', admins.completeOrderRoom);

router.post('/deleteOrderRoom', admins.deleteOrderRoom);

router.post("/infoSector", admins.getInfoSector);

router.post('/addAdmin', admins.addAdmin);

router.post("/addRoomSector", admins.addRoomInSector);

router.post("/editSector", admins.editSector);

router.post("/deleteSector", admins.deleteSector);

router.post("/editAdmin", admins.editAdmin);

router.post("/editRoom", admins.editRoom);

router.post('/deleteCustomer', admins.deleteCustomer);



module.exports = router;