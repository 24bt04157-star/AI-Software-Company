const express = require("express");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    getTestCases,
    getTestCaseById,
    createTestCase,
    updateTestCase,
    deleteTestCase
} = require("../controllers/testCaseController");

const router = express.Router();

router.use(authenticateToken);

// GET all test cases
router.get("/", getTestCases);

// GET test case by ID
router.get("/:id", getTestCaseById);

// CREATE test case — Admin, Manager and Tester
router.post(
    "/",
    authorizeRoles("admin", "manager", "tester"),
    createTestCase
);

// UPDATE test case — Admin, Manager and Tester
router.put(
    "/:id",
    authorizeRoles("admin", "manager", "tester"),
    updateTestCase
);

// DELETE test case — Admin and Manager
router.delete(
    "/:id",
    authorizeRoles("admin", "manager"),
    deleteTestCase
);

module.exports = router;