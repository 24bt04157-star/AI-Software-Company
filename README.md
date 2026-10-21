# AI Software Company

A runnable full-stack AWT project: React + Vite frontend, Express backend, JWT authentication, MongoDB support, AI artifact generation, task management, bug tracking, and dashboard.

## Requirements
Node.js 18+ and npm. MongoDB and Gemini API are optional.

## Run
Terminal 1:
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
On Windows PowerShell use `Copy-Item .env.example .env`.

Terminal 2:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open http://localhost:5173.

Without `MONGODB_URI`, the backend persists data to `backend/data/db.json`. Without `GEMINI_API_KEY`, demo-mode AI generation works with clearly labelled templates. To enable live AI, add a Gemini API key to `backend/.env`. Never expose keys in frontend files or commit `.env`.

This is an academic MVP, not a production-certified autonomous app builder. AI outputs need human review; this initial build generates project artifacts but does not generate/deploy a complete application.
