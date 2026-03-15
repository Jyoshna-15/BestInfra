const express = require("express");
const router = express.Router();

const { getNotifications } = require("../controllers/notificationcontroller");
const protect = require("../middleware/authMiddleware");

router.get("/notifications", protect, getNotifications);

module.exports = router;