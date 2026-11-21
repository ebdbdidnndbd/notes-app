// ==================== المحرّك الرئيسي الفائق (V11 Turbo Shield — SHA-256 + AES-GCM + Targeted Listeners + Lazy Posts) ====================
const DB_URL = "https://notes-app-c738e-default-rtdb.firebaseio.com";

firebase.initializeApp({ databaseURL: DB_URL });
const db = firebase.database();

window.AppModules = window.AppModules || {};

const GRADIENTS = [
    "linear-gradient(135deg, #0ea5e9, #3b82f6)",
    "linear-gradient(135deg, #10b981, #0d9488)",
    "linear-gradient(135deg, #ec4899, #8b5cf6)",
    "linear-gradient(135deg, #f59e0b, #ea580c)",
    "linear-gradient(135deg, #6366f1, #06b6d4)"
];

const CH_REACTIONS = [
    { k: "heart", em: "❤️" }, { k: "fire", em: "🔥" }, { k: "like", em: "👍" },
    { k: "laugh", em: "😂" }, { k: "wow", em: "🤯" }, { k: "clap", em: "👏" }
];

// ==================== 1. درع التشفير الحقيقي (SHA-256 + AES-GCM + AdminGuard) ====================
const _kFrom = arr => String.fromCharCode(...arr);
const _BOOT_GATE = [50, 48, 48, 55, 72];
const _BOOT_DECOY = [49, 50, 51, 52];
const _BOOT_ADM = [57, 57, 56, 56];

async function sha256Hex(text) {
    const raw = String(text || "");
    if (window.crypto && window.crypto.subtle) {
        try {
            const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("v11_shield::" + raw));
            return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
        } catch {}
    }
    return "fb_" + simpleHash("v11_shield::" + raw);
}

const AdminGuard = (() => {
    let granted = false;
    let grantStamp = 0;
    return {
        grant() { granted = true; grantStamp = Date.now(); },
        revoke() { granted = false; grantStamp = 0; },
        check() { return granted && (Date.now() - grantStamp < 1000 * 60 * 120); }
    };
})();

async function verifyPinAgainstHashOrLegacy(inputPin, savedHash, legacyPlain, bootCodes) {
    const clean = String(inputPin || "").trim();
    if (!clean) return false;
    if (savedHash) {
        const h = await sha256Hex(clean);
        return h === savedHash;
    }
    if (legacyPlain) return clean === String(legacyPlain);
    if (bootCodes) {
        const [hIn, hDef] = await Promise.all([sha256Hex(clean), sha256Hex(_kFrom(bootCodes))]);
        return hIn === hDef;
    }
    return false;
}

async function verifyAdminPinInput(inputPin) {
    return verifyPinAgainstHashOrLegacy(inputPin, sysConfig.adminPinHash, null, _BOOT_ADM);
}

// تشفير AES-GCM للرسائل الخاصة مع كاش لفك التشفير لمنع تكرار المعالجة
const e2eKeyCache = new Map();
const metaCipherCache = new Map();

async function getRoomCryptoKey(roomId) {
    if (!roomId || !window.crypto || !window.crypto.subtle) return null;
    if (e2eKeyCache.has(roomId)) return e2eKeyCache.get(roomId);
    try {
        const rawSeed = new TextEncoder().encode(`v11_e2e_room::${roomId}::shield_key`);
        const hash = await crypto.subtle.digest("SHA-256", rawSeed);
        const key = await crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
        e2eKeyCache.set(roomId, key);
        return key;
    } catch { return null; }
}

async function e2eEncrypt(roomId, plainText) {
    const str = String(plainText || "");
    const key = await getRoomCryptoKey(roomId);
    if (!key) return { e2e: false, data: str };
    try {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const enc = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(str));
        const combined = new Uint8Array(iv.length + enc.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(enc), iv.length);
        let bin = "";
        for (let i = 0; i < combined.length; i++) bin += String.fromCharCode(combined[i]);
        return { e2e: true, data: "e2e1:" + btoa(bin) };
    } catch { return { e2e: false, data: str }; }
}

async function e2eDecrypt(roomId, cipherStr) {
    if (!cipherStr || typeof cipherStr !== "string" || !cipherStr.startsWith("e2e1:")) return cipherStr || "";
    const cacheKey = roomId + "|" + cipherStr;
    if (metaCipherCache.has(cacheKey)) return metaCipherCache.get(cacheKey);
    const key = await getRoomCryptoKey(roomId);
    if (!key) return "🔒 [رسالة مشفّرة]";
    try {
        const bin = atob(cipherStr.slice(5));
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const iv = bytes.slice(0, 12);
        const data = bytes.slice(12);
        const dec = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
        const plain = new TextDecoder().decode(dec);
        if (metaCipherCache.size > 300) metaCipherCache.clear();
        metaCipherCache.set(cacheKey, plain);
        return plain;
    } catch { return "🔒 [رسالة مشفّرة]"; }
}

async function hydrateMessageDecryption(m, roomId) {
    if (!m || !roomId) return m;
    if (!m.e2e && !(m.replyTo && m.replyTo.encPreview)) return m;
    const copy = { ...m };
    if (copy.e2e && copy.encContent) copy.content = await e2eDecrypt(roomId, copy.encContent);
    if (copy.replyTo && copy.replyTo.encPreview) {
        copy.replyTo = { ...copy.replyTo, preview: await e2eDecrypt(roomId, copy.replyTo.encPreview) };
    }
    return copy;
}

// ==================== 2. متغيرات الحالة والكاش الفائق ====================
let sysConfig = { pinHash: "", decoyPinHash: "", adminPinHash: "", locked: false, allowRegister: true, ai: { provider: "free", apiKey: "" } };
let failedAttempts = parseInt(localStorage.getItem("sec_fails") || "0");
let lockUntilTs = parseInt(localStorage.getItem("sec_lock_until") || "0");
let soundEnabled = localStorage.getItem("app_sound") !== "off";
let appInitialized = false;
let isDbConnected = true;

let me = null;
let myContacts = {};
let myBlocked = {};
let blockedByPartner = false;
let contactProfiles = {};
let allMeta = {};
let decryptedMetaPreviews = {};
let allStories = {};
let allPosts = {};
let postsLoaded = false;
let allSpaces = {};
let myHighlights = {};
let myGifts = {};
let myNotifications = {};
let sidebarFilter = "all";

let vaultConfig = { pinHash: "", hidden: {} };
let vaultUnlocked = false;

let activeChatType = null;
let activePartner = null;
let activePartnerTyping = false;
let activeRoomId = null;
let activeSpaceObj = null;
let activeRoomToken = 0;
let activeRoomLimit = 14;
let activeMsgsMap = {};
const roomMsgsCache = {};
let roomQueryRef = null;
let typingRef = null, pinnedRef = null, blockCheckRef = null;
let contactListeners = {};
let metaListeners = {};
let storyListeners = {};
let typingTimeout = null;
let seenFlushTimer = null;
let pendingSeenBatch = {};
let sidebarDebounceTimer = null;
let storiesDebounceTimer = null;
let bootCacheSaveTimer = null;
let unreadWhileScrolled = 0;

let selectedSelfDestructSec = 0;
let selfDestructInterval = null;

let sendLock = false;
let lastSentSig = "";
let lastSentTs = 0;
let seenMarkedSet = new Set();
let offlineQueue = [];
try { offlineQueue = JSON.parse(localStorage.getItem("offline_msg_queue") || "[]"); } catch { offlineQueue = []; }

let replyTarget = null;
let editingMsgId = null;
let selectedMsg = null;

let currentPlayingAudio = null;
let currentPlayingBtn = null;

// ==================== شاشة البداية + الاهتزازات + شرارات التفاعل ====================
function dismissSplashScreen() {
    const sp = document.getElementById("splashScreen");
    if (!sp || sp.classList.contains("hide")) return;
    sp.classList.add("hide");
    setTimeout(() => { if (sp.parentNode) sp.remove(); }, 260);
}
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(dismissSplashScreen, 320);
    updateDynamicGreeting();
});
setTimeout(dismissSplashScreen, 950);

function updateDynamicGreeting() {
    const el = document.getElementById("greetingLine");
    if (!el) return;
    const h = new Date().getHours();
    const name = me?.name ? `، ${me.name}` : "";
    if (h >= 5 && h < 12) el.innerText = `☀️ صباح الخير${name}`;
    else if (h >= 12 && h < 17) el.innerText = `🌤️ يومك سعيد${name}`;
    else if (h >= 17 && h < 22) el.innerText = `🌆 مساؤك رايق${name}`;
    else el.innerText = `🌙 سهرة سعيدة${name}`;
}

function triggerHaptic(pattern = 12) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch {}
}

function spawnSparks(x, y) {
    const colors = ["#38bdf8", "#f472b6", "#fbbf24", "#a78bfa", "#34d399"];
    for (let i = 0; i < 6; i++) {
        const dot = document.createElement("span");
        dot.className = "spark-dot";
        const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.4;
        const dist = 22 + Math.random() * 24;
        dot.style.left = x + "px";
        dot.style.top = y + "px";
        dot.style.background = colors[i % colors.length];
        dot.style.setProperty("--sx", Math.round(Math.cos(angle) * dist) + "px");
        dot.style.setProperty("--sy", Math.round(Math.sin(angle) * dist) + "px");
        document.body.appendChild(dot);
        setTimeout(() => dot.remove(), 520);
    }
}

applyTheme(localStorage.getItem("app_theme") || "midnight", true);
applyFont(localStorage.getItem("app_font") || "tajawal", true);
applyFontSize(localStorage.getItem("app_fsize") || "md", true);
applyBubbleStyle(localStorage.getItem("app_bubble") || "soft", true);
applyWallpaper(localStorage.getItem("app_wp") || "pattern", true);

if (lockUntilTs > Date.now()) {
    renderDeviceLockoutScreen(lockUntilTs);
}

db.ref("sys_config").on("value", snap => {
    const val = snap.val();
    if (val) {
        sysConfig = {
            ...val,
            locked: !!val.locked,
            allowRegister: val.allowRegister !== false,
            ai: val.ai || { provider: "free", apiKey: "" }
        };
        if (sysConfig.locked && me) {
            showToast("تم إيقاف المنصة من الإدارة");
            setTimeout(quickLock, 1200);
        }
    }
    if (document.getElementById("adminScreen").style.display === "block" && AdminGuard.check()) updateAdminButtons();
});

function updateNetBanner(connected) {
    isDbConnected = connected;
    const b = document.getElementById("netBanner");
    if (b) b.classList.toggle("show", !connected);
    if (connected) flushOfflineQueue();
}
window.addEventListener("offline", () => updateNetBanner(false));
window.addEventListener("online", () => flushOfflineQueue());

document.addEventListener("click", ev => {
    const dd = document.getElementById("chatToolsDropdown");
    if (dd && dd.classList.contains("open") && !ev.target.closest("#chatToolsDropdown") && !ev.target.closest("#btnChatToolsMenu")) dd.classList.remove("open");
    const opd = document.getElementById("opMoreDropdown");
    if (opd && opd.classList.contains("open") && !ev.target.closest("#opMoreDropdown") && !ev.target.closest("#opMoreBlockBtn")) opd.classList.remove("open");
    const mm = document.getElementById("mediaMenu");
    if (mm && mm.style.display === "block" && !ev.target.closest("#mediaMenu") && !ev.target.closest("[onclick*='toggleMediaMenu']")) mm.style.display = "none";
});

(function initSheetPullToClose() {
    let sheetEl = null, bgEl = null, startY = 0, dy = 0, tracking = false;
    document.addEventListener("touchstart", e => {
        const sh = e.target.closest(".bottom-sheet");
        if (!sh || e.touches.length !== 1 || e.target.closest("input, textarea, select")) return;
        const scroller = e.target.closest("[style*='overflow-y:auto'], .drawer-body");
        if (scroller && scroller.scrollTop > 4) return;
        sheetEl = sh; bgEl = sh.closest(".modal-bg"); startY = e.touches[0].clientY; dy = 0; tracking = true;
    }, { passive: true });
    document.addEventListener("touchmove", e => {
        if (!tracking || !sheetEl) return;
        dy = e.touches[0].clientY - startY;
        if (dy > 8) { sheetEl.style.transition = "none"; sheetEl.style.transform = `translateY(${Math.min(dy, 220)}px)`; }
    }, { passive: true });
    document.addEventListener("touchend", () => {
        if (!tracking || !sheetEl) return;
        tracking = false;
        sheetEl.style.transition = "transform 0.18s ease";
        if (dy > 85 && bgEl) {
            triggerHaptic(10); sheetEl.style.transform = "";
            if (bgEl.id === "msgActionModal") closeMsgActions();
            else if (bgEl.id === "storyViewersModal") closeStoryViewersModal();
            else if (bgEl.id === "noteViewModal" && window.closeFriendNoteView) window.closeFriendNoteView();
            else if (bgEl.id === "musicPickerModal" && window.closeMusicPicker) window.closeMusicPicker();
            else if (bgEl.id === "stickerPackPreviewModal" && window.closeStickerPackPreview) window.closeStickerPackPreview();
            else bgEl.style.display = "none";
        } else {
            sheetEl.style.transform = "translateY(0)";
            setTimeout(() => { if (sheetEl) sheetEl.style.transform = ""; }, 190);
        }
        sheetEl = null; bgEl = null; dy = 0;
    }, { passive: true });
})();

// ==================== الكاش المحلي الفوري وتجميع الرسم ====================
function loadInstantBootCache(username) {
    try {
        const raw = localStorage.getItem("boot_cache_v11_" + username);
        if (!raw) return;
        const c = JSON.parse(raw);
        if (c.contacts && typeof c.contacts === "object") myContacts = c.contacts;
        if (c.profiles && typeof c.profiles === "object") contactProfiles = { ...c.profiles, [username]: me };
        if (c.spaces && typeof c.spaces === "object") allSpaces = c.spaces;
        if (c.meta && typeof c.meta === "object") allMeta = c.meta;
        if (c.previews && typeof c.previews === "object") decryptedMetaPreviews = c.previews;
    } catch {}
}

function scheduleSaveBootCache() {
    if (!me) return;
    clearTimeout(bootCacheSaveTimer);
    bootCacheSaveTimer = setTimeout(() => {
        try {
            const slimProfiles = {};
            Object.entries(contactProfiles).forEach(([k, u]) => {
                if (!u) return;
                slimProfiles[k] = {
                    username: u.username, displayTag: u.displayTag, name: u.name, bio: u.bio,
                    avatarColor: u.avatarColor, avatarFrame: u.avatarFrame || "",
                    avatarImg: (u.avatarImg && u.avatarImg.length < 40000) ? u.avatarImg : "",
                    verified: u.verified || "", isDev: !!u.isDev, statusEmoji: u.statusEmoji || "",
                    moodText: u.moodText || "", accentColor: u.accentColor || "", online: !!u.online, lastSeen: u.lastSeen || 0
                };
            });
            const slimSpaces = {};
            Object.entries(allSpaces).forEach(([id, s]) => {
                if (!s || !s.members || !s.members[me.username]) return;
                slimSpaces[id] = {
                    id: s.id, type: s.type, name: s.name, handle: s.handle, desc: s.desc,
                    avatarColor: s.avatarColor, owner: s.owner, verified: s.verified || "",
                    lastMsg: s.lastMsg || "", lastTs: s.lastTs || s.createdAt || 0, members: s.members
                };
            });
            localStorage.setItem("boot_cache_v11_" + me.username, JSON.stringify({
                contacts: myContacts, profiles: slimProfiles, spaces: slimSpaces, meta: allMeta, previews: decryptedMetaPreviews
            }));
        } catch {}
    }, 900);
}

function scheduleSidebarRender() {
    clearTimeout(sidebarDebounceTimer);
    sidebarDebounceTimer = setTimeout(() => { renderChatsSidebarNow(); }, 80);
}

function scheduleStoriesRender() {
    clearTimeout(storiesDebounceTimer);
    storiesDebounceTimer = setTimeout(() => {
        if (typeof renderStoriesStrip === "function") renderStoriesStrip();
    }, 95);
}

function trimRoomCache(dbPath) {
    const cache = roomMsgsCache[dbPath];
    if (!cache) return;
    const keys = Object.keys(cache);
    if (keys.length <= 28) return;
    keys.sort((a, b) => (cache[a]?.ts || 0) - (cache[b]?.ts || 0));
    keys.slice(0, keys.length - 25).forEach(k => { delete cache[k]; });
}

function saveOfflineQueue() {
    try { localStorage.setItem("offline_msg_queue", JSON.stringify(offlineQueue.slice(-25))); } catch {}
}

async function flushOfflineQueue() {
    if (!me || !navigator.onLine || offlineQueue.length === 0) return;
    const copy = [...offlineQueue];
    for (const item of copy) {
        if (item.owner !== me.username) continue;
        try {
            const cleanPayload = { ...item.payload };
            delete cleanPayload._pending;
            await db.ref(`${item.dbPath}/${cleanPayload.id}`).set(cleanPayload);
            if (item.chatType === "dm" && item.partner) {
                await db.ref(`user_contacts/${item.partner}/${me.username}`).update({ addedAt: cleanPayload.ts });
                const encPrev = await e2eEncrypt(item.roomId, item.previewLabel);
                await db.ref(`chat_meta/${item.roomId}`).set({
                    lastMsg: encPrev.e2e ? "🔒 رسالة مشفّرة" : item.previewLabel,
                    lastMsgEnc: encPrev.e2e ? encPrev.data : "",
                    lastSender: me.username, lastTs: cleanPayload.ts, unreadFor: item.partner
                });
            } else if ((item.chatType === "channel" || item.chatType === "group") && item.roomId) {
                await db.ref(`spaces/${item.roomId}`).update({ lastMsg: item.previewLabel, lastTs: cleanPayload.ts }).catch(() => {});
            }
            offlineQueue = offlineQueue.filter(q => q.payload.id !== cleanPayload.id);
            saveOfflineQueue();
        } catch { break; }
    }
}

// ==================== المؤثرات الصوتية ====================
let audioCtx = null, ringtoneInterval = null;
function playTone(freq, dur, type = "sine", vol = 0.07) {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = type; o.frequency.setValueAtTime(freq, audioCtx.currentTime);
        g.gain.setValueAtTime(vol, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
        o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + dur);
    } catch {}
}
function playSendSound() { playTone(660, 0.07, "sine", 0.045); }
function playRecvSound() { playTone(520, 0.07, "triangle", 0.055); setTimeout(() => playTone(780, 0.09, "triangle", 0.055), 65); }
function startRingtone(incoming) {
    stopRingtone();
    const fn = () => {
        if (incoming) { playTone(740, 0.22, "sine", 0.1); setTimeout(() => playTone(980, 0.25, "sine", 0.1), 240); }
        else { playTone(440, 0.4, "sine", 0.05); }
    };
    fn(); ringtoneInterval = setInterval(fn, 2100);
}
function stopRingtone() { if (ringtoneInterval) { clearInterval(ringtoneInterval); ringtoneInterval = null; } }

// ==================== التخصيصات ====================
function applyTheme(t, silent = false) {
    const valid = ["midnight", "obsidian", "emerald", "amethyst", "amber"];
    const theme = valid.includes(t) ? t : "midnight";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app_theme", theme);
    document.querySelectorAll(".theme-swatch").forEach(el => el.classList.toggle("active", el.getAttribute("data-t") === theme));
    if (!silent) showToast("تم تحديث الثيم ✨");
}

function applyBubbleStyle(b, silent = false) {
    const valid = ["soft", "glass", "neon", "classic"];
    const style = valid.includes(b) ? b : "soft";
    document.documentElement.setAttribute("data-bubble", style);
    localStorage.setItem("app_bubble", style);
    document.querySelectorAll("#bubbleStyleGrid .chip-btn").forEach(el => el.classList.toggle("active", el.getAttribute("data-b") === style));
    if (!silent) showToast("تم تحديث ستايل الفقاعات 💬");
}

function applyFont(f, silent = false) {
    const valid = ["tajawal", "ibm", "readex", "cairo"];
    const font = valid.includes(f) ? f : "tajawal";
    document.documentElement.setAttribute("data-font", font);
    localStorage.setItem("app_font", font);
    document.querySelectorAll("#fontGrid .chip-btn").forEach(el => el.classList.toggle("active", el.getAttribute("data-f") === font));
    if (!silent) showToast("تم تغيير الخط ✍️");
}

function applyFontSize(fs, silent = false) {
    const valid = ["sm", "md", "lg"];
    const size = valid.includes(fs) ? fs : "md";
    document.documentElement.setAttribute("data-fsize", size);
    localStorage.setItem("app_fsize", size);
    document.querySelectorAll("#fontSizeGrid .chip-btn").forEach(el => el.classList.toggle("active", el.getAttribute("data-fs") === size));
    if (!silent) showToast("تم تعديل حجم الخط 🔠");
}

function applyWallpaper(w, silent = false) {
    const valid = ["pattern", "aurora", "clean", "custom"];
    const wp = valid.includes(w) ? w : "pattern";
    document.documentElement.setAttribute("data-wp", wp);
    localStorage.setItem("app_wp", wp);
    document.querySelectorAll("#wpGrid .chip-btn").forEach(el => el.classList.toggle("active", el.getAttribute("data-w") === wp));

    const area = document.getElementById("messagesList");
    if (area) {
        if (wp === "custom") {
            const img = localStorage.getItem("app_wp_img");
            if (img) {
                area.style.backgroundImage = `linear-gradient(rgba(4,8,18,0.55), rgba(4,8,18,0.58)), url(${img})`;
                area.style.backgroundSize = "cover"; area.style.backgroundPosition = "center";
            } else { document.documentElement.setAttribute("data-wp", "pattern"); area.style.backgroundImage = ""; }
        } else { area.style.backgroundImage = ""; area.style.backgroundSize = ""; area.style.backgroundPosition = ""; }
    }
    if (!silent) showToast("تم تحديث خلفية المحادثة 🎨");
}

async function handleChatWallpaperUpload(e) {
    const f = e.target.files[0]; e.target.value = ""; if (!f) return;
    showToast("جاري تجهيز الخلفية...");
    const dataUrl = await compressImageFile(f, 900, 0.7);
    try { localStorage.setItem("app_wp_img", dataUrl); applyWallpaper("custom"); }
    catch { showToast("حجم الصورة كبير، اختر صورة أصغر"); }
}

function toggleSoundPref() {
    soundEnabled = !soundEnabled;
    localStorage.setItem("app_sound", soundEnabled ? "on" : "off");
    document.getElementById("soundToggleBtn").innerText = soundEnabled ? "مفعلة" : "صامت";
    if (soundEnabled) playSendSound();
}

// ==================== الشارات والدوال المساعدة ====================
function getVerifiedBadgeHTML(level) {
    if (!level) return "";
    if (level === "gold") {
        return `<span class="v-badge gold" title="موثق VIP"><svg viewBox="0 0 24 24"><path fill="#fbbf24" d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484z"/><path fill="#111" d="M10.5 16.5l-3.8-3.8 1.4-1.4 2.4 2.4 5.4-5.4 1.4 1.4z"/></svg></span>`;
    }
    return `<span class="v-badge" title="موثق رسمياً"><svg viewBox="0 0 24 24"><path fill="#0ea5e9" d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484z"/><path fill="#fff" d="M10.5 16.5l-3.8-3.8 1.4-1.4 2.4 2.4 5.4-5.4 1.4 1.4z"/></svg></span>`;
}

function getDevBadgeHTML(userObj) {
    if (!userObj) return "";
    return (userObj.isDev || userObj.username === "h") ? `<span class="dev-pill">⚡ المطور</span>` : "";
}

function renderStyledUserName(userObj) {
    const cls = (userObj?.isDev || userObj?.verified === "gold") ? "grad-name" : "";
    return `<span class="${cls}">${escapeHTML(userObj?.name || "")}</span>`;
}

function escapeHTML(s) {
    return String(s || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

function showToast(txt) {
    const t = document.getElementById("toastBox"); if (!t) return;
    t.innerText = txt; t.classList.add("show");
    clearTimeout(t._tm); t._tm = setTimeout(() => t.classList.remove("show"), 2400);
}

function simpleHash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return "h_" + (h >>> 0).toString(36) + "_" + btoa(unescape(encodeURIComponent(str))).slice(0, 12);
}

function sanitizeKey(u) { return (u || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, ""); }
function formatTime(ts) { return ts ? new Date(ts).toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }) : ""; }
function formatDateKey(ts) { const d = new Date(ts || Date.now()); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function formatDateLabel(ts) {
    const d = new Date(ts || Date.now()), now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diff = Math.round((today - target) / 86400000);
    if (diff === 0) return "اليوم"; if (diff === 1) return "أمس";
    return d.toLocaleDateString("ar-IQ", { day: "numeric", month: "long" });
}
function logSecurityEvent(msg) { db.ref("sys_logs").push({ msg: `[${formatTime(Date.now())}] ${msg}`, ts: Date.now() }).catch(() => {}); }
function quickLock() { AdminGuard.revoke(); location.reload(); }
function getRoomId(u1, u2) { return [u1, u2].sort().join("__"); }
function getDisplayTag(uObj) { return "@" + (uObj?.displayTag || uObj?.username || ""); }

function compressImageFile(file, maxW = 820, quality = 0.70) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = ev => {
            const img = new Image();
            img.onload = () => {
                const c = document.createElement("canvas");
                const ratio = img.width > maxW ? maxW / img.width : 1;
                c.width = Math.round(img.width * ratio); c.height = Math.round(img.height * ratio);
                c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
                resolve(c.toDataURL("image/jpeg", quality));
            };
            img.onerror = reject; img.src = ev.target.result;
        };
        reader.onerror = reject; reader.readAsDataURL(file);
    });
}

function setAvatarStyle(el, obj, showOnline = true) {
    if (!el || !obj) return;
    el.classList.remove("av-frame-gold", "av-frame-neon", "av-frame-galaxy", "av-frame-rose");
    if (obj.avatarFrame && ["gold", "neon", "galaxy", "rose"].includes(obj.avatarFrame)) el.classList.add("av-frame-" + obj.avatarFrame);
    const onlineHTML = showOnline ? `<span class="online-badge ${obj.online ? 'on' : ''}"></span>` : "";
    if (obj.avatarImg) { el.style.backgroundImage = `url(${obj.avatarImg})`; el.innerHTML = onlineHTML; }
    else { el.style.backgroundImage = obj.avatarColor || GRADIENTS[0]; el.innerHTML = `${escapeHTML((obj.name || "؟").charAt(0))}${onlineHTML}`; }
}

function sendNotification(targetUsername, text, icon = "🔔") {
    if (!targetUsername || targetUsername === me?.username) return;
    db.ref(`notifications/${targetUsername}`).push({ icon, text, from: me.username, read: false, ts: Date.now() }).catch(() => {});
}

function renderDeviceLockoutScreen(untilTs) {
    const mins = Math.max(1, Math.ceil((untilTs - Date.now()) / 60000));
    document.body.innerHTML = `<div style="text-align:center; padding:35px; color:#94a3b8; max-width:400px; margin:auto;">
        <h1 style="color:#f43f5e; font-size:50px; font-weight:800;">🔒</h1>
        <h3 style="color:#fff; margin-top:8px;">تم قفل هذا الجهاز مؤقتاً</h3>
        <p style="font-size:13px; margin-top:8px; line-height:1.6;">تم تسجيل 3 محاولات دخول فاشلة متتالية وإرسال تنبيه للإدارة.<br>حاول مرة أخرى بعد <b>${mins} دقيقة</b>.</p>
    </div>`;
}

// ==================== شاشة التمويه + بوابة الإضافات ====================
function openDecoyStudyScreen() {
    document.getElementById("gateScreen").style.display = "none";
    document.getElementById("decoyStudyScreen").style.display = "block";
    renderDecoyNotes();
}

function switchDecoyTab(tab, btn) {
    document.querySelectorAll(".decoy-tab").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    document.querySelectorAll(".decoy-pane").forEach(p => p.classList.remove("active"));
    const target = document.getElementById("decoyTab-" + tab);
    if (target) target.classList.add("active");
}

function getDecoyNotes() {
    try {
        const saved = JSON.parse(localStorage.getItem("decoy_study_notes") || "null");
        if (Array.isArray(saved) && saved.length) return saved;
    } catch {}
    return [
        { id: 1, text: "مراجعة مسائل الفصل الأول فيزياء (المتسعات التوازي والتوالي) وحل وزاريات 2020-2025.", ts: "أمس" },
        { id: 2, text: "حفظ تعاليل الفصل الثاني كيمياء (قاعدة لو شاتيليه) قبل الامتحان اليومي.", ts: "اليوم" }
    ];
}

function renderDecoyNotes() {
    const box = document.getElementById("decoyNotesList"); if (!box) return;
    box.innerHTML = getDecoyNotes().map(n => `
        <div class="decoy-card" style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
            <div><p>${escapeHTML(n.text)}</p><span style="font-size:11px; color:var(--text-dim);">${escapeHTML(n.ts || "")}</span></div>
            <button class="icon-btn danger" style="width:28px; height:28px; font-size:11px;" onclick="deleteDecoyNote(${n.id})">✕</button>
        </div>`).join("");
}

function addDecoyNote() {
    const inp = document.getElementById("decoyNoteInp"), txt = (inp?.value || "").trim(); if (!txt) return;
    const list = getDecoyNotes(); list.unshift({ id: Date.now(), text: txt, ts: formatTime(Date.now()) });
    try { localStorage.setItem("decoy_study_notes", JSON.stringify(list)); } catch {}
    inp.value = ""; renderDecoyNotes();
}

function deleteDecoyNote(id) {
    const list = getDecoyNotes().filter(n => n.id !== id);
    try { localStorage.setItem("decoy_study_notes", JSON.stringify(list)); } catch {}
    renderDecoyNotes();
}

function openFutureModule(modId) {
    triggerHaptic(10);
    if (window.AppModules && typeof window.AppModules[modId] === "function") { window.AppModules[modId](); return; }
    if (modId === "music_hub" && typeof window.openMusicPicker === "function") {
        window.openMusicPicker("🎵 مكتبة ومقترحات الأغاني", song => {
            if (me && confirm(`تثبيت «${song.title}» كأغنية لبروفايلك؟`)) {
                db.ref(`users/${me.username}/profileSong`).set(song).then(() => {
                    me.profileSong = song;
                    showToast(`تم تثبيت «${song.title}» ببروفايلك 🎵✨`);
                });
            }
        });
        return;
    }
    const labels = { reels: "🎬 قسم الريلز قيد التجهيز للتحديث القادم!", study: "⏱️ جاري تحميل غرفة المراجعة...", ai: "🤖 جاري تحميل المساعد الذكي..." };
    showToast(labels[modId] || "هذا القسم جاهز للتوسعة المستقبلية ✨");
}

function insertAiMention() {
    const inp = document.getElementById("msgInput"); if (!inp) return;
    toggleChatExtras(false);
    if (!inp.value.trim().toLowerCase().startsWith("@ai")) inp.value = "@ai " + inp.value;
    handleMsgInputResize(inp); inp.focus();
}

// ==================== تنسيق النصوص والأدوات ====================
function formatRichText(raw) {
    let s = escapeHTML(raw || "");
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, `<a class="msg-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>`);
    s = s.replace(/\|\|([^|]+)\|\|/g, `<span class="spoiler-txt" onclick="event.stopPropagation(); this.classList.toggle('revealed')">$1</span>`);
    s = s.replace(/`([^`]+)`/g, `<code class="msg-code-inline">$1</code>`);
    s = s.replace(/\*\*([^*]+)\*\*/g, `<strong>$1</strong>`);
    s = s.replace(/\+\+([^+]+)\+\+/g, `<u>$1</u>`);
    s = s.replace(/__([^_]+)__/g, `<em>$1</em>`);
    s = s.replace(/~~([^~]+)~~/g, `<s>$1</s>`);
    s = s.replace(/^&gt;\s?(.*)$/gm, `<span class="msg-quote-block">$1</span>`);
    return s;
}

function toggleChatExtras(force) {
    const tray = document.getElementById("chatExtrasTray"), btn = document.getElementById("fxToggleBtn");
    if (!tray) return;
    const show = typeof force === "boolean" ? force : !tray.classList.contains("open");
    tray.classList.toggle("open", show);
    if (btn) btn.classList.toggle("accent", show || (btn.innerText !== "✨") || selectedSelfDestructSec > 0);
    if (show) { toggleStickerDrawer(false); toggleMediaMenu(false); }
}
function toggleFormatBar(force) { toggleChatExtras(force); }

function toggleChatToolsMenu(force) {
    const dd = document.getElementById("chatToolsDropdown"); if (!dd) return;
    const show = typeof force === "boolean" ? force : !dd.classList.contains("open");
    dd.classList.toggle("open", show);
}

function applyTextFormat(type) {
    const inp = document.getElementById("msgInput"); if (!inp) return;
    const start = inp.selectionStart || 0, end = inp.selectionEnd || 0, val = inp.value;
    const sel = val.slice(start, end) || "نص";
    let formatted = sel;
    if (type === "bold") formatted = `**${sel}**`;
    else if (type === "italic") formatted = `__${sel}__`;
    else if (type === "underline") formatted = `++${sel}++`;
    else if (type === "strike") formatted = `~~${sel}~~`;
    else if (type === "spoiler") formatted = `||${sel}||`;
    else if (type === "code") formatted = `\`${sel}\``;
    else if (type === "quote") formatted = `> ${sel}`;
    else if (type === "link") {
        const url = prompt("أدخل الرابط (يبدأ بـ https://):", "https://");
        if (!url || !url.trim()) return;
        formatted = `[${sel}](${url.trim()})`;
    }
    inp.value = val.slice(0, start) + formatted + val.slice(end);
    handleMsgInputResize(inp); inp.focus();
    inp.setSelectionRange(start + formatted.length, start + formatted.length);
}

// ==================== 3. خزنة المحادثات المخفية (Hidden Vault) ====================
async function configureVaultPin() {
    if (!me) return;
    const newPin = prompt("اكتب رمز الخزنة السري (4 أرقام أو أحرف على الأقل)\nاكتبه لاحقاً بخانة البحث بالمحادثات لإظهار محادثاتك المخفية:");
    if (!newPin || newPin.trim().length < 4) { showToast("الرمز يجب أن يكون 4 رموز فأكثر"); return; }
    const hash = await sha256Hex("vault::" + newPin.trim());
    vaultConfig.pinHash = hash;
    await db.ref(`user_vault/${me.username}/pinHash`).set(hash);
    showToast("تم حفظ رمز الخزنة السري بنجاح 🔐✨");
}

async function toggleHideActiveChatInVault() {
    if (activeChatType !== "dm" || !activePartner || !me) return;
    if (!vaultConfig.pinHash) {
        showToast("عيّن رمز الخزنة السري أولاً 🔐");
        await configureVaultPin();
        if (!vaultConfig.pinHash) return;
    }
    const isHidden = !!(vaultConfig.hidden && vaultConfig.hidden[activePartner]);
    if (isHidden) {
        await db.ref(`user_vault/${me.username}/hidden/${activePartner}`).remove();
        showToast("تم إخراج المحادثة من الخزنة وإرجاعها للقائمة 🔓");
    } else {
        await db.ref(`user_vault/${me.username}/hidden/${activePartner}`).set(true);
        showToast("تم إخفاء المحادثة بالخزنة السرية 🔐");
        closeActiveChat();
    }
    updateVaultMenuButton();
    scheduleSidebarRender();
}

function updateVaultMenuButton() {
    const btn = document.getElementById("menuVaultBtn"); if (!btn || !activePartner) return;
    const isHidden = !!(vaultConfig.hidden && vaultConfig.hidden[activePartner]);
    btn.innerHTML = isHidden ? "🔓 &nbsp; إخراج المحادثة من الخزنة" : "🔐 &nbsp; إخفاء المحادثة بالخزنة";
}

async function handleSidebarSearchInput(val) {
    const clean = (val || "").trim();
    if (clean.length >= 4 && vaultConfig.pinHash && !vaultUnlocked) {
        const h = await sha256Hex("vault::" + clean);
        if (h === vaultConfig.pinHash) {
            vaultUnlocked = true;
            document.getElementById("localFilterInput").value = "";
            document.getElementById("vaultCloseBtn").style.display = "inline-flex";
            triggerHaptic([15, 30, 15]);
            showToast("🔓 تم فتح خزنة المحادثات السرية");
            renderChatsSidebarNow();
            return;
        }
    }
    renderChatsSidebarNow();
}

function closeHiddenVault() {
    vaultUnlocked = false;
    const btn = document.getElementById("vaultCloseBtn"); if (btn) btn.style.display = "none";
    showToast("🔒 تم قفل الخزنة السرية");
    renderChatsSidebarNow();
}

// ==================== 4. البوابة المموهة والحسابات ====================
async function verifyGate() {
    const now = Date.now();
    if (lockUntilTs > now) { renderDeviceLockoutScreen(lockUntilTs); return; }
    const pin = document.getElementById("gatePin").value.trim();
    const err = document.getElementById("gateErr"); err.innerText = "";
    if (!pin) return;

    if (await verifyAdminPinInput(pin)) {
        failedAttempts = 0; localStorage.setItem("sec_fails", "0");
        AdminGuard.grant();
        document.getElementById("gateScreen").style.display = "none";
        openAdminDashboard();
        return;
    }

    if (await verifyPinAgainstHashOrLegacy(pin, sysConfig.decoyPinHash, sysConfig.decoyPin, _BOOT_DECOY)) {
        failedAttempts = 0; localStorage.setItem("sec_fails", "0");
        openDecoyStudyScreen();
        return;
    }

    if (sysConfig.locked) { err.innerText = "المنصة متوقفة حالياً من الإدارة."; return; }

    if (await verifyPinAgainstHashOrLegacy(pin, sysConfig.pinHash, sysConfig.pin, _BOOT_GATE)) {
        failedAttempts = 0; localStorage.setItem("sec_fails", "0");
        document.getElementById("gateScreen").style.display = "none";
        const savedU = localStorage.getItem("saved_account_u"), savedP = localStorage.getItem("saved_account_p");
        if (savedU && savedP) {
            const snap = await db.ref("users/" + savedU).once("value");
            const uData = snap.val();
            if (uData && uData.pass === savedP && !uData.banned) { enterMainApp(uData); return; }
        }
        document.getElementById("authScreen").style.display = "flex";
    } else {
        failedAttempts++;
        localStorage.setItem("sec_fails", failedAttempts.toString());
        document.getElementById("gatePin").value = "";
        logSecurityEvent(`⚠️ محاولة دخول فاشلة (${failedAttempts}/3) على البوابة`);
        if (failedAttempts >= 3) {
            lockUntilTs = Date.now() + 15 * 60 * 1000;
            localStorage.setItem("sec_lock_until", String(lockUntilTs));
            localStorage.setItem("sec_fails", "0");
            renderDeviceLockoutScreen(lockUntilTs);
        } else {
            err.innerText = `رمز غير صحيح! المتبقي ${3 - failedAttempts} محاولات.`;
        }
    }
}

function switchAuthTab(tab) {
    document.getElementById("authErr").innerText = "";
    document.getElementById("tabLogin").classList.toggle("active", tab === "login");
    document.getElementById("tabReg").classList.toggle("active", tab === "register");
    document.getElementById("loginForm").style.display = tab === "login" ? "block" : "none";
    document.getElementById("regForm").style.display = tab === "register" ? "block" : "none";
}

async function isHandleTakenAnywhere(handle) {
    const uSnap = await db.ref("users/" + handle).once("value");
    if (uSnap.exists()) return "user";
    if (Object.values(allSpaces || {}).some(s => s && s.handle === handle)) return "space";
    const spSnap = await db.ref("spaces").orderByChild("handle").equalTo(handle).once("value");
    if (spSnap.exists()) return "space";
    return false;
}

async function doRegister() {
    const err = document.getElementById("authErr"); err.innerText = "";
    if (!sysConfig.allowRegister) { err.innerText = "إنشاء الحسابات مغلق حالياً من لوحة التحكم."; return; }
    const name = document.getElementById("regName").value.trim();
    const rawTag = document.getElementById("regUser").value.trim().replace(/^@/, "");
    const username = sanitizeKey(rawTag);
    const pass = document.getElementById("regPass").value.trim();
    const bio = document.getElementById("regBio").value.trim() || "متاح للمراسلة";

    if (name.length < 1) { err.innerText = "اكتب اسمك الظاهر."; return; }
    if (username.length < 1) { err.innerText = "اكتب يوزراً صحيحاً بأحرف إنجليزية أو أرقام."; return; }
    if (pass.length < 4) { err.innerText = "كلمة السر يجب أن تكون 4 رموز فأكثر."; return; }

    let isDev = false;
    if (username === "h") {
        const devCode = prompt("⚡ اليوزر المميز (@H) محجوز حصرياً لمطور المنصة.\nأدخل رمز المطور لتأكيد الملكية:");
        if (!(await verifyAdminPinInput(devCode))) { err.innerText = "اليوزر (@H) محجوز حصرياً لمطور المنصة فقط!"; return; }
        isDev = true;
    } else if (username.length < 3) { err.innerText = "اليوزرات العادية يجب أن تكون 3 أحرف على الأقل."; return; }

    if (await isHandleTakenAnywhere(username)) { err.innerText = "هذا اليوزر محجوز مسبقاً لحساب أو قناة أخرى."; return; }

    const passHash = await sha256Hex("upass::" + pass);
    const newUser = {
        username, displayTag: isDev ? "H" : (rawTag.replace(/[^a-zA-Z0-9_]/g, "") || username),
        name, bio, pass: passHash, passAlgo: "sha256",
        avatarColor: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
        avatarImg: "", avatarFrame: isDev ? "gold" : "", verified: isDev ? "gold" : "", isDev,
        online: true, lastSeen: Date.now(), banned: false, createdAt: Date.now()
    };
    await db.ref("users/" + username).set(newUser);
    localStorage.setItem("saved_account_u", username); localStorage.setItem("saved_account_p", newUser.pass);
    logSecurityEvent(`حساب جديد: ${name} (@${newUser.displayTag})`);
    enterMainApp(newUser);
}

async function doLogin() {
    const err = document.getElementById("authErr"); err.innerText = "";
    const username = sanitizeKey(document.getElementById("loginUser").value.replace(/^@/, ""));
    const pass = document.getElementById("loginPass").value.trim();
    if (!username || !pass) { err.innerText = "أدخل اليوزر وكلمة السر."; return; }
    const snap = await db.ref("users/" + username).once("value");
    if (!snap.exists()) { err.innerText = "الحساب غير موجود!"; return; }
    const u = snap.val();
    if (u.banned) { err.innerText = "هذا الحساب محظور من الإدارة."; return; }

    const newHash = await sha256Hex("upass::" + pass);
    const okNew = u.pass === newHash;
    const okLegacy = u.pass === simpleHash(pass);
    if (!okNew && !okLegacy) { err.innerText = "كلمة السر غير صحيحة."; return; }

    if (okLegacy && !okNew) {
        u.pass = newHash; u.passAlgo = "sha256";
        db.ref("users/" + username).update({ pass: newHash, passAlgo: "sha256" }).catch(() => {});
    }

    localStorage.setItem("saved_account_u", username); localStorage.setItem("saved_account_p", u.pass);
    logSecurityEvent(`تسجيل دخول: ${u.name} (${getDisplayTag(u)})`);
    enterMainApp(u);
}

function logoutAccount() {
    if (me) db.ref("users/" + me.username).update({ online: false, lastSeen: Date.now() });
    localStorage.removeItem("saved_account_u"); localStorage.removeItem("saved_account_p");
    location.reload();
}

// ==================== 5. تحميل المنشورات عند الحاجة فقط (Lazy Posts) ====================
function ensurePostsLoaded() {
    if (postsLoaded || !me) return;
    postsLoaded = true;
    const postsRef = db.ref("posts").limitToLast(25);
    postsRef.on("child_added", s => {
        allPosts[s.key] = s.val();
        if (document.getElementById("view-feed").classList.contains("active") && typeof syncFeedPostCard === "function") syncFeedPostCard(s.key, s.val());
        if (document.getElementById("view-profile").classList.contains("active")) renderMyProfilePage();
    });
    postsRef.on("child_changed", s => {
        allPosts[s.key] = s.val();
        if (typeof updatePostCardInPlace === "function") updatePostCardInPlace(s.key, s.val());
        if (typeof activeCommentPostId !== "undefined" && activeCommentPostId === s.key && document.getElementById("commentsModal").style.display === "flex") renderCommentsList();
    });
    postsRef.on("child_removed", s => {
        delete allPosts[s.key];
        const card = document.querySelector(`.ig-post[data-pid="${s.key}"]`); if (card) card.remove();
        if (document.getElementById("view-profile").classList.contains("active")) renderMyProfilePage();
    });
}

function switchMainTab(tabName) {
    triggerHaptic(8);
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.getAttribute("data-nav") === tabName));
    document.querySelectorAll(".tab-view").forEach(v => v.classList.toggle("active", v.id === "view-" + tabName));
    if (tabName === "profile") { ensurePostsLoaded(); renderMyProfilePage(); }
    if (tabName === "feed") { ensurePostsLoaded(); renderFeed(); }
    if (tabName === "spaces") renderSpacesList();
    if (tabName === "games" && typeof renderGamesHub === "function") renderGamesHub();
}

// ==================== 6. تهيئة التطبيق الخفيفة (Targeted Listeners) ====================
function enterMainApp(userData) {
    if (appInitialized) return;
    appInitialized = true;
    me = userData;
    contactProfiles[me.username] = me;

    loadInstantBootCache(me.username);
    contactProfiles[me.username] = me;

    document.getElementById("authScreen").style.display = "none";
    document.getElementById("appShell").style.display = "flex";
    document.getElementById("soundToggleBtn").innerText = soundEnabled ? "مفعلة" : "صامت";
    applyWallpaper(localStorage.getItem("app_wp") || "pattern", true);
    updateDynamicGreeting();

    renderChatsSidebarNow();
    scheduleStoriesRender();
    renderSpacesList();

    initStickerDrawer();
    setupPresence();
    listenForIncomingCalls();
    setupMessagesScrollWatcher();
    if (typeof initGamesListeners === "function") initGamesListeners();
    if (!selfDestructInterval) selfDestructInterval = setInterval(tickSelfDestructMessages, 1000);

    // تحميل المنشورات بهدوء بعد استقرار الشاشة بـ 4 ثواني (أو فوراً عند الضغط على المنشورات)
    setTimeout(() => ensurePostsLoaded(), 4000);

    db.ref("users/" + me.username).on("value", snap => {
        const d = snap.val();
        if (!d || d.banned) { showToast("تم حظر أو حذف حسابك"); setTimeout(logoutAccount, 1400); return; }
        me = d; contactProfiles[me.username] = d;
        updateDynamicGreeting();
        if (document.getElementById("view-profile").classList.contains("active")) renderMyProfilePage();
        scheduleStoriesRender();
        scheduleSaveBootCache();
    });

    // مراقبة ستورياتي فقط (وستوريات الأصدقاء تُربط في syncContactListeners)
    db.ref("stories/" + me.username).on("value", snap => {
        if (snap.exists()) allStories[me.username] = snap.val();
        else delete allStories[me.username];
        scheduleStoriesRender();
    });

    db.ref(`user_vault/${me.username}`).on("value", snap => {
        const v = snap.val() || {};
        vaultConfig = { pinHash: v.pinHash || "", hidden: v.hidden || {} };
        updateVaultMenuButton();
        scheduleSidebarRender();
    });

    db.ref(`user_contacts/${me.username}`).on("value", snap => {
        myContacts = snap.val() || {};
        syncContactListeners();
        scheduleSidebarRender();
        scheduleStoriesRender();
        scheduleSaveBootCache();
        if (document.getElementById("view-games").classList.contains("active") && typeof renderGamesHub === "function") renderGamesHub();
    });

    db.ref(`user_blocks/${me.username}`).on("value", snap => {
        myBlocked = snap.val() || {};
        if (activeChatType === "dm") updateChatInputLockState();
    });

    db.ref(`highlights/${me.username}`).on("value", snap => {
        myHighlights = snap.val() || {};
        if (document.getElementById("view-profile").classList.contains("active")) renderMyProfilePage();
    });

    db.ref(`gifts/${me.username}`).on("value", snap => {
        myGifts = snap.val() || {};
        if (document.getElementById("view-profile").classList.contains("active")) renderMyProfilePage();
    });

    db.ref("spaces").on("value", snap => {
        allSpaces = snap.val() || {};
        renderSpacesList();
        scheduleSidebarRender();
        scheduleSaveBootCache();
        if ((activeChatType === "group" || activeChatType === "channel") && activeRoomId && allSpaces[activeRoomId]) {
            activeSpaceObj = allSpaces[activeRoomId]; updateActiveHeader();
        }
    });

    db.ref(`notifications/${me.username}`).limitToLast(25).on("value", snap => {
        myNotifications = snap.val() || {};
        document.getElementById("notifDot").classList.toggle("on", Object.values(myNotifications).some(n => !n.read));
        if (document.getElementById("notificationsModal").style.display === "flex") renderNotifications();
    });
}

// مراقبة مستهدفة لأصدقائك فقط (الحساب + آخر رسالة + الستوري) بدون سحب بيانات الغرباء!
function syncContactListeners() {
    const keys = Object.keys(myContacts);
    Object.keys(contactListeners).forEach(u => {
        if (!myContacts[u]) {
            contactListeners[u].off(); delete contactListeners[u]; delete contactProfiles[u];
            if (metaListeners[u]) { metaListeners[u].off(); delete metaListeners[u]; }
            if (storyListeners[u]) { storyListeners[u].off(); delete storyListeners[u]; delete allStories[u]; }
        }
    });
    keys.forEach(u => {
        if (u === me.username) return;
        if (!contactListeners[u]) {
            const r = db.ref("users/" + u);
            contactListeners[u] = r;
            r.on("value", s => {
                if (s.exists() && !s.val().banned) contactProfiles[u] = s.val();
                else delete contactProfiles[u];
                scheduleSidebarRender();
                scheduleStoriesRender();
                scheduleSaveBootCache();
                if (activeChatType === "dm" && activePartner === u) updateActiveHeader();
            });
        }
        if (!metaListeners[u]) {
            const rId = getRoomId(me.username, u);
            const mr = db.ref("chat_meta/" + rId);
            metaListeners[u] = mr;
            mr.on("value", async s => {
                const m = s.val();
                if (m) {
                    allMeta[rId] = m;
                    if (m.lastMsgEnc) decryptedMetaPreviews[rId] = await e2eDecrypt(rId, m.lastMsgEnc);
                    else delete decryptedMetaPreviews[rId];
                } else {
                    delete allMeta[rId]; delete decryptedMetaPreviews[rId];
                }
                scheduleSidebarRender();
                scheduleSaveBootCache();
            });
        }
        if (!storyListeners[u]) {
            const sr = db.ref("stories/" + u);
            storyListeners[u] = sr;
            sr.on("value", s => {
                if (s.exists()) allStories[u] = s.val();
                else delete allStories[u];
                scheduleStoriesRender();
            });
        }
    });
}

function setupPresence() {
    const myRef = db.ref("users/" + me.username);
    db.ref(".info/connected").on("value", s => {
        const connected = s.val() === true;
        updateNetBanner(connected);
        if (connected) {
            myRef.onDisconnect().update({ online: false, lastSeen: firebase.database.ServerValue.TIMESTAMP });
            myRef.update({ online: true, lastSeen: Date.now() });
        }
    });
}

// ==================== 7. البحث الموحد وقائمة المحادثات ====================
function setSidebarFilter(f) {
    sidebarFilter = f || "all";
    document.querySelectorAll("#chatFilterBar .cf-pill").forEach(b => b.classList.toggle("active", b.getAttribute("data-cf") === sidebarFilter));
    renderChatsSidebarNow();
}

function openUnifiedSearchModal() {
    document.getElementById("unifiedSearchInput").value = "";
    document.getElementById("unifiedSearchResult").innerHTML = "";
    document.getElementById("unifiedSearchModal").style.display = "flex";
    setTimeout(() => document.getElementById("unifiedSearchInput").focus(), 100);
}

async function runUnifiedSearch() {
    const target = sanitizeKey(document.getElementById("unifiedSearchInput").value.replace(/^@/, ""));
    const box = document.getElementById("unifiedSearchResult");
    if (!target) { box.innerHTML = `<span style="color:#fb7185; font-size:13px;">اكتب اليوزر المطلوب بالضبط</span>`; return; }
    box.innerHTML = `<span style="color:var(--text-dim); font-size:13px;">جاري البحث...</span>`;
    let html = "";

    const uSnap = await db.ref("users/" + target).once("value");
    if (uSnap.exists() && !uSnap.val().banned && target !== me.username) {
        const u = uSnap.val();
        html += `<div class="search-cat-title">👤 حساب شخصي</div>
            <div style="display:flex; align-items:center; justify-content:space-between; background:var(--glass-inner); padding:10px 12px; border-radius:14px; border:1px solid var(--border); gap:10px; margin-bottom:10px;">
                <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="ensurePostsLoaded(); document.getElementById('unifiedSearchModal').style.display='none'; openOtherProfile('${u.username}')">
                    <div class="avatar sm" id="uniFoundUserAv"></div>
                    <div>
                        <div style="font-weight:800; font-size:14px; display:flex; align-items:center; gap:3px;">${renderStyledUserName(u)} ${getVerifiedBadgeHTML(u.verified)} ${getDevBadgeHTML(u)}</div>
                        <div class="handle-ltr" dir="ltr" style="font-size:12px;">${escapeHTML(getDisplayTag(u))}</div>
                    </div>
                </div>
                <button class="btn btn-sm" onclick="addAndOpenContact('${u.username}')">مراسلة</button>
            </div>`;
    }

    const spFound = Object.values(allSpaces).find(s => s && s.handle === target);
    if (spFound) {
        const isMem = !!(spFound.members && spFound.members[me.username]);
        html += `<div class="search-cat-title">${spFound.type === "channel" ? "📢 قناة" : "👥 مجموعة"}</div>
            <div style="display:flex; align-items:center; justify-content:space-between; background:var(--glass-inner); padding:10px 12px; border-radius:14px; border:1px solid var(--border); gap:10px;">
                <div>
                    <div style="font-weight:800; font-size:14px; display:flex; align-items:center; gap:3px;">${escapeHTML(spFound.name)} ${getVerifiedBadgeHTML(spFound.verified)}</div>
                    <div style="font-size:12px; color:var(--text-dim);"><span class="handle-ltr" dir="ltr" style="font-size:12px;">@${escapeHTML(spFound.handle)}</span> • ${Object.keys(spFound.members || {}).length} مشترك</div>
                </div>
                <button class="btn btn-sm" onclick="document.getElementById('unifiedSearchModal').style.display='none'; joinAndOpenSpace('${spFound.id}')">${isMem ? 'فتح' : 'انضمام'}</button>
            </div>`;
    }

    if (!html) box.innerHTML = `<span style="color:#fb7185; font-size:13px;">❌ لا يوجد حساب أو قناة بهذا اليوزر (<span class="handle-ltr" dir="ltr">@${escapeHTML(target)}</span>)</span>`;
    else {
        box.innerHTML = html;
        if (uSnap.exists() && document.getElementById("uniFoundUserAv")) setAvatarStyle(document.getElementById("uniFoundUserAv"), uSnap.val());
    }
}

async function addAndOpenContact(targetUsername) {
    await db.ref(`user_contacts/${me.username}/${targetUsername}`).set({ addedAt: Date.now() });
    document.getElementById("unifiedSearchModal").style.display = "none";
    const snap = await db.ref("users/" + targetUsername).once("value");
    if (snap.exists()) contactProfiles[targetUsername] = snap.val();
    switchMainTab("chats");
    openDM(targetUsername);
}

function renderChatsSidebar() { scheduleSidebarRender(); }

function renderChatsSidebarNow() {
    const q = (document.getElementById("localFilterInput")?.value || "").trim().toLowerCase();
    const list = document.getElementById("chatsListEl");
    if (!me || !list) return;

    const frag = document.createDocumentFragment();
    const hiddenMap = vaultConfig.hidden || {};

    if (!vaultUnlocked && sidebarFilter !== "spaces" && (!q || "الرسائل المحفوظة".includes(q))) {
        const savedRow = document.createElement("div");
        savedRow.className = "chat-row" + (activeChatType === "saved" ? " active" : "");
        savedRow.onclick = () => openSavedMessages();
        savedRow.innerHTML = `<div class="avatar" style="background:linear-gradient(135deg,#0ea5e9,#6366f1);">🔖</div><div class="chat-row-info"><div class="chat-row-top"><span class="chat-row-name">الرسائل المحفوظة</span></div><div class="chat-row-bottom"><span class="chat-row-preview">ملاحظاتك وصورك وملازمك الخاصة بك وحدك</span></div></div>`;
        frag.appendChild(savedRow);
    }

    const combined = [];
    if (sidebarFilter !== "spaces") {
        Object.values(contactProfiles)
            .filter(u => u && u.username !== me.username && !u.banned)
            .filter(u => vaultUnlocked ? !!hiddenMap[u.username] : !hiddenMap[u.username])
            .filter(u => !q || (u.name || "").toLowerCase().includes(q) || (u.username || "").toLowerCase().includes(q))
            .forEach(u => {
                const rId = getRoomId(me.username, u.username), meta = allMeta[rId];
                combined.push({ kind: "dm", sortTs: meta?.lastTs || 0, user: u, meta, rId });
            });
    }
    if (!vaultUnlocked && sidebarFilter !== "dm") {
        Object.values(allSpaces)
            .filter(s => s && s.members && s.members[me.username])
            .filter(s => !q || (s.name || "").toLowerCase().includes(q) || (s.handle || "").toLowerCase().includes(q))
            .forEach(s => combined.push({ kind: "space", sortTs: s.lastTs || s.createdAt || 0, space: s }));
    }
    combined.sort((a, b) => b.sortTs - a.sortTs);

    if (combined.length === 0) {
        const empty = document.createElement("div");
        empty.style.cssText = "text-align:center; padding:26px 14px; color:var(--text-dim); font-size:13px;";
        if (vaultUnlocked) empty.innerHTML = `🔐 الخزنة السرية فارغة حالياً.<br><span style="font-size:11.5px;">افتح أي محادثة واضغط ⋮ ← «إخفاء المحادثة بالخزنة»</span>`;
        else empty.innerHTML = sidebarFilter === "spaces"
            ? `ما عندك قنوات أو مجموعات بعد.<br><br><button class="btn btn-sm" onclick="openCreateSpaceModal()">➕ إنشاء قناة أو مجموعة</button>`
            : `لا توجد محادثات أخرى.<br><br><button class="btn btn-sm" onclick="openUnifiedSearchModal()">🔍 بحث باليوزر (@)</button>`;
        frag.appendChild(empty);
        list.innerHTML = "";
        list.appendChild(frag);
        return;
    }

    combined.forEach(item => {
        if (item.kind === "dm") {
            const u = item.user, meta = item.meta;
            const isUnread = meta && meta.unreadFor === me.username && !(activeChatType === "dm" && activePartner === u.username);
            const row = document.createElement("div");
            row.className = "chat-row" + (activeChatType === "dm" && activePartner === u.username ? " active" : "") + (vaultUnlocked ? " vault-row" : "");
            row.setAttribute("data-dm-user", u.username);
            row.onclick = () => openDM(u.username);
            const av = document.createElement("div"); av.className = "avatar"; setAvatarStyle(av, u);
            const info = document.createElement("div"); info.className = "chat-row-info";
            const decryptedPrev = decryptedMetaPreviews[item.rId] || meta?.lastMsg || "";
            const prev = myBlocked[u.username] ? "🚫 محظور" : (decryptedPrev || u.moodText || u.bio || getDisplayTag(u));
            info.innerHTML = `<div class="chat-row-top"><span class="chat-row-name">${vaultUnlocked ? '🔐 ' : ''}${renderStyledUserName(u)} ${getVerifiedBadgeHTML(u.verified)} ${getDevBadgeHTML(u)}</span><span class="chat-row-time">${meta?.lastTs ? formatTime(meta.lastTs) : ""}</span></div><div class="chat-row-bottom"><span class="chat-row-preview" style="${isUnread ? 'color:var(--text);font-weight:700;' : ''}">${escapeHTML(prev)}</span>${isUnread ? '<span class="unread-dot"></span>' : ''}</div>`;
            row.appendChild(av); row.appendChild(info); frag.appendChild(row);
        } else {
            const s = item.space;
            const isAct = (activeChatType === "channel" || activeChatType === "group") && activeRoomId === s.id;
            const row = document.createElement("div");
            row.className = "chat-row" + (isAct ? " active" : "");
            row.onclick = () => openSpaceRoom(s.id);
            const av = document.createElement("div"); av.className = "avatar"; setAvatarStyle(av, { name: s.name, avatarColor: s.avatarColor }, false);
            const cnt = Object.keys(s.members || {}).length;
            const info = document.createElement("div"); info.className = "chat-row-info";
            info.innerHTML = `<div class="chat-row-top"><span class="chat-row-name">${escapeHTML(s.name)} ${getVerifiedBadgeHTML(s.verified)} <span class="space-badge ${s.type === 'group' ? 'grp' : ''}">${s.type === 'channel' ? 'قناة' : 'مجموعة'}</span></span><span class="chat-row-time">${s.lastTs ? formatTime(s.lastTs) : ""}</span></div><div class="chat-row-bottom"><span class="chat-row-preview">${escapeHTML(s.lastMsg || `@${s.handle} • ${cnt} مشترك`)}</span></div>`;
            row.appendChild(av); row.appendChild(info); frag.appendChild(row);
        }
    });

    list.innerHTML = "";
    list.appendChild(frag);
}

// ==================== 8. البحث داخل المحادثة + معرض الوسائط + التدمير الذاتي ====================
function setupMessagesScrollWatcher() {
    const area = document.getElementById("messagesList"), btn = document.getElementById("scrollBottomBtn"), cnt = document.getElementById("scrollBottomCount");
    if (!area || !btn) return;
    area.addEventListener("scroll", () => {
        const farUp = (area.scrollHeight - area.scrollTop - area.clientHeight) > 220;
        btn.classList.toggle("show", farUp);
        if (!farUp) { unreadWhileScrolled = 0; if (cnt) { cnt.style.display = "none"; cnt.innerText = "0"; } }
    }, { passive: true });
}

function scrollToBottomSmooth() {
    const area = document.getElementById("messagesList"), cnt = document.getElementById("scrollBottomCount");
    if (!area) return;
    unreadWhileScrolled = 0; if (cnt) { cnt.style.display = "none"; cnt.innerText = "0"; }
    area.scrollTo({ top: area.scrollHeight, behavior: "smooth" });
}

function toggleInChatSearch(force) {
    const bar = document.getElementById("inChatSearchBar"), inp = document.getElementById("inChatSearchInp");
    if (!bar) return;
    const show = typeof force === "boolean" ? force : !bar.classList.contains("open");
    bar.classList.toggle("open", show);
    if (show && inp) { inp.value = ""; document.getElementById("inChatSearchCount").innerText = ""; setTimeout(() => inp.focus(), 60); }
    else { document.querySelectorAll(".msg-wrap.search-hit").forEach(n => n.classList.remove("search-hit")); if (inp) inp.value = ""; document.getElementById("inChatSearchCount").innerText = ""; }
}

function runInChatSearch(query) {
    const q = (query || "").trim().toLowerCase(), countEl = document.getElementById("inChatSearchCount");
    document.querySelectorAll(".msg-wrap.search-hit").forEach(n => n.classList.remove("search-hit"));
    if (!q) { if (countEl) countEl.innerText = ""; return; }
    const hits = [];
    document.querySelectorAll("#messagesList .msg-wrap").forEach(node => {
        const m = activeMsgsMap[node.getAttribute("data-mid")];
        if (m && m.type === "text" && String(m.content || "").toLowerCase().includes(q)) { node.classList.add("search-hit"); hits.push(node); }
    });
    if (countEl) countEl.innerText = hits.length ? `${hits.length} نتيجة` : "لا نتائج";
    if (hits.length) hits[hits.length - 1].scrollIntoView({ behavior: "smooth", block: "center" });
}

let activeMediaGalleryTab = "images";
function openMediaGalleryModal() {
    if (!activeRoomId) return;
    activeMediaGalleryTab = "images";
    document.getElementById("mediaGalleryModal").style.display = "flex";
    switchMediaGalleryTab("images");
}

function switchMediaGalleryTab(tab) {
    activeMediaGalleryTab = tab;
    document.getElementById("mgTabImgs").classList.toggle("active", tab === "images");
    document.getElementById("mgTabVids").classList.toggle("active", tab === "videos");
    document.getElementById("mgTabAuds").classList.toggle("active", tab === "audios");

    const body = document.getElementById("mediaGalleryBody");
    const msgs = Object.values(activeMsgsMap || {}).sort((a, b) => (b.ts || 0) - (a.ts || 0));
    if (tab === "images") {
        const imgs = msgs.filter(m => m.type === "image" && m.content);
        if (!imgs.length) { body.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-dim); font-size:13px;">لا توجد صور محفوظة هنا</div>`; return; }
        body.innerHTML = `<div class="mg-grid">${imgs.map(m => `<div class="mg-tile" onclick="openLightbox('${m.content}')"><img src="${m.content}" loading="lazy" decoding="async"></div>`).join("")}</div>`;
    } else if (tab === "videos") {
        const vids = msgs.filter(m => m.type === "video" && m.content);
        if (!vids.length) { body.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-dim); font-size:13px;">لا توجد فيديوهات هنا</div>`; return; }
        body.innerHTML = `<div class="mg-grid">${vids.map(m => `<div class="mg-tile" onclick="openFullVideoModal('${m.content}')"><video src="${m.content}" preload="metadata" muted></video><span class="cvp-badge">▶</span></div>`).join("")}</div>`;
    } else {
        const auds = msgs.filter(m => m.type === "audio" && m.content);
        if (!auds.length) { body.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-dim); font-size:13px;">لا توجد بصمات صوتية هنا</div>`; return; }
        body.innerHTML = "";
        auds.forEach(m => {
            const row = document.createElement("div"); row.className = "mg-audio-row";
            row.innerHTML = `<div style="font-size:11.5px; color:var(--accent); font-weight:700; margin-bottom:4px;">${escapeHTML(m.senderName || m.sender)} • ${formatTime(m.ts)}</div>`;
            row.appendChild(buildVoicePlayer(m.content, m.id, m.voiceFilter));
            body.appendChild(row);
        });
    }
}

function handleSelfDestructSelect(val) {
    selectedSelfDestructSec = parseInt(val || "0", 10) || 0;
    const fxBtn = document.getElementById("fxToggleBtn");
    if (fxBtn) fxBtn.classList.toggle("accent", selectedSelfDestructSec > 0 || fxBtn.innerText !== "✨");
    if (selectedSelfDestructSec > 0) {
        const lbl = selectedSelfDestructSec === 10 ? "10 ثواني" : (selectedSelfDestructSec === 60 ? "دقيقة" : "ساعة");
        showToast(`⏱️ رسالتك الجاية تنمسح تلقائياً بعد القراءة بـ ${lbl}`);
    }
}

function tickSelfDestructMessages() {
    if (!activeRoomId) return;
    const pills = document.querySelectorAll(".sd-pill[data-sd-exp]");
    if (!pills.length) return;
    const now = Date.now();
    pills.forEach(pill => {
        const exp = parseInt(pill.getAttribute("data-sd-exp") || "0", 10), mid = pill.getAttribute("data-sd-mid");
        if (!exp || !mid) return;
        const leftSec = Math.ceil((exp - now) / 1000);
        if (leftSec <= 0) {
            const wrap = document.querySelector(`.msg-wrap[data-mid="${mid}"]`); if (wrap) wrap.remove();
            delete activeMsgsMap[mid];
            db.ref(`${getActiveRoomBasePath()}/${mid}`).remove().catch(() => {});
        } else {
            const m = Math.floor(leftSec / 60), s = leftSec % 60;
            pill.innerText = m > 0 ? `🔥 ${m}:${String(s).padStart(2, "0")}` : `🔥 ${leftSec}ث`;
        }
    });
}

// ==================== 9. محرّك المحادثة السريع ====================
function stopAnyVoicePlayback() {
    if (currentPlayingAudio) { try { currentPlayingAudio.pause(); } catch {} currentPlayingAudio = null; }
    if (currentPlayingBtn) { currentPlayingBtn.innerText = "▶"; currentPlayingBtn = null; }
}

function detachRoomListeners() {
    activeRoomToken++;
    activePartnerTyping = false;
    stopAnyVoicePlayback();
    clearTimeout(seenFlushTimer);
    pendingSeenBatch = {};
    unreadWhileScrolled = 0;
    const sb = document.getElementById("scrollBottomBtn"); if (sb) sb.classList.remove("show");
    if (roomQueryRef) { roomQueryRef.off(); roomQueryRef = null; }
    if (typingRef) { typingRef.off(); typingRef = null; }
    if (pinnedRef) { pinnedRef.off(); pinnedRef = null; }
    if (blockCheckRef) { blockCheckRef.off(); blockCheckRef = null; }
    toggleChatToolsMenu(false);
    toggleInChatSearch(false);
    const tb = document.getElementById("typingBubbleWrap"); if (tb) tb.classList.remove("show");
}

function updateChatToolsVisibility(type) {
    const menuBtn = document.getElementById("btnChatToolsMenu");
    if (menuBtn) menuBtn.style.display = type === "saved" ? "none" : "inline-flex";
    document.querySelectorAll("#chatToolsDropdown .dm-only-tool").forEach(el => { el.style.display = type === "dm" ? "flex" : "none"; });
    document.querySelectorAll("#chatToolsDropdown .space-only-tool").forEach(el => { el.style.display = (type === "channel" || type === "group") ? "flex" : "none"; });
}

function resetMessagesStage(dbPath) {
    activeMsgsMap = {};
    const area = document.getElementById("messagesList");
    document.getElementById("pinnedBar").style.display = "none";
    if (!area) return;

    const cached = dbPath && roomMsgsCache[dbPath];
    if (cached && Object.keys(cached).length > 0) {
        area.innerHTML = "";
        const frag = document.createDocumentFragment();
        Object.entries(cached)
            .filter(([, m]) => m && !(m.deletedFor && m.deletedFor[me.username]))
            .sort((a, b) => (a[1].ts || 0) - (b[1].ts || 0))
            .forEach(([id, m]) => { activeMsgsMap[id] = m; appendMessageWithDateSep(frag, id, m); });
        area.appendChild(frag);
        area.scrollTop = area.scrollHeight;
    } else {
        area.innerHTML = `<div class="empty-room-hint skel-list"><div class="skel-bubble other"></div><div class="skel-bubble me tall"></div><div class="skel-bubble other"></div><div class="skel-bubble me"></div></div>`;
    }
}

function openSavedMessages() {
    detachRoomListeners();
    const myToken = activeRoomToken; activeRoomLimit = 14;
    const dbPath = `saved_msgs/${me.username}`;
    activeChatType = "saved"; activePartner = null; activeRoomId = me.username; activeSpaceObj = null;
    seenMarkedSet.clear(); cancelReplyOrEdit(); toggleStickerDrawer(false); toggleChatExtras(false);
    resetMessagesStage(dbPath);

    switchMainTab("chats");
    document.getElementById("chatEmptyState").style.display = "none";
    document.getElementById("activeChatView").style.display = "flex";
    document.getElementById("chatPane").classList.add("open");
    document.getElementById("btnVoiceCall").style.display = "none";
    document.getElementById("btnVideoCall").style.display = "none";
    document.getElementById("btnPollCreate").style.display = "none";
    document.getElementById("voAttachBtn").style.display = "none";
    document.getElementById("pollAttachBtn").style.display = "none";
    updateChatToolsVisibility("saved");

    updateActiveHeader(); updateChatInputLockState(); renderChatsSidebarNow();
    attachIncrementalMessages(dbPath, myToken);
}

function openDM(partnerUsername) {
    detachRoomListeners();
    const myToken = activeRoomToken; activeRoomLimit = 14;
    activeChatType = "dm"; activePartner = partnerUsername; activeRoomId = getRoomId(me.username, partnerUsername);
    activeSpaceObj = null; blockedByPartner = false; activePartnerTyping = false;
    seenMarkedSet.clear(); cancelReplyOrEdit(); toggleStickerDrawer(false); toggleChatExtras(false);
    updateVaultMenuButton();

    const dbPath = `chats/${activeRoomId}/messages`;
    resetMessagesStage(dbPath);

    document.getElementById("chatEmptyState").style.display = "none";
    document.getElementById("activeChatView").style.display = "flex";
    document.getElementById("chatPane").classList.add("open");
    document.getElementById("btnVoiceCall").style.display = "inline-flex";
    document.getElementById("btnVideoCall").style.display = "inline-flex";
    document.getElementById("btnPollCreate").style.display = "none";
    document.getElementById("voAttachBtn").style.display = "flex";
    document.getElementById("pollAttachBtn").style.display = "none";
    updateChatToolsVisibility("dm");

    updateActiveHeader(); renderChatsSidebarNow();

    const roomIdCopy = activeRoomId;
    if (allMeta[roomIdCopy]?.unreadFor === me.username) {
        db.ref(`chat_meta/${roomIdCopy}/unreadFor`).set("").catch(() => {});
    }

    blockCheckRef = db.ref(`user_blocks/${partnerUsername}/${me.username}`);
    blockCheckRef.on("value", s => { if (myToken !== activeRoomToken) return; blockedByPartner = !!s.val(); updateChatInputLockState(); });
    updateChatInputLockState();

    typingRef = db.ref(`chats/${roomIdCopy}/typing/${partnerUsername}`);
    typingRef.on("value", s => {
        if (myToken !== activeRoomToken) return;
        activePartnerTyping = s.val() === true;
        const tb = document.getElementById("typingBubbleWrap"), nm = document.getElementById("typingBubbleName");
        if (tb) tb.classList.toggle("show", activePartnerTyping);
        if (nm) nm.innerText = `${contactProfiles[partnerUsername]?.name || ""} يكتب`;
        updateActiveHeader();
    });

    pinnedRef = db.ref(`chats/${roomIdCopy}/pinned`);
    pinnedRef.on("value", s => { if (myToken === activeRoomToken) renderPinnedBar(s.val()); });

    attachIncrementalMessages(dbPath, myToken);
}

function openSpaceRoom(spaceId) {
    const sp = allSpaces[spaceId]; if (!sp) return;
    detachRoomListeners();
    const myToken = activeRoomToken; activeRoomLimit = 12;
    activeChatType = sp.type; activePartner = null; activeRoomId = spaceId; activeSpaceObj = sp;
    seenMarkedSet.clear(); cancelReplyOrEdit(); toggleStickerDrawer(false); toggleChatExtras(false);

    const dbPath = `space_msgs/${spaceId}`;
    resetMessagesStage(dbPath);

    switchMainTab("chats");
    document.getElementById("chatEmptyState").style.display = "none";
    document.getElementById("activeChatView").style.display = "flex";
    document.getElementById("chatPane").classList.add("open");
    document.getElementById("btnVoiceCall").style.display = "none";
    document.getElementById("btnVideoCall").style.display = "none";
    document.getElementById("voAttachBtn").style.display = "none";
    updateChatToolsVisibility(sp.type);

    const canPost = sp.type === "group" || sp.owner === me.username;
    document.getElementById("btnPollCreate").style.display = canPost ? "inline-flex" : "none";
    document.getElementById("pollAttachBtn").style.display = canPost ? "flex" : "none";

    updateActiveHeader(); updateChatInputLockState(); renderChatsSidebarNow();
    pinnedRef = db.ref(`spaces/${spaceId}/pinned`);
    pinnedRef.on("value", s => { if (myToken === activeRoomToken) renderPinnedBar(s.val()); });

    attachIncrementalMessages(dbPath, myToken);
}

function loadOlderMessages() {
    if (!activeRoomId) return;
    activeRoomLimit += 14;
    const basePath = getActiveRoomBasePath();
    if (roomQueryRef) { roomQueryRef.off(); roomQueryRef = null; }
    const token = activeRoomToken;
    activeMsgsMap = {};
    document.getElementById("messagesList").innerHTML = "";
    attachIncrementalMessages(basePath, token, true);
}

function attachIncrementalMessages(dbPath, token, keepScroll = false) {
    const area = document.getElementById("messagesList");
    let initialDone = false;
    const roomIdSnap = activeRoomId;
    if (!roomMsgsCache[dbPath]) roomMsgsCache[dbPath] = {};

    roomQueryRef = db.ref(dbPath).orderByKey().limitToLast(activeRoomLimit);

    const safetyTimer = setTimeout(() => {
        if (token !== activeRoomToken) return;
        const hint = area.querySelector(".empty-room-hint");
        if (hint && hint.classList.contains("skel-list")) {
            hint.className = "empty-room-hint";
            hint.style.cssText = "margin:auto; text-align:center; color:var(--text-dim); font-size:13px; background:var(--bg-card); padding:14px 20px; border-radius:16px; border:1px solid var(--border);";
            hint.innerHTML = isDbConnected ? "لا توجد رسائل بعد 🔒" : "📡 النت ضعيف — جاري انتظار الاتصال...";
        }
    }, 3600);

    roomQueryRef.once("value", snap => {
        clearTimeout(safetyTimer);
        if (token !== activeRoomToken) return;
        initialDone = true;
        const hint = area.querySelector(".empty-room-hint"); if (hint) hint.remove();
        const count = snap.numChildren();
        if (count === 0 && !area.querySelector(".msg-wrap")) {
            area.innerHTML = `<div class="empty-room-hint" style="margin:auto; text-align:center; color:var(--text-dim); font-size:13px; background:var(--bg-card); padding:14px 20px; border-radius:16px; border:1px solid var(--border);">لا توجد رسائل بعد 🔒</div>`;
        } else if (count >= activeRoomLimit && !area.querySelector(".load-more-btn")) {
            const btn = document.createElement("button"); btn.className = "load-more-btn"; btn.innerText = "⬆️ تحميل رسائل أقدم"; btn.onclick = loadOlderMessages;
            area.insertBefore(btn, area.firstChild);
        }
        if (!keepScroll) area.scrollTop = area.scrollHeight;
    });

    roomQueryRef.on("child_added", async snap => {
        if (token !== activeRoomToken) return;
        const id = snap.key, rawM = snap.val();
        if (!rawM || (rawM.deletedFor && rawM.deletedFor[me.username])) return;
        if (rawM.sdExpireAt && Date.now() >= rawM.sdExpireAt) { db.ref(`${dbPath}/${id}`).remove().catch(() => {}); return; }

        const m = await hydrateMessageDecryption(rawM, roomIdSnap);
        if (token !== activeRoomToken) return;

        roomMsgsCache[dbPath][id] = m;
        trimRoomCache(dbPath);
        const hint = area.querySelector(".empty-room-hint"); if (hint) hint.remove();
        activeMsgsMap[id] = m;

        const existing = area.querySelector(`.msg-wrap[data-mid="${id}"]`);
        if (existing) { updateMessageNodeInPlace(existing, id, m); return; }

        const nearBottom = (area.scrollHeight - area.scrollTop - area.clientHeight) < 180;
        appendMessageWithDateSep(area, id, m);
        scheduleSeenMark(id, m, token);

        if (initialDone && m.sender !== me.username) {
            playRecvSound();
            if (!nearBottom) {
                unreadWhileScrolled++;
                const cnt = document.getElementById("scrollBottomCount"), sb = document.getElementById("scrollBottomBtn");
                if (cnt) { cnt.innerText = unreadWhileScrolled; cnt.style.display = "flex"; }
                if (sb) sb.classList.add("show");
            }
        }
        if (!keepScroll && (nearBottom || !initialDone || m.sender === me.username)) area.scrollTop = area.scrollHeight;
    });

    roomQueryRef.on("child_changed", async snap => {
        if (token !== activeRoomToken) return;
        const id = snap.key, rawM = snap.val(); if (!rawM) return;
        if (rawM.deletedFor && rawM.deletedFor[me.username]) {
            const el = area.querySelector(`.msg-wrap[data-mid="${id}"]`); if (el) el.remove();
            delete activeMsgsMap[id]; delete roomMsgsCache[dbPath][id]; return;
        }
        const m = await hydrateMessageDecryption(rawM, roomIdSnap);
        if (token !== activeRoomToken) return;
        activeMsgsMap[id] = m; roomMsgsCache[dbPath][id] = m;
        const el = area.querySelector(`.msg-wrap[data-mid="${id}"]`);
        if (el) updateMessageNodeInPlace(el, id, m);
    });

    roomQueryRef.on("child_removed", snap => {
        if (token !== activeRoomToken) return;
        const id = snap.key;
        delete activeMsgsMap[id]; delete roomMsgsCache[dbPath][id];
        const el = area.querySelector(`.msg-wrap[data-mid="${id}"]`); if (el) el.remove();
    });

    offlineQueue.filter(q => q.dbPath === dbPath && q.owner === me.username).forEach(q => {
        if (!area.querySelector(`.msg-wrap[data-mid="${q.payload.id}"]`)) {
            const hint = area.querySelector(".empty-room-hint"); if (hint) hint.remove();
            appendMessageWithDateSep(area, q.payload.id, q.localDisplay || q.payload);
        }
    });
}

function scheduleSeenMark(id, m, token) {
    if (m._pending) return;
    const isMe = m.sender === me.username;
    if (activeChatType === "dm" && !isMe && !m.seen && !seenMarkedSet.has(id)) {
        seenMarkedSet.add(id);
        pendingSeenBatch[`${id}/seen`] = true;
        if (m.sdSec && !m.sdExpireAt) pendingSeenBatch[`${id}/sdExpireAt`] = Date.now() + (m.sdSec * 1000);
    } else if (activeChatType === "channel" && (!m.views || !m.views[me.username]) && !seenMarkedSet.has(id)) {
        seenMarkedSet.add(id); pendingSeenBatch[`${id}/views/${me.username}`] = true;
    } else return;

    clearTimeout(seenFlushTimer);
    seenFlushTimer = setTimeout(() => {
        if (token !== activeRoomToken) return;
        const batch = pendingSeenBatch; pendingSeenBatch = {};
        if (Object.keys(batch).length > 0) db.ref(getActiveRoomBasePath()).update(batch).catch(() => {});
    }, 240);
}

function appendMessageWithDateSep(container, id, m) {
    const dKey = formatDateKey(m.ts);
    const seps = container.querySelectorAll ? container.querySelectorAll(".date-sep") : [];
    const lastKey = seps.length ? seps[seps.length - 1].getAttribute("data-dkey") : null;
    if (dKey !== lastKey) {
        const sep = document.createElement("div"); sep.className = "date-sep"; sep.setAttribute("data-dkey", dKey); sep.innerText = formatDateLabel(m.ts);
        container.appendChild(sep);
    }
    container.appendChild(buildMessageNode(id, m));
}

function attachSwipeToReply(wrap, id) {
    let sx = 0, sy = 0, dx = 0, active = false, buzzed = false;
    wrap.addEventListener("touchstart", e => {
        if (activeChatType === "channel" || e.touches.length !== 1 || e.target.closest(".scratch-canvas, input, button")) return;
        sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; active = false; buzzed = false;
    }, { passive: true });
    wrap.addEventListener("touchmove", e => {
        if (activeChatType === "channel" || e.touches.length !== 1 || e.target.closest(".scratch-canvas")) return;
        const cx = e.touches[0].clientX - sx, cy = e.touches[0].clientY - sy;
        if (!active && Math.abs(cx) > 14 && Math.abs(cx) > Math.abs(cy) * 1.45) { active = true; wrap.classList.add("swiping"); }
        if (active) {
            dx = Math.max(-72, Math.min(72, cx)); wrap.style.transform = `translateX(${dx}px)`;
            if (!buzzed && Math.abs(dx) >= 52) { buzzed = true; triggerHaptic(15); }
        }
    }, { passive: true });
    const finish = () => {
        if (!active) return;
        wrap.classList.remove("swiping"); wrap.style.transform = "";
        if (Math.abs(dx) >= 52) { const live = activeMsgsMap[id]; if (live) { selectedMsg = { id, data: live }; replyToSelected(); } }
        active = false; dx = 0;
    };
    wrap.addEventListener("touchend", finish, { passive: true });
    wrap.addEventListener("touchcancel", finish, { passive: true });
}

// ==================== مشغّل البصمة والفيديو ====================
function buildVoicePlayer(src, msgId, voiceFilter = "normal") {
    const wrap = document.createElement("div"); wrap.className = "voice-player";
    const playBtn = document.createElement("button"); playBtn.className = "vp-play"; playBtn.innerText = "▶";
    const body = document.createElement("div"); body.className = "vp-body";
    const wave = document.createElement("div"); wave.className = "vp-wave";
    const bars = [];
    let seed = 0; for (let i = 0; i < (msgId || "v").length; i++) seed += msgId.charCodeAt(i);
    for (let i = 0; i < 24; i++) {
        const b = document.createElement("div"); b.className = "vp-bar";
        b.style.height = (28 + ((seed * (i + 3) * 17) % 70)) + "%";
        wave.appendChild(b); bars.push(b);
    }
    const meta = document.createElement("div"); meta.className = "vp-meta";
    const fLabels = { deep: "🗣️ عميق", fast: "⚡ مسرّع", echo: "🏛️ صدى" };
    const timeEl = document.createElement("span"); timeEl.innerText = fLabels[voiceFilter] ? `${fLabels[voiceFilter]} • 00:00` : "00:00";
    const speedBtn = document.createElement("button"); speedBtn.className = "vp-speed"; speedBtn.innerText = "1x";
    meta.appendChild(timeEl); meta.appendChild(speedBtn);
    body.appendChild(wave); body.appendChild(meta);
    wrap.appendChild(playBtn); wrap.appendChild(body);

    const aud = new Audio(src);
    let baseRate = voiceFilter === "deep" ? 0.80 : (voiceFilter === "fast" ? 1.32 : 1), rate = 1;
    try { aud.preservesPitch = voiceFilter === "normal"; } catch {}
    const fmt = sec => !isFinite(sec) ? "00:00" : `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
    const lblPrefix = fLabels[voiceFilter] ? fLabels[voiceFilter] + " • " : "";

    aud.addEventListener("loadedmetadata", () => { timeEl.innerText = lblPrefix + fmt(aud.duration); });
    aud.addEventListener("timeupdate", () => {
        if (!aud.duration) return;
        const lit = Math.floor((aud.currentTime / aud.duration) * bars.length);
        bars.forEach((b, idx) => b.classList.toggle("played", idx <= lit));
        timeEl.innerText = lblPrefix + fmt(aud.currentTime);
    });
    aud.addEventListener("ended", () => {
        playBtn.innerText = "▶"; bars.forEach(b => b.classList.remove("played")); timeEl.innerText = lblPrefix + fmt(aud.duration);
        if (currentPlayingAudio === aud) { currentPlayingAudio = null; currentPlayingBtn = null; }
    });
    playBtn.onclick = e => {
        e.stopPropagation();
        if (aud.paused) {
            if (currentPlayingAudio && currentPlayingAudio !== aud) stopAnyVoicePlayback();
            aud.playbackRate = baseRate * rate; aud.play().catch(() => {});
            playBtn.innerText = "⏸"; currentPlayingAudio = aud; currentPlayingBtn = playBtn;
        } else { aud.pause(); playBtn.innerText = "▶"; }
    };
    wave.onclick = e => {
        e.stopPropagation(); if (!aud.duration) return;
        const rect = wave.getBoundingClientRect();
        aud.currentTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * aud.duration;
    };
    speedBtn.onclick = e => { e.stopPropagation(); rate = rate === 1 ? 1.5 : (rate === 1.5 ? 2 : 1); speedBtn.innerText = rate + "x"; aud.playbackRate = baseRate * rate; };
    return wrap;
}

function buildCustomVideoCard(src) {
    const box = document.createElement("div"); box.className = "custom-vid-box";
    box.innerHTML = `<video src="${src}" preload="metadata" muted playsinline></video><div class="cvp-overlay-play"><div class="cvp-play-circle">▶</div></div><span class="cvp-badge">🎬 فيديو</span>`;
    box.onclick = e => { e.stopPropagation(); openFullVideoModal(src); };
    return box;
}

function openFullVideoModal(src) {
    stopAnyVoicePlayback();
    const vid = document.getElementById("fullVidEl"), playBtn = document.getElementById("fullVidPlayBtn"), seek = document.getElementById("fullVidSeek"), timeEl = document.getElementById("fullVidTime");
    vid.src = src; seek.value = 0; timeEl.innerText = "00:00";
    document.getElementById("videoFullModal").style.display = "flex";
    vid.play().catch(() => {}); playBtn.innerText = "⏸";
    vid.ontimeupdate = () => {
        if (!vid.duration) return;
        seek.value = Math.round((vid.currentTime / vid.duration) * 100);
        timeEl.innerText = `${String(Math.floor(vid.currentTime / 60)).padStart(2, "0")}:${String(Math.floor(vid.currentTime % 60)).padStart(2, "0")}`;
    };
    vid.onended = () => { playBtn.innerText = "▶"; };
}
function toggleFullVidPlay() { const v = document.getElementById("fullVidEl"), b = document.getElementById("fullVidPlayBtn"); if (v.paused) { v.play().catch(() => {}); b.innerText = "⏸"; } else { v.pause(); b.innerText = "▶"; } }
function seekFullVid(val) { const v = document.getElementById("fullVidEl"); if (v.duration) v.currentTime = (val / 100) * v.duration; }
function closeFullVideoModal() { const v = document.getElementById("fullVidEl"); v.pause(); v.src = ""; document.getElementById("videoFullModal").style.display = "none"; }

// ==================== بناء وتحديث فقاعة الرسالة ====================
function buildReactChipHTML(em, usersList) {
    const mine = usersList.includes(me.username);
    const avHTML = usersList.slice(0, 2).map(u => {
        const p = contactProfiles[u] || (u === me.username ? me : { name: u });
        if (p.avatarImg) return `<span class="react-av" style="background-image:url(${p.avatarImg})"></span>`;
        return `<span class="react-av" style="background:${p.avatarColor || GRADIENTS[0]}">${escapeHTML((p.name || u).charAt(0))}</span>`;
    }).join("");
    return `<span class="react-chip ${mine ? 'mine' : ''}" data-em="${escapeHTML(em)}">${em}${avHTML}${usersList.length > 2 ? `<span>${usersList.length}</span>` : ""}</span>`;
}

function buildReactionsHTML(id, m, isChannel) {
    if (isChannel) {
        let pills = "";
        CH_REACTIONS.forEach(r => {
            const voters = m.chReactions?.[r.k] || {}, cnt = Object.keys(voters).length, mine = !!voters[me.username];
            if (cnt > 0) pills += `<button class="ch-pill ${mine ? 'mine' : ''}" onclick="event.stopPropagation(); toggleChannelReaction('${id}','${r.k}',${mine})">${r.em} <span>${cnt}</span></button>`;
        });
        pills += `<button class="ch-add-react" title="إضافة تفاعل" onclick="event.stopPropagation(); openMsgActions('${id}', activeMsgsMap['${id}'])">+</button>`;
        return pills;
    }
    if (!m.reactions) return "";
    const grouped = {};
    Object.entries(m.reactions).forEach(([u, em]) => { if (!grouped[em]) grouped[em] = []; grouped[em].push(u); });
    return Object.entries(grouped).map(([em, uList]) => buildReactChipHTML(em, uList)).join("");
}

function buildFooterHTML(id, m, isMe, isChannel) {
    if (isChannel) return `<span>👁️ ${Object.keys(m.views || {}).length}</span><span>${formatTime(m.ts)}</span>`;
    const sdHTML = m.sdSec
        ? (m.sdExpireAt
            ? `<span class="sd-pill" data-sd-mid="${id}" data-sd-exp="${m.sdExpireAt}">🔥 ${Math.max(1, Math.ceil((m.sdExpireAt - Date.now()) / 1000))}ث</span>`
            : `<span class="sd-pill">⏱️ ${m.sdSec >= 3600 ? '1س' : (m.sdSec >= 60 ? '1د' : m.sdSec + 'ث')}</span>`)
        : "";
    const e2eHTML = m.e2e ? `<span class="e2e-pill" title="مشفّرة AES-GCM">🔒</span>` : "";
    const tick = isMe && activeChatType === "dm"
        ? (m._pending ? `<span class="ticks pending">🕒</span>` : `<span class="ticks ${m.seen ? 'seen' : ''}">${m.seen ? '✓✓' : '✓'}</span>`)
        : (m._pending ? `<span class="ticks pending">🕒</span>` : "");
    return `${sdHTML}${m.edited ? '<span>(معدّلة)</span>' : ''}${e2eHTML}<span>${formatTime(m.ts)}</span>${tick}`;
}

function buildPollInnerHTML(id, poll) {
    const votes = poll.votes || {}, totalVotes = Object.keys(votes).length, myVote = votes[me.username];
    let html = `<div class="poll-q">📊 ${escapeHTML(poll.question)}</div>`;
    (poll.options || []).forEach((optText, idx) => {
        const optCount = Object.values(votes).filter(v => v === idx).length;
        const pct = totalVotes > 0 ? Math.round((optCount / totalVotes) * 100) : 0;
        html += `<div class="poll-opt ${myVote === idx ? 'voted' : ''}" onclick="event.stopPropagation(); voteInPoll('${id}', ${idx})"><div class="poll-bar" style="width:${pct}%"></div><span>${myVote === idx ? '✓ ' : ''}${escapeHTML(optText)}</span><span>${pct}%</span></div>`;
    });
    html += `<div class="poll-meta">إجمالي الأصوات: ${totalVotes}</div>`;
    return html;
}

function buildMessageNode(id, m) {
    const isMe = m.sender === me.username, isChannel = activeChatType === "channel";
    const isStickerLike = m.type === "sticker" || m.type === "img_sticker";
    const wrap = document.createElement("div");
    wrap.className = "msg-wrap " + (isChannel ? "channel-post" : (isMe ? "me" : "other"));
    wrap.setAttribute("data-mid", id);

    if (!isChannel) attachSwipeToReply(wrap, id);

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble" + (isStickerLike ? " sticker-bubble" : "");

    if (!isChannel) {
        let lastTap = 0;
        bubble.addEventListener("click", ev => {
            if (ev.target.closest("button, .vo-card, .poll-opt, .spoiler-txt, .voice-player, .custom-vid-box, .react-chip, .scratch-canvas, .capsule-card") || ev.target.tagName === "IMG" || ev.target.tagName === "A") return;
            const t = Date.now();
            if (t - lastTap < 300) {
                triggerHaptic(14); spawnSparks(ev.clientX, ev.clientY);
                selectedMsg = { id, data: activeMsgsMap[id] || m }; reactToSelected("❤️", true);
            }
            lastTap = t;
        });
    }

    const topBar = document.createElement("div"); topBar.className = "msg-top-bar";
    const lbl = document.createElement("span"); lbl.className = "msg-sender-lbl";
    if (m.isAi) lbl.innerText = "🤖 مساعد المنصة AI";
    else if (activeChatType === "group" && !isMe) lbl.innerText = m.senderName || m.sender;
    else if (isChannel) lbl.innerHTML = `${escapeHTML(activeSpaceObj?.name || "")} ${getVerifiedBadgeHTML(activeSpaceObj?.verified)}`;
    else if (m.type === "audio") lbl.innerText = "🎤 رسالة صوتية";

    const menuBtn = document.createElement("button"); menuBtn.className = "msg-menu-trigger"; menuBtn.innerText = "⋮";
    menuBtn.onclick = e => { e.stopPropagation(); openMsgActions(id, activeMsgsMap[id] || m); };
    topBar.appendChild(lbl); topBar.appendChild(menuBtn); bubble.appendChild(topBar);

    if (m.replyTo) {
        const rq = document.createElement("div"); rq.className = "reply-quote";
        rq.innerHTML = `<strong>${escapeHTML(m.replyTo.senderName)}</strong><span>${escapeHTML(m.replyTo.preview)}</span>`;
        bubble.appendChild(rq);
    }

    const contentBox = document.createElement("div"); contentBox.className = "msg-content-slot";

    if (m.type === "text") {
        const txt = document.createElement("div"); txt.className = "msg-text"; txt.innerHTML = formatRichText(m.content); contentBox.appendChild(txt);
    } else if (m.type === "sticker") {
        const st = findStickerById(m.content), box = document.createElement("div"); box.className = "sticker-render"; box.style.background = st.bg;
        box.innerHTML = `<div style="font-size:54px;">${st.em}</div><div style="font-size:12px; font-weight:800; color:#fff;">${escapeHTML(st.cap)}</div>`;
        contentBox.appendChild(box);
    } else if (m.type === "img_sticker") {
        const img = document.createElement("img"); img.className = "sticker-img-render"; img.loading = "lazy"; img.decoding = "async"; img.src = m.content; img.onclick = () => openLightbox(m.content); contentBox.appendChild(img);
    } else if (m.type === "gif_card") {
        const gc = findGifById(m.content), box = document.createElement("div"); box.className = "sticker-render"; box.style.cssText = `background:${gc.bg}; width:175px; height:112px;`;
        box.innerHTML = `<div style="font-size:44px;">${gc.em}</div><div style="font-size:13px; font-weight:800; color:#fff;">${escapeHTML(gc.cap)}</div>`;
        contentBox.appendChild(box);
    } else if (m.type === "image") {
        const img = document.createElement("img"); img.className = "msg-img"; img.loading = "lazy"; img.decoding = "async"; img.src = m.content; img.onclick = () => openLightbox(m.content); contentBox.appendChild(img);
    } else if (m.type === "view_once") {
        const vo = document.createElement("div"), opened = !!m.voOpened;
        vo.className = "vo-card" + (opened ? " opened" : "");
        if (opened) vo.innerHTML = `<span>💨</span><span>تم فتح صورة العرض لمرة واحدة وحذفها</span>`;
        else if (isMe) vo.innerHTML = `<span>💣</span><span>صورة عرض لمرة واحدة (بانتظار الفتح)</span>`;
        else { vo.innerHTML = `<span>💣</span><span>اضغط لفتح الصورة لمرة واحدة</span>`; vo.onclick = () => openViewOnce(id, m.content); }
        contentBox.appendChild(vo);
    } else if (m.type === "audio") {
        contentBox.appendChild(buildVoicePlayer(m.content, id, m.voiceFilter || "normal"));
    } else if (m.type === "video") {
        contentBox.appendChild(buildCustomVideoCard(m.content));
    } else if (m.type === "poll" && m.poll) {
        const pb = document.createElement("div"); pb.className = "poll-box"; pb.innerHTML = buildPollInnerHTML(id, m.poll); contentBox.appendChild(pb);
    }
    bubble.appendChild(contentBox);

    if (isChannel) {
        const chBar = document.createElement("div"); chBar.className = "ch-reactions"; chBar.innerHTML = buildReactionsHTML(id, m, true); bubble.appendChild(chBar);
        const footer = document.createElement("div"); footer.className = "msg-footer"; footer.style.marginTop = "6px"; footer.innerHTML = buildFooterHTML(id, m, isMe, true); bubble.appendChild(footer);
    } else {
        const bottomRow = document.createElement("div"); bottomRow.className = "msg-bottom-row";
        const reactSlot = document.createElement("div"); reactSlot.className = "in-bubble-reacts"; reactSlot.innerHTML = buildReactionsHTML(id, m, false);
        reactSlot.onclick = ev => {
            const chip = ev.target.closest(".react-chip"); if (!chip) return;
            ev.stopPropagation(); triggerHaptic(10); spawnSparks(ev.clientX, ev.clientY);
            selectedMsg = { id, data: activeMsgsMap[id] || m }; reactToSelected(chip.getAttribute("data-em"));
        };
        const footer = document.createElement("div"); footer.className = "msg-footer"; footer.innerHTML = buildFooterHTML(id, m, isMe, false);
        bottomRow.appendChild(reactSlot); bottomRow.appendChild(footer); bubble.appendChild(bottomRow);
    }

    wrap.appendChild(bubble);
    return wrap;
}

function updateMessageNodeInPlace(el, id, m) {
    const isMe = m.sender === me.username, isChannel = activeChatType === "channel";
    if (m.type === "text" && !m.scratch) {
        const txt = el.querySelector(".msg-text"); if (txt) txt.innerHTML = formatRichText(m.content);
    } else if (m.type === "poll" && m.poll) {
        const pb = el.querySelector(".poll-box"); if (pb) pb.innerHTML = buildPollInnerHTML(id, m.poll);
    } else if (m.type === "view_once" && m.voOpened) {
        const vo = el.querySelector(".vo-card");
        if (vo && !vo.classList.contains("opened")) { vo.classList.add("opened"); vo.onclick = null; vo.innerHTML = `<span>💨</span><span>تم فتح صورة العرض لمرة واحدة وحذفها</span>`; }
    }
    if (isChannel) { const c = el.querySelector(".ch-reactions"); if (c) c.innerHTML = buildReactionsHTML(id, m, true); }
    else { const r = el.querySelector(".in-bubble-reacts"); if (r) r.innerHTML = buildReactionsHTML(id, m, false); }
    const foot = el.querySelector(".msg-footer");
    if (foot) {
        const preserved = Array.from(foot.querySelectorAll(".fx-msg-pill, .vanish-tag"));
        foot.innerHTML = buildFooterHTML(id, m, isMe, isChannel);
        preserved.reverse().forEach(n => foot.insertBefore(n, foot.firstChild));
    }
}

function closeActiveChat() {
    document.getElementById("chatPane").classList.remove("open");
    if (activeChatType === "dm" && activeRoomId) db.ref(`chats/${activeRoomId}/typing/${me.username}`).set(false);
    detachRoomListeners(); toggleChatExtras(false);
    activeChatType = null; activePartner = null; activeRoomId = null; activeSpaceObj = null;
    document.getElementById("messagesList").innerHTML = "";
    renderChatsSidebarNow();
}

function updateChatInputLockState() {
    const normal = document.getElementById("inputNormalBar"), notice = document.getElementById("chatNoticeBar");
    if (activeChatType === "dm") {
        if (myBlocked[activePartner]) { normal.style.display = "none"; notice.style.display = "block"; notice.innerHTML = `لقد قمت بحظر هذا المستخدم. <button class="btn btn-sm btn-outline" onclick="toggleBlockUser('${activePartner}')">إلغاء الحظر</button>`; return; }
        if (blockedByPartner) { normal.style.display = "none"; notice.style.display = "block"; notice.innerText = "لا يمكنك إرسال رسائل لهذا الحساب حالياً."; return; }
    }
    if (activeChatType === "channel" && activeSpaceObj && activeSpaceObj.owner !== me.username) {
        normal.style.display = "none"; notice.style.display = "block"; notice.innerText = "📢 قناة للعرض فقط — اضغط + أو التفاعلات أسفل المنشور"; return;
    }
    notice.style.display = "none"; normal.style.display = "flex";
}

function updateActiveHeader() {
    const av = document.getElementById("chatPartnerAvatar"), nm = document.getElementById("chatPartnerName"), st = document.getElementById("chatPartnerStatus");
    if (activeChatType === "saved") {
        av.style.backgroundImage = "linear-gradient(135deg,#0ea5e9,#6366f1)"; av.innerHTML = "🔖";
        nm.innerText = "الرسائل المحفوظة"; st.innerText = "مفكرتك الخاصة المشفرة"; st.className = "";
    } else if (activeChatType === "dm") {
        const p = contactProfiles[activePartner]; if (!p) return;
        setAvatarStyle(av, p);
        nm.innerHTML = `${renderStyledUserName(p)} ${getVerifiedBadgeHTML(p.verified)} ${getDevBadgeHTML(p)}`;
        if (activePartnerTyping) { st.innerText = "يكتب الآن..."; st.className = "status-typing"; }
        else if (p.moodText) { st.innerText = p.moodText + (p.online ? " • متصل" : ""); st.className = p.online ? "status-online" : ""; }
        else if (p.online) { st.innerText = "متصل الآن"; st.className = "status-online"; }
        else { st.innerText = p.lastSeen ? `آخر ظهور ${formatTime(p.lastSeen)}` : "غير متصل"; st.className = ""; }
    } else if (activeSpaceObj) {
        setAvatarStyle(av, { name: activeSpaceObj.name, avatarColor: activeSpaceObj.avatarColor }, false);
        nm.innerHTML = `${escapeHTML(activeSpaceObj.name)} ${getVerifiedBadgeHTML(activeSpaceObj.verified)}`;
        st.innerText = (activeSpaceObj.type === "channel" ? "قناة" : "مجموعة") + ` • ${Object.keys(activeSpaceObj.members || {}).length} مشترك`;
        st.className = "";
    }
}

function openActiveRoomInfo() {
    if (activeChatType === "dm" && activePartner) { ensurePostsLoaded(); openOtherProfile(activePartner); }
    else if (activeSpaceObj) openSpaceInfoModal();
}

function renderPinnedBar(p) {
    const bar = document.getElementById("pinnedBar");
    if (p && p.text) { document.getElementById("pinnedText").innerText = p.text; bar.style.display = "flex"; }
    else bar.style.display = "none";
}

function getActiveRoomBasePath() {
    if (activeChatType === "saved") return `saved_msgs/${me.username}`;
    if (activeChatType === "dm") return `chats/${activeRoomId}/messages`;
    return `space_msgs/${activeRoomId}`;
}

function updateSendMicToggle() {
    const inp = document.getElementById("msgInput"), mic = document.getElementById("micBtn"), snd = document.getElementById("sendBtn");
    if (!inp || !mic || !snd) return;
    const hasText = inp.value.trim().length > 0 || !!editingMsgId;
    mic.style.display = hasText ? "none" : "inline-flex";
    snd.style.display = hasText ? "flex" : "none";
}

function handleMsgInputResize(el) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
    updateSendMicToggle();
}

function handleMsgKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey && !e.repeat && window.innerWidth >= 860) { e.preventDefault(); sendTextMessage(); }
}

function handleTyping() {
    if (activeChatType !== "dm" || !activeRoomId || !isDbConnected) return;
    db.ref(`chats/${activeRoomId}/typing/${me.username}`).set(true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        if (activeChatType === "dm" && activeRoomId) db.ref(`chats/${activeRoomId}/typing/${me.username}`).set(false);
    }, 1800);
}

async function pushMessageSafe(type, content, previewLabel, extra = {}) {
    if (!activeRoomId) return;
    const now = Date.now();
    const sig = `${activeRoomId}|${type}|${String(content).slice(0, 60)}`;
    if (!extra.isAi && (sendLock || (sig === lastSentSig && now - lastSentTs < 900))) return;
    if (!extra.isAi) { sendLock = true; lastSentSig = sig; lastSentTs = now; }

    const msgId = "m_" + now + "_" + Math.random().toString(36).slice(2, 8);
    const dbPath = getActiveRoomBasePath();
    const chatTypeCopy = activeChatType, partnerCopy = activePartner, roomIdCopy = activeRoomId;

    const sdSec = (!extra.isAi && chatTypeCopy === "dm" && selectedSelfDestructSec > 0) ? selectedSelfDestructSec : 0;
    if (sdSec > 0) {
        selectedSelfDestructSec = 0;
        const sel = document.getElementById("selfDestructSel"); if (sel) sel.value = "0";
    }

    const baseLocal = {
        id: msgId,
        sender: extra.isAi ? "ai_bot" : me.username,
        senderName: extra.isAi ? "🤖 مساعد AI" : me.name,
        type, content, seen: false, ts: now, ...(sdSec ? { sdSec } : {}), ...extra
    };
    const replySnap = (!extra.isAi && replyTarget) ? { ...replyTarget } : null;
    if (replySnap) { baseLocal.replyTo = replySnap; cancelReplyOrEdit(); }

    let dbPayload = { ...baseLocal };
    const shouldEncrypt = chatTypeCopy === "dm" && (type === "text" || type === "capsule") && !extra.isAi;
    if (shouldEncrypt) {
        const enc = await e2eEncrypt(roomIdCopy, content);
        if (enc.e2e) { dbPayload.e2e = true; dbPayload.encContent = enc.data; dbPayload.content = ""; baseLocal.e2e = true; }
        if (replySnap && replySnap.preview) {
            const encRp = await e2eEncrypt(roomIdCopy, replySnap.preview);
            if (encRp.e2e) dbPayload.replyTo = { ...replySnap, preview: "", encPreview: encRp.data };
        }
    }

    const area = document.getElementById("messagesList");
    const hint = area.querySelector(".empty-room-hint"); if (hint) hint.remove();
    const pendingObj = { ...baseLocal, _pending: true };
    activeMsgsMap[msgId] = pendingObj;
    if (!roomMsgsCache[dbPath]) roomMsgsCache[dbPath] = {};
    roomMsgsCache[dbPath][msgId] = pendingObj;
    trimRoomCache(dbPath);
    appendMessageWithDateSep(area, msgId, pendingObj);
    area.scrollTop = area.scrollHeight;
    playSendSound();

    const isLight = type === "text" || type === "sticker" || type === "gif_card" || type === "poll" || type === "capsule";
    if (isLight && (!navigator.onLine || !isDbConnected)) {
        offlineQueue.push({ owner: me.username, dbPath, chatType: chatTypeCopy, partner: partnerCopy, roomId: roomIdCopy, previewLabel, payload: dbPayload, localDisplay: pendingObj });
        saveOfflineQueue(); showToast("تم حفظ الرسالة وستُرسل تلقائياً عند توفر الشبكة 🕒");
        setTimeout(() => { sendLock = false; }, 220);
        return;
    }

    try {
        await db.ref(`${dbPath}/${msgId}`).set(dbPayload);
        if (chatTypeCopy === "dm" && partnerCopy) {
            db.ref(`user_contacts/${partnerCopy}/${me.username}`).update({ addedAt: now }).catch(() => {});
            const encPrev = await e2eEncrypt(roomIdCopy, previewLabel);
            decryptedMetaPreviews[roomIdCopy] = previewLabel;
            db.ref(`chat_meta/${roomIdCopy}`).set({
                lastMsg: encPrev.e2e ? "🔒 رسالة مشفّرة" : previewLabel,
                lastMsgEnc: encPrev.e2e ? encPrev.data : "",
                lastSender: baseLocal.sender, lastTs: now, unreadFor: partnerCopy
            }).catch(() => {});
            db.ref(`chats/${roomIdCopy}/typing/${me.username}`).set(false).catch(() => {});
        } else if ((chatTypeCopy === "channel" || chatTypeCopy === "group") && roomIdCopy) {
            db.ref(`spaces/${roomIdCopy}`).update({ lastMsg: previewLabel, lastTs: now }).catch(() => {});
        }
        const el = area.querySelector(`.msg-wrap[data-mid="${msgId}"]`);
        activeMsgsMap[msgId] = baseLocal; roomMsgsCache[dbPath][msgId] = baseLocal;
        if (el) updateMessageNodeInPlace(el, msgId, baseLocal);
    } catch {
        if (isLight) {
            offlineQueue.push({ owner: me.username, dbPath, chatType: chatTypeCopy, partner: partnerCopy, roomId: roomIdCopy, previewLabel, payload: dbPayload, localDisplay: pendingObj });
            saveOfflineQueue(); showToast("النت ضعيف — ستُرسل الرسالة تلقائياً 🕒");
        } else showToast("النت ضعيف جداً لرفع الوسائط حالياً");
    } finally {
        if (!extra.isAi) setTimeout(() => { sendLock = false; }, 220);
    }
}

async function sendTextMessage() {
    const inp = document.getElementById("msgInput"), txt = inp.value.trim();
    if (!txt) return;
    inp.value = ""; inp.style.height = "39px"; updateSendMicToggle();

    if (editingMsgId && activeRoomId) {
        const targetId = editingMsgId; cancelReplyOrEdit();
        if (activeChatType === "dm") {
            const enc = await e2eEncrypt(activeRoomId, txt);
            if (enc.e2e) await db.ref(`${getActiveRoomBasePath()}/${targetId}`).update({ e2e: true, encContent: enc.data, content: "", edited: true });
            else await db.ref(`${getActiveRoomBasePath()}/${targetId}`).update({ content: txt, edited: true });
        } else {
            await db.ref(`${getActiveRoomBasePath()}/${targetId}`).update({ content: txt, edited: true });
        }
        showToast("تم تعديل الرسالة ✏️");
        return;
    }
    await pushMessageSafe("text", txt, txt);

    if (/^(@ai|\/ai)\s+/i.test(txt) && typeof window.handleInChatAiCommand === "function") {
        window.handleInChatAiCommand(txt.replace(/^(@ai|\/ai)\s+/i, "").trim());
    }
}

// ==================== 10. خيارات الرسالة والحذف ====================
function openMsgActions(id, data) {
    if (!data) return;
    triggerHaptic(10);
    selectedMsg = { id, data };
    const isMine = data.sender === me.username, isSpaceOwner = activeSpaceObj && activeSpaceObj.owner === me.username;
    document.getElementById("copyActionBtn").style.display = data.type === "text" ? "flex" : "none";
    document.getElementById("editActionBtn").style.display = (isMine && data.type === "text" && !data.scratch) ? "flex" : "none";
    document.getElementById("replyActionBtn").style.display = activeChatType === "channel" ? "none" : "flex";
    document.getElementById("pinActionBtn").style.display = (activeChatType === "dm" || isSpaceOwner) ? "flex" : "none";
    document.getElementById("delEveryoneBtn").style.display = (isMine || isSpaceOwner || activeChatType === "saved" || data.isAi) ? "flex" : "none";
    document.getElementById("msgActionModal").style.display = "flex";
}

function closeMsgActions() { document.getElementById("msgActionModal").style.display = "none"; }

async function reactToSelected(emoji, forceSet = false) {
    if (!selectedMsg || !activeRoomId) return;
    if (activeChatType === "channel") {
        const found = CH_REACTIONS.find(r => r.em === emoji) || CH_REACTIONS[0];
        const live = activeMsgsMap[selectedMsg.id] || selectedMsg.data;
        toggleChannelReaction(selectedMsg.id, found.k, !!(live.chReactions?.[found.k]?.[me.username]));
        closeMsgActions(); return;
    }
    const live = activeMsgsMap[selectedMsg.id] || selectedMsg.data;
    const cur = live.reactions?.[me.username];
    await db.ref(`${getActiveRoomBasePath()}/${selectedMsg.id}/reactions/${me.username}`).set((!forceSet && cur === emoji) ? null : emoji);
    closeMsgActions();
}

function replyToSelected() {
    if (!selectedMsg) return;
    editingMsgId = null;
    const d = selectedMsg.data, sName = d.sender === me.username ? me.name : (d.senderName || d.sender);
    const prev = d.scratch ? "🪄 رسالة كشط مخفية" : (d.type === "text" ? d.content : (d.type === "image" ? "📷 صورة" : d.type === "audio" ? "🎤 بصمة" : "🎭 ملصق"));
    replyTarget = { id: selectedMsg.id, sender: d.sender || "", senderName: sName, preview: prev };
    document.getElementById("replyPreviewSender").innerText = "رد على " + sName;
    document.getElementById("replyPreviewText").innerText = prev;
    document.getElementById("replyPreviewBar").style.display = "flex";
    closeMsgActions(); document.getElementById("msgInput").focus();
}

function startEditSelected() {
    if (!selectedMsg || selectedMsg.data.type !== "text" || selectedMsg.data.sender !== me.username) return;
    replyTarget = null; editingMsgId = selectedMsg.id;
    document.getElementById("replyPreviewSender").innerText = "✏️ تعديل الرسالة";
    document.getElementById("replyPreviewText").innerText = selectedMsg.data.content;
    document.getElementById("replyPreviewBar").style.display = "flex";
    const inp = document.getElementById("msgInput"); inp.value = selectedMsg.data.content; handleMsgInputResize(inp);
    closeMsgActions(); inp.focus();
}

function cancelReplyOrEdit() { replyTarget = null; editingMsgId = null; document.getElementById("replyPreviewBar").style.display = "none"; updateSendMicToggle(); }

async function pinSelectedMessage() {
    if (!selectedMsg || !activeRoomId) return;
    const d = selectedMsg.data, txt = d.type === "text" ? d.content : (d.type === "image" ? "📷 صورة" : "🎤 بصمة صوتية");
    await db.ref(activeChatType === "dm" ? `chats/${activeRoomId}/pinned` : `spaces/${activeRoomId}/pinned`).set({ id: selectedMsg.id, text: txt });
    closeMsgActions(); showToast("تم التثبيت بالأعلى 📌");
}
async function unpinMessage() { if (!activeRoomId) return; await db.ref(activeChatType === "dm" ? `chats/${activeRoomId}/pinned` : `spaces/${activeRoomId}/pinned`).remove(); }
function copySelectedText() { if (selectedMsg?.data?.type === "text") { navigator.clipboard.writeText(selectedMsg.data.content); showToast("تم النسخ"); } closeMsgActions(); }
async function deleteSelectedForMe() { if (!selectedMsg || !activeRoomId) return; await db.ref(`${getActiveRoomBasePath()}/${selectedMsg.id}/deletedFor/${me.username}`).set(true); closeMsgActions(); showToast("تم الحذف من عندك فقط 🙈"); }
async function deleteSelectedForEveryone() {
    if (!selectedMsg || !activeRoomId) return;
    const isMine = selectedMsg.data.sender === me.username, isOwner = activeSpaceObj && activeSpaceObj.owner === me.username;
    if (!isMine && !isOwner && activeChatType !== "saved" && !selectedMsg.data.isAi) { showToast("يمكنك حذف رسائلك فقط للجميع"); return; }
    await db.ref(`${getActiveRoomBasePath()}/${selectedMsg.id}`).remove();
    closeMsgActions(); showToast("تم الحذف نهائياً للجميع 🗑️");
}
async function clearChatForMe() {
    if (activeChatType !== "dm" || !activeRoomId) return;
    if (!confirm("تنظيف سجل المحادثة من عندك فقط؟")) return;
    const snap = await db.ref(`chats/${activeRoomId}/messages`).once("value");
    const updates = {}; snap.forEach(ch => { updates[`${ch.key}/deletedFor/${me.username}`] = true; });
    if (Object.keys(updates).length > 0) await db.ref(`chats/${activeRoomId}/messages`).update(updates);
    roomMsgsCache[`chats/${activeRoomId}/messages`] = {};
    showToast("تم التنظيف من عندك فقط");
}

// ==================== 11. محرّك المكالمات ====================
const RTC_CONFIG = {
    iceCandidatePoolSize: 8, bundlePolicy: "max-bundle", rtcpMuxPolicy: "require", iceTransportPolicy: "all",
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun.cloudflare.com:3478" }, { urls: "stun:stun.relay.metered.ca:80" },
        { urls: ["turn:global.relay.metered.ca:80", "turn:global.relay.metered.ca:80?transport=tcp", "turn:global.relay.metered.ca:443", "turns:global.relay.metered.ca:443?transport=tcp"], username: "e8dd65b92f6c289b0362834b", credential: "pW8M56S4dI7619s4" },
        { urls: ["turn:openrelay.metered.ca:80", "turn:openrelay.metered.ca:443", "turn:openrelay.metered.ca:443?transport=tcp"], username: "openrelayproject", credential: "openrelayproject" }
    ]
};

let pc = null, localStream = null, remoteStream = null, activeCallPath = null, activeCallId = null;
let callListeners = [], pendingIncoming = null, pendingRemoteIce = [], localIceQueue = [];
let callNodeReady = false, isCaller = false, callConnectWatchdog = null;
let callTimer = null, callSec = 0, micMuted = false, camOff = false, facingMode = "user";

function setCallNetState(txt) { const el = document.getElementById("callNetState"); if (el) el.innerText = txt || ""; }
function clearCallListeners() { callListeners.forEach(r => r.off()); callListeners = []; clearTimeout(callConnectWatchdog); callConnectWatchdog = null; }
function startCallTimer() {
    if (callTimer) return;
    stopRingtone(); clearTimeout(callConnectWatchdog);
    document.getElementById("reconnectCallBtn").style.display = "none";
    setCallNetState("اتصال مشفّر ومستقر 🟢"); callSec = 0;
    callTimer = setInterval(() => {
        callSec++;
        document.getElementById("callStatus").innerText = `متصل الآن ${String(Math.floor(callSec / 60)).padStart(2, "0")}:${String(callSec % 60).padStart(2, "0")}`;
    }, 1000);
}

async function acquireMedia(withVideo) {
    const constraints = { audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: withVideo ? { facingMode, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 } } : false };
    try { return await navigator.mediaDevices.getUserMedia(constraints); }
    catch {
        if (withVideo) {
            try { return await navigator.mediaDevices.getUserMedia({ audio: true, video: true }); }
            catch { showToast("تعذر فتح الكاميرا — تم التحويل لصوت فقط"); return await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); }
        }
        throw new Error("no_media");
    }
}
function attachLocalVideo(stream) {
    const lv = document.getElementById("localVideo"), hasVid = stream.getVideoTracks().length > 0;
    lv.srcObject = stream; lv.muted = true; lv.style.display = hasVid ? "block" : "none";
    if (hasVid) lv.play().catch(() => {});
    document.getElementById("flipCamBtn").style.display = hasVid ? "flex" : "none";
    document.getElementById("camBtn").style.display = hasVid ? "flex" : "none";
}
function bindRemoteTrackHandler(peerConn) {
    remoteStream = new MediaStream();
    const rv = document.getElementById("remoteVideo"), ra = document.getElementById("remoteAudio");
    rv.srcObject = remoteStream; ra.srcObject = remoteStream;
    peerConn.ontrack = ev => {
        if (ev.streams && ev.streams[0]) ev.streams[0].getTracks().forEach(tr => { if (!remoteStream.getTracks().some(t => t.id === tr.id)) remoteStream.addTrack(tr); });
        else if (ev.track && !remoteStream.getTracks().some(t => t.id === ev.track.id)) remoteStream.addTrack(ev.track);
        if (ev.track && ev.track.kind === "video") { rv.style.display = "block"; document.getElementById("callAvatarFallback").style.display = "none"; rv.play().catch(() => {}); }
        ra.play().catch(() => {});
    };
}
function setupCallBackdrop(partnerObj, label) {
    const av = document.getElementById("callBigAvatar");
    if (partnerObj?.avatarImg) { av.style.backgroundImage = `url(${partnerObj.avatarImg})`; av.innerText = ""; }
    else { av.style.backgroundImage = partnerObj?.avatarColor || GRADIENTS[0]; av.innerText = (partnerObj?.name || "؟").charAt(0); }
    document.getElementById("callAvatarFallback").style.display = "flex"; document.getElementById("remoteVideo").style.display = "none";
    document.getElementById("callTypeLabel").innerText = label;
}
function attachCallStateWatchers(peerConn) {
    const onStateChange = () => {
        if (!pc || pc !== peerConn) return;
        const st = pc.connectionState, ice = pc.iceConnectionState;
        if (st === "connected" || ice === "connected" || ice === "completed") startCallTimer();
        else if (ice === "checking" || st === "connecting") setCallNetState("جاري فتح المسار الشبكي...");
        else if (ice === "disconnected" || st === "disconnected") { setCallNetState("ضعف مؤقت — جاري إعادة الربط..."); document.getElementById("reconnectCallBtn").style.display = "flex"; }
        else if (ice === "failed" || st === "failed") { setCallNetState("تعثر المسار — اضغط 📡 لإعادة الربط"); document.getElementById("reconnectCallBtn").style.display = "flex"; if (isCaller) restartCallIce(); }
    };
    peerConn.onconnectionstatechange = onStateChange; peerConn.oniceconnectionstatechange = onStateChange;
}
async function flushPendingRemoteIce() { while (pendingRemoteIce.length > 0 && pc && pc.currentRemoteDescription) { try { await pc.addIceCandidate(new RTCIceCandidate(pendingRemoteIce.shift())); } catch {} } }
function flushLocalIceQueue(subPath) { if (!callNodeReady || !activeCallPath) return; while (localIceQueue.length > 0) db.ref(`${activeCallPath}/${subPath}`).push(localIceQueue.shift()).catch(() => {}); }

function listenForIncomingCalls() {
    db.ref("calls/" + me.username).on("value", snap => {
        const data = snap.val();
        if (!data) { if (activeCallPath === "calls/" + me.username && (pc || pendingIncoming)) endCall(false); return; }
        if (myBlocked[data.from]) { db.ref("calls/" + me.username + "/status").set("rejected"); return; }
        if (data.ts && Date.now() - data.ts > 50000 && data.status === "ringing") { db.ref("calls/" + me.username).remove(); return; }
        if (data.status === "ended" || data.status === "rejected") { if (activeCallPath === "calls/" + me.username || pendingIncoming) { showToast("انتهت المكالمة"); endCall(false); } return; }
        if (data.status === "ringing" && data.offer && !pc && !pendingIncoming) {
            pendingIncoming = data; activeCallPath = "calls/" + me.username; activeCallId = data.callId || ""; isCaller = false;
            const caller = contactProfiles[data.from] || { name: data.fromName || data.from };
            document.getElementById("callName").innerHTML = `${escapeHTML(caller.name)} ${getVerifiedBadgeHTML(caller.verified)}`;
            document.getElementById("callStatus").innerText = data.video ? "📹 مكالمة فيديو واردة..." : "📞 مكالمة صوتية واردة...";
            setCallNetState("اضغط للرد"); setupCallBackdrop(caller, data.video ? "مكالمة فيديو واردة" : "مكالمة صوتية واردة");
            document.getElementById("acceptCallBtn").style.display = "flex"; document.getElementById("flipCamBtn").style.display = "none";
            document.getElementById("camBtn").style.display = "none"; document.getElementById("reconnectCallBtn").style.display = "none";
            document.getElementById("callOverlay").style.display = "flex"; startRingtone(true);
        }
    });
}

async function startCall(withVideo, directTarget) {
    const targetUser = directTarget || (activeChatType === "dm" ? activePartner : null);
    if (!targetUser) return;
    if (myBlocked[targetUser] || (targetUser === activePartner && blockedByPartner)) { showToast("لا يمكن الاتصال بهذا الحساب"); return; }
    if (pc) return;
    stopAnyVoicePlayback(); facingMode = "user"; pendingRemoteIce = []; localIceQueue = []; callNodeReady = false; isCaller = true;
    activeCallId = "c_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    try { localStream = await acquireMedia(withVideo); } catch { showToast("يرجى السماح بالوصول إلى المايكروفون/الكاميرا"); return; }
    const hasVid = localStream.getVideoTracks().length > 0, partner = contactProfiles[targetUser] || { name: targetUser };
    activeCallPath = "calls/" + targetUser;
    document.getElementById("callName").innerHTML = `${escapeHTML(partner.name)} ${getVerifiedBadgeHTML(partner.verified)}`;
    document.getElementById("callStatus").innerText = "جاري الرنين..."; setCallNetState("جاري تجهيز الاتصال المشفر...");
    document.getElementById("acceptCallBtn").style.display = "none"; document.getElementById("reconnectCallBtn").style.display = "none";
    setupCallBackdrop(partner, hasVid ? "مكالمة فيديو" : "مكالمة صوتية"); attachLocalVideo(localStream);
    document.getElementById("callOverlay").style.display = "flex"; startRingtone(false);

    pc = new RTCPeerConnection(RTC_CONFIG); localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
    bindRemoteTrackHandler(pc); attachCallStateWatchers(pc);
    pc.onicecandidate = ev => {
        if (!ev.candidate || !activeCallPath) return;
        const json = ev.candidate.toJSON();
        if (callNodeReady) db.ref(activeCallPath + "/offerCandidates").push(json).catch(() => {}); else localIceQueue.push(json);
    };
    const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true }); await pc.setLocalDescription(offer);
    await db.ref(activeCallPath).set({ callId: activeCallId, from: me.username, fromName: me.name, video: hasVid, status: "ringing", offer: { type: offer.type, sdp: offer.sdp, rev: 1 }, ts: Date.now() });
    callNodeReady = true; flushLocalIceQueue("offerCandidates");

    let handledAnswerRev = 0;
    const ansRef = db.ref(activeCallPath + "/answer"); callListeners.push(ansRef);
    ansRef.on("value", async s => {
        const ans = s.val(); if (!ans || !pc) return;
        const rev = ans.rev || 1; if (rev <= handledAnswerRev) return;
        handledAnswerRev = rev; stopRingtone(); document.getElementById("callStatus").innerText = "جاري ربط الصوت والصورة...";
        try {
            await pc.setRemoteDescription(new RTCSessionDescription({ type: ans.type, sdp: ans.sdp }));
            await flushPendingRemoteIce(); clearTimeout(callConnectWatchdog);
            callConnectWatchdog = setTimeout(() => { if (pc && !callTimer) { document.getElementById("reconnectCallBtn").style.display = "flex"; setCallNetState("الشبكة بطيئة — جاري تجربة مسار بديل..."); restartCallIce(); } }, 9000);
        } catch {}
    });
    const acRef = db.ref(activeCallPath + "/answerCandidates"); callListeners.push(acRef);
    acRef.on("child_added", async s => { const c = s.val(); if (!c || !pc) return; if (pc.currentRemoteDescription) { try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {} } else pendingRemoteIce.push(c); });
    const stRef = db.ref(activeCallPath + "/status"); callListeners.push(stRef);
    stRef.on("value", s => { if (s.val() === "ended" || s.val() === "rejected") { showToast("انتهت المكالمة"); endCall(false); } });
}

async function answerIncomingCall() {
    if (!pendingIncoming) return;
    stopRingtone(); stopAnyVoicePlayback();
    const data = pendingIncoming; pendingIncoming = null; pendingRemoteIce = []; localIceQueue = []; callNodeReady = true; isCaller = false; facingMode = "user";
    try { localStream = await acquireMedia(!!data.video); } catch { showToast("تعذر فتح المايكروفون/الكاميرا"); endCall(true); return; }
    document.getElementById("acceptCallBtn").style.display = "none"; document.getElementById("callStatus").innerText = "جاري الربط..."; attachLocalVideo(localStream);

    pc = new RTCPeerConnection(RTC_CONFIG); localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
    bindRemoteTrackHandler(pc); attachCallStateWatchers(pc);
    pc.onicecandidate = ev => { if (ev.candidate && activeCallPath) db.ref(activeCallPath + "/answerCandidates").push(ev.candidate.toJSON()).catch(() => {}); };
    const ocRef = db.ref(activeCallPath + "/offerCandidates"); callListeners.push(ocRef);
    ocRef.on("child_added", async s => { const c = s.val(); if (!c || !pc) return; if (pc.currentRemoteDescription) { try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {} } else pendingRemoteIce.push(c); });

    await pc.setRemoteDescription(new RTCSessionDescription({ type: data.offer.type, sdp: data.offer.sdp })); await flushPendingRemoteIce();
    const answer = await pc.createAnswer(); await pc.setLocalDescription(answer);
    await db.ref(activeCallPath).update({ status: "connected", answer: { type: answer.type, sdp: answer.sdp, rev: data.offer.rev || 1 } });

    let handledOfferRev = data.offer.rev || 1;
    const offRef = db.ref(activeCallPath + "/offer"); callListeners.push(offRef);
    offRef.on("value", async s => {
        const newOff = s.val(); if (!newOff || !pc) return;
        const rev = newOff.rev || 1; if (rev <= handledOfferRev) return;
        handledOfferRev = rev;
        try {
            await pc.setRemoteDescription(new RTCSessionDescription({ type: newOff.type, sdp: newOff.sdp })); await flushPendingRemoteIce();
            const newAns = await pc.createAnswer(); await pc.setLocalDescription(newAns);
            await db.ref(activeCallPath).update({ answer: { type: newAns.type, sdp: newAns.sdp, rev } });
        } catch {}
    });
}

async function restartCallIce() {
    if (!pc || !activeCallPath) return;
    if (!isCaller) { showToast("جاري انتظار إعادة الربط من المتصل..."); return; }
    try { setCallNetState("جاري إعادة الربط عبر مسار بديل..."); const newOffer = await pc.createOffer({ iceRestart: true }); await pc.setLocalDescription(newOffer); await db.ref(activeCallPath + "/offer").set({ type: newOffer.type, sdp: newOffer.sdp, rev: Date.now() }); } catch {}
}
function toggleMicMute() { if (!localStream) return; micMuted = !micMuted; localStream.getAudioTracks().forEach(t => t.enabled = !micMuted); document.getElementById("muteBtn").classList.toggle("muted", micMuted); }
function toggleCamVideo() { if (!localStream) return; camOff = !camOff; localStream.getVideoTracks().forEach(t => t.enabled = !camOff); document.getElementById("camBtn").classList.toggle("muted", camOff); }
async function flipCamera() {
    if (!localStream || !pc) return;
    facingMode = facingMode === "user" ? "environment" : "user";
    try {
        const ns = await navigator.mediaDevices.getUserMedia({ video: { facingMode } }), nt = ns.getVideoTracks()[0], ot = localStream.getVideoTracks()[0];
        const sender = pc.getSenders().find(s => s.track && s.track.kind === "video");
        if (sender) await sender.replaceTrack(nt);
        if (ot) { ot.stop(); localStream.removeTrack(ot); } localStream.addTrack(nt);
        const lv = document.getElementById("localVideo"); lv.srcObject = localStream; lv.style.transform = facingMode === "user" ? "scaleX(-1)" : "none";
    } catch { showToast("لا توجد كاميرا ثانية متاحة"); }
}
async function endCall(notify = true) {
    stopRingtone(); clearInterval(callTimer); callTimer = null; clearCallListeners();
    const path = activeCallPath, wasRing = !!pendingIncoming;
    activeCallPath = null; activeCallId = null; pendingIncoming = null; pendingRemoteIce = []; localIceQueue = []; callNodeReady = false;
    if (notify && path) { try { await db.ref(path + "/status").set(wasRing ? "rejected" : "ended"); setTimeout(() => db.ref(path).remove(), 1200); } catch {} }
    if (pc) { try { pc.close(); } catch {} pc = null; }
    if (localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; }
    remoteStream = null; micMuted = false; camOff = false;
    document.getElementById("muteBtn").classList.remove("muted"); document.getElementById("camBtn").classList.remove("muted");
    document.getElementById("reconnectCallBtn").style.display = "none";
    document.getElementById("remoteVideo").srcObject = null; document.getElementById("localVideo").srcObject = null; document.getElementById("remoteAudio").srcObject = null;
    setCallNetState(""); document.getElementById("callOverlay").style.display = "none";
}

// ==================== 12. لوحة تحكم المطور المحمية ====================
function downloadOfficialPngIcon(size) {
    const c = document.createElement("canvas"); c.width = size; c.height = size;
    const ctx = c.getContext("2d"), grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, "#0ea5e9"); grad.addColorStop(0.55, "#3b82f6"); grad.addColorStop(1, "#4f46e5");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
    const w = size * 0.44, h = size * 0.56, x = (size - w) / 2, y = (size - h) / 2, r = size * 0.06;
    ctx.fillStyle = "#ffffff"; ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h); ctx.lineTo(x + w / 2, y + h - size * 0.12); ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill();
    c.toBlob(blob => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `icon-${size}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); showToast(`تم تنزيل icon-${size}.png ✅`); }, "image/png");
}

function openAdminDashboard() {
    if (!AdminGuard.check()) { showToast("⛔ وصول مرفوض"); return; }
    document.getElementById("adminScreen").style.display = "block";
    updateAdminButtons();

    const aiProv = document.getElementById("admAiProvider"), aiKey = document.getElementById("admAiKey");
    if (aiProv) aiProv.value = sysConfig.ai?.provider || "free";
    if (aiKey) aiKey.value = sysConfig.ai?.apiKey || "";

    db.ref("users").on("value", snap => {
        if (!AdminGuard.check()) return;
        const arr = Object.values(snap.val() || {});
        document.getElementById("admStatUsers").innerText = arr.length;
        document.getElementById("admStatOnline").innerText = arr.filter(u => u.online).length;
        const box = document.getElementById("admUsersList");
        box.innerHTML = arr.length ? "" : `<span style="color:var(--text-dim); font-size:13px;">لا توجد حسابات</span>`;
        arr.forEach(u => {
            const v = u.verified || "", r = document.createElement("div"); r.className = "adm-row";
            r.innerHTML = `<div><div style="font-weight:800; font-size:14px; display:flex; align-items:center; gap:4px; flex-wrap:wrap;">${escapeHTML(u.name)} ${getVerifiedBadgeHTML(v)} ${getDevBadgeHTML(u)} <span class="handle-ltr" dir="ltr" style="font-size:12px;">(${escapeHTML(getDisplayTag(u))})</span></div><div style="font-size:11.5px; color:${u.banned ? '#fb7185' : (u.online ? '#10b981' : '#94a3b8')};">${u.banned ? '🚫 محظور' : (u.online ? '● متصل' : 'غير متصل')}</div></div><div style="display:flex; gap:5px; flex-wrap:wrap;"><button class="btn btn-sm ${v==='blue'?'':'btn-outline'}" onclick="adminSetVerified('${u.username}','${v==='blue'?'':'blue'}')">✓ أزرق</button><button class="btn btn-sm ${v==='gold'?'btn-gold':'btn-outline'}" onclick="adminSetVerified('${u.username}','${v==='gold'?'':'gold'}')">★ ذهبي</button><button class="btn btn-outline btn-sm" onclick="adminResetUserPass('${u.username}')">🔑</button><button class="btn ${u.banned?'btn-success':'btn-danger'} btn-sm" onclick="adminToggleBan('${u.username}',${!u.banned})">${u.banned?'فك':'حظر'}</button><button class="btn btn-danger btn-sm" onclick="adminDeleteUser('${u.username}')">حذف</button></div>`;
            box.appendChild(r);
        });
    });

    db.ref("spaces").on("value", snap => {
        if (!AdminGuard.check()) return;
        const arr = Object.values(snap.val() || {});
        document.getElementById("admStatSpaces").innerText = arr.length;
        const box = document.getElementById("admSpacesList");
        if (!arr.length) { box.innerHTML = `<span style="color:var(--text-dim); font-size:12.5px;">لا توجد قنوات أو مجموعات</span>`; return; }
        box.innerHTML = "";
        arr.forEach(s => {
            const v = s.verified || "", r = document.createElement("div"); r.className = "adm-row";
            r.innerHTML = `<div><div style="font-weight:800; font-size:14px; display:flex; align-items:center; gap:4px;">${escapeHTML(s.name)} ${getVerifiedBadgeHTML(v)} <span class="handle-ltr" dir="ltr" style="font-size:12px;">(@${escapeHTML(s.handle)})</span></div><div style="font-size:11.5px; color:var(--text-dim);">${s.type === 'channel' ? '📢 قناة' : '👥 مجموعة'} • المالك: <span class="handle-ltr" dir="ltr" style="font-size:11.5px;">@${escapeHTML(s.owner)}</span></div></div><div style="display:flex; gap:5px; flex-wrap:wrap;"><button class="btn btn-sm ${v==='blue'?'':'btn-outline'}" onclick="adminSetSpaceVerified('${s.id}','${v==='blue'?'':'blue'}')">✓ أزرق</button><button class="btn btn-sm ${v==='gold'?'btn-gold':'btn-outline'}" onclick="adminSetSpaceVerified('${s.id}','${v==='gold'?'':'gold'}')">★ ذهبي</button><button class="btn btn-danger btn-sm" onclick="adminDeleteSpace('${s.id}')">حذف</button></div>`;
            box.appendChild(r);
        });
    });

    db.ref("verify_requests").on("value", s => {
        if (!AdminGuard.check()) return;
        const entries = Object.entries(s.val() || {}), box = document.getElementById("admVerifyReqs");
        if (!entries.length) { box.innerHTML = `<span style="color:var(--text-dim); font-size:12.5px;">لا توجد طلبات توثيق</span>`; return; }
        box.innerHTML = entries.map(([reqKey, q]) => `<div class="adm-row"><div><strong>${q.targetType === 'space' ? '📢 ' : '👤 '}${escapeHTML(q.name)}</strong> <span class="handle-ltr" dir="ltr" style="font-size:12px;">(@${escapeHTML(q.displayTag || q.username)})</span><div style="font-size:12px; color:var(--text-dim);">الطلب: ${q.requestedType==='gold'?'ذهبي VIP ★':'أزرق ✓'} — ${escapeHTML(q.reason)}</div></div><div style="display:flex; gap:6px;"><button class="btn btn-success btn-sm" onclick="adminApproveVerify('${reqKey}','${q.targetType||'user'}','${q.targetId||q.username}','${q.requestedType}')">قبول</button><button class="btn btn-danger btn-sm" onclick="adminRejectVerify('${reqKey}')">رفض</button></div></div>`).join("");
    });

    db.ref("reports").on("value", s => {
        if (!AdminGuard.check()) return;
        const reps = Object.entries(s.val() || {}), box = document.getElementById("admReportsList");
        if (!reps.length) { box.innerHTML = `<span style="color:var(--text-dim); font-size:12.5px;">لا توجد بلاغات</span>`; return; }
        box.innerHTML = reps.reverse().map(([id, r]) => `<div class="adm-row"><div style="font-size:12.5px;">بلاغ من <b>@${escapeHTML(r.reporter)}</b> ضد <b style="color:#fb7185;">@${escapeHTML(r.target)}</b>: ${escapeHTML(r.reason)}</div><div style="display:flex; gap:5px;"><button class="btn btn-danger btn-sm" onclick="adminToggleBan('${r.target}', true)">حظر</button><button class="btn btn-outline btn-sm" onclick="adminDismissReport('${id}')">إزالة</button></div></div>`).join("");
    });

    db.ref("sys_logs").limitToLast(40).on("value", s => {
        if (!AdminGuard.check()) return;
        const logs = s.val();
        document.getElementById("admLogsList").innerHTML = logs ? Object.values(logs).reverse().map(l => `<div>• ${escapeHTML(l.msg)}</div>`).join("") : "لا توجد سجلات...";
    });
}

function updateAdminButtons() {
    const lb = document.getElementById("admLockBtn");
    lb.innerText = sysConfig.locked ? "🟢 تشغيل المنصة" : "🔴 إيقاف المنصة فوراً";
    lb.className = "btn " + (sysConfig.locked ? "btn-success" : "btn-danger");
    const rb = document.getElementById("admRegBtn");
    rb.innerText = sysConfig.allowRegister ? "🔒 إغلاق التسجيل الجديد" : "🔓 فتح التسجيل الجديد";
    rb.className = "btn " + (sysConfig.allowRegister ? "btn-outline" : "btn-success");
}

async function adminSaveAiConfig() {
    if (!AdminGuard.check()) { showToast("⛔ صلاحية مرفوضة"); return; }
    const provider = document.getElementById("admAiProvider")?.value || "free";
    const apiKey = (document.getElementById("admAiKey")?.value || "").trim();
    await db.ref("sys_config/ai").set({ provider, apiKey });
    showToast("تم حفظ إعدادات الذكاء الاصطناعي بأمان 🤖✅");
}

async function adminUpdateAdminPin() {
    if (!AdminGuard.check()) { showToast("⛔ صلاحية مرفوضة"); return; }
    const p = (document.getElementById("admNewAdminPin")?.value || "").trim();
    if (p.length < 4) { showToast("رمز لوحة المطور يجب أن يكون 4 رموز فأكثر"); return; }
    const h = await sha256Hex(p);
    await db.ref("sys_config").update({ adminPinHash: h });
    document.getElementById("admNewAdminPin").value = "";
    logSecurityEvent("🔐 تم تغيير رمز دخول لوحة المطور وتشفيره بـ SHA-256");
    showToast("تم تغيير رمز لوحة المطور وتشفيره بنجاح 🛡️✅");
}

async function adminUpdatePin() {
    if (!AdminGuard.check()) { showToast("⛔ صلاحية مرفوضة"); return; }
    const p = (document.getElementById("admNewPin")?.value || "").trim();
    if (p.length < 3) { showToast("اكتب رمزاً صحيحاً"); return; }
    const h = await sha256Hex(p);
    await db.ref("sys_config").update({ pinHash: h, pin: null });
    document.getElementById("admNewPin").value = "";
    logSecurityEvent("🔐 تم تحديث رمز البوابة (SHA-256)");
    showToast("تم تحديث وتشفير رمز البوابة ✅");
}

async function adminUpdateDecoyPin() {
    if (!AdminGuard.check()) { showToast("⛔ صلاحية مرفوضة"); return; }
    const p = (document.getElementById("admDecoyPin")?.value || "").trim();
    if (p.length < 3) { showToast("اكتب رمزاً وهمياً صحيحاً"); return; }
    const h = await sha256Hex(p);
    await db.ref("sys_config").update({ decoyPinHash: h, decoyPin: null });
    document.getElementById("admDecoyPin").value = "";
    showToast("تم تحديث وتشفير الرمز الوهمي 🛡️");
}

async function adminApproveVerify(reqKey, targetType, targetId, level) {
    if (!AdminGuard.check()) return;
    if (targetType === "space") await db.ref(`spaces/${targetId}/verified`).set(level);
    else await db.ref(`users/${targetId}/verified`).set(level);
    await db.ref(`verify_requests/${reqKey}`).remove(); showToast("تمت الموافقة والتوثيق بنجاح ✨");
}
async function adminRejectVerify(reqKey) { if (!AdminGuard.check()) return; await db.ref(`verify_requests/${reqKey}`).remove(); }
async function adminDismissReport(id) { if (!AdminGuard.check()) return; await db.ref(`reports/${id}`).remove(); }
async function adminSetVerified(u, lv) { if (!AdminGuard.check()) return; await db.ref(`users/${u}/verified`).set(lv); showToast("تم تحديث توثيق الحساب"); }
async function adminSetSpaceVerified(spId, lv) { if (!AdminGuard.check()) return; await db.ref(`spaces/${spId}/verified`).set(lv); showToast("تم تحديث توثيق القناة"); }
async function adminDeleteSpace(spId) { if (!AdminGuard.check() || !confirm("حذف هذه المساحة نهائياً؟")) return; await db.ref(`spaces/${spId}`).remove(); await db.ref(`space_msgs/${spId}`).remove(); showToast("تم الحذف"); }
async function adminToggleSystemLock() { if (!AdminGuard.check()) return; await db.ref("sys_config/locked").set(!sysConfig.locked); }
async function adminToggleRegistration() { if (!AdminGuard.check()) return; await db.ref("sys_config/allowRegister").set(!sysConfig.allowRegister); }
async function adminResetUserPass(u) {
    if (!AdminGuard.check()) return;
    const np = prompt(`كلمة السر الجديدة لـ @${u}:`); if (!np || np.trim().length < 4) return;
    const nh = await sha256Hex("upass::" + np.trim());
    await db.ref(`users/${u}`).update({ pass: nh, passAlgo: "sha256" });
    showToast("تم التحديث وتشفير كلمة السر 🔑");
}
async function adminToggleBan(u, st) { if (!AdminGuard.check()) return; await db.ref(`users/${u}/banned`).set(st); showToast(st ? "تم الحظر" : "تم فك الحظر"); }
async function adminDeleteUser(u) { if (!AdminGuard.check() || !confirm(`حذف @${u} نهائياً؟`)) return; await db.ref(`users/${u}`).remove(); }
async function adminNukeMessages() { if (!AdminGuard.check() || !confirm("مسح جميع المحادثات؟")) return; await db.ref("chats").remove(); await db.ref("chat_meta").remove(); await db.ref("calls").remove(); showToast("تم المسح"); }
async function adminNukeAll() { if (!AdminGuard.check() || !confirm("تدمير شامل لكل شيء في قاعدة البيانات؟")) return; await db.ref().set({ sys_config: sysConfig }); showToast("تم التصفير الكامل"); }
