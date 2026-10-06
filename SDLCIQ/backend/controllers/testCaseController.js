const db = require("../config/db");

// GET ALL TEST CASES
const getTestCases = (req, res) => {
    const sql = `
        SELECT
            t.*,
            p.name AS project_name
        FROM test_cases t
        LEFT JOIN projects p
            ON t.project_id = p.id
        ORDER BY t.created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching test cases:", err);

            return res.status(500).json({
                message: "Failed to fetch test cases"
            });
        }

        res.json(results);
    });
};

// GET TEST CASE BY ID
const getTestCaseById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            t.*,
            p.name AS project_name
        FROM test_cases t
        LEFT JOIN projects p
            ON t.project_id = p.id
        WHERE t.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Error fetching test case:", err);

            return res.status(500).json({
                message: "Failed to fetch test case"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Test case not found"
            });
        }

        res.json(results[0]);
    });
};

// CREATE TEST CASE
const createTestCase = (req, res) => {
    const {
        project_id,
        title,
        description,
        expected_result,
        actual_result,
        status
    } = req.body;

    if (!project_id) {
        return res.status(400).json({
            message: "Project is required"
        });
    }

    if (!title || title.trim() === "") {
        return res.status(400).json({
            message: "Test case title is required"
        });
    }

    const sql = `
        INSERT INTO test_cases
        (
            project_id,
            title,
            description,
            expected_result,
            actual_result,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
        project_id,
        title,
        description || null,
        expected_result || null,
        actual_result || null,
        status || "not_run"
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error creating test case:", err);

            return res.status(500).json({
                message: "Failed to create test case"
            });
        }

        res.status(201).json({
            message: "Test case created successfully",
            testCaseId: result.insertId
        });
    });
};

// UPDATE TEST CASE
const updateTestCase = (req, res) => {
    const { id } = req.params;

    const {
        project_id,
        title,
        description,
        expected_result,
        actual_result,
        status
    } = req.body;

    if (!project_id) {
        return res.status(400).json({
            message: "Project is required"
        });
    }

    if (!title || title.trim() === "") {
        return res.status(400).json({
            message: "Test case title is required"
        });
    }

    const sql = `
        UPDATE test_cases
        SET
            project_id = ?,
            title = ?,
            description = ?,
            expected_result = ?,
            actual_result = ?,
            status = ?
        WHERE id = ?
    `;

    const values = [
        project_id,
        title,
        description || null,
        expected_result || null,
        actual_result || null,
        status || "not_run",
        id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating test case:", err);

            return res.status(500).json({
                message: "Failed to update test case"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Test case not found"
            });
        }

        res.json({
            message: "Test case updated successfully"
        });
    });
};

// DELETE TEST CASE
const deleteTestCase = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM test_cases WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting test case:", err);

            return res.status(500).json({
                message: "Failed to delete test case"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Test case not found"
            });
        }

        res.json({
            message: "Test case deleted successfully"
        });
    });
};

module.exports = {
    getTestCases,
    getTestCaseById,
    createTestCase,
    updateTestCase,
    deleteTestCase
};