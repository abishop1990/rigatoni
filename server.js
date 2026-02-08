const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3456;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Create a new pomodoro
app.post('/api/pomodoros', (req, res) => {
  try {
    const { goal, rewardPlan, durationMinutes } = req.body;
    const pomodoro = db.createPomodoro(goal, rewardPlan, durationMinutes);
    res.status(201).json(pomodoro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List recent pomodoros
app.get('/api/pomodoros', (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const pomodoros = db.getPomodoros(limit);
    res.json(pomodoros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single pomodoro
app.get('/api/pomodoros/:id', (req, res) => {
  try {
    const pomodoro = db.getPomodoro(req.params.id);
    if (!pomodoro) {
      return res.status(404).json({ error: 'Pomodoro not found' });
    }
    res.json(pomodoro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Log work done after timer ends
app.patch('/api/pomodoros/:id/work-log', (req, res) => {
  try {
    const { workLog } = req.body;
    const pomodoro = db.logWork(req.params.id, workLog);
    res.json(pomodoro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Log break activity
app.patch('/api/pomodoros/:id/break-log', (req, res) => {
  try {
    const { breakLog } = req.body;
    const pomodoro = db.logBreak(req.params.id, breakLog);
    res.json(pomodoro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel a pomodoro
app.patch('/api/pomodoros/:id/cancel', (req, res) => {
  try {
    const pomodoro = db.cancelPomodoro(req.params.id);
    res.json(pomodoro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Rigatoni's Pomodoro running on http://localhost:${PORT}`);
});
