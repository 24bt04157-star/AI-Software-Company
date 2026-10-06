const db = require("../config/db");

const getProjectInsights = async (req, res) => {
    const projectId = req.params.id;

    try {
        // Get project
        const projectResult = await new Promise((resolve, reject) => {
            db.query(
                "SELECT * FROM projects WHERE id = ?",
                [projectId],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });

        if (projectResult.length === 0) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const project = projectResult[0];

        // Get task statistics
        const taskResult = await new Promise((resolve, reject) => {
            db.query(
                `
                SELECT
                    COUNT(*) AS total_tasks,
                    SUM(status = 'completed') AS completed_tasks,
                    SUM(status = 'in_progress') AS in_progress_tasks,
                    SUM(
                        status != 'completed'
                        AND deadline < CURDATE()
                    ) AS overdue_tasks
                FROM tasks
                WHERE project_id = ?
                `,
                [projectId],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });

        // Get bug statistics
        const bugResult = await new Promise((resolve, reject) => {
            db.query(
                `
                SELECT
                    COUNT(*) AS total_bugs,
                    SUM(status IN ('open', 'in_progress')) AS open_bugs,
                    SUM(severity = 'critical' AND status != 'closed') AS critical_bugs,
                    SUM(severity = 'high' AND status != 'closed') AS high_bugs
                FROM bugs
                WHERE project_id = ?
                `,
                [projectId],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });

        const tasks = taskResult[0];
        const bugs = bugResult[0];

        const totalTasks = Number(tasks.total_tasks || 0);
        const completedTasks = Number(tasks.completed_tasks || 0);
        const overdueTasks = Number(tasks.overdue_tasks || 0);

        const openBugs = Number(bugs.open_bugs || 0);
        const criticalBugs = Number(bugs.critical_bugs || 0);
        const highBugs = Number(bugs.high_bugs || 0);

        // Calculate task completion rate
        const taskCompletionRate =
            totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0;

        // Start health score
        let healthScore = 100;

        // Task risk
        healthScore -= overdueTasks * 10;

        // Bug risk
        healthScore -= criticalBugs * 20;
        healthScore -= highBugs * 10;

        // Open bug risk
        healthScore -= Math.min(openBugs * 3, 15);

        // Project progress risk
        if (project.progress < 30) {
            healthScore -= 10;
        }

        healthScore = Math.max(0, Math.min(100, healthScore));

        // Determine risk level
        let riskLevel;

        if (healthScore >= 80) {
            riskLevel = "LOW";
        } else if (healthScore >= 60) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "HIGH";
        }

        // Generate recommendations
        const recommendations = [];

        if (overdueTasks > 0) {
            recommendations.push(
                `${overdueTasks} overdue task(s) require immediate attention.`
            );
        }

        if (criticalBugs > 0) {
            recommendations.push(
                `${criticalBugs} critical bug(s) should be resolved before deployment.`
            );
        }

        if (highBugs > 0) {
            recommendations.push(
                `${highBugs} high-severity bug(s) require priority review.`
            );
        }

        if (taskCompletionRate < 50 && totalTasks > 0) {
            recommendations.push(
                "Task completion rate is below 50%. Consider reviewing workload and deadlines."
            );
        }

        if (project.progress < 30) {
            recommendations.push(
                "Project progress is relatively low. Review the current SDLC phase and pending work."
            );
        }

        if (recommendations.length === 0) {
            recommendations.push(
                "Project is progressing normally. Continue monitoring tasks, bugs and deadlines."
            );
        }

        res.json({
            project: {
                id: project.id,
                name: project.name,
                status: project.status,
                priority: project.priority,
                progress: project.progress,
                deadline: project.deadline
            },

            intelligence: {
                healthScore,
                riskLevel,
                taskCompletionRate,

                tasks: {
                    total: totalTasks,
                    completed: completedTasks,
                    overdue: overdueTasks
                },

                bugs: {
                    total: Number(bugs.total_bugs || 0),
                    open: openBugs,
                    critical: criticalBugs,
                    high: highBugs
                },

                recommendations
            }
        });

    } catch (error) {
        console.error("Intelligence Engine Error:", error);

        res.status(500).json({
            message: "Failed to generate project insights"
        });
    }
};

module.exports = {
    getProjectInsights
};