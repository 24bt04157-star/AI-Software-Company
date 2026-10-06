const db = require("../config/db");

// ========================================
// GET ALL BUGS
// ========================================

const getBugs = (req, res) => {
    const sql = `
        SELECT
            b.*,
            p.name AS project_name,
            reporter.name AS reported_by_name,
            assignee.name AS assigned_to_name
        FROM bugs b
        LEFT JOIN projects p
            ON b.project_id = p.id
        LEFT JOIN users reporter
            ON b.reported_by = reporter.id
        LEFT JOIN users assignee
            ON b.assigned_to = assignee.id
        ORDER BY b.created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching bugs:", err);

            return res.status(500).json({
                message: "Failed to fetch bugs"
            });
        }

        res.json(results);
    });
};


// ========================================
// GET BUG BY ID
// ========================================

const getBugById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            b.*,
            p.name AS project_name,
            reporter.name AS reported_by_name,
            assignee.name AS assigned_to_name
        FROM bugs b
        LEFT JOIN projects p
            ON b.project_id = p.id
        LEFT JOIN users reporter
            ON b.reported_by = reporter.id
        LEFT JOIN users assignee
            ON b.assigned_to = assignee.id
        WHERE b.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Error fetching bug:", err);

            return res.status(500).json({
                message: "Failed to fetch bug"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Bug not found"
            });
        }

        res.json(results[0]);
    });
};


// ========================================
// CREATE BUG
// ========================================

const createBug = (req, res) => {
    const {
        project_id,
        title,
        description,
        severity,
        status,
        reported_by,
        assigned_to
    } = req.body;

    if (!project_id) {
        return res.status(400).json({
            message: "Project is required"
        });
    }

    if (!title || title.trim() === "") {
        return res.status(400).json({
            message: "Bug title is required"
        });
    }

    const sql = `
        INSERT INTO bugs
        (
            project_id,
            title,
            description,
            severity,
            status,
            reported_by,
            assigned_to
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        project_id,
        title,
        description || null,
        severity || "medium",
        status || "open",
        reported_by || null,
        assigned_to || null
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error creating bug:", err);

            return res.status(500).json({
                message: "Failed to create bug"
            });
        }

        res.status(201).json({
            message: "Bug created successfully",
            bugId: result.insertId
        });
    });
};


// ========================================
// UPDATE BUG
// ========================================

const updateBug = (req, res) => {
    const { id } = req.params;

    const {
        project_id,
        title,
        description,
        severity,
        status,
        reported_by,
        assigned_to
    } = req.body;

    if (!project_id) {
        return res.status(400).json({
            message: "Project is required"
        });
    }

    if (!title || title.trim() === "") {
        return res.status(400).json({
            message: "Bug title is required"
        });
    }

    const sql = `
        UPDATE bugs
        SET
            project_id = ?,
            title = ?,
            description = ?,
            severity = ?,
            status = ?,
            reported_by = ?,
            assigned_to = ?
        WHERE id = ?
    `;

    const values = [
        project_id,
        title,
        description || null,
        severity || "medium",
        status || "open",
        reported_by || null,
        assigned_to || null,
        id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating bug:", err);

            return res.status(500).json({
                message: "Failed to update bug"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Bug not found"
            });
        }

        res.json({
            message: "Bug updated successfully"
        });
    });
};


// ========================================
// DELETE BUG
// ========================================

const deleteBug = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM bugs WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting bug:", err);

            return res.status(500).json({
                message: "Failed to delete bug"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Bug not found"
            });
        }

        res.json({
            message: "Bug deleted successfully"
        });
    });
};


module.exports = {
    getBugs,
    getBugById,
    createBug,
    updateBug,
    deleteBug
};