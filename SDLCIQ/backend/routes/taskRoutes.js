const express = require("express");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
} = require("../controllers/taskController");

const router = express.Router();

router.use(authenticateToken);

// GET all tasks
router.get("/", getTasks);

// GET task by ID
router.get("/:id", getTaskById);

// CREATE task — Admin, Manager and Developer
router.post(
    "/",
    authorizeRoles("admin", "manager", "developer"),
    createTask
);

// UPDATE task — Admin, Manager and Developer
router.put(
    "/:id",
    authorizeRoles("admin", "manager", "developer"),
    updateTask
);

// DELETE task — Admin and Manager
router.delete(
    "/:id",
    authorizeRoles("admin", "manager"),
    deleteTask
);

module.exports = router;