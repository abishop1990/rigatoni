// ---------------------------------------------------------------------------
// Rigatoni's Pomodoro -- Frontend Application
// ---------------------------------------------------------------------------

const state = {
  currentPomodoro: null,
  timerInterval: null,
  timeRemaining: 0,
  totalDuration: 0,
};

// ---- DOM references -------------------------------------------------------

const views = {
  setup: document.getElementById('setup-view'),
  timer: document.getElementById('timer-view'),
  'log-work': document.getElementById('log-work-view'),
  'log-break': document.getElementById('log-break-view'),
};

const goalInput = document.getElementById('goal-input');
const rewardInput = document.getElementById('reward-input');
const durationInput = document.getElementById('duration-input');
const startBtn = document.getElementById('start-btn');

const currentGoal = document.getElementById('current-goal');
const timerDisplay = document.getElementById('timer-display');
const progressBar = document.getElementById('progress-bar');
const cancelBtn = document.getElementById('cancel-btn');

const logWorkGoal = document.getElementById('log-work-goal');
const workLogInput = document.getElementById('work-log-input');
const saveWorkBtn = document.getElementById('save-work-btn');

const logBreakReward = document.getElementById('log-break-reward');
const breakLogInput = document.getElementById('break-log-input');
const saveBreakBtn = document.getElementById('save-break-btn');

const historyList = document.getElementById('history-list');

// ---- View management ------------------------------------------------------

const showView = (viewName) => {
  Object.entries(views).forEach(([name, el]) => {
    if (name === viewName) {
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  });
};

// ---- Timer helpers --------------------------------------------------------

const formatTime = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const updateTimerUI = () => {
  const display = formatTime(state.timeRemaining);
  timerDisplay.textContent = display;
  document.title = `${display} - Rigatoni's Pomodoro`;

  const elapsed = state.totalDuration - state.timeRemaining;
  const pct = state.totalDuration > 0 ? (elapsed / state.totalDuration) * 100 : 0;
  progressBar.style.width = `${pct}%`;
};

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);

    // Second beep
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1100, ctx.currentTime + 0.6);
    gain2.gain.setValueAtTime(0.5, ctx.currentTime + 0.6);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.1);
    osc2.start(ctx.currentTime + 0.6);
    osc2.stop(ctx.currentTime + 1.1);

    // Third beep
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(880, ctx.currentTime + 1.2);
    gain3.gain.setValueAtTime(0.5, ctx.currentTime + 1.2);
    gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.9);
    osc3.start(ctx.currentTime + 1.2);
    osc3.stop(ctx.currentTime + 1.9);
  } catch (e) {
    // AudioContext not available; silently ignore
  }
};

const startTimer = (durationSeconds) => {
  state.totalDuration = durationSeconds;
  state.timeRemaining = durationSeconds;
  updateTimerUI();

  state.timerInterval = setInterval(() => {
    state.timeRemaining -= 1;
    updateTimerUI();

    // Pulse animation in last 60 seconds
    if (state.timeRemaining <= 60 && state.timeRemaining > 0) {
      timerDisplay.classList.add('pulse');
    }

    if (state.timeRemaining <= 0) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
      timerDisplay.classList.remove('pulse');
      document.title = "Time's up! - Rigatoni's Pomodoro";
      playBeep();
      onTimerComplete();
    }
  }, 1000);
};

const stopTimer = () => {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  document.title = "Rigatoni's Pomodoro";
};

// ---- Timer completion -----------------------------------------------------

const onTimerComplete = () => {
  logWorkGoal.textContent = state.currentPomodoro.goal;
  workLogInput.value = '';
  showView('log-work');
};

// ---- API helpers ----------------------------------------------------------

const api = async (method, path, body) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(path, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
};

// ---- History rendering ----------------------------------------------------

const formatDateTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const hhmm = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });

  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return `Today ${hhmm}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday ${hhmm}`;

  const monthDay = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${monthDay} ${hhmm}`;
};

const statusLabel = (status) => {
  const labels = {
    completed: 'Completed',
    cancelled: 'Cancelled',
    in_progress: 'In Progress',
    work_done: 'Work Done',
  };
  return labels[status] || status;
};

const statusBadge = (status) => {
  return `<span class="status-badge ${status}">${statusLabel(status)}</span>`;
};

const renderHistory = (pomodoros) => {
  if (!pomodoros || pomodoros.length === 0) {
    historyList.innerHTML = '<div class="empty-history"><p>No sessions yet. Start your first Pomodoro!</p></div>';
    return;
  }

  const rows = pomodoros
    .map((p) => `
      <tr>
        <td class="col-time">${formatDateTime(p.created_at)}</td>
        <td class="col-goal">${escapeHtml(p.goal)}</td>
        <td class="col-dur">${p.duration_minutes}m</td>
        <td class="col-worklog">${escapeHtml(p.work_log)}</td>
        <td class="col-status">${statusBadge(p.status)}</td>
      </tr>`)
    .join('');

  historyList.innerHTML = `
    <table class="work-log-table">
      <thead>
        <tr>
          <th class="col-time">Time</th>
          <th class="col-goal">Goal</th>
          <th class="col-dur">Dur.</th>
          <th class="col-worklog">Work Log</th>
          <th class="col-status">Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
};

const escapeHtml = (str) => {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

const fetchAndRenderHistory = async () => {
  try {
    const pomodoros = await api('GET', '/api/pomodoros');
    renderHistory(pomodoros);
  } catch (e) {
    historyList.innerHTML = '<div class="empty-history"><p>Could not load history.</p></div>';
  }
};

// ---- Event handlers -------------------------------------------------------

startBtn.addEventListener('click', async () => {
  const goal = goalInput.value.trim();
  const rewardPlan = rewardInput.value.trim();
  const durationMinutes = parseInt(durationInput.value, 10);

  if (!goal || !rewardPlan) return;
  if (isNaN(durationMinutes) || durationMinutes < 1 || durationMinutes > 90) return;

  try {
    startBtn.disabled = true;
    startBtn.textContent = 'Starting...';

    const pomodoro = await api('POST', '/api/pomodoros', {
      goal,
      rewardPlan,
      durationMinutes,
    });

    state.currentPomodoro = pomodoro;

    currentGoal.textContent = pomodoro.goal;
    progressBar.style.width = '0%';

    showView('timer');
    startTimer(durationMinutes * 60);
  } catch (e) {
    alert(`Failed to start pomodoro: ${e.message}`);
  } finally {
    startBtn.disabled = false;
    startBtn.textContent = 'Start Pomodoro';
  }
});

cancelBtn.addEventListener('click', async () => {
  if (!state.currentPomodoro) return;

  try {
    cancelBtn.disabled = true;
    await api('PATCH', `/api/pomodoros/${state.currentPomodoro.id}/cancel`);
  } catch (e) {
    // Continue even if cancel request fails
  } finally {
    cancelBtn.disabled = false;
  }

  stopTimer();
  state.currentPomodoro = null;
  await fetchAndRenderHistory();
  showView('setup');
});

saveWorkBtn.addEventListener('click', async () => {
  const workLog = workLogInput.value.trim();
  if (!workLog) return;
  if (!state.currentPomodoro) return;

  try {
    saveWorkBtn.disabled = true;
    saveWorkBtn.textContent = 'Saving...';

    await api('PATCH', `/api/pomodoros/${state.currentPomodoro.id}/work-log`, {
      workLog,
    });

    logBreakReward.textContent = state.currentPomodoro.reward_plan;
    breakLogInput.value = '';
    showView('log-break');
  } catch (e) {
    alert(`Failed to save work log: ${e.message}`);
  } finally {
    saveWorkBtn.disabled = false;
    saveWorkBtn.textContent = 'Save & Start Break';
  }
});

saveBreakBtn.addEventListener('click', async () => {
  const breakLog = breakLogInput.value.trim();
  if (!breakLog) return;
  if (!state.currentPomodoro) return;

  try {
    saveBreakBtn.disabled = true;
    saveBreakBtn.textContent = 'Saving...';

    await api('PATCH', `/api/pomodoros/${state.currentPomodoro.id}/break-log`, {
      breakLog,
    });

    state.currentPomodoro = null;
    document.title = "Rigatoni's Pomodoro";

    // Clear the setup form for the next session
    goalInput.value = '';
    rewardInput.value = '';
    durationInput.value = '25';

    await fetchAndRenderHistory();
    showView('setup');
  } catch (e) {
    alert(`Failed to save break log: ${e.message}`);
  } finally {
    saveBreakBtn.disabled = false;
    saveBreakBtn.textContent = 'Complete & Start New';
  }
});

// ---- Initialisation -------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  showView('setup');
  fetchAndRenderHistory();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
});
