const express = require("express");
const admins = require("../controllers/admin.controller");
const multer = require("multer");

const router = express.Router();



router.post("/register", admins.register);
router.post("/login", admins.login);
router.get("/getAllAdmin", admins.getAllAdmin);
router.post("/info", admins.infoAdmin);
router.post("/addAdmin", admins.addAdmin);
router.post("/editAdmin", admins.editAdmin);
router.post("/deleteAdmin", admins.deleteAdmin);

router.get("/getAllSector", admins.getAllSector);
router.post("/infoSector", admins.getInfoSector);
router.post("/addSector", admins.addSector);
router.post("/addRoomSector", admins.addRoomInSector);
router.post("/editSector", admins.editSector);
router.post("/deleteSector", admins.deleteSector);

router.get("/getAllRoom", admins.getAllRoom);
router.post("/infoRoom", admins.getInfoRoom);
router.post("/addRoom", admins.addRoom);
router.post("/editRoom", admins.editRoom);
router.post("/deleteRoom", admins.deleteRoom);

router.get("/getAllUser", admins.getAllUser);
router.post("/deleteCustomer", admins.deleteCustomer);

router.get("/getAllUserOrder", admins.getAllOrderOfAllUserForAdmin); //getAllUserOrder
router.post("/confirmOrderRoom", admins.confirmOrderRoom);
router.post("/checkinOrderRoom", admins.checkinOrderRoom);
router.post("/completeOrderRoom", admins.completeOrderRoom);
router.post("/cancelOrderRoom", admins.cancelOrderRoom);
router.post("/deleteOrderRoom", admins.deleteOrderRoom);

// extraservices
router.get("/extraservices", admins.getAllExtraServices);
router.get("/extraservices/:id", admins.getExtraServiceById);
router.post("/extraservices/", admins.createExtraService);
router.put("/extraservices/:id", admins.updateExtraService);
router.delete("/extraservices/:id", admins.deleteExtraService);

// comment
router.get("/comments", admins.getAllComment);
router.delete("/comments", admins.softDeleteComment);
router.post("/comments", admins.unSoftDeleteComment);



module.exports = router;