# AI Software Company Simulator

**Tagline:** Experience how a real software company builds software using AI.

A full-stack AWT project that simulates a software company with specialized AI roles: Business Analyst, Project Manager, Solution Architect, UI/UX Designer, Developers and QA Engineer.

## Core workflow

Login → Project Idea → Requirements → SRS → Sprint Planning → Architecture → Development Planning → QA → Dashboard

## Stack

- Frontend: HTML, CSS, Bootstrap, JavaScript
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: JWT
- AI: Gemini API or OpenAI API
- Charts: Chart.js-ready architecture
- Deployment: Vercel

## Run locally

1. Install Node.js 18+.
2. Copy `.env.example` to `.env`.
3. Add MongoDB URI and JWT secret.
4. Optionally add Gemini or OpenAI API key.
5. Run `npm install`.
6. Run `npm start`.
7. Open `http://localhost:3000`.

If no AI key is configured, the project uses structured demo-mode generators so the complete UI flow can still be demonstrated.

## Vercel

Import the repository into Vercel. Add the environment variables from `.env.example`. The included `vercel.json` routes `/api/*` to the Express serverless function and serves the frontend from `/public`.

## Team

- Ayushi Shah
- Manav Shukla
- Ziya Shukla
- Saniya Saiyed

## Repository

https://github.com/24bt04157-star/AI-Software-Company
