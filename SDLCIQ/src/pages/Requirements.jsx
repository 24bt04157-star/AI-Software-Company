import { hasRole } from "../utils/permissions";
import { useEffect, useState } from "react";
import "./Requirements.css";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    FileText
} from "lucide-react";

function Requirements() {

    const [requirements, setRequirements] = useState([]);
    const [projects, setProjects] = useState([]);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingRequirement, setEditingRequirement] = useState(null);

    const [formData, setFormData] = useState({
        project_id: "",
        title: "",
        description: "",
        priority: "medium",
        status: "pending"
    });

    // ========================================
    // FETCH REQUIREMENTS
    // ========================================

    const fetchRequirements = async () => {

        try {

            const token = localStorage.getItem("token");

const response = await fetch(
    "http://localhost:5000/api/requirements",
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

            const data = await response.json();

            setRequirements(data);

        } catch (error) {

            console.error(
                "Error fetching requirements:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    // ========================================
    // FETCH PROJECTS
    // ========================================

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

        fetchRequirements();
        fetchProjects();

    }, []);


    // ========================================
    // HANDLE INPUT
    // ========================================

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    // ========================================
    // CREATE MODAL
    // ========================================

    const openCreateModal = () => {

        setEditingRequirement(null);

        setFormData({
            project_id: projects.length > 0
                ? projects[0].id
                : "",
            title: "",
            description: "",
            priority: "medium",
            status: "pending"
        });

        setShowModal(true);

    };


    // ========================================
    // EDIT MODAL
    // ========================================

    const openEditModal = (requirement) => {

        setEditingRequirement(requirement);

        setFormData({
            project_id: requirement.project_id,
            title: requirement.title || "",
            description: requirement.description || "",
            priority: requirement.priority || "medium",
            status: requirement.status || "pending"
        });

        setShowModal(true);

    };


    // ========================================
    // CREATE / UPDATE
    // ========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const url = editingRequirement

                ? `http://localhost:5000/api/requirements/${editingRequirement.id}`

                : "http://localhost:5000/api/requirements";


            const method = editingRequirement
                ? "PUT"
                : "POST";


            const response = await fetch(url, {

                method,

                headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`
},

                body: JSON.stringify(formData)

            });


            const data = await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Something went wrong"
                );

                return;

            }


            setShowModal(false);

            await fetchRequirements();

        } catch (error) {

            console.error(
                "Error saving requirement:",
                error
            );

            alert(
                "Unable to connect to backend"
            );

        }

    };


    // ========================================
    // DELETE
    // ========================================

    const deleteRequirement = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this requirement?"
            );


        if (!confirmDelete) return;


        try {

            const response = await fetch(

                `http://localhost:5000/api/requirements/${id}`,

                {
    method: "DELETE",
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
}

            );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to delete requirement"
                );

                return;

            }


            await fetchRequirements();

        } catch (error) {

            console.error(
                "Error deleting requirement:",
                error
            );

        }

    };


    // ========================================
    // SEARCH
    // ========================================

    const filteredRequirements =
        requirements.filter((requirement) =>

            requirement.title
                .toLowerCase()
                .includes(search.toLowerCase())

        );


    // ========================================
    // UI
    // ========================================

    return (

        <div className="requirements-page">

            {/* HEADER */}

            <div className="requirements-header">

                <div>

                    <h1>Requirements</h1>

                    <p>
                        Define and manage project requirements.
                    </p>

                </div>


               {hasRole("admin", "manager") && (
    <button
        className="add-requirement-btn"
        onClick={openCreateModal}
    >
        <Plus size={18} />
        New Requirement
    </button>
)}

            </div>


            {/* TOOLBAR */}

            <div className="requirements-toolbar">

                <div className="requirement-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search requirements..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>


                <div className="requirement-count">

                    {filteredRequirements.length}
                    {" "}
                    Requirements

                </div>

            </div>


            {/* REQUIREMENTS */}

            {loading ? (

                <div className="empty-requirements">

                    Loading requirements...

                </div>

            ) : filteredRequirements.length === 0 ? (

                <div className="empty-requirements">

                    <FileText size={50} />

                    <h3>
                        No requirements found
                    </h3>

                    <p>
                        Create your first requirement
                        to get started.
                    </p>

                </div>

            ) : (

                <div className="requirements-list">

                    {filteredRequirements.map(
                        (requirement) => (

                            <div
                                className="requirement-card"
                                key={requirement.id}
                            >

                                <div className="requirement-icon">

                                    <FileText size={21} />

                                </div>


                                <div className="requirement-content">

                                    <h3>
                                        {requirement.title}
                                    </h3>

                                    <p>
                                        {requirement.description ||
                                            "No description provided."
                                        }
                                    </p>


                                    <div className="requirement-meta">

                                        <span>
                                            Project:{" "}
                                            <strong>
                                                {
                                                    requirement.project_name
                                                }
                                            </strong>
                                        </span>


                                        <span
                                            className={`requirement-status ${requirement.status}`}
                                        >
                                            {
                                                requirement.status
                                            }
                                        </span>


                                        <span
                                            className={`requirement-priority ${requirement.priority}`}
                                        >
                                            {
                                                requirement.priority
                                            }
                                        </span>

                                    </div>

                                </div>


                                <div className="requirement-actions">

                                   {hasRole("admin", "manager") && (
    <button
        onClick={() =>
            openEditModal(
                requirement
            )
        }
    >
        <Pencil size={16} />
    </button>
)}


                                  {hasRole("admin") && (
    <button
        onClick={() =>
            deleteRequirement(
                requirement.id
            )
        }
    >
        <Trash2 size={16} />
    </button>
)}

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}


            {/* MODAL */}

            {showModal && (

                <div className="modal-overlay">

                    <div className="requirement-modal">

                        <div className="modal-header">

                            <div>

                                <h2>

                                    {editingRequirement
                                        ? "Edit Requirement"
                                        : "Create Requirement"}

                                </h2>

                                <p>
                                    Enter requirement details.
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


                        <form
                            onSubmit={handleSubmit}
                        >

                            <label>
                                Project
                            </label>

                            <select
                                name="project_id"
                                value={formData.project_id}
                                onChange={handleChange}
                                required
                            >

                                <option value="">
                                    Select Project
                                </option>

                                {projects.map(
                                    (project) => (

                                        <option
                                            key={project.id}
                                            value={project.id}
                                        >
                                            {project.name}
                                        </option>

                                    )
                                )}

                            </select>


                            <label>
                                Requirement Title
                            </label>

                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter requirement title"
                                required
                            />


                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the requirement"
                            />


                            <div className="form-row">

                                <div>

                                    <label>
                                        Priority
                                    </label>

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


                                <div>

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >

                                        <option value="pending">
                                            Pending
                                        </option>

                                        <option value="approved">
                                            Approved
                                        </option>

                                        <option value="in_progress">
                                            In Progress
                                        </option>

                                        <option value="completed">
                                            Completed
                                        </option>

                                    </select>

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

                                    {editingRequirement
                                        ? "Update Requirement"
                                        : "Create Requirement"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}

export default Requirements;