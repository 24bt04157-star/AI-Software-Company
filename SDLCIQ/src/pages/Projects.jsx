import { hasRole } from "../utils/permissions";
import { useEffect, useState } from "react";
import "./Projects.css";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    FolderKanban
} from "lucide-react";

function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "planning",
        priority: "medium",
        progress: 0,
        start_date: "",
        deadline: ""
    });

    // ================================
    // FETCH PROJECTS
    // ================================
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // ================================
    // HANDLE INPUT
    // ================================
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // ================================
    // OPEN CREATE MODAL
    // ================================
    const openCreateModal = () => {
        setEditingProject(null);

        setFormData({
            name: "",
            description: "",
            status: "planning",
            priority: "medium",
            progress: 0,
            start_date: "",
            deadline: ""
        });

        setShowModal(true);
    };

    // ================================
    // OPEN EDIT MODAL
    // ================================
    const openEditModal = (project) => {
        setEditingProject(project);

        setFormData({
            name: project.name || "",
            description: project.description || "",
            status: project.status || "planning",
            priority: project.priority || "medium",
            progress: project.progress || 0,
            start_date: project.start_date
                ? project.start_date.split("T")[0]
                : "",
            deadline: project.deadline
                ? project.deadline.split("T")[0]
                : ""
        });

        setShowModal(true);
    };

    // ================================
    // CREATE / UPDATE PROJECT
    // ================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = editingProject
                ? `http://localhost:5000/api/projects/${editingProject.id}`
                : "http://localhost:5000/api/projects";

            const method = editingProject ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
               headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`
},
                body: JSON.stringify({
                    ...formData,
                    progress: Number(formData.progress)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Something went wrong");
                return;
            }

            setShowModal(false);

            await fetchProjects();

        } catch (error) {
            console.error("Error saving project:", error);
            alert("Unable to connect to backend");
        }
    };

    // ================================
    // DELETE PROJECT
    // ================================
    const deleteProject = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this project?"
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(
    `http://localhost:5000/api/projects/${id}`,
    {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    }
);

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to delete project");
                return;
            }

            await fetchProjects();

        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    // ================================
    // SEARCH
    // ================================
    const filteredProjects = projects.filter((project) =>
        project.name
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    // ================================
    // UI
    // ================================
    return (
        <div className="projects-page">

 <div className="projects-header">

    <div>
        <h1>Projects</h1>
        <p>
            Manage and monitor your software projects.
        </p>
    </div>

   {hasRole("admin", "manager") && (
    <button onClick={() => setShowModal(true)}>
        + New Project
    </button>
)}

</div>

            {/* SEARCH */}

            <div className="projects-toolbar">

                <div className="project-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>

                <div className="project-count">
                    {filteredProjects.length} Projects
                </div>

            </div>

            {/* PROJECTS */}

            {loading ? (

                <div className="empty-projects">
                    Loading projects...
                </div>

            ) : filteredProjects.length === 0 ? (

                <div className="empty-projects">

                    <FolderKanban size={50} />

                    <h3>No projects found</h3>

                    <p>
                        Create your first project to get started.
                    </p>

                </div>

            ) : (

                <div className="projects-grid">

                    {filteredProjects.map((project) => (

                        <div
                            className="project-card"
                            key={project.id}
                        >

                            <div className="project-card-top">

                                <div className="project-icon">
                                    <FolderKanban size={22} />
                                </div>

                                <div className="project-actions">

                                    <button
                                        onClick={() =>
                                            openEditModal(project)
                                        }
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    <button
                                        onClick={() =>
                                            deleteProject(project.id)
                                        }
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                </div>

                            </div>

                            <h3>{project.name}</h3>

                            <p className="project-description">
                                {project.description ||
                                    "No description provided."}
                            </p>

                            <div className="project-tags">

                                <span
                                    className={`status ${project.status}`}
                                >
                                    {project.status}
                                </span>

                                <span
                                    className={`priority ${project.priority}`}
                                >
                                    {project.priority}
                                </span>

                            </div>

                            <div className="progress-section">

                                <div className="progress-info">

                                    <span>Progress</span>

                                    <strong>
                                        {project.progress}%
                                    </strong>

                                </div>

                                <div className="progress-bar">

                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${project.progress}%`
                                        }}
                                    ></div>

                                </div>

                            </div>

                            <div className="project-date">

                                <span>Deadline</span>

                                <strong>
                                    {project.deadline
                                        ? new Date(
                                            project.deadline
                                        ).toLocaleDateString()
                                        : "Not set"}
                                </strong>

                            </div>

                        </div>

                    ))}

                </div>

            )}

            {/* MODAL */}

            {showModal && (

                <div className="modal-overlay">

                    <div className="project-modal">

                        <div className="modal-header">

                            <div>
                                <h2>
                                    {editingProject
                                        ? "Edit Project"
                                        : "Create Project"}
                                </h2>

                                <p>
                                    Enter project details below.
                                </p>
                            </div>

                            <button
                                className="close-modal"
                                onClick={() =>
                                    setShowModal(false)
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form onSubmit={handleSubmit}>

                            <label>
                                Project Name
                            </label>

                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter project name"
                                required
                            />

                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the project"
                            />

                            <div className="form-row">

                                <div>

                                    <label>Status</label>

                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="planning">
                                            Planning
                                        </option>

                                        <option value="requirements">
                                            Requirements
                                        </option>

                                        <option value="design">
                                            Design
                                        </option>

                                        <option value="development">
                                            Development
                                        </option>

                                        <option value="testing">
                                            Testing
                                        </option>

                                        <option value="deployment">
                                            Deployment
                                        </option>

                                        <option value="maintenance">
                                            Maintenance
                                        </option>

                                        <option value="completed">
                                            Completed
                                        </option>

                                    </select>

                                </div>

                                <div>

                                    <label>Priority</label>

                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                    >
                                        <option value="low">
                                            Low
                                        </option>

                                        <option value="medium">
                                            Medium
                                        </option>

                                        <option value="high">
                                            High
                                        </option>

                                        <option value="critical">
                                            Critical
                                        </option>

                                    </select>

                                </div>

                            </div>

                            <div className="form-row">

                                <div>

                                    <label>
                                        Progress (%)
                                    </label>

                                    <input
                                        type="number"
                                        name="progress"
                                        min="0"
                                        max="100"
                                        value={formData.progress}
                                        onChange={handleChange}
                                    />

                                </div>

                                <div>

                                    <label>
                                        Deadline
                                    </label>

                                    <input
                                        type="date"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>

                            <div className="modal-buttons">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() =>
                                        setShowModal(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-btn"
                                >
                                    {editingProject
                                        ? "Update Project"
                                        : "Create Project"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Projects;