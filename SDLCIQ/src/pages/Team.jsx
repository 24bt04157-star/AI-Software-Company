import { hasRole } from "../utils/permissions";
import { useEffect, useState } from "react";
import "./Team.css";

function Team() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "developer"
    });

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");

const response = await fetch(
    "http://localhost:5000/api/users",
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const openCreateModal = () => {
        setEditingUser(null);

        setForm({
            name: "",
            email: "",
            password: "",
            role: "developer"
        });

        setShowModal(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);

        setForm({
            name: user.name || "",
            email: user.email || "",
            password: "",
            role: user.role || "developer"
        });

        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = editingUser
            ? `http://localhost:5000/api/users/${editingUser.id}`
            : "http://localhost:5000/api/users";

        const method = editingUser ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`
},
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Something went wrong");
                return;
            }

            setShowModal(false);
            fetchUsers();
        } catch (error) {
            console.error("Error saving user:", error);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) {
            return;
        }

        try {
            const response = await fetch(
    `http://localhost:5000/api/users/${id}`,
    {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    }
);

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to delete user");
                return;
            }

            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="team-page">

            <div className="team-header">

                <div>
                    <h1>👥 Team</h1>
                    <p>
                        Manage project members and their roles
                    </p>
                </div>

                {hasRole("admin") && (
    <button
        className="team-primary-btn"
        onClick={openCreateModal}
    >
        + Add Member
    </button>
)}

            </div>

            <div className="team-search">

                <input
                    type="text"
                    placeholder="Search team members..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

            </div>

            <div className="team-summary">

                <div className="team-summary-card">
                    <span>Total Members</span>
                    <strong>{users.length}</strong>
                </div>

                <div className="team-summary-card">
                    <span>Managers</span>
                    <strong>
                        {
                            users.filter(
                                (user) => user.role === "manager"
                            ).length
                        }
                    </strong>
                </div>

                <div className="team-summary-card">
                    <span>Developers</span>
                    <strong>
                        {
                            users.filter(
                                (user) => user.role === "developer"
                            ).length
                        }
                    </strong>
                </div>

                <div className="team-summary-card">
                    <span>Testers</span>
                    <strong>
                        {
                            users.filter(
                                (user) => user.role === "tester"
                            ).length
                        }
                    </strong>
                </div>

            </div>

            <div className="team-grid">

                {filteredUsers.length === 0 ? (
                    <div className="team-empty">

                        <div className="team-empty-icon">
                            👥
                        </div>

                        <h3>No team members found</h3>

                        <p>
                            Add your first team member to get started.
                        </p>

                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div
                            className="team-card"
                            key={user.id}
                        >

                            <div className="team-avatar">
                                {user.name
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="team-user-info">

                                <h3>{user.name}</h3>

                                <p>{user.email}</p>

                                <span
                                    className={`team-role ${user.role}`}
                                >
                                    {user.role}
                                </span>

                            </div>

                            <div className="team-actions">

                                {hasRole("admin") && (
    <button
        className="team-edit-btn"
        onClick={() =>
            openEditModal(user)
        }
    >
        Edit
    </button>
)}

                             {hasRole("admin") && (
    <button
        className="team-delete-btn"
        onClick={() =>
            deleteUser(user.id)
        }
    >
        Delete
    </button>
)}
                            </div>

                        </div>
                    ))
                )}

            </div>

            {showModal && (
                <div className="team-modal-overlay">

                    <div className="team-modal">

                        <div className="team-modal-header">

                            <div>
                                <h2>
                                    {editingUser
                                        ? "Edit Team Member"
                                        : "Add Team Member"}
                                </h2>

                                <p>
                                    Manage account details and role
                                </p>
                            </div>

                            <button
                                className="team-close-btn"
                                onClick={() =>
                                    setShowModal(false)
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form onSubmit={handleSubmit}>

                            <label>Name</label>

                            <input
                                type="text"
                                name="name"
                                placeholder="Enter full name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />

                            <label>Email</label>

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter email address"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />

                            <label>
                                Password{" "}
                                {editingUser &&
                                    "(leave blank to keep current)"}
                            </label>

                            <input
                                type="password"
                                name="password"
                                placeholder={
                                    editingUser
                                        ? "Optional"
                                        : "Minimum 6 characters"
                                }
                                value={form.password}
                                onChange={handleChange}
                                required={!editingUser}
                                minLength={editingUser ? undefined : 6}
                            />

                            <label>Role</label>

                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                            >
                                <option value="admin">
                                    Admin
                                </option>

                                <option value="manager">
                                    Manager
                                </option>

                                <option value="developer">
                                    Developer
                                </option>

                                <option value="tester">
                                    Tester
                                </option>
                            </select>

                            <button
                                type="submit"
                                className="team-save-btn"
                            >
                                {editingUser
                                    ? "Update Member"
                                    : "Add Member"}
                            </button>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Team;