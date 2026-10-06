const express = require("express");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    getBugs,
    getBugById,
    createBug,
    updateBug,
    deleteBug
} = require("../controllers/bugController");

const router = express.Router();

router.use(authenticateToken);

// GET all bugs
router.get("/", getBugs);

// GET bug by ID
router.get("/:id", getBugById);

// CREATE bug — Admin, Manager, Developer and Tester
router.post(
    "/",
    authorizeRoles("admin", "manager", "developer", "tester"),
    createBug
);

// UPDATE bug — Admin, Manager, Developer and Tester
router.put(
    "/:id",
    authorizeRoles("admin", "manager", "developer", "tester"),
    updateBug
);

// DELETE bug — Admin and Manager
router.delete(
    "/:id",
    authorizeRoles("admin", "manager"),
    deleteBug
);

module.exports = router;