import { hasRole } from "../utils/permissions";
import { useEffect, useState } from "react";
import "./Tasks.css";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    CheckSquare
} from "lucide-react";

function Tasks() {

    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [users, setUsers] = useState([]);

    const [formData, setFormData] = useState({
        project_id: "",
        title: "",
        description: "",
        assigned_to: "",
        priority: "medium",
        status: "todo",
        deadline: ""
    });


    // ========================================
    // FETCH TASKS
    // ========================================

    const fetchTasks = async () => {

        try {

            const token = localStorage.getItem("token");

const response = await fetch(
    "http://localhost:5000/api/tasks",
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

            const data = await response.json();

            setTasks(data);

        } catch (error) {

            console.error(
                "Error fetching tasks:",
                error
            );

        } finally {

            setLoading(false);

        }

    };
// FETCH USERS
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
    fetchTasks();
    fetchProjects();
    fetchUsers();
}, []);


    // ========================================
    // INPUT CHANGE
    // ========================================

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    // ========================================
    // OPEN CREATE MODAL
    // ========================================

    const openCreateModal = () => {

        setEditingTask(null);

        setFormData({
            project_id:
                projects.length > 0
                    ? projects[0].id
                    : "",
            title: "",
            description: "",
            assigned_to: "",
            priority: "medium",
            status: "todo",
            deadline: ""
        });

        setShowModal(true);

    };


    // ========================================
    // OPEN EDIT MODAL
    // ========================================

    const openEditModal = (task) => {

        setEditingTask(task);

        setFormData({
            project_id: task.project_id || "",
            title: task.title || "",
            description: task.description || "",
            assigned_to: task.assigned_to || "",
            priority: task.priority || "medium",
            status: task.status || "todo",
            deadline: task.deadline
                ? task.deadline.substring(0, 10)
                : ""
        });

        setShowModal(true);

    };


    // ========================================
    // CREATE / UPDATE TASK
    // ========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const url = editingTask
                ? `http://localhost:5000/api/tasks/${editingTask.id}`
                : "http://localhost:5000/api/tasks";


            const method = editingTask
                ? "PUT"
                : "POST";


            const response = await fetch(url, {

                method,

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },

                body: JSON.stringify({
                    ...formData,
                    assigned_to:
                        formData.assigned_to || null,
                    deadline:
                        formData.deadline || null
                })

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

            await fetchTasks();

        } catch (error) {

            console.error(
                "Error saving task:",
                error
            );

            alert(
                "Unable to connect to backend"
            );

        }

    };


    // ========================================
    // DELETE TASK
    // ========================================

    const deleteTask = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this task?"
            );


        if (!confirmDelete) return;


        try {

            const response = await fetch(
                `http://localhost:5000/api/tasks/${id}`,
                {
                    method: "DELETE"
                }
            );


            const data = await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to delete task"
                );

                return;

            }


            await fetchTasks();

        } catch (error) {

            console.error(
                "Error deleting task:",
                error
            );

        }

    };


    // ========================================
    // SEARCH
    // ========================================

    const filteredTasks = tasks.filter((task) => {

        const searchText =
            search.toLowerCase();

        return (
            task.title
                ?.toLowerCase()
                .includes(searchText) ||

            task.project_name
                ?.toLowerCase()
                .includes(searchText)
        );

    });


    // ========================================
    // UI
    // ========================================

    return (

        <div className="tasks-page">

            {/* HEADER */}

            <div className="tasks-header">

                <div>

                    <h1>Tasks</h1>

                    <p>
                        Plan, assign and track project tasks.
                    </p>

                </div>


               {hasRole("admin", "manager", "developer") && (
    <button onClick={() => setShowModal(true)}>
        + New Task
    </button>
)}

            </div>


            {/* TOOLBAR */}

            <div className="tasks-toolbar">

                <div className="task-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>


                <div className="task-count">

                    {filteredTasks.length} Tasks

                </div>

            </div>


            {/* TASK LIST */}

            {loading ? (

                <div className="empty-tasks">
                    Loading tasks...
                </div>

            ) : filteredTasks.length === 0 ? (

                <div className="empty-tasks">

                    <CheckSquare size={50} />

                    <h3>
                        No tasks found
                    </h3>

                    <p>
                        Create your first task
                        to get started.
                    </p>

                </div>

            ) : (

                <div className="tasks-list">

                    {filteredTasks.map((task) => (

                        <div
                            className="task-card"
                            key={task.id}
                        >

                            <div className="task-icon">

                                <CheckSquare size={21} />

                            </div>


                            <div className="task-content">

                                <div className="task-title-row">

                                    <h3>
                                        {task.title}
                                    </h3>

                                    <span
                                        className={`task-status ${task.status}`}
                                    >
                                        {task.status.replace(
                                            "_",
                                            " "
                                        )}
                                    </span>

                                </div>


                                <p>
                                    {task.description ||
                                        "No description provided."
                                    }
                                </p>


                                <div className="task-meta">

                                    <span>
                                        Project:{" "}
                                        <strong>
                                            {task.project_name ||
                                                "Unknown"}
                                        </strong>
                                    </span>


                                    <span>
                                        Assigned to:{" "}
                                        <strong>
                                            {task.assigned_to_name ||
                                                "Unassigned"}
                                        </strong>
                                    </span>


                                    <span
                                        className={`task-priority ${task.priority}`}
                                    >
                                        {task.priority}
                                    </span>


                                    {task.deadline && (

                                        <span>
                                            Deadline:{" "}
                                            <strong>
                                                {new Date(
                                                    task.deadline
                                                ).toLocaleDateString()}
                                            </strong>
                                        </span>

                                    )}

                                </div>

                            </div>


                            <div className="task-actions">

                                <button
                                    onClick={() =>
                                        openEditModal(task)
                                    }
                                >

                                    <Pencil size={16} />

                                </button>


                                {hasRole("admin", "manager") && (
    <button onClick={() => deleteTask(task.id)}>
        <Trash2 size={16} />
    </button>
)}

                            </div>

                        </div>

                    ))}

                </div>

            )}


            {/* MODAL */}

            {showModal && (

                <div className="modal-overlay">

                    <div className="task-modal">

                        <div className="modal-header">

                            <div>

                                <h2>

                                    {editingTask
                                        ? "Edit Task"
                                        : "Create Task"}

                                </h2>

                                <p>
                                    Enter task details below.
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
                                Task Title
                            </label>

                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter task title"
                                required
                            />


                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the task"
                            />


                            <label>
                                Assigned To
                            </label>

                            <select
    name="assigned_to"
    value={formData.assigned_to}
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

                                        <option value="todo">
                                            To Do
                                        </option>

                                        <option value="in_progress">
                                            In Progress
                                        </option>

                                        <option value="review">
                                            Review
                                        </option>

                                        <option value="completed">
                                            Completed
                                        </option>

                                    </select>

                                </div>

                            </div>


                            <label>
                                Deadline
                            </label>

                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                            />


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

                                    {editingTask
                                        ? "Update Task"
                                        : "Create Task"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}

export default Tasks;