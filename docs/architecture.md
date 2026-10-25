# Architecture
- React + Vite frontend calls the API through `frontend/src/api.js`.
- Express API provides authentication, ownership-scoped projects, tasks, bugs, artifacts, and chat.
- Passwords are hashed with bcryptjs; JWT protects `/api/*` except health and auth endpoints.
- Local JSON storage keeps setup simple for the college demo.
- Optional Gemini integration runs server-side only; no key means clearly labelled demo responses.
