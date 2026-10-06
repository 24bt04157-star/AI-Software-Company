const express = require("express");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    getRequirements,
    getRequirementById,
    createRequirement,
    updateRequirement,
    deleteRequirement
} = require("../controllers/requirementController");

const router = express.Router();

router.use(authenticateToken);

// GET all requirements
router.get("/", getRequirements);

// GET requirement by ID
router.get("/:id", getRequirementById);

// CREATE requirement
router.post("/", createRequirement);

// UPDATE requirement
router.put("/:id", updateRequirement);

// DELETE requirement
router.delete("/:id", deleteRequirement);

module.exports = router;