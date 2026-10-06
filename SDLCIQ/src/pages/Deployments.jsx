import { hasRole } from "../utils/permissions";
import { useEffect, useState } from "react";
import "./Deployments.css";

function Deployments() {
    const [deployments, setDeployments] = useState([]);
    const [projects, setProjects] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingDeployment, setEditingDeployment] = useState(null);

    const [form, setForm] = useState({
        project_id: "",
        version: "",
        environment: "development",
        status: "pending",
        deployed_at: ""
    });

    const fetchDeployments = async () => {
        try {
            const token = localStorage.getItem("token");

const response = await fetch(
    "http://localhost:5000/api/deployments",
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

            const data = await response.json();
            setDeployments(data);
        } catch (error) {
            console.error("Error fetching deployments:", error);
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

    useEffect(() => {
        fetchDeployments();
        fetchProjects();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const openCreateModal = () => {
        setEditingDeployment(null);

        setForm({
            project_id: "",
            version: "",
            environment: "development",
            status: "pending",
            deployed_at: ""
        });

        setShowModal(true);
    };

    const openEditModal = (deployment) => {
        setEditingDeployment(deployment);

        setForm({
            project_id: deployment.project_id || "",
            version: deployment.version || "",
            environment: deployment.environment || "development",
            status: deployment.status || "pending",
            deployed_at: deployment.deployed_at
                ? deployment.deployed_at.substring(0, 16)
                : ""
        });

        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = editingDeployment
            ? `http://localhost:5000/api/deployments/${editingDeployment.id}`
            : "http://localhost:5000/api/deployments";

        const method = editingDeployment ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`
},
                body: JSON.stringify({
                    ...form,
                    deployed_at: form.deployed_at || null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Something went wrong");
                return;
            }

            setShowModal(false);
            fetchDeployments();
        } catch (error) {
            console.error("Error saving deployment:", error);
        }
    };

    const deleteDeployment = async (id) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this deployment?"
            )
        ) {
            return;
        }

        try {
            await fetch(
    `http://localhost:5000/api/deployments/${id}`,
    {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    }
);

            fetchDeployments();
        } catch (error) {
            console.error("Error deleting deployment:", error);
        }
    };

    const filteredDeployments = deployments.filter((deployment) =>
        deployment.version
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        (deployment.project_name || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        deployment.environment
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        deployment.status
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="deployments-page">

            <div className="deployments-header">
                <div>
                    <h1>🚀 Deployments</h1>
                    <p>
                        Manage application releases and deployment environments
                    </p>
                </div>

                {hasRole("admin", "manager") && (
    <button
        className="deployment-primary-btn"
        onClick={openCreateModal}
    >
        + New Deployment
    </button>
)}
            </div>

            <div className="deployment-search">
                <input
                    type="text"
                    placeholder="Search deployments..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="deployment-summary">

                <div className="deployment-summary-card">
                    <span>Total</span>
                    <strong>{deployments.length}</strong>
                </div>

                <div className="deployment-summary-card">
                    <span>Successful</span>
                    <strong>
                        {
                            deployments.filter(
                                (deployment) =>
                                    deployment.status === "successful"
                            ).length
                        }
                    </strong>
                </div>

                <div className="deployment-summary-card">
                    <span>Failed</span>
                    <strong>
                        {
                            deployments.filter(
                                (deployment) =>
                                    deployment.status === "failed"
                            ).length
                        }
                    </strong>
                </div>

                <div className="deployment-summary-card">
                    <span>Pending</span>
                    <strong>
                        {
                            deployments.filter(
                                (deployment) =>
                                    deployment.status === "pending"
                            ).length
                        }
                    </strong>
                </div>

            </div>

            <div className="deployments-list">

                {filteredDeployments.length === 0 ? (
                    <div className="deployments-empty">
                        <div className="deployments-empty-icon">
                            🚀
                        </div>

                        <h3>No deployments found</h3>

                        <p>
                            Create your first deployment to start tracking
                            releases.
                        </p>
                    </div>
                ) : (
                    filteredDeployments.map((deployment) => (
                        <div
                            className="deployment-card"
                            key={deployment.id}
                        >

                            <div className="deployment-main">

                                <div className="deployment-title-row">

                                    <div>
                                        <h3>
                                            {deployment.version}
                                        </h3>

                                        <p className="deployment-project">
                                            📁{" "}
                                            {deployment.project_name ||
                                                "Unknown Project"}
                                        </p>
                                    </div>

                                    <span
                                        className={`deployment-status ${deployment.status}`}
                                    >
                                        {deployment.status.replace(
                                            "_",
                                            " "
                                        )}
                                    </span>

                                </div>

                                <div className="deployment-details">

                                    <div>
                                        <span>Environment</span>
                                        <strong>
                                            {deployment.environment}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Deployed At</span>
                                        <strong>
                                            {deployment.deployed_at
                                                ? new Date(
                                                      deployment.deployed_at
                                                  ).toLocaleString()
                                                : "Not deployed"}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                            <div className="deployment-actions">

                                {hasRole("admin", "manager") && (
    <button
        className="deployment-edit-btn"
        onClick={() =>
            openEditModal(deployment)
        }
    >
        Edit
    </button>
)}

                                {hasRole("admin") && (
    <button
        className="deployment-delete-btn"
        onClick={() => deleteDeployment(deployment.id)}
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
                <div className="deployment-modal-overlay">

                    <div className="deployment-modal">

                        <div className="deployment-modal-header">

                            <div>
                                <h2>
                                    {editingDeployment
                                        ? "Edit Deployment"
                                        : "New Deployment"}
                                </h2>

                                <p>
                                    Configure the application release
                                </p>
                            </div>

                            <button
                                className="deployment-close-btn"
                                onClick={() =>
                                    setShowModal(false)
                                }
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
                                <option value="">
                                    Select Project
                                </option>

                                {projects.map((project) => (
                                    <option
                                        key={project.id}
                                        value={project.id}
                                    >
                                        {project.name}
                                    </option>
                                ))}
                            </select>

                            <label>Version</label>

                            <input
                                type="text"
                                name="version"
                                placeholder="Example: v1.0.0"
                                value={form.version}
                                onChange={handleChange}
                                required
                            />

                            <label>Environment</label>

                            <select
                                name="environment"
                                value={form.environment}
                                onChange={handleChange}
                            >
                                <option value="development">
                                    Development
                                </option>

                                <option value="staging">
                                    Staging
                                </option>

                                <option value="production">
                                    Production
                                </option>
                            </select>

                            <label>Status</label>

                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >
                                <option value="pending">
                                    Pending
                                </option>

                                <option value="successful">
                                    Successful
                                </option>

                                <option value="failed">
                                    Failed
                                </option>

                                <option value="rolled_back">
                                    Rolled Back
                                </option>
                            </select>

                            <label>Deployment Date & Time</label>

                            <input
                                type="datetime-local"
                                name="deployed_at"
                                value={form.deployed_at}
                                onChange={handleChange}
                            />

                            <button
                                type="submit"
                                className="deployment-save-btn"
                            >
                                {editingDeployment
                                    ? "Update Deployment"
                                    : "Create Deployment"}
                            </button>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Deployments;