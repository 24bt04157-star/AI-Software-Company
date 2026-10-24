import React, { useEffect, useMemo, useState } from "react";
import {
  Bot,
  LayoutDashboard,
  MessageSquare,
  FileText,
  ClipboardList,
  Bug,
  Plus,
  LogOut,
  ArrowRight,
  Sparkles,
  Send,
  Check,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Users,
  Code2,
  Boxes,
  Target,
  Clock3,
  GitBranch,
  Activity,
  X,
  Menu,
} from "lucide-react";
import { api, token, saveToken } from "./api";
const types = [
  ["srs", "SRS document", "Structured requirements", FileText],
  [
    "userStories",
    "User stories",
    "Features and acceptance criteria",
    ClipboardList,
  ],
  [
    "architecture",
    "Architecture design",
    "System components and data flow",
    Boxes,
  ],
  ["sprintPlan", "Sprint plan", "Tasks and milestones", Target],
  ["estimate", "Cost & timeline", "Assumptions and estimates", Clock3],
  ["uml", "UML / workflow", "Conceptual workflow diagram", GitBranch],
  ["testCases", "QA test cases", "Scenarios and edge cases", ShieldCheck],
  ["apiDesign", "API design", "Backend routes and contracts", Code2],
];
const roles = [
  ["Business Analyst", "Clarifies requirements", "blue"],
  ["Solution Architect", "Plans technical structure", "purple"],
  ["Project Manager", "Plans tasks and timeline", "orange"],
  ["Developer Assistant", "Drafts API and implementation plans", "green"],
  ["QA Engineer", "Creates test cases", "pink"],
];
const statusText = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done",
};
function Mark({ text }) {
  return (
    <div className="markdown">
      {String(text || "")
        .split("\n")
        .map((l, i) => {
          let s = l.trim();
          if (!s) return <div className="gap" key={i} />;
          if (s.startsWith("# ")) return <h2 key={i}>{s.slice(2)}</h2>;
          if (s.startsWith("## ")) return <h3 key={i}>{s.slice(3)}</h3>;
          if (s.startsWith("### ")) return <h4 key={i}>{s.slice(4)}</h4>;
          if (/^[-*]\s/.test(s))
            return (
              <p className="bullet" key={i}>
                • {s.slice(2)}
              </p>
            );
          return <p key={i}>{s}</p>;
        })}
    </div>
  );
}
export default function App() {
  const [user, U] = useState(null),
    [mode, M] = useState("login"),
    [form, F] = useState({ name: "", email: "", password: "" }),
    [error, E] = useState(""),
    [toast, T] = useState(""),
    [projects, P] = useState([]),
    [pid, PID] = useState(null),
    [project, PR] = useState(null),
    [view, V] = useState("overview"),
    [busy, B] = useState(false),
    [modal, MOD] = useState(false),
    [pf, PF] = useState({ title: "", idea: "", platform: "Web application" }),
    [chat, C] = useState(""),
    [chatBusy, CB] = useState(false),
    [gen, G] = useState(""),
    [edit, ED] = useState(null),
    [editText, ET] = useState(""),
    [task, TA] = useState({ title: "", description: "", priority: "medium" }),
    [bug, BUG] = useState({ title: "", description: "", severity: "medium" }),
    [mobile, MB] = useState(false);
  const tasks = project?.tasks || [],
    bugs = project?.bugs || [],
    arts = project?.artifacts || [];
  const metrics = useMemo(
    () => ({
      total: tasks.length,
      done: tasks.filter((t) => t.status === "done").length,
      open: bugs.filter((b) => b.status !== "resolved").length,
      progress: tasks.length
        ? Math.round(
            (tasks.filter((t) => t.status === "done").length / tasks.length) *
              100,
          )
        : 0,
    }),
    [tasks, bugs],
  );
  const flash = (s) => {
    T(s);
    setTimeout(() => T(""), 3200);
  };
  async function loadProjects(select) {
    try {
      const d = await api("/projects");
      const list = d.projects || [];
      P(list);

      const id = select || pid || list[0]?.id;
      if (id && list.some((p) => p.id === id)) {
        await open(id);
      } else {
        PID(null);
        PR(null);
        V("overview");
      }
    } catch (err) {
      E(err.message || "Unable to load projects.");
      throw err;
    }
  }
  async function open(id) {
    const d = await api(`/projects/${id}`);
    PID(id);
    PR(d.project);
    V("overview");
    MB(false);
  }
  useEffect(() => {
    if (token())
      api("/auth/me")
        .then((d) => {
          U(d.user);
          return loadProjects();
        })
        .catch(() => saveToken(null));
  }, []);
  async function authSubmit(e) {
    e.preventDefault();
    E("");
    B(true);
    try {
      const d = await api(
        `/auth/${mode === "register" ? "register" : "login"}`,
        { method: "POST", body: JSON.stringify(form) },
      );
      saveToken(d.token);
      U(d.user);
      await loadProjects();
      flash("Welcome to your workspace.");
    } catch (e) {
      E(e.message);
    } finally {
      B(false);
    }
  }
  async function create(e) {
    e.preventDefault();
    E("");
    try {
      const d = await api("/projects", {
        method: "POST",
        body: JSON.stringify(pf),
      });
      MOD(false);
      PF({ title: "", idea: "", platform: "Web application" });
      await loadProjects(d.project.id);
      flash("Project created.");
    } catch (e) {
      E(e.message);
    }
  }
  async function chatSend(e) {
    e?.preventDefault();
    if (!chat.trim() || chatBusy || !project) return;
    const msg = chat.trim();
    C("");
    CB(true);
    try {
      const d = await api(`/projects/${project.id}/chat`, {
        method: "POST",
        body: JSON.stringify({ message: msg }),
      });
      PR(d.project);
      if (d.aiMode === "demo")
        flash("Demo AI used. Add a Gemini key for live AI.");
    } catch (e) {
      E(e.message);
    } finally {
      CB(false);
    }
  }
  async function generate(type) {
    G(type);
    E("");
    try {
      const d = await api(`/projects/${project.id}/artifacts/generate`, {
        method: "POST",
        body: JSON.stringify({ type }),
      });
      PR(d.project);
      V("documents");
      flash(
        d.aiMode === "demo"
          ? "Demo draft created. Configure Gemini for live AI."
          : "AI artifact created.",
      );
    } catch (e) {
      E(e.message);
    } finally {
      G("");
    }
  }
  async function saveArtifact() {
    try {
      const d = await api(`/projects/${project.id}/artifacts/${edit.id}`, {
        method: "PATCH",
        body: JSON.stringify({ content: editText }),
      });
      PR(d.project);
      ED(null);
      flash("Saved.");
    } catch (e) {
      E(e.message);
    }
  }
  async function addTask(e) {
    e.preventDefault();
    try {
      await api(`/projects/${project.id}/tasks`, {
        method: "POST",
        body: JSON.stringify(task),
      });
      TA({ title: "", description: "", priority: "medium" });
      await open(project.id);
      flash("Task added.");
    } catch (e) {
      E(e.message);
    }
  }
  async function setTask(id, status) {
    try {
      await api(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await open(project.id);
    } catch (e) {
      E(e.message);
    }
  }
  async function delTask(id) {
    try {
      await api(`/tasks/${id}`, { method: "DELETE" });
      await open(project.id);
    } catch (e) {
      E(e.message);
    }
  }
  async function addBug(e) {
    e.preventDefault();
    try {
      await api(`/projects/${project.id}/bugs`, {
        method: "POST",
        body: JSON.stringify(bug),
      });
      BUG({ title: "", description: "", severity: "medium" });
      await open(project.id);
      flash("Bug reported.");
    } catch (e) {
      E(e.message);
    }
  }
  async function setBug(id, status) {
    try {
      await api(`/bugs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await open(project.id);
    } catch (e) {
      E(e.message);
    }
  }
  async function deleteProject() {
    if (!confirm("Delete this project and its workspace data?")) return;
    try {
      await api(`/projects/${project.id}`, { method: "DELETE" });
      const left = projects.filter((p) => p.id !== project.id);
      P(left);
      if (left.length) await open(left[0].id);
      else {
        PR(null);
        PID(null);
      }
      flash("Project deleted.");
    } catch (e) {
      E(e.message);
    }
  }
  const logout = () => {
    saveToken(null);
    U(null);
    P([]);
    PR(null);
    PID(null);
  };
  if (!user)
    return (
      <div className="auth">
        <div className="auth-left">
          <div className="brand">
            <span className="logo">
              <Bot />
            </span>{" "}
            AI Software Company
          </div>
          <div className="auth-copy">
            <small>✦ YOUR VIRTUAL SOFTWARE TEAM</small>
            <h1>
              From first idea
              <br />
              to <em>project clarity.</em>
            </h1>
            <p>
              Bring your idea. Specialist AI roles help shape requirements,
              design the plan, and organize the work.
            </p>
            {roles.slice(0, 4).map((r, i) => (
              <div className="flow" key={r[0]}>
                <span className={`dot d${i}`}></span>
                {r[0]}
                <ArrowRight size={15} />
              </div>
            ))}
          </div>
          <small className="auth-bottom">
            A connected workspace for the software development lifecycle.
          </small>
        </div>
        <div className="auth-right">
          <div className="auth-form">
            <div className="brand mobilebrand">
              <span className="logo">
                <Bot />
              </span>{" "}
              AI Software Company
            </div>
            <small className="eyebrow">
              WELCOME {mode === "login" ? "BACK" : "ABOARD"}
            </small>
            <h2>
              {mode === "login"
                ? "Sign in to your workspace"
                : "Create your workspace"}
            </h2>
            <p>
              {mode === "login"
                ? "Continue building something meaningful."
                : "Start turning an idea into a structured software project."}
            </p>
            <form onSubmit={authSubmit} className="form">
              {mode === "register" && (
                <label>
                  Full name
                  <input
                    required
                    minLength="2"
                    value={form.name}
                    onChange={(e) => F({ ...form, name: e.target.value })}
                    placeholder="Your name"
                  />
                </label>
              )}
              <label>
                Email address
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => F({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  minLength="8"
                  required
                  value={form.password}
                  onChange={(e) => F({ ...form, password: e.target.value })}
                  placeholder="At least 8 characters"
                />
              </label>
              {error && <div className="error">{error}</div>}
              <button className="primary wide" disabled={busy}>
                {busy
                  ? "Please wait…"
                  : mode === "login"
                    ? "Sign in"
                    : "Create account"}{" "}
                <ArrowRight size={16} />
              </button>
            </form>
            <div className="switch">
              {mode === "login"
                ? "New to the platform?"
                : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  M(mode === "login" ? "register" : "login");
                  E("");
                }}
              >
                {mode === "login" ? "Create an account" : "Sign in"}
              </button>
            </div>
            <div className="security">
              <ShieldCheck size={15} /> Your projects are private to your
              account.
            </div>
          </div>
        </div>
      </div>
    );
  return (
    <div className="shell">
      <aside className={`sidebar ${mobile ? "show" : ""}`}>
        <div className="brand">
          <span className="logo">
            <Bot />
          </span>{" "}
          AI Software Company{" "}
          <button className="close mobile-only" onClick={() => MB(false)}>
            <X />
          </button>
        </div>
        <div className="workspace">
          <b>▦ &nbsp; My workspace</b>
          <small>Personal team</small>
        </div>
        <small className="nav-label">WORKSPACE</small>
        {[
          ["overview", LayoutDashboard, "Overview"],
          ["chat", MessageSquare, "AI consultant"],
          ["documents", FileText, "Documents"],
          ["tasks", ClipboardList, "Tasks"],
          ["bugs", Bug, "Bug tracker"],
        ].map(([v, I, label]) => (
          <button
            key={v}
            className={`nav ${view === v ? "active" : ""}`}
            onClick={() => {
              V(v);
              MB(false);
            }}
          >
            <I size={17} />
            {label}
          </button>
        ))}
        <small className="nav-label project-label">
          YOUR PROJECTS{" "}
          <button onClick={() => MOD(true)}>
            <Plus size={15} />
          </button>
        </small>
        {projects.map((p) => (
          <button
            key={p.id}
            className={`project-link ${pid === p.id ? "chosen" : ""}`}
            onClick={() => open(p.id)}
          >
            <span>{p.title.slice(0, 1).toUpperCase()}</span>
            {p.title}
          </button>
        ))}
        <div className="sidebar-bottom">
  <button
    type="button"
    className="help"
  onClick={() => {
  V("chat");
}}
    title="Open AI Consultant"
  >
    <CircleIcon />
    <div>
      <b>Need a hand?</b>
      <small>Start with the AI consultant.</small>
    </div>
  </button>
          <div className="profile">
            <span>
              {user.name
                .split(" ")
                .map((x) => x[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <div>
              <b>{user.name}</b>
              <small>{user.email}</small>
            </div>
            <button title="Sign out" onClick={logout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="top">
          <button className="hamburger mobile-only" onClick={() => MB(true)}>
            <Menu />
          </button>
          <div>
            Workspace <span>/</span> <b>{project?.title || "Overview"}</b>
          </div>
          <button className="primary small" onClick={() => MOD(true)}>
            <Plus size={15} /> New project
          </button>
        </header>
        {error && (
          <div className="banner-error">
            {error}
            <button onClick={() => E("")}>
              <X size={14} />
            </button>
          </div>
        )}
        {toast && (
          <div className="toast">
            <Check size={15} />
            {toast}
          </div>
        )}
        {!project ? (
          <div className="welcome">
            <small className="eyebrow">✦ YOUR AI-POWERED SOFTWARE STUDIO</small>
            <h1>
              Build with a plan.
              <br />
              <em>Deliver with clarity.</em>
            </h1>
            <p>
              Turn a rough idea into clear requirements, practical
              documentation, and an organized project workspace.
            </p>
            <button className="primary" onClick={() => MOD(true)}>
              <Plus size={16} /> Start your first project
            </button>
            <div className="roles">
              {roles.map((r) => (
                <div className="role-card" key={r[0]}>
                  <span className={`role-icon ${r[2]}`}>
                    <Bot size={18} />
                  </span>
                  <div>
                    <b>{r[0]}</b>
                    <small>{r[1]}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="content">
            {view === "overview" && (
              <>
                <div className="heading">
                  <div>
                    <small className="eyebrow">PROJECT WORKSPACE</small>
                    <h1>{project.title}</h1>
                    <p>{project.idea}</p>
                  </div>
                  <button className="danger-outline" onClick={deleteProject}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
                <div className="meta">
                  <span>● {project.platform}</span>
                  <span>
                    Updated{" "}
                    {new Date(
                      project.updatedAt || project.createdAt,
                    ).toLocaleDateString()}
                  </span>
                  <span className="tag">{project.status}</span>
                </div>
                <div className="metrics">
                  <Metric
                    icon={ClipboardList}
                    label="Total tasks"
                    value={metrics.total}
                    foot={`${metrics.done} completed`}
                  />
                  <Metric
                    icon={FileText}
                    label="AI documents"
                    value={arts.length}
                    foot="Saved artifacts"
                  />
                  <Metric
                    icon={Bug}
                    label="Open bugs"
                    value={metrics.open}
                    foot="Need attention"
                  />
                  <Metric
                    icon={Activity}
                    label="Progress"
                    value={`${metrics.progress}%`}
                    foot="Based on completed tasks"
                  />
                </div>
                <div className="grid2">
                  <div className="panel">
                    <PanelTitle
                      title="Project progress"
                      subtitle="Track work that moves your idea forward."
                    />
                    <div className="progress-line">
                      <b>{metrics.progress}%</b>
                      <div className="bar">
                        <span style={{ width: `${metrics.progress}%` }} />
                      </div>
                    </div>
                    <div className="counts">
                      <span>
                        To do{" "}
                        <b>{tasks.filter((t) => t.status === "todo").length}</b>
                      </span>
                      <span>
                        In progress{" "}
                        <b>
                          {
                            tasks.filter((t) => t.status === "in-progress")
                              .length
                          }
                        </b>
                      </span>
                      <span>
                        Done <b>{metrics.done}</b>
                      </span>
                    </div>
                    <hr />
                    <PanelTitle
                      title="Recent tasks"
                      subtitle="Your current work queue."
                    />
                    <TaskList
                      tasks={tasks.slice(0, 5)}
                      setTask={setTask}
                      delTask={delTask}
                    />
                    {!tasks.length && (
                      <Empty>No tasks yet. Add one in Tasks.</Empty>
                    )}
                    
<button className="linkbtn" onClick={() => V("tasks")}>
  Manage tasks <ArrowRight size={14} />
</button>
</div>

<div className="panel quick-actions-panel">
  <PanelTitle
    title="Quick actions"
    subtitle="Move your project forward in one click."
  />

  <div className="quick-actions-grid">
    <button
      type="button"
      className="quick-action quick-action-task"
      onClick={() => V("tasks")}
    >
      <span className="quick-action-icon">
        <ClipboardList size={20} />
      </span>
      <span className="quick-action-copy">
        <b>Create task</b>
        <small>Plan your next step</small>
      </span>
      <ArrowRight size={17} className="quick-action-arrow" />
    </button>

    <button
      type="button"
      className="quick-action quick-action-bug"
      onClick={() => V("bugs")}
    >
      <span className="quick-action-icon">
        <Bug size={20} />
      </span>
      <span className="quick-action-copy">
        <b>Report a bug</b>
        <small>Track an issue</small>
      </span>
      <ArrowRight size={17} className="quick-action-arrow" />
    </button>

    <button
      type="button"
      className="quick-action quick-action-document"
      onClick={() => V("documents")}
    >
      <span className="quick-action-icon">
        <FileText size={20} />
      </span>
      <span className="quick-action-copy">
        <b>Generate document</b>
        <small>Create a project artifact</small>
      </span>
      <ArrowRight size={17} className="quick-action-arrow" />
    </button>

    <button
      type="button"
      className="quick-action quick-action-ai"
      onClick={() => V("chat")}
    >
      <span className="quick-action-icon">
        <MessageSquare size={20} />
      </span>
      <span className="quick-action-copy">
        <b>Ask AI</b>
        <small>Get help with your project</small>
      </span>
      <ArrowRight size={17} className="quick-action-arrow" />
    </button>
  </div>
</div>

<div className="panel">

                    <PanelTitle
                      title="AI team"
                      subtitle="Specialized roles for your project."
                    />
                    <div className="agent-list">
                      {roles.map((r) => (
                        <div className="agent" key={r[0]}>
                          <span className={`role-icon ${r[2]}`}>
                            <Bot size={16} />
                          </span>
                          <div>
                            <b>{r[0]}</b>
                            <small>{r[1]}</small>
                          </div>
                          <span className="ready">Ready</span>
                        </div>
                      ))}
                    </div>
                    <button
                      className="secondary wide"
                      onClick={() => V("chat")}
                    >
                      <MessageSquare size={15} /> Talk to AI consultant
                    </button>
                  </div>
                </div>
                <div className="panel">
                  <PanelTitle
                    title="Generate project artifacts"
                    subtitle="Create a draft and review it before using."
                  />
                  <div className="artifact-shortcuts">
                    {types.slice(0, 4).map(([t, n, d, I]) => (
                      <button
                        className="shortcut"
                        key={t}
                        disabled={!!gen}
                        onClick={() => generate(t)}
                      >
                        <I size={19} />
                        <span>
                          <b>{n}</b>
                          <small>{d}</small>
                        </span>
                        {gen === t ? "…" : <ArrowRight size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {view === "chat" && (
              <>
                <div className="heading">
                  <div>
                    <small className="eyebrow">AI BUSINESS ANALYST</small>
                    <h1>Let's shape your idea.</h1>
                    <p>
                      Clarify requirements and make assumptions visible before
                      planning begins.
                    </p>
                  </div>
                </div>
                <div className="grid2">
                  <div className="panel chat-panel">
                    <div className="agent">
                      <span className="role-icon blue">
                        <Bot />
                      </span>
                      <div>
                        <b>Business Analyst</b>
                        <small>Project-aware assistant</small>
                      </div>
                      <span className="ready">AI role</span>
                    </div>
                    <div className="messages">
                      <div className="bubble">
                        <b>Business Analyst</b>
                        <p>
                          Hi {user.name.split(" ")[0]}! Tell me more about your
                          users, the problem, or the features you have in mind.
                        </p>
                      </div>
                      {(project.conversation || []).map((m) => (
                        <div
                          className={`bubble ${m.role === "user" ? "mine" : ""}`}
                          key={m.id}
                        >
                          <b>
                            {m.role === "user" ? user.name : "Business Analyst"}{" "}
                            {m.demo ? "· Demo mode" : ""}
                          </b>
                          <p>{m.content}</p>
                        </div>
                      ))}
                      {chatBusy && <p className="muted">AI is thinking…</p>}
                    </div>
                    <form className="composer" onSubmit={chatSend}>
                      <textarea
                        rows="2"
                        value={chat}
                        onChange={(e) => C(e.target.value)}
                        placeholder="Tell the AI more about your idea…"
                      />
                      <button
                        className="primary"
                        disabled={chatBusy || !chat.trim()}
                      >
                        <Send size={15} />
                      </button>
                    </form>
                    <small className="muted">
                      AI drafts may be inaccurate. Review important decisions.
                    </small>
                  </div>
                  <div className="panel">
                    <PanelTitle
                      title="Project context"
                      subtitle="Information shared with the AI."
                    />
                    <p>
                      <b>{project.title}</b>
                    </p>
                    <p className="muted">{project.idea}</p>
                    <hr />
                    <p className="muted">
                      Tip: Explain who uses the product, what they need to do,
                      integrations, budget, and deadlines.
                    </p>
                  </div>
                </div>
              </>
            )}
            {view === "documents" && (
              <>
                <div className="heading">
                  <div>
                    <small className="eyebrow">PROJECT KNOWLEDGE</small>
                    <h1>Documents & artifacts</h1>
                    <p>
                      Generate structured drafts and edit them before approving.
                    </p>
                  </div>
                </div>
                <div className="grid2 docs-grid">
                  <div className="panel">
                    <PanelTitle
                      title="Artifact library"
                      subtitle="Choose what your AI team should prepare."
                    />
                    {types.map(([t, n, d, I]) => (
                      <button
                        className="catalog"
                        key={t}
                        disabled={!!gen}
                        onClick={() => generate(t)}
                      >
                        <I size={17} />
                        <span>
                          <b>{n}</b>
                          <small>{d}</small>
                        </span>
                        {gen === t ? "…" : <Plus size={14} />}
                      </button>
                    ))}
                  </div>
                  <div>
                    <PanelTitle
                      title={`Generated artifacts (${arts.length})`}
                      subtitle="Saved in this project"
                    />
                    {[...arts].reverse().map((a) => (
                      <div className="panel artifact" key={a.id}>
                        <div className="artifact-head">
                          <div>
                            <b>{a.title}</b>
                            <small>
                              Version {a.version} · {a.status}{" "}
                              {a.demo ? "· Demo AI" : ""}
                            </small>
                          </div>
                          <button
                            className="secondary small"
                            onClick={() => {
                              ED(a);
                              ET(a.content);
                            }}
                          >
                            Edit
                          </button>
                        </div>
                        {edit?.id === a.id ? (
                          <>
                            <textarea
                              className="editor"
                              rows="15"
                              value={editText}
                              onChange={(e) => ET(e.target.value)}
                            />
                            <div className="right">
                              <button
                                className="secondary small"
                                onClick={() => ED(null)}
                              >
                                Cancel
                              </button>
                              <button
                                className="primary small"
                                onClick={saveArtifact}
                              >
                                <Check size={14} /> Save
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="preview">
                            <Mark text={a.content} />
                          </div>
                        )}
                      </div>
                    ))}
                    {!arts.length && (
                      <div className="panel">
                        <Empty>
                          No artifacts yet. Choose one from the library.
                        </Empty>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            {view === "tasks" && (
              <>
                <div className="heading">
                  <div>
                    <small className="eyebrow">DELIVERY MANAGEMENT</small>
                    <h1>Tasks & sprints</h1>
                    <p>
                      Break work into manageable pieces and keep status up to
                      date.
                    </p>
                  </div>
                </div>
                <div className="grid2">
                  <div className="panel">
                    <PanelTitle
                      title="Create a task"
                      subtitle="Give the team a clear next action."
                    />
                    <form className="form" onSubmit={addTask}>
                      <label>
                        Task title
                        <input
                          required
                          value={task.title}
                          onChange={(e) =>
                            TA({ ...task, title: e.target.value })
                          }
                          placeholder="Design login screen"
                        />
                      </label>
                      <label>
                        Description
                        <textarea
                          rows="3"
                          value={task.description}
                          onChange={(e) =>
                            TA({ ...task, description: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Priority
                        <select
                          value={task.priority}
                          onChange={(e) =>
                            TA({ ...task, priority: e.target.value })
                          }
                        >
                          <option>low</option>
                          <option>medium</option>
                          <option>high</option>
                        </select>
                      </label>
                      <button className="primary">
                        <Plus size={15} /> Add task
                      </button>
                    </form>
                  </div>
                  <div className="panel">
                    <PanelTitle
                      title="Progress summary"
                      subtitle="Based on saved tasks"
                    />
                    <h2>{metrics.progress}% complete</h2>
                    <div className="bar">
                      <span style={{ width: `${metrics.progress}%` }} />
                    </div>
                    <p className="muted">
                      {metrics.done} of {metrics.total} tasks completed.
                    </p>
                  </div>
                </div>
                <div className="task-columns">
                  {["todo", "in-progress", "done"].map((s) => (
                    <div className="task-column" key={s}>
                      <h3>
                        {statusText[s]}{" "}
                        <span>
                          {tasks.filter((t) => t.status === s).length}
                        </span>
                      </h3>
                      {tasks
                        .filter((t) => t.status === s)
                        .map((t) => (
                          <div className="task-card" key={t.id}>
                            <div className="task-top">
                              <span className={`priority ${t.priority}`}>
                                {t.priority}
                              </span>
                              <button
                                className="plain"
                                onClick={() => delTask(t.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <b>{t.title}</b>
                            {t.description && <p>{t.description}</p>}
                            <select
                              value={t.status}
                              onChange={(e) => setTask(t.id, e.target.value)}
                            >
                              {Object.entries(statusText).map(([v, l]) => (
                                <option key={v} value={v}>
                                  {l}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </>
            )}
            {view === "bugs" && (
              <>
                <div className="heading">
                  <div>
                    <small className="eyebrow">QUALITY ASSURANCE</small>
                    <h1>Bug tracker</h1>
                    <p>Record defects, prioritize fixes, and track status.</p>
                  </div>
                </div>
                <div className="grid2">
                  <div className="panel">
                    <PanelTitle
                      title="Report a bug"
                      subtitle="Describe the unexpected behavior."
                    />
                    <form className="form" onSubmit={addBug}>
                      <label>
                        Bug title
                        <input
                          required
                          value={bug.title}
                          onChange={(e) =>
                            BUG({ ...bug, title: e.target.value })
                          }
                          placeholder="Save button does not respond"
                        />
                      </label>
                      <label>
                        Description
                        <textarea
                          rows="4"
                          value={bug.description}
                          onChange={(e) =>
                            BUG({ ...bug, description: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Severity
                        <select
                          value={bug.severity}
                          onChange={(e) =>
                            BUG({ ...bug, severity: e.target.value })
                          }
                        >
                          <option>low</option>
                          <option>medium</option>
                          <option>high</option>
                          <option>critical</option>
                        </select>
                      </label>
                      <button className="primary">
                        <Plus size={15} /> Report bug
                      </button>
                    </form>
                  </div>
                  <div className="panel">
                    <PanelTitle
                      title="Issue overview"
                      subtitle="Current quality signals"
                    />
                    <div className="counts bigcounts">
                      <span>
                        Total <b>{bugs.length}</b>
                      </span>
                      <span>
                        Open <b>{metrics.open}</b>
                      </span>
                      <span>
                        Resolved{" "}
                        <b>
                          {bugs.filter((b) => b.status === "resolved").length}
                        </b>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="panel">
                  <PanelTitle
                    title="Reported issues"
                    subtitle={`${bugs.length} issue(s)`}
                  />
                  {bugs.map((b) => (
                    <div className="bug-row" key={b.id}>
                      <div>
                        <b>{b.title}</b>
                        <p className="muted">
                          {b.description || "No details"} · Severity:{" "}
                          {b.severity}
                        </p>
                      </div>
                      <select
                        value={b.status}
                        onChange={(e) => setBug(b.id, e.target.value)}
                      >
                        <option>open</option>
                        <option>in-progress</option>
                        <option>resolved</option>
                      </select>
                    </div>
                  ))}
                  {!bugs.length && <Empty>No bugs reported.</Empty>}
                </div>
              </>
            )}
          </div>
        )}
        <footer className="footer">
          <b>AI Software Company</b>
          <span>Human-reviewed AI drafts · Connected SDLC workspace</span>
        </footer>
      </main>
      {modal && (
        <div
          className="overlay"
          onMouseDown={(e) => e.target === e.currentTarget && MOD(false)}
        >
          <div className="modal">
            <div className="modal-title">
              <div>
                <small className="eyebrow">NEW WORKSPACE</small>
                <h2>Start with an idea.</h2>
                <p>Give your virtual software team some context.</p>
              </div>
              <button className="plain" onClick={() => MOD(false)}>
                <X />
              </button>
            </div>
            <form className="form" onSubmit={create}>
              <label>
                Project name
                <input
                  required
                  maxLength="120"
                  value={pf.title}
                  onChange={(e) => PF({ ...pf, title: e.target.value })}
                  placeholder="Clinic Appointment Platform"
                />
              </label>
              <label>
                Describe your idea
                <textarea
                  required
                  rows="5"
                  maxLength="5000"
                  value={pf.idea}
                  onChange={(e) => PF({ ...pf, idea: e.target.value })}
                  placeholder="What should the software help people do?"
                />
              </label>
              <label>
                Target platform
                <select
                  value={pf.platform}
                  onChange={(e) => PF({ ...pf, platform: e.target.value })}
                >
                  <option>Web application</option>
                  <option>Mobile application</option>
                  <option>Web and mobile</option>
                  <option>Internal business tool</option>
                </select>
              </label>
              {error && <div className="error">{error}</div>}
              <div className="right">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => MOD(false)}
                >
                  Cancel
                </button>
                <button className="primary">
                  <Sparkles size={15} /> Create project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
function CircleIcon() {
  return <span className="help-circle">?</span>;
}
function Metric({ icon: I, label, value, foot }) {
  return (
    <div className="metric">
      <span>
        <I size={18} />
      </span>
      <small>{label}</small>
      <strong>{value}</strong>
      <em>{foot}</em>
    </div>
  );
}
function PanelTitle({ title, subtitle }) {
  return (
    <div className="panel-title">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
function Empty({ children }) {
  return <div className="empty">{children}</div>;
}
function TaskList({ tasks, setTask, delTask }) {
  return tasks.map((t) => (
    <div className="task-row" key={t.id}>
      <div>
        <b>{t.title}</b>
        <small>
          {t.assigneeRole || "Unassigned"} · {t.priority}
        </small>
      </div>
      <select value={t.status} onChange={(e) => setTask(t.id, e.target.value)}>
        {Object.entries(statusText).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <button className="plain" onClick={() => delTask(t.id)}>
        <Trash2 size={14} />
      </button>
    </div>
  ));
}
