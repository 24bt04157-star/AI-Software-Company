const express = require("express");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

const {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
} = require("../controllers/projectController");
 
// GET all projects
router.get("/", getProjects);

// GET project by ID
router.get("/:id", getProjectById);

// CREATE project — Admin and Manager
router.post("/", authorizeRoles("admin", "manager"), createProject);

// UPDATE project — Admin and Manager
router.put("/:id", authorizeRoles("admin", "manager"), updateProject);

// DELETE project — Admin only
router.delete("/:id", authorizeRoles("admin"), deleteProject);

module.exports = router;