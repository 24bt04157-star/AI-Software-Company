const db = require("../config/db");
const bcrypt = require("bcryptjs");

// GET ALL USERS
const getUsers = (req, res) => {
    const sql = `
        SELECT
            id,
            name,
            email,
            role,
            created_at
        FROM users
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching users:", err);

            return res.status(500).json({
                message: "Failed to fetch users"
            });
        }

        res.json(results);
    });
};

// GET USER BY ID
const getUserById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            id,
            name,
            email,
            role,
            created_at
        FROM users
        WHERE id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Error fetching user:", err);

            return res.status(500).json({
                message: "Failed to fetch user"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(results[0]);
    });
};

// CREATE USER
const createUser = async (req, res) => {
    const {
        name,
        email,
        password,
        role
    } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({
            message: "Name is required"
        });
    }

    if (!email || email.trim() === "") {
        return res.status(400).json({
            message: "Email is required"
        });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users
            (
                name,
                email,
                password,
                role
            )
            VALUES (?, ?, ?, ?)
        `;

        const values = [
            name,
            email,
            hashedPassword,
            role || "developer"
        ];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Error creating user:", err);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Email already exists"
                    });
                }

                return res.status(500).json({
                    message: "Failed to create user"
                });
            }

            res.status(201).json({
                message: "User created successfully",
                userId: result.insertId
            });
        });

    } catch (error) {
        console.error("Password hashing error:", error);

        res.status(500).json({
            message: "Failed to create user"
        });
    }
};

// UPDATE USER
const updateUser = async (req, res) => {
    const { id } = req.params;

    const {
        name,
        email,
        password,
        role
    } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({
            message: "Name is required"
        });
    }

    if (!email || email.trim() === "") {
        return res.status(400).json({
            message: "Email is required"
        });
    }

    try {
        let sql;
        let values;

        if (password && password.length >= 6) {
            const hashedPassword = await bcrypt.hash(password, 10);

            sql = `
                UPDATE users
                SET
                    name = ?,
                    email = ?,
                    password = ?,
                    role = ?
                WHERE id = ?
            `;

            values = [
                name,
                email,
                hashedPassword,
                role || "developer",
                id
            ];
        } else {
            sql = `
                UPDATE users
                SET
                    name = ?,
                    email = ?,
                    role = ?
                WHERE id = ?
            `;

            values = [
                name,
                email,
                role || "developer",
                id
            ];
        }

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Error updating user:", err);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Email already exists"
                    });
                }

                return res.status(500).json({
                    message: "Failed to update user"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            res.json({
                message: "User updated successfully"
            });
        });

    } catch (error) {
        console.error("Password hashing error:", error);

        res.status(500).json({
            message: "Failed to update user"
        });
    }
};

// DELETE USER
const deleteUser = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM users WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting user:", err);

            return res.status(500).json({
                message: "Failed to delete user"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User deleted successfully"
        });
    });
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};