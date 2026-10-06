const express = require("express");
const router = express.Router();

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    getProjectRisk
} = require("../controllers/aiController");

router.use(authenticateToken);

router.get("/project/:id/risk", getProjectRisk);

module.exports = router;