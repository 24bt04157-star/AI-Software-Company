
<<<<<<< HEAD
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(here, "../data/db.json");

let mongo = false;
let db = { users: [], projects: [] };

const User =
  mongoose.models.User ||
  mongoose.model(
    "User",
    new mongoose.Schema(
      {
        name: String,
        email: { type: String, unique: true, lowercase: true },
        passwordHash: String,
      },
      { timestamps: true }
    )
  );

const Project =
  mongoose.models.Project ||
  mongoose.model(
    "Project",
    new mongoose.Schema(
      {
        ownerId: String,
        title: String,
        idea: String,
        platform: String,
        status: String,
        requirements: Object,
        conversation: Array,
        artifacts: Array,
        tasks: Array,
        bugs: Array,
      },
      { timestamps: true }
    )
  );

async function save() {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(db, null, 2));
=======
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.resolve(__dirname, '../data/db.json');

let mongo = false;
let db = {
  users: [],
  projects: [],
};

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const projectSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    idea: { type: String, default: '' },
    platform: { type: String, default: 'Web application' },
    status: { type: String, default: 'discovery' },
    requirements: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        features: [],
        roles: [],
        assumptions: [],
      }),
    },
    conversation: { type: [mongoose.Schema.Types.Mixed], default: [] },
    artifacts: { type: [mongoose.Schema.Types.Mixed], default: [] },
    tasks: { type: [mongoose.Schema.Types.Mixed], default: [] },
    bugs: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const User =
  mongoose.models.ASCUser ||
  mongoose.model('ASCUser', userSchema);

const Project =
  mongoose.models.ASCProject ||
  mongoose.model('ASCProject', projectSchema);

function normalize(document) {
  if (!document) return null;

  const value =
    typeof document.toObject === 'function'
      ? document.toObject({ virtuals: false })
      : { ...document };

  if (value._id !== undefined) {
    value.id = String(value._id);
    delete value._id;
  }

  return value;
}

async function save() {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(db, null, 2), 'utf8');
}

export function storageMode() {
  return mongo ? 'mongodb' : 'json';
>>>>>>> 40dff49 (Fix backend storage exports)
}

export async function initStore() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      });

      mongo = true;
<<<<<<< HEAD
      console.log("MongoDB connected");
      return;
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
=======
      console.log('MongoDB connected');
      return;
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
>>>>>>> 40dff49 (Fix backend storage exports)

      if (process.env.VERCEL) {
        throw error;
      }
<<<<<<< HEAD
    }
  } else if (process.env.VERCEL) {
    throw new Error(
      "MONGODB_URI is missing. Configure it in Vercel Environment Variables."
=======

      throw error;
    }
  }

  if (process.env.VERCEL) {
    throw new Error(
      'MONGODB_URI is missing. Configure it in Vercel Environment Variables.'
>>>>>>> 40dff49 (Fix backend storage exports)
    );
  }

  try {
<<<<<<< HEAD
    db = JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    await save();
  }

  console.log("Using local JSON persistence");
}

export const storageMode = () => (mongo ? "mongodb" : "local-json");

export async function findUserByEmail(email) {
  const normalizedEmail = email.toLowerCase();

  return mongo
    ? User.findOne({ email: normalizedEmail }).lean()
    : db.users.find((user) => user.email === normalizedEmail) || null;
}

export async function findUserById(id) {
  return mongo
    ? User.findById(id).lean()
    : db.users.find((user) => user.id === id) || null;
}

export async function createUser(user) {
  if (mongo) {
    return (await User.create(user)).toObject();
  }

  db.users.push(user);
  await save();
  return user;
}

const clean = (project) =>
  project
    ? {
        ...project,
        id: String(project._id || project.id),
        _id: undefined,
        __v: undefined,
      }
    : null;

export async function listProjects(ownerId) {
  if (mongo) {
    const projects = await Project.find({ ownerId })
      .sort({ updatedAt: -1 })
      .lean();

    return projects.map(clean);
  }

  return db.projects
    .filter((project) => project.ownerId === ownerId)
    .sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
}

export async function getProject(id, ownerId) {
  if (mongo) {
    if (!mongoose.isValidObjectId(id)) return null;

    return clean(
      await Project.findOne({ _id: id, ownerId }).lean()
=======
    db = JSON.parse(await fs.readFile(file, 'utf8'));

    if (!Array.isArray(db.users)) db.users = [];
    if (!Array.isArray(db.projects)) db.projects = [];
  } catch {
    db = { users: [], projects: [] };
    await save();
  }

  mongo = false;
  console.log('Using local JSON persistence');
}

// -------------------- USERS --------------------

export async function findUserByEmail(email) {
  const normalizedEmail = String(email).trim().toLowerCase();

  if (mongo) {
    return normalize(
      await User.findOne({ email: normalizedEmail })
>>>>>>> 40dff49 (Fix backend storage exports)
    );
  }

  return (
<<<<<<< HEAD
    db.projects.find(
      (project) => project.id === id && project.ownerId === ownerId
=======
    db.users.find(
      (user) => user.email.toLowerCase() === normalizedEmail
>>>>>>> 40dff49 (Fix backend storage exports)
    ) || null
  );
}

<<<<<<< HEAD
export async function createProject(project) {
  const now = new Date().toISOString();

  const newProject = {
    ...project,
    createdAt: now,
    updatedAt: now,
    conversation: [],
    artifacts: [],
    tasks: [],
    bugs: [],
  };

  if (mongo) {
    return clean(await Project.create(newProject));
  }

  newProject.id = randomUUID();
=======
export async function findUserById(id) {
  if (mongo) {
    return normalize(await User.findById(String(id)));
  }

  return (
    db.users.find(
      (user) => String(user.id) === String(id)
    ) || null
  );
}

export async function createUser(user) {
  const newUser = {
    id: String(user.id || nanoid()),
    name: user.name,
    email: String(user.email).trim().toLowerCase(),
    passwordHash: user.passwordHash,
  };

  if (mongo) {
    const created = await User.create({
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      passwordHash: newUser.passwordHash,
    });

    return normalize(created);
  }

  if (
    db.users.some(
      (existing) => existing.email === newUser.email
    )
  ) {
    throw new Error('Email already registered.');
  }

  db.users.push(newUser);
  await save();

  return newUser;
}

// -------------------- PROJECTS --------------------

export async function createProject(project) {
  const newProject = {
    ...project,
    id: String(project.id || nanoid()),
    ownerId: String(project.ownerId),
    conversation: project.conversation || [],
    artifacts: project.artifacts || [],
    tasks: project.tasks || [],
    bugs: project.bugs || [],
  };

  if (mongo) {
    const created = await Project.create({
      ...newProject,
      _id: newProject.id,
    });

    return normalize(created);
  }

>>>>>>> 40dff49 (Fix backend storage exports)
  db.projects.push(newProject);
  await save();

  return newProject;
}

<<<<<<< HEAD
export async function updateProject(id, ownerId, updates) {
  if (mongo) {
    if (!mongoose.isValidObjectId(id)) return null;

    return clean(
      await Project.findOneAndUpdate(
        { _id: id, ownerId },
        { $set: { ...updates, updatedAt: new Date() } },
        { new: true }
      ).lean()
    );
  }

  const project = db.projects.find(
    (item) => item.id === id && item.ownerId === ownerId
=======
export async function listProjects(ownerId) {
  if (mongo) {
    const projects = await Project.find({
      ownerId: String(ownerId),
    }).sort({ updatedAt: -1 });

    return projects.map(normalize);
  }

  return db.projects
    .filter(
      (project) => String(project.ownerId) === String(ownerId)
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt || 0) -
        new Date(a.updatedAt || 0)
    );
}

export async function getProject(id, ownerId) {
  if (mongo) {
    return normalize(
      await Project.findOne({
        _id: String(id),
        ownerId: String(ownerId),
      })
    );
  }

  return (
    db.projects.find(
      (project) =>
        String(project.id) === String(id) &&
        String(project.ownerId) === String(ownerId)
    ) || null
  );
}

export async function updateProject(id, ownerId, updates) {
  if (mongo) {
    const project = await Project.findOneAndUpdate(
      {
        _id: String(id),
        ownerId: String(ownerId),
      },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return normalize(project);
  }

  const project = db.projects.find(
    (item) =>
      String(item.id) === String(id) &&
      String(item.ownerId) === String(ownerId)
>>>>>>> 40dff49 (Fix backend storage exports)
  );

  if (!project) return null;

  Object.assign(project, updates, {
    updatedAt: new Date().toISOString(),
  });

  await save();
<<<<<<< HEAD
=======

>>>>>>> 40dff49 (Fix backend storage exports)
  return project;
}

export async function deleteProject(id, ownerId) {
  if (mongo) {
<<<<<<< HEAD
    if (!mongoose.isValidObjectId(id)) return false;

    const result = await Project.deleteOne({ _id: id, ownerId });
    return result.deletedCount > 0;
  }

  const originalLength = db.projects.length;

  db.projects = db.projects.filter(
    (project) => !(project.id === id && project.ownerId === ownerId)
  );

  if (originalLength !== db.projects.length) {
    await save();
  }

  return originalLength !== db.projects.length;
}

export async function findProjectContainingArrayItem(
  ownerId,
  key,
  itemId
) {
  for (const project of await listProjects(ownerId)) {
    const item = (project[key] || []).find(
      (entry) => entry.id === itemId
    );

    if (item) return { project, item };
  }

  return null;
=======
    const result = await Project.deleteOne({
      _id: String(id),
      ownerId: String(ownerId),
    });

    return result.deletedCount > 0;
  }

  const index = db.projects.findIndex(
    (project) =>
      String(project.id) === String(id) &&
      String(project.ownerId) === String(ownerId)
  );

  if (index === -1) return false;

  db.projects.splice(index, 1);
  await save();

  return true;
}

// -------------------- TASKS AND BUGS --------------------

export async function findProjectContainingArrayItem(
  ownerId,
  arrayName,
  itemId
) {
  const allowedArrays = ['tasks', 'bugs'];

  if (!allowedArrays.includes(arrayName)) {
    throw new Error('Unsupported project array.');
  }

  if (mongo) {
    const project = await Project.findOne({
      ownerId: String(ownerId),
      [`${arrayName}.id`]: String(itemId),
    });

    if (!project) return null;

    const normalizedProject = normalize(project);
    const item = (normalizedProject[arrayName] || []).find(
      (entry) => String(entry.id) === String(itemId)
    );

    return item
      ? { project: normalizedProject, item }
      : null;
  }

  const project = db.projects.find(
    (item) =>
      String(item.ownerId) === String(ownerId) &&
      (item[arrayName] || []).some(
        (entry) => String(entry.id) === String(itemId)
      )
  );

  if (!project) return null;

  const item = (project[arrayName] || []).find(
    (entry) => String(entry.id) === String(itemId)
  );

  return item ? { project, item } : null;
>>>>>>> 40dff49 (Fix backend storage exports)
}
