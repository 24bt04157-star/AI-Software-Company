const db = require("../config/db");

// GET ALL DEPLOYMENTS
const getDeployments = (req, res) => {
    const sql = `
        SELECT
            d.*,
            p.name AS project_name
        FROM deployments d
        LEFT JOIN projects p
            ON d.project_id = p.id
        ORDER BY d.created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching deployments:", err);

            return res.status(500).json({
                message: "Failed to fetch deployments"
            });
        }

        res.json(results);
    });
};

// GET DEPLOYMENT BY ID
const getDeploymentById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            d.*,
            p.name AS project_name
        FROM deployments d
        LEFT JOIN projects p
            ON d.project_id = p.id
        WHERE d.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Error fetching deployment:", err);

            return res.status(500).json({
                message: "Failed to fetch deployment"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Deployment not found"
            });
        }

        res.json(results[0]);
    });
};

// CREATE DEPLOYMENT
const createDeployment = (req, res) => {
    const {
        project_id,
        version,
        environment,
        status,
        deployed_at
    } = req.body;

    if (!project_id) {
        return res.status(400).json({
            message: "Project is required"
        });
    }

    if (!version || version.trim() === "") {
        return res.status(400).json({
            message: "Version is required"
        });
    }

    const sql = `
        INSERT INTO deployments
        (
            project_id,
            version,
            environment,
            status,
            deployed_at
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
        project_id,
        version,
        environment || "development",
        status || "pending",
        deployed_at || null
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error creating deployment:", err);

            return res.status(500).json({
                message: "Failed to create deployment"
            });
        }

        res.status(201).json({
            message: "Deployment created successfully",
            deploymentId: result.insertId
        });
    });
};

// UPDATE DEPLOYMENT
const updateDeployment = (req, res) => {
    const { id } = req.params;

    const {
        project_id,
        version,
        environment,
        status,
        deployed_at
    } = req.body;

    if (!project_id) {
        return res.status(400).json({
            message: "Project is required"
        });
    }

    if (!version || version.trim() === "") {
        return res.status(400).json({
            message: "Version is required"
        });
    }

    const sql = `
        UPDATE deployments
        SET
            project_id = ?,
            version = ?,
            environment = ?,
            status = ?,
            deployed_at = ?
        WHERE id = ?
    `;

    const values = [
        project_id,
        version,
        environment || "development",
        status || "pending",
        deployed_at || null,
        id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating deployment:", err);

            return res.status(500).json({
                message: "Failed to update deployment"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Deployment not found"
            });
        }

        res.json({
            message: "Deployment updated successfully"
        });
    });
};

// DELETE DEPLOYMENT
const deleteDeployment = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM deployments WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting deployment:", err);

            return res.status(500).json({
                message: "Failed to delete deployment"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Deployment not found"
            });
        }

        res.json({
            message: "Deployment deleted successfully"
        });
    });
};

module.exports = {
    getDeployments,
    getDeploymentById,
    createDeployment,
    updateDeployment,
    deleteDeployment
};