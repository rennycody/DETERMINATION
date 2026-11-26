/* =========================================================
   DETERMINATION v3 - a habit tracker styled like a retro RPG
   NEW in v3: quests, egg types, the cavern (hatched monsters by
   day), a slower economy, more shop items, accounts + leaderboards.
   ========================================================= */

const STORAGE_KEY = "determination-save";
const MAX_NAME = 10;
const $ = (id) => document.getElementById(id);

/* =========================================================
   1. ECONOMY  (change these numbers to make the game faster/slower)
   ========================================================= */
const ECON = {
  habitSparks: 2,        // sparks per habit
  habitSparkCap: 12,     // max sparks from habits per day
  habitRewardCap: 8,     // only the first 8 habits each day give XP + sparks
  focusMinPerSpark: 5,   // 1 spark per 5 focus minutes
  focusSparkCap: 24,     // max sparks from focus per day
  focusMinCap: 120,      // only the first 120 focus minutes each day give rewards
  levelUpSparks: 2,      // reaching LV n gives 2 x n sparks
};

/* =========================================================
   2. GAME DATA  (edit these lists to add your own content!)
   ========================================================= */

/* ---- Monsters: 12 wide x 10 tall pixel grids ----
   . = empty   b = body color   d = darker   l = lighter
   w = white   k = black        p = pink cheek
   headTop = grid row where the head starts (hats sit there) */
const MONSTERS = [
  {
    id: "blobby", name: "BLOBBY", color: "#4cd9a0", headTop: 1,
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
    id: "ghosty", name: "GHOSTY", color: "#cfe8ff", headTop: 1,
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
    id: "pebble", name: "PEBBLE", color: "#9a9a9a", headTop: 1,
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
    id: "bunbun", name: "BUNBUN", color: "#f0b0d0", headTop: 2,
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
    id: "fluttr", name: "FLUTTR", color: "#b79cff", headTop: 1,
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
  {
    id: "sproutl", name: "SPROUTL", color: "#5fd05a", headTop: 3,
    desc: "Has a leaf on its head.",
    lines: ["SPROUTL stretches toward the light.", "SPROUTL rustles its leaves.", "SPROUTL smells like fresh grass."],
    grid: [
      "......bb....",
      ".....bbl....",
      "..b..bb..b..",
      "..bbbbbbbb..",
      ".bbbbbbbbbb.",
      ".bbwkbbwkbb.",
      ".bpbbbbbbpb.",
      ".bbbbkkbbbb.",
      "..dbbbbbbd..",
      "...dd..dd...",
    ],
  },
  {
    id: "pinchy", name: "PINCHY", color: "#ff7a5c", headTop: 3,
    desc: "Pinches (gently).",
    lines: ["PINCHY clicks its claws.", "PINCHY scuttles sideways.", "PINCHY waves a tiny claw."],
    grid: [
      "............",
      "..bb....bb..",
      ".bbbb..bbbb.",
      ".bb.bbbb.bb.",
      "...bbbbbb...",
      "..bwkbbwkb..",
      "..bbbbbbbb..",
      "..bbbkkbbb..",
      "..dbbbbbbd..",
      ".d.d.dd.d.d.",
    ],
  },
  {
    id: "snowpuff", name: "SNOWPUFF", color: "#e8f4ff", headTop: 1,
    desc: "Softer than a cloud.",
    lines: ["SNOWPUFF fluffs up happily.", "SNOWPUFF sneezes a tiny snowflake.", "SNOWPUFF is very warm to hug."],
    grid: [
      "............",
      "..bb....bb..",
      "..bbbbbbbb..",
      ".bbbbbbbbbb.",
      "bbbbbbbbbbbb",
      "bbbwkbbwkbbb",
      "bbpbbbbbbpbb",
      "bbbbbkkbbbbb",
      ".bbbbbbbbbb.",
      "..dd.dd.dd..",
    ],
  },
  {
    id: "emberkit", name: "EMBERKIT", color: "#ff9a3c", headTop: 1,
    desc: "Its tail is a tiny flame.",
    lines: ["EMBERKIT purrs. It is warm.", "EMBERKIT's tail flickers happily.", "EMBERKIT curls up by your feet."],
    grid: [
      "............",
      "..b......b..",
      "..bb....bb..",
      "..bbbbbbbb..",
      "..bwkbbwkb..",
      "..bpbbbbpb.l",
      "..bbbkkbbbll",
      "...bbbbbbbl.",
      "...dbbbbd...",
      "...dd..dd...",
    ],
  },
  {
    id: "glowcap", name: "GLOWCAP", color: "#38d6c8", headTop: 1,
    desc: "A glowing little mushroom.",
    lines: ["GLOWCAP glows a little brighter.", "GLOWCAP releases sparkly spores.", "GLOWCAP hums quietly."],
    grid: [
      "............",
      "...bbbbbb...",
      "..bbwbbbwb..",
      ".bbbbbbbbbb.",
      ".bwbbbbbbwb.",
      "bbbbbbbbbbbb",
      "...llllll...",
      "...lkllkl...",
      "...llkkll...",
      "....dddd....",
    ],
  },
  {
    id: "jello", name: "JELLO", color: "#7fc8ff", headTop: 1,
    desc: "Wobbly and see-through-ish.",
    lines: ["JELLO jiggles all over.", "JELLO floats up a little.", "JELLO goes squish."],
    grid: [
      "............",
      "...bbbbbb...",
      "..bbbbbbbb..",
      ".bbbbbbbbbb.",
      ".bbwkbbwkbb.",
      ".bpbbbbbbpb.",
      ".bbbbkkbbbb.",
      ".dbbbbbbbbd.",
      "..b.b..b.b..",
      "..b..b..b...",
    ],
  },
  {
    id: "starlet", name: "STARLET", color: "#ffd84d", headTop: 1,
    desc: "Fell from the cave ceiling.",
    lines: ["STARLET twinkles at you.", "STARLET spins slowly.", "STARLET makes a wish. It won't say what."],
    grid: [
      "............",
      ".....bb.....",
      ".....bb.....",
      "....bbbb....",
      "bbbbbbbbbbbb",
      ".bbwkbbwkbb.",
      "..bpbbbbpb..",
      "...bbkkbb...",
      "..bbbbbbbb..",
      "..bb....bb..",
    ],
  },
];

/* ---- Egg types: each hatches monsters from its own pool ---- */
const EGGS = [
  { id: "cave",  name: "CAVE EGG",  cost: 0,   goal: 60,  shiny: 0.05, shell: "#f4ecd2", spot: "#8ec7ff", crack: "#3a2a1a",
    desc: "Common critters from the cool dark.", pool: ["blobby", "pebble", "bunbun", "sproutl"] },
  { id: "marsh", name: "MARSH EGG", cost: 120, goal: 75,  shiny: 0.06, shell: "#cdeedd", spot: "#3ca878", crack: "#1d4d38",
    desc: "Squishy swamp dwellers.", pool: ["sproutl", "glowcap", "jello", "pinchy", "blobby"] },
  { id: "frost", name: "FROST EGG", cost: 200, goal: 90,  shiny: 0.06, shell: "#dff2ff", spot: "#7fb8ff", crack: "#2a4f7a",
    desc: "Chilly, fluffy friends.", pool: ["snowpuff", "ghosty", "bunbun", "pebble"] },
  { id: "ember", name: "EMBER EGG", cost: 300, goal: 120, shiny: 0.07, shell: "#ffd9b3", spot: "#e0532b", crack: "#5a1d0a",
    desc: "Warm and a bit spicy.", pool: ["emberkit", "fluttr", "pebble", "pinchy"] },
  { id: "star",  name: "STAR EGG",  cost: 500, goal: 180, shiny: 0.15, shell: "#2a2a5a", spot: "#ffe14d", crack: "#ffffff",
    desc: "Rare! Best shiny chance.", pool: ["starlet", "fluttr", "ghosty", "glowcap"] },
];

/* ---- Hats: 6 wide x 3 tall. Letters map to the colors in c ---- */
const HATS = [
  { id: "none",       name: "NO HAT",     cost: 0,   grid: null },
  { id: "bow",        name: "BOW",        cost: 60,  grid: ["rr..rr", "rrKKrr", "rr..rr"], c: { r: "#ff5fa2", K: "#a0205a" } },
  { id: "party",      name: "PARTY HAT",  cost: 80,  grid: ["..yy..", ".rrrr.", "bbbbbb"], c: { y: "#ffe14d", r: "#ff5f5f", b: "#4a9bff" } },
  { id: "sprout",     name: "SPROUT",     cost: 90,  grid: [".g..g.", "..gg..", "..GG.."], c: { g: "#4cdc5a", G: "#22903a" } },
  { id: "ears",       name: "CAT EARS",   cost: 110, grid: ["k....k", "kk..kk", ".kkkk."], c: { k: "#2a2a3a" } },
  { id: "flower",     name: "FLOWER",     cost: 120, grid: ["..pp..", ".pyyp.", "..pp.."], c: { p: "#ff8ad0", y: "#ffe14d" } },
  { id: "wizard",     name: "WIZARD HAT", cost: 150, grid: ["..pp..", ".pppp.", "PPPPPP"], c: { p: "#8a4bff", P: "#5a2db5" } },
  { id: "tophat",     name: "TOP HAT",    cost: 160, grid: [".kkkk.", ".rrrr.", "kkkkkk"], c: { k: "#1e1e28", r: "#c02030" } },
  { id: "headphones", name: "HEADPHONES", cost: 180, grid: ["kkkkkk", "k....k", "rr..rr"], c: { k: "#33334a", r: "#ff4060" } },
  { id: "halo",       name: "HALO",       cost: 200, grid: [".yyyy.", "y....y", "......"], c: { y: "#ffe14d" } },
  { id: "crown",      name: "CROWN",      cost: 300, grid: ["y.yy.y", "yyyyyy", "yoyyoy"], c: { y: "#ffd700", o: "#ff7f27" } },
];

/* ---- Body colors (hex: null = the monster's own color) ---- */
const COLORS = [
  { id: "default",  name: "ORIGINAL", cost: 0,  hex: null },
  { id: "blue",     name: "BLUE",     cost: 0,  hex: "#4aa3ff" },
  { id: "green",    name: "GREEN",    cost: 0,  hex: "#4cd964" },
  { id: "pink",     name: "PINK",     cost: 40, hex: "#ff7ac8" },
  { id: "red",      name: "RED",      cost: 40, hex: "#e04848" },
  { id: "orange",   name: "ORANGE",   cost: 40, hex: "#ff9a3c" },
  { id: "purple",   name: "PURPLE",   cost: 40, hex: "#9b6bff" },
  { id: "mint",     name: "MINT",     cost: 40, hex: "#7ff0c0" },
  { id: "sky",      name: "SKY",      cost: 40, hex: "#7fd4ff" },
  { id: "cream",    name: "CREAM",    cost: 50, hex: "#f5e6b8" },
  { id: "shadow",   name: "SHADOW",   cost: 70, hex: "#55557a" },
  { id: "midnight", name: "MIDNIGHT", cost: 80, hex: "#2c3a8c" },
  { id: "lava",     name: "LAVA",     cost: 90, hex: "#ff4a1c" },
  { id: "gold",     name: "GOLD",     cost: 100, hex: "#ffd23f" },
];

/* ---- Animated backgrounds (float BEHIND the game, black stays black) ---- */
const BGS = [
  { id: "none",      name: "PLAIN BLACK", cost: 0,   desc: "No animation." },
  { id: "stars",     name: "STAR FIELD",  cost: 0,   desc: "Twinkling stars. Free!" },
  { id: "snow",      name: "SNOWFALL",    cost: 80,  desc: "Soft pixel snow." },
  { id: "embers",    name: "EMBERS",      cost: 80,  desc: "Warm sparks rising." },
  { id: "rain",      name: "RAIN",        cost: 100, desc: "A cozy drizzle." },
  { id: "bubbles",   name: "BUBBLES",     cost: 100, desc: "Floating bubbles." },
  { id: "fireflies", name: "FIREFLIES",   cost: 120, desc: "Glowing wanderers." },
  { id: "leaves",    name: "FALLING LEAVES", cost: 120, desc: "Autumn drifts by." },
];

/* ---- Frames: the color of the boxes around everything ---- */
const FRAMES = [
  { id: "white",  name: "CLASSIC WHITE", cost: 0,   hex: "#ffffff" },
  { id: "yellow", name: "SUNNY",         cost: 100, hex: "#ffff00" },
  { id: "cyan",   name: "ICE",           cost: 100, hex: "#00e5ff" },
  { id: "pink",   name: "BUBBLEGUM",     cost: 120, hex: "#ff6ad5" },
  { id: "green",  name: "SLIME",         cost: 120, hex: "#39ff6a" },
  { id: "orange", name: "PUMPKIN",       cost: 120, hex: "#ff9a3c" },
  { id: "purple", name: "ROYAL",         cost: 150, hex: "#a070ff" },
];

/* ---- Voices: the "blip" sound while text types ---- */
const VOICES = [
  { id: "classic", name: "CLASSIC", cost: 0,  wave: "square",   f: 300, desc: "The original blip." },
  { id: "soft",    name: "SOFT",    cost: 50, wave: "triangle", f: 380, desc: "Gentle and round." },
  { id: "deep",    name: "DEEP",    cost: 50, wave: "sawtooth", f: 170, desc: "Big grumbly voice." },
  { id: "chirp",   name: "CHIRP",   cost: 70, wave: "sine",     f: 560, desc: "Tiny bird talk." },
  { id: "robot",   name: "ROBOT",   cost: 90, wave: "square",   f: 130, desc: "Beep boop." },
];

/* ---- Shop items (things you use up) ---- */
const ITEMS = [
  { id: "freeze", name: "STREAK FREEZE", cost: 150, max: 3, desc: "Auto-used if you miss days: no HP loss, streak saved." },
  { id: "snack",  name: "HEALING SNACK", cost: 30,  max: 5, desc: "Restores 10 HP." },
  { id: "mega",   name: "MEGA SNACK",    cost: 75,  max: 3, desc: "Restores ALL your HP." },
  { id: "warmer", name: "EGG WARMER",    cost: 90,  max: 5, desc: "Adds 15 minutes to your current egg." },
  { id: "charm",  name: "LUCKY CHARM",   cost: 120, max: 3, desc: "Your next hatch has 4x shiny chance." },
];

/* ---- Habit ideas for the quick-add buttons ---- */
const SUGGESTED = ["Drink water", "Stretch", "Read 10 min", "Walk outside", "Tidy up", "Sleep by 11pm", "Study 25 min", "Call a friend"];

/* ---- Daily quests (3 random ones, different kinds, each day) ---- */
const DAILY_POOL = [
  { id: "h3",      group: "habit",   name: "WARM-UP",      desc: "Finish 3 habits.",                    metric: "habits",   target: 3,  reward: 6 },
  { id: "h5",      group: "habit",   name: "ON FIRE",      desc: "Finish 5 habits.",                    metric: "habits",   target: 5,  reward: 10 },
  { id: "perfect", group: "habit",   name: "PERFECT DAY",  desc: "Finish every habit (have 2+).",       metric: "perfect",  target: 1,  reward: 10 },
  { id: "f25",     group: "focus",   name: "FOCUS TIME",   desc: "Focus for 25 minutes.",               metric: "focusMin", target: 25, reward: 8 },
  { id: "f50",     group: "focus",   name: "DEEP WORK",    desc: "Focus for 50 minutes.",               metric: "focusMin", target: 50, reward: 12 },
  { id: "s2",      group: "session", name: "DOUBLE SPROUT", desc: "Finish 2 focus sessions (15+ min).", metric: "sessions", target: 2,  reward: 10 },
  { id: "pet3",    group: "pet",     name: "GOOD PET",     desc: "Pet your monster 3 times.",           metric: "pets",     target: 3,  reward: 4 },
  { id: "cave",    group: "cave",    name: "EXPLORER",     desc: "Visit the CAVERN.",                   metric: "cave",     target: 1,  reward: 3 },
  { id: "early",   group: "time",    name: "EARLY BIRD",   desc: "Finish a habit before 10 AM.",        metric: "early",    target: 1,  reward: 6 },
  { id: "late",    group: "time",    name: "NIGHT OWL",    desc: "Finish a habit after 9 PM.",          metric: "late",     target: 1,  reward: 6 },
];

/* ---- Weekly quests (3 each week, Monday to Sunday) ---- */
const WEEKLY_POOL = [
  { id: "wh20",  group: "habit",   name: "HABIT HERO",    desc: "Finish 20 habits this week.",        metric: "habits",     target: 20,  reward: 30 },
  { id: "wh35",  group: "habit",   name: "HABIT LEGEND",  desc: "Finish 35 habits this week.",        metric: "habits",     target: 35,  reward: 50 },
  { id: "wf150", group: "focus",   name: "STEADY FOCUS",  desc: "Focus for 150 minutes this week.",   metric: "focusMin",   target: 150, reward: 30 },
  { id: "wf300", group: "focus",   name: "FOCUS MASTER",  desc: "Focus for 300 minutes this week.",   metric: "focusMin",   target: 300, reward: 50 },
  { id: "ws8",   group: "session", name: "SPROUT FARMER", desc: "Finish 8 focus sessions (15+ min).", metric: "sessions",   target: 8,   reward: 35 },
  { id: "wd5",   group: "days",    name: "SHOW UP",       desc: "Be active on 5 different days.",     metric: "activeDays", target: 5,   reward: 40 },
  { id: "wegg",  group: "egg",     name: "NEW ARRIVAL",   desc: "Hatch an egg this week.",            metric: "hatches",    target: 1,   reward: 40 },
  { id: "wpet",  group: "pet",     name: "BEST FRIENDS",  desc: "Pet your monster 15 times.",         metric: "pets",       target: 15,  reward: 15 },
];

/* ---- Trophies (one-time) ---- */
const ACHIEVEMENTS = [
  { id: "first",     name: "FIRST STEP",       desc: "Complete a habit.",                 reward: 5,   test: (s) => s.stats.habits >= 1 },
  { id: "ten",       name: "WARMING UP",       desc: "Complete 10 habits.",               reward: 10,  test: (s) => s.stats.habits >= 10 },
  { id: "fifty",     name: "DEDICATED",        desc: "Complete 50 habits.",               reward: 25,  test: (s) => s.stats.habits >= 50 },
  { id: "hundred",   name: "CENTURION",        desc: "Complete 100 habits.",              reward: 40,  test: (s) => s.stats.habits >= 100 },
  { id: "clean",     name: "CLEAN SWEEP",      desc: "Finish 3+ habits in one day.",      reward: 10,  test: (s) => s.stats.cleanSweep },
  { id: "streak3",   name: "ON A ROLL",        desc: "Reach a 3 day streak.",             reward: 10,  test: () => globalStreak() >= 3 },
  { id: "streak7",   name: "WEEK WARRIOR",     desc: "Reach a 7 day streak.",             reward: 25,  test: () => globalStreak() >= 7 },
  { id: "streak14",  name: "FORTNIGHT",        desc: "Reach a 14 day streak.",            reward: 40,  test: () => globalStreak() >= 14 },
  { id: "streak30",  name: "UNSTOPPABLE",      desc: "Reach a 30 day streak.",            reward: 80,  test: () => globalStreak() >= 30 },
  { id: "lv3",       name: "GETTING STRONGER", desc: "Reach LV 3.",                       reward: 10,  test: (s) => s.lv >= 3 },
  { id: "lv5",       name: "VETERAN",          desc: "Reach LV 5.",                       reward: 20,  test: (s) => s.lv >= 5 },
  { id: "lv10",      name: "LEGEND",           desc: "Reach LV 10.",                      reward: 40,  test: (s) => s.lv >= 10 },
  { id: "focus1",    name: "DEEP BREATH",      desc: "Finish a focus session.",           reward: 8,   test: (s) => s.stats.sessions >= 1 },
  { id: "focus120",  name: "ZEN MASTER",       desc: "Focus for 120 minutes total.",      reward: 20,  test: (s) => s.stats.focusMin >= 120 },
  { id: "focus600",  name: "FOCUS MONK",       desc: "Focus for 600 minutes total.",      reward: 50,  test: (s) => s.stats.focusMin >= 600 },
  { id: "hatch",     name: "EGG-CELLENT",      desc: "Hatch your first egg.",             reward: 15,  test: (s) => s.stats.hatched >= 1 },
  { id: "hatch5",    name: "NURSERY",          desc: "Hatch 5 eggs.",                     reward: 30,  test: (s) => s.stats.hatched >= 5 },
  { id: "hatch20",   name: "HATCHERY",         desc: "Hatch 20 eggs.",                    reward: 60,  test: (s) => s.stats.hatched >= 20 },
  { id: "collector", name: "COLLECTOR",        desc: "Discover 3 monster types.",         reward: 20,  test: (s) => s.owned.monsters.length >= 3 },
  { id: "dex6",      name: "HALF-WAY",         desc: "Discover 6 monster types.",         reward: 40,  test: (s) => s.owned.monsters.length >= 6 },
  { id: "dexall",    name: "MONSTER MASTER",   desc: "Discover every monster type.",      reward: 100, test: (s) => s.owned.monsters.length >= MONSTERS.length },
  { id: "shiny",     name: "SHINY!",           desc: "Hatch a shiny monster.",            reward: 60,  test: (s) => s.stats.shinies >= 1 },
  { id: "shopper",   name: "FIRST PURCHASE",   desc: "Buy something in the shop.",        reward: 5,   test: (s) => s.stats.purchases >= 1 },
  { id: "spender",   name: "BIG SPENDER",      desc: "Spend 500 sparks in total.",        reward: 30,  test: (s) => s.stats.spent >= 500 },
  { id: "saver",     name: "SAVER",            desc: "Hold 200 sparks at once.",          reward: 20,  test: (s) => s.coins >= 200 },
  { id: "stylish",   name: "STYLISH",          desc: "Put a hat on your monster.",        reward: 8,   test: (s) => s.equip.hat !== "none" },
  { id: "named",     name: "NICE TO MEET YOU", desc: "Rename yourself.",                  reward: 3,   test: (s) => s.stats.renamed },
  { id: "revived",   name: "STAY DETERMINED",  desc: "Lose all your HP and get back up.", reward: 5,   test: (s) => s.stats.revived >= 1 },
  { id: "quest1",    name: "QUEST START",      desc: "Claim a quest reward.",             reward: 5,   test: (s) => s.stats.quests >= 1 },
  { id: "quest25",   name: "QUESTER",          desc: "Claim 25 quest rewards.",           reward: 50,  test: (s) => s.stats.quests >= 25 },
  { id: "online",    name: "CONNECTED",        desc: "Sign in online.",                   reward: 15,  test: (s) => s.stats.signedIn },
];

/* =========================================================
   3. STATE
   ========================================================= */
function makeState() {
  return {
    name: "FRIEND",
    lv: 1, xp: 0, hp: 20, maxHp: 20,
    coins: 0,                         // SPARKS
    habits: [
      { id: 1, name: "Drink water", doneToday: false, streak: 0 },
      { id: 2, name: "Stretch",     doneToday: false, streak: 0 },
    ],
    nextId: 3,
    lastVisit: dayKey(),
    muted: false,
    savedAt: 0,

    history: {},                      // { "2026-11-22": 3 }  things done that day
    frozen: {},                       // days saved by a streak freeze
    eggMinutes: 0,                    // (old v2 field, moved into eggProgress)
    eggType: "cave",                  // the egg you are warming right now
    eggProgress: { cave: 0, marsh: 0, frost: 0, ember: 0, star: 0 },
    focus: null,                      // { endAt, total } while a timer runs
    hatchLog: [],                     // [{ id, day, shiny, egg, t }] for the cavern

    daily:  { day: "",  d: {}, claimed: {}, cap: { habit: 0, focus: 0, habitN: 0, focusMin: 0 } },
    weekly: { week: "", w: {}, claimed: {} },

    owned: {
      monsters: ["blobby"],
      hats: ["none"],
      colors: ["default", "blue", "green"],
      bgs: ["none", "stars"],
      eggs: ["cave"],
      frames: ["white"],
      voices: ["classic"],
    },
    equip: { monster: "blobby", hat: "none", color: "default", bg: "none", frame: "white", voice: "classic" },
    items: { freeze: 0, snack: 0, mega: 0, warmer: 0, charm: 0 },
    ach: {},
    stats: {
      habits: 0, focusMin: 0, sessions: 0, hatched: 0, shinies: 0, purchases: 0, spent: 0,
      renamed: false, earned: 0, revived: 0, cleanSweep: false, quests: 0,
      totalXp: 0, bestStreak: 0, signedIn: false,
    },
    settings: { lb: true },
  };
}
let state = makeState();

/* ---------- date helpers ---------- */
function dayKey(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function weekKey(d = new Date()) {                 // the Monday of this week
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return dayKey(x);
}
function daysBetween(a, b) {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db - da) / 86400000);
}
function fmtDay(key) {
  return new Date(key + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
}

/* ---------- tiny seeded random (same day = same quests) ---------- */
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seededQuests(pool, seed, n) {
  const r = rng(hashStr(seed));
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const out = [], used = new Set();
  for (const q of arr) {
    if (used.has(q.group)) continue;
    used.add(q.group);
    out.push(q);
    if (out.length === n) break;
  }
  return out;
}

/* ---------- save / load ---------- */
function save(touch = true) {
  if (touch) state.savedAt = Date.now();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  if (touch) scheduleCloud();
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
    if (data) state = merge(makeState(), JSON.parse(data));
  } catch (e) {}
}

// Fixes up older saves (v1 / v2) so everything new has a sensible value
function migrate() {
  if (state.eggMinutes > 0) { state.eggProgress.cave += state.eggMinutes; state.eggMinutes = 0; }
  if (!state.stats.totalXp && (state.lv > 1 || state.xp > 0)) {
    let t = state.xp;
    for (let i = 1; i < state.lv; i++) t += i * 50;
    state.stats.totalXp = t;
  }
  if (!EGGS.some((e) => e.id === state.eggType)) state.eggType = "cave";
  if (!state.owned.eggs.includes("cave")) state.owned.eggs.push("cave");
  state.name = String(state.name || "FRIEND").slice(0, MAX_NAME);
  state.stats.bestStreak = Math.max(state.stats.bestStreak, globalStreak());
}

/* =========================================================
   4. TEXT
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
   5. SOUND (generated in code, no files needed)
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

const getVoice = () => VOICES.find((v) => v.id === state.equip.voice) || VOICES[0];
const blip = () => { const v = getVoice(); beep(v.f + Math.random() * 60, 0.04, 0.03, v.wave); };

const levelUpSound = () => melody([523, 659, 784, 1047]);
const saveSound    = () => melody([880, 1175], 90, 0.1, 0.05);
const damageSound  = () => beep(120, 0.25, 0.08, "sawtooth");
const coinSound    = () => melody([988, 1319], 70, 0.1, 0.05);
const errorSound   = () => beep(150, 0.15, 0.07);
const trophySound  = () => melody([784, 988, 1175, 1568], 90);
const hatchSound   = () => melody([392, 523, 659, 784, 1047, 1319], 110);
const chimeSound   = () => melody([784, 1047, 1319], 120);

/* =========================================================
   6. TYPEWRITER TEXT
   ========================================================= */
const textEl = $("text");
let typeTimer = null;

function say(message, speed = 28) {
  clearInterval(typeTimer);
  const full = "* " + message;
  textEl.textContent = "";
  let i = 0;
  typeTimer = setInterval(() => {
    const ch = full[i];
    textEl.textContent += ch;
    if (ch !== " " && ch !== "\n") blip();
    i++;
    if (i >= full.length) clearInterval(typeTimer);
  }, speed);
}

/* =========================================================
   7. PIXEL DRAWING
   ========================================================= */
const soulCtx = $("soul").getContext("2d");
const HEART = ["01100110", "11111111", "11111111", "11111111", "01111110", "00111100", "00011000"];

function drawSoul(color) {
  soulCtx.clearRect(0, 0, 8, 7);
  soulCtx.fillStyle = color;
  HEART.forEach((row, y) => [...row].forEach((cell, x) => { if (cell === "1") soulCtx.fillRect(x, y, 1, 1); }));
}

function shade(hex, f) {
  const h = hex.replace("#", "");
  const ch = (i) => parseInt(h.slice(i, i + 2), 16);
  const m = (v) => Math.max(0, Math.min(255, Math.round(f > 1 ? v + (255 - v) * (f - 1) : v * f)));
  return `rgb(${m(ch(0))},${m(ch(2))},${m(ch(4))})`;
}

const getMonster = (id) => MONSTERS.find((m) => m.id === id) || MONSTERS[0];
const getEgg = (id) => EGGS.find((e) => e.id === id) || EGGS[0];

/* draws any monster (with color + hat + optional shiny sparkles) onto a 12x12 canvas */
function drawMonster(canvas, monsterId, colorId, hatId, shiny = false) {
  const m = getMonster(monsterId);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 12, 12);

  const colorDef = COLORS.find((c) => c.id === colorId);
  const base = colorDef && colorDef.hex ? colorDef.hex : m.color;
  const pal = { b: base, d: shade(base, 0.6), l: shade(base, 1.35), w: "#ffffff", k: "#111111", p: "#ff8fb0" };

  m.grid.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === ".") return;
      ctx.fillStyle = pal[ch];
      ctx.fillRect(x, y + 2, 1, 1);
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

  if (shiny) {
    [[1, 1, "#ffffff"], [10, 0, "#ffe14d"], [11, 2, "#ffffff"]].forEach(([x, y, c]) => {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, 1, 1);
    });
  }
}

/* the focus sprout (grows as the timer runs) */
const sproutCtx = $("sprout").getContext("2d");

function drawSprout(p, mode) {
  const c = sproutCtx;
  c.clearRect(0, 0, 16, 16);
  c.fillStyle = "#6b3f1d"; c.fillRect(2, 13, 12, 3);
  c.fillStyle = "#8a5a2b"; c.fillRect(2, 13, 12, 1);

  const wilt = mode === "wilt";
  const bloom = mode === "bloom";
  let h = bloom ? 9 : Math.floor(p * 9);
  if (wilt) h = 3;

  if (h === 0) { c.fillStyle = "#c9a063"; c.fillRect(8, 12, 1, 1); return; }

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

  if (bloom) {
    c.fillStyle = "#ff7ac8";
    c.fillRect(7, 2, 1, 1); c.fillRect(9, 2, 1, 1); c.fillRect(8, 1, 1, 1); c.fillRect(8, 3, 1, 1);
    c.fillStyle = "#ffe14d";
    c.fillRect(8, 2, 1, 1);
  }
}

/* eggs: each type has its own colors; cracks appear as it warms up */
const EGG_SHAPE = [
  "...eeee...", "..eeeeee..", ".eeeeeeee.", ".eeeeeeee.", "eeeeeeeeee", "eeeeeeeeee",
  "eeeeeeeeee", "eeeeeeeeee", ".eeeeeeee.", ".eeeeeeee.", "..eeeeee..", "...eeee...",
];

function drawEggOn(canvas, egg, ratio) {
  const c = canvas.getContext("2d");
  c.clearRect(0, 0, 10, 12);
  c.fillStyle = egg.shell;
  EGG_SHAPE.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === "e") c.fillRect(x, y, 1, 1); }));
  c.fillStyle = egg.spot;
  [[3, 5], [6, 7], [5, 3], [2, 8], [7, 4]].forEach(([x, y]) => c.fillRect(x, y, 1, 1));

  c.fillStyle = egg.crack;
  const cracks = [];
  if (ratio >= 0.33) cracks.push([5, 1], [4, 2], [5, 3]);
  if (ratio >= 0.66) cracks.push([4, 4], [5, 5], [4, 6]);
  if (ratio >= 0.9)  cracks.push([5, 7], [6, 8], [5, 9]);
  cracks.forEach(([x, y]) => c.fillRect(x, y, 1, 1));
}

/* little cave decorations for the cavern fields (8x8) */
const DECOR = {
  crystal: { pal: { c: "#7a5cff", C: "#c2b2ff" }, grid: ["...c....", "..cCc...", "..cCc.c.", ".cCCcCc.", ".cCCcCc.", ".cCCcCc.", "..ccccc.", "........"] },
  mushroom: { pal: { r: "#38d6c8", w: "#e8fffb", s: "#d9d2b0" }, grid: ["..rrrr..", ".rwrrwr.", "rrrrrrrr", ".rrrrrr.", "...ss...", "...ss...", "...ss...", "........"] },
  stone: { pal: { g: "#6a6a86", G: "#8c8cae" }, grid: ["........", "........", "..gggg..", ".gGggGg.", "gggggggg", "gGggggGg", "gggggggg", "........"] },
};

function drawDecor(canvas, kind) {
  const d = DECOR[kind];
  const c = canvas.getContext("2d");
  c.clearRect(0, 0, 8, 8);
  d.grid.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== ".") { c.fillStyle = d.pal[ch]; c.fillRect(x, y, 1, 1); } }));
}

/* =========================================================
   8. ANIMATED BACKGROUNDS + FRAMES
   ========================================================= */
const bgCanvas = $("bg");
const bgCtx = bgCanvas.getContext("2d");
const PX = 4;
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
  } else if (mode === "rain") {
    p.vy = 6 + r() * 5;
    p.s = 2; p.h = PX * 3;
    p.c = "#7fb8ff";
  } else if (mode === "bubbles") {
    p.vy = -(0.3 + r() * 0.5);
    p.s = PX * (1 + Math.floor(r() * 3));
    p.c = "#9fe8ff";
  } else if (mode === "leaves") {
    p.vy = 0.6 + r() * 0.8;
    p.s = PX * 1.5;
    p.c = ["#5fcf5f", "#e0a030", "#d05a3a"][Math.floor(r() * 3)];
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
    } else if (bgMode === "rain") {
      p.y += p.vy;
      if (p.y > h + 12) { p.y = -12; p.x = Math.random() * w; }
      a = 0.5;
    } else if (bgMode === "bubbles") {
      p.y += p.vy; p.x += Math.sin(p.t) * 0.4;
      if (p.y < -16) { p.y = h + 16; p.x = Math.random() * w; }
      a = 0.3 + 0.25 * Math.abs(Math.sin(p.t));
    } else if (bgMode === "leaves") {
      p.y += p.vy; p.x += Math.sin(p.t) * 0.9;
      if (p.y > h + 8) { p.y = -8; p.x = Math.random() * w; }
      a = 0.8;
    }
    bgCtx.globalAlpha = a;
    bgCtx.fillStyle = p.c;
    bgCtx.fillRect(Math.round(p.x / PX) * PX, Math.round(p.y / PX) * PX, p.s, p.h || p.s);
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
  const divisor = { stars: 12000, snow: 12000, embers: 18000, fireflies: 40000, rain: 9000, bubbles: 25000, leaves: 20000 }[bgMode] || 15000;
  const n = Math.max(10, Math.min(120, Math.floor(area / divisor)));
  particles = Array.from({ length: n }, () => makeParticle(bgMode, true));
  bgFrame();
}
window.addEventListener("resize", applyBg);

function applyFrame() {
  const f = FRAMES.find((x) => x.id === state.equip.frame) || FRAMES[0];
  document.documentElement.style.setProperty("--frame", f.hex);
}

/* =========================================================
   9. STREAK
   ========================================================= */
function activeDay(key) { return (state.history[key] || 0) > 0 || !!state.frozen[key]; }

function globalStreak() {
  let s = 0;
  const d = new Date();
  if (!activeDay(dayKey(d))) d.setDate(d.getDate() - 1);
  while (activeDay(dayKey(d))) { s++; d.setDate(d.getDate() - 1); }
  return s;
}

function renderStreak() {
  const s = globalStreak();
  $("streak-count").textContent = `${s} DAY${s === 1 ? "" : "S"}`;

  const row = $("streak-days");
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
   10. REWARDS, QUEST COUNTERS, TROPHIES
   ========================================================= */
function rollPeriods() {
  const t = dayKey(), w = weekKey();
  if (state.daily.day !== t) {
    state.daily = { day: t, d: {}, claimed: {}, cap: { habit: 0, focus: 0, habitN: 0, focusMin: 0 } };
  }
  if (state.weekly.week !== w) {
    state.weekly = { week: w, w: {}, claimed: {} };
  }
}

function bump(metric, n = 1) {
  rollPeriods();
  state.daily.d[metric] = (state.daily.d[metric] || 0) + n;
  state.weekly.w[metric] = (state.weekly.w[metric] || 0) + n;
}

function addSparks(n) { state.coins += n; state.stats.earned += n; }

// sparks that are limited per day (habits and focus). Returns how many you really got.
function earnCapped(kind, n) {
  rollPeriods();
  const cap = kind === "habit" ? ECON.habitSparkCap : ECON.focusSparkCap;
  const give = Math.max(0, Math.min(n, cap - state.daily.cap[kind]));
  state.daily.cap[kind] += give;
  addSparks(give);
  return give;
}

// returns { up: levels gained, sparks: bonus sparks }
function addXp(n) {
  state.xp += n;
  state.stats.totalXp += n;
  let up = 0, sparks = 0;
  while (state.xp >= state.lv * 50) {
    state.xp -= state.lv * 50;
    state.lv += 1;
    state.maxHp += 4;
    state.hp = state.maxHp;
    up++;
    const bonus = ECON.levelUpSparks * state.lv;
    addSparks(bonus);
    sparks += bonus;
  }
  return { up, sparks };
}

function checkAchievements() {
  state.stats.bestStreak = Math.max(state.stats.bestStreak, globalStreak());
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
const habitsEl = $("habits");

function completeHabit(id) {
  ensureAudio();
  const h = state.habits.find((x) => x.id === id);
  if (!h) return;
  if (h.doneToday) { say(pick(TEXT.alreadyDone)); return; }

  rollPeriods();
  h.doneToday = true;
  h.streak += 1;
  const today = dayKey();
  state.history[today] = (state.history[today] || 0) + 1;
  state.stats.habits += 1;
  bump("habits");
  const hr = new Date().getHours();
  if (hr < 10) bump("early");
  if (hr >= 21) bump("late");

  let msg, lv = { up: 0, sparks: 0 };
  if (state.daily.cap.habitN < ECON.habitRewardCap) {
    state.daily.cap.habitN += 1;
    const xp = 10 + Math.min(h.streak, 5) * 2;
    const sparks = earnCapped("habit", ECON.habitSparks);
    lv = addXp(xp);
    msg = pick(TEXT.done) + `\n  (+${xp} XP, +${sparks} SPARKS)`;
    beep(660, 0.1, 0.06);
  } else {
    msg = "Nice! But today's habit rewards are maxed out. Your streak still counts!";
    beep(500, 0.1, 0.04);
  }

  if (state.habits.length >= 3 && state.habits.every((x) => x.doneToday)) state.stats.cleanSweep = true;
  if (state.habits.length >= 2 && state.habits.every((x) => x.doneToday) && !state.daily.d.perfect) bump("perfect");

  if (lv.up) {
    msg = pick(TEXT.levelUp) + `\n  You are now LV ${state.lv}. HP maxed out! (+${lv.sparks} SPARKS)`;
    flash();
    levelUpSound();
  }
  commit(msg);
}

function addHabit(name) {
  ensureAudio();
  name = name.trim();
  if (!name) return;
  if (state.habits.length >= 20) { errorSound(); say("That's a lot of habits! Try finishing a few first. (Max 20)"); return; }
  state.habits.push({ id: state.nextId++, name, doneToday: false, streak: 0 });
  beep(520, 0.08, 0.05);
  commit(pick(TEXT.added));
}

function removeHabit(id) {
  ensureAudio();
  state.habits = state.habits.filter((h) => h.id !== id);
  commit(state.habits.length ? pick(TEXT.removed) : pick(TEXT.empty));
}

function renderChips() {
  const box = $("chips");
  box.innerHTML = "";
  const have = state.habits.map((h) => h.name.toLowerCase());
  SUGGESTED.filter((s) => !have.includes(s.toLowerCase())).forEach((s) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = "+ " + s;
    b.addEventListener("click", () => addHabit(s));
    box.appendChild(b);
  });
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
    if (missedDays > 0) { damage += missedDays * 2; h.streak = 0; }
    h.doneToday = false;
  });

  damage = Math.min(damage, 30);
  state.lastVisit = today;

  if (damage > 0 && state.items.freeze > 0) {
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
      state.hp = state.maxHp;
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
const timerEl = $("timer");
const focusBtn = $("focus-btn");
let focusMin = 25;
let focusTimer = null;
let sproutMode = "idle";
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

  const egg = getEgg(state.eggType);
  const have = state.eggProgress[egg.id] || 0;
  const ratio = Math.min(1, have / egg.goal);
  $("eggname").textContent = `${egg.name}: FOCUS ${egg.goal} MIN TO HATCH`;
  $("eggfill").style.width = ratio * 100 + "%";
  $("eggtext").textContent = `${have} / ${egg.goal} MIN`;
  drawEggOn($("egg"), egg, ratio);
}

function startFocusLoop() {
  clearInterval(focusTimer);
  focusTimer = setInterval(tickFocus, 500);
  tickFocus();
}

function tickFocus() {
  if (!state.focus) { clearInterval(focusTimer); return; }
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

/* ---- hatching ---- */
function hatchOne(egg) {
  const owned = state.owned.monsters;
  const weights = egg.pool.map((id) => (owned.includes(id) ? 1 : 3));      // new species are more likely
  let roll = Math.random() * weights.reduce((a, b) => a + b, 0);
  let id = egg.pool[egg.pool.length - 1];
  for (let i = 0; i < egg.pool.length; i++) {
    roll -= weights[i];
    if (roll < 0) { id = egg.pool[i]; break; }
  }

  let chance = egg.shiny;
  let charm = false;
  if (state.items.charm > 0) { state.items.charm -= 1; chance *= 4; charm = true; }
  const shiny = Math.random() < chance;

  const isNew = !owned.includes(id);
  if (isNew) owned.push(id);
  state.hatchLog.push({ id, day: dayKey(), shiny, egg: egg.id, t: Date.now() });
  state.stats.hatched += 1;
  if (shiny) state.stats.shinies += 1;
  bump("hatches");
  return { id, shiny, isNew, egg, charm };
}

// adds focus minutes to the selected egg; returns a list of hatched monsters
function addEggMinutes(n) {
  const egg = getEgg(state.eggType);
  state.eggProgress[egg.id] = (state.eggProgress[egg.id] || 0) + n;
  const out = [];
  while (state.eggProgress[egg.id] >= egg.goal) {
    state.eggProgress[egg.id] -= egg.goal;
    out.push(hatchOne(egg));
  }
  return out;
}

function hatchLine(h) {
  const m = getMonster(h.id);
  let s = `\n* The ${h.egg.name} hatched! It's ${m.name}!`;
  if (h.shiny) s += "\n* SHINY! It sparkles! What a rare find!";
  if (h.isNew) s += "\n* A new monster type! Check the CAVERN.";
  return s;
}

function completeFocus() {
  const f = state.focus;
  if (!f) return;
  clearInterval(focusTimer);

  const min = f.total;
  state.focus = null;
  giveUpArmed = false;
  rollPeriods();

  const room = Math.max(0, ECON.focusMinCap - state.daily.cap.focusMin);
  const rewardedMin = Math.min(min, room);
  state.daily.cap.focusMin += rewardedMin;

  const xp = Math.round(rewardedMin * 1.5);
  const sparks = earnCapped("focus", Math.floor(rewardedMin / ECON.focusMinPerSpark));
  const lv = addXp(xp);

  state.stats.focusMin += min;
  state.stats.sessions += 1;
  bump("focusMin", min);
  if (min >= 15) bump("sessions");

  const today = dayKey();
  state.history[today] = (state.history[today] || 0) + 1;      // focusing counts for your streak

  let msg = "Focus complete! The sprout bloomed.";
  msg += rewardedMin > 0
    ? `\n  (+${xp} XP, +${sparks} SPARKS)`
    : "\n  (Today's focus rewards are maxed out, but your egg still warms!)";
  if (lv.up) { msg += `\n* LEVEL UP! You are now LV ${state.lv}. (+${lv.sparks} SPARKS)`; flash(); }

  const hatched = addEggMinutes(min);
  hatched.forEach((h) => { msg += hatchLine(h); });

  if (hatched.length) hatchSound();
  else if (lv.up) levelUpSound();
  else chimeSound();

  sproutMode = "bloom";
  setTimeout(() => { if (sproutMode === "bloom") { sproutMode = "idle"; updateFocusUI(); } }, 4000);
  commit(msg);
}

focusBtn.addEventListener("click", () => {
  ensureAudio();
  if (!state.focus) { startFocus(); return; }
  if (giveUpArmed) { giveUp(); return; }
  giveUpArmed = true;
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

$("change-egg").addEventListener("click", () => { ensureAudio(); beep(440, 0.04, 0.03); showTab("eggs"); });

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && state.focus) tickFocus();
  if (document.hidden) flushCloud();
});

/* =========================================================
   13. EGGS TAB
   ========================================================= */
function makeMonCanvas(id, opts = {}) {
  const c = document.createElement("canvas");
  c.width = 12; c.height = 12;
  drawMonster(c, id, opts.color || "default", opts.hat || "none", !!opts.shiny);
  if (opts.sil) c.classList.add("sil");
  return c;
}

function renderEggs() {
  $("egg-coins").textContent = `${state.coins} SPARKS`;
  const list = $("egg-list");
  list.innerHTML = "";

  EGGS.forEach((egg) => {
    const owned = state.owned.eggs.includes(egg.id);
    const active = state.eggType === egg.id;
    const have = state.eggProgress[egg.id] || 0;

    const card = document.createElement("div");
    card.className = "card" + (active ? " equipped" : "");

    const ec = document.createElement("canvas");
    ec.width = 10; ec.height = 12; ec.className = "egg-pv";
    drawEggOn(ec, egg, owned ? Math.min(1, have / egg.goal) : 0);
    if (!owned) ec.style.filter = "brightness(0.5)";
    card.appendChild(ec);

    const n = document.createElement("div"); n.className = "cname"; n.textContent = egg.name; card.appendChild(n);
    const d = document.createElement("div"); d.className = "cdesc"; d.textContent = `${egg.desc} ${egg.goal} MIN TO HATCH.`; card.appendChild(d);

    const pool = document.createElement("div"); pool.className = "pool";
    egg.pool.forEach((id) => {
      const c = makeMonCanvas(id, { sil: !state.owned.monsters.includes(id) });
      c.title = state.owned.monsters.includes(id) ? getMonster(id).name : "???";
      pool.appendChild(c);
    });
    card.appendChild(pool);

    if (owned) {
      const bar = document.createElement("div"); bar.className = "bar";
      const fill = document.createElement("div"); fill.className = "fill xp";
      fill.style.width = Math.min(100, (have / egg.goal) * 100) + "%";
      bar.appendChild(fill); card.appendChild(bar);
      const t = document.createElement("div"); t.className = "cdesc"; t.textContent = `${have} / ${egg.goal} MIN`; card.appendChild(t);
    }

    const b = document.createElement("button");
    if (!owned) {
      b.textContent = `UNLOCK ${egg.cost}`;
      b.addEventListener("click", () => buy("eggs", egg));
    } else if (active) {
      b.textContent = "INCUBATING"; b.disabled = true;
    } else {
      b.textContent = "INCUBATE THIS";
      b.addEventListener("click", () => {
        ensureAudio();
        state.eggType = egg.id;
        beep(700, 0.08, 0.05);
        commit(`Now incubating a ${egg.name}. Focus time will warm it up!`);
      });
    }
    card.appendChild(b);
    list.appendChild(card);
  });
}

/* =========================================================
   14. CAVERN (every hatched monster, grouped by day)
   ========================================================= */
let cavernDays = 10;

function renderCavern() {
  const species = state.owned.monsters.length;
  $("dex-count").textContent = `${species} / ${MONSTERS.length} FOUND`;

  const dex = $("dex");
  dex.innerHTML = "";
  MONSTERS.forEach((m) => {
    const found = state.owned.monsters.includes(m.id);
    const c = makeMonCanvas(m.id, { sil: !found });
    c.title = found ? m.name : "???";
    dex.appendChild(c);
  });

  const box = $("fields");
  box.innerHTML = "";

  const byDay = {};
  state.hatchLog.forEach((e) => { (byDay[e.day] = byDay[e.day] || []).push(e); });
  const days = Object.keys(byDay).sort().reverse();

  if (!days.length) {
    const p = document.createElement("p");
    p.className = "empty-note";
    p.textContent = "NOTHING HAS HATCHED YET. START A FOCUS SESSION TO WARM YOUR EGG. EVERY MONSTER YOU HATCH WILL LIVE HERE, ON THE DAY IT WAS BORN.";
    box.appendChild(p);
  }

  days.slice(0, cavernDays).forEach((day) => {
    const wrap = document.createElement("div");
    wrap.className = "day";

    const head = document.createElement("div");
    head.className = "day-head";
    const l = document.createElement("span"); l.textContent = day === dayKey() ? `TODAY - ${fmtDay(day)}` : fmtDay(day);
    const r = document.createElement("span"); r.textContent = `${byDay[day].length} HATCHED`;
    head.append(l, r);

    const field = document.createElement("div");
    field.className = "field";

    // decorations are picked from the date, so each day looks a little different
    const rnd = rng(hashStr(day));
    const kinds = Object.keys(DECOR);
    for (let i = 0; i < 3; i++) {
      const dc = document.createElement("canvas");
      dc.width = 8; dc.height = 8; dc.className = "decor";
      dc.style.left = (4 + Math.floor(rnd() * 84)) + "%";
      drawDecor(dc, kinds[Math.floor(rnd() * kinds.length)]);
      field.appendChild(dc);
    }

    const mons = document.createElement("div");
    mons.className = "mons";
    byDay[day].forEach((e) => {
      const b = document.createElement("button");
      b.type = "button";
      const m = getMonster(e.id);
      const c = makeMonCanvas(e.id, { shiny: e.shiny });
      b.title = m.name + (e.shiny ? " (SHINY)" : "");
      b.setAttribute("aria-label", b.title);
      b.appendChild(c);
      b.addEventListener("click", () => {
        ensureAudio();
        beep(500 + Math.random() * 200, 0.08, 0.05);
        say(`${m.name}${e.shiny ? " (SHINY)" : ""} - hatched from a ${getEgg(e.egg).name} on ${fmtDay(e.day)}.`);
      });
      mons.appendChild(b);
    });
    field.appendChild(mons);

    wrap.append(head, field);
    box.appendChild(wrap);
  });

  $("more-days").hidden = days.length <= cavernDays;
}

$("more-days").addEventListener("click", () => { cavernDays += 10; renderCavern(); });

/* =========================================================
   15. QUESTS
   ========================================================= */
function getMetric(scope, metric) {
  if (metric === "activeDays") {
    let n = 0;
    const d = new Date(state.weekly.week + "T00:00:00");
    for (let i = 0; i < 7; i++) {
      if ((state.history[dayKey(d)] || 0) > 0) n++;
      d.setDate(d.getDate() + 1);
    }
    return n;
  }
  const src = scope === "daily" ? state.daily.d : state.weekly.w;
  return src[metric] || 0;
}

function activeQuests(scope) {
  rollPeriods();
  return scope === "daily"
    ? seededQuests(DAILY_POOL, "d" + state.daily.day, 3)
    : seededQuests(WEEKLY_POOL, "w" + state.weekly.week, 3);
}

function claimQuest(scope, q) {
  ensureAudio();
  const store = scope === "daily" ? state.daily : state.weekly;
  if (store.claimed[q.id] || getMetric(scope, q.metric) < q.target) return;
  store.claimed[q.id] = true;
  addSparks(q.reward);
  state.stats.quests += 1;
  coinSound();
  commit(`Quest complete: ${q.name}! +${q.reward} SPARKS`);
}

function questRows(scope, listEl) {
  listEl.innerHTML = "";
  const store = scope === "daily" ? state.daily : state.weekly;
  activeQuests(scope).forEach((q) => {
    const val = Math.min(q.target, getMetric(scope, q.metric));
    const done = val >= q.target;
    const claimed = !!store.claimed[q.id];

    const li = document.createElement("li");
    if (claimed) li.classList.add("claimed"); else if (done) li.classList.add("ready");

    const info = document.createElement("div"); info.className = "qinfo";
    const n = document.createElement("div"); n.className = "qname"; n.textContent = q.name;
    const d = document.createElement("div"); d.className = "qdesc"; d.textContent = q.desc;
    const p = document.createElement("div"); p.className = "qprog"; p.textContent = `${val} / ${q.target}`;
    info.append(n, d, p);

    const b = document.createElement("button");
    b.className = "qbtn";
    if (claimed) { b.textContent = "DONE"; b.disabled = true; }
    else if (done) { b.textContent = `CLAIM +${q.reward}`; b.addEventListener("click", () => claimQuest(scope, q)); }
    else { b.textContent = `+${q.reward}`; b.disabled = true; }

    li.append(info, b);
    listEl.appendChild(li);
  });
}

function renderQuests() {
  rollPeriods();
  questRows("daily", $("quest-daily"));
  questRows("weekly", $("quest-weekly"));
  const c = state.daily.cap;
  $("econ-note").textContent =
    `TODAY'S SPARK LIMITS: HABITS ${c.habit}/${ECON.habitSparkCap}, FOCUS ${c.focus}/${ECON.focusSparkCap}. ` +
    `QUESTS, TROPHIES AND LEVEL-UPS HAVE NO DAILY LIMIT.`;
}

function claimableCount() {
  rollPeriods();
  let n = 0;
  [["daily", state.daily], ["weekly", state.weekly]].forEach(([scope, store]) => {
    activeQuests(scope).forEach((q) => { if (!store.claimed[q.id] && getMetric(scope, q.metric) >= q.target) n++; });
  });
  return n;
}

function updateBadges() {
  const n = claimableCount();
  $("tab-quests").textContent = n ? "QUESTS !" : "QUESTS";
}

/* =========================================================
   16. SHOP
   ========================================================= */
const shopListEl = $("shop-list");
let shopTab = "pets";

function makeCard(o) {
  const el = document.createElement("div");
  el.className = "card" + (o.equipped ? " equipped" : "");

  if (o.preview) {
    const c = document.createElement("canvas");
    c.width = 12; c.height = 12;
    c.className = "pv" + (o.sil ? " sil" : "");
    o.preview(c);
    el.appendChild(c);
  }

  const n = document.createElement("div"); n.className = "cname"; n.textContent = o.name; el.appendChild(n);
  if (o.desc) { const d = document.createElement("div"); d.className = "cdesc"; d.textContent = o.desc; el.appendChild(d); }

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

const EQUIP_KEY = { pets: "monster", hats: "hat", colors: "color", bgs: "bg", frames: "frame", voices: "voice" };
const OWN_KEY   = { pets: "monsters", hats: "hats", colors: "colors", bgs: "bgs", frames: "frames", voices: "voices" };

function renderShop() {
  $("shop-coins").textContent = `${state.coins} SPARKS`;
  document.querySelectorAll(".stab[data-shop]").forEach((b) => b.classList.toggle("active", b.dataset.shop === shopTab));
  shopListEl.innerHTML = "";
  const E = state.equip;

  if (shopTab === "items") {
    ITEMS.forEach((it) => {
      const count = state.items[it.id] || 0;
      let extra = null;
      if (it.id === "snack") extra = { label: "USE", disabled: count < 1 || state.hp >= state.maxHp, onClick: () => useItem("snack") };
      if (it.id === "mega")  extra = { label: "USE", disabled: count < 1 || state.hp >= state.maxHp, onClick: () => useItem("mega") };
      if (it.id === "warmer") extra = { label: "USE", disabled: count < 1, onClick: () => useItem("warmer") };
      shopListEl.appendChild(makeCard({
        name: `${it.name} x${count}`,
        desc: it.desc,
        label: count >= it.max ? "FULL" : `BUY ${it.cost}`,
        disabled: count >= it.max,
        onClick: () => buy("items", it),
        extra,
      }));
    });
    return;
  }

  const cfg = {
    pets:   { list: MONSTERS, preview: (it) => (c) => drawMonster(c, it.id, "default", "none") },
    hats:   { list: HATS,     preview: (it) => (c) => drawMonster(c, E.monster, E.color, it.id) },
    colors: { list: COLORS,   preview: (it) => (c) => drawMonster(c, E.monster, it.id, E.hat) },
    bgs:    { list: BGS,      preview: null },
    frames: { list: FRAMES,   preview: null },
    voices: { list: VOICES,   preview: null },
  }[shopTab];

  cfg.list.forEach((it) => {
    const owned = state.owned[OWN_KEY[shopTab]].includes(it.id);
    const equipped = E[EQUIP_KEY[shopTab]] === it.id;
    const isPet = shopTab === "pets";

    let label, disabled = false, onClick;
    if (equipped) { label = "EQUIPPED"; disabled = true; }
    else if (owned) { label = "EQUIP"; onClick = () => equip(shopTab, it); }
    else if (isPet) { label = "HATCH IT"; disabled = true; }
    else { label = `BUY ${it.cost}`; onClick = () => buy(shopTab === "pets" ? "monsters" : OWN_KEY[shopTab], it); }

    const card = makeCard({
      name: isPet && !owned ? "???" : it.name,
      desc: isPet ? (owned ? it.desc : "Find it in an egg.") : it.desc,
      equipped,
      sil: isPet && !owned,
      preview: cfg.preview ? cfg.preview(it) : null,
      label, disabled, onClick: onClick || (() => {}),
    });
    shopListEl.appendChild(card);
  });
}

function buy(kind, item) {
  ensureAudio();
  const isItem = kind === "items";
  if (isItem && (state.items[item.id] || 0) >= item.max) { errorSound(); say(`You can only carry ${item.max} of those.`); return; }
  if (state.coins < item.cost) {
    errorSound();
    say(`You need ${item.cost - state.coins} more SPARKS for that.`);
    return;
  }
  state.coins -= item.cost;
  state.stats.spent += item.cost;
  state.stats.purchases += 1;
  if (isItem) state.items[item.id] = (state.items[item.id] || 0) + 1;
  else state.owned[kind].push(item.id);
  coinSound();
  const tail = isItem ? "" : kind === "eggs" ? " Pick INCUBATE THIS to use it." : " Press EQUIP to use it.";
  commit(`Bought ${item.name}!` + tail);
}

function equip(tab, item) {
  ensureAudio();
  state.equip[EQUIP_KEY[tab]] = item.id;
  if (tab === "bgs") applyBg();
  if (tab === "frames") applyFrame();
  beep(700, 0.08, 0.05);
  commit(tab === "voices" ? `${item.name} voice equipped. Can you hear the difference?` : `${item.name} equipped.`);
}

function useItem(id) {
  ensureAudio();
  if ((state.items[id] || 0) < 1) return;
  if (id === "snack" || id === "mega") {
    if (state.hp >= state.maxHp) return;
    state.items[id] -= 1;
    state.hp = id === "mega" ? state.maxHp : Math.min(state.maxHp, state.hp + 10);
    beep(880, 0.1, 0.05);
    commit(id === "mega" ? "You ate the mega snack. HP fully restored!" : "You ate the snack. HP +10!");
  } else if (id === "warmer") {
    state.items.warmer -= 1;
    const hatched = addEggMinutes(15);
    let msg = "The warmer glows. +15 minutes on your egg!";
    hatched.forEach((h) => { msg += hatchLine(h); });
    if (hatched.length) hatchSound(); else chimeSound();
    commit(msg);
  }
}

document.querySelectorAll(".stab[data-shop]").forEach((b) => {
  b.addEventListener("click", () => {
    ensureAudio();
    shopTab = b.dataset.shop;
    beep(440, 0.04, 0.03);
    renderShop();
  });
});

/* =========================================================
   17. TROPHIES
   ========================================================= */
function renderTrophies() {
  const list = $("trophy-list");
  list.innerHTML = "";
  let got = 0;

  ACHIEVEMENTS.forEach((a) => {
    const unlocked = !!state.ach[a.id];
    if (unlocked) got++;

    const li = document.createElement("li");
    if (unlocked) li.classList.add("got");

    const mark = document.createElement("span"); mark.className = "tmark"; mark.textContent = unlocked ? "*" : "-";
    const info = document.createElement("div");
    const nm = document.createElement("div"); nm.className = "tname"; nm.textContent = a.name;
    const ds = document.createElement("div"); ds.className = "tdesc"; ds.textContent = a.desc;
    info.append(nm, ds);
    const rw = document.createElement("span"); rw.className = "treward"; rw.textContent = `+${a.reward}`;

    li.append(mark, info, rw);
    list.appendChild(li);
  });

  $("trophy-count").textContent = `${got} / ${ACHIEVEMENTS.length}`;
}

/* =========================================================
   18. ONLINE: accounts, cloud save, leaderboards
   (the actual Firebase code lives in cloud.js)
   ========================================================= */
let cloudUser = null;
let cloudTimer = null;
let cloudDirty = false;
let lbField = "totalXp";

const hasCloud = () => !!(window.Cloud && window.Cloud.configured && window.Cloud.ready);

function publicStats() {
  const n = (v) => Math.max(0, Math.floor(Number(v) || 0));
  return {
    name: state.name,
    lv: n(state.lv),
    totalXp: n(state.stats.totalXp),
    focusMin: n(state.stats.focusMin),
    bestStreak: n(state.stats.bestStreak),
    hatched: n(state.stats.hatched),
  };
}

function setSyncStatus(txt) { const el = $("sync-status"); if (el) el.textContent = txt; }

function scheduleCloud() {
  if (!cloudUser || !hasCloud()) return;
  cloudDirty = true;
  clearTimeout(cloudTimer);
  cloudTimer = setTimeout(pushCloud, 15000);        // wait a bit so we don't write on every click
}

function flushCloud() { if (cloudDirty) pushCloud(); }

async function pushCloud() {
  clearTimeout(cloudTimer);
  if (!cloudUser || !hasCloud()) return;
  cloudDirty = false;
  try {
    await window.Cloud.pushSave(JSON.stringify(state), state.savedAt);
    if (state.settings.lb) await window.Cloud.pushPublic(publicStats());
    setSyncStatus("SYNCED " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }).toUpperCase());
  } catch (e) {
    cloudDirty = true;
    setSyncStatus("SYNC FAILED. WILL RETRY.");
  }
}

const hasProgress = (s) => s.stats.habits > 0 || s.stats.sessions > 0 || s.stats.totalXp > 0;

function adoptSave(json) {
  state = merge(makeState(), JSON.parse(json));
  migrate();
  rollPeriods();
  newDayCheck();
  applyBg();
  applyFrame();
  render();
  save(false);
}

// returns a message to show (or "" for nothing). Never marks the save as "changed"
// before deciding, otherwise this device would always look newer than the cloud.
async function syncAfterLogin() {
  try {
    const remote = await window.Cloud.loadSave();
    if (!remote) {
      await pushCloud();
      return "Account ready! Your progress is now backed up online.";
    }
    let useRemote = false;
    if (!hasProgress(state)) useRemote = true;
    else if (remote.savedAt > (state.savedAt || 0) + 1000) {
      let rlv = "?";
      try { rlv = JSON.parse(remote.data).lv; } catch (e) {}
      useRemote = window.confirm(
        `Your online save (LV ${rlv}) is newer than this device (LV ${state.lv}).\n\nOK = use the online save\nCancel = keep this device and overwrite online`
      );
    }
    if (useRemote) {
      adoptSave(remote.data);
      return `Welcome back, ${state.name}! Your online save was loaded.`;
    }
    await pushCloud();
    return "Signed in! This device's progress is now saved online.";
  } catch (e) {
    cloudDirty = true;
    return "Signed in, but I couldn't sync yet. I'll try again soon.";
  }
}

async function onAuth(user) {
  cloudUser = user;
  if (user) {
    const msg = await syncAfterLogin();
    if (!state.stats.signedIn) { state.stats.signedIn = true; commit(msg); }   // unlocks the CONNECTED trophy
    else if (msg) say(msg);
  }
  renderOnline();
  if (currentTab === "online") loadLeaderboard();
}

function renderOnline() {
  const C = window.Cloud;
  const off = $("acct-off"), form = $("acct-form"), box = $("acct-in"), status = $("acct-status");
  off.hidden = form.hidden = box.hidden = true;

  if (!C) {
    off.hidden = false; status.textContent = "OFFLINE";
    off.textContent = "ONLINE FEATURES ARE LOADING, OR UNAVAILABLE RIGHT NOW (ARE YOU OFFLINE?). YOUR GAME STILL WORKS AND SAVES ON THIS DEVICE.";
  } else if (!C.configured) {
    off.hidden = false; status.textContent = "LOCAL ONLY";
    off.textContent = "ONLINE MODE ISN'T SET UP YET. (OWNER: FILL IN firebase-config.js - SEE THE SETUP STEPS.) YOUR GAME STILL WORKS AND SAVES ON THIS DEVICE.";
  } else if (C.unavailable) {
    off.hidden = false; status.textContent = "OFFLINE";
    off.textContent = "COULDN'T REACH THE ONLINE SERVICE. CHECK YOUR CONNECTION AND RELOAD.";
  } else if (!C.ready) {
    off.hidden = false; status.textContent = "CONNECTING";
    off.textContent = "CONNECTING...";
  } else if (cloudUser) {
    box.hidden = false; status.textContent = "SIGNED IN";
    $("acct-email").textContent = cloudUser.email || "YOUR GOOGLE ACCOUNT";
  } else {
    form.hidden = false; status.textContent = "GUEST";
  }
  $("lb-opt").checked = !!state.settings.lb;
}

async function withBusy(fn) {
  const btns = document.querySelectorAll("#panel-online button");
  btns.forEach((b) => (b.disabled = true));
  try { await fn(); }
  catch (e) { errorSound(); say((e && e.message) || "Something went wrong. Try again."); }
  finally { btns.forEach((b) => (b.disabled = false)); }
}

const emailVal = () => $("acct-email-in").value.trim();
const passVal = () => $("acct-pass").value;

$("acct-form").addEventListener("submit", (e) => {
  e.preventDefault();
  ensureAudio();
  withBusy(async () => { await window.Cloud.signIn(emailVal(), passVal()); $("acct-pass").value = ""; });
});
$("acct-signup").addEventListener("click", () => {
  ensureAudio();
  withBusy(async () => { await window.Cloud.signUp(emailVal(), passVal()); $("acct-pass").value = ""; });
});
$("acct-google").addEventListener("click", () => {
  ensureAudio();
  withBusy(async () => { await window.Cloud.google(); });
});
$("acct-reset").addEventListener("click", () => {
  ensureAudio();
  withBusy(async () => {
    if (!emailVal()) throw new Error("Type your email first, then press FORGOT PASSWORD.");
    await window.Cloud.reset(emailVal());
    say("Password reset email sent. Check your inbox (and spam folder).");
  });
});
$("acct-sync").addEventListener("click", () => {
  ensureAudio();
  withBusy(async () => { await pushCloud(); say("Synced!"); });
});
$("acct-out").addEventListener("click", () => {
  ensureAudio();
  withBusy(async () => {
    await pushCloud();
    await window.Cloud.signOut();
    say("Signed out. Your progress is still saved on this device.");
  });
});
$("acct-delete").addEventListener("click", () => {
  ensureAudio();
  if (!window.confirm("Delete your online account, cloud save and leaderboard entry?\n\nYour progress on THIS device stays.")) return;
  withBusy(async () => { await window.Cloud.deleteAll(); say("Your online account and data were deleted."); });
});

$("lb-opt").addEventListener("change", (e) => {
  state.settings.lb = e.target.checked;
  save();
  if (cloudUser && hasCloud()) {
    (state.settings.lb ? window.Cloud.pushPublic(publicStats()) : window.Cloud.removePublic()).catch(() => {});
  }
  say(state.settings.lb ? "You'll appear on the leaderboards (nickname + stats only)." : "You're hidden from the leaderboards.");
});

document.querySelectorAll("#lb-tabs .stab").forEach((b) => {
  b.addEventListener("click", () => {
    ensureAudio();
    lbField = b.dataset.lb;
    document.querySelectorAll("#lb-tabs .stab").forEach((x) => x.classList.toggle("active", x === b));
    beep(440, 0.04, 0.03);
    loadLeaderboard();
  });
});
$("lb-refresh").addEventListener("click", () => { ensureAudio(); loadLeaderboard(); });

function lbMessage(txt) {
  const ol = $("lb-list");
  ol.innerHTML = "";
  const li = document.createElement("li");
  li.className = "msg";
  li.textContent = txt;
  ol.appendChild(li);
}

const LB_FMT = {
  totalXp: (v) => `${v} XP`,
  focusMin: (v) => `${v} MIN`,
  bestStreak: (v) => `${v} DAYS`,
  hatched: (v) => `${v} EGGS`,
};

async function loadLeaderboard() {
  if (!window.Cloud || !window.Cloud.configured) { lbMessage("LEADERBOARDS NEED ONLINE MODE."); return; }
  if (!hasCloud()) { lbMessage("CONNECTING..."); return; }
  if (!cloudUser) { lbMessage("SIGN IN TO SEE THE LEADERBOARD."); return; }
  lbMessage("LOADING...");
  const field = lbField;
  try {
    if (state.settings.lb) { await pushCloud(); }          // make sure your own score is fresh
    const rows = await window.Cloud.leaderboard(field);
    if (field !== lbField) return;                          // user switched tabs meanwhile
    const ol = $("lb-list");
    ol.innerHTML = "";
    if (!rows.length) { lbMessage("NOBODY IS ON THE BOARD YET. BE THE FIRST!"); return; }
    rows.forEach((r, i) => {
      const li = document.createElement("li");
      if (cloudUser && r.uid === cloudUser.uid) li.classList.add("me");
      const rk = document.createElement("span"); rk.className = "lb-rank"; rk.textContent = `${i + 1}.`;
      const nm = document.createElement("span"); nm.className = "lb-name"; nm.textContent = String(r.name || "???").slice(0, 12);
      const vl = document.createElement("span"); vl.className = "lb-val"; vl.textContent = LB_FMT[field](r.value);
      li.append(rk, nm, vl);
      ol.appendChild(li);
    });
  } catch (e) {
    lbMessage((e && e.message) || "COULDN'T LOAD THE LEADERBOARD.");
  }
}

window.addEventListener("cloud-auth", (e) => onAuth(e.detail.user));
window.addEventListener("cloud-ready", () => { renderOnline(); });

/* =========================================================
   19. RENDER
   ========================================================= */
const petCanvas = $("pet");
const nameBtn = $("name-btn");
let currentTab = "habits";

const hpPercent = () => Math.max(0, (state.hp / state.maxHp) * 100);

function renderPanel(name) {
  if (name === "habits") renderChips();
  else if (name === "quests") renderQuests();
  else if (name === "eggs") renderEggs();
  else if (name === "cavern") renderCavern();
  else if (name === "shop") renderShop();
  else if (name === "trophies") renderTrophies();
  else if (name === "online") renderOnline();
}

function render() {
  nameBtn.textContent = state.name;
  $("lv").textContent = `LV ${state.lv}`;
  $("coins").textContent = `${state.coins} SPARKS`;
  $("hpfill").style.width = hpPercent() + "%";
  $("hptext").textContent = `${state.hp} / ${state.maxHp}`;

  const xpNeeded = state.lv * 50;
  $("xpfill").style.width = (state.xp / xpNeeded) * 100 + "%";
  $("xptext").textContent = `${state.xp} / ${xpNeeded}`;

  const pct = hpPercent();
  drawSoul(pct > 50 ? "#ff0000" : pct > 25 ? "#ff7f27" : "#a000a0");

  drawMonster(petCanvas, state.equip.monster, state.equip.color, state.equip.hat);
  petCanvas.classList.toggle("sad", pct <= 25);

  $("mute-btn").textContent = state.muted ? "SOUND: OFF" : "SOUND: ON";

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
    li.addEventListener("click", (e) => { if (e.target === del) return; completeHabit(h.id); });
    del.addEventListener("click", (e) => { e.stopPropagation(); removeHabit(h.id); });
    habitsEl.appendChild(li);
  });

  renderStreak();
  updateFocusUI();
  renderPanel(currentTab);
  updateBadges();
}

/* =========================================================
   20. RENAME, PET, TABS, EFFECTS
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

$("pet-btn").addEventListener("click", () => {
  ensureAudio();
  const m = getMonster(state.equip.monster);
  const sad = hpPercent() <= 25;
  say(sad ? `${m.name} looks sleepy... Maybe a snack would help?` : pick(m.lines));
  beep(500 + Math.random() * 200, 0.08, 0.05);
  bump("pets");
  updateBadges();
  petCanvas.classList.remove("hop");
  void petCanvas.offsetWidth;
  petCanvas.classList.add("hop");
  setTimeout(() => petCanvas.classList.remove("hop"), 320);
  save();
});

function showTab(name) {
  currentTab = name;
  document.querySelectorAll(".panel").forEach((p) => { p.hidden = p.id !== "panel-" + name; });
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
  if (name === "cavern") { bump("cave"); save(); }
  renderPanel(name);
  updateBadges();
  if (name === "online") loadLeaderboard();
}
document.querySelectorAll(".tab").forEach((b) => {
  b.addEventListener("click", () => { ensureAudio(); beep(440, 0.04, 0.03); showTab(b.dataset.tab); });
});

function flash() {
  document.body.classList.remove("flash");
  void document.body.offsetWidth;
  document.body.classList.add("flash");
}
function shake() {
  const g = $("game");
  g.classList.remove("shake");
  void g.offsetWidth;
  g.classList.add("shake");
}

/* =========================================================
   21. OTHER EVENTS
   ========================================================= */
$("add-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("new-habit");
  addHabit(input.value);
  input.value = "";
});

$("save-btn").addEventListener("click", () => { ensureAudio(); save(); saveSound(); say(pick(TEXT.saved)); });

$("mute-btn").addEventListener("click", () => {
  ensureAudio();
  state.muted = !state.muted;
  save();
  render();
});

/* ---- Installable app (PWA) ---- */
let installEvent = null;
const installBtn = $("install-btn");

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
   22. START
   ========================================================= */
load();
migrate();
rollPeriods();
const result = newDayCheck();
applyBg();
applyFrame();
render();
save(false);                           // don't mark as "changed" just for opening the app
if (state.focus) startFocusLoop();
if (window.Cloud) renderOnline();

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
