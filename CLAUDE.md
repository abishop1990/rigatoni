# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rigatoni's Pomodoro is a goal-driven Pomodoro timer web app. Users set a goal, a reward plan, and a duration before starting a focus session. After the timer completes, they log what they accomplished and how they spent their break. All sessions are persisted to a local SQLite database.

## Commands

- **Start server:** `npm start` (runs on http://localhost:3456)
- **Dev mode (auto-restart):** `npm run dev` (uses `node --watch`)
- **Install dependencies:** `npm install`

There are no tests, linting, or build steps configured.

## Architecture

This is a vanilla Node.js app with no build toolchain or framework beyond Express.

### Backend (2 files)

- `server.js` — Express 5 server on port 3456. Serves static files from `public/` and exposes a REST API under `/api/pomodoros`. All routes delegate to `database.js`.
- `database.js` — Data layer using `better-sqlite3` (synchronous SQLite). Creates `pomodoro.db` in the project root. Single table `pomodoros` with columns: `id`, `goal`, `reward_plan`, `duration_minutes`, `work_log`, `break_log`, `status`, `created_at`, `completed_at`.

### Frontend (3 files in `public/`)

- `index.html` — Single-page app with four view sections toggled via the `hidden` attribute: setup, timer, log-work, log-break. Plus a persistent history section.
- `app.js` — All client logic in one file. Manages view switching, countdown timer (1-second `setInterval`), Web Audio API beep on completion, and history rendering. Communicates with the backend via `fetch`.
- `styles.css` — CSS custom properties for theming (warm Italian kitchen palette). Responsive down to 360px.

### Pomodoro Lifecycle (status flow)

`in_progress` → `work_done` (after logging work) → `completed` (after logging break)

A pomodoro can also be `cancelled` from `in_progress`.

### API Endpoints

| Method | Path | Action |
|--------|------|--------|
| POST | `/api/pomodoros` | Create new pomodoro |
| GET | `/api/pomodoros` | List recent (default 20) |
| GET | `/api/pomodoros/:id` | Get single pomodoro |
| PATCH | `/api/pomodoros/:id/work-log` | Log work done |
| PATCH | `/api/pomodoros/:id/break-log` | Log break activity |
| PATCH | `/api/pomodoros/:id/cancel` | Cancel pomodoro |
