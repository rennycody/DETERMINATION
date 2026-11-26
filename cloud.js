/* =========================================================
   Online features: accounts (email + Google), cloud save, leaderboards.
   Uses Firebase (free Spark plan). The game still works without it.
   ========================================================= */
/* Firebase settings for this project. These are NOT secret passwords: they
   identify your project and are safe to publish. Your data is protected by
   the Firestore rules. */
const firebaseConfig = {
  apiKey: "AIzaSyChoNV5dtrJwrGmBYYEoC6egNOFXI2Ub18",
  authDomain: "determination-4586a.firebaseapp.com",
  projectId: "determination-4586a",
  storageBucket: "determination-4586a.firebasestorage.app",
  messagingSenderId: "377728370903",
  appId: "1:377728370903:web:d96977e620263ee3090892",
};

const FIREBASE_VERSION = "10.12.2";
const CDN = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/`;

const isSet = (v) => typeof v === "string" && v.length > 0 && !v.startsWith("PASTE");
const configured = !!(firebaseConfig && isSet(firebaseConfig.apiKey) && isSet(firebaseConfig.projectId));

const FRIENDLY = {
  "auth/invalid-email": "That email doesn't look right.",
  "auth/missing-email": "Type your email first.",
  "auth/missing-password": "Type your password.",
  "auth/weak-password": "Password needs at least 6 characters.",
  "auth/email-already-in-use": "That email already has an account. Try SIGN IN.",
  "auth/invalid-credential": "Wrong email or password.",
  "auth/wrong-password": "Wrong email or password.",
  "auth/user-not-found": "Wrong email or password.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests": "Too many tries. Wait a bit and try again.",
  "auth/popup-closed-by-user": "The Google window was closed before finishing.",
  "auth/cancelled-popup-request": "The Google window was closed before finishing.",
  "auth/popup-blocked": "Your browser blocked the pop-up. Allow pop-ups for this site and try again.",
  "auth/network-request-failed": "No connection. Check your internet and try again.",
  "auth/unauthorized-domain": "This website isn't allowed in Firebase yet. (Owner: add it under Authentication > Settings > Authorized domains.)",
  "auth/operation-not-allowed": "That sign-in method isn't turned on in Firebase yet. (Owner: enable it under Authentication > Sign-in method.)",
  "auth/requires-recent-login": "Please sign out, sign in again, then retry.",
  "permission-denied": "The server said no. (Owner: check the Firestore rules.)",
  "unavailable": "Can't reach the server right now.",
};

function friendly(err) {
  const code = (err && err.code) || "";
  const key = code.replace("firestore/", "");
  return new Error(FRIENDLY[code] || FRIENDLY[key] || (err && err.message) || "Something went wrong.");
}

let auth = null, db = null, AU = null, FS = null;

const Cloud = {
  configured,
  ready: false,
  unavailable: false,
  user() {
    const u = auth && auth.currentUser;
    return u ? { uid: u.uid, email: u.email || "" } : null;
  },

  /* ----- accounts ----- */
  signUp: (email, pw) => run(() => AU.createUserWithEmailAndPassword(auth, email, pw)),
  signIn: (email, pw) => run(() => AU.signInWithEmailAndPassword(auth, email, pw)),
  reset: (email) => run(() => AU.sendPasswordResetEmail(auth, email)),
  signOut: () => run(() => AU.signOut(auth)),
  google: () => run(async () => {
    const provider = new AU.GoogleAuthProvider();
    try {
      await AU.signInWithPopup(auth, provider);
    } catch (e) {
      // some phones / installed apps can't open pop-ups, so try a full-page redirect instead
      if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") {
        await AU.signInWithRedirect(auth, provider);
        return;
      }
      throw e;
    }
  }),

  /* ----- private cloud save (only you can read/write it) ----- */
  loadSave: () => run(async () => {
    const snap = await FS.getDoc(FS.doc(db, "saves", uid()));
    return snap.exists() ? snap.data() : null;
  }),
  pushSave: (json, savedAt) => run(() => FS.setDoc(FS.doc(db, "saves", uid()), { data: json, savedAt })),

  /* ----- public leaderboard entry (nickname + stats only) ----- */
  pushPublic: (p) => run(() => FS.setDoc(FS.doc(db, "players", uid()), { ...p, updatedAt: Date.now() })),
  removePublic: () => run(() => FS.deleteDoc(FS.doc(db, "players", uid()))),
  leaderboard: (field) => run(async () => {
    if (!["totalXp", "focusMin", "bestStreak", "hatched"].includes(field)) throw new Error("Unknown leaderboard.");
    const q = FS.query(FS.collection(db, "players"), FS.orderBy(field, "desc"), FS.limit(20));
    const snap = await FS.getDocs(q);
    return snap.docs.map((d) => ({ uid: d.id, name: d.data().name, value: Number(d.data()[field]) || 0 }));
  }),

  /* ----- delete everything online ----- */
  deleteAll: () => run(async () => {
    const id = uid();
    await FS.deleteDoc(FS.doc(db, "players", id));
    await FS.deleteDoc(FS.doc(db, "saves", id));
    await AU.deleteUser(auth.currentUser);
  }),
};

function uid() {
  if (!auth || !auth.currentUser) throw new Error("Please sign in first.");
  return auth.currentUser.uid;
}

async function run(fn) {
  if (!Cloud.ready) throw new Error("Online mode isn't ready yet. Wait a moment and try again.");
  try { return await fn(); } catch (e) { throw friendly(e); }
}

window.Cloud = Cloud;

(async function init() {
  if (configured) {
    try {
      const [APP, AUTH, FIRESTORE] = await Promise.all([
        import(CDN + "firebase-app.js"),
        import(CDN + "firebase-auth.js"),
        import(CDN + "firebase-firestore.js"),
      ]);
      AU = AUTH; FS = FIRESTORE;
      const app = APP.initializeApp(firebaseConfig);
      auth = AU.getAuth(app);
      db = FS.getFirestore(app);
      Cloud.ready = true;
      AU.onAuthStateChanged(auth, (u) => {
        window.dispatchEvent(new CustomEvent("cloud-auth", { detail: { user: u ? { uid: u.uid, email: u.email || "" } : null } }));
      });
    } catch (e) {
      Cloud.unavailable = true;
      console.warn("Online features unavailable:", e);
    }
  }
  window.dispatchEvent(new Event("cloud-ready"));
})();
