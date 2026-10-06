const express = require("express");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    getActivityLogs,
    createActivityLog
} = require("../controllers/activityLogController");

const router = express.Router();

router.use(authenticateToken);

router.get("/", getActivityLogs);

router.post("/", createActivityLog);

module.exports = router;