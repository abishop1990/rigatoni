# Rigatoni's Pomodoro

A goal-driven Pomodoro timer with session logging. Set a goal, plan your reward, focus, then log what you accomplished. All sessions are saved to a local SQLite database so you can review your work log at end of day.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green) ![Express 5](https://img.shields.io/badge/Express-5-blue) ![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-orange)

## Features

- **Goal-driven sessions** — set what you want to accomplish and a break reward before starting
- **Work log table** — scan your completed sessions by time, goal, duration, and work log
- **Dark "Candlelit Enoteca" theme** — warm Italian aesthetic with Barolo reds and candlelight golds
- **Audio alert** — triple-beep notification when the timer completes
- **Persistent storage** — all sessions saved to a local SQLite database
- **No build step** — vanilla HTML/CSS/JS frontend, plain Node.js backend

## Quick Start

```bash
git clone https://github.com/abishop1990/rigatoni.git
cd rigatoni
npm install
npm start
```

Open [http://localhost:3456](http://localhost:3456) in your browser.

For development with auto-restart:

```bash
npm run dev
```

## How It Works

1. **Setup** — Enter your goal, break reward, and timer duration (1-90 min)
2. **Focus** — Timer counts down with a progress bar. Pulsing animation in the last 60 seconds
3. **Log work** — When the timer completes, describe what you accomplished
4. **Log break** — Record what you did during your break
5. **Review** — The Work Log table shows all your sessions for easy scanning

### Session Lifecycle

```
in_progress → work_done → completed
      ↓
  cancelled
```

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/pomodoros` | Create a new pomodoro |
| `GET` | `/api/pomodoros` | List recent sessions (default 20) |
| `GET` | `/api/pomodoros/:id` | Get a single session |
| `PATCH` | `/api/pomodoros/:id/work-log` | Log work done |
| `PATCH` | `/api/pomodoros/:id/break-log` | Log break activity |
| `PATCH` | `/api/pomodoros/:id/cancel` | Cancel a session |

## Tech Stack

- **Backend:** Node.js + Express 5
- **Database:** SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **Frontend:** Vanilla HTML, CSS, and JavaScript (no framework, no build tools)

## License

ISC
