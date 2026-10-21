# API quick reference

Authenticated endpoints use `Authorization: Bearer <token>`.

- `GET /api/health`
- `POST /api/auth/register` `{name,email,password}`
- `POST /api/auth/login` `{email,password}`
- `GET /api/auth/me`
- `GET/POST /api/projects`
- `GET/PATCH/DELETE /api/projects/:id`
- `POST /api/projects/:id/chat` `{message}`
- `POST /api/projects/:id/artifacts/generate` `{type}`
- `PATCH /api/projects/:id/artifacts/:artifactId` `{content}`
- `POST /api/projects/:id/tasks`
- `PATCH/DELETE /api/tasks/:taskId`
- `POST /api/projects/:id/bugs`
- `PATCH/DELETE /api/bugs/:bugId`
- `GET /api/projects/:id/dashboard`

Artifact types: srs, userStories, architecture, sprintPlan, estimate, uml, testCases, apiDesign.
