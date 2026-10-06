import { hasRole } from "../utils/permissions";
import { useEffect, useState } from "react";
import "./Bugs.css";

function Bugs() {
    const [bugs, setBugs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingBug, setEditingBug] = useState(null);
const [users, setUsers] = useState([]);
    const [form, setForm] = useState({
        project_id: "",
        title: "",
        description: "",
        severity: "medium",
        status: "open",
        reported_by: "",
        assigned_to: ""
    });

    const fetchBugs = async () => {
        try {
           const token = localStorage.getItem("token");

const response = await fetch(
    "http://localhost:5000/api/bugs",
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);
            const data = await response.json();
            setBugs(data);
        } catch (error) {
            console.error("Error fetching bugs:", error);
        }
    };

    const fetchProjects = async () => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:5000/api/projects",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        setProjects(data);
    } catch (error) {
        console.error("Error fetching projects:", error);
    }
};
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
    fetchBugs();
    fetchProjects();
    fetchUsers();
}, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const openCreateModal = () => {
        setEditingBug(null);

        setForm({
            project_id: "",
            title: "",
            description: "",
            severity: "medium",
            status: "open",
            reported_by: "",
            assigned_to: ""
        });

        setShowModal(true);
    };

    const openEditModal = (bug) => {
        setEditingBug(bug);

        setForm({
            project_id: bug.project_id || "",
            title: bug.title || "",
            description: bug.description || "",
            severity: bug.severity || "medium",
            status: bug.status || "open",
            reported_by: bug.reported_by || "",
            assigned_to: bug.assigned_to || ""
        });

        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = editingBug
            ? `http://localhost:5000/api/bugs/${editingBug.id}`
            : "http://localhost:5000/api/bugs";

        const method = editingBug ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`
},
                body: JSON.stringify({
                    ...form,
                    reported_by: form.reported_by || null,
                    assigned_to: form.assigned_to || null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Something went wrong");
                return;
            }

            setShowModal(false);
            fetchBugs();
        } catch (error) {
            console.error("Error saving bug:", error);
        }
    };

    const deleteBug = async (id) => {
        if (!window.confirm("Are you sure you want to delete this bug?")) {
            return;
        }

        try {
            await fetch(`http://localhost:5000/api/bugs/${id}`, {
    method: "DELETE",
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});
            fetchBugs();
        } catch (error) {
            console.error("Error deleting bug:", error);
        }
    };

    const filteredBugs = bugs.filter((bug) =>
        bug.title.toLowerCase().includes(search.toLowerCase()) ||
        (bug.project_name || "").toLowerCase().includes(search.toLowerCase()) ||
        bug.severity.toLowerCase().includes(search.toLowerCase()) ||
        bug.status.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bugs-page">

            <div className="page-header">
                <div>
                    <h1>🐞 Bugs</h1>
                    <p>Track, manage and resolve project bugs</p>
                </div>

                {hasRole("admin", "manager", "developer", "tester") && (
    <button onClick={() => setShowModal(true)}>
        + New Bug
    </button>
)}
            </div>

            <div className="search-box">
                <input
                    type="text"
                    placeholder="Search bugs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="bugs-grid">

                {filteredBugs.length === 0 ? (
                    <div className="empty-state">
                        <h3>No bugs found</h3>
                        <p>Report a bug to start tracking issues.</p>
                    </div>
                ) : (
                    filteredBugs.map((bug) => (
                        <div className="bug-card" key={bug.id}>

                            <div className="bug-card-top">
                                <span className={`severity ${bug.severity}`}>
                                    {bug.severity}
                                </span>

                                <span className={`bug-status ${bug.status}`}>
                                    {bug.status.replace("_", " ")}
                                </span>
                            </div>

                            <h3>{bug.title}</h3>

                            <p className="bug-description">
                                {bug.description || "No description provided."}
                            </p>

                            <div className="bug-info">
                                <span>
                                    📁 {bug.project_name || "Unknown Project"}
                                </span>

                                <span>
                                    👤 {bug.assigned_to_name || "Unassigned"}
                                </span>
                            </div>

                            <div className="bug-actions">
                                <button
                                    className="edit-btn"
                                    onClick={() => openEditModal(bug)}
                                >
                                    Edit
                                </button>

                                {hasRole("admin", "manager") && (
    <button
        className="delete-btn"
        onClick={() => deleteBug(bug.id)}
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
                <div className="modal-overlay">
                    <div className="modal">

                        <div className="modal-header">
                            <h2>
                                {editingBug ? "Edit Bug" : "Report New Bug"}
                            </h2>

                            <button
                                className="close-btn"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <label>Project</label>

                            <select
                                name="project_id"
                                value={form.project_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Project</option>

                                {projects.map((project) => (
                                    <option
                                        key={project.id}
                                        value={project.id}
                                    >
                                        {project.name}
                                    </option>
                                ))}
                            </select>

                            <label>Bug Title</label>

                            <input
                                type="text"
                                name="title"
                                placeholder="Enter bug title"
                                value={form.title}
                                onChange={handleChange}
                                required
                            />

                            <label>Description</label>

                            <textarea
                                name="description"
                                placeholder="Describe the bug..."
                                value={form.description}
                                onChange={handleChange}
                            />

                            <label>Severity</label>

                            <select
                                name="severity"
                                value={form.severity}
                                onChange={handleChange}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>

                            <label>Status</label>

                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >
                                <option value="open">Open</option>
                                <option value="in_progress">
                                    In Progress
                                </option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>

                            <label>Reported By (User ID)</label>

                            <select
    name="reported_by"
    value={form.reported_by}
    onChange={handleChange}
>
    <option value="">Select User (optional)</option>

    {users.map((user) => (
        <option key={user.id} value={user.id}>
            {user.name}
        </option>
    ))}
</select>

                            <label>Assigned To (User ID)</label>

                           <select
    name="assigned_to"
    value={form.assigned_to}
    onChange={handleChange}
>
    <option value="">Select Developer (optional)</option>

    {users
        .filter((user) => user.role === "developer")
        .map((user) => (
            <option key={user.id} value={user.id}>
                {user.name}
            </option>
        ))}
</select>

                            <button type="submit" className="save-btn">
                                {editingBug ? "Update Bug" : "Report Bug"}
                            </button>

                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}

export default Bugs;