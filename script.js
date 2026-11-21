/* =========================================================
   DETERMINATION - a habit tracker styled like Undertale
   ========================================================= */

/* ---------- 1. STATE ---------- */
const STORAGE_KEY = "determination-save";

let state = {
  lv: 1,
  xp: 0,
  hp: 20,
  maxHp: 20,
  habits: [
    { id: 1, name: "Drink water", doneToday: false, streak: 0 },
    { id: 2, name: "Stretch",     doneToday: false, streak: 0 },
  ],
  nextId: 3,
  lastVisit: dayKey(),
  muted: false,
};

/* ---------- 2. DATE HELPERS ---------- */
function dayKey(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function daysBetween(a, b) {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db - da) / 86400000);
}

/* ---------- 3. SAVE / LOAD ---------- */
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

function load() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) state = Object.assign(state, JSON.parse(data));
  } catch (e) {}
}

/* ---------- 4. FLAVOR TEXT ---------- */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const TEXT = {
  welcome: [
    "You feel like you're going to have a good day.",
    "The air is filled with determination.",
    "It's a beautiful day outside. Habits are growing. You should be getting things done.",
  ],
  done: [
    "The fluffy little habit fills you with determination.",
    "You did the thing. Nice.",
    "Even the monsters are impressed.",
    "A warm feeling fills you. It's the power of consistency.",
  ],
  alreadyDone: [
    "You already did that one. Take a break, hero.",
    "That habit is already complete. Don't get greedy.",
  ],
  missed: [
    "You feel your sins crawling on your back.",
    "Your habits are looking at you with sad eyes.",
    "Reality isn't a game... but you missed some days anyway.",
  ],
  levelUp: [
    "Your LOVE increased.",
    "LEVEL UP! You feel stronger.",
  ],
  dead: [
    "You cannot give up just yet...\nStay determined!",
  ],
  added: [
    "A new habit joins your party.",
    "New habit acquired. It looks scared.",
  ],
  removed: [
    "The habit faded away...",
  ],
  empty: [
    "There are no habits here. It's quiet. Too quiet.",
  ],
  saved: [
    "File saved.",
  ],
};

/* ---------- 5. SOUND (generated, no files needed) ---------- */
let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
  }
}

function beep(freq, dur = 0.06, vol = 0.05, type = "square") {
  if (state.muted || !audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + dur);
}

function levelUpSound() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.12, 0.06), i * 100));
}
function damageSound() {
  beep(120, 0.25, 0.08, "sawtooth");
}
function saveSound() {
  [880, 1175].forEach((f, i) => setTimeout(() => beep(f, 0.1, 0.05), i * 90));
}

/* ---------- 6. TYPEWRITER TEXT ---------- */
const textEl = document.getElementById("text");
let typeTimer = null;

function say(message, speed = 28) {
  clearInterval(typeTimer);
  const full = "* " + message;
  textEl.textContent = "";
  let i = 0;
  typeTimer = setInterval(() => {
    const ch = full[i];
    textEl.textContent += ch;
    if (ch !== " " && ch !== "\n") beep(300 + Math.random() * 60, 0.04, 0.03);
    i++;
    if (i >= full.length) clearInterval(typeTimer);
  }, speed);
}

/* ---------- 7. THE SOUL (pixel heart drawn on a tiny canvas) ---------- */
const soulCanvas = document.getElementById("soul");
const soulCtx = soulCanvas.getContext("2d");

const HEART = [
  "01100110",
  "11111111",
  "11111111",
  "11111111",
  "01111110",
  "00111100",
  "00011000",
];

function drawSoul(color) {
  soulCtx.clearRect(0, 0, 8, 7);
  soulCtx.fillStyle = color;
  HEART.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === "1") soulCtx.fillRect(x, y, 1, 1);
    });
  });
}

/* ---------- 8. RENDER ---------- */
const habitsEl = document.getElementById("habits");

function render() {
  // status
  document.getElementById("lv").textContent = `LV ${state.lv}`;
  const hpPct = Math.max(0, (state.hp / state.maxHp) * 100);
  document.getElementById("hpfill").style.width = hpPct + "%";
  document.getElementById("hptext").textContent = `${state.hp} / ${state.maxHp}`;

  const xpNeeded = state.lv * 50;
  document.getElementById("xpfill").style.width = (state.xp / xpNeeded) * 100 + "%";
  document.getElementById("xptext").textContent = `${state.xp} / ${xpNeeded}`;

  // soul color changes with HP
  drawSoul(hpPct > 50 ? "#ff0000" : hpPct > 25 ? "#ff7f27" : "#a000a0");

  // sound button
  document.getElementById("mute-btn").textContent = state.muted ? "SOUND: OFF" : "SOUND: ON";

  // habits
  habitsEl.innerHTML = "";
  state.habits.forEach((h) => {
    const li = document.createElement("li");
    if (h.doneToday) li.classList.add("done");

    const check = document.createElement("button");
    check.className = "check";
    check.textContent = h.doneToday ? "x" : "";
    check.setAttribute("aria-label", "Complete " + h.name);

    const name = document.createElement("span");
    name.className = "habit-name";
    name.textContent = h.name;

    const streak = document.createElement("span");
    streak.className = "streak";
    streak.textContent = h.streak > 0 ? `${h.streak}d` : "";

    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "X";
    del.setAttribute("aria-label", "Delete " + h.name);

    li.append(check, name, streak, del);

    // clicking anywhere on the row completes the habit
    li.addEventListener("click", (e) => {
      if (e.target === del) return;
      completeHabit(h.id);
    });
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      removeHabit(h.id);
    });

    habitsEl.appendChild(li);
  });
}

/* ---------- 9. GAME LOGIC ---------- */
function completeHabit(id) {
  ensureAudio();
  const h = state.habits.find((x) => x.id === id);
  if (!h) return;

  if (h.doneToday) {
    say(pick(TEXT.alreadyDone));
    return;
  }

  h.doneToday = true;
  h.streak += 1;

  const gained = 10 + Math.min(h.streak, 5) * 2;   // streak bonus
  state.xp += gained;
  beep(660, 0.1, 0.06);

  let msg = pick(TEXT.done) + `\n  (+${gained} XP)`;

  // level up?
  while (state.xp >= state.lv * 50) {
    state.xp -= state.lv * 50;
    state.lv += 1;
    state.maxHp += 4;
    state.hp = state.maxHp;
    msg = pick(TEXT.levelUp) + `\n  You are now LV ${state.lv}. HP maxed out!`;
    flash();
    levelUpSound();
  }

  render();
  save();
  say(msg);
}

function addHabit(name) {
  ensureAudio();
  name = name.trim();
  if (!name) return;
  state.habits.push({ id: state.nextId++, name, doneToday: false, streak: 0 });
  beep(520, 0.08, 0.05);
  render();
  save();
  say(pick(TEXT.added));
}

function removeHabit(id) {
  ensureAudio();
  state.habits = state.habits.filter((h) => h.id !== id);
  render();
  save();
  say(state.habits.length ? pick(TEXT.removed) : pick(TEXT.empty));
}

/* Runs when you open the app: checks if a new day started */
function newDayCheck() {
  const today = dayKey();
  const gap = daysBetween(state.lastVisit, today);
  if (gap <= 0) return null;

  let damage = 0;
  state.habits.forEach((h) => {
    // yesterday's habit counts as missed if it wasn't done,
    // plus every extra day you were away
    const missedDays = (h.doneToday ? 0 : 1) + (gap - 1);
    if (missedDays > 0) {
      damage += missedDays * 2;
      h.streak = 0;
    }
    h.doneToday = false;
  });

  damage = Math.min(damage, 30);
  state.lastVisit = today;

  if (damage > 0) {
    state.hp -= damage;
    if (state.hp <= 0) {
      // gentle "death": no real punishment, just a fresh start
      state.hp = state.maxHp;
      state.xp = 0;
      return { type: "dead", damage };
    }
    return { type: "missed", damage };
  }
  return { type: "ok" };
}

/* ---------- 10. EFFECTS ---------- */
function flash() {
  document.body.classList.remove("flash");
  void document.body.offsetWidth;        // restart animation
  document.body.classList.add("flash");
}

function shake() {
  const g = document.getElementById("game");
  g.classList.remove("shake");
  void g.offsetWidth;
  g.classList.add("shake");
}

/* ---------- 11. EVENTS ---------- */
document.getElementById("add-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("new-habit");
  addHabit(input.value);
  input.value = "";
});

document.getElementById("save-btn").addEventListener("click", () => {
  ensureAudio();
  save();
  saveSound();
  say(pick(TEXT.saved));
});

document.getElementById("mute-btn").addEventListener("click", () => {
  ensureAudio();
  state.muted = !state.muted;
  save();
  render();
});

/* ---------- 12. START ---------- */
load();
const result = newDayCheck();
render();
save();

if (result && result.type === "dead") {
  shake();
  setTimeout(() => say(pick(TEXT.dead)), 300);
} else if (result && result.type === "missed") {
  shake();
  setTimeout(() => say(pick(TEXT.missed) + `\n  (-${result.damage} HP)`), 300);
} else {
  // browsers block sound until the first click, so the opening text is silent-safe
  setTimeout(() => say(pick(TEXT.welcome)), 300);
}
