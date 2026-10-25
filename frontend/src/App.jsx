import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  Bug,
  Check,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
  Code2,
  Clock3,
} from "lucide-react";
import { api, post, patch, token, saveToken } from "./api";
const TYPES = [
  ["srs", "SRS document", "Requirements and scope", FileText],
  [
    "userStories",
    "User stories",
    "Features and acceptance criteria",
    ClipboardList,
  ],
  ["architecture", "Architecture design", "Components and data flow", Code2],
  ["sprintPlan", "Sprint plan", "Tasks and milestones", Activity],
  ["estimate", "Cost & timeline", "Assumptions and estimates", Clock3],
  ["uml", "UML / workflow", "Conceptual workflow", Code2],
  ["testCases", "QA test cases", "Scenarios and edge cases", ShieldCheck],
  ["apiDesign", "API design", "Routes and contracts", FileText],
];
const ROLES = [
  "Business Analyst",
  "Solution Architect",
  "Project Manager",
  "Developer Assistant",
  "QA Engineer",
];
const STATUSES = { todo: "To do", "in-progress": "In progress", done: "Done" };
const initials = (n) =>
  (n || "U")
    .split(/\s+/)
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const date = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "—";
function Empty({ title, children }) {
  return (
    <div className="empty">
      <Sparkles size={23} />
      <b>{title}</b>
      <p>{children}</p>
    </div>
  );
}
function Err({ children }) {
  return children ? (
    <div className="error" role="alert">
      {children}
    </div>
  ) : null;
}
function App() {
  const [user, setUser] = useState(null),
    [mode, setMode] = useState("login"),
    [auth, setAuth] = useState({ name: "", email: "", password: "" }),
    [authError, setAuthError] = useState(""),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [busy, setBusy] = useState(false);
  const [projects, setProjects] = useState([]),
    [project, setProject] = useState(null),
    [view, setView] = useState("overview"),
    [mobile, setMobile] = useState(false),
    [search, setSearch] = useState(""),
    [showCreate, setShowCreate] = useState(false),
    [showInvite, setShowInvite] = useState(false),
    [extraMembers, setExtraMembers] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("workspaceMembers") || "[]");
  } catch {
    return [];
  }
}),
    [workspaceName, setWorkspaceName] = useState(
  localStorage.getItem("workspaceName") || "My Workspace"
),
    [newProject, setNewProject] = useState({
      title: "",
      idea: "",
      platform: "Web application",
    });
  const [task, setTask] = useState({
      title: "",
      description: "",
      priority: "medium",
    }),
    [bug, setBug] = useState({
      title: "",
      description: "",
      severity: "medium",
    }),
    [chat, setChat] = useState(""),
    [role, setRole] = useState(ROLES[0]),
    [chatBusy, setChatBusy] = useState(false),
    [gen, setGen] = useState(""),
    [selected, setSelected] = useState(null),
    [editText, setEditText] = useState("");
  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };
  const handleInviteMember = (member) => {
  const initials = member.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  setExtraMembers((current) => {
  const updated = [...current, { ...member, initials }];
  localStorage.setItem("workspaceMembers", JSON.stringify(updated));
  return updated;
});

  setShowInvite(false);
  notify(`Added ${member.name} to the workspace`);
};
  const reload = async (id = project?.id) => {
    const r = await api("/projects");
    setProjects(r.projects || []);
    if (id) {
      const p = (r.projects || []).find((x) => x.id === id);
      if (p) {
        const full = await api(`/projects/${id}`);
        setProject(full.project);
      }
    }
  };
  useEffect(() => {
    if (!token()) return;
    api("/me")
      .then((r) => {
        setUser(r.user);
        return api("/projects");
      })
      .then((r) => setProjects(r.projects || []))
      .catch(() => saveToken(null));
  }, []);
  const totals = useMemo(() => {
    const ts = projects.flatMap((p) => p.tasks || []),
      bs = projects.flatMap((p) => p.bugs || []);
    return {
      tasks: ts.length,
      done: ts.filter((t) => t.status === "done").length,
      bugs: bs.filter((b) => b.status !== "resolved").length,
    };
  }, [projects]);
  const progress = (p) =>
    p?.tasks?.length
      ? Math.round(
          (p.tasks.filter((t) => t.status === "done").length / p.tasks.length) *
            100,
        )
      : 0;
  const login = async (e) => {
    e.preventDefault();
    setBusy(true);
    setAuthError("");
    try {
      const r = await api(
        mode === "login" ? "/auth/login" : "/auth/register",
        post(auth),
      );
      saveToken(r.token);
      setUser(r.user);
      setProjects((await api("/projects")).projects || []);
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const signout = () => {
    saveToken(null);
    setUser(null);
    setProject(null);
    setProjects([]);
    setView("overview");
  };
  const createProject = async (e) => {
    e.preventDefault();
    try {
      const r = await api("/projects", post(newProject));
      setProjects((p) => [r.project, ...p]);
      setProject(r.project);
      setShowCreate(false);
      setNewProject({ title: "", idea: "", platform: "Web application" });
      setView("overview");
      notify("Project created");
    } catch (e) {
      setError(e.message);
    }
  };
  const selectProject = async (id) => {
    try {
      const r = await api(`/projects/${id}`);
      setProject(r.project);
      setView("overview");
      setMobile(false);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };
  const refresh = async () => {
    if (project) await reload(project.id);
    else await reload();
  };
  const deleteProject = async (p) => {
    if (!confirm(`Delete ${p.title} and all its project data?`)) return;
    try {
      await api(`/projects/${p.id}`, { method: "DELETE" });
      setProjects((xs) => xs.filter((x) => x.id !== p.id));
      if (project?.id === p.id) setProject(null);
      notify("Project deleted");
    } catch (e) {
      setError(e.message);
    }
  };
  const addTask = async (e) => {
    e.preventDefault();
    if (!project) return;
    try {
      await api(`/projects/${project.id}/tasks`, post(task));
      setTask({ title: "", description: "", priority: "medium" });
      await refresh();
      notify("Task added");
    } catch (e) {
      setError(e.message);
    }
  };
  const updateTask = async (id, v) => {
    try {
      await api(`/tasks/${id}`, patch(v));
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  };
  const deleteTask = async (id) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api(`/tasks/${id}`, { method: "DELETE" });
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  };
  const addBug = async (e) => {
    e.preventDefault();
    if (!project) return;
    try {
      await api(`/projects/${project.id}/bugs`, post(bug));
      setBug({ title: "", description: "", severity: "medium" });
      await refresh();
      notify("Bug reported");
    } catch (e) {
      setError(e.message);
    }
  };
  const updateBug = async (id, v) => {
    try {
      await api(`/bugs/${id}`, patch(v));
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  };
  const deleteBug = async (id) => {
    if (!confirm("Delete this bug report?")) return;
    try {
      await api(`/bugs/${id}`, { method: "DELETE" });
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  };
  const generate = async (type) => {
    if (!project) return;
    setGen(type);
    setError("");
    try {
      const r = await api(
        `/projects/${project.id}/artifacts/generate`,
        post({ type }),
      );
      await refresh();
      setSelected(r.artifact);
      setEditText(r.artifact.content);
      setView("documents");
      notify(r.demo ? "Generated demo AI draft" : "Document generated");
    } catch (e) {
      setError(e.message);
    } finally {
      setGen("");
    }
  };
  const saveDoc = async () => {
    try {
      const r = await api(
        `/artifacts/${selected.id}`,
        patch({ content: editText }),
      );
      setSelected(r.artifact);
      await refresh();
      notify("Document saved");
    } catch (e) {
      setError(e.message);
    }
  };
  const deleteDoc = async (id) => {
    if (!confirm("Delete this document?")) return;
    try {
      await api(`/artifacts/${id}`, { method: "DELETE" });
      if (selected?.id === id) setSelected(null);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  };
  const sendChat = async (e) => {
    e.preventDefault();
    if (!project || !chat.trim()) return;
    const msg = chat.trim();
    setChat("");
    setChatBusy(true);
    try {
      await api(`/projects/${project.id}/chat`, post({ message: msg, role }));
      await refresh();
    } catch (e) {
      setError(e.message);
      setChat(msg);
    } finally {
      setChatBusy(false);
    }
  };
  if (!user)
    return (
      <div className="auth">
        <section className="auth-left">
          <div className="brand">
            <span className="logo">
              <Bot />
            </span>
            <b>AI Software Company</b>
          </div>
          <div className="hero">
            <span className="eyebrow">✦ YOUR VIRTUAL SOFTWARE TEAM</span>
            <h1>
              From first idea
              <br />
              to <em>project clarity.</em>
            </h1>
            <p>
              Bring your idea. Specialist AI roles help shape requirements,
              design the plan, and organize the work.
            </p>
            {ROLES.slice(0, 4).map((r, i) => (
              <div className="role-chip" key={r}>
                <i className={`d${i}`} />
                {r}
                <ArrowRight size={16} />
              </div>
            ))}
          </div>
          <small className="footnote">
            A connected workspace for the software development lifecycle.
          </small>
        </section>
        <section className="auth-right">
          <form className="auth-form" onSubmit={login}>
            <span className="eyebrow">
              {mode === "login" ? "WELCOME BACK" : "GET STARTED"}
            </span>
            <h2>
              {mode === "login"
                ? "Sign in to your workspace"
                : "Create your workspace"}
            </h2>
            <p>
              {mode === "login"
                ? "Continue building something meaningful."
                : "Start organizing your software projects."}
            </p>
            {mode === "register" && (
              <label>
                Full name
                <input
                  required
                  minLength="2"
                  value={auth.name}
                  onChange={(e) => setAuth({ ...auth, name: e.target.value })}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </label>
            )}
            <label>
              Email address
              <input
                required
                type="email"
                value={auth.email}
                onChange={(e) => setAuth({ ...auth, email: e.target.value })}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>
            <label>
              Password
              <input
                required
                minLength="8"
                type="password"
                value={auth.password}
                onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                placeholder="At least 8 characters"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
            </label>
            <Err>{authError}</Err>
            <button className="primary wide" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}{" "}
              <ArrowRight size={16} />
            </button>
            <div className="switch">
              {mode === "login"
                ? "New to the platform?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setAuthError("");
                }}
              >
                {mode === "login" ? "Create an account" : "Sign in"}
              </button>
            </div>
            <div className="secure">
              <ShieldCheck size={16} /> Your projects are private to your
              account.
            </div>
          </form>
        </section>
      </div>
    );
  const heading = (title, sub, action = null) => (
    <div className="heading">
      <div>
        <span className="eyebrow">WORKSPACE / {title.toUpperCase()}</span>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
  const panelTitle = (title, sub) => (
    <div className="panel-title">
      <div>
        <h3>{title}</h3>
        <p>{sub}</p>
      </div>
    </div>
  );
  const needProject = (
    <Empty title="Choose a project first">
      Select a project from Overview or create a new one to manage project data.
    </Empty>
  );
  const overview = () => (
    <>
      {heading(
        project?.title || "Overview",
        project
          ? "A clear view of delivery, quality, and next steps."
          : "Your software projects, all in one place.",
        <button className="primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New project
        </button>,
      )}
      <div className="metrics">
        <Metric
          icon={<LayoutDashboard />}
          label="Projects"
          value={projects.length}
          note="Across your workspace"
        />
        <Metric
          icon={<ClipboardList />}
          label="Tasks"
          value={project ? project.tasks.length : totals.tasks}
          note={`${project ? project.tasks.filter((t) => t.status === "done").length : totals.done} completed`}
        />
        <Metric
          icon={<Check />}
          label="Completion"
          value={`${project ? progress(project) : totals.tasks ? Math.round((totals.done / totals.tasks) * 100) : 0}%`}
          note="Based on completed tasks"
        />
        <Metric
          icon={<Bug />}
          label="Open bugs"
          value={
            project
              ? project.bugs.filter((b) => b.status !== "resolved").length
              : totals.bugs
          }
          note="Keep quality visible"
        />
      </div>
      {project && (
        <section className="panel project-summary">
          <div>
            <span className="eyebrow">CURRENT PROJECT</span>
            <h2>{project.title}</h2>
            <p>
              {project.idea ||
                "Add a project description to capture the goal and scope."}
            </p>
            <small>
              {project.platform} · Updated {date(project.updatedAt)}
            </small>
          </div>
          <div className="progress-wrap">
            <b>{progress(project)}%</b>
            <div className="progress">
              <span style={{ width: `${progress(project)}%` }} />
            </div>
            <small>Task completion</small>
          </div>
        </section>
      )}
      <div className="columns">
        <section className="panel">
          {panelTitle("Projects", "Select a project to manage its workflow")}
          <div className="search">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
            />
          </div>
          {projects
            .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
            .map((p) => (
              <div className="project-row" key={p.id}>
                <button onClick={() => selectProject(p.id)}>
                  <span className="avatar">{initials(p.title)}</span>
                  <span>
                    <b>{p.title}</b>
                    <small>
                      {p.tasks.length} tasks · {progress(p)}% complete
                    </small>
                  </span>
                  <ArrowRight size={15} />
                </button>
                <button
                  className="icon-button danger"
                  title="Delete project"
                  onClick={() => deleteProject(p)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          {!projects.length && (
            <Empty title="No projects yet">
              Create your first project to get started.
            </Empty>
          )}
        </section>
        <section className="panel">
          {panelTitle(
            "AI delivery team",
            "Specialist roles for each stage of delivery",
          )}
          {ROLES.map((r, i) => (
            <button
              className="role-row"
              key={r}
              onClick={() => {
                setRole(r);
                setView("consultant");
              }}
            >
              <span className={`role-icon d${i}`}>
                <Bot size={17} />
              </span>
              <span>
                <b>{r}</b>
                <small>
                  {
                    [
                      "Clarifies requirements",
                      "Plans technical structure",
                      "Organizes milestones",
                      "Supports implementation",
                      "Checks quality and edge cases",
                    ][i]
                  }
                </small>
              </span>
              <ArrowRight size={15} />
            </button>
          ))}
        </section>
      </div>
      <section className="panel">
        {panelTitle(
          "Document shortcuts",
          "Generate first drafts based on your project context",
        )}
        <div className="shortcuts">
          {TYPES.slice(0, 4).map(([type, label, desc, Icon]) => (
            <button
              key={type}
              disabled={!project || gen === type}
              onClick={() => generate(type)}
            >
              <Icon size={18} />
              <span>
                <b>{label}</b>
                <small>{desc}</small>
              </span>
              <ArrowRight size={15} />
            </button>
          ))}
        </div>
      </section>
    </>
  );
  
const workspacePage = () => {
  const handleInviteMember = (member) => {
  const initials = member.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const updated = [
    ...extraMembers,
    {
      ...member,
      initials,
      id: crypto.randomUUID(),
    },
  ];

  localStorage.setItem("workspaceMembers", JSON.stringify(updated));
  setExtraMembers(updated);
  setShowInvite(false);
  notify(`Added ${member.name} to the workspace`);
};
const teamMembers = [
  {
    name: "Manav Shukla",
    role: "Frontend Developer",
    email: user?.email || "Owner account",
    initials: "MS",
  },
  {
    name: "Ayushi",
    role: "Project Lead & Frontend Developer",
    email: "Frontend development and UI components",
    initials: "AY",
  },
  {
    name: "Ziya",
    role: "Backend Developer",
    email: "API development and integration",
    initials: "ZI",
  },
  {
    name: "Saniya",
    role: "Backend Developer & QA",
    email: "Backend testing and quality assurance",
    initials: "SA",
  },
  ...extraMembers,
];


  return (
    <div className="workspace-page">
      <div className="workspace-page-header">
        <div>
          <span className="eyebrow">YOUR TEAM</span>
          <h1>My Workspace</h1>
          <p>Manage your team, roles, and collaboration.</p>
        </div>
        <span className="workspace-status">● Personal workspace</span>
      </div>

      <div className="workspace-stats">
        <div className="panel">
          <small>Team members</small>
          <h2>{teamMembers.length}</h2>
          <p>People in your workspace</p>
        </div>
        <div className="panel">
          <small>Projects</small>
          <h2>{projects.length}</h2>
          <p>Projects in your account</p>
        </div>
        <div className="panel">
          <small>Workspace type</small>
          <h2>Personal</h2>
          <p>Your development space</p>
        </div>
      </div>

      <section className="panel workspace-team-panel">
        <div className="workspace-section-heading">
          <div>
            <h2>Team members</h2>
            <p>People and responsibilities in your workspace.</p>
          </div>
          
<button
  className="primary"
  type="button"
  onClick={() => setShowInvite(true)}
>
  + Invite member
</button>

        </div>

        <div className="workspace-member-list">
          
{teamMembers.map((member) => (
  <div className="workspace-member" key={member.initials}>
    <span className="avatar">{member.initials}</span>

    <div className="workspace-member-info">
      <strong>{member.name}</strong>
      <small>{member.email}</small>
    </div>

    <span className="workspace-role">{member.role}</span>
<button
  type="button"
  className="secondary"
  onClick={() => {
    const newName = window.prompt("Edit member name:", member.name);
    if (newName === null || !newName.trim()) return;

    const newEmail = window.prompt("Edit member email:", member.email);
    if (newEmail === null || !newEmail.trim()) return;

    const newRole = window.prompt("Edit member role:", member.role);
    if (newRole === null || !newRole.trim()) return;
setExtraMembers((current) => {
  const updated = current.map((item) =>
    item.email === member.email
      ? {
          ...item,
          name: newName.trim(),
          email: newEmail.trim(),
          role: newRole.trim(),
          initials: newName
            .trim()
            .split(/\s+/)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        }
      : item
  );

  localStorage.setItem("workspaceMembers", JSON.stringify(updated));
  return updated;
});

    notify("Member details updated");
  }}
>
  Edit
</button>
    {member.email !== (user?.email || "Owner account") && (
      <button
        type="button"
        className="secondary"
        onClick={() => {
          if (!window.confirm(`Remove ${member.name} from this workspace?`)) {
            return;
          }

          const updated = extraMembers.filter(
  (item) => item.email !== member.email
);

localStorage.setItem("workspaceMembers", JSON.stringify(updated));
setExtraMembers(updated);
          notify(`${member.name} removed from the workspace`);
        }}
      >
        Remove
      </button>
    )}
  </div>
))}

        </div>
      </section>

      <section className="panel workspace-settings-panel">
        <h2>Workspace settings</h2>
        <p>Workspace name, members, and collaboration preferences.</p>
        <div className="workspace-setting-row">
  <div>
    <strong>Workspace name</strong>
    <small>{workspaceName || "My Workspace"}</small>
  </div>

<input
  className="workspace-name-input"
  type="text"
  value={workspaceName}
  placeholder="Workspace name"
  maxLength={60}
  aria-label="Workspace name"
  onChange={(e) => {
    setWorkspaceName(e.target.value);
    localStorage.setItem("workspaceName", e.target.value);
  }}
/>

</div>
        <div className="workspace-setting-row">
          <div>
            <strong>Access</strong>
            <small>Currently using your signed-in account.</small>
          </div>
          <span>Private</span>
        </div>
      </section>
    </div>
  );
};

  const tasksPage = () =>
    !project ? (
      needProject
    ) : (
      <>
        {heading(
          "Task board",
          `Plan work for ${project.title}. Move tasks between workflow stages.`,
        )}
        <section className="panel">
          <form className="task-form" onSubmit={addTask}>
            <label>
              Task title
              <input
                required
                maxLength="180"
                value={task.title}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
                placeholder="e.g. Design sign-up flow"
              />
            </label>
            <label>
              Priority
              <select
                value={task.priority}
                onChange={(e) => setTask({ ...task, priority: e.target.value })}
              >
                {["low", "medium", "high", "critical"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="fullrow">
              Description
              <textarea
                rows="2"
                value={task.description}
                onChange={(e) =>
                  setTask({ ...task, description: e.target.value })
                }
                placeholder="Optional details and acceptance criteria"
              />
            </label>
            <button className="primary">
              <Plus size={15} /> Add task
            </button>
          </form>
        </section>
        <div className="kanban">
          {Object.entries(STATUSES).map(([s, label]) => (
            <section className="kanban-column" key={s}>
              <div className="kanban-title">
                <b>{label}</b>
                <span>
                  {project.tasks.filter((t) => t.status === s).length}
                </span>
              </div>
              {project.tasks
                .filter((t) => t.status === s)
                .map((t) => (
                  <article className="task-card" key={t.id}>
                    <div className="task-top">
                      <span className={`priority ${t.priority}`}>
                        {t.priority}
                      </span>
                      <button
                        className="icon-button danger"
                        title="Delete task"
                        onClick={() => deleteTask(t.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <b>{t.title}</b>
                    {t.description && <p>{t.description}</p>}
                    <label className="small-label">
                      Workflow status
                      <select
                        value={t.status}
                        onChange={(e) =>
                          updateTask(t.id, { status: e.target.value })
                        }
                      >
                        {Object.entries(STATUSES).map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </label>
                    <small>Created {date(t.createdAt)}</small>
                  </article>
                ))}
              {!project.tasks.some((t) => t.status === s) && (
                <div className="column-empty">No tasks here yet</div>
              )}
            </section>
          ))}
        </div>
      </>
    );
  const bugsPage = () =>
    !project ? (
      needProject
    ) : (
      <>
        {heading(
          "Bug tracker",
          "Record defects, prioritize fixes, and track status.",
        )}
        <section className="panel">
          {panelTitle("Report a bug", "Describe the unexpected behavior")}
          <form className="stack-form" onSubmit={addBug}>
            <label>
              Bug title
              <input
                required
                maxLength="180"
                value={bug.title}
                onChange={(e) => setBug({ ...bug, title: e.target.value })}
                placeholder="e.g. Save button does not respond"
              />
            </label>
            <label>
              Description
              <textarea
                rows="3"
                value={bug.description}
                onChange={(e) =>
                  setBug({ ...bug, description: e.target.value })
                }
                placeholder="Steps to reproduce, expected and actual result"
              />
            </label>
            <label>
              Severity
              <select
                value={bug.severity}
                onChange={(e) => setBug({ ...bug, severity: e.target.value })}
              >
                {["low", "medium", "high", "critical"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <button className="primary">
              <Plus size={15} /> Report bug
            </button>
          </form>
        </section>
        <section className="panel">
          {panelTitle("Reported issues", `${project.bugs.length} issue(s)`)}
          {project.bugs.map((b) => (
            <article className="bug-row" key={b.id}>
              <div>
                <span className={`priority ${b.severity}`}>{b.severity}</span>
                <b>{b.title}</b>
                <p>{b.description}</p>
                <small>Reported {date(b.createdAt)}</small>
              </div>
              <div className="bug-actions">
                <select
                  aria-label="Bug status"
                  value={b.status}
                  onChange={(e) => updateBug(b.id, { status: e.target.value })}
                >
                  {[
                    ["open", "Open"],
                    ["in-progress", "In progress"],
                    ["resolved", "Resolved"],
                  ].map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
                <button
                  className="icon-button danger"
                  title="Delete bug"
                  onClick={() => deleteBug(b.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
          {!project.bugs.length && (
            <Empty title="No bugs reported">
              Use the form above to record the first issue.
            </Empty>
          )}
        </section>
      </>
    );
  const docsPage = () =>
    !project ? (
      needProject
    ) : (
      <>
        {heading(
          "Documents",
          "Generate, review, edit, and save project deliverables.",
        )}
        <div className="doc-layout">
          <section className="panel">
            {panelTitle("Document library", "Choose a document to generate")}
            {TYPES.map(([type, label, desc, Icon]) => (
              <button
                className="doc-type"
                key={type}
                disabled={!!gen}
                onClick={() => generate(type)}
              >
                <Icon size={17} />
                <span>
                  <b>{label}</b>
                  <small>{desc}</small>
                </span>
                {gen === type ? "…" : <Plus size={15} />}
              </button>
            ))}
          </section>
          <section className="panel">
            {selected ? (
              <>
                {panelTitle(
                  selected.title,
                  `${selected.demo ? "Demo AI draft" : "Generated document"} · ${date(selected.updatedAt)}`,
                )}
                <textarea
                  className="editor"
                  rows="22"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <div className="right-actions">
                  <button
                    className="secondary"
                    onClick={() => setEditText(selected.content)}
                  >
                    Discard edits
                  </button>
                  <button className="primary" onClick={saveDoc}>
                    <Check size={15} /> Save document
                  </button>
                  <button
                    className="icon-button danger"
                    title="Delete document"
                    onClick={() => deleteDoc(selected.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </>
            ) : (
              <Empty title="No document selected">
                Choose a type to generate a draft. Saved documents appear below.
              </Empty>
            )}
            <div className="saved-docs">
              {project.artifacts.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setSelected(a);
                    setEditText(a.content);
                  }}
                >
                  <FileText size={16} />
                  <span>
                    <b>{a.title}</b>
                    <small>{date(a.updatedAt)}</small>
                  </span>
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
          </section>
        </div>
      </>
    );
  const consultantPage = () =>
    !project ? (
      needProject
    ) : (
      <>
        {heading(
          "AI consultant",
          `Ask your software delivery team about ${project.title}.`,
        )}
        <div className="columns consultant">
          <section className="panel">
            {panelTitle(
              "Project conversation",
              "Responses are saved with this project",
            )}
            <label className="role-label">
              Consultant role
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <div className="messages">
              {project.messages.map((m) => (
                <div
                  className={`message ${m.role === "user" ? "mine" : ""}`}
                  key={m.id}
                >
                  <b>{m.role === "user" ? "You" : role}</b>
                  <p>{m.text}</p>
                  {m.demo && <small>Demo AI</small>}
                </div>
              ))}
              {!project.messages.length && (
                <Empty title="Start a project conversation">
                  Ask for requirements, architecture options, task breakdowns,
                  test ideas, or risk reviews.
                </Empty>
              )}
              {chatBusy && <p className="muted">AI team is thinking…</p>}
            </div>
            <form className="chat-form" onSubmit={sendChat}>
              <textarea
                rows="2"
                value={chat}
                onChange={(e) => setChat(e.target.value)}
                placeholder="Ask about requirements, architecture, risks…"
                disabled={chatBusy}
              />
              <button className="primary" disabled={chatBusy || !chat.trim()}>
                <Send size={15} /> Send
              </button>
            </form>
          </section>
          <aside className="panel">
            {panelTitle("Quick prompts", "Start with a useful question")}
            {[
              "Draft acceptance criteria for the next feature.",
              "Identify top delivery risks and mitigations.",
              "Suggest a first sprint plan with small tasks.",
              "Create a QA checklist for the core user flow.",
            ].map((x) => (
              <button className="prompt" key={x} onClick={() => setChat(x)}>
                {x}
                <ArrowRight size={14} />
              </button>
            ))}
            <p className="notice">
              Without a Gemini key, the app uses clearly labelled demo
              responses.
            </p>
          </aside>
        </div>
      </>
    );
  const nav = [
    ["overview", "Overview", LayoutDashboard],
    ["consultant", "AI consultant", MessageSquare],
    ["documents", "Documents", FileText],
    ["tasks", "Tasks", ClipboardList],
    ["bugs", "Bug tracker", Bug],
  ];
  return (
    <div className="app">
      <aside className={`sidebar ${mobile ? "show" : ""}`}>
        <div className="brand">
          <span className="logo">
            <Bot />
          </span>
          <b>AI Software Company</b>
          <button
            className="mobile-close icon-button"
            onClick={() => setMobile(false)}
          >
            <X size={17} />
          </button>
        </div>
        <button
  type="button"
  className="workspace"
  onClick={() => {
    setView("workspace");
    setError("");
    setMobile(false);
  }}
  style={{
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    font: "inherit",
    color: "inherit",
  }}
>
  <b>▦&nbsp; My workspace</b>
  <small>Personal team</small>
</button>
        <span className="nav-caption">WORKSPACE</span>
        <nav>
          {nav.map(([v, label, Icon]) => (
            <button
              className={`nav-item ${view === v ? "active" : ""}`}
              key={v}
              onClick={() => {
                setView(v);
                setError("");
                setMobile(false);
              }}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="project-list">
          <div className="project-list-head">
            YOUR PROJECTS
            <button
              className="icon-button"
              onClick={() => setShowCreate(true)}
              title="New project"
            >
              <Plus size={17} />
            </button>
          </div>
          {projects.map((p) => (
            <button
              key={p.id}
              className={`project-link ${project?.id === p.id ? "chosen" : ""}`}
              onClick={() => selectProject(p.id)}
            >
              <span className="avatar small">{initials(p.title)}</span>
              {p.title}
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <button className="help" onClick={() => setView("consultant")}>
            <span>?</span>
            <div>
              <b>Need a hand?</b>
              <small>Start with the AI consultant.</small>
            </div>
          </button>
          <div className="profile">
            <span className="avatar">{initials(user.name)}</span>
            <div>
              <b>{user.name}</b>
              <small>{user.email}</small>
            </div>
            <button className="icon-button" title="Sign out" onClick={signout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            onClick={() => setMobile(true)}
          >
            <Menu size={19} />
          </button>
          <div className="crumb">
{workspaceName || "My Workspace"} <span>/</span>{" "}
<b>{view === "workspace" ? "My Workspace" : project?.title || "Overview"}</b>
          </div>
          <div className="top-actions">
            <span className="online">
              <i /> API connected locally
            </span>
            <button
              className="primary compact"
              onClick={() => setShowCreate(true)}
            >
              <Plus size={15} /> New project
            </button>
          </div>
        </header>
        <div className="content">
          <Err>{error}</Err>
          {view === "overview" && overview()}
{view === "workspace" && workspacePage()}
{view === "tasks" && tasksPage()}
{view === "bugs" && bugsPage()}
{view === "documents" && docsPage()}
{view === "consultant" && consultantPage()}
          <footer>
            AI Software Company · Build with clarity. Ship with confidence.
          </footer>
        </div>
      </main>
      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
        </div>
      )}
      {showCreate && (
        <div
          className="backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowCreate(false);
          }}
          
        >
          <form className="modal" onSubmit={createProject}>
            <div className="modal-head">
              <div>
                <span className="eyebrow">NEW WORKSPACE</span>
                <h2>Create a project</h2>
                <p>Capture the idea and start planning delivery.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowCreate(false)}
              >
                <X size={18} />
              </button>
            </div>
            <label>
              Project name
              <input
                autoFocus
                required
                minLength="2"
                maxLength="120"
                value={newProject.title}
                onChange={(e) =>
                  setNewProject({ ...newProject, title: e.target.value })
                }
                placeholder="e.g. Career Match"
              />
            </label>
            <label>
              Project idea
              <textarea
                rows="4"
                value={newProject.idea}
                onChange={(e) =>
                  setNewProject({ ...newProject, idea: e.target.value })
                }
                placeholder="Who is it for? What problem does it solve?"
              />
            </label>
            <label>
              Platform
              <select
                value={newProject.platform}
                onChange={(e) =>
                  setNewProject({ ...newProject, platform: e.target.value })
                }
              >
                <option>Web application</option>
                <option>Mobile application</option>
                <option>Web and mobile</option>
                <option>API / backend service</option>
                <option>Desktop application</option>
              </select>
            </label>
            <div className="right-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button className="primary">
                <Plus size={15} /> Create project
              </button>
            </div>
         
          </form>
        </div>
      )}
      {showInvite && (
        <InviteMemberModal
          onClose={() => setShowInvite(false)}
          onInvite={handleInviteMember}
        />
      )}
    </div>
  );
}


function InviteMemberModal({ onClose, onInvite }) {
  return (
    <div
      className="backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        className="modal"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;

          onInvite({
            name: form.memberName.value.trim(),
            email: form.memberEmail.value.trim(),
            role: form.memberRole.value,
          });
        }}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">WORKSPACE TEAM</span>
            <h2>Invite a team member</h2>
            <p>Enter your teammate's details.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            ×
          </button>
        </div>

        <label>
          Full name
          <input name="memberName" required minLength={2} maxLength={100} />
        </label>

        <label>
          Email address
          <input name="memberEmail" type="email" required />
        </label>

        <label>
          Role
          <select name="memberRole" defaultValue="Developer">
            <option>Developer</option>
            <option>Frontend Developer</option>
            <option>Backend Developer</option>
            <option>QA Engineer</option>
            <option>Project Manager</option>
          </select>
        </label>

        <div className="right-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            Send invitation
          </button>
        </div>
      </form>
    </div>
  );
}

function Metric({ icon, label, value, note }) {
  return (
    <div className="metric">
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
      <em>{note}</em>
    </div>
  );
}
export default App;
