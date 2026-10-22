
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

import {
  initStore,
  storageMode,
  findUserByEmail,
  findUserById,
  createUser,
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  findProjectContainingArrayItem,
} from './store.js';

import { generateAI, artifactTitles } from './ai.js';

const app = express();
const PORT = Number(process.env.PORT || 5000);
const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

const allowedOrigins = [
  'http://localhost:5173',
  'https://ai-software-company-w56p.vercel.app',
  'https://ai-software-company-w56p-git-main-bluepeak-ai.vercel.app',
];

app.use(cors({
  origin(origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin === process.env.CLIENT_ORIGIN
    ) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS'));
  },
}));

app.use(express.json({ limit: '1mb' }));

const cleanUser = (u) => ({
  id: String(u.id || u._id),
  name: u.name,
  email: u.email,
});

const tokenFor = (u) =>
  jwt.sign({ sub: String(u.id || u._id) }, SECRET, {
    expiresIn: '7d',
  });

const wrap = (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

async function auth(req, res, next) {
  try {
    const h = req.headers.authorization || '';

    if (!h.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Please log in.' });
    }

    const payload = jwt.verify(h.slice(7), SECRET);
    const user = await findUserById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: 'Session expired.' });
    }

    req.user = cleanUser(user);
    next();
  } catch {
    return res.status(401).json({
      error: 'Invalid or expired session.',
    });
  }
}

const valid = (v, n = 2000) =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= n;

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    storage: storageMode(),
    ai: process.env.GEMINI_API_KEY ? 'gemini' : 'demo',
    time: new Date().toISOString(),
  });
});

app.post('/api/auth/register', wrap(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({
      error: 'Name must be 2–80 characters.',
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email.' });
  }

  if (password.length < 8 || password.length > 100) {
    return res.status(400).json({
      error: 'Password must be 8–100 characters.',
    });
  }

  if (await findUserByEmail(email)) {
    return res.status(409).json({
      error: 'Email already registered.',
    });
  }

  const user = await createUser({
    id: nanoid(),
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
  });

  res.status(201).json({
    user: cleanUser(user),
    token: tokenFor(user),
  });
}));

app.post('/api/auth/login', wrap(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = await findUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({
      error: 'Email or password is incorrect.',
    });
  }

  res.json({
    user: cleanUser(user),
    token: tokenFor(user),
  });
}));

app.get('/api/auth/me', auth, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/projects', auth, wrap(async (req, res) => {
  res.json({ projects: await listProjects(req.user.id) });
}));

app.post('/api/projects', auth, wrap(async (req, res) => {
  const title = String(req.body.title || '').trim();
  const idea = String(req.body.idea || '').trim();

  if (!valid(title, 120) || !valid(idea, 5000)) {
    return res.status(400).json({
      error: 'Project title and idea are required.',
    });
  }

  const project = await createProject({
    ownerId: req.user.id,
    title,
    idea,
    platform: String(req.body.platform || 'Web application'),
    status: 'discovery',
    requirements: {
      features: [],
      roles: [],
      assumptions: [],
    },
  });

  res.status(201).json({ project });
}));

app.get('/api/projects/:id', auth, wrap(async (req, res) => {
  const project = await getProject(req.params.id, req.user.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  res.json({ project });
}));

app.patch('/api/projects/:id', auth, wrap(async (req, res) => {
  const project = await getProject(req.params.id, req.user.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const updates = {};

  for (const key of [
    'title',
    'idea',
    'platform',
    'status',
    'requirements',
  ]) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  if (updates.title !== undefined && !valid(updates.title, 120)) {
    return res.status(400).json({ error: 'Invalid title.' });
  }

  const updated = await updateProject(
    project.id,
    req.user.id,
    updates,
  );

  res.json({ project: updated });
}));

app.delete('/api/projects/:id', auth, wrap(async (req, res) => {
  if (!await deleteProject(req.params.id, req.user.id)) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  res.json({ success: true });
}));

app.post('/api/projects/:id/chat', auth, wrap(async (req, res) => {
  const project = await getProject(req.params.id, req.user.id);
  const message = String(req.body.message || '').trim();

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  if (!valid(message, 5000)) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const history = [
    ...(project.conversation || []),
    {
      id: nanoid(),
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    },
  ];

  const result = await generateAI({
    role: 'Business Analyst',
    prompt: message,
    project,
    history,
  });

  const assistantMessage = {
    id: nanoid(),
    role: 'assistant',
    content: result.text,
    provider: result.provider,
    demo: result.demo,
    createdAt: new Date().toISOString(),
  };

  const updated = await updateProject(project.id, req.user.id, {
    conversation: [...history, assistantMessage],
  });

  res.json({
    message: assistantMessage,
    project: updated,
    aiMode: result.demo ? 'demo' : 'live',
  });
}));

const roles = {
  srs: 'Business Analyst',
  userStories: 'Business Analyst',
  architecture: 'Solution Architect',
  sprintPlan: 'Project Manager',
  estimate: 'Project Manager',
  uml: 'Solution Architect',
  testCases: 'QA Engineer',
  apiDesign: 'Developer Assistant',
};

app.post(
  '/api/projects/:id/artifacts/generate',
  auth,
  wrap(async (req, res) => {
    const project = await getProject(req.params.id, req.user.id);
    const type = String(req.body.type || '');

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (!artifactTitles[type]) {
      return res.status(400).json({
        error: 'Unsupported artifact type.',
      });
    }

    const result = await generateAI({
      role: roles[type],
      prompt: `Generate ${artifactTitles[type]} for this project. Use useful headings and label assumptions.`,
      project,
      history: project.conversation || [],
    });

    const artifact = {
      id: nanoid(),
      type,
      title: artifactTitles[type],
      content: result.text,
      version: 1,
      status: 'draft',
      provider: result.provider,
      demo: result.demo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = await updateProject(project.id, req.user.id, {
      artifacts: [...(project.artifacts || []), artifact],
    });

    res.status(201).json({
      artifact,
      project: updated,
      aiMode: result.demo ? 'demo' : 'live',
    });
  }),
);

app.patch(
  '/api/projects/:id/artifacts/:artifactId',
  auth,
  wrap(async (req, res) => {
    const project = await getProject(req.params.id, req.user.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (
      typeof req.body.content !== 'string' ||
      req.body.content.length > 100000
    ) {
      return res.status(400).json({
        error: 'Artifact content must be text under 100,000 characters.',
      });
    }

    const artifact = (project.artifacts || []).find(
      (item) => item.id === req.params.artifactId,
    );

    if (!artifact) {
      return res.status(404).json({ error: 'Artifact not found.' });
    }

    const artifacts = project.artifacts.map((item) =>
      item.id !== artifact.id
        ? item
        : {
            ...item,
            content: req.body.content,
            version: (item.version || 1) + 1,
            status: 'edited',
            updatedAt: new Date().toISOString(),
          },
    );

    const updated = await updateProject(project.id, req.user.id, {
      artifacts,
    });

    res.json({
      artifact: artifacts.find((item) => item.id === artifact.id),
      project: updated,
    });
  }),
);

app.post('/api/projects/:id/tasks', auth, wrap(async (req, res) => {
  const project = await getProject(req.params.id, req.user.id);
  const title = String(req.body.title || '').trim();

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  if (!valid(title, 180)) {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  const task = {
    id: nanoid(),
    title,
    description: String(req.body.description || '').slice(0, 2000),
    priority: ['low', 'medium', 'high'].includes(req.body.priority)
      ? req.body.priority
      : 'medium',
    status: 'todo',
    assigneeRole: 'Unassigned',
    createdAt: new Date().toISOString(),
  };

  await updateProject(project.id, req.user.id, {
    tasks: [...(project.tasks || []), task],
  });

  res.status(201).json({ task });
}));

app.patch('/api/tasks/:taskId', auth, wrap(async (req, res) => {
  const found = await findProjectContainingArrayItem(
    req.user.id,
    'tasks',
    req.params.taskId,
  );

  if (!found) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  const tasks = found.project.tasks.map((task) =>
    task.id !== req.params.taskId
      ? task
      : {
          ...task,
          ...(req.body.status &&
          ['todo', 'in-progress', 'done'].includes(req.body.status)
            ? { status: req.body.status }
            : {}),
          ...(req.body.title && valid(req.body.title, 180)
            ? { title: req.body.title.trim() }
            : {}),
          ...(req.body.priority &&
          ['low', 'medium', 'high'].includes(req.body.priority)
            ? { priority: req.body.priority }
            : {}),
        },
  );

  await updateProject(found.project.id, req.user.id, { tasks });
  res.json({ task: tasks.find((task) => task.id === req.params.taskId) });
}));

app.delete('/api/tasks/:taskId', auth, wrap(async (req, res) => {
  const found = await findProjectContainingArrayItem(
    req.user.id,
    'tasks',
    req.params.taskId,
  );

  if (!found) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  await updateProject(found.project.id, req.user.id, {
    tasks: found.project.tasks.filter(
      (task) => task.id !== req.params.taskId,
    ),
  });

  res.json({ success: true });
}));

app.post('/api/projects/:id/bugs', auth, wrap(async (req, res) => {
  const project = await getProject(req.params.id, req.user.id);
  const title = String(req.body.title || '').trim();

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  if (!valid(title, 180)) {
    return res.status(400).json({ error: 'Bug title is required.' });
  }

  const bug = {
    id: nanoid(),
    title,
    description: String(req.body.description || '').slice(0, 3000),
    severity: ['low', 'medium', 'high', 'critical'].includes(
      req.body.severity,
    )
      ? req.body.severity
      : 'medium',
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  await updateProject(project.id, req.user.id, {
    bugs: [...(project.bugs || []), bug],
  });

  res.status(201).json({ bug });
}));

app.patch('/api/bugs/:bugId', auth, wrap(async (req, res) => {
  const found = await findProjectContainingArrayItem(
    req.user.id,
    'bugs',
    req.params.bugId,
  );

  if (!found) {
    return res.status(404).json({ error: 'Bug not found.' });
  }

  const bugs = found.project.bugs.map((bug) =>
    bug.id !== req.params.bugId
      ? bug
      : {
          ...bug,
          ...(req.body.status &&
          ['open', 'in-progress', 'resolved'].includes(req.body.status)
            ? { status: req.body.status }
            : {}),
          ...(req.body.severity &&
          ['low', 'medium', 'high', 'critical'].includes(req.body.severity)
            ? { severity: req.body.severity }
            : {}),
        },
  );

  await updateProject(found.project.id, req.user.id, { bugs });
  res.json({ bug: bugs.find((bug) => bug.id === req.params.bugId) });
}));

app.delete('/api/bugs/:bugId', auth, wrap(async (req, res) => {
  const found = await findProjectContainingArrayItem(
    req.user.id,
    'bugs',
    req.params.bugId,
  );

  if (!found) {
    return res.status(404).json({ error: 'Bug not found.' });
  }

  await updateProject(found.project.id, req.user.id, {
    bugs: found.project.bugs.filter((bug) => bug.id !== req.params.bugId),
  });

  res.json({ success: true });
}));

app.get('/api/projects/:id/dashboard', auth, wrap(async (req, res) => {
  const project = await getProject(req.params.id, req.user.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const tasks = project.tasks || [];
  const bugs = project.bugs || [];
  const artifacts = project.artifacts || [];

  res.json({
    project,
    metrics: {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((task) => task.status === 'done').length,
      openBugs: bugs.filter((bug) => bug.status !== 'resolved').length,
      artifacts: artifacts.length,
      progress: tasks.length
        ? Math.round(
            (tasks.filter((task) => task.status === 'done').length /
              tasks.length) *
              100,
          )
        : 0,
    },
  });
}));

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Unexpected server error.'
        : err.message || 'Unexpected server error.',
  });
});

await initStore();

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
