import { useEffect, useState } from "react";
import {
    BarChart3,
    FolderKanban,
    CheckCircle,
    Bug,
    TestTube2,
    Rocket,
    Activity,
    BrainCircuit
} from "lucide-react";

import "./Reports.css";

function Reports() {

    const [report, setReport] = useState({
        projects: [],
        tasks: [],
        bugs: [],
        testCases: [],
        deployments: []
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadReportData = async () => {

            try {

                const token = localStorage.getItem("token");

const [
    projectsRes,
    tasksRes,
    bugsRes,
    testCasesRes,
    deploymentsRes
] = await Promise.all([
    fetch("http://localhost:5000/api/projects", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }),

    fetch("http://localhost:5000/api/tasks", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }),

    fetch("http://localhost:5000/api/bugs", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }),

    fetch("http://localhost:5000/api/test-cases", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }),

    fetch("http://localhost:5000/api/deployments", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
]);

                const projects = await projectsRes.json();
                const tasks = await tasksRes.json();
                const bugs = await bugsRes.json();
                const testCases = await testCasesRes.json();
                const deployments = await deploymentsRes.json();

                setReport({
                    projects,
                    tasks,
                    bugs,
                    testCases,
                    deployments
                });

            } catch (error) {

                console.error(
                    "Reports loading error:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        loadReportData();

    }, []);

    if (loading) {
        return (
            <div className="reports-loading">
                Loading project report...
            </div>
        );
    }

    // -----------------------------
    // CALCULATIONS
    // -----------------------------

    const completedProjects = report.projects.filter(
        project => project.status === "completed"
    ).length;

    const completedTasks = report.tasks.filter(
        task => task.status === "completed"
    ).length;

    const openBugs = report.bugs.filter(
        bug =>
            bug.status === "open" ||
            bug.status === "in_progress"
    ).length;

    const resolvedBugs = report.bugs.filter(
        bug =>
            bug.status === "resolved" ||
            bug.status === "closed"
    ).length;

    const passedTests = report.testCases.filter(
        test =>
            test.status === "passed"
    ).length;

    const failedTests = report.testCases.filter(
        test =>
            test.status === "failed"
    ).length;

    const successfulDeployments =
        report.deployments.filter(
            deployment =>
                deployment.status === "successful"
        ).length;

    const taskCompletionRate =
        report.tasks.length > 0
            ? Math.round(
                (completedTasks / report.tasks.length) * 100
            )
            : 0;

    const testPassRate =
        report.testCases.length > 0
            ? Math.round(
                (passedTests / report.testCases.length) * 100
            )
            : 0;

    const projectAverageProgress =
        report.projects.length > 0
            ? Math.round(
                report.projects.reduce(
                    (sum, project) =>
                        sum + Number(project.progress || 0),
                    0
                ) / report.projects.length
            )
            : 0;

    return (
        <div className="reports-page">

            {/* HEADER */}

            <div className="reports-header">

                <div className="reports-title">

                    <div className="reports-title-icon">
                        <BarChart3 size={26} />
                    </div>

                    <div>

                        <h1>Project Reports</h1>

                        <p>
                            Real-time software development lifecycle
                            analytics
                        </p>

                    </div>

                </div>

                <div className="report-status">
                    <Activity size={16} />
                    Live Data
                </div>

            </div>


            {/* SUMMARY */}

            <div className="report-grid">

                <div className="report-card">

                    <div className="report-icon">
                        <FolderKanban size={21} />
                    </div>

                    <strong>
                        {report.projects.length}
                    </strong>

                    <span>
                        Total Projects
                    </span>

                </div>


                <div className="report-card">

                    <div className="report-icon">
                        <CheckCircle size={21} />
                    </div>

                    <strong>
                        {completedTasks}
                    </strong>

                    <span>
                        Completed Tasks
                    </span>

                </div>


                <div className="report-card">

                    <div className="report-icon">
                        <Bug size={21} />
                    </div>

                    <strong>
                        {openBugs}
                    </strong>

                    <span>
                        Open Bugs
                    </span>

                </div>


                <div className="report-card">

                    <div className="report-icon">
                        <TestTube2 size={21} />
                    </div>

                    <strong>
                        {passedTests}
                    </strong>

                    <span>
                        Passed Tests
                    </span>

                </div>


                <div className="report-card">

                    <div className="report-icon">
                        <Rocket size={21} />
                    </div>

                    <strong>
                        {successfulDeployments}
                    </strong>

                    <span>
                        Successful Deployments
                    </span>

                </div>

            </div>


            {/* PERFORMANCE */}

            <div className="report-main-grid">

                <div className="report-section">

                    <div className="section-title">

                        <div>
                            <h2>Development Performance</h2>

                            <p>
                                Current lifecycle performance
                            </p>
                        </div>

                    </div>


                    <div className="performance-item">

                        <div className="performance-label">
                            <span>Task Completion</span>
                            <strong>
                                {taskCompletionRate}%
                            </strong>
                        </div>

                        <div className="performance-bar">
                            <div
                                style={{
                                    width: `${taskCompletionRate}%`
                                }}
                            />
                        </div>

                    </div>


                    <div className="performance-item">

                        <div className="performance-label">
                            <span>Test Pass Rate</span>
                            <strong>
                                {testPassRate}%
                            </strong>
                        </div>

                        <div className="performance-bar">
                            <div
                                style={{
                                    width: `${testPassRate}%`
                                }}
                            />
                        </div>

                    </div>


                    <div className="performance-item">

                        <div className="performance-label">
                            <span>Average Project Progress</span>
                            <strong>
                                {projectAverageProgress}%
                            </strong>
                        </div>

                        <div className="performance-bar">
                            <div
                                style={{
                                    width: `${projectAverageProgress}%`
                                }}
                            />
                        </div>

                    </div>

                </div>


                {/* BUG ANALYSIS */}

                <div className="report-section">

                    <div className="section-title">

                        <div>
                            <h2>Bug Analysis</h2>

                            <p>
                                Current defect status
                            </p>
                        </div>

                        <Bug size={20} />

                    </div>

                    <div className="bug-summary">

                        <div>
                            <strong>
                                {report.bugs.length}
                            </strong>

                            <span>
                                Total Bugs
                            </span>
                        </div>

                        <div>
                            <strong>
                                {openBugs}
                            </strong>

                            <span>
                                Open
                            </span>
                        </div>

                        <div>
                            <strong>
                                {resolvedBugs}
                            </strong>

                            <span>
                                Resolved
                            </span>
                        </div>

                    </div>

                </div>

            </div>


            {/* PROJECT REPORT */}

            <div className="report-section project-report">

                <div className="section-title">

                    <div>
                        <h2>Project Performance</h2>

                        <p>
                            Progress across all projects
                        </p>
                    </div>

                </div>


                {report.projects.length === 0 ? (

                    <div className="reports-empty">
                        No projects available.
                    </div>

                ) : (

                    <div className="project-report-list">

                        {report.projects.map(project => (

                            <div
                                className="project-report-item"
                                key={project.id}
                            >

                                <div className="project-report-info">

                                    <div>

                                        <strong>
                                            {project.name}
                                        </strong>

                                        <span>
                                            {project.status}
                                        </span>

                                    </div>

                                    <strong>
                                        {project.progress || 0}%
                                    </strong>

                                </div>

                                <div className="report-progress">

                                    <div
                                        style={{
                                            width: `${project.progress || 0}%`
                                        }}
                                    />

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>


            {/* AI SUMMARY */}

            <div className="ai-report-summary">

                <div className="ai-report-icon">
                    <BrainCircuit size={25} />
                </div>

                <div>

                    <h2>AI Report Summary</h2>

                    <p>

                        The platform is currently tracking{" "}
                        <strong>
                            {report.projects.length}
                        </strong>{" "}
                        project
                        {report.projects.length !== 1
                            ? "s"
                            : ""}{" "}
                        with an average progress of{" "}
                        <strong>
                            {projectAverageProgress}%
                        </strong>
                        . Task completion is at{" "}
                        <strong>
                            {taskCompletionRate}%
                        </strong>{" "}
                        and the current test pass rate is{" "}
                        <strong>
                            {testPassRate}%
                        </strong>
                        .

                    </p>

                </div>

            </div>

        </div>
    );
}

export default Reports;