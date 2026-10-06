const db = require("../config/db");

// ========================================
// GET ALL TASKS
// ========================================

const getTasks = (req, res) => {
    const sql = `
        SELECT
            t.*,
            p.name AS project_name,
            u.name AS assigned_to_name
        FROM tasks t
        LEFT JOIN projects p
            ON t.project_id = p.id
        LEFT JOIN users u
            ON t.assigned_to = u.id
        ORDER BY t.created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching tasks:", err);

            return res.status(500).json({
                message: "Failed to fetch tasks"
            });
        }

        res.json(results);
    });
};


// ========================================
// GET TASK BY ID
// ========================================

const getTaskById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            t.*,
            p.name AS project_name,
            u.name AS assigned_to_name
        FROM tasks t
        LEFT JOIN projects p
            ON t.project_id = p.id
        LEFT JOIN users u
            ON t.assigned_to = u.id
        WHERE t.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Error fetching task:", err);

            return res.status(500).json({
                message: "Failed to fetch task"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(results[0]);
    });
};


// ========================================
// CREATE TASK
// ========================================

const createTask = (req, res) => {
    const {
        project_id,
        title,
        description,
        assigned_to,
        priority,
        status,
        deadline
    } = req.body;

    if (!project_id) {
        return res.status(400).json({
            message: "Project is required"
        });
    }

    if (!title || title.trim() === "") {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const sql = `
        INSERT INTO tasks
        (
            project_id,
            title,
            description,
            assigned_to,
            priority,
            status,
            deadline
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        project_id,
        title,
        description || null,
        assigned_to || null,
        priority || "medium",
        status || "todo",
        deadline || null
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error creating task:", err);

            return res.status(500).json({
                message: "Failed to create task"
            });
        }

        res.status(201).json({
            message: "Task created successfully",
            taskId: result.insertId
        });
    });
};


// ========================================
// UPDATE TASK
// ========================================

const updateTask = (req, res) => {
    const { id } = req.params;

    const {
        project_id,
        title,
        description,
        assigned_to,
        priority,
        status,
        deadline
    } = req.body;

    if (!project_id) {
        return res.status(400).json({
            message: "Project is required"
        });
    }

    if (!title || title.trim() === "") {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const sql = `
        UPDATE tasks
        SET
            project_id = ?,
            title = ?,
            description = ?,
            assigned_to = ?,
            priority = ?,
            status = ?,
            deadline = ?
        WHERE id = ?
    `;

    const values = [
        project_id,
        title,
        description || null,
        assigned_to || null,
        priority || "medium",
        status || "todo",
        deadline || null,
        id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating task:", err);

            return res.status(500).json({
                message: "Failed to update task"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task updated successfully"
        });
    });
};


// ========================================
// DELETE TASK
// ========================================

const deleteTask = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM tasks WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting task:", err);

            return res.status(500).json({
                message: "Failed to delete task"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });
    });
};


module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};