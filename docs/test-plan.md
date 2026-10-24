# Manual smoke test
1. Open `/api/health`; expect JSON with `ok: true`.
2. Register a new account and sign in.
3. Create a project; verify it appears in the sidebar and dashboard.
4. Create tasks, change statuses, reload, and verify persistence.
5. Create a bug, mark it resolved, reload, and verify persistence.
6. Generate an artifact, edit/save it, reload, and verify persistence.
7. Send a consultant prompt and verify messages are saved.
8. Sign out, register another account, and verify the first account's projects are not visible.
9. Test the mobile navigation at a narrow viewport.
10. Run `npm run build` in the frontend folder.
