# AI Software Company Simulator — Rebuilt

A local-first full-stack software delivery workspace. Includes account registration/login, projects, dashboard, AI consultant, artifact generation/editing, task workflow, and bug tracking.

## Requirements
- Node.js 20+ recommended
- npm

## Run in VS Code (PowerShell)
Open this folder in VS Code and use two terminals.

### Terminal 1 — backend
```powershell
Set-Location backend
Copy-Item .env.example .env
npm install
npm run dev
```
Backend: `http://localhost:5000` · Health check: `http://localhost:5000/api/health`

### Terminal 2 — frontend
```powershell
Set-Location frontend
Copy-Item .env.example .env
npm install
npm run dev
```
Open the local URL Vite prints, usually `http://localhost:5173`. Create an account from the sign-up screen.

## Optional live AI
Add your Gemini API key to `backend/.env` (never to the frontend):
```
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```
Restart the backend. Without a key, the consultant and document generator return clearly labelled demo responses.

## Configuration
Frontend `frontend/.env`: `VITE_API_URL=http://localhost:5000/api`
Backend `.env` values are documented in `backend/.env.example`.

## Included
- Registration/login with bcrypt password hashes and JWT
- User-scoped project CRUD
- Dashboard metrics and project completion progress
- Tasks with priority, status, create/update/delete
- Bug reports with severity, status, create/delete
- Document generation, editing, saving, and deleting
- Project-scoped AI consultant chat
- Responsive navigation and error states

## Limitations
- Local JSON persistence is suitable for a college demo, not concurrent production workloads.
- Live AI requires a valid Gemini API key and internet access.
- This is a self-contained rebuild based on the project details and snippets available in the conversation; it is not a byte-for-byte copy of the local checkout. Test it locally before merging or pushing to GitHub.
