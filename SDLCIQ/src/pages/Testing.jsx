import { hasRole } from "../utils/permissions";
import { useEffect, useState } from "react";
import "./Testing.css";

function Testing() {
    const [testCases, setTestCases] = useState([]);
    const [projects, setProjects] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingTest, setEditingTest] = useState(null);

    const [form, setForm] = useState({
        project_id: "",
        title: "",
        description: "",
        expected_result: "",
        actual_result: "",
        status: "not_run"
    });

    const fetchTestCases = async () => {
        try {
            const token = localStorage.getItem("token");

const response = await fetch("http://localhost:5000/api/test-cases", {
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
})  

            const data = await response.json();
            setTestCases(data);
        } catch (error) {
            console.error("Error fetching test cases:", error);
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
        fetchTestCases();
        fetchProjects();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const openCreateModal = () => {
        setEditingTest(null);

        setForm({
            project_id: "",
            title: "",
            description: "",
            expected_result: "",
            actual_result: "",
            status: "not_run"
        });

        setShowModal(true);
    };

    const openEditModal = (testCase) => {
        setEditingTest(testCase);

        setForm({
            project_id: testCase.project_id || "",
            title: testCase.title || "",
            description: testCase.description || "",
            expected_result: testCase.expected_result || "",
            actual_result: testCase.actual_result || "",
            status: testCase.status || "not_run"
        });

        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = editingTest
            ? `http://localhost:5000/api/test-cases/${editingTest.id}`
            : "http://localhost:5000/api/test-cases";

        const method = editingTest ? "PUT" : "POST";

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
            fetchTestCases();
        } catch (error) {
            console.error("Error saving test case:", error);
        }
    };

    const deleteTestCase = async (id) => {
        if (!window.confirm("Are you sure you want to delete this test case?")) {
            return;
        }

        try {
            await fetch(
    `http://localhost:5000/api/test-cases/${id}`,
    {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    }
);

            fetchTestCases();
        } catch (error) {
            console.error("Error deleting test case:", error);
        }
    };

    const filteredTestCases = testCases.filter((testCase) =>
        testCase.title
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        (testCase.project_name || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        testCase.status
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="testing-page">

            <div className="testing-header">
                <div>
                    <h1>🧪 Testing</h1>
                    <p>
                        Create, execute and manage project test cases
                    </p>
                </div>

                {hasRole("admin", "manager", "tester") && (
    <button
        className="testing-primary-btn"
        onClick={openCreateModal}
    >
        + Create Test Case
    </button>
)}
            </div>

            <div className="testing-search">
                <input
                    type="text"
                    placeholder="Search test cases..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="test-summary">

                <div className="test-summary-card">
                    <span>Total</span>
                    <strong>{testCases.length}</strong>
                </div>

                <div className="test-summary-card">
                    <span>Passed</span>
                    <strong>
                        {
                            testCases.filter(
                                (test) => test.status === "passed"
                            ).length
                        }
                    </strong>
                </div>

                <div className="test-summary-card">
                    <span>Failed</span>
                    <strong>
                        {
                            testCases.filter(
                                (test) => test.status === "failed"
                            ).length
                        }
                    </strong>
                </div>

                <div className="test-summary-card">
                    <span>Not Run</span>
                    <strong>
                        {
                            testCases.filter(
                                (test) => test.status === "not_run"
                            ).length
                        }
                    </strong>
                </div>

            </div>

            <div className="testing-list">

                {filteredTestCases.length === 0 ? (
                    <div className="testing-empty">
                        <div className="testing-empty-icon">🧪</div>

                        <h3>No test cases found</h3>

                        <p>
                            Create your first test case to start testing
                            the project.
                        </p>
                    </div>
                ) : (
                    filteredTestCases.map((testCase) => (
                        <div
                            className="test-case-card"
                            key={testCase.id}
                        >

                            <div className="test-case-main">

                                <div className="test-case-title-row">
                                    <h3>{testCase.title}</h3>

                                    <span
                                        className={`test-status ${testCase.status}`}
                                    >
                                        {testCase.status.replace("_", " ")}
                                    </span>
                                </div>

                                <p className="test-project">
                                    📁{" "}
                                    {testCase.project_name ||
                                        "Unknown Project"}
                                </p>

                                <p className="test-description">
                                    {testCase.description ||
                                        "No description provided."}
                                </p>

                                <div className="test-results">

                                    <div>
                                        <strong>
                                            Expected Result
                                        </strong>

                                        <p>
                                            {testCase.expected_result ||
                                                "Not specified"}
                                        </p>
                                    </div>

                                    <div>
                                        <strong>
                                            Actual Result
                                        </strong>

                                        <p>
                                            {testCase.actual_result ||
                                                "Not recorded"}
                                        </p>
                                    </div>

                                </div>

                            </div>

                            <div className="test-actions">

                                {hasRole("admin", "manager", "tester") && (
    <button
        className="test-edit-btn"
        onClick={() =>
            openEditModal(testCase)
        }
    >
        Edit
    </button>
)}

                                {hasRole("admin", "manager") && (
    <button
        className="test-delete-btn"
        onClick={() => deleteTestCase(testCase.id)}
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
                <div className="testing-modal-overlay">

                    <div className="testing-modal">

                        <div className="testing-modal-header">

                            <div>
                                <h2>
                                    {editingTest
                                        ? "Edit Test Case"
                                        : "Create Test Case"}
                                </h2>

                                <p>
                                    Define the test and expected behavior
                                </p>
                            </div>

                            <button
                                className="testing-close-btn"
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

                            <label>Test Case Title</label>

                            <input
                                type="text"
                                name="title"
                                placeholder="Example: Verify user login"
                                value={form.title}
                                onChange={handleChange}
                                required
                            />

                            <label>Description</label>

                            <textarea
                                name="description"
                                placeholder="Describe what this test checks..."
                                value={form.description}
                                onChange={handleChange}
                            />

                            <label>Expected Result</label>

                            <textarea
                                name="expected_result"
                                placeholder="What should happen?"
                                value={form.expected_result}
                                onChange={handleChange}
                            />

                            <label>Actual Result</label>

                            <textarea
                                name="actual_result"
                                placeholder="What actually happened?"
                                value={form.actual_result}
                                onChange={handleChange}
                            />

                            <label>Status</label>

                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >
                                <option value="not_run">
                                    Not Run
                                </option>

                                <option value="passed">
                                    Passed
                                </option>

                                <option value="failed">
                                    Failed
                                </option>

                                <option value="blocked">
                                    Blocked
                                </option>
                            </select>

                            <button
                                type="submit"
                                className="testing-save-btn"
                            >
                                {editingTest
                                    ? "Update Test Case"
                                    : "Create Test Case"}
                            </button>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Testing;