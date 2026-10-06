const express = require("express");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require("../controllers/userController");

const router = express.Router();

router.use(authenticateToken);

// GET all users
router.get("/", getUsers);

// GET user by ID
router.get("/:id", getUserById);

// CREATE user — Admin only
router.post("/", authorizeRoles("admin"), createUser);

// UPDATE user — Admin only
router.put("/:id", authorizeRoles("admin"), updateUser);

// DELETE user — Admin only
router.delete("/:id", authorizeRoles("admin"), deleteUser);

module.exports = router;