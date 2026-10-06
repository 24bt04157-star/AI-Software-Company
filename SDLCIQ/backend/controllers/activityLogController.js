const db = require("../config/db");

// GET all activity logs
const getActivityLogs = (req, res) => {
    const sql = `
        SELECT
            activity_logs.id,
            activity_logs.action,
            activity_logs.created_at,
            users.name AS user_name,
            users.role AS user_role,
            projects.name AS project_name
        FROM activity_logs
        LEFT JOIN users
            ON activity_logs.user_id = users.id
        LEFT JOIN projects
            ON activity_logs.project_id = projects.id
        ORDER BY activity_logs.created_at DESC
        LIMIT 50
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching activity logs:", err);

            return res.status(500).json({
                message: "Failed to fetch activity logs"
            });
        }

        res.json(results);
    });
};

// CREATE activity log
const createActivityLog = (req, res) => {
    const {
        user_id,
        project_id,
        action
    } = req.body;

    if (!action) {
        return res.status(400).json({
            message: "Action is required"
        });
    }

    const sql = `
        INSERT INTO activity_logs
        (user_id, project_id, action)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [
            user_id || null,
            project_id || null,
            action
        ],
        (err, result) => {
            if (err) {
                console.error("Error creating activity log:", err);

                return res.status(500).json({
                    message: "Failed to create activity log"
                });
            }

            res.status(201).json({
                message: "Activity log created successfully",
                id: result.insertId
            });
        }
    );
};

module.exports = {
    getActivityLogs,
    createActivityLog
};