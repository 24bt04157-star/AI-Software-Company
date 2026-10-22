
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
}

export async function initStore() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      });

      mongo = true;
      console.log("MongoDB connected");
      return;
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);

      if (process.env.VERCEL) {
        throw error;
      }
    }
  } else if (process.env.VERCEL) {
    throw new Error(
      "MONGODB_URI is missing. Configure it in Vercel Environment Variables."
    );
  }

  try {
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
    );
  }

  return (
    db.projects.find(
      (project) => project.id === id && project.ownerId === ownerId
    ) || null
  );
}

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
  db.projects.push(newProject);
  await save();

  return newProject;
}

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
  );

  if (!project) return null;

  Object.assign(project, updates, {
    updatedAt: new Date().toISOString(),
  });

  await save();
  return project;
}

export async function deleteProject(id, ownerId) {
  if (mongo) {
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
}
