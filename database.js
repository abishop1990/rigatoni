const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'pomodoro.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS pomodoros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal TEXT NOT NULL,
    reward_plan TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 25,
    work_log TEXT,
    break_log TEXT,
    status TEXT NOT NULL DEFAULT 'in_progress',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
  )
`);

function createPomodoro(goal, rewardPlan, durationMinutes = 25) {
  const stmt = db.prepare(`
    INSERT INTO pomodoros (goal, reward_plan, duration_minutes)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(goal, rewardPlan, durationMinutes);
  return getPomodoro(result.lastInsertRowid);
}

function logWork(id, workLog) {
  const stmt = db.prepare(`
    UPDATE pomodoros
    SET work_log = ?, status = 'work_done', completed_at = datetime('now')
    WHERE id = ?
  `);
  stmt.run(workLog, id);
  return getPomodoro(id);
}

function logBreak(id, breakLog) {
  const stmt = db.prepare(`
    UPDATE pomodoros
    SET break_log = ?, status = 'completed'
    WHERE id = ?
  `);
  stmt.run(breakLog, id);
  return getPomodoro(id);
}

function cancelPomodoro(id) {
  const stmt = db.prepare(`
    UPDATE pomodoros
    SET status = 'cancelled'
    WHERE id = ?
  `);
  stmt.run(id);
  return getPomodoro(id);
}

function getPomodoros(limit = 20) {
  const stmt = db.prepare(`
    SELECT * FROM pomodoros
    ORDER BY created_at DESC
    LIMIT ?
  `);
  return stmt.all(limit);
}

function getPomodoro(id) {
  const stmt = db.prepare(`
    SELECT * FROM pomodoros
    WHERE id = ?
  `);
  return stmt.get(id);
}

module.exports = {
  createPomodoro,
  logWork,
  logBreak,
  cancelPomodoro,
  getPomodoros,
  getPomodoro,
};
