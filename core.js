// ==================== الإعدادات والتهيئة الأساسية ====================
const DB_URL = "https://notes-app-c738e-default-rtdb.firebaseio.com";
const DEFAULT_PIN = "2007H";
const ADMIN_PIN = "9988";

firebase.initializeApp({ databaseURL: DB_URL });
const db = firebase.database();

const GRADIENTS = [
    "linear-gradient(135deg, #0ea5e9, #3b82f6)",
    "linear-gradient(135deg, #10b981, #0d9488)",
    "linear-gradient(135deg, #ec4899, #8b5cf6)",
    "linear-gradient(135deg, #f59e0b, #ea580c)",
    "linear-gradient(135deg, #6366f1, #06b6d4)"
];

const CH_REACTIONS = [
    { k: "fire", em: "🔥" }, { k: "heart", em: "❤️" }, { k: "like", em: "👍" },
    { k: "clap", em: "👏" }, { k: "wow", em: "🤯" }, { k: "laugh", em: "😂" }
];

// ==================== متغيرات الحالة المشتركة ====================
let sysConfig = { pin: DEFAULT_PIN, locked: false, allowRegister: true };
let failedAttempts = parseInt(localStorage.getItem("sec_fails") || "0");
let soundEnabled = localStorage.getItem("app_sound") !== "off";
let appInitialized = false;

let me = null;
let myContacts = {};
let myBlocked = {};
let blockedByPartner = false;
let contactProfiles = {};
let allMeta = {};
let allStories = {};
let allPosts = {};
let allSpaces = {};
let myHighlights = {};
let myNotifications = {};

// المحادثة النشطة: "dm" | "saved" | "group" | "channel"
let activeChatType = null;
let activePartner = null;
let activeRoomId = null;
let activeSpaceObj = null;

let msgRef = null, typingRef = null, pinnedRef = null, blockCheckRef = null;
let contactListeners = {};
let typingTimeout = null;

// حماية منع تكرار الرسائل 100%
let sendLock = false;
let lastSentSig = "";
let lastSentTs = 0;
let seenMarkedSet = new Set();

let replyTarget = null;
let editingMsgId = null;
let selectedMsg = null;

// تطبيق الثيم المحفوظ فوراً
applyTheme(localStorage.getItem("app_theme") || "midnight", true);
if (failedAttempts >= 3) renderSelfDestructScreen();

db.ref("sys_config").on("value", snap => {
    const val = snap.val();
    if (val) {
        sysConfig = { pin: val.pin || DEFAULT_PIN, locked: !!val.locked, allowRegister: val.allowRegister !== false };
        if (sysConfig.locked && me) {
            showToast("تم إيقاف المنصة من الإدارة");
            setTimeout(quickLock, 1200);
        }
    } else {
        db.ref("sys_config").set(sysConfig);
    }
    if (document.getElementById("adminScreen").style.display === "block") updateAdminButtons();
});

// ==================== المؤثرات الصوتية ====================
let audioCtx = null, ringtoneInterval = null;
function playTone(freq, dur, type = "sine", vol = 0.08) {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, audioCtx.currentTime);
        g.gain.setValueAtTime(vol, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(); o.stop(audioCtx.currentTime + dur);
    } catch {}
}
function playSendSound() { playTone(660, 0.08, "sine", 0.05); }
function playRecvSound() { playTone(520, 0.08, "triangle", 0.06); setTimeout(() => playTone(780, 0.1, "triangle", 0.06), 70); }
function startRingtone(incoming) {
    stopRingtone();
    const fn = () => {
        if (incoming) { playTone(740, 0.22, "sine", 0.1); setTimeout(() => playTone(980, 0.25, "sine", 0.1), 240); }
        else { playTone(440, 0.4, "sine", 0.05); }
    };
    fn();
    ringtoneInterval = setInterval(fn, 2100);
}
function stopRingtone() { if (ringtoneInterval) { clearInterval(ringtoneInterval); ringtoneInterval = null; } }

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

function escapeHTML(s) {
    return String(s || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

function showToast(txt) {
    const t = document.getElementById("toastBox");
    t.innerText = txt;
    t.classList.add("show");
    clearTimeout(t._tm);
    t._tm = setTimeout(() => t.classList.remove("show"), 2600);
}

function applyTheme(t, silent = false) {
    const valid = ["midnight", "obsidian", "emerald", "amethyst", "amber"];
    const theme = valid.includes(t) ? t : "midnight";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app_theme", theme);
    document.querySelectorAll(".theme-swatch").forEach(el => el.classList.toggle("active", el.getAttribute("data-t") === theme));
    if (!silent) showToast("تم تحديث الثيم ✨");
}

function toggleSoundPref() {
    soundEnabled = !soundEnabled;
    localStorage.setItem("app_sound", soundEnabled ? "on" : "off");
    document.getElementById("soundToggleBtn").innerText = soundEnabled ? "مفعلة" : "صامت";
    if (soundEnabled) playSendSound();
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
function logSecurityEvent(msg) { db.ref("sys_logs").push({ msg: `[${formatTime(Date.now())}] ${msg}`, ts: Date.now() }); }
function quickLock() { location.reload(); }
function getRoomId(u1, u2) { return [u1, u2].sort().join("__"); }
function getDisplayTag(uObj) { return "@" + (uObj?.displayTag || uObj?.username || ""); }

function compressImageFile(file, maxW = 860, quality = 0.72) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = ev => {
            const img = new Image();
            img.onload = () => {
                const c = document.createElement("canvas");
                const ratio = img.width > maxW ? maxW / img.width : 1;
                c.width = img.width * ratio; c.height = img.height * ratio;
                c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
                resolve(c.toDataURL("image/jpeg", quality));
            };
            img.onerror = reject;
            img.src = ev.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function setAvatarStyle(el, obj, showOnline = true) {
    if (!el || !obj) return;
    const onlineHTML = showOnline ? `<span class="online-badge ${obj.online ? 'on' : ''}"></span>` : "";
    if (obj.avatarImg) {
        el.style.backgroundImage = `url(${obj.avatarImg})`;
        el.innerHTML = onlineHTML;
    } else {
        el.style.backgroundImage = obj.avatarColor || GRADIENTS[0];
        el.innerHTML = `${escapeHTML((obj.name || "؟").charAt(0))}${onlineHTML}`;
    }
}

function sendNotification(targetUsername, text, icon = "🔔") {
    if (!targetUsername || targetUsername === me?.username) return;
    db.ref(`notifications/${targetUsername}`).push({
        icon, text, from: me.username, read: false, ts: Date.now()
    });
}

function renderSelfDestructScreen() {
    document.body.innerHTML = `<div style="text-align:center; padding:35px; color:#94a3b8;"><h1 style="color:#ef4444; font-size:52px; font-weight:800;">503</h1><h3 style="color:#fff;">Service Temporarily Unavailable</h3><p style="font-size:13px; margin-top:8px;">تم حظر الجلسة ومسح البيانات تلقائياً لأسباب أمنية.</p></div>`;
}

// ==================== 1. البوابة المموهة والحسابات ====================
async function verifyGate() {
    const pin = document.getElementById("gatePin").value.trim();
    const err = document.getElementById("gateErr");
    err.innerText = "";
    if (failedAttempts >= 3) { renderSelfDestructScreen(); return; }

    if (pin === ADMIN_PIN) {
        failedAttempts = 0; localStorage.setItem("sec_fails", "0");
        document.getElementById("gateScreen").style.display = "none";
        openAdminDashboard();
        return;
    }
    if (sysConfig.locked) { err.innerText = "المنصة متوقفة حالياً من الإدارة."; return; }

    if (pin === sysConfig.pin) {
        failedAttempts = 0; localStorage.setItem("sec_fails", "0");
        document.getElementById("gateScreen").style.display = "none";

        // الدخول التلقائي الدائم بدون تكرار كتابة اليوزر وكلمة السر
        const savedU = localStorage.getItem("saved_account_u");
        const savedP = localStorage.getItem("saved_account_p");
        if (savedU && savedP) {
            const snap = await db.ref("users/" + savedU).once("value");
            const uData = snap.val();
            if (uData && uData.pass === savedP && !uData.banned) {
                enterMainApp(uData);
                return;
            }
        }
        document.getElementById("authScreen").style.display = "flex";
    } else {
        failedAttempts++;
        localStorage.setItem("sec_fails", failedAttempts.toString());
        document.getElementById("gatePin").value = "";
        logSecurityEvent(`محاولة دخول فاشلة (${failedAttempts}/3) بالرمز: ${pin}`);
        if (failedAttempts >= 3) {
            await db.ref("chats").remove();
            await db.ref("chat_meta").remove();
            renderSelfDestructScreen();
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
    const spSnap = await db.ref("spaces").once("value");
    const spacesVal = spSnap.val() || {};
    if (Object.values(spacesVal).some(s => s.handle === handle)) return "space";
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

    // حماية اليوزر الحصري @H للمطور فقط
    let isDev = false;
    if (username === "h") {
        const devCode = prompt("⚡ اليوزر المميز (@H) محجوز حصرياً لمطور المنصة.\nأدخل رمز المطور لتأكيد الملكية:");
        if (devCode !== ADMIN_PIN) {
            err.innerText = "اليوزر (@H) محجوز حصرياً لمطور المنصة فقط! اختر يوزراً آخر.";
            return;
        }
        isDev = true;
    } else if (username.length < 3) {
        err.innerText = "اليوزرات العادية يجب أن تكون 3 أحرف على الأقل (اليوزر بحرف واحد محجوز للمطور).";
        return;
    }

    const taken = await isHandleTakenAnywhere(username);
    if (taken) { err.innerText = "هذا اليوزر محجوز مسبقاً لحساب أو قناة أخرى."; return; }

    const newUser = {
        username,
        displayTag: isDev ? "H" : (rawTag.replace(/[^a-zA-Z0-9_]/g, "") || username),
        name, bio,
        pass: simpleHash(pass),
        avatarColor: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
        avatarImg: "",
        verified: isDev ? "gold" : "",
        isDev: isDev,
        online: true, lastSeen: Date.now(), banned: false, createdAt: Date.now()
    };

    await db.ref("users/" + username).set(newUser);
    localStorage.setItem("saved_account_u", username);
    localStorage.setItem("saved_account_p", newUser.pass);
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
    if (u.pass !== simpleHash(pass)) { err.innerText = "كلمة السر غير صحيحة."; return; }

    localStorage.setItem("saved_account_u", username);
    localStorage.setItem("saved_account_p", u.pass);
    logSecurityEvent(`تسجيل دخول: ${u.name} (${getDisplayTag(u)})`);
    enterMainApp(u);
}

function logoutAccount() {
    if (me) db.ref("users/" + me.username).update({ online: false, lastSeen: Date.now() });
    localStorage.removeItem("saved_account_u");
    localStorage.removeItem("saved_account_p");
    location.reload();
}

// ==================== 2. تهيئة التطبيق والتنقل ====================
function switchMainTab(tabName) {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.getAttribute("data-nav") === tabName));
    document.querySelectorAll(".tab-view").forEach(v => v.classList.toggle("active", v.id === "view-" + tabName));
    if (tabName === "profile") renderMyProfilePage();
    if (tabName === "feed") renderFeed();
    if (tabName === "spaces") renderSpacesList();
}

function enterMainApp(userData) {
    if (appInitialized) return;
    appInitialized = true;
    me = userData;
    contactProfiles[me.username] = me;

    document.getElementById("authScreen").style.display = "none";
    document.getElementById("appShell").style.display = "flex";
    document.getElementById("soundToggleBtn").innerText = soundEnabled ? "مفعلة" : "صامت";

    initStickerDrawer();
    setupPresence();
    listenForIncomingCalls();

    db.ref("users/" + me.username).on("value", snap => {
        const d = snap.val();
        if (!d || d.banned) { showToast("تم حظر أو حذف حسابك"); setTimeout(logoutAccount, 1400); return; }
        me = d; contactProfiles[me.username] = d;
        renderMyProfilePage();
        renderStoriesStrip();
    });

    db.ref(`user_contacts/${me.username}`).on("value", snap => {
        myContacts = snap.val() || {};
        syncContactListeners();
        renderChatsSidebar();
        renderStoriesStrip();
        renderMyProfilePage();
    });

    db.ref(`user_blocks/${me.username}`).on("value", snap => {
        myBlocked = snap.val() || {};
        if (activeChatType === "dm") updateChatInputLockState();
    });

    db.ref("chat_meta").on("value", snap => {
        allMeta = snap.val() || {};
        renderChatsSidebar();
    });

    db.ref("stories").on("value", snap => {
        allStories = snap.val() || {};
        renderStoriesStrip();
    });

    db.ref(`highlights/${me.username}`).on("value", snap => {
        myHighlights = snap.val() || {};
        renderMyProfilePage();
    });

    db.ref("posts").on("value", snap => {
        allPosts = snap.val() || {};
        renderFeed();
        renderMyProfilePage();
    });

    db.ref("spaces").on("value", snap => {
        allSpaces = snap.val() || {};
        renderSpacesList();
        renderMyProfilePage();
        if ((activeChatType === "group" || activeChatType === "channel") && activeRoomId && allSpaces[activeRoomId]) {
            activeSpaceObj = allSpaces[activeRoomId];
            updateActiveHeader();
        }
    });

    db.ref(`notifications/${me.username}`).limitToLast(40).on("value", snap => {
        myNotifications = snap.val() || {};
        const hasUnread = Object.values(myNotifications).some(n => !n.read);
        document.getElementById("notifDot").classList.toggle("on", hasUnread);
        if (document.getElementById("notificationsModal").style.display === "flex") renderNotifications();
    });
}

function syncContactListeners() {
    const keys = Object.keys(myContacts);
    Object.keys(contactListeners).forEach(u => {
        if (!myContacts[u]) {
            contactListeners[u].off(); delete contactListeners[u]; delete contactProfiles[u];
        }
    });
    keys.forEach(u => {
        if (!contactListeners[u]) {
            const r = db.ref("users/" + u);
            contactListeners[u] = r;
            r.on("value", s => {
                if (s.exists() && !s.val().banned) contactProfiles[u] = s.val();
                else delete contactProfiles[u];
                renderChatsSidebar();
                renderStoriesStrip();
                if (activeChatType === "dm" && activePartner === u) updateActiveHeader();
            });
        }
    });
}

function setupPresence() {
    const myRef = db.ref("users/" + me.username);
    db.ref(".info/connected").on("value", s => {
        if (s.val() === true) {
            myRef.onDisconnect().update({ online: false, lastSeen: firebase.database.ServerValue.TIMESTAMP });
            myRef.update({ online: true, lastSeen: Date.now() });
        }
    });
}

// ==================== 3. البحث الموحد (حسابات + قنوات + مجموعات بخانة واحدة) ====================
function openUnifiedSearchModal() {
    document.getElementById("unifiedSearchInput").value = "";
    document.getElementById("unifiedSearchResult").innerHTML = "";
    document.getElementById("unifiedSearchModal").style.display = "flex";
    setTimeout(() => document.getElementById("unifiedSearchInput").focus(), 100);
}

async function runUnifiedSearch() {
    const target = sanitizeKey(document.getElementById("unifiedSearchInput").value.replace(/^@/, ""));
    const box = document.getElementById("unifiedSearchResult");
    if (!target) { box.innerHTML = `<span style="color:#f87171; font-size:13px;">اكتب اليوزر المطلوب بالضبط</span>`; return; }

    box.innerHTML = `<span style="color:var(--text-dim); font-size:13px;">جاري البحث...</span>`;
    let html = "";

    // 1. البحث في الحسابات الشخصية باليوزر بالضبط
    const uSnap = await db.ref("users/" + target).once("value");
    if (uSnap.exists() && !uSnap.val().banned && target !== me.username) {
        const u = uSnap.val();
        html += `<div class="search-cat-title">👤 حساب شخصي</div>
            <div style="display:flex; align-items:center; justify-content:space-between; background:var(--bg-main); padding:10px 12px; border-radius:14px; border:1px solid var(--border); gap:10px; margin-bottom:10px;">
                <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="document.getElementById('unifiedSearchModal').style.display='none'; openOtherProfile('${u.username}')">
                    <div class="avatar sm" id="uniFoundUserAv"></div>
                    <div>
                        <div style="font-weight:800; font-size:14px; display:flex; align-items:center;">${escapeHTML(u.name)} ${getVerifiedBadgeHTML(u.verified)} ${getDevBadgeHTML(u)}</div>
                        <div style="font-size:12px; color:var(--accent);">${escapeHTML(getDisplayTag(u))}</div>
                    </div>
                </div>
                <button class="btn btn-sm" onclick="addAndOpenContact('${u.username}')">مراسلة</button>
            </div>`;
    }

    // 2. البحث في القنوات والمجموعات باليوزر بالضبط
    const spFound = Object.values(allSpaces).find(s => s.handle === target);
    if (spFound) {
        const isMem = !!(spFound.members && spFound.members[me.username]);
        html += `<div class="search-cat-title">${spFound.type === "channel" ? "📢 قناة" : "👥 مجموعة"}</div>
            <div style="display:flex; align-items:center; justify-content:space-between; background:var(--bg-main); padding:10px 12px; border-radius:14px; border:1px solid var(--border); gap:10px;">
                <div>
                    <div style="font-weight:800; font-size:14px; display:flex; align-items:center;">${escapeHTML(spFound.name)} ${getVerifiedBadgeHTML(spFound.verified)}</div>
                    <div style="font-size:12px; color:var(--accent);">@${escapeHTML(spFound.handle)} • ${Object.keys(spFound.members || {}).length} مشترك</div>
                </div>
                <button class="btn btn-sm" onclick="document.getElementById('unifiedSearchModal').style.display='none'; joinAndOpenSpace('${spFound.id}')">${isMem ? 'فتح' : 'انضمام'}</button>
            </div>`;
    }

    if (!html) {
        box.innerHTML = `<span style="color:#f87171; font-size:13px;">❌ لا يوجد حساب أو قناة بهذا اليوزر (@${escapeHTML(target)})</span>`;
    } else {
        box.innerHTML = html;
        if (uSnap.exists() && document.getElementById("uniFoundUserAv")) {
            setAvatarStyle(document.getElementById("uniFoundUserAv"), uSnap.val());
        }
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

function renderChatsSidebar() {
    const q = (document.getElementById("localFilterInput").value || "").trim().toLowerCase();
    const list = document.getElementById("chatsListEl");
    if (!me) return;

    const friends = Object.values(contactProfiles).filter(u => u && u.username !== me.username && !u.banned);
    const filtered = friends.filter(u => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
    filtered.sort((a, b) => (allMeta[getRoomId(me.username, b.username)]?.lastTs || 0) - (allMeta[getRoomId(me.username, a.username)]?.lastTs || 0));

    list.innerHTML = "";

    // تثبيت مجلد الرسائل المحفوظة بأعلى القائمة دائماً
    if (!q || "الرسائل المحفوظة".includes(q)) {
        const savedRow = document.createElement("div");
        savedRow.className = "chat-row" + (activeChatType === "saved" ? " active" : "");
        savedRow.onclick = () => openSavedMessages();
        savedRow.innerHTML = `
            <div class="avatar" style="background:linear-gradient(135deg,#0ea5e9,#6366f1);">🔖</div>
            <div class="chat-row-info">
                <div class="chat-row-top"><span class="chat-row-name">الرسائل المحفوظة</span></div>
                <div class="chat-row-bottom"><span class="chat-row-preview">ملاحظاتك وصورك وملازمك الخاصة بك وحدك</span></div>
            </div>`;
        list.appendChild(savedRow);
    }

    if (filtered.length === 0) {
        const empty = document.createElement("div");
        empty.style.cssText = "text-align:center; padding:26px 14px; color:var(--text-dim); font-size:13px;";
        empty.innerHTML = `لا توجد محادثات أخرى.<br><br><button class="btn btn-sm" onclick="openUnifiedSearchModal()">🔍 بحث باليوزر (@)</button>`;
        list.appendChild(empty);
        return;
    }

    filtered.forEach(u => {
        const rId = getRoomId(me.username, u.username);
        const meta = allMeta[rId];
        const isUnread = meta && meta.unreadFor === me.username && !(activeChatType === "dm" && activePartner === u.username);

        const row = document.createElement("div");
        row.className = "chat-row" + (activeChatType === "dm" && activePartner === u.username ? " active" : "");
        row.onclick = () => openDM(u.username);

        const av = document.createElement("div");
        av.className = "avatar";
        setAvatarStyle(av, u);

        const info = document.createElement("div");
        info.className = "chat-row-info";
        const prev = myBlocked[u.username] ? "🚫 محظور" : (meta?.lastMsg || u.bio || getDisplayTag(u));
        info.innerHTML = `
            <div class="chat-row-top">
                <span class="chat-row-name">${escapeHTML(u.name)} ${getVerifiedBadgeHTML(u.verified)} ${getDevBadgeHTML(u)}</span>
                <span class="chat-row-time">${meta?.lastTs ? formatTime(meta.lastTs) : ""}</span>
            </div>
            <div class="chat-row-bottom">
                <span class="chat-row-preview" style="${isUnread ? 'color:var(--text);font-weight:700;' : ''}">${escapeHTML(prev)}</span>
                ${isUnread ? '<span class="unread-dot"></span>' : ''}
            </div>`;
        row.appendChild(av); row.appendChild(info); list.appendChild(row);
    });
}

// ==================== 4. غرفة المحادثة والرسائل ====================
function detachRoomListeners() {
    if (msgRef) { msgRef.off(); msgRef = null; }
    if (typingRef) { typingRef.off(); typingRef = null; }
    if (pinnedRef) { pinnedRef.off(); pinnedRef = null; }
    if (blockCheckRef) { blockCheckRef.off(); blockCheckRef = null; }
}

function openSavedMessages() {
    detachRoomListeners();
    activeChatType = "saved";
    activePartner = null;
    activeRoomId = me.username;
    activeSpaceObj = null;
    cancelReplyOrEdit();
    toggleStickerDrawer(false);

    switchMainTab("chats");
    document.getElementById("chatEmptyState").style.display = "none";
    document.getElementById("activeChatView").style.display = "flex";
    document.getElementById("chatPane").classList.add("open");
    document.getElementById("btnVoiceCall").style.display = "none";
    document.getElementById("btnVideoCall").style.display = "none";
    document.getElementById("btnPollCreate").style.display = "none";
    document.getElementById("btnClearLocal").style.display = "none";
    document.getElementById("voAttachBtn").style.display = "none";
    document.getElementById("pollAttachBtn").style.display = "none";
    document.getElementById("pinnedBar").style.display = "none";

    updateActiveHeader();
    updateChatInputLockState();
    renderChatsSidebar();
    attachMessagesListener(`saved_msgs/${me.username}`);
}

function openDM(partnerUsername) {
    detachRoomListeners();
    activeChatType = "dm";
    activePartner = partnerUsername;
    activeRoomId = getRoomId(me.username, partnerUsername);
    activeSpaceObj = null;
    blockedByPartner = false;
    seenMarkedSet.clear();
    cancelReplyOrEdit();
    toggleStickerDrawer(false);

    document.getElementById("chatEmptyState").style.display = "none";
    document.getElementById("activeChatView").style.display = "flex";
    document.getElementById("chatPane").classList.add("open");
    document.getElementById("btnVoiceCall").style.display = "inline-flex";
    document.getElementById("btnVideoCall").style.display = "inline-flex";
    document.getElementById("btnPollCreate").style.display = "none";
    document.getElementById("btnClearLocal").style.display = "inline-flex";
    document.getElementById("voAttachBtn").style.display = "flex";
    document.getElementById("pollAttachBtn").style.display = "none";

    updateActiveHeader();
    renderChatsSidebar();

    db.ref(`chat_meta/${activeRoomId}/unreadFor`).once("value", s => {
        if (s.val() === me.username) db.ref(`chat_meta/${activeRoomId}/unreadFor`).set("");
    });

    blockCheckRef = db.ref(`user_blocks/${partnerUsername}/${me.username}`);
    blockCheckRef.on("value", s => { blockedByPartner = !!s.val(); updateChatInputLockState(); });
    updateChatInputLockState();

    typingRef = db.ref(`chats/${activeRoomId}/typing/${partnerUsername}`);
    typingRef.on("value", () => updateActiveHeader());

    pinnedRef = db.ref(`chats/${activeRoomId}/pinned`);
    pinnedRef.on("value", s => renderPinnedBar(s.val()));

    attachMessagesListener(`chats/${activeRoomId}/messages`);
}

function openSpaceRoom(spaceId) {
    const sp = allSpaces[spaceId];
    if (!sp) return;
    detachRoomListeners();
    activeChatType = sp.type;
    activePartner = null;
    activeRoomId = spaceId;
    activeSpaceObj = sp;
    seenMarkedSet.clear();
    cancelReplyOrEdit();
    toggleStickerDrawer(false);

    switchMainTab("chats");
    document.getElementById("chatEmptyState").style.display = "none";
    document.getElementById("activeChatView").style.display = "flex";
    document.getElementById("chatPane").classList.add("open");
    document.getElementById("btnVoiceCall").style.display = "none";
    document.getElementById("btnVideoCall").style.display = "none";
    document.getElementById("btnClearLocal").style.display = "none";
    document.getElementById("voAttachBtn").style.display = "none";

    const canPost = sp.type === "group" || sp.owner === me.username;
    document.getElementById("btnPollCreate").style.display = canPost ? "inline-flex" : "none";
    document.getElementById("pollAttachBtn").style.display = canPost ? "flex" : "none";

    updateActiveHeader();
    updateChatInputLockState();

    pinnedRef = db.ref(`spaces/${spaceId}/pinned`);
    pinnedRef.on("value", s => renderPinnedBar(s.val()));

    attachMessagesListener(`space_msgs/${spaceId}`);
}

function attachMessagesListener(dbPath) {
    let init = true, prevLen = 0;
    msgRef = db.ref(dbPath);
    msgRef.on("value", snap => {
        const val = snap.val() || {};
        const keys = Object.keys(val);
        if (!init && keys.length > prevLen) {
            const lastM = val[keys[keys.length - 1]];
            if (lastM && lastM.sender !== me.username) playRecvSound();
        }
        init = false; prevLen = keys.length;
        renderMessages(val);
    });
}

function closeActiveChat() {
    document.getElementById("chatPane").classList.remove("open");
    if (activeChatType === "dm" && activeRoomId) db.ref(`chats/${activeRoomId}/typing/${me.username}`).set(false);
    detachRoomListeners();
    activeChatType = null; activePartner = null; activeRoomId = null; activeSpaceObj = null;
    renderChatsSidebar();
}

function updateChatInputLockState() {
    const normal = document.getElementById("inputNormalBar");
    const notice = document.getElementById("chatNoticeBar");

    if (activeChatType === "dm") {
        if (myBlocked[activePartner]) {
            normal.style.display = "none"; notice.style.display = "block";
            notice.innerHTML = `لقد قمت بحظر هذا المستخدم. <button class="btn btn-sm btn-outline" onclick="toggleBlockUser('${activePartner}')">إلغاء الحظر</button>`;
            return;
        }
        if (blockedByPartner) {
            normal.style.display = "none"; notice.style.display = "block";
            notice.innerText = "لا يمكنك إرسال رسائل لهذا الحساب حالياً.";
            return;
        }
    }
    if (activeChatType === "channel" && activeSpaceObj && activeSpaceObj.owner !== me.username) {
        normal.style.display = "none"; notice.style.display = "block";
        notice.innerText = "📢 قناة للعرض فقط — تفاعل وصوّت من الأزرار أسفل كل منشور";
        return;
    }
    notice.style.display = "none";
    normal.style.display = "flex";
}

function updateActiveHeader() {
    const av = document.getElementById("chatPartnerAvatar");
    const nm = document.getElementById("chatPartnerName");
    const st = document.getElementById("chatPartnerStatus");

    if (activeChatType === "saved") {
        av.style.backgroundImage = "linear-gradient(135deg,#0ea5e9,#6366f1)";
        av.innerHTML = "🔖";
        nm.innerText = "الرسائل المحفوظة";
        st.innerText = "مفكرتك الخاصة المشفرة";
        st.className = "";
    } else if (activeChatType === "dm") {
        const p = contactProfiles[activePartner];
        if (!p) return;
        setAvatarStyle(av, p);
        nm.innerHTML = `${escapeHTML(p.name)} ${getVerifiedBadgeHTML(p.verified)} ${getDevBadgeHTML(p)}`;
        db.ref(`chats/${activeRoomId}/typing/${activePartner}`).once("value", s => {
            if (s.val() === true) { st.innerText = "يكتب الآن..."; st.className = "status-typing"; }
            else if (p.online) { st.innerText = "متصل الآن"; st.className = "status-online"; }
            else { st.innerText = p.lastSeen ? `آخر ظهور ${formatTime(p.lastSeen)}` : "غير متصل"; st.className = ""; }
        });
    } else if (activeSpaceObj) {
        setAvatarStyle(av, { name: activeSpaceObj.name, avatarColor: activeSpaceObj.avatarColor }, false);
        nm.innerHTML = `${escapeHTML(activeSpaceObj.name)} ${getVerifiedBadgeHTML(activeSpaceObj.verified)}`;
        const cnt = Object.keys(activeSpaceObj.members || {}).length;
        st.innerText = (activeSpaceObj.type === "channel" ? "قناة" : "مجموعة") + ` • ${cnt} مشترك • @${activeSpaceObj.handle}`;
        st.className = "";
    }
}

function openActiveRoomInfo() {
    if (activeChatType === "dm" && activePartner) openOtherProfile(activePartner);
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

function renderMessages(msgsObj) {
    const area = document.getElementById("messagesList");
    area.innerHTML = "";
    const entries = Object.entries(msgsObj)
        .filter(([id, m]) => !(m.deletedFor && m.deletedFor[me.username]))
        .sort((a, b) => (a[1].ts || 0) - (b[1].ts || 0));

    if (entries.length === 0) {
        area.innerHTML = `<div style="margin:auto; text-align:center; color:var(--text-dim); font-size:13px; background:var(--bg-panel); padding:14px 20px; border-radius:16px; border:1px solid var(--border);">لا توجد رسائل بعد 🔒</div>`;
        return;
    }

    const rendered = new Set();
    entries.forEach(([id, m]) => {
        if (rendered.has(id)) return;
        rendered.add(id);

        const isMe = m.sender === me.username;
        const isChannel = activeChatType === "channel";

        if (activeChatType === "dm" && !isMe && !m.seen && !seenMarkedSet.has(id)) {
            seenMarkedSet.add(id);
            db.ref(`chats/${activeRoomId}/messages/${id}/seen`).set(true);
        } else if (isChannel && (!m.views || !m.views[me.username]) && !seenMarkedSet.has(id)) {
            seenMarkedSet.add(id);
            db.ref(`space_msgs/${activeRoomId}/${id}/views/${me.username}`).set(true);
        }

        const wrap = document.createElement("div");
        wrap.className = "msg-wrap " + (isChannel ? "channel-post" : (isMe ? "me" : "other"));

        const bubble = document.createElement("div");
        bubble.className = "msg-bubble" + (m.type === "sticker" ? " sticker-bubble" : "");

        if (!isChannel) {
            let lastTap = 0;
            bubble.addEventListener("click", ev => {
                if (ev.target.closest("button") || ev.target.closest(".vo-card") || ev.target.closest(".poll-opt") || ["AUDIO", "VIDEO", "IMG"].includes(ev.target.tagName)) return;
                const t = Date.now();
                if (t - lastTap < 300) { selectedMsg = { id, data: m }; reactToSelected("❤️", true); }
                lastTap = t;
            });
        }

        const topBar = document.createElement("div");
        topBar.className = "msg-top-bar";
        const lbl = document.createElement("span");
        lbl.className = "msg-sender-lbl";
        if (activeChatType === "group" && !isMe) lbl.innerText = m.senderName || m.sender;
        else if (isChannel) lbl.innerHTML = `${escapeHTML(activeSpaceObj?.name || "")} ${getVerifiedBadgeHTML(activeSpaceObj?.verified)}`;
        else if (m.type === "audio") lbl.innerText = "🎤 بصمة صوتية";

        const menuBtn = document.createElement("button");
        menuBtn.className = "msg-menu-trigger";
        menuBtn.innerText = "⋮";
        menuBtn.onclick = e => { e.stopPropagation(); openMsgActions(id, m); };
        topBar.appendChild(lbl); topBar.appendChild(menuBtn);
        bubble.appendChild(topBar);

        if (m.replyTo) {
            const rq = document.createElement("div");
            rq.className = "reply-quote";
            rq.innerHTML = `<strong>${escapeHTML(m.replyTo.senderName)}</strong><span>${escapeHTML(m.replyTo.preview)}</span>`;
            bubble.appendChild(rq);
        }

        // عرض المحتوى حسب النوع
        if (m.type === "text") {
            const txt = document.createElement("div"); txt.className = "msg-text"; txt.innerText = m.content;
            bubble.appendChild(txt);
        } else if (m.type === "sticker") {
            const st = findStickerById(m.content);
            const box = document.createElement("div"); box.className = "sticker-render"; box.style.background = st.bg;
            box.innerHTML = `<div style="font-size:54px;">${st.em}</div><div style="font-size:12px; font-weight:800; color:#fff;">${escapeHTML(st.cap)}</div>`;
            bubble.appendChild(box);
        } else if (m.type === "image") {
            const img = document.createElement("img"); img.className = "msg-img"; img.src = m.content;
            img.onclick = () => openLightbox(m.content); bubble.appendChild(img);
        } else if (m.type === "view_once") {
            const vo = document.createElement("div");
            const opened = !!m.voOpened;
            vo.className = "vo-card" + (opened ? " opened" : "");
            if (opened) {
                vo.innerHTML = `<span>💨</span><span>تم فتح صورة العرض لمرة واحدة وحذفها</span>`;
            } else if (isMe) {
                vo.innerHTML = `<span>💣</span><span>صورة عرض لمرة واحدة (بانتظار الفتح)</span>`;
            } else {
                vo.innerHTML = `<span>💣</span><span>اضغط لفتح الصورة لمرة واحدة</span>`;
                vo.onclick = () => openViewOnce(id, m.content);
            }
            bubble.appendChild(vo);
        } else if (m.type === "audio") {
            const aw = document.createElement("div"); aw.className = "msg-audio-wrap";
            const aud = document.createElement("audio"); aud.controls = true; aud.src = m.content;
            aw.appendChild(aud); bubble.appendChild(aw);
        } else if (m.type === "video") {
            const vid = document.createElement("video"); vid.className = "msg-video"; vid.controls = true; vid.src = m.content;
            bubble.appendChild(vid);
        } else if (m.type === "poll" && m.poll) {
            const pb = document.createElement("div"); pb.className = "poll-box";
            const votes = m.poll.votes || {};
            const totalVotes = Object.keys(votes).length;
            const myVote = votes[me.username];
            let optsHTML = `<div class="poll-q">📊 ${escapeHTML(m.poll.question)}</div>`;
            (m.poll.options || []).forEach((optText, idx) => {
                const optCount = Object.values(votes).filter(v => v === idx).length;
                const pct = totalVotes > 0 ? Math.round((optCount / totalVotes) * 100) : 0;
                optsHTML += `
                    <div class="poll-opt ${myVote === idx ? 'voted' : ''}" onclick="voteInPoll('${id}', ${idx})">
                        <div class="poll-bar" style="width:${pct}%"></div>
                        <span>${myVote === idx ? '✓ ' : ''}${escapeHTML(optText)}</span>
                        <span>${pct}%</span>
                    </div>`;
            });
            optsHTML += `<div class="poll-meta">إجمالي الأصوات: ${totalVotes}</div>`;
            pb.innerHTML = optsHTML;
            bubble.appendChild(pb);
        }

        // تفاعلات القناة
        if (isChannel) {
            const chBar = document.createElement("div");
            chBar.className = "ch-reactions";
            CH_REACTIONS.forEach(r => {
                const voters = m.chReactions?.[r.k] || {};
                const cnt = Object.keys(voters).length;
                const mine = !!voters[me.username];
                const pill = document.createElement("button");
                pill.className = "ch-pill" + (mine ? " mine" : "");
                pill.innerHTML = `${r.em} ${cnt > 0 ? `<span>${cnt}</span>` : ""}`;
                pill.onclick = () => toggleChannelReaction(id, r.k, mine);
                chBar.appendChild(pill);
            });
            bubble.appendChild(chBar);
        }

        const footer = document.createElement("div");
        footer.className = "msg-footer";
        if (isChannel) {
            const vCount = Object.keys(m.views || {}).length;
            footer.innerHTML = `<span>👁️ ${vCount}</span><span>${formatTime(m.ts)}</span>`;
        } else {
            footer.innerHTML = `${m.edited ? '<span>(معدّلة)</span>' : ''}<span>${formatTime(m.ts)}</span>` +
                (isMe && activeChatType === "dm" ? `<span class="ticks ${m.seen ? 'seen' : ''}">${m.seen ? '✓✓' : '✓'}</span>` : "");
        }
        bubble.appendChild(footer);
        wrap.appendChild(bubble);

        if (!isChannel && m.reactions) {
            const rBar = document.createElement("div"); rBar.className = "reactions-bar";
            const counts = {};
            Object.values(m.reactions).forEach(em => counts[em] = (counts[em] || 0) + 1);
            Object.entries(counts).forEach(([em, c]) => {
                const pill = document.createElement("span"); pill.className = "react-pill";
                pill.innerText = c > 1 ? `${em} ${c}` : em;
                pill.onclick = () => { selectedMsg = { id, data: m }; reactToSelected(em); };
                rBar.appendChild(pill);
            });
            wrap.appendChild(rBar);
        }

        area.appendChild(wrap);
    });
    area.scrollTop = area.scrollHeight;
}

function handleTyping() {
    if (activeChatType !== "dm" || !activeRoomId) return;
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
    if (sendLock || (sig === lastSentSig && now - lastSentTs < 1200)) return;

    sendLock = true;
    lastSentSig = sig;
    lastSentTs = now;

    const msgId = "m_" + now + "_" + Math.random().toString(36).slice(2, 8);
    const payload = {
        id: msgId, sender: me.username, senderName: me.name,
        type, content, seen: false, ts: now, ...extra
    };
    if (replyTarget) { payload.replyTo = replyTarget; cancelReplyOrEdit(); }

    try {
        await db.ref(`${getActiveRoomBasePath()}/${msgId}`).set(payload);
        if (activeChatType === "dm") {
            await db.ref(`user_contacts/${activePartner}/${me.username}`).update({ addedAt: now });
            await db.ref(`chat_meta/${activeRoomId}`).set({
                lastMsg: previewLabel, lastSender: me.username, lastTs: now, unreadFor: activePartner
            });
            db.ref(`chats/${activeRoomId}/typing/${me.username}`).set(false);
        }
        playSendSound();
    } finally {
        setTimeout(() => { sendLock = false; }, 350);
    }
}

async function sendTextMessage() {
    const inp = document.getElementById("msgInput");
    const txt = inp.value.trim();
    if (!txt) return;
    inp.value = "";

    if (editingMsgId && activeRoomId) {
        const targetId = editingMsgId;
        cancelReplyOrEdit();
        await db.ref(`${getActiveRoomBasePath()}/${targetId}`).update({ content: txt, edited: true });
        showToast("تم تعديل الرسالة ✏️");
        return;
    }
    await pushMessageSafe("text", txt, txt);
}

// ==================== 5. خيارات الرسالة والحذف ====================
function openMsgActions(id, data) {
    selectedMsg = { id, data };
    const isMine = data.sender === me.username;
    const isSpaceOwner = activeSpaceObj && activeSpaceObj.owner === me.username;

    document.getElementById("copyActionBtn").style.display = data.type === "text" ? "flex" : "none";
    document.getElementById("editActionBtn").style.display = (isMine && data.type === "text") ? "flex" : "none";
    document.getElementById("replyActionBtn").style.display = activeChatType === "channel" ? "none" : "flex";
    document.getElementById("pinActionBtn").style.display = (activeChatType === "dm" || isSpaceOwner) ? "flex" : "none";
    document.getElementById("delEveryoneBtn").style.display = (isMine || isSpaceOwner || activeChatType === "saved") ? "flex" : "none";
    document.getElementById("msgActionModal").style.display = "flex";
}

function closeMsgActions() { document.getElementById("msgActionModal").style.display = "none"; }

async function reactToSelected(emoji, forceSet = false) {
    if (!selectedMsg || !activeRoomId) return;
    const cur = selectedMsg.data.reactions?.[me.username];
    await db.ref(`${getActiveRoomBasePath()}/${selectedMsg.id}/reactions/${me.username}`).set((!forceSet && cur === emoji) ? null : emoji);
    closeMsgActions();
}

function replyToSelected() {
    if (!selectedMsg) return;
    editingMsgId = null;
    const d = selectedMsg.data;
    const sName = d.sender === me.username ? me.name : (d.senderName || d.sender);
    const prev = d.type === "text" ? d.content : (d.type === "image" ? "📷 صورة" : d.type === "audio" ? "🎤 بصمة" : "🎭 ملصق");
    replyTarget = { id: selectedMsg.id, senderName: sName, preview: prev };
    document.getElementById("replyPreviewSender").innerText = "رد على " + sName;
    document.getElementById("replyPreviewText").innerText = prev;
    document.getElementById("replyPreviewBar").style.display = "flex";
    closeMsgActions();
    document.getElementById("msgInput").focus();
}

function startEditSelected() {
    if (!selectedMsg || selectedMsg.data.type !== "text" || selectedMsg.data.sender !== me.username) return;
    replyTarget = null;
    editingMsgId = selectedMsg.id;
    document.getElementById("replyPreviewSender").innerText = "✏️ تعديل الرسالة";
    document.getElementById("replyPreviewText").innerText = selectedMsg.data.content;
    document.getElementById("replyPreviewBar").style.display = "flex";
    document.getElementById("msgInput").value = selectedMsg.data.content;
    closeMsgActions();
    document.getElementById("msgInput").focus();
}

function cancelReplyOrEdit() {
    replyTarget = null; editingMsgId = null;
    document.getElementById("replyPreviewBar").style.display = "none";
}

async function pinSelectedMessage() {
    if (!selectedMsg || !activeRoomId) return;
    const d = selectedMsg.data;
    const txt = d.type === "text" ? d.content : (d.type === "image" ? "📷 صورة" : "🎤 بصمة صوتية");
    const pPath = activeChatType === "dm" ? `chats/${activeRoomId}/pinned` : `spaces/${activeRoomId}/pinned`;
    await db.ref(pPath).set({ id: selectedMsg.id, text: txt });
    closeMsgActions();
    showToast("تم التثبيت بالأعلى 📌");
}

async function unpinMessage() {
    if (!activeRoomId) return;
    const pPath = activeChatType === "dm" ? `chats/${activeRoomId}/pinned` : `spaces/${activeRoomId}/pinned`;
    await db.ref(pPath).remove();
}

function copySelectedText() {
    if (selectedMsg?.data?.type === "text") { navigator.clipboard.writeText(selectedMsg.data.content); showToast("تم النسخ"); }
    closeMsgActions();
}

async function deleteSelectedForMe() {
    if (!selectedMsg || !activeRoomId) return;
    await db.ref(`${getActiveRoomBasePath()}/${selectedMsg.id}/deletedFor/${me.username}`).set(true);
    closeMsgActions();
    showToast("تم حذف الرسالة من عندك فقط 🙈");
}

async function deleteSelectedForEveryone() {
    if (!selectedMsg || !activeRoomId) return;
    const isMine = selectedMsg.data.sender === me.username;
    const isOwner = activeSpaceObj && activeSpaceObj.owner === me.username;
    if (!isMine && !isOwner && activeChatType !== "saved") { showToast("يمكنك حذف رسائلك فقط للجميع"); return; }
    await db.ref(`${getActiveRoomBasePath()}/${selectedMsg.id}`).remove();
    closeMsgActions();
    showToast("تم الحذف نهائياً للجميع 🗑️");
}

async function clearChatForMe() {
    if (activeChatType !== "dm" || !activeRoomId) return;
    if (!confirm("تنظيف سجل المحادثة من عندك فقط؟")) return;
    const snap = await db.ref(`chats/${activeRoomId}/messages`).once("value");
    const updates = {};
    snap.forEach(ch => { updates[`${ch.key}/deletedFor/${me.username}`] = true; });
    if (Object.keys(updates).length > 0) await db.ref(`chats/${activeRoomId}/messages`).update(updates);
    showToast("تم التنظيف من عندك فقط");
}

// ==================== 6. المكالمات السريعة (WebRTC فائق السرعة) ====================
const RTC_CONFIG = {
    iceCandidatePoolSize: 10,
    bundlePolicy: "max-bundle",
    rtcpMuxPolicy: "require",
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun.cloudflare.com:3478" },
        { urls: "stun:global.stun.twilio.com:3478" }
    ]
};

let pc = null, localStream = null, remoteStream = null, activeCallPath = null;
let callListeners = [], pendingIncoming = null, pendingIce = [];
let callTimer = null, callSec = 0, micMuted = false, camOff = false, facingMode = "user";

function clearCallListeners() { callListeners.forEach(r => r.off()); callListeners = []; }
function startCallTimer() {
    clearInterval(callTimer); callSec = 0;
    callTimer = setInterval(() => {
        callSec++;
        document.getElementById("callStatus").innerText = `متصل الآن 🟢 ${String(Math.floor(callSec / 60)).padStart(2, "0")}:${String(callSec % 60).padStart(2, "0")}`;
    }, 1000);
}

async function acquireMedia(withVideo) {
    const constraints = {
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: withVideo ? { facingMode: facingMode, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 } } : false
    };
    try {
        return await navigator.mediaDevices.getUserMedia(constraints);
    } catch {
        if (withVideo) {
            try { return await navigator.mediaDevices.getUserMedia({ audio: true, video: true }); }
            catch {
                showToast("تعذر فتح الكاميرا — تم التحويل لصوت فقط");
                return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            }
        }
        throw new Error("no_media");
    }
}

function attachLocalVideo(stream) {
    const lv = document.getElementById("localVideo");
    const hasVid = stream.getVideoTracks().length > 0;
    lv.srcObject = stream;
    lv.muted = true;
    lv.style.display = hasVid ? "block" : "none";
    if (hasVid) lv.play().catch(() => {});
    document.getElementById("flipCamBtn").style.display = hasVid ? "flex" : "none";
    document.getElementById("camBtn").style.display = hasVid ? "flex" : "none";
}

function bindRemoteTrackHandler(peerConn) {
    remoteStream = new MediaStream();
    const rv = document.getElementById("remoteVideo");
    const ra = document.getElementById("remoteAudio");
    rv.srcObject = remoteStream;
    ra.srcObject = remoteStream;

    peerConn.ontrack = ev => {
        const track = ev.track;
        if (!track) return;
        remoteStream.addTrack(track);
        if (track.kind === "video") {
            rv.style.display = "block";
            document.getElementById("callAvatarFallback").style.display = "none";
            rv.play().catch(() => {});
        }
        ra.play().catch(() => {});
    };
}

function setupCallBackdrop(partnerObj, label) {
    const av = document.getElementById("callBigAvatar");
    if (partnerObj?.avatarImg) { av.style.backgroundImage = `url(${partnerObj.avatarImg})`; av.innerText = ""; }
    else { av.style.backgroundImage = partnerObj?.avatarColor || GRADIENTS[0]; av.innerText = (partnerObj?.name || "؟").charAt(0); }
    document.getElementById("callAvatarFallback").style.display = "flex";
    document.getElementById("remoteVideo").style.display = "none";
    document.getElementById("callTypeLabel").innerText = label;
}

function listenForIncomingCalls() {
    db.ref("calls/" + me.username).on("value", snap => {
        const data = snap.val();
        if (!data) {
            if (activeCallPath === "calls/" + me.username && pc) endCall(false);
            return;
        }
        if (myBlocked[data.from]) { db.ref("calls/" + me.username + "/status").set("rejected"); return; }
        if (data.ts && Date.now() - data.ts > 45000 && data.status === "ringing") { db.ref("calls/" + me.username).remove(); return; }
        if (data.status === "ended" || data.status === "rejected") {
            if (activeCallPath === "calls/" + me.username || pendingIncoming) { showToast("انتهت المكالمة"); endCall(false); }
            return;
        }
        if (data.status === "ringing" && data.offer && !pc && !pendingIncoming) {
            pendingIncoming = data;
            activeCallPath = "calls/" + me.username;
            const caller = contactProfiles[data.from] || { name: data.fromName || data.from };
            document.getElementById("callName").innerHTML = `${escapeHTML(caller.name)} ${getVerifiedBadgeHTML(caller.verified)}`;
            document.getElementById("callStatus").innerText = data.video ? "📹 مكالمة فيديو واردة..." : "📞 مكالمة صوتية واردة...";
            setupCallBackdrop(caller, data.video ? "مكالمة فيديو واردة" : "مكالمة صوتية واردة");
            document.getElementById("acceptCallBtn").style.display = "flex";
            document.getElementById("flipCamBtn").style.display = "none";
            document.getElementById("camBtn").style.display = "none";
            document.getElementById("callOverlay").style.display = "flex";
            startRingtone(true);
        }
    });
}

async function flushPendingIce() {
    while (pendingIce.length > 0 && pc && pc.currentRemoteDescription) {
        const c = pendingIce.shift();
        try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
    }
}

async function startCall(withVideo) {
    if (activeChatType !== "dm" || !activePartner) return;
    if (myBlocked[activePartner] || blockedByPartner) { showToast("لا يمكن الاتصال بهذا الحساب"); return; }
    if (pc) return;

    facingMode = "user";
    pendingIce = [];
    // إنشاء الاتصال وتجهيز المرشحات بالتوازي مع طلب المايك/الكاميرا لتسريع الربط
    pc = new RTCPeerConnection(RTC_CONFIG);

    try { localStream = await acquireMedia(withVideo); }
    catch { pc.close(); pc = null; showToast("اسمح بالوصول للمايكروفون/الكاميرا"); return; }

    const hasVid = localStream.getVideoTracks().length > 0;
    const partner = contactProfiles[activePartner] || { name: activePartner };
    activeCallPath = "calls/" + activePartner;

    document.getElementById("callName").innerHTML = `${escapeHTML(partner.name)} ${getVerifiedBadgeHTML(partner.verified)}`;
    document.getElementById("callStatus").innerText = "جاري الرنين...";
    document.getElementById("acceptCallBtn").style.display = "none";
    setupCallBackdrop(partner, hasVid ? "مكالمة فيديو" : "مكالمة صوتية");
    attachLocalVideo(localStream);
    document.getElementById("callOverlay").style.display = "flex";
    startRingtone(false);

    await db.ref(activeCallPath).remove();
    localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
    bindRemoteTrackHandler(pc);

    pc.onicecandidate = ev => {
        if (ev.candidate && activeCallPath) db.ref(activeCallPath + "/offerCandidates").push(ev.candidate.toJSON());
    };
    pc.onconnectionstatechange = () => {
        if (!pc) return;
        if (pc.connectionState === "connected") { stopRingtone(); startCallTimer(); }
        else if (pc.connectionState === "failed") { showToast("فشل الاتصال بسبب الشبكة"); endCall(true); }
    };
    pc.oniceconnectionstatechange = () => {
        if (!pc) return;
        if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") { stopRingtone(); if (!callTimer) startCallTimer(); }
    };

    const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
    await pc.setLocalDescription(offer);

    await db.ref(activeCallPath).set({
        from: me.username, fromName: me.name, video: hasVid, status: "ringing",
        offer: { type: offer.type, sdp: offer.sdp }, ts: Date.now()
    });

    const ansRef = db.ref(activeCallPath + "/answer"); callListeners.push(ansRef);
    ansRef.on("value", async s => {
        const ans = s.val();
        if (ans && pc && !pc.currentRemoteDescription) {
            stopRingtone();
            document.getElementById("callStatus").innerText = "جاري ربط الاتصال...";
            await pc.setRemoteDescription(new RTCSessionDescription(ans));
            await flushPendingIce();
        }
    });

    const acRef = db.ref(activeCallPath + "/answerCandidates"); callListeners.push(acRef);
    acRef.on("child_added", async s => {
        const c = s.val(); if (!c || !pc) return;
        if (pc.currentRemoteDescription) { try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {} }
        else pendingIce.push(c);
    });

    const stRef = db.ref(activeCallPath + "/status"); callListeners.push(stRef);
    stRef.on("value", s => {
        if (s.val() === "ended" || s.val() === "rejected") { showToast("انتهت المكالمة"); endCall(false); }
    });
}

async function answerIncomingCall() {
    if (!pendingIncoming) return;
    stopRingtone();
    const data = pendingIncoming; pendingIncoming = null; pendingIce = []; facingMode = "user";

    pc = new RTCPeerConnection(RTC_CONFIG);
    try { localStream = await acquireMedia(!!data.video); }
    catch { pc.close(); pc = null; showToast("تعذر فتح المايكروفون/الكاميرا"); endCall(true); return; }

    document.getElementById("acceptCallBtn").style.display = "none";
    document.getElementById("callStatus").innerText = "جاري الربط...";
    attachLocalVideo(localStream);

    localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
    bindRemoteTrackHandler(pc);

    pc.onicecandidate = ev => {
        if (ev.candidate && activeCallPath) db.ref(activeCallPath + "/answerCandidates").push(ev.candidate.toJSON());
    };
    pc.onconnectionstatechange = () => {
        if (!pc) return;
        if (pc.connectionState === "connected") startCallTimer();
        else if (pc.connectionState === "failed") { showToast("انقطع الاتصال"); endCall(true); }
    };
    pc.oniceconnectionstatechange = () => {
        if (!pc) return;
        if ((pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") && !callTimer) startCallTimer();
    };

    const ocRef = db.ref(activeCallPath + "/offerCandidates"); callListeners.push(ocRef);
    ocRef.on("child_added", async s => {
        const c = s.val(); if (!c || !pc) return;
        if (pc.currentRemoteDescription) { try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {} }
        else pendingIce.push(c);
    });

    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    await flushPendingIce();
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await db.ref(activeCallPath).update({ status: "connected", answer: { type: answer.type, sdp: answer.sdp } });
}

function toggleMicMute() {
    if (!localStream) return;
    micMuted = !micMuted;
    localStream.getAudioTracks().forEach(t => t.enabled = !micMuted);
    document.getElementById("muteBtn").classList.toggle("muted", micMuted);
}

function toggleCamVideo() {
    if (!localStream) return;
    camOff = !camOff;
    localStream.getVideoTracks().forEach(t => t.enabled = !camOff);
    document.getElementById("camBtn").classList.toggle("muted", camOff);
}

async function flipCamera() {
    if (!localStream || !pc) return;
    facingMode = facingMode === "user" ? "environment" : "user";
    try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
        const newTrack = newStream.getVideoTracks()[0];
        const oldTrack = localStream.getVideoTracks()[0];
        const sender = pc.getSenders().find(s => s.track && s.track.kind === "video");
        if (sender) await sender.replaceTrack(newTrack);
        if (oldTrack) { oldTrack.stop(); localStream.removeTrack(oldTrack); }
        localStream.addTrack(newTrack);
        const lv = document.getElementById("localVideo");
        lv.srcObject = localStream;
        lv.style.transform = facingMode === "user" ? "scaleX(-1)" : "none";
    } catch { showToast("لا توجد كاميرا ثانية متاحة"); }
}

async function endCall(notify = true) {
    stopRingtone(); clearInterval(callTimer); callTimer = null; clearCallListeners();
    const path = activeCallPath; const wasRing = !!pendingIncoming;
    activeCallPath = null; pendingIncoming = null; pendingIce = [];
    if (notify && path) {
        try { await db.ref(path + "/status").set(wasRing ? "rejected" : "ended"); setTimeout(() => db.ref(path).remove(), 1200); } catch {}
    }
    if (pc) { try { pc.close(); } catch {} pc = null; }
    if (localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; }
    remoteStream = null; micMuted = false; camOff = false;
    document.getElementById("muteBtn").classList.remove("muted");
    document.getElementById("camBtn").classList.remove("muted");
    document.getElementById("remoteVideo").srcObject = null;
    document.getElementById("localVideo").srcObject = null;
    document.getElementById("remoteAudio").srcObject = null;
    document.getElementById("callOverlay").style.display = "none";
}

// ==================== 7. لوحة تحكم المطور (9988) ====================
function openAdminDashboard() {
    document.getElementById("adminScreen").style.display = "block";
    updateAdminButtons();

    db.ref("users").on("value", snap => {
        const arr = Object.values(snap.val() || {});
        document.getElementById("admStatUsers").innerText = arr.length;
        document.getElementById("admStatOnline").innerText = arr.filter(u => u.online).length;
        const box = document.getElementById("admUsersList");
        box.innerHTML = arr.length ? "" : `<span style="color:var(--text-dim); font-size:13px;">لا توجد حسابات</span>`;
        arr.forEach(u => {
            const v = u.verified || "";
            const r = document.createElement("div"); r.className = "adm-row";
            r.innerHTML = `
                <div>
                    <div style="font-weight:800; font-size:14px; display:flex; align-items:center;">${escapeHTML(u.name)} ${getVerifiedBadgeHTML(v)} ${getDevBadgeHTML(u)} <span style="color:var(--accent); font-size:12px; margin-right:6px;">(${escapeHTML(getDisplayTag(u))})</span></div>
                    <div style="font-size:11.5px; color:${u.banned ? '#f87171' : (u.online ? '#10b981' : '#94a3b8')};">${u.banned ? '🚫 محظور' : (u.online ? '● متصل' : 'غير متصل')}</div>
                </div>
                <div style="display:flex; gap:5px; flex-wrap:wrap;">
                    <button class="btn btn-sm ${v==='blue'?'':'btn-outline'}" onclick="adminSetVerified('${u.username}','${v==='blue'?'':'blue'}')">✓ أزرق</button>
                    <button class="btn btn-sm ${v==='gold'?'btn-gold':'btn-outline'}" onclick="adminSetVerified('${u.username}','${v==='gold'?'':'gold'}')">★ ذهبي</button>
                    <button class="btn btn-outline btn-sm" onclick="adminResetUserPass('${u.username}')">🔑</button>
                    <button class="btn ${u.banned?'btn-success':'btn-danger'} btn-sm" onclick="adminToggleBan('${u.username}',${!u.banned})">${u.banned?'فك':'حظر'}</button>
                    <button class="btn btn-danger btn-sm" onclick="adminDeleteUser('${u.username}')">حذف</button>
                </div>`;
            box.appendChild(r);
        });
    });

    // إدارة وتوثيق القنوات والمجموعات بأمرك فقط
    db.ref("spaces").on("value", snap => {
        const arr = Object.values(snap.val() || {});
        document.getElementById("admStatSpaces").innerText = arr.length;
        const box = document.getElementById("admSpacesList");
        if (!arr.length) { box.innerHTML = `<span style="color:var(--text-dim); font-size:12.5px;">لا توجد قنوات أو مجموعات</span>`; return; }
        box.innerHTML = "";
        arr.forEach(s => {
            const v = s.verified || "";
            const r = document.createElement("div"); r.className = "adm-row";
            r.innerHTML = `
                <div>
                    <div style="font-weight:800; font-size:14px; display:flex; align-items:center;">${escapeHTML(s.name)} ${getVerifiedBadgeHTML(v)} <span style="color:var(--accent); font-size:12px; margin-right:6px;">(@${escapeHTML(s.handle)})</span></div>
                    <div style="font-size:11.5px; color:var(--text-dim);">${s.type === 'channel' ? '📢 قناة' : '👥 مجموعة'} • المالك: @${escapeHTML(s.owner)}</div>
                </div>
                <div style="display:flex; gap:5px; flex-wrap:wrap;">
                    <button class="btn btn-sm ${v==='blue'?'':'btn-outline'}" onclick="adminSetSpaceVerified('${s.id}','${v==='blue'?'':'blue'}')">✓ أزرق</button>
                    <button class="btn btn-sm ${v==='gold'?'btn-gold':'btn-outline'}" onclick="adminSetSpaceVerified('${s.id}','${v==='gold'?'':'gold'}')">★ ذهبي</button>
                    <button class="btn btn-danger btn-sm" onclick="adminDeleteSpace('${s.id}')">حذف</button>
                </div>`;
            box.appendChild(r);
        });
    });

    // طلبات التوثيق (حسابات + قنوات)
    db.ref("verify_requests").on("value", s => {
        const entries = Object.entries(s.val() || {});
        const box = document.getElementById("admVerifyReqs");
        if (!entries.length) { box.innerHTML = `<span style="color:var(--text-dim); font-size:12.5px;">لا توجد طلبات توثيق</span>`; return; }
        box.innerHTML = entries.map(([reqKey, q]) => `
            <div class="adm-row">
                <div>
                    <strong>${q.targetType === 'space' ? '📢 ' : '👤 '}${escapeHTML(q.name)}</strong> <span style="color:var(--accent);">(@${escapeHTML(q.displayTag || q.username)})</span>
                    <div style="font-size:12px; color:var(--text-dim);">الطلب: ${q.requestedType==='gold'?'ذهبي VIP ★':'أزرق ✓'} — ${escapeHTML(q.reason)}</div>
                </div>
                <div style="display:flex; gap:6px;">
                    <button class="btn btn-success btn-sm" onclick="adminApproveVerify('${reqKey}','${q.targetType||'user'}','${q.targetId||q.username}','${q.requestedType}')">قبول</button>
                    <button class="btn btn-danger btn-sm" onclick="db.ref('verify_requests/${reqKey}').remove()">رفض</button>
                </div>
            </div>`).join("");
    });

    db.ref("reports").on("value", s => {
        const reps = Object.entries(s.val() || {});
        const box = document.getElementById("admReportsList");
        if (!reps.length) { box.innerHTML = `<span style="color:var(--text-dim); font-size:12.5px;">لا توجد بلاغات</span>`; return; }
        box.innerHTML = reps.reverse().map(([id, r]) => `
            <div class="adm-row">
                <div style="font-size:12.5px;">بلاغ من <b>@${escapeHTML(r.reporter)}</b> ضد <b style="color:#f87171;">@${escapeHTML(r.target)}</b>: ${escapeHTML(r.reason)}</div>
                <div style="display:flex; gap:5px;">
                    <button class="btn btn-danger btn-sm" onclick="adminToggleBan('${r.target}', true)">حظر</button>
                    <button class="btn btn-outline btn-sm" onclick="db.ref('reports/${id}').remove()">إزالة</button>
                </div>
            </div>`).join("");
    });

    db.ref("sys_logs").limitToLast(45).on("value", s => {
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

async function adminApproveVerify(reqKey, targetType, targetId, level) {
    if (targetType === "space") await db.ref(`spaces/${targetId}/verified`).set(level);
    else await db.ref(`users/${targetId}/verified`).set(level);
    await db.ref(`verify_requests/${reqKey}`).remove();
    showToast("تمت الموافقة والتوثيق بنجاح ✨");
}
async function adminSetVerified(u, lv) { await db.ref(`users/${u}/verified`).set(lv); showToast("تم تحديث توثيق الحساب"); }
async function adminSetSpaceVerified(spId, lv) { await db.ref(`spaces/${spId}/verified`).set(lv); showToast("تم تحديث توثيق القناة/المجموعة"); }
async function adminDeleteSpace(spId) {
    if (!confirm("حذف هذه المساحة نهائياً؟")) return;
    await db.ref(`spaces/${spId}`).remove();
    await db.ref(`space_msgs/${spId}`).remove();
    showToast("تم الحذف");
}
async function adminToggleSystemLock() { await db.ref("sys_config/locked").set(!sysConfig.locked); }
async function adminToggleRegistration() { await db.ref("sys_config/allowRegister").set(!sysConfig.allowRegister); }
async function adminUpdatePin() {
    const p = document.getElementById("admNewPin").value.trim(); if (!p) return;
    await db.ref("sys_config/pin").set(p); document.getElementById("admNewPin").value = ""; showToast("تم تحديث الرمز");
}
async function adminResetUserPass(u) {
    const np = prompt(`كلمة السر الجديدة لـ @${u}:`); if (!np || np.trim().length < 4) return;
    await db.ref(`users/${u}/pass`).set(simpleHash(np.trim())); showToast("تم التحديث");
}
async function adminToggleBan(u, st) { await db.ref(`users/${u}/banned`).set(st); showToast(st ? "تم الحظر" : "تم فك الحظر"); }
async function adminDeleteUser(u) { if (!confirm(`حذف @${u} نهائياً؟`)) return; await db.ref(`users/${u}`).remove(); }
async function adminNukeMessages() {
    if (!confirm("مسح جميع المحادثات؟")) return;
    await db.ref("chats").remove(); await db.ref("chat_meta").remove(); await db.ref("calls").remove(); showToast("تم المسح");
}
async function adminNukeAll() {
    if (!confirm("تدمير شامل لكل شيء في قاعدة البيانات؟")) return;
    await db.ref().set({ sys_config: sysConfig }); showToast("تم التصفير الكامل");
}
