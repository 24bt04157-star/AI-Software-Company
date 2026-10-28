# Task Board & Bug Tracker Upgrade

This update builds on the existing AI Software Company Simulator design and API routes.

## Task Board
- Drag a task card between To do, In progress and Done columns. The status is saved through the existing API.
- Add an assignee and due date when creating a task.
- Persist assignee and due date in the backend task record; existing tasks without these fields remain supported.
- Visually flag overdue, unfinished tasks.
- Keep the status dropdown as a keyboard/touch-friendly alternative to dragging.
- Retain priority, search, task counts and responsive layout.

## Bug Tracker
- Add a category (functional, UI, performance, security, accessibility, data, other).
- Add environment details such as browser, operating system or staging environment.
- Include category and environment in the stored issue description so the existing storage model remains compatible.
- Retain severity, reproduction steps, expected/actual results, search and status filters.

## Run locally
Terminal 1:
```powershell
cd backend
npm install
npm run dev
```

Terminal 2:
```powershell
cd frontend
npm install
npm run dev
```

Configure local environment variables using the provided `.env.example` files. Never commit real API keys or `.env` files.

## Validation note
The backend file passed `node --check`. A frontend production build could not be completed in the preparation environment because dependency installation timed out; run `npm run build` locally before submitting or deploying. Test drag/drop, due dates, task status persistence, bug submission and filters against the running backend.
