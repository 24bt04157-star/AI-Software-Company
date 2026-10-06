const db = require("../config/db");
const logActivity = require("../utils/activityLogger");
// ===============================
// GET ALL PROJECTS
// ===============================
const getProjects = (req, res) => {
    const sql = "SELECT * FROM projects ORDER BY created_at DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching projects:", err);

            return res.status(500).json({
                message: "Failed to fetch projects"
            });
        }

        res.json(results);
    });
};


// ===============================
// GET PROJECT BY ID
// ===============================
const getProjectById = (req, res) => {
    const { id } = req.params;

    const sql = "SELECT * FROM projects WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Error fetching project:", err);

            return res.status(500).json({
                message: "Failed to fetch project"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json(results[0]);
    });
};


// ===============================
// CREATE PROJECT
// ===============================
const createProject = (req, res) => {
    const {
        name,
        description,
        status,
        priority,
        progress,
        start_date,
        deadline,
        created_by
    } = req.body;

    // Validate project name
    if (!name || name.trim() === "") {
        return res.status(400).json({
            message: "Project name is required"
        });
    }

    const sql = `
        INSERT INTO projects
        (
            name,
            description,
            status,
            priority,
            progress,
            start_date,
            deadline,
            created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        name,
        description || null,
        status || "planning",
        priority || "medium",
        progress || 0,
        start_date || null,
        deadline || null,
        created_by || null
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error creating project:", err);

            return res.status(500).json({
                message: "Failed to create project"
            });
        }
  logActivity(
                req.user.id,
                result.insertId,
                `Created project "${name}"`
            );
        res.status(201).json({
            message: "Project created successfully",
            projectId: result.insertId
        });
    });
};


// ===============================
// UPDATE PROJECT
// ===============================
const updateProject = (req, res) => {
    const { id } = req.params;

    const {
        name,
        description,
        status,
        priority,
        progress,
        start_date,
        deadline
    } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({
            message: "Project name is required"
        });
    }

    const sql = `
        UPDATE projects
        SET
            name = ?,
            description = ?,
            status = ?,
            priority = ?,
            progress = ?,
            start_date = ?,
            deadline = ?
        WHERE id = ?
    `;

    const values = [
        name,
        description || null,
        status || "planning",
        priority || "medium",
        progress ?? 0,
        start_date || null,
        deadline || null,
        id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating project:", err);

            return res.status(500).json({
                message: "Failed to update project"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json({
            message: "Project updated successfully"
        });
    });
};


// ===============================
// DELETE PROJECT
// ===============================
const deleteProject = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM projects WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting project:", err);

            return res.status(500).json({
                message: "Failed to delete project"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json({
            message: "Project deleted successfully"
        });
    });
};


// ===============================
// EXPORT FUNCTIONS
// ===============================
module.exports = {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
};