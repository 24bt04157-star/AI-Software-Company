import { useEffect, useState } from "react";
import {
    BrainCircuit,
    AlertTriangle,
    CheckCircle,
    Bug,
    ListTodo,
    Activity,
    ShieldAlert,
    Lightbulb
} from "lucide-react";

import "./AIInsights.css";

function AIInsights() {

    const [data, setData] = useState({
        projects: [],
        tasks: [],
        bugs: []
    });

    const [loading, setLoading] = useState(true);
const [projectRisks, setProjectRisks] = useState([]);
    useEffect(() => {

        const loadData = async () => {

            try {
const token = localStorage.getItem("token");

const [
    projectsRes,
    tasksRes,
    bugsRes
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
    })
]);

                const projects = await projectsRes.json();
const tasks = await tasksRes.json();
const bugs = await bugsRes.json();

const riskResults = await Promise.all(
    projects.map(async (project) => {
        try {
            const riskResponse = await fetch(
                `http://localhost:5000/api/intelligence/project/${project.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const result = await riskResponse.json();

            if (!riskResponse.ok) {
                throw new Error(
                    result.message || "Intelligence analysis failed"
                );
            }

            return result;
        } catch (error) {
            console.error(
                `Intelligence analysis failed for project ${project.id}:`,
                error
            );

            return null;
        }
    })
);

    const validRisks = riskResults.filter(
        (risk) => risk !== null
    );

setProjectRisks(validRisks);

setData({
    projects,
    tasks,
    bugs
});

            } catch (error) {

                console.error(
                    "AI Insights loading error:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        loadData();

    }, []);

    if (loading) {
        return (
            <div className="ai-page-loading">
                Loading AI insights...
            </div>
        );
    }

    // -----------------------------
    // INTELLIGENCE CALCULATIONS
    // -----------------------------

    const overdueTasks = data.tasks.filter(task => {

        if (
            !task.deadline ||
            task.status === "completed"
        ) {
            return false;
        }

        return new Date(task.deadline) < new Date();

    });

    const criticalBugs = data.bugs.filter(bug =>
        bug.severity === "critical" &&
        bug.status !== "closed" &&
        bug.status !== "resolved"
    );

    const openBugs = data.bugs.filter(bug =>
        bug.status === "open" ||
        bug.status === "in_progress"
    );

    const completedTasks = data.tasks.filter(
        task => task.status === "completed"
    );
console.log("PROJECT RISKS:", projectRisks);
    const backendHealthScores = projectRisks
    .filter(
        (risk) =>
            risk &&
            risk.intelligence &&
            typeof risk.intelligence.healthScore === "number"
    )
    .map((risk) => risk.intelligence.healthScore);

const healthScore =
    backendHealthScores.length > 0
        ? Math.round(
              backendHealthScores.reduce(
                  (sum, score) => sum + score,
                  0
              ) / backendHealthScores.length
          )
        : Math.max(
              0,
              100 -
                  overdueTasks.length * 10 -
                  criticalBugs.length * 15 -
                  openBugs.length * 5
          );

    const healthStatus =
        healthScore >= 80
            ? "Good"
            : healthScore >= 60
            ? "Needs Attention"
            : "Critical";

    // -----------------------------
    // AI RECOMMENDATIONS
    // -----------------------------

    const recommendations = [];
projectRisks.forEach((risk) => {
    if (!risk || !risk.intelligence || !risk.project) {
        return;
    }

    const { project, intelligence } = risk;

    if (intelligence.riskLevel === "HIGH") {
        recommendations.push({
            type: "danger",
            icon: <AlertTriangle size={20} />,
            title: `${project.name} - High Risk`,
            text: `Backend analysis detected high project risk. Health score: ${intelligence.healthScore}/100.`
        });
    }

    if (intelligence.riskLevel === "MEDIUM") {
        recommendations.push({
            type: "warning",
            icon: <Bug size={20} />,
            title: `${project.name} - Needs Attention`,
            text: `Backend analysis detected medium project risk. Health score: ${intelligence.healthScore}/100.`
        });
    }

    if (intelligence.riskLevel === "LOW") {
        recommendations.push({
            type: "success",
            icon: <CheckCircle size={20} />,
            title: `${project.name} - Low Risk`,
            text: `Backend analysis reports a healthy project state. Health score: ${intelligence.healthScore}/100.`
        });
    }
});
    if (overdueTasks.length > 0) {

        recommendations.push({
            type: "danger",
            icon: <AlertTriangle size={20} />,
            title: "Overdue Tasks Detected",
            text:
                `${overdueTasks.length} task${overdueTasks.length > 1 ? "s are" : " is"} overdue. `
                + "Review deadlines and reassign resources if necessary."
        });

    }

    if (criticalBugs.length > 0) {

        recommendations.push({
            type: "danger",
            icon: <ShieldAlert size={20} />,
            title: "Critical Bugs Require Attention",
            text:
                `${criticalBugs.length} critical bug${criticalBugs.length > 1 ? "s are" : " is"} unresolved. `
                + "Resolve them before the next production release."
        });

    }

    if (
        overdueTasks.length === 0 &&
        criticalBugs.length === 0
    ) {

        recommendations.push({
            type: "success",
            icon: <CheckCircle size={20} />,
            title: "Project Health Looks Good",
            text:
                "No overdue tasks or critical unresolved bugs were detected."
        });

    }

    if (openBugs.length > 0) {

        recommendations.push({
            type: "warning",
            icon: <Bug size={20} />,
            title: "Bug Management",
            text:
                `${openBugs.length} open or in-progress bug${openBugs.length > 1 ? "s" : ""} currently require attention.`
        });

    }

    if (data.tasks.length > 0) {

        const completionRate =
            Math.round(
                (completedTasks.length / data.tasks.length) * 100
            );

        recommendations.push({
            type: "info",
            icon: <Lightbulb size={20} />,
            title: "Task Completion",
            text:
                `Current task completion rate is ${completionRate}%.`
        });

    }

    return (
        <div className="ai-insights-page">

            {/* HEADER */}

            <div className="ai-page-header">

                <div>

                    <div className="ai-title">

                        <div className="ai-title-icon">
                            <BrainCircuit size={26} />
                        </div>

                        <div>
                            <h1>AI Insights</h1>

                            <p>
                                Intelligent analysis of your software projects
                            </p>
                        </div>

                    </div>

                </div>

                <div className="ai-status">
                    <Activity size={16} />
                    Rule-Based Intelligence Active
                </div>

            </div>


            {/* HEALTH OVERVIEW */}

            <div className="ai-overview-grid">

                <div className="ai-health-card">

                    <div className="health-ring">

                        <strong>
                            {healthScore}
                        </strong>

                        <span>/100</span>

                    </div>

                    <div>

                        <span className="ai-label">
                            Overall Project Health
                        </span>

                        <h2>
                            {healthStatus}
                        </h2>

                        <p>
                            Calculated from project risks,
                            tasks and bugs.
                        </p>

                    </div>

                </div>


                <div className="ai-metric-card">

                    <div className="metric-icon">
                        <ListTodo size={21} />
                    </div>

                    <div>
                        <strong>
                            {overdueTasks.length}
                        </strong>

                        <span>
                            Overdue Tasks
                        </span>
                    </div>

                </div>


                <div className="ai-metric-card">

                    <div className="metric-icon">
                        <Bug size={21} />
                    </div>

                    <div>
                        <strong>
                            {openBugs.length}
                        </strong>

                        <span>
                            Open Bugs
                        </span>
                    </div>

                </div>


                <div className="ai-metric-card">

                    <div className="metric-icon">
                        <ShieldAlert size={21} />
                    </div>

                    <div>
                        <strong>
                            {criticalBugs.length}
                        </strong>

                        <span>
                            Critical Bugs
                        </span>
                    </div>

                </div>

            </div>


            {/* PROJECT ANALYSIS */}

            <div className="ai-section">

                <div className="ai-section-header">

                    <div>
                        <h2>Project Analysis</h2>

                        <p>
                            Current project health and progress
                        </p>
                    </div>

                </div>


                <div className="ai-project-list">

                    {data.projects.length === 0 ? (

                        <div className="ai-empty">
                            No projects available for analysis.
                        </div>

                    ) : (

                        data.projects.map(project => (

                            <div
                                className="ai-project"
                                key={project.id}
                            >

                                <div className="ai-project-top">

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

                                <div className="ai-progress">

                                    <div
                                        style={{
                                            width: `${project.progress || 0}%`
                                        }}
                                    />

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </div>


            {/* RECOMMENDATIONS */}

            <div className="ai-section">

                <div className="ai-section-header">

                    <div>

                        <h2>AI Recommendations</h2>

                        <p>
                            Actions suggested from current project data
                        </p>

                    </div>

                </div>


                <div className="recommendation-list">

                    {recommendations.map(
                        (recommendation, index) => (

                            <div
                                className={`recommendation ${recommendation.type}`}
                                key={index}
                            >

                                <div className="recommendation-icon">
                                    {recommendation.icon}
                                </div>

                                <div>

                                    <strong>
                                        {recommendation.title}
                                    </strong>

                                    <p>
                                        {recommendation.text}
                                    </p>

                                </div>

                            </div>

                        )
                    )}

                </div>

            </div>

        </div>
    );
    {/* PROJECT RISK ANALYSIS */}

<div className="ai-section">

    <div className="ai-section-header">

        <div>
            <h2>Project Risk Analysis</h2>

            <p>
                Automated risk detection based on real project data.
            </p>
        </div>

        <ShieldAlert size={24} />

    </div>


    <div className="risk-grid">

        {projectRisks.length === 0 ? (

            <div className="empty-risk">
                No project risk data available.
            </div>

        ) : (

            projectRisks.map((risk) => (

                <div
                    className="risk-card"
                    key={risk.project.id}
                >

                    <div className="risk-card-header">

                        <div>

                            <h3>
                                {risk.project.name}
                            </h3>

                            <span>
                                Progress: {risk.project.progress}%
                            </span>

                        </div>


                        <div
                            className={`risk-badge ${risk.riskLevel.toLowerCase()}`}
                        >
                            {risk.riskLevel}
                        </div>

                    </div>


                    <div className="risk-score">

                        <span>
                            Risk Score
                        </span>

                        <strong>
                            {risk.riskScore}/100
                        </strong>

                    </div>


                    <div className="risk-details">

                        <div>

                            <h4>
                                <AlertTriangle size={16} />
                                Risk Factors
                            </h4>

                            {risk.riskFactors.length === 0 ? (

                                <p>
                                    No major risks detected.
                                </p>

                            ) : (

                                <ul>

                                    {risk.riskFactors.map(
                                        (factor, index) => (
                                            <li key={index}>
                                                {factor}
                                            </li>
                                        )
                                    )}

                                </ul>

                            )}

                        </div>


                        <div>

                            <h4>
                                <Lightbulb size={16} />
                                Recommendations
                            </h4>

                            {risk.recommendations.length === 0 ? (

                                <p>
                                    No recommendations at this time.
                                </p>

                            ) : (

                                <ul>

                                    {risk.recommendations.map(
                                        (recommendation, index) => (
                                            <li key={index}>
                                                {recommendation}
                                            </li>
                                        )
                                    )}

                                </ul>

                            )}

                        </div>

                    </div>

                </div>

            ))

        )}

    </div>

</div>
}

export default AIInsights;