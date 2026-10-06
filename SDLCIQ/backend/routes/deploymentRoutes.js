const express = require("express");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    getDeployments,
    getDeploymentById,
    createDeployment,
    updateDeployment,
    deleteDeployment
} = require("../controllers/deploymentController");

const router = express.Router();

router.use(authenticateToken);

// GET all deployments
router.get("/", getDeployments);

// GET deployment by ID
router.get("/:id", getDeploymentById);

// CREATE deployment — Admin and Manager
router.post(
    "/",
    authorizeRoles("admin", "manager"),
    createDeployment
);

// UPDATE deployment — Admin and Manager
router.put(
    "/:id",
    authorizeRoles("admin", "manager"),
    updateDeployment
);

// DELETE deployment — Admin only
router.delete(
    "/:id",
    authorizeRoles("admin"),
    deleteDeployment
);

module.exports = router;