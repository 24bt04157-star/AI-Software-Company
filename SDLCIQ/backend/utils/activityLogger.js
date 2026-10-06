const db = require("../config/db");

const logActivity = (userId, projectId, action) => {
    const sql = `
        INSERT INTO activity_logs
        (user_id, project_id, action)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [
            userId || null,
            projectId || null,
            action
        ],
        (err) => {
            if (err) {
                console.error(
                    "Activity log error:",
                    err.message
                );
            }
        }
    );
};

module.exports = logActivity;