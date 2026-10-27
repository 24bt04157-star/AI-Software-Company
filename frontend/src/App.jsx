
import React, { useEffect, useMemo, useState } from 'react';
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
  Clock3
} from 'lucide-react';
import { api, post, patch, token, saveToken } from './api';

const TYPES = [
  ['srs', 'SRS document', 'Requirements and scope', FileText],
  ['userStories', 'User stories', 'Features and acceptance criteria', ClipboardList],
  ['architecture', 'Architecture design', 'Components and data flow', Code2],
  ['sprintPlan', 'Sprint plan', 'Tasks and milestones', Activity],
  ['estimate', 'Cost & timeline', 'Assumptions and estimates', Clock3],
  ['uml', 'UML / workflow', 'Conceptual workflow', Code2],
  ['testCases', 'QA test cases', 'Scenarios and edge cases', ShieldCheck],
  ['apiDesign', 'API design', 'Routes and contracts', FileText]
];

const ROLES = [
  'Business Analyst',
  'Solution Architect',
  'Project Manager',
  'Developer Assistant',
  'QA Engineer'
];

const STATUSES = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done'
};

const initials = n =>
  (n || 'U')
    .split(/\s+/)
    .map(x => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const date = d =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      })
    : '—';

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
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('login');
  const [auth, setAuth] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [authError, setAuthError] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);

  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [view, setView] = useState('overview');
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const [newProject, setNewProject] = useState({
    title: '',
    idea: '',
    platform: 'Web application'
  });

  const [task, setTask] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  const [bug, setBug] = useState({
    title: '',
    description: '',
    severity: 'medium'
  });

  const [chat, setChat] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [chatBusy, setChatBusy] = useState(false);
  const [gen, setGen] = useState('');
  const [selected, setSelected] = useState(null);
  const [editText, setEditText] = useState('');

  const notify = m => {
    setToast(m);
    setTimeout(() => setToast(''), 2600);
  };

  const reload = async (id = project?.id) => {
    const r = await api('/projects');
    setProjects(r.projects || []);

    if (id) {
      const p = (r.projects || []).find(x => x.id === id);

      if (p) {
        const full = await api(`/projects/${id}`);
        setProject(full.project);
      }
    }
  };

  useEffect(() => {
    if (!token()) return;

    api('/me')
      .then(r => {
        setUser(r.user);
        return api('/projects');
      })
      .then(r => setProjects(r.projects || []))
      .catch(() => saveToken(null));
  }, []);

  const totals = useMemo(() => {
    const ts = projects.flatMap(p => p.tasks || []);
    const bs = projects.flatMap(p => p.bugs || []);

    return {
      tasks: ts.length,
      done: ts.filter(t => t.status === 'done').length,
      bugs: bs.filter(b => b.status !== 'resolved').length
    };
  }, [projects]);

  const progress = p =>
    p?.tasks?.length
      ? Math.round(
          (p.tasks.filter(t => t.status === 'done').length /
            p.tasks.length) *
            100
        )
      : 0;

  const login = async e => {
    e.preventDefault();
    setBusy(true);
    setAuthError('');

    try {
      const r = await api(
        mode === 'login' ? '/auth/login' : '/auth/register',
        post(auth)
      );

      saveToken(r.token);
      setUser(r.user);
      setProjects((await api('/projects')).projects || []);
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
    setView('overview');
  };

  const createProject = async e => {
    e.preventDefault();

    try {
      const r = await api('/projects', post(newProject));

      setProjects(p => [r.project, ...p]);
      setProject(r.project);
      setShowCreate(false);

      setNewProject({
        title: '',
        idea: '',
        platform: 'Web application'
      });

      setView('overview');
      notify('Project created');
    } catch (e) {
      setError(e.message);
    }
  };

  const selectProject = async id => {
    try {
      const r = await api(`/projects/${id}`);

      setProject(r.project);
      setView('overview');
      setMobile(false);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  const refresh = async () => {
    if (project) {
      await reload(project.id);
    } else {
      await reload();
    }
  };

  const deleteProject = async p => {
    if (!confirm(`Delete ${p.title} and all its project data?`)) return;

    try {
      await api(`/projects/${p.id}`, { method: 'DELETE' });

      setProjects(xs => xs.filter(x => x.id !== p.id));

      if (project?.id === p.id) {
        setProject(null);
      }

      notify('Project deleted');
    } catch (e) {
      setError(e.message);
    }
  };

  const addTask = async e => {
    e.preventDefault();
    if (!project) return;

    try {
      await api(`/projects/${project.id}/tasks`, post(task));

      setTask({
        title: '',
        description: '',
        priority: 'medium'
      });

      await refresh();
      notify('Task added');
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

  const deleteTask = async id => {
    if (!confirm('Delete this task?')) return;

    try {
      await api(`/tasks/${id}`, { method: 'DELETE' });
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  const addBug = async e => {
    e.preventDefault();
    if (!project) return;

    try {
      await api(`/projects/${project.id}/bugs`, post(bug));

      setBug({
        title: '',
        description: '',
        severity: 'medium'
      });

      await refresh();
      notify('Bug reported');
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

  const deleteBug = async id => {
    if (!confirm('Delete this bug report?')) return;

    try {
      await api(`/bugs/${id}`, { method: 'DELETE' });
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  const generate = async type => {
    if (!project) return;

    setGen(type);
    setError('');

    try {
      const r = await api(
        `/projects/${project.id}/artifacts/generate`,
        post({ type })
      );

      await refresh();
      setSelected(r.artifact);
      setEditText(r.artifact.content);
      setView('documents');

      notify(
        r.demo ? 'Generated demo AI draft' : 'Document generated'
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setGen('');
    }
  };

  const saveDoc = async () => {
    try {
      const r = await api(
        `/artifacts/${selected.id}`,
        patch({ content: editText })
      );

      setSelected(r.artifact);
      await refresh();
      notify('Document saved');
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteDoc = async id => {
    if (!confirm('Delete this document?')) return;

    try {
      await api(`/artifacts/${id}`, { method: 'DELETE' });

      if (selected?.id === id) {
        setSelected(null);
      }

      await refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  const sendChat = async e => {
    e.preventDefault();

    if (!project || !chat.trim()) return;

    const msg = chat.trim();
    setChat('');
    setChatBusy(true);

    try {
      await api(
        `/projects/${project.id}/chat`,
        post({ message: msg, role })
      );

      await refresh();
    } catch (e) {
      setError(e.message);
      setChat(msg);
    } finally {
      setChatBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="auth">
        <section className="auth-left">
          <div className="brand">
            <span className="logo"><Bot /></span>
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
              {mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}
            </span>

            <h2>
              {mode === 'login'
                ? 'Sign in to your workspace'
                : 'Create your workspace'}
            </h2>

            <p>
              {mode === 'login'
                ? 'Continue building something meaningful.'
                : 'Start organizing your software projects.'}
            </p>

            {mode === 'register' && (
              <label>
                Full name
                <input
                  required
                  minLength="2"
                  value={auth.name}
                  onChange={e =>
                    setAuth({ ...auth, name: e.target.value })
                  }
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
                onChange={e =>
                  setAuth({ ...auth, email: e.target.value })
                }
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
                onChange={e =>
                  setAuth({ ...auth, password: e.target.value })
                }
                placeholder="At least 8 characters"
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
              />
            </label>

            <Err>{authError}</Err>

            <button className="primary wide" disabled={busy}>
              {busy
                ? 'Please wait…'
                : mode === 'login'
                  ? 'Sign in'
                  : 'Create account'}
              <ArrowRight size={16} />
            </button>

            <div className="switch">
              {mode === 'login'
                ? 'New to the platform?'
                : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
              >
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </div>

            <div className="secure">
              <ShieldCheck size={16} />
              Your projects are private to your account.
            </div>
          </form>
        </section>
      </div>
    );
  }

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

  
const workspacePage = () => (
  <>
    {heading(
      'My workspace',
      'Your personal command center for all software projects.',
      <button
        className="primary"
        onClick={() => setShowCreate(true)}
      >
        <Plus size={16} /> New project
      </button>
    )}

    <div className="metrics">
      <Metric
        icon={<LayoutDashboard />}
        label="Total projects"
        value={projects.length}
        note="Across your workspace"
      />
      <Metric
        icon={<ClipboardList />}
        label="Total tasks"
        value={totals.tasks}
        note={`${totals.done} completed`}
      />
      <Metric
        icon={<Check />}
        label="Overall completion"
        value={`${
          totals.tasks
            ? Math.round((totals.done / totals.tasks) * 100)
            : 0
        }%`}
        note="Across all projects"
      />
      <Metric
        icon={<Bug />}
        label="Open bugs"
        value={totals.bugs}
        note="Across all projects"
      />
    </div>

    <section className="panel">
      {panelTitle(
        'All projects',
        'Open a project to manage its tasks, documents, and bugs.'
      )}

      <div className="search">
        <Search size={16} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search all projects…"
        />
      </div>

      {projects
        .filter(p =>
          p.title.toLowerCase().includes(search.toLowerCase())
        )
        .map(p => (
          <div className="project-row" key={p.id}>
            <button onClick={() => selectProject(p.id)}>
              <span className="avatar">{initials(p.title)}</span>
              <span>
                <b>{p.title}</b>
                <small>
                  {(p.tasks || []).length} tasks · {progress(p)}% complete
                </small>
              </span>
              <ArrowRight size={15} />
            </button>

            <button
              className="icon-button danger"
              title={`Delete ${p.title}`}
              onClick={() => deleteProject(p)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}

      {!projects.length && (
        <Empty title="Your workspace is ready">
          Create your first software project to get started.
        </Empty>
      )}
    </section>
  </>
);

  const overview = () => (
    <>
      {heading(
  'Overview',
  project
    ? `A clear view of delivery, quality, and next steps for ${project.title}.`
    : 'Your software projects, all in one place.',
        <button
          className="primary"
          onClick={() => setShowCreate(true)}
        >
          <Plus size={16} /> New project
        </button>
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
          note={`${
            project
              ? project.tasks.filter(t => t.status === 'done').length
              : totals.done
          } completed`}
        />

        <Metric
          icon={<Check />}
          label="Completion"
          value={`${
            project
              ? progress(project)
              : totals.tasks
                ? Math.round((totals.done / totals.tasks) * 100)
                : 0
          }%`}
          note="Based on completed tasks"
        />

        <Metric
          icon={<Bug />}
          label="Open bugs"
          value={
            project
              ? project.bugs.filter(b => b.status !== 'resolved').length
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
                'Add a project description to capture the goal and scope.'}
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
          {panelTitle('Projects', 'Select a project to manage its workflow')}

          <div className="search">
            <Search size={16} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects…"
            />
          </div>

          {projects
            .filter(p =>
              p.title.toLowerCase().includes(search.toLowerCase())
            )
            .map(p => (
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
            'AI delivery team',
            'Specialist roles for each stage of delivery'
          )}

          {ROLES.map((r, i) => (
            <button
              className="role-row"
              key={r}
              onClick={() => {
                setRole(r);
                setView('consultant');
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
                      'Clarifies requirements',
                      'Plans technical structure',
                      'Organizes milestones',
                      'Supports implementation',
                      'Checks quality and edge cases'
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
          'Document shortcuts',
          'Generate first drafts based on your project context'
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

  const tasksPage = () =>
    !project ? (
      needProject
    ) : (
      <>
        {heading(
          'Task board',
          `Plan work for ${project.title}. Move tasks between workflow stages.`
        )}

        <section className="panel">
          <form className="task-form" onSubmit={addTask}>
            <label>
              Task title
              <input
                required
                maxLength="180"
                value={task.title}
                onChange={e =>
                  setTask({ ...task, title: e.target.value })
                }
                placeholder="e.g. Design sign-up flow"
              />
            </label>

            <label>
              Priority
              <select
                value={task.priority}
                onChange={e =>
                  setTask({ ...task, priority: e.target.value })
                }
              >
                {['low', 'medium', 'high', 'critical'].map(x => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>

            <label className="fullrow">
              Description
              <textarea
                rows="2"
                value={task.description}
                onChange={e =>
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
                  {project.tasks.filter(t => t.status === s).length}
                </span>
              </div>

              {project.tasks
                .filter(t => t.status === s)
                .map(t => (
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
                        onChange={e =>
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

              {!project.tasks.some(t => t.status === s) && (
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
          'Bug tracker',
          'Record defects, prioritize fixes, and track status.'
        )}

        <section className="panel">
          {panelTitle('Report a bug', 'Describe the unexpected behavior')}

          <form className="stack-form" onSubmit={addBug}>
            <label>
              Bug title
              <input
                required
                maxLength="180"
                value={bug.title}
                onChange={e =>
                  setBug({ ...bug, title: e.target.value })
                }
                placeholder="e.g. Save button does not respond"
              />
            </label>

            <label>
              Description
              <textarea
                rows="3"
                value={bug.description}
                onChange={e =>
                  setBug({ ...bug, description: e.target.value })
                }
                placeholder="Steps to reproduce, expected and actual result"
              />
            </label>

            <label>
              Severity
              <select
                value={bug.severity}
                onChange={e =>
                  setBug({ ...bug, severity: e.target.value })
                }
              >
                {['low', 'medium', 'high', 'critical'].map(x => (
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
          {panelTitle('Reported issues', `${project.bugs.length} issue(s)`)}

          {project.bugs.map(b => (
            <article className="bug-row" key={b.id}>
              <div>
                <span className={`priority ${b.severity}`}>
                  {b.severity}
                </span>
                <b>{b.title}</b>
                <p>{b.description}</p>
                <small>Reported {date(b.createdAt)}</small>
              </div>

              <div className="bug-actions">
                <select
                  aria-label="Bug status"
                  value={b.status}
                  onChange={e =>
                    updateBug(b.id, { status: e.target.value })
                  }
                >
                  {[
                    ['open', 'Open'],
                    ['in-progress', 'In progress'],
                    ['resolved', 'Resolved']
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
          'Documentation studio',
          `Create and manage software deliverables for ${project.title}.`
        )}

        <div className="metrics">
          <Metric
            icon={<FileText />}
            label="Saved documents"
            value={project.artifacts.length}
            note="Stored in this project"
          />
          <Metric
            icon={<ClipboardList />}
            label="Available templates"
            value={TYPES.length}
            note="Across the SDLC"
          />
          <Metric
            icon={<Check />}
            label="Project tasks"
            value={project.tasks.length}
            note="Linked project workflow"
          />
          <Metric
            icon={<Sparkles />}
            label="AI assistant"
            value="Ready"
            note="Draft generation available"
          />
        </div>

        <div className="doc-layout">
          <section className="panel">
            {panelTitle(
              'Document templates',
              'Select a template to generate a project-specific draft'
            )}

            <div className="search">
              <Search size={16} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search templates or documents…"
              />
            </div>

            {TYPES.filter(([type, label, desc]) =>
              `${type} ${label} ${desc}`
                .toLowerCase()
                .includes(search.toLowerCase())
            ).map(([type, label, desc, Icon]) => (
              <button
                className="doc-type"
                key={type}
                disabled={!!gen}
                onClick={() => generate(type)}
              >
                <Icon size={18} />
                <span>
                  <b>{label}</b>
                  <small>{desc}</small>
                </span>
                {gen === type ? 'Generating…' : <Plus size={16} />}
              </button>
            ))}

            {!TYPES.some(([type, label, desc]) =>
              `${type} ${label} ${desc}`
                .toLowerCase()
                .includes(search.toLowerCase())
            ) && (
              <p className="muted">
                No matching templates. Try another search.
              </p>
            )}
          </section>

          <section className="panel">
            {selected ? (
              <>
                {panelTitle(
                  selected.title,
                  `${selected.demo ? 'Demo AI draft' : 'Generated document'} · Last updated ${date(selected.updatedAt)}`
                )}

                <div className="notice">
                  Review the draft before using it in your project submission.
                  You can edit and save your changes below.
                </div>

                <textarea
                  aria-label="Document content editor"
                  className="editor"
                  rows="22"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
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
              <Empty title="Your document workspace">
                Choose a template on the left to generate a draft. Select a
                saved document below to continue editing it.
              </Empty>
            )}

            <div className="saved-docs">
              <div className="panel-title">
                <div>
                  <h3>Saved documents</h3>
                  <p>
                    {project.artifacts.length} document(s) in this project
                  </p>
                </div>
              </div>

              {project.artifacts
                .filter(a =>
                  `${a.title} ${a.content || ''}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                .map(a => (
                  <div className="project-row" key={a.id}>
                    <button
                      onClick={() => {
                        setSelected(a);
                        setEditText(a.content);
                        setError('');
                      }}
                    >
                      <span className="avatar">
                        <FileText size={16} />
                      </span>
                      <span>
                        <b>{a.title}</b>
                        <small>Updated {date(a.updatedAt)}</small>
                      </span>
                      <ArrowRight size={15} />
                    </button>

                    <button
                      className="icon-button danger"
                      title={`Delete ${a.title}`}
                      onClick={() => deleteDoc(a.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

              {!project.artifacts.length && (
                <p className="muted">
                  No saved documents yet. Generate your first draft using a
                  template.
                </p>
              )}
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
          'AI consultant',
          `Your AI software delivery team for ${project.title}.`
        )}

        <div className="columns consultant">
          <section className="panel consultant-main">
            {panelTitle(
              'Project conversation',
              `${project.messages.length} message(s) · Saved with this project`
            )}

            <label className="role-label">
              Consultant role
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                {ROLES.map(r => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>

            <div className="messages">
              {!project.messages.length && !chatBusy && (
                <div className="consultant-welcome">
                  <div className="consultant-welcome-icon">
                    <Sparkles size={23} />
                  </div>
                  <h3>Let's build something great.</h3>
                  <p>
                    Ask your AI consultant to plan features, review architecture,
                    identify risks, or help your team deliver better software.
                  </p>
                  <small>
                    Choose a suggested prompt or type your own question below.
                  </small>
                </div>
              )}

              {project.messages.map(m => (
                <div
                  className={`message ${m.role === 'user' ? 'mine' : ''}`}
                  key={m.id}
                >
                  <b>{m.role === 'user' ? 'You' : role}</b>
                  <p>{m.text}</p>
                  {m.demo && <small>Demo response</small>}
                </div>
              ))}

              {chatBusy && (
                <div className="message">
                  <b>{role}</b>
                  <p className="typing-indicator">
                    Thinking through your question…
                  </p>
                </div>
              )}
            </div>

            <form className="chat-form" onSubmit={sendChat}>
              <textarea
                rows="2"
                value={chat}
                onChange={e => setChat(e.target.value)}
                placeholder="Ask your consultant anything about this project…"
                disabled={chatBusy}
              />

              <div className="chat-form-footer">
                <small>
                  Specific questions usually get more useful answers.
                </small>

                <button
                  className="primary"
                  type="submit"
                  disabled={chatBusy || !chat.trim()}
                >
                  <Send size={15} />
                  {chatBusy ? 'Thinking…' : 'Send message'}
                </button>
              </div>
            </form>
          </section>

          <aside className="panel consultant-sidebar">
            {panelTitle(
              'Suggested prompts',
              'Click one to start a conversation'
            )}

            <div className="consultant-prompt-list">
              {[
                {
                  category: 'REQUIREMENTS',
                  title: 'Define acceptance criteria',
                  prompt:
                    'Draft clear, testable acceptance criteria for the next feature in this project.'
                },
                {
                  category: 'RISK REVIEW',
                  title: 'Find delivery risks',
                  prompt:
                    'Identify the top delivery, technical, and project risks, with practical mitigations.'
                },
                {
                  category: 'SPRINT PLANNING',
                  title: 'Plan the first sprint',
                  prompt:
                    'Suggest a realistic first sprint plan with small tasks, priorities, and completion criteria.'
                },
                {
                  category: 'QUALITY ASSURANCE',
                  title: 'Create a QA checklist',
                  prompt:
                    'Create a QA checklist for the core user flow, including positive, negative, and edge-case tests.'
                },
                {
                  category: 'ARCHITECTURE',
                  title: 'Review the architecture',
                  prompt:
                    'Recommend a suitable software architecture for this project and explain the main trade-offs.'
                },
                {
                  category: 'PROJECT PLANNING',
                  title: 'Recommend next steps',
                  prompt:
                    'Review the project from a software delivery perspective and recommend the five most useful next steps.'
                }
              ].map(item => (
                <button
                  className="prompt consultant-prompt"
                  key={item.title}
                  type="button"
                  onClick={() => setChat(item.prompt)}
                  disabled={chatBusy}
                >
                  <span className="prompt-copy">
                    <small>{item.category}</small>
                    <b>{item.title}</b>
                    <span>{item.prompt}</span>
                  </span>
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>

            <div className="notice consultant-notice">
              <b>About AI responses</b>
              <p>
                If no Gemini API key is configured, the application uses
                clearly labelled demo responses. Demo responses are not
                generated by a live AI model.
              </p>
            </div>
          </aside>
        </div>
      </>
    );

 const nav = [
  ['overview', 'Overview', LayoutDashboard],
  ['consultant', 'AI consultant', MessageSquare],
  ['documents', 'Documents', FileText],
  ['tasks', 'Tasks', ClipboardList],
  ['bugs', 'Bug tracker', Bug]
];

  return (
    <div className="app">
      <aside className={`sidebar ${mobile ? 'show' : ''}`}>
        <div className="brand">
          <span className="logo"><Bot /></span>
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
  setView('workspace');
  setError('');
  setMobile(false);
}}
>
  <b>▦ &nbsp; My workspace</b>
  <small>Personal team</small>
</button>


        <span className="nav-caption">WORKSPACE</span>

        <nav>
          {nav.map(([v, label, Icon]) => (
            <button
              className={`nav-item ${view === v ? 'active' : ''}`}
              key={v}
              onClick={() => {
                setView(v);
                setError('');
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

          {projects.map(p => (
            <button
              key={p.id}
              className={`project-link ${
                project?.id === p.id ? 'chosen' : ''
              }`}
              onClick={() => selectProject(p.id)}
            >
              <span className="avatar small">{initials(p.title)}</span>
              {p.title}
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <button
            className="help"
            onClick={() => setView('consultant')}
          >
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
            <button
              className="icon-button"
              title="Sign out"
              onClick={signout}
            >
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
            Workspace <span>/</span>{' '}
            <b>{project?.title || 'Overview'}</b>
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

         
{view === 'workspace' && workspacePage()}
{view === 'overview' && overview()}
{view === 'tasks' && tasksPage()}
{view === 'bugs' && bugsPage()}
{view === 'documents' && docsPage()}
{view === 'consultant' && consultantPage()}

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
          onMouseDown={e => {
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
                onChange={e =>
                  setNewProject({
                    ...newProject,
                    title: e.target.value
                  })
                }
                placeholder="e.g. Career Match"
              />
            </label>

            <label>
              Project idea
              <textarea
                rows="4"
                value={newProject.idea}
                onChange={e =>
                  setNewProject({
                    ...newProject,
                    idea: e.target.value
                  })
                }
                placeholder="Who is it for? What problem does it solve?"
              />
            </label>

            <label>
              Platform
              <select
                value={newProject.platform}
                onChange={e =>
                  setNewProject({
                    ...newProject,
                    platform: e.target.value
                  })
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
