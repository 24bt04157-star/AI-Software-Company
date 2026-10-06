import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  CheckSquare,
  FileText,
  Users,
  Bug,
  FlaskConical,
  Rocket,
  BrainCircuit,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronDown
} from "lucide-react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Projects from "./pages/Projects";
import Requirements from "./pages/Requirements";
import Tasks from "./pages/Tasks";
import Bugs from "./pages/Bugs";
import Testing from "./pages/Testing";
import Deployments from "./pages/Deployments";
import Team from "./pages/Team";
import Login from "./pages/Login";
import AIInsights from "./pages/AIInsights";
import Reports from "./pages/Reports";
import "./App.css";

function App() {
    const location = useLocation();
const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
};    
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

const currentUser = storedUser
    ? JSON.parse(storedUser)
    : null;
const [dashboardData, setDashboardData] = useState({
    projects: 0,
    tasks: 0,
    bugs: 0,
    users: 0,
    projectList: [],
    recentTasks: [],
    overdueTasks: 0,
    criticalBugs: 0
});
const healthScore = Math.max(
    0,
    100 -
        dashboardData.overdueTasks * 10 -
        dashboardData.criticalBugs * 15 -
        dashboardData.bugs * 5
);

const healthStatus =
    healthScore >= 80
        ? "Good"
        : healthScore >= 60
        ? "Needs Attention"
        : "Critical";
useEffect(() => {
    const loadDashboardData = async () => {
        try {
           const token = localStorage.getItem("token");

const [
    projectsRes,
    tasksRes,
    bugsRes,
    usersRes
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
                fetch("http://localhost:5000/api/users", {
    headers: {
        Authorization: `Bearer ${token}`
    }
})
            ]);

            const projects = await projectsRes.json();
            const tasks = await tasksRes.json();
            const bugs = await bugsRes.json();
            const users = await usersRes.json();

            setDashboardData({
    projects: projects.length,

    tasks: tasks.filter(
        task => task.status === "in_progress"
    ).length,

    bugs: bugs.filter(
        bug =>
            bug.status === "open" ||
            bug.status === "in_progress"
    ).length,

    users: users.length,

    projectList: projects,
    recentTasks: tasks.slice(0, 5),
overdueTasks: tasks.filter(task => {
    if (!task.deadline || task.status === "completed") {
        return false;
    }

    return new Date(task.deadline) < new Date();
}).length,
criticalBugs: bugs.filter(
    bug =>
        bug.severity === "critical" &&
        bug.status !== "closed" &&
        bug.status !== "resolved"
).length
});

        } catch (error) {
            console.error(
                "Dashboard data loading error:",
                error
            );
        }
    };

    loadDashboardData();
}, []);
    if (location.pathname === "/login") {
        if (token) {
            window.location.href = "/";
            return null;
        }

        return <Login />;
    }

    if (!token) {
        window.location.href = "/login";
        return null;
    }

    return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="logo">
          <div className="logo-icon">S</div>
          <div>
            <h2>SDLC<span>IQ</span></h2>
            <p>Intelligent Platform</p>
          </div>
        </div>

        <div className="menu-section">
          <p className="menu-title">MAIN</p>

         <MenuItem
    icon={<LayoutDashboard size={19} />}
    text="Dashboard"
    active
    onClick={() => window.location.href = "/"}
/>
          <MenuItem
    icon={<FolderKanban size={19} />}
    text="Projects"
    onClick={() => window.location.href = "/projects"}
/>
          <MenuItem
    icon={<FileText size={19} />}
    text="Requirements"
    onClick={() => window.location.href = "/requirements"}
/>
          <MenuItem
    icon={<CheckSquare size={19} />}
    text="Tasks"
    onClick={() => window.location.href = "/tasks"}
/>
        </div>

        <div className="menu-section">
          <p className="menu-title">MANAGEMENT</p>

          <MenuItem
    icon={<Users />}
    text="Team"
    onClick={() => window.location.href = "/team"}
    active={location.pathname === "/team"}
/>
          <MenuItem
    icon={<Bug />}
    text="Bugs"
    onClick={() => window.location.href = "/bugs"}
    active={location.pathname === "/bugs"}
/>
          <MenuItem
    icon={<FlaskConical size={19} />}
    text="Testing"
    onClick={() => window.location.href = "/testing"}
    active={location.pathname === "/testing"}
/>
          <MenuItem
    icon={<span>🚀</span>}
    text="Deployments"
    onClick={() => window.location.href = "/deployments"}
    active={location.pathname === "/deployments"}
/>
        </div>

        <div className="menu-section">
          <p className="menu-title">INTELLIGENCE</p>

          <MenuItem
    icon={<BrainCircuit size={19} />}
    text="AI Insights"
    active={location.pathname === "/ai-insights"}
    onClick={() => {
        window.location.href = "/ai-insights";
    }}
/>
          <MenuItem
    icon={<BarChart3 size={19} />}
    text="Reports"
    active={location.pathname === "/reports"}
    onClick={() => {
        window.location.href = "/reports";
    }}
/>
        </div>

        <div className="sidebar-bottom">
          <MenuItem icon={<Settings size={19} />} text="Settings" />
        </div>
<button
    className="logout-btn"
    onClick={handleLogout}
>
    🚪 Logout
</button>
      </aside>


      {/* MAIN AREA */}
      <main className="main">

        {/* TOP NAVBAR */}
        <header className="navbar">

          <div className="search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search projects, tasks, bugs..."
            />
          </div>

          <div className="nav-right">

            <button className="notification">
              <Bell size={20} />
              <span></span>
            </button>

<div className="profile">

    <div className="avatar">
        {currentUser?.name
            ? currentUser.name
                  .split(" ")
                  .map(word => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
            : "U"}
    </div>

    <div className="profile-info">
        <strong>{currentUser?.name || "User"}</strong>
        <small>{currentUser?.role || "Developer"}</small>
    </div>

    <ChevronDown size={17} />

</div>

          </div>

        </header>

{location.pathname === "/projects" ? (
    <Projects />
) : location.pathname === "/requirements" ? (
    <Requirements />
) : location.pathname === "/tasks" ? (
    <Tasks />
) : location.pathname === "/bugs" ? (
    <Bugs />
) : location.pathname === "/testing" ? (
    <Testing />
) : location.pathname === "/deployments" ? (
    <Deployments />
) : location.pathname === "/team" ? (
    <Team />
    ) : location.pathname === "/ai-insights" ? (
    <AIInsights />
    ) : location.pathname === "/reports" ? (
    <Reports />
) : (
    <>
        {/* DASHBOARD */}

        <section className="content">

          <div className="welcome">

            <div>
              <p className="eyebrow">OVERVIEW</p>

              <h1>
                Good afternoon, Manav 👋
              </h1>

              <p>
                Here's what's happening across your software projects.
              </p>
            </div>

            <button className="primary-btn">
              + New Project
            </button>

          </div>


          {/* STAT CARDS */}

          <div className="stats-grid">

            <StatCard
              title="Active Projects"
              value={dashboardData.projects}
              change="+12%"
              icon={<FolderKanban />}
            />

            <StatCard
              title="Tasks In Progress"
              value={dashboardData.tasks}
              change="+8%"
              icon={<CheckSquare />}
            />

            <StatCard
              title="Open Bugs"
              value={dashboardData.bugs}
              change="-5%"
              icon={<Bug />}
            />

            <StatCard
              title="Team Members"
              value={dashboardData.users}
              change="+4%"
              icon={<Users />}
            />

          </div>


          {/* MAIN DASHBOARD GRID */}

          <div className="dashboard-grid">

            {/* PROJECT PROGRESS */}

            <div className="card project-card">

              <div className="card-header">

                <div>
                  <h3>Project Progress</h3>
                  <p>Current SDLC progress</p>
                </div>

                <button className="view-btn">
                  View All
                </button>

              </div>


              {dashboardData.projectList.map((project) => (
    <ProjectProgress
        key={project.id}
        name={project.name}
        progress={project.progress}
        status={
            project.status
                ? project.status.charAt(0).toUpperCase() +
                  project.status.slice(1)
                : "Planning"
        }
    />
))}
            </div>


            {/* AI INSIGHTS */}

            <div className="card ai-card">

              <div className="ai-heading">

                <div className="ai-icon">
                  <BrainCircuit size={22} />
                </div>

                <div>
                  <h3>AI Insights</h3>
                  <p>Intelligent project analysis</p>
                </div>

              </div>


              <div className="insight warning">
                <span>⚠️</span>

                <div>
                  <strong>
    {dashboardData.overdueTasks > 0
        ? "High Risk Detected"
        : "Project Health Looks Good"}
</strong>

<p>
    {dashboardData.overdueTasks > 0
        ? `${dashboardData.overdueTasks} overdue task${dashboardData.overdueTasks > 1 ? "s" : ""} detected across your projects.`
            : "No overdue tasks detected across your projects."}
</p>
                </div>
              </div>


              <div className="insight success">
                <span>✓</span>

                <div>
                  <strong>Project On Track</strong>
                  <p>
    {dashboardData.projectList.length > 0
        ? `${dashboardData.projectList[0].name} is currently being tracked by the platform.`
        : "No projects are currently available."}
</p>
                </div>
              </div>


              <div className="insight info">
                <span>💡</span>

                <div>
                  <strong>Priority Recommendation</strong>
                  <p>
    {dashboardData.criticalBugs > 0
        ? `Resolve ${dashboardData.criticalBugs} critical bug${dashboardData.criticalBugs > 1 ? "s" : ""} before the next release.`
        : "No critical bugs currently require immediate attention."}
</p>
                </div>
              </div>


              <button className="ai-btn">
                View All Insights →
              </button>

            </div>

          </div>


          {/* BOTTOM SECTION */}

          <div className="bottom-grid">

            <div className="card">

              <div className="card-header">
                <div>
                  <h3>Recent Tasks</h3>
                  <p>Latest project activities</p>
                </div>
              </div>

              {dashboardData.recentTasks.map((task) => (
    <Task
        key={task.id}
        title={task.title}
        project={
            dashboardData.projectList.find(
                project => project.id === task.project_id
            )?.name || "Unknown Project"
        }
        status={
            task.status === "in_progress"
                ? "In Progress"
                : task.status === "todo"
                ? "To Do"
                : task.status === "review"
                ? "Review"
                : task.status === "completed"
                ? "Completed"
                : task.status
        }
    />
))}

            </div>


            <div className="card health-card">

              <div className="card-header">
                <div>
                  <h3>System Health</h3>
                  <p>Overall project health</p>
                </div>
              </div>

              <div className="health-score">
                <div className="score-circle">
                  <strong>{healthScore}</strong>
                  <span>/100</span>
                </div>

                <div>
                  <h4>{healthStatus}</h4>
                  <p>
    {healthStatus === "Good"
        ? "Projects are generally progressing according to schedule."
        : healthStatus === "Needs Attention"
        ? "Some project risks require attention."
        : "Critical project risks require immediate attention."}
</p>  
                </div>
              </div>

            </div>

          </div>

</section>
    </>
)}
</main>

    </div>
  );
}


/* MENU ITEM */

function MenuItem({ icon, text, active, onClick }) {
    return (
        <div
            className={`menu-item ${active ? "active" : ""}`}
            onClick={onClick}
        >
            {icon}
            <span>{text}</span>
        </div>
    );
}


/* STAT CARD */

function StatCard({ title, value, change, icon }) {

  return (
    <div className="stat-card">

      <div className="stat-top">

        <div className="stat-icon">
          {icon}
        </div>

        <span className="change">
          {change}
        </span>

      </div>

      <h2>{value}</h2>

      <p>{title}</p>

    </div>
  );

}


/* PROJECT PROGRESS */

function ProjectProgress({ name, progress, status }) {

  return (
    <div className="project-progress">

      <div className="project-info">

        <div>
          <strong>{name}</strong>
          <small>{status}</small>
        </div>

        <span>{progress}%</span>

      </div>

      <div className="progress-bar">
        <div style={{ width: `${progress}%` }}></div>
      </div>

    </div>
  );

}


/* TASK */

function Task({ title, project, status }) {

  return (
    <div className="task">

      <div className="task-icon">
        ✓
      </div>

      <div className="task-info">
        <strong>{title}</strong>
        <small>{project}</small>
      </div>

      <span className={`task-status ${status.toLowerCase().replace(" ", "-")}`}>
        {status}
      </span>

    </div>
  );

}

export default App;