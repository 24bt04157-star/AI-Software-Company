# Task Board & Bug Tracker — workflow upgrade

## Changes in this build

- Task board retains its three workflow states, search, priority filter, assignee, due date, overdue styling and drag-and-drop status changes.
- Task board supports CSV export of the currently filtered task list.
- Bug reports now store `steps`, `expected`, `actual`, `category`, and `environment` as separate fields rather than concatenating them into the description.
- Bug details are expandable from each issue row.
- Bug tracker supports CSV export of the currently filtered issue list.
- Backend create/update routes validate and persist structured bug fields while keeping compatibility with older bug records that only have a description.

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

## Smoke-test checklist

1. Create a task with a title, priority, assignee, due date and acceptance criteria.
2. Move it with drag-and-drop and with the status selector; refresh and confirm status persists.
3. Search tasks, filter by priority, and export the filtered result to CSV.
4. Create a bug with category, environment, steps, expected and actual result.
5. Expand its detail panel; refresh and confirm the structured fields persist.
6. Change bug status, filter by status/severity and export filtered bugs to CSV.
7. Confirm deleting a task/bug still requires confirmation.

Note: this is a student project workflow, not a substitute for a security-reviewed issue tracker. Test in the local environment before deploying.
