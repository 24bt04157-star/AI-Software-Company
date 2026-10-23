

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
}

export async function initStore() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      });

      mongo = true;
      console.log('MongoDB connected');
      return;
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);

      if (process.env.VERCEL) {
        throw error;
      }

      throw error;
    }
  }

  if (process.env.VERCEL) {
    throw new Error(
      'MONGODB_URI is missing. Configure it in Vercel Environment Variables.'
    );
  }

  try {
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
    );
  }

  return (
    db.users.find(
      (user) => user.email.toLowerCase() === normalizedEmail
    ) || null
  );
}

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

  db.projects.push(newProject);
  await save();

  return newProject;
}

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
}
