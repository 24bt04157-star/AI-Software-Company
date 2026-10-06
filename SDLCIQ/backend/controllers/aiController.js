const db = require("../config/db");

const getProjectRisk = (req, res) => {
    const projectId = req.params.id;

    const sql = `
        SELECT
            p.id,
            p.name,
            p.progress,
            p.deadline,

            (
                SELECT COUNT(*)
                FROM tasks t
                WHERE t.project_id = p.id
                AND t.status != 'completed'
            ) AS incomplete_tasks,

            (
                SELECT COUNT(*)
                FROM tasks t
                WHERE t.project_id = p.id
                AND t.status != 'completed'
                AND t.deadline IS NOT NULL
                AND t.deadline < CURDATE()
            ) AS overdue_tasks,

            (
                SELECT COUNT(*)
                FROM bugs b
                WHERE b.project_id = p.id
                AND b.severity IN ('high', 'critical')
                AND b.status NOT IN ('resolved', 'closed')
            ) AS critical_bugs,

            (
                SELECT COUNT(*)
                FROM test_cases tc
                WHERE tc.project_id = p.id
                AND tc.status = 'failed'
            ) AS failed_tests,

            (
                SELECT COUNT(*)
                FROM test_cases tc
                WHERE tc.project_id = p.id
            ) AS total_tests

        FROM projects p
        WHERE p.id = ?
    `;

    db.query(sql, [projectId], (err, results) => {
        if (err) {
            console.error("AI risk analysis error:", err);

            return res.status(500).json({
                message: "Failed to analyze project risk"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const project = results[0];

        let riskScore = 0;
        const riskFactors = [];
        const recommendations = [];

        // Overdue tasks
        if (project.overdue_tasks > 0) {
            riskScore += Math.min(project.overdue_tasks * 10, 30);

            riskFactors.push(
                `${project.overdue_tasks} overdue task(s)`
            );

            recommendations.push(
                "Prioritize and complete overdue tasks."
            );
        }

        // Critical bugs
        if (project.critical_bugs > 0) {
            riskScore += Math.min(project.critical_bugs * 15, 30);

            riskFactors.push(
                `${project.critical_bugs} high/critical open bug(s)`
            );

            recommendations.push(
                "Resolve high and critical bugs before deployment."
            );
        }

        // Failed tests
        if (project.failed_tests > 0) {
            riskScore += Math.min(project.failed_tests * 8, 20);

            riskFactors.push(
                `${project.failed_tests} failed test case(s)`
            );

            recommendations.push(
                "Investigate failed test cases and improve test coverage."
            );
        }

        // Low project progress
        if (project.progress < 30) {
            riskScore += 15;

            riskFactors.push(
                "Project progress is below 30%"
            );

            recommendations.push(
                "Review project planning and task allocation."
            );
        }

        // Deadline approaching
        if (project.deadline) {
            const today = new Date();
            const deadline = new Date(project.deadline);

            const daysRemaining = Math.ceil(
                (deadline - today) /
                (1000 * 60 * 60 * 24)
            );

            if (
                daysRemaining >= 0 &&
                daysRemaining <= 7 &&
                project.progress < 80
            ) {
                riskScore += 15;

                riskFactors.push(
                    `Deadline is approaching (${daysRemaining} day(s) remaining)`
                );

                recommendations.push(
                    "Focus on high-priority work before the deadline."
                );
            }
        }

        riskScore = Math.min(riskScore, 100);

        let riskLevel;

        if (riskScore >= 70) {
            riskLevel = "High";
        } else if (riskScore >= 40) {
            riskLevel = "Medium";
        } else {
            riskLevel = "Low";
        }

        res.json({
            project: {
                id: project.id,
                name: project.name,
                progress: project.progress,
                deadline: project.deadline
            },
            riskScore,
            riskLevel,
            riskFactors,
            recommendations,
            metrics: {
                incompleteTasks: project.incomplete_tasks,
                overdueTasks: project.overdue_tasks,
                criticalBugs: project.critical_bugs,
                failedTests: project.failed_tests,
                totalTests: project.total_tests
            }
        });
    });
};

module.exports = {
    getProjectRisk
};