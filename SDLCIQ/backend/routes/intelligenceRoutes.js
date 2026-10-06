const express = require("express");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    getProjectInsights
} = require("../controllers/intelligenceController");

const router = express.Router();

router.use(authenticateToken);

router.get(
    "/project/:id",
    getProjectInsights
);

module.exports = router;