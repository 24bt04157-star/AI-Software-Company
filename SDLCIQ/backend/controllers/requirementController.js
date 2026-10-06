const db = require("../config/db");

// ========================================
// GET ALL REQUIREMENTS
// ========================================

const getRequirements = (req, res) => {
    const sql = `
        SELECT 
            r.*,
            p.name AS project_name
        FROM requirements r
        LEFT JOIN projects p
            ON r.project_id = p.id
        ORDER BY r.created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching requirements:", err);

            return res.status(500).json({
                message: "Failed to fetch requirements"
            });
        }

        res.json(results);
    });
};


// ========================================
// GET REQUIREMENT BY ID
// ========================================

const getRequirementById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT 
            r.*,
            p.name AS project_name
        FROM requirements r
        LEFT JOIN projects p
            ON r.project_id = p.id
        WHERE r.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Error fetching requirement:", err);

            return res.status(500).json({
                message: "Failed to fetch requirement"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Requirement not found"
            });
        }

        res.json(results[0]);
    });
};


// ========================================
// CREATE REQUIREMENT
// ========================================

const createRequirement = (req, res) => {
    const {
        project_id,
        title,
        description,
        priority,
        status
    } = req.body;

    if (!project_id) {
        return res.status(400).json({
            message: "Project is required"
        });
    }

    if (!title || title.trim() === "") {
        return res.status(400).json({
            message: "Requirement title is required"
        });
    }

    const sql = `
        INSERT INTO requirements
        (
            project_id,
            title,
            description,
            priority,
            status
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
        project_id,
        title,
        description || null,
        priority || "medium",
        status || "pending"
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error creating requirement:", err);

            return res.status(500).json({
                message: "Failed to create requirement"
            });
        }

        res.status(201).json({
            message: "Requirement created successfully",
            requirementId: result.insertId
        });
    });
};


// ========================================
// UPDATE REQUIREMENT
// ========================================

const updateRequirement = (req, res) => {
    const { id } = req.params;

    const {
        project_id,
        title,
        description,
        priority,
        status
    } = req.body;

    if (!project_id) {
        return res.status(400).json({
            message: "Project is required"
        });
    }

    if (!title || title.trim() === "") {
        return res.status(400).json({
            message: "Requirement title is required"
        });
    }

    const sql = `
        UPDATE requirements
        SET
            project_id = ?,
            title = ?,
            description = ?,
            priority = ?,
            status = ?
        WHERE id = ?
    `;

    const values = [
        project_id,
        title,
        description || null,
        priority || "medium",
        status || "pending",
        id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating requirement:", err);

            return res.status(500).json({
                message: "Failed to update requirement"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Requirement not found"
            });
        }

        res.json({
            message: "Requirement updated successfully"
        });
    });
};


// ========================================
// DELETE REQUIREMENT
// ========================================

const deleteRequirement = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM requirements WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting requirement:", err);

            return res.status(500).json({
                message: "Failed to delete requirement"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Requirement not found"
            });
        }

        res.json({
            message: "Requirement deleted successfully"
        });
    });
};


// ========================================
// EXPORT
// ========================================

module.exports = {
    getRequirements,
    getRequirementById,
    createRequirement,
    updateRequirement,
    deleteRequirement
};