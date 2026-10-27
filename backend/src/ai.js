
const KNOWLEDGE_BASE = [
  {
    category: "conversation",
    title: "Greetings and introductions",
    keywords: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "how are you", "thank you", "thanks", "goodbye", "who are you", "help", "what can you do"],
    content: `
CONVERSATION AND INTRODUCTION
Respond naturally and politely to greetings. Explain that the consultant helps with software planning, programming concepts, requirements, architecture, testing, debugging, documentation, and project management.
For thanks, acknowledge politely. For a goodbye, close courteously.
Do not claim to have feelings, personal experiences, or human identity. When asked how you are, respond conversationally without claiming human emotions.
When asked what you can do, explain the supported topics and mention that offline answers come from stored knowledge rather than a live AI model.
`
  },
  {
    category: "programming",
    title: "Programming fundamentals",
    keywords: ["programming", "variable", "data type", "operator", "condition", "if else", "loop", "function", "recursion", "array", "string", "syntax", "compiler", "interpreter", "algorithm"],
    content: `
PROGRAMMING FUNDAMENTALS
A variable stores a value. Common data types include integers, floating-point numbers, strings, booleans, arrays or lists, and objects.
Conditionals select behavior based on conditions. Loops repeat operations. Functions package reusable behavior. Recursion occurs when a function calls itself and needs a valid base case.
An algorithm is a finite sequence of steps for solving a problem. Evaluate algorithms for correctness, time complexity, and space complexity.
Debugging should begin by reproducing the issue, reading the exact error, checking inputs, isolating the failing operation, and testing the fix.
A compiler generally translates source code before execution; an interpreter or runtime executes code through its own execution process. Modern language implementations may combine compilation and interpretation.
`
  },
  {
    category: "programming",
    title: "Object-oriented programming",
    keywords: ["oop", "object oriented", "class", "object", "inheritance", "polymorphism", "encapsulation", "abstraction", "constructor", "interface", "method", "solid"],
    content: `
OBJECT-ORIENTED PROGRAMMING
A class describes data and behavior; an object is an instance of a class.
Encapsulation groups state and behavior and controls access to internal state.
Abstraction exposes essential behavior while hiding implementation details.
Inheritance allows a type to derive behavior from another type.
Polymorphism allows different implementations to be used through a common interface.
Prefer composition over inheritance when it produces simpler, less tightly coupled designs.
SOLID principles are Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.
A constructor initializes an object. An interface defines a contract in languages that support interfaces.
`
  },
  {
    category: "programming",
    title: "Python fundamentals",
    keywords: ["python", "list comprehension", "dictionary", "tuple", "set", "pip", "virtual environment", "pandas", "numpy", "jupyter"],
    content: `
PYTHON
Python is a general-purpose language used in scripting, web development, automation, data analysis, and machine learning.
Lists are ordered and mutable; tuples are ordered and immutable; sets store unique elements; dictionaries map keys to values.
Use functions to organize repeated logic, exceptions to handle expected failures, and virtual environments to isolate project dependencies.
pip installs Python packages. Jupyter notebooks combine executable code with explanatory text.
Pandas supports tabular data analysis; NumPy supports numerical arrays and operations.
When debugging, inspect the traceback, identify the failing line, check variable types and values, and reproduce the issue with a small example.
`
  },
  {
    category: "programming",
    title: "Java and C/C++ fundamentals",
    keywords: ["java", "c++", "cpp", "c language", "pointer", "reference", "memory", "garbage collection", "jvm", "exception handling"],
    content: `
JAVA, C AND C++
Java runs on the Java Virtual Machine and uses automatic garbage collection for managed objects. C and C++ provide more direct control over memory, with different ownership and resource-management considerations.
A pointer stores a memory address; a reference provides an alias or indirect access according to the language's rules.
Use appropriate types, initialize variables, validate array bounds, and manage resources safely.
C++ commonly uses RAII and smart pointers to manage resources. Java exceptions should be handled where the application can meaningfully recover or add context.
Do not dereference invalid pointers, use freed memory, or assume memory allocation always succeeds.
`
  },
  {
    category: "web",
    title: "HTML, CSS and responsive design",
    keywords: ["html", "css", "frontend", "responsive", "flexbox", "grid", "dom", "accessibility", "website", "web page", "semantic html"],
    content: `
HTML, CSS AND WEB UI
HTML structures content. CSS controls presentation and layout. Semantic HTML communicates the purpose of elements to browsers and assistive technology.
Flexbox is useful for one-dimensional layout; CSS Grid is useful for two-dimensional layout.
Responsive interfaces adapt to screen sizes using flexible sizing, media queries, and layouts that can wrap or reflow.
Use real buttons for actions, links for navigation, labels for inputs, visible focus states, sufficient contrast, and meaningful validation errors.
Test keyboard navigation, mobile widths, empty states, loading states, and failure states.
Avoid using a clickable-looking div without keyboard support and appropriate interaction semantics.
`
  },
  {
    category: "web",
    title: "JavaScript and React",
    keywords: ["javascript", "react", "jsx", "component", "props", "state", "useeffect", "usestate", "promise", "async", "await", "event handler", "npm", "vite"],
    content: `
JAVASCRIPT AND REACT
JavaScript supports dynamic browser interactions and server-side applications.
Promises represent eventual completion or failure. async/await makes asynchronous workflows easier to read. Handle rejected promises and display useful errors.
React components render UI from props and state. useState stores component state; useEffect synchronizes with external systems when used with correct dependencies.
Use stable keys when rendering lists. Avoid mutating React state directly. Validate forms and show clear loading and error states.
Vite is a frontend build and development tool. npm manages JavaScript packages and scripts.
When changing an existing app, inspect the current component and API contracts first, preserve existing handlers, and test the build before deployment.
`
  },
  {
    category: "web",
    title: "Node.js and backend development",
    keywords: ["node", "nodejs", "express", "backend", "middleware", "server", "route", "environment variable", "dotenv", "http server"],
    content: `
NODE.JS AND EXPRESS
Node.js runs JavaScript outside the browser. Express provides routing and middleware for HTTP applications.
A backend route should validate input, authenticate the caller where needed, authorize access to the requested resource, execute business logic, and return an appropriate response.
Use centralized error handling, structured logs, request size limits, timeouts, and secure configuration.
Environment variables can hold configuration and secrets on the server. Never expose private API keys in frontend bundles or commit them to source control.
For deployment, confirm the listening port, production environment variables, CORS configuration, health checks, and database connectivity.
`
  },
  {
    category: "computer-science",
    title: "Data structures and algorithms",
    keywords: ["dsa", "data structures", "algorithm", "big o", "time complexity", "space complexity", "linked list", "stack", "queue", "tree", "graph", "hash table", "binary search", "sorting"],
    content: `
DATA STRUCTURES AND ALGORITHMS
Arrays provide indexed access. Linked lists connect nodes. Stacks use last-in, first-out ordering. Queues use first-in, first-out ordering. Hash tables support average-case efficient lookup under typical assumptions. Trees model hierarchical structures; graphs model relationships.
Binary search requires sorted or otherwise suitably ordered data and runs in O(log n) time. Linear search takes O(n).
Common sorting algorithms have different time and space trade-offs. Merge sort typically runs in O(n log n) time; quicksort has average O(n log n) time but worst-case O(n²).
Big O describes asymptotic growth, not exact runtime. Consider input size, memory, worst-case behavior, and practical constraints when choosing an algorithm.
`
  },
  {
    category: "computer-science",
    title: "Operating systems",
    keywords: ["operating system", "os", "process", "thread", "deadlock", "scheduling", "virtual memory", "paging", "mutex", "semaphore", "concurrency"],
    content: `
OPERATING SYSTEMS
An operating system manages hardware, processes, memory, files, and device access.
A process has its own execution environment; threads are execution units within a process and often share its memory.
Concurrency allows tasks to make progress in overlapping periods. Parallelism executes work simultaneously.
A deadlock involves processes waiting indefinitely for resources. Classical necessary conditions are mutual exclusion, hold-and-wait, no preemption, and circular wait.
Virtual memory provides an abstraction of memory and may use paging. Synchronization tools such as mutexes and semaphores coordinate concurrent access.
Avoid race conditions by protecting shared mutable state and defining clear synchronization rules.
`
  },
  {
    category: "computer-science",
    title: "Computer networks",
    keywords: ["network", "networking", "tcp", "udp", "ip", "dns", "http", "https", "osi", "router", "client server", "tls", "port"],
    content: `
COMPUTER NETWORKS
The OSI model has physical, data link, network, transport, session, presentation, and application layers.
IP routes packets between networks. TCP provides a reliable ordered byte stream. UDP provides datagrams without TCP's built-in delivery and ordering guarantees.
DNS resolves domain names. HTTP transfers web resources. HTTPS protects HTTP traffic using TLS.
A port identifies a transport-layer endpoint on a host. Firewalls and network policies control permitted traffic.
When troubleshooting, check DNS resolution, connectivity, the target port, TLS certificates, proxy configuration, server logs, and application-level responses.
`
  },
  {
    category: "database",
    title: "Database design and SQL",
    keywords: ["database", "sql", "mysql", "postgresql", "relational", "normalization", "primary key", "foreign key", "join", "transaction", "acid", "index"],
    content: `
DATABASES AND SQL
Relational databases store structured data in tables. Primary keys identify records; foreign keys represent relationships.
SQL supports operations such as SELECT, INSERT, UPDATE, and DELETE. JOIN combines related records.
Normalization reduces unnecessary duplication and update anomalies. Indexes can speed up reads but require storage and may slow writes.
Transactions group operations and should respect the required consistency rules. ACID means Atomicity, Consistency, Isolation, and Durability.
Use parameterized queries instead of concatenating untrusted input into SQL. Plan backups, migrations, access control, and recovery testing.
`
  },
  {
    category: "database",
    title: "MongoDB and document databases",
    keywords: ["mongodb", "nosql", "document database", "collection", "bson", "mongoose", "schema", "document store"],
    content: `
MONGODB AND DOCUMENT DATABASES
MongoDB stores records as BSON documents inside collections.
Document databases can be useful when data naturally maps to documents or when related information is commonly accessed together.
Schema validation can enforce expected structure. Embedding and referencing should be chosen based on access patterns, document growth, relationships, and consistency needs.
Mongoose provides schema modeling and data access for MongoDB in Node.js applications.
Validate input, restrict access, create appropriate indexes, handle connection errors, and use backups. A successful database connection does not guarantee that application data is persisted correctly.
`
  },
  {
    category: "api",
    title: "HTTP and REST API design",
    keywords: ["api", "rest", "endpoint", "http", "request", "response", "status code", "json", "post", "get", "patch", "delete", "cors"],
    content: `
HTTP AND REST APIs
GET retrieves data, POST commonly creates resources or initiates operations, PUT replaces a resource, PATCH partially updates it, and DELETE requests removal.
Common status codes include 200 for success, 201 for creation, 400 for invalid input, 401 for unauthenticated requests, 403 for forbidden actions, 404 for missing resources, 409 for conflicts, and 500 for unexpected server failures.
Use predictable request and response schemas, input validation, authentication, authorization, pagination where needed, and clear error responses.
CORS controls which browser origins can access cross-origin responses; it is not a substitute for authentication or authorization.
`
  },
  {
    category: "security",
    title: "Cybersecurity fundamentals",
    keywords: ["security", "cybersecurity", "owasp", "xss", "csrf", "sql injection", "authentication", "authorization", "password", "api key", "secret", "vulnerability", "encryption"],
    content: `
APPLICATION SECURITY
Authentication verifies identity; authorization determines permitted actions.
Hash passwords with an appropriate password-hashing algorithm. Do not store plaintext passwords.
Use parameterized queries to reduce SQL injection risks. Encode output and follow framework guidance to reduce cross-site scripting. Assess CSRF protections when cookie-based authentication is used.
Keep secrets server-side, use least privilege, validate inputs, restrict resource access, use TLS, and avoid logging credentials or sensitive personal information.
Threat-model important features, keep dependencies updated, and test security controls. A checklist is not a substitute for a professional security assessment.
`
  },
  {
    category: "software-engineering",
    title: "Requirements and SRS documentation",
    keywords: ["requirements", "srs", "scope", "stakeholder", "functional requirement", "non functional", "acceptance criteria", "specification"],
    content: `
REQUIREMENTS ENGINEERING AND SRS
Identify stakeholders, users, problems, goals, scope, assumptions, constraints, and exclusions.
Functional requirements describe what the system should do. Non-functional requirements specify qualities or constraints such as performance, accessibility, security, reliability, and usability.
An SRS commonly includes purpose, scope, definitions, overall description, system features, interfaces, non-functional requirements, constraints, assumptions, and acceptance criteria.
Give important requirements unique identifiers. Make acceptance criteria testable and avoid vague phrases such as fast or user-friendly without measurable meaning.
Validate the specification with stakeholders before implementation.
`
  },
  {
    category: "software-engineering",
    title: "User stories and use cases",
    keywords: ["user story", "user stories", "use case", "persona", "acceptance criteria", "backlog", "feature"],
    content: `
USER STORIES AND USE CASES
A user story often follows: As a [user], I want [capability], so that [benefit].
Acceptance criteria define observable outcomes. Given/When/Then is one useful structure.
A use case describes an actor's goal and the interaction with a system, including preconditions, main flow, alternate flows, and error conditions.
Break large stories into small, testable increments. Include validation, permissions, error handling, and edge cases.
`
  },
  {
    category: "software-engineering",
    title: "Agile and Scrum",
    keywords: ["agile", "scrum", "sprint", "standup", "retrospective", "product owner", "scrum master", "velocity"],
    content: `
AGILE AND SCRUM
Scrum organizes work into Sprints that produce a usable increment.
Key accountabilities are Product Owner, Scrum Master, and Developers. Key events include Sprint Planning, Daily Scrum, Sprint Review, and Sprint Retrospective.
For a new team, select a manageable Sprint Goal, break work into small tasks, identify dependencies, and define acceptance criteria. Do not assume team velocity before gathering evidence.
The retrospective should lead to practical improvements rather than blame.
`
  },
  {
    category: "software-engineering",
    title: "Software architecture and system design",
    keywords: ["architecture", "system design", "monolith", "microservice", "layered", "component", "scalability", "design pattern", "dependency injection"],
    content: `
SOFTWARE ARCHITECTURE
Choose architecture according to requirements, team size, expected scale, security, operational complexity, and likely change.
A layered architecture separates presentation, business logic, and data access. A modular monolith is often a practical starting point for a small application. Microservices can support independent deployment but introduce network, observability, and distributed-data complexity.
Document components, responsibilities, interfaces, data flows, trust boundaries, failure modes, and trade-offs.
Use design patterns when they clarify a recurring problem; avoid complexity without a requirement that justifies it.
`
  },
  {
    category: "software-engineering",
    title: "UML and system diagrams",
    keywords: ["uml", "use case diagram", "class diagram", "sequence diagram", "activity diagram", "flowchart", "erd", "entity relationship diagram"],
    content: `
UML AND DIAGRAMS
Use-case diagrams show actors and system capabilities. Class diagrams show classes and relationships. Sequence diagrams show interactions over time. Activity diagrams show workflows and decisions. Component diagrams show software components and dependencies.
Entity-relationship diagrams model data entities and relationships.
Select the diagram based on the question being answered. Label boundaries, actors, relationships, and important decisions. Keep diagrams consistent with requirements and implementation.
`
  },
  {
    category: "software-engineering",
    title: "Testing and quality assurance",
    keywords: ["testing", "test case", "test cases", "qa", "unit test", "integration test", "system test", "regression", "edge case", "acceptance test"],
    content: `
SOFTWARE TESTING
Unit tests check small units of logic. Integration tests check interactions between components. System tests examine the complete application. Acceptance tests check business expectations.
A test case should identify its objective, preconditions, test data, steps, expected result, and actual result.
Test normal inputs, invalid inputs, boundaries, permissions, empty states, failure paths, and regressions.
Prioritize testing by risk and impact. Passing tests provide evidence of correctness but cannot prove that every defect is absent.
`
  },
  {
    category: "software-engineering",
    title: "Debugging and error analysis",
    keywords: ["debug", "debugging", "error", "exception", "stack trace", "crash", "root cause", "not working", "failed"],
    content: `
DEBUGGING
1. Reproduce the issue and record the exact steps.
2. Capture the error, stack trace, environment, expected result, and actual result.
3. Identify whether the problem is in the UI, API, database, configuration, or deployment.
4. Inspect the smallest relevant code path and compare working and failing cases.
5. Test one hypothesis at a time.
6. Add a regression test when practical.
7. Verify the fix and document the root cause.
Do not claim a fix worked without testing it. Avoid destructive changes before taking a backup.
`
  },
  {
    category: "software-engineering",
    title: "Git and GitHub collaboration",
    keywords: ["git", "github", "branch", "commit", "merge", "pull request", "conflict", "version control", "repository"],
    content: `
GIT AND TEAM COLLABORATION
Use focused commits with descriptive messages. Branches and pull requests support review and controlled integration.
Before merging, inspect the diff, run relevant tests, resolve conflicts carefully, and confirm required checks pass.
Do not commit credentials, API keys, or generated secrets. Before risky history rewrites or destructive commands, create a recovery point.
For group projects, agree on file ownership, interfaces, review responsibilities, and integration steps.
`
  },
  {
    category: "software-engineering",
    title: "Deployment and hosting",
    keywords: ["deployment", "deploy", "hosting", "production", "vercel", "hostinger", "cloudflare", "environment variable", "build", "ci cd"],
    content: `
DEPLOYMENT
Confirm the production build completes. Configure production environment variables, backend URLs, CORS, authentication, and persistent database storage.
Verify TLS, health checks, logs, error handling, migrations, backups, and recovery procedures.
Test registration, login, resource creation, updates, deletion, and authorization on the deployed URL.
A successful frontend build does not prove that the backend or database is healthy. Ephemeral filesystems may not preserve data between deployments.
`
  },
  {
    category: "software-engineering",
    title: "Project planning and estimation",
    keywords: ["estimate", "estimation", "cost", "budget", "timeline", "deadline", "effort", "milestone", "schedule", "risk"],
    content: `
PROJECT PLANNING AND ESTIMATION
Break scope into deliverables and tasks. Record assumptions, effort ranges, dependencies, owners, and risks.
Include implementation, review, testing, integration, deployment, and likely rework. Use historical data where possible and express uncertainty as ranges.
Define milestones around demonstrable outcomes. Review progress and update estimates as evidence changes.
Do not promise exact delivery dates or costs without understanding scope, team capacity, and external dependencies.
`
  },
  {
    category: "software-engineering",
    title: "Technical documentation and README",
    keywords: ["documentation", "readme", "technical writing", "api documentation", "architecture decision", "report"],
    content: `
TECHNICAL DOCUMENTATION
A README should explain purpose, features, prerequisites, installation, configuration, usage, testing, deployment, and known limitations.
Technical documents should state their audience, scope, assumptions, version, and references where appropriate.
Use examples that match the actual implementation. Mark unverified assumptions. Update documentation when behavior changes.
An architecture decision record captures context, decision, alternatives, consequences, and follow-up actions.
`
  },
  {
    category: "ai-data-science",
    title: "Artificial intelligence fundamentals",
    keywords: ["artificial intelligence", "ai", "machine learning", "ml", "deep learning", "neural network", "llm", "generative ai", "prompt engineering", "rag", "embedding"],
    content: `
AI FUNDAMENTALS
Artificial intelligence is a broad field concerned with systems performing tasks associated with intelligent behavior. Machine learning uses data to learn patterns; deep learning uses multilayer neural networks.
Generative AI produces content such as text, images, or code. Large language models generate text based on learned patterns and supplied context; they can produce plausible but incorrect information.
Retrieval-augmented generation (RAG) retrieves relevant documents and supplies them as context to a model. Embeddings represent data as numerical vectors that can support semantic similarity search.
Prompt engineering structures instructions and context. Verify generated output and avoid exposing sensitive information.
`
  },
  {
    category: "ai-data-science",
    title: "Machine learning workflow",
    keywords: ["machine learning", "dataset", "training", "prediction", "classification", "regression", "overfitting", "evaluation", "precision", "recall", "f1 score"],
    content: `
MACHINE LEARNING WORKFLOW
Define the prediction target and the decision it supports. Inspect data quality, provenance, permissions, representativeness, and missing values.
Separate training, validation, and test data to prevent leakage. Establish a baseline before adopting a complex model.
Classification predicts categories; regression predicts numerical values. Accuracy, precision, recall, F1, and other metrics answer different evaluation questions.
Tune using training and validation data and reserve test data for final evaluation. Inspect errors, relevant subgroup performance, and limitations.
A strong result on one dataset does not guarantee real-world performance or establish causality.
`
  },
  {
    category: "data-science",
    title: "Data analysis and preprocessing",
    keywords: ["data science", "pandas", "numpy", "preprocessing", "missing values", "outlier", "normalization", "standardization", "visualization", "jupyter"],
    content: `
DATA ANALYSIS AND PREPROCESSING
Inspect column types, missing values, duplicates, inconsistent categories, outliers, and target distributions before modeling.
Pandas supports tabular data processing; NumPy supports numerical arrays. Visualizations can reveal distributions, relationships, and unusual observations.
Choose imputation, scaling, encoding, and outlier treatment based on the data and modeling objective. Fit preprocessing transformations on training data only and apply the learned transformations to validation and test data to prevent leakage.
Document cleaning decisions and preserve the raw data when appropriate.
`
  },
  {
    category: "communication",
    title: "How to answer and ask questions",
    keywords: ["explain", "simple words", "beginner", "example", "step by step", "difference between", "compare", "pros and cons"],
    content: `
EXPLANATION STYLE
For beginners, define unfamiliar terms first and use a small example.
For comparison questions, compare purpose, strengths, limitations, and suitable use cases.
For implementation questions, outline prerequisites, steps, code changes, testing, and limitations.
If the question is ambiguous, ask one focused clarifying question rather than inventing details.
Separate established facts from assumptions and recommendations. Prefer actionable steps and explain why they matter.
`
  }
];

const GREETING_PATTERN =
  /^(hi|hii+|hello+|hey+|heya|howdy|good morning|good afternoon|good evening|good night|namaste|hola|thanks|thank you|thx|bye|goodbye|see you|who are you|what can you do|help)([\s,!.?]+.*)?$/i;

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been",
  "being", "to", "of", "in", "on", "for", "and", "or", "but",
  "with", "about", "from", "into", "it", "this", "that", "these",
  "those", "i", "we", "you", "they", "my", "our", "your", "can",
  "could", "should", "would", "please", "me", "how", "what", "why",
  "when", "where", "who", "which", "do", "does", "did", "tell",
  "give", "make", "create", "explain", "suggest", "want", "need"
]);

function tokenize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.-]+/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

function retrieveKnowledge(message, limit = 3) {
  const query = String(message || "").toLowerCase();
  const words = new Set(tokenize(query));

  return KNOWLEDGE_BASE
    .map(article => {
      let score = 0;

      for (const keyword of article.keywords) {
        const term = keyword.toLowerCase();

        if (query.includes(term)) {
          score += term.includes(" ") ? 5 : 3;
        }

        const parts = tokenize(term);
        for (const part of parts) {
          if (words.has(part)) score += 0.6;
        }
      }

      for (const word of tokenize(article.title)) {
        if (words.has(word)) score += 1.5;
      }

      return { article, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(result => result.article);
}

function safeContext(context = "") {
  if (typeof context === "string") return context.slice(0, 5000);

  try {
    return JSON.stringify(context).slice(0, 5000);
  } catch {
    return "";
  }
}

function greetingAnswer(role, message) {
  const q = String(message || "").trim().toLowerCase();

  if (/^(hi|hii+|hello+|hey+|heya|howdy|namaste|hola)[!. ]*$/.test(q)) {
    return `Hello! 👋 I'm your ${role}, powered by the local software knowledge base.

I can help you with:
- Programming and computer science concepts
- Requirements, SRS, user stories, and UML
- Architecture, APIs, and database design
- Testing, debugging, security, and deployment
- AI, machine learning, and data analysis
- Sprint planning, estimation, and documentation

What would you like help with today?

> Offline mode: I'm using built-in knowledge, not a live AI model.`;
  }

  if (/how are you/.test(q)) {
    return `I'm ready to help! 😊 I'm your ${role}. Ask me about software development, coding, project planning, or any topic in my local knowledge base.

> Offline mode: no live AI model was used.`;
  }

  if (/^(good morning|good afternoon|good evening|good night)[!. ]*$/.test(q)) {
    return `Good day! 👋 I'm your ${role}. What would you like to work on today?

I can help with requirements, architecture, programming, testing, and project planning.

> Offline mode: no live AI model was used.`;
  }

  if (/^(thanks|thank you|thx)[!. ]*$/.test(q)) {
    return "You're welcome! I'm glad the guidance was useful. Feel free to ask your next question.\n\n> Offline mode: no live AI model was used.";
  }

  if (/^(bye|goodbye|see you)[!. ]*$/.test(q)) {
    return "Goodbye! 👋 Good luck with your project. You can return whenever you need help with planning, coding concepts, testing, or documentation.\n\n> Offline mode: no live AI model was used.";
  }

  if (/^(who are you|what can you do|help)[?.! ]*$/.test(q)) {
    return `I'm the ${role} in your AI Software Company workspace.

I can retrieve guidance from a built-in knowledge library covering programming, computer science, software engineering, databases, APIs, testing, security, AI/ML, and project management.

I can provide structured explanations and recommendations, but offline answers are limited to stored knowledge. I cannot execute code, browse current information, or verify your environment.

Ask a specific question to get started.

> Offline mode: no live AI model was used.`;
  }

  return null;
}

const ROLE_GUIDANCE = {
  "Business Analyst":
    "Focus on users, business goals, requirements, scope, assumptions, and testable acceptance criteria.",
  "Solution Architect":
    "Focus on components, interfaces, data flow, security boundaries, scalability, and architectural trade-offs.",
  "Project Manager":
    "Focus on deliverables, priorities, owners, dependencies, milestones, and practical risk mitigation.",
  "Developer Assistant":
    "Focus on implementation steps, existing code contracts, validation, error handling, and safe testing.",
  "QA Engineer":
    "Focus on test scenarios, expected results, edge cases, regression risks, and reproducible defects."
};

function localAnswer({ role, message, context = "" }) {
  const question = String(message || "").trim();

  if (!question) {
    return "Please enter a question about your project or a software development topic.";
  }

  const greeting = greetingAnswer(role, question);
  if (greeting) return greeting;

  const articles = retrieveKnowledge(question, 3);

  if (!articles.length) {
    return `## ${role} — Offline Knowledge Base

I couldn't find sufficiently relevant information in my stored articles to answer this confidently.

To help me give you a more useful response, please share:
- The technology or concept involved.
- The expected behavior and what actually happened.
- Any relevant error message, requirement, or code snippet.

I don't want to invent an answer when the local knowledge base doesn't support one.

> Offline mode: no live AI model was used.`;
  }

  const sections = [
    `## ${role} — Offline Knowledge Base`,
    "",
    `**Question:** ${question.slice(0, 500)}`,
    "",
    "### Relevant knowledge"
  ];

  for (const article of articles) {
    sections.push(
      "",
      `#### ${article.title}`,
      article.content.trim()
    );
  }

  sections.push(
    "",
    "### Recommendation from your consultant role",
    ROLE_GUIDANCE[role] ||
      "Clarify assumptions, choose a practical approach, and verify the result.",
    "",
    "### Project context",
    safeContext(context)
      ? `The following context was supplied by the application:\n\n${safeContext(context)}`
      : "No project context was supplied. Recommendations are therefore general rather than project-specific.",
    "",
    "### Next step",
    "Apply the relevant guidance to your actual requirements and verify the result with a suitable test or review.",
    "",
    "### Limitations",
    "This answer was assembled from locally stored knowledge articles selected by keyword matching. It is not a live AI-generated response, and it may not fully address details that are not present in the selected articles.",
    "",
    "> Offline mode: local knowledge base used; no live AI model was called."
  );

  return sections.join("\n");
}

const demo = (role, message, context = "") =>
  localAnswer({ role: role || "AI consultant", message, context });

export async function askAI({
  role = "AI consultant",
  message,
  context = ""
}) {
  const key = process.env.GEMINI_API_KEY;

  // No key configured: use local knowledge without network access.
  if (!key) {
    return {
      text: demo(role, message, context),
      demo: true,
      source: "local-knowledge-base"
    };
  }

  // Preserve the existing Gemini integration.
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are the ${role} in a software development team.
Provide practical, accurate, structured answers.
Separate facts from assumptions. Do not invent project-specific details.

Relevant local knowledge:
${retrieveKnowledge(message, 3)
  .map(article => `${article.title}\n${article.content}`)
  .join("\n\n")
  .slice(0, 9000)}

Project context:
${safeContext(context)}

User request:
${String(message || "").slice(0, 8000)}`
                }
              ]
            }
          ]
        }),
        signal: AbortSignal.timeout(45000)
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error?.message || `AI provider returned ${response.status}`
      );
    }

    const text = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("\n")
      .trim();

    if (!text) {
      throw new Error("AI provider returned an empty response.");
    }

    return { text, demo: false, source: "gemini" };
  } catch (error) {
    // If Gemini is temporarily unavailable, provide local guidance
    // instead of leaving the consultant completely unusable.
    return {
      text:
        demo(role, message, context) +
        "\n\n> Note: The live AI request could not be completed. This answer uses the offline knowledge base instead.",
      demo: true,
      source: "local-knowledge-base",
      fallbackReason: error.message
    };
  }
}
