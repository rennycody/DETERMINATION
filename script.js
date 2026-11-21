/* =========================================================
   DETERMINATION v2 - a habit tracker styled like a retro RPG
   NEW in v2: pet monster, focus timer + eggs, shop, trophies,
   streak bar, animated backgrounds, rename, installable app.
   ========================================================= */

const STORAGE_KEY = "determination-save";

/* =========================================================
   1. GAME DATA  (edit these lists to add your own content!)
   ========================================================= */
const EGG_GOAL = 60;           // focus minutes needed to hatch one egg
const MAX_NAME = 10;           // max characters in your name

/* ---- Monsters: 12 wide x 10 tall pixel grids ----
   . = empty   b = body color   d = darker   l = lighter
   w = white   k = black        p = pink cheek
   headTop = which row the head starts on (hats sit there)  */
const MONSTERS = [
  {
    id: "blobby", name: "BLOBBY", cost: 0, color: "#4cd9a0", headTop: 1,
    desc: "A squishy starter.",
    lines: ["BLOBBY wiggles happily.", "BLOBBY goes bloop.", "BLOBBY wobbles around you."],
    grid: [
      "............",
      "....bbbb....",
      "..bbbbbbbb..",
      ".bbbbbbbbbb.",
      ".bbwkbbwkbb.",
      ".bpbbbbbbpb.",
      ".bbbbkkbbbb.",
      ".dbbbbbbbbd.",
      "..dddddddd..",
      "............",
    ],
  },
  {
    id: "ghosty", name: "GHOSTY", cost: 120, color: "#cfe8ff", headTop: 1,
    desc: "Polite and floaty.",
    lines: ["GHOSTY floats in a happy circle.", "GHOSTY says 'boo' very politely.", "GHOSTY phases through your hand. It tickles."],
    grid: [
      "............",
      "....bbbb....",
      "...bbbbbb...",
      "..bbbbbbbb..",
      "..bwkbbwkb..",
      "..bpbbbbpb..",
      "..bbbkkbbb..",
      "..bbbbbbbb..",
      "..bbbbbbbb..",
      "..b.bb.bb.b.",
    ],
  },
  {
    id: "pebble", name: "PEBBLE", cost: 140, color: "#9a9a9a", headTop: 1,
    desc: "Sleepy and sturdy.",
    lines: ["PEBBLE sits there. It seems happy.", "PEBBLE rolls over slightly.", "PEBBLE makes a tiny rumble."],
    grid: [
      "............",
      "..bbbbbbbb..",
      ".bbbbbbbbbb.",
      ".bbbbbbbbbb.",
      ".bkkbbbbkkb.",
      ".bbbbbbbbbb.",
      ".bdbbbbbbdb.",
      ".bbbbkkbbbb.",
      ".bbbbbbbbbb.",
      "..dd....dd..",
    ],
  },
  {
    id: "bunbun", name: "BUNBUN", cost: 160, color: "#f0b0d0", headTop: 2,
    desc: "Very long ears.",
    lines: ["BUNBUN twitches its ears.", "BUNBUN does a tiny hop.", "BUNBUN nuzzles your hand."],
    grid: [
      "...bb..bb...",
      "...bb..bb...",
      "..bbbbbbbb..",
      "..bbbbbbbb..",
      "..bwkbbwkb..",
      "..bpbbbbpb..",
      "..bbbkkbbb..",
      "..bbbbbbbb..",
      "...bbbbbb...",
      "...bb..bb...",
    ],
  },
  {
    id: "fluttr", name: "FLUTTR", cost: 200, color: "#b79cff", headTop: 1,
    desc: "Glows when happy.",
    lines: ["FLUTTR flaps in a little circle.", "FLUTTR lands on your nose.", "FLUTTR glows softly."],
    grid: [
      "...k....k...",
      "....bbbb....",
      "....kbbk....",
      ".ll.bbbb.ll.",
      "lllldbbdllll",
      "lldlbbbbldll",
      ".lllbbbblll.",
      "..ll.bb.ll..",
      "....bbbb....",
      ".....bb.....",
    ],
  },
];

/* ---- Hats: 6 wide x 3 tall. Letters map to the colors in c ---- */
const HATS = [
  { id: "none",   name: "NO HAT",     cost: 0,   grid: null },
  { id: "bow",    name: "BOW",        cost: 30,  grid: ["rr..rr", "rrKKrr", "rr..rr"], c: { r: "#ff5fa2", K: "#a0205a" } },
  { id: "wizard", name: "WIZARD HAT", cost: 80,  grid: ["..pp..", ".pppp.", "PPPPPP"], c: { p: "#8a4bff", P: "#5a2db5" } },
  { id: "halo",   name: "HALO",       cost: 100, grid: [".yyyy.", "y....y", "......"], c: { y: "#ffe14d" } },
  { id: "crown",  name: "CROWN",      cost: 120, grid: ["y.yy.y", "yyyyyy", "yoyyoy"], c: { y: "#ffd700", o: "#ff7f27" } },
];

/* ---- Body colors (hex: null = the monster's own color) ---- */
const COLORS = [
  { id: "default", name: "ORIGINAL", cost: 0,  hex: null },
  { id: "blue",    name: "BLUE",     cost: 0,  hex: "#4aa3ff" },
  { id: "green",   name: "GREEN",    cost: 0,  hex: "#4cd964" },
  { id: "pink",    name: "PINK",     cost: 25, hex: "#ff7ac8" },
  { id: "red",     name: "RED",      cost: 25, hex: "#e04848" },
  { id: "orange",  name: "ORANGE",   cost: 25, hex: "#ff9a3c" },
  { id: "purple",  name: "PURPLE",   cost: 25, hex: "#9b6bff" },
  { id: "shadow",  name: "SHADOW",   cost: 40, hex: "#55557a" },
  { id: "gold",    name: "GOLD",     cost: 60, hex: "#ffd23f" },
];

/* ---- Animated backgrounds (they float BEHIND the game, black stays black) ---- */
const BGS = [
  { id: "none",      name: "PLAIN BLACK", cost: 0,  desc: "No animation." },
  { id: "stars",     name: "STAR FIELD",  cost: 0,  desc: "Twinkling stars. Free!" },
  { id: "snow",      name: "SNOWFALL",    cost: 40, desc: "Soft pixel snow." },
  { id: "embers",    name: "EMBERS",      cost: 40, desc: "Warm sparks rising." },
  { id: "fireflies", name: "FIREFLIES",   cost: 60, desc: "Glowing wanderers." },
];

/* ---- Shop items ---- */
const ITEMS = [
  { id: "freeze", name: "STREAK FREEZE", cost: 60, desc: "Auto-used when you miss days. No HP loss, streak saved." },
  { id: "snack",  name: "HEALING SNACK", cost: 15, desc: "Restores 10 HP when you use it." },
];

/* ---- Trophies ---- */
const ACHIEVEMENTS = [
  { id: "first",     name: "FIRST STEP",       desc: "Complete a habit.",                 reward: 10, test: (s) => s.stats.habits >= 1 },
  { id: "ten",       name: "WARMING UP",       desc: "Complete 10 habits.",               reward: 25, test: (s) => s.stats.habits >= 10 },
  { id: "fifty",     name: "DEDICATED",        desc: "Complete 50 habits.",               reward: 60, test: (s) => s.stats.habits >= 50 },
  { id: "clean",     name: "CLEAN SWEEP",      desc: "Finish 3+ habits in one day.",      reward: 25, test: (s) => s.stats.cleanSweep },
  { id: "streak3",   name: "ON A ROLL",        desc: "Reach a 3 day streak.",             reward: 20, test: () => globalStreak() >= 3 },
  { id: "streak7",   name: "WEEK WARRIOR",     desc: "Reach a 7 day streak.",             reward: 50, test: () => globalStreak() >= 7 },
  { id: "lv3",       name: "GETTING STRONGER", desc: "Reach LV 3.",                       reward: 20, test: (s) => s.lv >= 3 },
  { id: "lv5",       name: "VETERAN",          desc: "Reach LV 5.",                       reward: 40, test: (s) => s.lv >= 5 },
  { id: "focus1",    name: "DEEP BREATH",      desc: "Finish a focus session.",           reward: 15, test: (s) => s.stats.sessions >= 1 },
  { id: "focus120",  name: "ZEN MASTER",       desc: "Focus for 120 minutes total.",      reward: 40, test: (s) => s.stats.focusMin >= 120 },
  { id: "hatch",     name: "EGG-CELLENT",      desc: "Hatch your first egg.",             reward: 30, test: (s) => s.stats.hatched >= 1 },
  { id: "collector", name: "COLLECTOR",        desc: "Own 3 monsters.",                   reward: 50, test: (s) => s.owned.monsters.length >= 3 },
  { id: "shopper",   name: "FIRST PURCHASE",   desc: "Buy something in the shop.",        reward: 10, test: (s) => s.stats.purchases >= 1 },
  { id: "stylish",   name: "STYLISH",          desc: "Put a hat on your monster.",        reward: 15, test: (s) => s.equip.hat !== "none" },
  { id: "named",     name: "NICE TO MEET YOU", desc: "Rename yourself.",                  reward: 5,  test: (s) => s.stats.renamed },
  { id: "revived",   name: "STAY DETERMINED",  desc: "Lose all your HP and get back up.", reward: 10, test: (s) => s.stats.revived >= 1 },
];

/* =========================================================
   2. STATE
   ========================================================= */
let state = {
  name: "FRIEND",
  lv: 1,
  xp: 0,
  hp: 20,
  maxHp: 20,
  coins: 0,                       // SPARKS
  habits: [
    { id: 1, name: "Drink water", doneToday: false, streak: 0 },
    { id: 2, name: "Stretch",     doneToday: false, streak: 0 },
  ],
  nextId: 3,
  lastVisit: dayKey(),
  muted: false,

  history: {},                    // { "2026-11-22": 3 }  habits done that day
  frozen: {},                     // days saved by a streak freeze
  eggMinutes: 0,                  // progress toward the next egg
  focus: null,                    // { endAt, total } while a timer runs

  owned: {
    monsters: ["blobby"],
    hats: ["none"],
    colors: ["default", "blue", "green"],
    bgs: ["none", "stars"],
  },
  equip: { monster: "blobby", hat: "none", color: "default", bg: "none" },
  items: { freeze: 0, snack: 0 },
  ach: {},                        // unlocked trophies
  stats: {
    habits: 0, focusMin: 0, sessions: 0, hatched: 0, purchases: 0,
    renamed: false, earned: 0, revived: 0, cleanSweep: false,
  },
};

/* ---------- date helpers ---------- */
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

/* ---------- save / load ---------- */
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

// Merges a saved game into the defaults so old saves still work after updates
function merge(def, saved) {
  if (def === null || typeof def !== "object" || Array.isArray(def)) {
    return saved === undefined || saved === null ? def : saved;
  }
  const out = {};
  for (const k in def) out[k] = merge(def[k], saved ? saved[k] : undefined);
  if (saved && typeof saved === "object") {
    for (const k in saved) if (!(k in def)) out[k] = saved[k];
  }
  return out;
}

function load() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) state = merge(state, JSON.parse(data));
  } catch (e) {}
}

/* =========================================================
   3. TEXT
   ========================================================= */
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
  levelUp: ["Your LOVE increased.", "LEVEL UP! You feel stronger."],
  dead: ["You cannot give up just yet...\nStay determined!"],
  added: ["A new habit joins your party.", "New habit acquired. It looks scared."],
  removed: ["The habit faded away..."],
  empty: ["There are no habits here. It's quiet. Too quiet."],
  saved: ["File saved."],
};

/* =========================================================
   4. SOUND (generated in code, no files needed)
   ========================================================= */
let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
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

function melody(notes, gap = 100, dur = 0.12, vol = 0.06) {
  notes.forEach((f, i) => setTimeout(() => beep(f, dur, vol), i * gap));
}

const levelUpSound = () => melody([523, 659, 784, 1047]);
const saveSound    = () => melody([880, 1175], 90, 0.1, 0.05);
const damageSound  = () => beep(120, 0.25, 0.08, "sawtooth");
const coinSound    = () => melody([988, 1319], 70, 0.1, 0.05);
const errorSound   = () => beep(150, 0.15, 0.07);
const trophySound  = () => melody([784, 988, 1175, 1568], 90);
const hatchSound   = () => melody([392, 523, 659, 784, 1047, 1319], 110);
const chimeSound   = () => melody([784, 1047, 1319], 120);

/* =========================================================
   5. TYPEWRITER TEXT
   ========================================================= */
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

/* =========================================================
   6. PIXEL DRAWING (soul heart, monsters, hats, sprout, egg)
   ========================================================= */
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

/* ---- color helpers: make a darker / lighter version of a hex color ---- */
function shade(hex, f) {
  const h = hex.replace("#", "");
  const ch = (i) => parseInt(h.slice(i, i + 2), 16);
  const m = (v) => Math.max(0, Math.min(255, Math.round(f > 1 ? v + (255 - v) * (f - 1) : v * f)));
  return `rgb(${m(ch(0))},${m(ch(2))},${m(ch(4))})`;
}

const getMonster = (id) => MONSTERS.find((m) => m.id === id) || MONSTERS[0];

/* ---- draws any monster (with color + hat) onto a 12x12 canvas ---- */
function drawMonster(canvas, monsterId, colorId, hatId) {
  const m = getMonster(monsterId);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 12, 12);

  const colorDef = COLORS.find((c) => c.id === colorId);
  const base = colorDef && colorDef.hex ? colorDef.hex : m.color;
  const pal = {
    b: base, d: shade(base, 0.6), l: shade(base, 1.35),
    w: "#ffffff", k: "#111111", p: "#ff8fb0",
  };

  m.grid.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === ".") return;
      ctx.fillStyle = pal[ch];
      ctx.fillRect(x, y + 2, 1, 1);        // +2 leaves room on top for hats
    });
  });

  const hat = HATS.find((h) => h.id === hatId);
  if (hat && hat.grid) {
    hat.grid.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (ch === ".") return;
        ctx.fillStyle = hat.c[ch];
        ctx.fillRect(3 + x, m.headTop + y, 1, 1);
      });
    });
  }
}

/* ---- the focus sprout (grows as the timer runs) ---- */
const sproutCtx = document.getElementById("sprout").getContext("2d");

function drawSprout(p, mode) {
  const c = sproutCtx;
  c.clearRect(0, 0, 16, 16);

  // soil
  c.fillStyle = "#6b3f1d"; c.fillRect(2, 13, 12, 3);
  c.fillStyle = "#8a5a2b"; c.fillRect(2, 13, 12, 1);

  const wilt = mode === "wilt";
  const bloom = mode === "bloom";
  let h = bloom ? 9 : Math.floor(p * 9);
  if (wilt) h = 3;

  if (h === 0) {                       // just a seed
    c.fillStyle = "#c9a063";
    c.fillRect(8, 12, 1, 1);
    return;
  }

  const g  = wilt ? "#9a8a3a" : "#3ddc5a";
  const gd = wilt ? "#6b5e22" : "#22a83c";

  c.fillStyle = g;
  for (let i = 0; i < h; i++) c.fillRect(8, 12 - i, 1, 1);

  c.fillStyle = gd;
  if (wilt) {
    c.fillRect(6, 11, 2, 1); c.fillRect(5, 12, 1, 1);
    c.fillRect(9, 11, 2, 1); c.fillRect(11, 12, 1, 1);
    return;
  }
  if (h >= 3) c.fillRect(6, 10, 2, 1);
  if (h >= 5) c.fillRect(9, 8, 2, 1);
  if (h >= 7) { c.fillRect(5, 6, 3, 1); c.fillRect(9, 5, 3, 1); }

  if (bloom) {                         // flower on top
    c.fillStyle = "#ff7ac8";
    c.fillRect(7, 2, 1, 1); c.fillRect(9, 2, 1, 1);
    c.fillRect(8, 1, 1, 1); c.fillRect(8, 3, 1, 1);
    c.fillStyle = "#ffe14d";
    c.fillRect(8, 2, 1, 1);
  }
}

/* ---- the egg (cracks appear as you get closer to hatching) ---- */
const eggCtx = document.getElementById("egg").getContext("2d");
const EGG = [
  "...eeee...",
  "..eeeeee..",
  ".eeeeeeee.",
  ".eeeeeeee.",
  "eeeeeeeeee",
  "eeeeeeeeee",
  "eeeeeeeeee",
  "eeeeeeeeee",
  ".eeeeeeee.",
  ".eeeeeeee.",
  "..eeeeee..",
  "...eeee...",
];

function drawEgg(ratio) {
  const c = eggCtx;
  c.clearRect(0, 0, 10, 12);
  c.fillStyle = "#f4ecd2";
  EGG.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === "e") c.fillRect(x, y, 1, 1); }));
  c.fillStyle = "#8ec7ff";
  [[3, 5], [6, 7], [5, 3]].forEach(([x, y]) => c.fillRect(x, y, 1, 1));   // spots

  c.fillStyle = "#3a2a1a";
  const cracks = [];
  if (ratio >= 0.33) cracks.push([5, 1], [4, 2], [5, 3]);
  if (ratio >= 0.66) cracks.push([4, 4], [5, 5], [4, 6]);
  if (ratio >= 0.9)  cracks.push([5, 7], [6, 8], [5, 9]);
  cracks.forEach(([x, y]) => c.fillRect(x, y, 1, 1));
}

/* =========================================================
   7. ANIMATED BACKGROUNDS (extra layer, doesn't change the black)
   ========================================================= */
const bgCanvas = document.getElementById("bg");
const bgCtx = bgCanvas.getContext("2d");
const PX = 4;                                   // pixel size of particles
const reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
let particles = [];
let bgRaf = null;
let bgMode = "none";

function makeParticle(mode, fresh) {
  const w = bgCanvas.width, h = bgCanvas.height, r = Math.random;
  const p = { x: r() * w, y: r() * h, vx: 0, vy: 0, s: PX, t: r() * 6.28, sp: 0.02 + r() * 0.03, c: "#ffffff" };
  if (mode === "stars") {
    p.s = r() < 0.2 ? PX * 1.5 : PX;
    p.c = r() < 0.15 ? "#ffe98a" : "#ffffff";
  } else if (mode === "snow") {
    p.y = fresh ? r() * h : -8;
    p.vy = 0.5 + r();
    p.s = r() < 0.3 ? PX * 1.5 : PX;
  } else if (mode === "embers") {
    p.y = fresh ? r() * h : h + 8;
    p.vy = -(0.4 + r());
    p.c = r() < 0.5 ? "#ff7f27" : "#ffd23f";
  } else if (mode === "fireflies") {
    p.vx = (r() - 0.5) * 0.5;
    p.vy = (r() - 0.5) * 0.5;
    p.c = "#d7ff6a";
  }
  return p;
}

function bgFrame() {
  const w = bgCanvas.width, h = bgCanvas.height;
  bgCtx.clearRect(0, 0, w, h);
  for (const p of particles) {
    p.t += p.sp;
    let a = 1;
    if (bgMode === "stars") {
      a = 0.25 + 0.75 * Math.abs(Math.sin(p.t));
    } else if (bgMode === "snow") {
      p.y += p.vy; p.x += Math.sin(p.t) * 0.4;
      if (p.y > h + 8) { p.y = -8; p.x = Math.random() * w; }
      a = 0.85;
    } else if (bgMode === "embers") {
      p.y += p.vy; p.x += Math.sin(p.t) * 0.5;
      if (p.y < -8) { p.y = h + 8; p.x = Math.random() * w; }
      a = 0.4 + 0.5 * Math.abs(Math.sin(p.t));
    } else if (bgMode === "fireflies") {
      p.x += p.vx + Math.sin(p.t) * 0.3;
      p.y += p.vy + Math.cos(p.t * 0.8) * 0.3;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      a = 0.15 + 0.85 * Math.abs(Math.sin(p.t));
    }
    bgCtx.globalAlpha = a;
    bgCtx.fillStyle = p.c;
    bgCtx.fillRect(Math.round(p.x / PX) * PX, Math.round(p.y / PX) * PX, p.s, p.s);
  }
  bgCtx.globalAlpha = 1;
  if (!reduceMotion) bgRaf = requestAnimationFrame(bgFrame);
}

function applyBg() {
  cancelAnimationFrame(bgRaf);
  bgMode = state.equip.bg;
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  if (bgMode === "none") { particles = []; return; }

  const area = bgCanvas.width * bgCanvas.height;
  const divisor = { stars: 12000, snow: 12000, embers: 18000, fireflies: 40000 }[bgMode] || 15000;
  const n = Math.max(10, Math.min(120, Math.floor(area / divisor)));
  particles = Array.from({ length: n }, () => makeParticle(bgMode, true));
  bgFrame();
}

window.addEventListener("resize", applyBg);

/* =========================================================
   8. STREAK
   ========================================================= */
function activeDay(key) {
  return (state.history[key] || 0) > 0 || !!state.frozen[key];
}

function globalStreak() {
  let s = 0;
  const d = new Date();
  if (!activeDay(dayKey(d))) d.setDate(d.getDate() - 1);   // today not done yet? start from yesterday
  while (activeDay(dayKey(d))) {
    s++;
    d.setDate(d.getDate() - 1);
  }
  return s;
}

function renderStreak() {
  const s = globalStreak();
  document.getElementById("streak-count").textContent = `${s} DAY${s === 1 ? "" : "S"}`;

  const row = document.getElementById("streak-days");
  row.innerHTML = "";
  const letters = ["S", "M", "T", "W", "T", "F", "S"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);

    const cell = document.createElement("div");
    cell.className = "sday";
    if ((state.history[key] || 0) > 0) cell.classList.add("on");
    else if (state.frozen[key]) cell.classList.add("ice");
    if (i === 0) cell.classList.add("today");

    const sq = document.createElement("div");
    sq.className = "sq";
    const lb = document.createElement("div");
    lb.className = "sl";
    lb.textContent = letters[d.getDay()];
    cell.append(sq, lb);
    row.appendChild(cell);
  }
}

/* =========================================================
   9. RENDER
   ========================================================= */
const habitsEl = document.getElementById("habits");
const petCanvas = document.getElementById("pet");
const nameBtn = document.getElementById("name-btn");

const hpPercent = () => Math.max(0, (state.hp / state.maxHp) * 100);

function render() {
  // status
  nameBtn.textContent = state.name;
  document.getElementById("lv").textContent = `LV ${state.lv}`;
  document.getElementById("coins").textContent = `${state.coins} SPARKS`;
  document.getElementById("hpfill").style.width = hpPercent() + "%";
  document.getElementById("hptext").textContent = `${state.hp} / ${state.maxHp}`;

  const xpNeeded = state.lv * 50;
  document.getElementById("xpfill").style.width = (state.xp / xpNeeded) * 100 + "%";
  document.getElementById("xptext").textContent = `${state.xp} / ${xpNeeded}`;

  const pct = hpPercent();
  drawSoul(pct > 50 ? "#ff0000" : pct > 25 ? "#ff7f27" : "#a000a0");

  // pet
  drawMonster(petCanvas, state.equip.monster, state.equip.color, state.equip.hat);
  petCanvas.classList.toggle("sad", pct <= 25);

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

  renderStreak();
  updateFocusUI();
  renderShop();
  renderTrophies();
}

/* =========================================================
   10. REWARDS + TROPHIES
   ========================================================= */
function addSparks(n) {
  state.coins += n;
  state.stats.earned += n;
}

// returns true if you leveled up
function addXp(n) {
  state.xp += n;
  let leveled = false;
  while (state.xp >= state.lv * 50) {
    state.xp -= state.lv * 50;
    state.lv += 1;
    state.maxHp += 4;
    state.hp = state.maxHp;
    leveled = true;
  }
  return leveled;
}

// returns a list of text lines for any newly unlocked trophies
function checkAchievements() {
  const out = [];
  ACHIEVEMENTS.forEach((a) => {
    if (!state.ach[a.id] && a.test(state)) {
      state.ach[a.id] = true;
      addSparks(a.reward);
      out.push(`TROPHY: ${a.name}! (+${a.reward} SPARKS)`);
    }
  });
  if (out.length) setTimeout(trophySound, 500);
  return out;
}

// One place to finish any action: check trophies, redraw, save, talk
function commit(msg) {
  const trophies = checkAchievements();
  render();
  save();
  const full = [msg, ...trophies].filter(Boolean).join("\n* ");
  if (full) say(full);
}

/* =========================================================
   11. HABITS
   ========================================================= */
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
  const today = dayKey();
  state.history[today] = (state.history[today] || 0) + 1;
  state.stats.habits += 1;

  const xp = 10 + Math.min(h.streak, 5) * 2;     // streak bonus
  const sparks = 5;
  addSparks(sparks);
  const leveled = addXp(xp);
  beep(660, 0.1, 0.06);

  if (state.habits.length >= 3 && state.habits.every((x) => x.doneToday)) {
    state.stats.cleanSweep = true;
  }

  let msg = pick(TEXT.done) + `\n  (+${xp} XP, +${sparks} SPARKS)`;
  if (leveled) {
    msg = pick(TEXT.levelUp) + `\n  You are now LV ${state.lv}. HP maxed out!`;
    flash();
    levelUpSound();
  }
  commit(msg);
}

function addHabit(name) {
  ensureAudio();
  name = name.trim();
  if (!name) return;
  state.habits.push({ id: state.nextId++, name, doneToday: false, streak: 0 });
  beep(520, 0.08, 0.05);
  commit(pick(TEXT.added));
}

function removeHabit(id) {
  ensureAudio();
  state.habits = state.habits.filter((h) => h.id !== id);
  commit(state.habits.length ? pick(TEXT.removed) : pick(TEXT.empty));
}

/* Runs when you open the app: checks if a new day started */
function newDayCheck() {
  const today = dayKey();
  const prev = state.lastVisit;
  const gap = daysBetween(prev, today);
  if (gap <= 0) return null;

  let damage = 0;
  state.habits.forEach((h) => {
    const missedDays = (h.doneToday ? 0 : 1) + (gap - 1);
    if (missedDays > 0) {
      damage += missedDays * 2;
      h.streak = 0;
    }
    h.doneToday = false;
  });

  damage = Math.min(damage, 30);
  state.lastVisit = today;

  if (damage > 0 && state.items.freeze > 0) {
    // STREAK FREEZE: no damage, and the missed days stay "lit" on the streak bar
    state.items.freeze -= 1;
    for (let i = 0; i < gap; i++) {
      const d = new Date(prev + "T00:00:00");
      d.setDate(d.getDate() + i);
      state.frozen[dayKey(d)] = true;
    }
    return { type: "frozen" };
  }

  if (damage > 0) {
    state.hp -= damage;
    if (state.hp <= 0) {
      state.hp = state.maxHp;       // gentle "death": fresh start, no real punishment
      state.xp = 0;
      state.stats.revived += 1;
      return { type: "dead", damage };
    }
    return { type: "missed", damage };
  }
  return { type: "ok" };
}

/* =========================================================
   12. FOCUS TIMER + EGGS
   ========================================================= */
const timerEl = document.getElementById("timer");
const focusBtn = document.getElementById("focus-btn");
let focusMin = 25;               // selected preset
let focusTimer = null;
let sproutMode = "idle";         // idle | wilt | bloom (while running it's always "grow")
let giveUpArmed = false;

const fmt = (ms) => {
  const s = Math.ceil(ms / 1000);
  return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
};

function updateFocusUI() {
  const running = !!state.focus;
  let left, progress;
  if (running) {
    left = Math.max(0, state.focus.endAt - Date.now());
    progress = 1 - left / (state.focus.total * 60000);
  } else {
    left = focusMin * 60000;
    progress = 0;
  }

  timerEl.textContent = fmt(left);
  drawSprout(progress, running ? "grow" : sproutMode);

  focusBtn.textContent = running ? (giveUpArmed ? "SURE? CLICK AGAIN" : "GIVE UP") : "START";
  document.querySelectorAll(".preset").forEach((b) => {
    b.disabled = running;
    b.classList.toggle("sel", Number(b.dataset.min) === focusMin);
  });

  document.title = running ? `${fmt(left)} - FOCUS` : "DETERMINATION";

  // egg
  const ratio = Math.min(1, state.eggMinutes / EGG_GOAL);
  document.getElementById("eggfill").style.width = ratio * 100 + "%";
  document.getElementById("eggtext").textContent = `${state.eggMinutes} / ${EGG_GOAL} MIN`;
  drawEgg(ratio);
}

function startFocusLoop() {
  clearInterval(focusTimer);
  focusTimer = setInterval(tickFocus, 500);
  tickFocus();
}

function tickFocus() {
  if (!state.focus) { clearInterval(focusTimer); return; }
  // we compare real clock times, so it stays accurate even in a background tab
  if (state.focus.endAt - Date.now() <= 0) completeFocus();
  else updateFocusUI();
}

function startFocus() {
  ensureAudio();
  state.focus = { endAt: Date.now() + focusMin * 60000, total: focusMin };
  sproutMode = "idle";
  giveUpArmed = false;
  beep(523, 0.1, 0.06);
  save();
  startFocusLoop();
  updateFocusUI();
  say("The seed is planted. Stay focused and it will grow.");
}

function giveUp() {
  state.focus = null;
  clearInterval(focusTimer);
  giveUpArmed = false;
  sproutMode = "wilt";
  setTimeout(() => { if (sproutMode === "wilt") { sproutMode = "idle"; updateFocusUI(); } }, 4000);
  damageSound();
  save();
  updateFocusUI();
  say("The sprout droops... It's okay. Try again when you're ready.");
}

function hatchEgg() {
  const unowned = MONSTERS.filter((m) => !state.owned.monsters.includes(m.id));
  state.stats.hatched += 1;
  if (!unowned.length) {              // you own everything: lucky charm instead
    addSparks(50);
    return null;
  }
  const m = pick(unowned);
  state.owned.monsters.push(m.id);
  return m;
}

function completeFocus() {
  const f = state.focus;
  if (!f) return;
  clearInterval(focusTimer);

  const min = f.total;
  state.focus = null;
  giveUpArmed = false;

  const xp = Math.round(min * 1.5);
  const sparks = min;
  addSparks(sparks);
  const leveled = addXp(xp);

  state.stats.focusMin += min;
  state.stats.sessions += 1;
  state.eggMinutes += min;

  const today = dayKey();
  state.history[today] = (state.history[today] || 0) + 1;   // focusing counts for your streak

  let msg = `Focus complete! The sprout bloomed.\n  (+${xp} XP, +${sparks} SPARKS)`;
  if (leveled) {
    msg += `\n* LEVEL UP! You are now LV ${state.lv}.`;
    flash();
  }

  const hatched = [];
  while (state.eggMinutes >= EGG_GOAL) {
    state.eggMinutes -= EGG_GOAL;
    hatched.push(hatchEgg());
  }
  hatched.forEach((m) => {
    msg += m
      ? `\n* The egg hatched! You got ${m.name}! Check the SHOP to equip it.`
      : `\n* The egg hatched into a lucky charm! +50 SPARKS`;
  });

  if (hatched.length) hatchSound();
  else if (leveled) levelUpSound();
  else chimeSound();

  sproutMode = "bloom";
  setTimeout(() => { if (sproutMode === "bloom") { sproutMode = "idle"; updateFocusUI(); } }, 4000);

  commit(msg);
}

focusBtn.addEventListener("click", () => {
  ensureAudio();
  if (!state.focus) { startFocus(); return; }
  if (giveUpArmed) { giveUp(); return; }
  giveUpArmed = true;                  // first click just asks "are you sure?"
  updateFocusUI();
  setTimeout(() => { giveUpArmed = false; updateFocusUI(); }, 3000);
});

document.querySelectorAll(".preset").forEach((b) => {
  b.addEventListener("click", () => {
    if (state.focus) return;
    ensureAudio();
    focusMin = Number(b.dataset.min);
    beep(440, 0.04, 0.03);
    updateFocusUI();
  });
});

document.addEventListener("visibilitychange", () => { if (!document.hidden && state.focus) tickFocus(); });

/* =========================================================
   13. SHOP / INVENTORY
   ========================================================= */
const shopListEl = document.getElementById("shop-list");
let shopTab = "monsters";

function makeCard(o) {
  const el = document.createElement("div");
  el.className = "card" + (o.equipped ? " equipped" : "");

  if (o.preview) {
    const c = document.createElement("canvas");
    c.width = 12; c.height = 12;
    c.className = "pv";
    o.preview(c);
    el.appendChild(c);
  }

  const n = document.createElement("div");
  n.className = "cname";
  n.textContent = o.name;
  el.appendChild(n);

  if (o.desc) {
    const d = document.createElement("div");
    d.className = "cdesc";
    d.textContent = o.desc;
    el.appendChild(d);
  }

  const b = document.createElement("button");
  b.textContent = o.label;
  b.disabled = !!o.disabled;
  b.addEventListener("click", o.onClick);
  el.appendChild(b);

  if (o.extra) {
    const b2 = document.createElement("button");
    b2.textContent = o.extra.label;
    b2.disabled = !!o.extra.disabled;
    b2.addEventListener("click", o.extra.onClick);
    el.appendChild(b2);
  }
  return el;
}

function renderShop() {
  document.getElementById("shop-coins").textContent = `${state.coins} SPARKS`;
  document.querySelectorAll(".stab").forEach((b) => b.classList.toggle("active", b.dataset.shop === shopTab));
  shopListEl.innerHTML = "";

  const E = state.equip;

  if (shopTab === "items") {
    ITEMS.forEach((it) => {
      const count = state.items[it.id] || 0;
      shopListEl.appendChild(makeCard({
        name: `${it.name} x${count}`,
        desc: it.desc,
        label: `BUY ${it.cost}`,
        onClick: () => buy("items", it),
        extra: it.id === "snack"
          ? { label: "USE", disabled: count < 1 || state.hp >= state.maxHp, onClick: useSnack }
          : null,
      }));
    });
    return;
  }

  const cfg = {
    monsters: { list: MONSTERS, key: "monster", preview: (it) => (c) => drawMonster(c, it.id, "default", "none") },
    hats:     { list: HATS,     key: "hat",     preview: (it) => (c) => drawMonster(c, E.monster, E.color, it.id) },
    colors:   { list: COLORS,   key: "color",   preview: (it) => (c) => drawMonster(c, E.monster, it.id, E.hat) },
    bgs:      { list: BGS,      key: "bg",      preview: null },
  }[shopTab];

  cfg.list.forEach((it) => {
    const owned = state.owned[shopTab].includes(it.id);
    const equipped = E[cfg.key] === it.id;
    shopListEl.appendChild(makeCard({
      name: it.name,
      desc: it.desc,
      equipped,
      preview: cfg.preview ? cfg.preview(it) : null,
      label: equipped ? "EQUIPPED" : owned ? "EQUIP" : `BUY ${it.cost}`,
      disabled: equipped,
      onClick: () => (owned ? equip(shopTab, it) : buy(shopTab, it)),
    }));
  });
}

function buy(kind, item) {
  ensureAudio();
  if (state.coins < item.cost) {
    errorSound();
    say(`You need ${item.cost - state.coins} more SPARKS for that.`);
    return;
  }
  state.coins -= item.cost;
  if (kind === "items") state.items[item.id] = (state.items[item.id] || 0) + 1;
  else state.owned[kind].push(item.id);
  state.stats.purchases += 1;
  coinSound();
  commit(`Bought ${item.name}!` + (kind === "items" ? "" : " Press EQUIP to use it."));
}

function equip(kind, item) {
  ensureAudio();
  const key = { monsters: "monster", hats: "hat", colors: "color", bgs: "bg" }[kind];
  state.equip[key] = item.id;
  beep(700, 0.08, 0.05);
  if (kind === "bgs") applyBg();
  commit(`${item.name} equipped.`);
}

function useSnack() {
  ensureAudio();
  if (state.items.snack < 1 || state.hp >= state.maxHp) return;
  state.items.snack -= 1;
  state.hp = Math.min(state.maxHp, state.hp + 10);
  beep(880, 0.1, 0.05);
  commit("You ate the snack. HP +10!");
}

document.querySelectorAll(".stab").forEach((b) => {
  b.addEventListener("click", () => {
    ensureAudio();
    shopTab = b.dataset.shop;
    beep(440, 0.04, 0.03);
    renderShop();
  });
});

/* =========================================================
   14. TROPHIES PANEL
   ========================================================= */
function renderTrophies() {
  const list = document.getElementById("trophy-list");
  list.innerHTML = "";
  let got = 0;

  ACHIEVEMENTS.forEach((a) => {
    const unlocked = !!state.ach[a.id];
    if (unlocked) got++;

    const li = document.createElement("li");
    if (unlocked) li.classList.add("got");

    const mark = document.createElement("span");
    mark.className = "tmark";
    mark.textContent = unlocked ? "*" : "-";

    const info = document.createElement("div");
    const nm = document.createElement("div");
    nm.className = "tname";
    nm.textContent = a.name;
    const ds = document.createElement("div");
    ds.className = "tdesc";
    ds.textContent = a.desc;
    info.append(nm, ds);

    const rw = document.createElement("span");
    rw.className = "treward";
    rw.textContent = `+${a.reward}`;

    li.append(mark, info, rw);
    list.appendChild(li);
  });

  document.getElementById("trophy-count").textContent = `${got} / ${ACHIEVEMENTS.length}`;
}

/* =========================================================
   15. RENAME, PET, TABS, EFFECTS
   ========================================================= */
nameBtn.addEventListener("click", () => {
  ensureAudio();
  const input = document.createElement("input");
  input.type = "text";
  input.id = "name-input";
  input.maxLength = MAX_NAME;
  input.value = state.name;
  nameBtn.replaceWith(input);
  input.focus();
  input.select();

  let finished = false;
  const finish = (apply) => {
    if (finished) return;
    finished = true;
    const v = input.value.trim().toUpperCase().slice(0, MAX_NAME);
    input.replaceWith(nameBtn);
    if (apply && v && v !== state.name) {
      state.name = v;
      state.stats.renamed = true;
      beep(700, 0.08, 0.05);
      commit(`Your name is now ${v}. Nice to meet you!`);
    } else {
      render();
    }
  };
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });
  input.addEventListener("blur", () => finish(true));
});

document.getElementById("pet-btn").addEventListener("click", () => {
  ensureAudio();
  const m = getMonster(state.equip.monster);
  const sad = hpPercent() <= 25;
  say(sad ? `${m.name} looks sleepy... Maybe a snack would help?` : pick(m.lines));
  beep(500 + Math.random() * 200, 0.08, 0.05);
  petCanvas.classList.remove("hop");
  void petCanvas.offsetWidth;
  petCanvas.classList.add("hop");
  setTimeout(() => petCanvas.classList.remove("hop"), 320);
});

function showTab(name) {
  document.querySelectorAll(".panel").forEach((p) => { p.hidden = p.id !== "panel-" + name; });
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
}
document.querySelectorAll(".tab").forEach((b) => {
  b.addEventListener("click", () => {
    ensureAudio();
    beep(440, 0.04, 0.03);
    showTab(b.dataset.tab);
  });
});

function flash() {
  document.body.classList.remove("flash");
  void document.body.offsetWidth;
  document.body.classList.add("flash");
}

function shake() {
  const g = document.getElementById("game");
  g.classList.remove("shake");
  void g.offsetWidth;
  g.classList.add("shake");
}

/* =========================================================
   16. OTHER EVENTS
   ========================================================= */
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

/* ---- Installable app (PWA) ---- */
let installEvent = null;
const installBtn = document.getElementById("install-btn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installEvent = e;
  installBtn.hidden = false;
});
installBtn.addEventListener("click", async () => {
  if (!installEvent) return;
  installEvent.prompt();
  try { await installEvent.userChoice; } catch (e) {}
  installEvent = null;
  installBtn.hidden = true;
});
window.addEventListener("appinstalled", () => { installBtn.hidden = true; });

if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

/* =========================================================
   17. START
   ========================================================= */
load();
const result = newDayCheck();
applyBg();
render();
save();
if (state.focus) startFocusLoop();

if (result && result.type === "dead") {
  shake();
  setTimeout(() => say(pick(TEXT.dead)), 300);
} else if (result && result.type === "missed") {
  shake();
  setTimeout(() => say(pick(TEXT.missed) + `\n  (-${result.damage} HP)`), 300);
} else if (result && result.type === "frozen") {
  setTimeout(() => say("Your STREAK FREEZE melted. Your streak is safe!"), 300);
} else {
  setTimeout(() => say(pick(TEXT.welcome)), 300);
}
