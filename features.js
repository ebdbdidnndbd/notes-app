// ==================== 1. نظام التثبيت الآمن وفاحص الجاهزية (PWA V12 Signature) ====================
let deferredInstallPrompt = null;

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js?v=12").then(reg => {
            reg.update().catch(() => {});
        }).catch(() => {});
    });
}

window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const topBtn = document.getElementById("installTopBtn");
    if (topBtn) topBtn.style.display = "inline-flex";
    runPwaDiagnostics();
});

window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    const topBtn = document.getElementById("installTopBtn");
    if (topBtn) topBtn.style.display = "none";
    showToast("تم تثبيت التطبيق على شاشة هاتفك بنجاح");
    runPwaDiagnostics();
});

async function runPwaDiagnostics() {
    const box = document.getElementById("pwaDiagBox");
    if (!box) return;

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (isStandalone) {
        box.innerHTML = `<span style="color:var(--success); font-weight:800;">التطبيق مثبّت ويعمل كبرنامج مستقل بالكامل.</span>`;
        return;
    }

    const checks = [];
    const swReady = ("serviceWorker" in navigator) && !!(await navigator.serviceWorker.getRegistration());
    checks.push(swReady ? "✓ الخدمة الخلفية للتطبيق تعمل" : "• جاري تفعيل الخدمة الخلفية");

    let icon192Ok = false, icon512Ok = false;
    try {
        const r1 = await fetch("./icon-192.png", { cache: "no-store" });
        icon192Ok = r1.ok && (r1.headers.get("content-type") || "").includes("png");
    } catch {}
    try {
        const r2 = await fetch("./icon-512.png", { cache: "no-store" });
        icon512Ok = r2.ok && (r2.headers.get("content-type") || "").includes("png");
    } catch {}

    checks.push((icon192Ok && icon512Ok) ? "✓ أيقونات التطبيق جاهزة" : "• ملفات الأيقونات قيد التجهيز");
    checks.push(deferredInstallPrompt ? "✓ جاهز للتثبيت المباشر — اضغط الزر أدناه" : "• افتح الرابط بمتصفح Chrome أو Safari مباشرة للتثبيت");
    box.innerHTML = checks.join("<br>");
}

async function triggerPwaInstall() {
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === "accepted") showToast("جاري تثبيت التطبيق المستقل...");
        deferredInstallPrompt = null;
        runPwaDiagnostics();
    } else {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
            alert("لتثبيت التطبيق على الآيفون:\n1. افتح الرابط في متصفح Safari مباشرة.\n2. اضغط زر المشاركة (Share) أسفل المتصفح.\n3. اختر (إضافة إلى الشاشة الرئيسية).");
        } else {
            alert("لتثبيت التطبيق على الأندرويد:\n1. افتح الرابط بمتصفح Chrome مباشرة.\n2. اضغط الثلاث نقاط (⋮) بأعلى المتصفح.\n3. اختر (إضافة إلى الشاشة الرئيسية) ← (تثبيت).");
        }
    }
}

// ==================== 2. مركز الإشعارات والتفاعلات ====================
function openNotificationsModal() {
    document.getElementById("notificationsModal").style.display = "flex";
    renderNotifications();
    const updates = {};
    Object.entries(myNotifications).forEach(([id, n]) => { if (!n.read) updates[`${id}/read`] = true; });
    if (Object.keys(updates).length > 0) db.ref(`notifications/${me.username}`).update(updates);
}

function renderNotifications() {
    const box = document.getElementById("notifList");
    const list = Object.values(myNotifications).sort((a, b) => (b.ts || 0) - (a.ts || 0));
    if (list.length === 0) {
        box.innerHTML = `<div style="text-align:center; padding:26px; color:var(--text-dim); font-size:13px;">لا توجد إشعارات أو تفاعلات بعد</div>`;
        return;
    }
    box.innerHTML = list.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <span>${n.icon || "•"} &nbsp; ${escapeHTML(n.text)}</span>
                <span style="font-size:11px; color:var(--text-dim); flex-shrink:0;">${formatTime(n.ts)}</span>
            </div>
        </div>`).join("");
}

async function clearAllNotifications() {
    await db.ref(`notifications/${me.username}`).remove();
    showToast("تم تنظيف الإشعارات");
}

// ==================== 3. لوحة الرموز والملصقات السفلية ====================
const EMOJI_LIST = [
    { em: "😂", k: "ضحك" }, { em: "🤣", k: "ضحك" }, { em: "❤️", k: "حب قلب" }, { em: "😘", k: "بوسة حب" },
    { em: "😍", k: "حب اعجاب" }, { em: "🥰", k: "حب عمري" }, { em: "👍", k: "تمام لايك" }, { em: "😊", k: "ابتسامة" },
    { em: "😔", k: "حزن" }, { em: "😁", k: "ضحك" }, { em: "😭", k: "بجي بكاء" }, { em: "💋", k: "بوسة" },
    { em: "😒", k: "زعل" }, { em: "😳", k: "صدمة" }, { em: "😉", k: "غمزة" }, { em: "😜", k: "مزح" },
    { em: "😃", k: "فرح" }, { em: "🙈", k: "خجل" }, { em: "😢", k: "دموع" }, { em: "😝", k: "مزح" },
    { em: "😱", k: "رعب صدمة" }, { em: "😡", k: "غضب" }, { em: "😏", k: "ثقة" }, { em: "😞", k: "ضوجة" },
    { em: "🥺", k: "رجاء" }, { em: "🔥", k: "نار حماس" }, { em: "✨", k: "نجوم" }, { em: "🌹", k: "وردة" },
    { em: "🫂", k: "حضن" }, { em: "👑", k: "ملك" }, { em: "💯", k: "مية" }, { em: "👏", k: "تصفيق" },
    { em: "😎", k: "كشخة فخامة" }, { em: "🤔", k: "تفكير" }, { em: "😴", k: "نوم نعاس" }, { em: "🤯", k: "انصدام" },
    { em: "💔", k: "قلب مكسور" }, { em: "🤍", k: "قلب ابيض" }, { em: "🖤", k: "قلب اسود" }, { em: "💜", k: "قلب بنفسجي" },
    { em: "☕", k: "قهوة" }, { em: "📚", k: "دراسة سادس" }, { em: "🎮", k: "العاب" }, { em: "🏆", k: "فوز" },
    { em: "👀", k: "عيون مراقبة" }, { em: "🤫", k: "سر" }, { em: "🙏", k: "دعاء شكرا" }, { em: "🎉", k: "احتفال" }
];

const BUILTIN_STICKERS = [
    { id: "love1", em: "❤️‍🔥", cap: "أحبك", bg: "linear-gradient(135deg,#be123c,#fb7185)" },
    { id: "love2", em: "🥰", cap: "عمري", bg: "linear-gradient(135deg,#db2777,#f472b6)" },
    { id: "love3", em: "🌹", cap: "وردة إلك", bg: "linear-gradient(135deg,#9f1239,#e11d48)" },
    { id: "love4", em: "🥺", cap: "مشتاقلك", bg: "linear-gradient(135deg,#7c3aed,#c084fc)" },
    { id: "love5", em: "🫂", cap: "حضن", bg: "linear-gradient(135deg,#2563eb,#60a5fa)" },
    { id: "fun1", em: "🤣", cap: "متت ضحك", bg: "linear-gradient(135deg,#d97706,#facc15)" },
    { id: "fun2", em: "😎", cap: "فخامة", bg: "linear-gradient(135deg,#1d4ed8,#38bdf8)" },
    { id: "fun3", em: "🔥", cap: "نار وشرار", bg: "linear-gradient(135deg,#c2410c,#f97316)" },
    { id: "fun4", em: "👑", cap: "ملك", bg: "linear-gradient(135deg,#a16207,#eab308)" },
    { id: "fun5", em: "👀", cap: "شنو السالفة", bg: "linear-gradient(135deg,#0f766e,#2dd4bf)" },
    { id: "std1", em: "📚", cap: "أدرس هسة", bg: "linear-gradient(135deg,#1e40af,#3b82f6)" },
    { id: "std2", em: "☕", cap: "وقت القهوة", bg: "linear-gradient(135deg,#78350f,#b45309)" },
    { id: "std3", em: "💯", cap: "عاشت إيدك", bg: "linear-gradient(135deg,#047857,#10b981)" },
    { id: "std4", em: "😴", cap: "نعست", bg: "linear-gradient(135deg,#334155,#64748b)" },
    { id: "std5", em: "🤫", cap: "سري للغاية", bg: "linear-gradient(135deg,#18181b,#52525b)" }
];

const GIF_CARDS = [
    { id: "g1", em: "🎬🔥", cap: "دخول أسطوري", bg: "linear-gradient(135deg,#ef4444,#f97316)" },
    { id: "g2", em: "🤣💀", cap: "متت من الضحك", bg: "linear-gradient(135deg,#eab308,#ca8a04)" },
    { id: "g3", em: "💖✨", cap: "أحلى شخص بالكون", bg: "linear-gradient(135deg,#ec4899,#8b5cf6)" },
    { id: "g4", em: "☕📖", cap: "جلسة سادس", bg: "linear-gradient(135deg,#0ea5e9,#2563eb)" },
    { id: "g5", em: "👏🏆", cap: "إنجاز عالمي", bg: "linear-gradient(135deg,#10b981,#0d9488)" },
    { id: "g6", em: "👀🍿", cap: "أتابع بصمت", bg: "linear-gradient(135deg,#4f46e5,#1e1b4b)" },
    { id: "g7", em: "😤💢", cap: "لا تعصبني!", bg: "linear-gradient(135deg,#b91c1c,#7f1d1d)" },
    { id: "g8", em: "🥺💐", cap: "آسف / آسفة", bg: "linear-gradient(135deg,#9333ea,#db2777)" },
    { id: "g9", em: "🌙💤", cap: "تصبح على خير", bg: "linear-gradient(135deg,#0f172a,#334155)" }
];

let activeDrawerTab = "emojis";
let emojiSearchQuery = "";
let customStickers = [];
let recentStickers = [];
try { customStickers = JSON.parse(localStorage.getItem("custom_stickers_v6") || "[]"); } catch { customStickers = []; }
try { recentStickers = JSON.parse(localStorage.getItem("recent_stickers_v6") || "[]"); } catch { recentStickers = []; }

function findStickerById(id) { return BUILTIN_STICKERS.find(s => s.id === id) || { em: "✨", cap: "ملصق", bg: GRADIENTS[0] }; }
function findGifById(id) { return GIF_CARDS.find(g => g.id === id) || { em: "✨", cap: "متحرك", bg: GRADIENTS[0] }; }
function initStickerDrawer() { renderDrawerContent(); }

function switchDrawerTab(tab) {
    activeDrawerTab = tab;
    document.querySelectorAll(".dbt-btn").forEach(b => b.classList.toggle("active", b.getAttribute("data-dtab") === tab));
    renderDrawerContent();
}

function insertEmojiToInput(em) {
    const inp = document.getElementById("msgInput"); if (!inp) return;
    const pos = inp.selectionStart || inp.value.length;
    inp.value = inp.value.slice(0, pos) + em + inp.value.slice(pos);
    handleMsgInputResize(inp); inp.focus();
}

function sendBuiltinSticker(st) {
    recentStickers = [st.id, ...recentStickers.filter(x => x !== st.id)].slice(0, 8);
    try { localStorage.setItem("recent_stickers_v6", JSON.stringify(recentStickers)); } catch {}
    pushMessageSafe("sticker", st.id, `${st.em} ${st.cap}`);
    toggleStickerDrawer(false);
}

async function handleCreateCustomSticker(e) {
    const f = e.target.files[0]; e.target.value = ""; if (!f) return;
    showToast("جاري إنشاء الملصق...");
    const dataUrl = await compressImageFile(f, 320, 0.76);
    customStickers.unshift({ id: "cs_" + Date.now(), src: dataUrl });
    customStickers = customStickers.slice(0, 16);
    try { localStorage.setItem("custom_stickers_v6", JSON.stringify(customStickers)); } catch {}
    renderDrawerContent(); showToast("تم حفظ الملصق بالمفضلة");
}

function deleteCustomSticker(id) {
    customStickers = customStickers.filter(s => s.id !== id);
    try { localStorage.setItem("custom_stickers_v6", JSON.stringify(customStickers)); } catch {}
    renderDrawerContent();
}

function renderDrawerContent() {
    const body = document.getElementById("drawerBody"); if (!body) return;

    if (activeDrawerTab === "emojis") {
        const q = emojiSearchQuery.trim();
        const filtered = q ? EMOJI_LIST.filter(x => x.k.includes(q) || x.em.includes(q)) : EMOJI_LIST;
        body.innerHTML = `
            <input type="text" class="emoji-search" placeholder="بحث عن رمز (مثال: حب، ضحك، نار)..." value="${escapeHTML(emojiSearchQuery)}" oninput="emojiSearchQuery=this.value; renderDrawerContent();">
            <div class="emoji-grid">${filtered.map(x => `<button type="button" class="emoji-cell" onclick="insertEmojiToInput('${x.em}')">${x.em}</button>`).join("")}</div>`;
        const inp = body.querySelector(".emoji-search");
        if (q && inp) { inp.focus(); inp.setSelectionRange(q.length, q.length); }
    } else if (activeDrawerTab === "gifs") {
        body.innerHTML = `
            <div class="st-sec-title">بطاقات تفاعلية خفيفة (تعمل حتى على أضعف نت)</div>
            <div class="gif-grid">${GIF_CARDS.map(g => `<div class="gif-card" style="background:${g.bg}" onclick="pushMessageSafe('gif_card','${g.id}','${escapeHTML(g.cap)}'); toggleStickerDrawer(false);"><span style="font-size:28px;">${g.em}</span><span>${escapeHTML(g.cap)}</span></div>`).join("")}</div>`;
    } else {
        let html = `<div class="st-sec-title">ملصقاتي المفضلة (اضغط + لإنشاء ملصق من أي صورة)</div><div class="sticker-grid">
            <div class="sticker-tile sticker-create-tile" onclick="document.getElementById('customStickerInput').click()"><span style="font-size:24px;">＋</span><span>إنشاء</span></div>`;
        customStickers.forEach(cs => {
            html += `<div class="sticker-tile" style="position:relative;" onclick="pushMessageSafe('img_sticker','${cs.src}','ملصق'); toggleStickerDrawer(false);"><img src="${cs.src}" loading="lazy"><button type="button" onclick="event.stopPropagation(); deleteCustomSticker('${cs.id}')" style="position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:50%; border:none; background:rgba(0,0,0,0.7); color:#fff; font-size:10px; cursor:pointer;">✕</button></div>`;
        });
        html += `</div>`;
        if (recentStickers.length > 0) {
            html += `<div class="st-sec-title">مستخدمة حديثاً</div><div class="sticker-grid">` +
                recentStickers.map(id => { const st = findStickerById(id); return `<div class="sticker-tile" onclick="sendBuiltinSticker(findStickerById('${st.id}'))"><span class="st-em">${st.em}</span><span class="st-cap">${escapeHTML(st.cap)}</span></div>`; }).join("") + `</div>`;
        }
        html += `<div class="st-sec-title">ملصقات المنصة</div><div class="sticker-grid">` +
            BUILTIN_STICKERS.map(st => `<div class="sticker-tile" onclick="sendBuiltinSticker(findStickerById('${st.id}'))"><span class="st-em">${st.em}</span><span class="st-cap">${escapeHTML(st.cap)}</span></div>`).join("") + `</div>`;
        body.innerHTML = html;
    }
}

function toggleStickerDrawer(force) {
    const d = document.getElementById("stickerDrawer");
    const show = typeof force === "boolean" ? force : d.style.display !== "flex";
    d.style.display = show ? "flex" : "none";
    const btn = document.getElementById("stickerBtn");
    if (btn) btn.classList.toggle("accent", show);
    if (show) { toggleMediaMenu(false); if (typeof toggleChatExtras === "function") toggleChatExtras(false); renderDrawerContent(); }
}

// لوحة المرفقات السفلية V12 (Native Bottom Sheet)
function toggleMediaMenu(force) {
    const m = document.getElementById("mediaMenu");
    if (!m) return;
    const show = typeof force === "boolean" ? force : !m.classList.contains("open");
    m.classList.toggle("open", show);
    if (show) {
        toggleStickerDrawer(false);
        if (typeof toggleChatExtras === "function") toggleChatExtras(false);
        if (typeof toggleChatToolsMenu === "function") toggleChatToolsMenu(false);
    }
}

// ==================== 4. الوسائط والبصمة والعرض لمرة واحدة ====================
async function handleSendImage(e, isViewOnce = false) {
    const f = e.target.files[0]; e.target.value = ""; if (!f) return;
    showToast(isViewOnce ? "جاري تجهيز العرض لمرة واحدة..." : "جاري ضغط وإرسال الصورة...");
    const dataUrl = await compressImageFile(f, 820, 0.70);
    if (isViewOnce) await pushMessageSafe("view_once", dataUrl, "صورة عرض لمرة واحدة", { voOpened: false });
    else await pushMessageSafe("image", dataUrl, "صورة");
}

let activeViewOnceMsgId = null;
function openViewOnce(msgId, imgSrc) {
    if (!imgSrc) return;
    activeViewOnceMsgId = msgId;
    document.getElementById("voImgDisplay").src = imgSrc;
    document.getElementById("viewOnceModal").style.display = "flex";
}

async function closeViewOnce() {
    document.getElementById("viewOnceModal").style.display = "none";
    document.getElementById("voImgDisplay").src = "";
    if (activeViewOnceMsgId && activeRoomId) {
        const targetId = activeViewOnceMsgId; activeViewOnceMsgId = null;
        await db.ref(`${getActiveRoomBasePath()}/${targetId}`).update({ voOpened: true, content: "" });
        showToast("تم حذف الصورة بعد العرض");
    }
}

function handleSendVideo(e) {
    const f = e.target.files[0]; e.target.value = ""; if (!f) return;
    if (f.size > 4.5 * 1024 * 1024) { showToast("الحد الأقصى للفيديو السريع 4.5 ميجابايت"); return; }
    showToast("جاري رفع الفيديو...");
    const r = new FileReader();
    r.onload = ev => pushMessageSafe("video", ev.target.result, "فيديو");
    r.readAsDataURL(f);
}

let mediaRec = null, recChunks = [], recStream = null, recSec = 0, recTimer = null, cancelRec = false;
async function startRecording() {
    stopAnyVoicePlayback();
    try {
        recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        let opts = { audioBitsPerSecond: 32000 };
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) opts.mimeType = "audio/webm;codecs=opus";
        else if (MediaRecorder.isTypeSupported("audio/mp4")) opts.mimeType = "audio/mp4";
        mediaRec = new MediaRecorder(recStream, opts);
        recChunks = []; cancelRec = false;
        mediaRec.ondataavailable = e => { if (e.data.size > 0) recChunks.push(e.data); };
        mediaRec.onstop = () => {
            recStream.getTracks().forEach(t => t.stop());
            if (cancelRec || recChunks.length === 0) return;
            const voiceFilter = document.getElementById("voiceFilterSel")?.value || "normal";
            const r = new FileReader();
            r.onloadend = () => pushMessageSafe("audio", r.result, "بصمة صوتية", { voiceFilter });
            r.readAsDataURL(new Blob(recChunks, { type: mediaRec.mimeType || "audio/webm" }));
        };
        mediaRec.start(); recSec = 0;
        document.getElementById("recTimerEl").innerText = "00:00";
        document.getElementById("inputNormalBar").style.display = "none";
        document.getElementById("inputRecordBar").style.display = "flex";
        recTimer = setInterval(() => {
            recSec++;
            document.getElementById("recTimerEl").innerText = `${String(Math.floor(recSec / 60)).padStart(2, "0")}:${String(recSec % 60).padStart(2, "0")}`;
        }, 1000);
    } catch { showToast("يرجى السماح بالوصول إلى المايكروفون"); }
}

function stopRecording(cancel) {
    cancelRec = cancel; clearInterval(recTimer);
    if (mediaRec && mediaRec.state !== "inactive") mediaRec.stop();
    document.getElementById("inputRecordBar").style.display = "none";
    document.getElementById("inputNormalBar").style.display = "flex";
}

function openLightbox(src) {
    document.getElementById("lightboxImg").src = src;
    document.getElementById("lightboxModal").style.display = "flex";
}

// ==================== 5. الاستطلاعات وتفاعلات القنوات ====================
function openCreatePollModal() {
    ["pollQuestion", "pollOpt1", "pollOpt2", "pollOpt3", "pollOpt4"].forEach(id => { document.getElementById(id).value = ""; });
    document.getElementById("createPollModal").style.display = "flex";
}

async function publishPoll() {
    const q = document.getElementById("pollQuestion").value.trim();
    const opts = [
        document.getElementById("pollOpt1").value.trim(),
        document.getElementById("pollOpt2").value.trim(),
        document.getElementById("pollOpt3").value.trim(),
        document.getElementById("pollOpt4").value.trim()
    ].filter(Boolean);
    if (!q || opts.length < 2) { showToast("اكتب السؤال وخيارين على الأقل"); return; }
    document.getElementById("createPollModal").style.display = "none";
    await pushMessageSafe("poll", q, `استطلاع: ${q}`, { poll: { question: q, options: opts, votes: {} } });
}

async function voteInPoll(msgId, optIndex) {
    if (!activeRoomId) return;
    await db.ref(`${getActiveRoomBasePath()}/${msgId}/poll/votes/${me.username}`).set(optIndex);
    playSendSound();
}

async function toggleChannelReaction(msgId, rKey, currentlyMine) {
    if (!activeRoomId) return;
    await db.ref(`space_msgs/${activeRoomId}/${msgId}/chReactions/${rKey}/${me.username}`).set(currentlyMine ? null : true);
    playSendSound();
}

// ==================== 6. الستوري ====================
let createStoryType = "text";

function getActiveStoriesFor(username) {
    const now = Date.now(), raw = allStories[username] || {};
    return Object.values(raw).filter(s => s.expiresAt > now).sort((a, b) => a.ts - b.ts);
}

function renderStoriesStrip() {
    const strip = document.getElementById("storiesStrip");
    if (!me || !strip) return;
    strip.innerHTML = "";

    const myActive = getActiveStoriesFor(me.username);
    const myEl = document.createElement("div"); myEl.className = "story-item";
    const myRing = document.createElement("div"); myRing.className = "story-ring " + (myActive.length > 0 ? "" : "add-ring");
    const myAv = document.createElement("div"); myAv.className = "avatar sm";
    setAvatarStyle(myAv, me, false);
    myRing.appendChild(myAv);
    const plus = document.createElement("div"); plus.className = "story-plus"; plus.innerText = "+";
    plus.onclick = e => { e.stopPropagation(); openCreateStoryModal(); };
    myRing.appendChild(plus); myEl.appendChild(myRing);
    const mySp = document.createElement("span"); mySp.innerText = "قصتي"; myEl.appendChild(mySp);
    myEl.onclick = () => myActive.length > 0 ? openUserStory(me.username) : openCreateStoryModal();
    strip.appendChild(myEl);

    Object.values(contactProfiles).filter(u => u && u.username !== me.username && !myBlocked[u.username]).forEach(u => {
        const list = getActiveStoriesFor(u.username); if (list.length === 0) return;
        const allSeen = list.every(s => s.viewers && s.viewers[me.username]);
        const el = document.createElement("div"); el.className = "story-item";
        el.onclick = () => openUserStory(u.username);
        const ring = document.createElement("div"); ring.className = "story-ring" + (allSeen ? " seen" : "");
        const av = document.createElement("div"); av.className = "avatar sm";
        setAvatarStyle(av, u, false);
        ring.appendChild(av); el.appendChild(ring);
        const sp = document.createElement("span"); sp.innerText = u.name; el.appendChild(sp);
        strip.appendChild(el);
    });
}

function openCreateStoryModal() {
    document.getElementById("storyTextContent").value = "";
    document.getElementById("storyImgFile").value = "";
    document.getElementById("storyImgCaption").value = "";
    document.getElementById("storyVidFile").value = "";
    document.getElementById("storyVidCaption").value = "";
    switchStoryType("text");
    document.getElementById("createStoryModal").style.display = "flex";
}

function switchStoryType(t) {
    createStoryType = t;
    document.getElementById("stTabText").classList.toggle("active", t === "text");
    document.getElementById("stTabImg").classList.toggle("active", t === "image");
    document.getElementById("stTabVid").classList.toggle("active", t === "video");
    document.getElementById("stTextForm").style.display = t === "text" ? "block" : "none";
    document.getElementById("stImgForm").style.display = t === "image" ? "block" : "none";
    document.getElementById("stVidForm").style.display = t === "video" ? "block" : "none";
}

async function publishStory() {
    const id = "st_" + Date.now();
    const payload = { id, ts: Date.now(), expiresAt: Date.now() + 86400000, bg: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)] };

    if (createStoryType === "text") {
        const txt = document.getElementById("storyTextContent").value.trim();
        if (!txt) { showToast("اكتب نص القصة أولاً"); return; }
        payload.type = "text"; payload.content = txt;
    } else if (createStoryType === "image") {
        const f = document.getElementById("storyImgFile").files[0];
        if (!f) { showToast("اختر صورة للقصة"); return; }
        showToast("جاري نشر قصة الصورة...");
        payload.type = "image"; payload.content = await compressImageFile(f, 820, 0.72);
        payload.caption = document.getElementById("storyImgCaption").value.trim();
    } else {
        const f = document.getElementById("storyVidFile").files[0];
        if (!f) { showToast("اختر فيديو للقصة"); return; }
        if (f.size > 4.5 * 1024 * 1024) { showToast("الحد الأقصى لفيديو الستوري 4.5 ميجابايت"); return; }
        showToast("جاري رفع فيديو القصة...");
        const dataUrl = await new Promise((res, rej) => { const r = new FileReader(); r.onload = ev => res(ev.target.result); r.onerror = rej; r.readAsDataURL(f); });
        payload.type = "video"; payload.content = dataUrl; payload.caption = document.getElementById("storyVidCaption").value.trim();
    }

    if (payload.type !== "video" && typeof window.__getDraftStorySong === "function") {
        const song = window.__getDraftStorySong();
        if (song && (song.url || song.ytId)) payload.music = song;
    }

    await db.ref(`stories/${me.username}/${id}`).set(payload);
    if (typeof window.__clearDraftStorySong === "function") window.__clearDraftStorySong();
    document.getElementById("createStoryModal").style.display = "none";
    showToast("تم نشر قصتك بنجاح");
}

let svOwner = null, svList = [], svIndex = 0, svTimer = null, svIsHighlight = false, svPaused = false, svActiveVideo = null;

function openUserStory(username) {
    const list = getActiveStoriesFor(username); if (list.length === 0) return;
    svOwner = username; svList = list; svIndex = 0; svIsHighlight = false; svPaused = false;
    document.getElementById("storyViewer").style.display = "flex";
    renderCurrentStorySlide();
}

function openHighlightViewer(ownerUsername, hlObj) {
    svOwner = ownerUsername; svList = hlObj.items || [hlObj]; svIndex = 0; svIsHighlight = true; svPaused = false;
    document.getElementById("storyViewer").style.display = "flex";
    renderCurrentStorySlide();
}

function renderCurrentStorySlide() {
    clearInterval(svTimer);
    if (svActiveVideo) { try { svActiveVideo.pause(); } catch {} svActiveVideo = null; }
    if (svIndex >= svList.length) { closeStoryViewer(); return; }

    const item = svList[svIndex];
    const liveItem = (!svIsHighlight && allStories[svOwner]?.[item.id]) ? allStories[svOwner][item.id] : item;
    const ownerObj = contactProfiles[svOwner] || (svOwner === me.username ? me : { name: svOwner });

    setAvatarStyle(document.getElementById("svAvatar"), ownerObj, false);
    document.getElementById("svName").innerHTML = `${renderStyledUserName(ownerObj)} ${getVerifiedBadgeHTML(ownerObj.verified)} ${getDevBadgeHTML(ownerObj)}`;
    document.getElementById("svTime").innerText = svIsHighlight ? "هايلايت" : formatTime(liveItem.ts);

    const isMine = svOwner === me.username && !svIsHighlight;
    document.getElementById("svDelBtn").style.display = isMine ? "inline-flex" : "none";
    document.getElementById("svSaveHlBtn").style.display = isMine ? "inline-flex" : "none";

    if (!svIsHighlight && svOwner !== me.username) {
        db.ref(`stories/${svOwner}/${liveItem.id}/viewers/${me.username}`).set({ name: me.name, tag: getDisplayTag(me), ts: Date.now() });
    }

    const bars = document.getElementById("svBars");
    bars.innerHTML = svList.map((_, i) => `<div class="sv-bar"><div class="sv-bar-fill" id="svFill_${i}" style="width:${i < svIndex ? 100 : 0}%"></div></div>`).join("");

    const stage = document.getElementById("svStage");
    if (liveItem.type === "video") {
        stage.style.background = "#000";
        stage.innerHTML = `<video id="svVidPlayer" src="${liveItem.content}" playsinline autoplay></video>${liveItem.caption ? `<div class="sv-caption">${escapeHTML(liveItem.caption)}</div>` : ""}`;
        const v = document.getElementById("svVidPlayer"); svActiveVideo = v;
        v.ontimeupdate = () => {
            if (svPaused || !v.duration) return;
            const el = document.getElementById("svFill_" + svIndex);
            if (el) el.style.width = Math.min(100, (v.currentTime / v.duration) * 100) + "%";
        };
        v.onended = () => { svIndex++; renderCurrentStorySlide(); };
        v.play().catch(() => {});
    } else if (liveItem.type === "image") {
        stage.style.background = "#000";
        stage.innerHTML = `<img src="${liveItem.content}">${liveItem.caption ? `<div class="sv-caption">${escapeHTML(liveItem.caption)}</div>` : ""}`;
    } else {
        stage.style.background = liveItem.bg || GRADIENTS[0];
        stage.innerHTML = `<div class="sv-text-box">${escapeHTML(liveItem.content || liveItem.caption || "")}</div>`;
    }

    const foot = document.getElementById("svFooter");
    if (isMine) {
        const vCnt = Object.keys(liveItem.viewers || {}).length, rCnt = Object.keys(liveItem.reactions || {}).length;
        foot.innerHTML = `<button class="btn btn-outline" style="max-width:280px; margin:0 auto;" onclick="event.stopPropagation(); openStoryViewersModal()">المشاهدات (${vCnt}) &nbsp;•&nbsp; التفاعلات (${rCnt})</button>`;
    } else if (!svIsHighlight) {
        foot.innerHTML = `
            <div class="sv-react-row">
                <button class="sv-react-btn" onclick="event.stopPropagation(); reactToStory('❤️')">❤️</button>
                <button class="sv-react-btn" onclick="event.stopPropagation(); reactToStory('🔥')">🔥</button>
                <button class="sv-react-btn" onclick="event.stopPropagation(); reactToStory('😍')">😍</button>
                <button class="sv-react-btn" onclick="event.stopPropagation(); reactToStory('😂')">😂</button>
                <button class="sv-react-btn" onclick="event.stopPropagation(); reactToStory('👏')">👏</button>
            </div>
            <div style="display:flex; gap:8px;">
                <input type="text" id="svReplyInp" class="input" placeholder="رد على القصة..." onfocus="pauseStoryMedia(true)" onblur="pauseStoryMedia(false)" onclick="event.stopPropagation()">
                <button class="btn btn-sm" onclick="event.stopPropagation(); replyToStory()">إرسال</button>
            </div>`;
    } else { foot.innerHTML = ""; }

    if (liveItem.type !== "video") {
        const m = liveItem.music;
        let durationSec = 7;
        if (m && (m.url || m.ytId)) {
            if (m.playFull) durationSec = m.durationSec || (m.ytId ? 45 : 29.5);
            else if (typeof m.startSec === "number" && typeof m.endSec === "number" && m.endSec > m.startSec) durationSec = Math.max(4, m.endSec - m.startSec);
            else durationSec = 15;
        }
        const totalTicks = Math.max(20, Math.round((durationSec * 1000) / 100));
        let tick = 0;
        svTimer = setInterval(() => {
            if (svPaused) return;
            if (m?.playFull && window.__storyAudioProgress && typeof window.__storyAudioProgress === "function") {
                const realPct = window.__storyAudioProgress();
                if (realPct !== null) {
                    const el = document.getElementById("svFill_" + svIndex);
                    if (el) el.style.width = Math.min(100, realPct) + "%";
                    if (realPct >= 99.5) { svIndex++; renderCurrentStorySlide(); }
                    return;
                }
            }
            tick++;
            const pct = (tick / totalTicks) * 100;
            const el = document.getElementById("svFill_" + svIndex);
            if (el) el.style.width = Math.min(100, pct) + "%";
            if (pct >= 100) { svIndex++; renderCurrentStorySlide(); }
        }, 100);
    }
}

function pauseStoryMedia(paused) {
    svPaused = paused;
    if (svActiveVideo) { if (paused) svActiveVideo.pause(); else svActiveVideo.play().catch(() => {}); }
}

function handleStoryTap(e) {
    if (e.target.closest(".sv-music-pill, .sv-yt-wrap")) return;
    if (e.clientX < window.innerWidth * 0.35) { svIndex++; renderCurrentStorySlide(); }
    else { svIndex = Math.max(0, svIndex - 1); renderCurrentStorySlide(); }
}

async function reactToStory(emoji) {
    const item = svList[svIndex]; if (!item || !svOwner || svOwner === me.username) return;
    await db.ref(`stories/${svOwner}/${item.id}/reactions/${me.username}`).set({ emoji, name: me.name, tag: getDisplayTag(me), ts: Date.now() });
    sendNotification(svOwner, `تفاعل ${me.name} بـ ${emoji} على قصتك`, emoji);
    playSendSound(); showToast(`تم إرسال تفاعل ${emoji}`);
}

async function replyToStory() {
    const inp = document.getElementById("svReplyInp"), txt = (inp?.value || "").trim();
    if (!txt || !svOwner) return;
    const rId = getRoomId(me.username, svOwner), mId = "m_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    const fullTxt = `رد على قصتك:\n${txt}`;
    const enc = await e2eEncrypt(rId, fullTxt);
    const encPrev = await e2eEncrypt(rId, "رد على القصة: " + txt);
    await db.ref(`chats/${rId}/messages/${mId}`).set({
        id: mId, sender: me.username, senderName: me.name, type: "text",
        content: enc.e2e ? "" : fullTxt, e2e: enc.e2e, encContent: enc.e2e ? enc.data : "", seen: false, ts: Date.now()
    });
    await db.ref(`chat_meta/${rId}`).set({
        lastMsg: encPrev.e2e ? "🔒 رسالة مشفّرة" : ("رد على القصة: " + txt),
        lastMsgEnc: encPrev.e2e ? encPrev.data : "", lastSender: me.username, lastTs: Date.now(), unreadFor: svOwner
    });
    sendNotification(svOwner, `ردّ ${me.name} على قصتك: "${txt.slice(0, 30)}"`, "💬");
    inp.value = ""; pauseStoryMedia(false); showToast("تم إرسال ردك للخاص");
}

function openStoryViewersModal() {
    pauseStoryMedia(true);
    const item = svList[svIndex], liveItem = allStories[svOwner]?.[item?.id] || item || {};
    const viewers = liveItem.viewers || {}, reacts = liveItem.reactions || {}, box = document.getElementById("storyViewersList");
    const allKeys = new Set([...Object.keys(viewers), ...Object.keys(reacts)]);
    if (allKeys.size === 0) {
        box.innerHTML = `<div style="text-align:center; padding:24px; color:var(--text-dim); font-size:13px;">لم يشاهد أحد هذه القصة بعد</div>`;
    } else {
        box.innerHTML = Array.from(allKeys).map(u => {
            const v = typeof viewers[u] === "object" ? viewers[u] : { name: contactProfiles[u]?.name || u, tag: "@" + u, ts: viewers[u] };
            const r = reacts[u], cleanTag = v.tag || r?.tag || ("@" + u);
            return `<div class="adm-row"><div><div style="font-weight:800; font-size:14px; display:flex; align-items:center; gap:6px; flex-wrap:wrap;"><span>${escapeHTML(v.name || r?.name || u)}</span><span class="handle-ltr" dir="ltr" style="font-size:12px;">${escapeHTML(cleanTag)}</span></div><div style="font-size:11px; color:var(--text-dim); margin-top:2px;">${v.ts ? "شاهدها الساعة " + formatTime(v.ts) : ""}</div></div><div style="font-size:20px;">${r?.emoji || "👁️"}</div></div>`;
        }).join("");
    }
    document.getElementById("storyViewersModal").style.display = "flex";
}

function closeStoryViewersModal() { document.getElementById("storyViewersModal").style.display = "none"; pauseStoryMedia(false); }

async function deleteCurrentStory() {
    const item = svList[svIndex]; if (!item || svOwner !== me.username) return;
    pauseStoryMedia(true);
    if (!confirm("هل تريد حذف هذه القصة نهائياً؟")) { pauseStoryMedia(false); return; }
    await db.ref(`stories/${me.username}/${item.id}`).remove();
    closeStoryViewer(); showToast("تم حذف القصة");
}

async function saveCurrentStoryToHighlight() {
    const item = svList[svIndex]; if (!item) return;
    pauseStoryMedia(true);
    const title = prompt("عنوان الهايلايت:", "ذكرياتي");
    pauseStoryMedia(false);
    if (!title) return;
    const hlId = "hl_" + Date.now();
    await db.ref(`highlights/${me.username}/${hlId}`).set({
        id: hlId, title: title.trim(), icon: item.type === "video" ? "🎬" : "✨",
        coverImg: item.type === "image" ? item.content : "", items: [item], ts: Date.now()
    });
    showToast("تم الحفظ بالهايلايت");
}

function closeStoryViewer() {
    clearInterval(svTimer);
    if (svActiveVideo) { try { svActiveVideo.pause(); } catch {} svActiveVideo = null; }
    document.getElementById("storyViewersModal").style.display = "none";
    document.getElementById("storyViewer").style.display = "none";
}

// ==================== 7. الهايلايت ====================
function openCreateHighlightModal() {
    document.getElementById("hlTitle").value = ""; document.getElementById("hlImgFile").value = ""; document.getElementById("hlCaption").value = "";
    document.getElementById("createHighlightModal").style.display = "flex";
}

async function publishHighlight() {
    const title = document.getElementById("hlTitle").value.trim(), icon = document.getElementById("hlIcon").value.trim() || "✨";
    const cap = document.getElementById("hlCaption").value.trim(), f = document.getElementById("hlImgFile").files[0];
    if (!title) { showToast("اكتب عنوان الهايلايت"); return; }
    let item = { type: "text", content: cap || title, bg: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)], ts: Date.now() }, coverImg = "";
    if (f) { coverImg = await compressImageFile(f, 800, 0.72); item = { type: "image", content: coverImg, caption: cap, ts: Date.now() }; }
    const id = "hl_" + Date.now();
    await db.ref(`highlights/${me.username}/${id}`).set({ id, title, icon, coverImg, items: [item], ts: Date.now() });
    document.getElementById("createHighlightModal").style.display = "none"; showToast("تمت إضافة الهايلايت");
}

// ==================== 8. المنشورات بأيقونات SVG نظيفة (V12 Signature) ====================
let activeCommentPostId = null;

function openCreatePostModal() {
    document.getElementById("postImgFile").value = ""; document.getElementById("postCaptionInput").value = "";
    document.getElementById("createPostModal").style.display = "flex";
}

async function publishPost() {
    const f = document.getElementById("postImgFile").files[0], cap = document.getElementById("postCaptionInput").value.trim();
    if (!f && !cap) { showToast("أضف صورة أو اكتب نصاً"); return; }
    const id = "p_" + Date.now();
    const payload = { id, author: me.username, caption: cap, ts: Date.now(), bg: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)] };
    if (f) { showToast("جاري نشر الصورة..."); payload.type = "image"; payload.content = await compressImageFile(f, 880, 0.74); }
    else { payload.type = "text"; payload.content = cap; }
    await db.ref(`posts/${id}`).set(payload);
    document.getElementById("createPostModal").style.display = "none"; showToast("تم نشر منشورك");
}

function buildIgPostCard(p) {
    const author = contactProfiles[p.author] || { username: p.author, name: p.author };
    const card = document.createElement("article"); card.className = "ig-post"; card.setAttribute("data-pid", p.id);

    const head = document.createElement("div"); head.className = "ig-head";
    head.innerHTML = `
        <div class="ig-author" onclick="openOtherProfile('${p.author}')">
            <div class="avatar sm" id="pa_${p.id}"></div>
            <div>
                <div style="font-weight:800; font-size:14px; display:flex; align-items:center; gap:3px; flex-wrap:wrap;">${renderStyledUserName(author)} ${getVerifiedBadgeHTML(author.verified)} ${getDevBadgeHTML(author)}</div>
                <div class="handle-ltr" dir="ltr" style="font-size:11.5px; color:var(--text-dim);">${escapeHTML(getDisplayTag(author))}</div>
            </div>
        </div>
        ${p.author === me.username ? `<button class="icon-btn danger" style="width:32px; height:32px;" title="حذف المنشور" onclick="deletePost('${p.id}')"><svg class="ic-xs" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>` : ""}`;
    card.appendChild(head); setAvatarStyle(head.querySelector(`#pa_${p.id}`), author, false);

    const media = document.createElement("div"); media.className = "ig-media";
    if (p.type === "image") media.innerHTML = `<img src="${p.content}" loading="lazy" decoding="async"><div class="ig-heart-pop">❤️</div>`;
    else media.innerHTML = `<div class="ig-text-canvas" style="background:${p.bg || GRADIENTS[0]}">${escapeHTML(p.content)}</div><div class="ig-heart-pop">❤️</div>`;

    let lastTap = 0;
    media.addEventListener("click", ev => {
        const t = Date.now();
        if (t - lastTap < 300) {
            const hp = media.querySelector(".ig-heart-pop");
            if (hp) { hp.classList.remove("boom"); void hp.offsetWidth; hp.classList.add("boom"); }
            spawnSparks(ev.clientX, ev.clientY); triggerHaptic(14);
            const liveP = allPosts[p.id] || p;
            if (!(liveP.likes && liveP.likes[me.username])) togglePostLike(p.id, false);
        } else if (p.type === "image") {
            setTimeout(() => { if (Date.now() - lastTap >= 300) openLightbox(p.content); }, 310);
        }
        lastTap = t;
    });
    card.appendChild(media);

    const bodySlot = document.createElement("div"); bodySlot.className = "ig-dynamic-body";
    card.appendChild(bodySlot); fillIgDynamicBody(bodySlot, p, author);
    return card;
}

function fillIgDynamicBody(slot, p, author) {
    const likesObj = p.likes || {}, likeCount = Object.keys(likesObj).length, likedByMe = !!likesObj[me.username];
    const comms = Object.values(p.comments || {}).sort((a, b) => a.ts - b.ts);
    const heartSvg = likedByMe
        ? `<svg width="21" height="21" viewBox="0 0 24 24" fill="#f43f5e" stroke="#f43f5e" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
        : `<svg class="ic" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    const commSvg = `<svg class="ic" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
    const saveSvg = `<svg class="ic" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;

    slot.innerHTML = `
        <div class="ig-actions">
            <div class="ig-act-left">
                <button class="ig-act-btn ${likedByMe ? 'liked' : ''}" onclick="togglePostLike('${p.id}', ${likedByMe}, event)">${heartSvg} <span>${likeCount}</span></button>
                <button class="ig-act-btn" onclick="openCommentsModal('${p.id}')">${commSvg} <span>${comms.length}</span></button>
            </div>
            <button class="ig-act-btn" title="حفظ بالمحفوظة" onclick="savePostToSaved('${p.id}')">${saveSvg}</button>
        </div>
        ${likeCount > 0 ? `<div class="ig-likes-line" onclick="openPostLikesModal('${p.id}')">${likeCount} إعجاب • عرض المتفاعلين</div>` : ""}
        ${(p.type === "image" && p.caption) ? `<div class="ig-caption"><strong>${escapeHTML(author.name)}</strong> ${escapeHTML(p.caption)}</div>` : ""}
        ${comms.length > 0 ? `<div class="ig-comments-preview" onclick="openCommentsModal('${p.id}')">${comms.slice(-2).map(c => `<div><strong style="color:var(--text);">${escapeHTML(c.authorName || c.author)}</strong> ${escapeHTML(c.text)}</div>`).join("")}${comms.length > 2 ? `<div style="color:var(--accent); margin-top:3px; font-weight:700;">عرض جميع التعليقات (${comms.length})</div>` : ""}</div>` : ""}
        <div class="ig-time">${formatDateLabel(p.ts)} • ${formatTime(p.ts)}</div>`;
}

function syncFeedPostCard(pid, p) {
    const cont = document.getElementById("feedContainer"); if (!cont || !me) return;
    const allowedAuthors = new Set([me.username, ...Object.keys(myContacts)]);
    if (!allowedAuthors.has(p.author) || myBlocked[p.author]) return;
    if (cont.querySelector(`.ig-post[data-pid="${pid}"]`)) return;
    const empty = cont.querySelector(".feed-empty"); if (empty) empty.remove();
    cont.insertBefore(buildIgPostCard(p), cont.firstChild);
}

function updatePostCardInPlace(pid, p) {
    const card = document.querySelector(`.ig-post[data-pid="${pid}"]`); if (!card) return;
    const slot = card.querySelector(".ig-dynamic-body"), author = contactProfiles[p.author] || { username: p.author, name: p.author };
    if (slot) fillIgDynamicBody(slot, p, author);
}

function renderFeed() {
    const cont = document.getElementById("feedContainer"); if (!me || !cont) return;
    const allowedAuthors = new Set([me.username, ...Object.keys(myContacts)]);
    const posts = Object.values(allPosts).filter(p => allowedAuthors.has(p.author) && !myBlocked[p.author]).sort((a, b) => b.ts - a.ts);
    cont.innerHTML = "";
    if (posts.length === 0) {
        cont.innerHTML = `<div class="feed-empty" style="margin:auto; text-align:center; color:var(--text-dim); padding:40px;">لا توجد منشورات بعد.<br><br><button class="btn btn-sm" onclick="openCreatePostModal()">+ انشر أول منشور</button></div>`;
        return;
    }
    posts.forEach(p => cont.appendChild(buildIgPostCard(p)));
}

async function savePostToSaved(postId) {
    const p = allPosts[postId]; if (!p) return;
    const mId = "m_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    await db.ref(`saved_msgs/${me.username}/${mId}`).set({
        id: mId, sender: me.username, senderName: me.name, type: p.type === "image" ? "image" : "text", content: p.content, seen: true, ts: Date.now()
    });
    showToast("تم حفظ المنشور في الرسائل المحفوظة");
}

async function togglePostLike(postId, currentlyLiked, ev) {
    const p = allPosts[postId]; if (!p) return;
    if (currentlyLiked) {
        await db.ref(`posts/${postId}/likes/${me.username}`).remove();
    } else {
        if (ev && ev.clientX) spawnSparks(ev.clientX, ev.clientY);
        triggerHaptic(12);
        await db.ref(`posts/${postId}/likes/${me.username}`).set({ name: me.name, tag: getDisplayTag(me), ts: Date.now() });
        sendNotification(p.author, `أُعجب ${me.name} بمنشورك`, "❤️");
        playSendSound();
    }
}

function openPostLikesModal(postId) {
    const p = allPosts[postId], likes = p?.likes || {}, box = document.getElementById("postLikesList"), entries = Object.entries(likes);
    box.innerHTML = entries.length === 0
        ? `<div style="text-align:center; padding:20px; color:var(--text-dim);">لا توجد إعجابات بعد</div>`
        : entries.map(([u, d]) => {
            const name = typeof d === "object" ? d.name : (contactProfiles[u]?.name || u), tag = typeof d === "object" ? d.tag : ("@" + u);
            return `<div class="adm-row" onclick="document.getElementById('postLikesModal').style.display='none'; openOtherProfile('${u}')" style="cursor:pointer;"><div style="display:flex; align-items:center; gap:6px;"><strong>${escapeHTML(name)}</strong><span class="handle-ltr" dir="ltr" style="font-size:12px;">${escapeHTML(tag)}</span></div><span>❤️</span></div>`;
        }).join("");
    document.getElementById("postLikesModal").style.display = "flex";
}

async function deletePost(postId) {
    if (!confirm("حذف هذا المنشور نهائياً؟")) return;
    await db.ref(`posts/${postId}`).remove(); showToast("تم حذف المنشور");
}

function openCommentsModal(postId) {
    activeCommentPostId = postId; document.getElementById("commentInput").value = "";
    renderCommentsList(); document.getElementById("commentsModal").style.display = "flex";
}

function renderCommentsList() {
    const box = document.getElementById("commentsList"), p = allPosts[activeCommentPostId];
    const comms = Object.values(p?.comments || {}).sort((a, b) => a.ts - b.ts);
    box.innerHTML = comms.length === 0
        ? `<div style="text-align:center; color:var(--text-dim); padding:20px; font-size:13px;">لا توجد تعليقات بعد</div>`
        : comms.map(c => `<div style="background:var(--glass-inner); padding:10px 12px; border-radius:14px; margin-bottom:8px; border:1px solid var(--border);"><div style="font-size:12px; font-weight:800; color:var(--accent);">${escapeHTML(c.authorName || c.author)} <span style="color:var(--text-dim); font-weight:400;">• ${formatTime(c.ts)}</span></div><div style="font-size:13.5px; margin-top:3px; line-height:1.5;">${escapeHTML(c.text)}</div></div>`).join("");
}

async function submitComment() {
    const inp = document.getElementById("commentInput"), txt = inp.value.trim();
    if (!txt || !activeCommentPostId) return;
    inp.value = "";
    const p = allPosts[activeCommentPostId];
    await db.ref(`posts/${activeCommentPostId}/comments`).push({ author: me.username, authorName: me.name, text: txt, ts: Date.now() });
    if (p) sendNotification(p.author, `علّق ${me.name} على منشورك: "${txt.slice(0, 35)}"`, "💬");
    renderCommentsList();
}

// ==================== 9. القنوات والمجموعات ====================
let createSpaceType = "channel";

function openCreateSpaceModal() {
    document.getElementById("spName").value = ""; document.getElementById("spHandle").value = ""; document.getElementById("spDesc").value = "";
    document.getElementById("createSpaceModal").style.display = "flex";
}

function switchSpaceCreateType(t) {
    createSpaceType = t;
    document.getElementById("spTabCh").classList.toggle("active", t === "channel");
    document.getElementById("spTabGrp").classList.toggle("active", t === "group");
}

async function createSpace() {
    const name = document.getElementById("spName").value.trim();
    const handle = sanitizeKey(document.getElementById("spHandle").value.replace(/^@/, ""));
    const desc = document.getElementById("spDesc").value.trim() || "مساحة خاصة";
    if (name.length < 2 || handle.length < 3) { showToast("اكتب الاسم ويوزراً من 3 أحرف إنجليزية على الأقل"); return; }
    if (await isHandleTakenAnywhere(handle)) { showToast("هذا اليوزر محجوز لحساب شخصي أو مساحة أخرى!"); return; }

    const id = "sp_" + Date.now();
    const obj = {
        id, type: createSpaceType, name, handle, desc,
        avatarColor: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
        owner: me.username, verified: "", createdAt: Date.now(), lastTs: Date.now(), members: { [me.username]: "owner" }
    };
    await db.ref(`spaces/${id}`).set(obj);
    document.getElementById("createSpaceModal").style.display = "none";
    showToast(createSpaceType === "channel" ? "تم إنشاء القناة" : "تم إنشاء المجموعة");
    openSpaceRoom(id);
}

async function joinAndOpenSpace(spaceId) {
    await db.ref(`spaces/${spaceId}/members/${me.username}`).set("member");
    showToast("تم الانضمام بنجاح"); openSpaceRoom(spaceId);
}

function renderSpacesList() {
    const box = document.getElementById("spacesListEl"); if (!me || !box) return;
    const mySpaces = Object.values(allSpaces).filter(s => s && s.members && s.members[me.username]).sort((a, b) => (b.lastTs || b.createdAt || 0) - (a.lastTs || a.createdAt || 0));
    box.innerHTML = "";
    if (mySpaces.length === 0) {
        box.innerHTML = `<div style="text-align:center; padding:28px 16px; color:var(--text-dim); font-size:13px;">لم تنضم لأي قناة أو مجموعة بعد.<br><br><button class="btn btn-sm" onclick="openCreateSpaceModal()">+ إنشاء قناة أو مجموعة</button></div>`;
        return;
    }
    mySpaces.forEach(s => {
        const row = document.createElement("div"); row.className = "chat-row"; row.onclick = () => openSpaceRoom(s.id);
        const av = document.createElement("div"); av.className = "avatar"; setAvatarStyle(av, { name: s.name, avatarColor: s.avatarColor }, false);
        const cnt = Object.keys(s.members || {}).length, info = document.createElement("div"); info.className = "chat-row-info";
        info.innerHTML = `<div class="chat-row-top"><span class="chat-row-name">${escapeHTML(s.name)} ${getVerifiedBadgeHTML(s.verified)} <span class="space-badge ${s.type === 'group' ? 'grp' : ''}">${s.type === 'channel' ? 'قناة' : 'مجموعة'}</span></span></div><div class="chat-row-bottom"><span class="chat-row-preview"><span class="handle-ltr" dir="ltr" style="font-size:12px;">@${escapeHTML(s.handle)}</span> • ${cnt} مشترك</span></div>`;
        row.appendChild(av); row.appendChild(info); box.appendChild(row);
    });
}

function openSpaceInfoModal() {
    if (!activeSpaceObj) return;
    setAvatarStyle(document.getElementById("siAvatar"), { name: activeSpaceObj.name, avatarColor: activeSpaceObj.avatarColor }, false);
    document.getElementById("siName").innerHTML = `${escapeHTML(activeSpaceObj.name)} ${getVerifiedBadgeHTML(activeSpaceObj.verified)}`;
    document.getElementById("siHandle").innerText = "@" + activeSpaceObj.handle;
    document.getElementById("siDesc").innerText = activeSpaceObj.desc || "";
    const isOwner = activeSpaceObj.owner === me.username;
    document.getElementById("siOwnerControls").style.display = isOwner ? "block" : "none";
    document.getElementById("siReqVerifyBtn").style.display = (isOwner && !activeSpaceObj.verified) ? "inline-flex" : "none";
    const mems = Object.entries(activeSpaceObj.members || {});
    document.getElementById("siCount").innerText = mems.length;
    document.getElementById("siMembersList").innerHTML = mems.map(([u, role]) => `<div style="display:flex; justify-content:space-between; align-items:center; padding:6px 4px; font-size:13px; border-bottom:1px solid var(--border);"><span><span class="handle-ltr" dir="ltr" style="font-size:13px;">@${escapeHTML(u)}</span> ${role === 'owner' ? '👑' : ''}</span>${isOwner && u !== me.username ? `<button class="btn btn-danger btn-sm" style="padding:2px 8px;" onclick="kickFromSpace('${u}')">طرد</button>` : ""}</div>`).join("");
    document.getElementById("spaceInfoModal").style.display = "flex";
}

async function addMemberToActiveSpace() {
    const u = sanitizeKey(document.getElementById("siAddUser").value.replace(/^@/, "")); if (!u || !activeSpaceObj) return;
    const snap = await db.ref("users/" + u).once("value");
    if (!snap.exists()) { showToast("الحساب غير موجود"); return; }
    await db.ref(`spaces/${activeSpaceObj.id}/members/${u}`).set("member");
    document.getElementById("siAddUser").value = ""; showToast(`تمت إضافة @${u}`); openSpaceInfoModal();
}

async function requestSpaceVerify() {
    if (!activeSpaceObj || activeSpaceObj.owner !== me.username) return;
    const reason = prompt("ملاحظة طلب توثيق القناة/المجموعة:", "قناة رسمية نشطة"); if (!reason) return;
    await db.ref(`verify_requests/sp_${activeSpaceObj.id}`).set({ targetType: "space", targetId: activeSpaceObj.id, name: activeSpaceObj.name, displayTag: activeSpaceObj.handle, requestedType: "blue", reason: reason.trim(), ts: Date.now() });
    showToast("تم إرسال طلب توثيق القناة للمطور");
}

async function kickFromSpace(u) { if (!activeSpaceObj) return; await db.ref(`spaces/${activeSpaceObj.id}/members/${u}`).remove(); showToast(`تم طرد @${u}`); openSpaceInfoModal(); }

async function leaveActiveSpace() {
    if (!activeSpaceObj || !confirm("هل تريد المغادرة؟")) return;
    await db.ref(`spaces/${activeSpaceObj.id}/members/${me.username}`).remove();
    document.getElementById("spaceInfoModal").style.display = "none"; closeActiveChat(); showToast("تمت المغادرة");
}

// ==================== 10. الهدايا التذكارية + البروفايل الكامل بملء الشاشة ====================
const GIFT_CATALOG = [
    { id: "rose",    em: "🌹", label: "وردة جوري" },
    { id: "crown",   em: "👑", label: "تاج ملكي" },
    { id: "diamond", em: "💎", label: "قلب ألماس" },
    { id: "tea",     em: "☕", label: "كوب چاي" },
    { id: "star",    em: "⭐", label: "نجمة سادس" },
    { id: "butter",  em: "🦋", label: "فراشة" },
    { id: "choco",   em: "🍫", label: "شوكولاتة" },
    { id: "fire",    em: "🔥", label: "شعلة فخامة" },
    { id: "bear",    em: "🧸", label: "دبدوب لطيف" }
];

let giftTargetUsername = "";
let selectedGiftId = "rose";

function openSendGiftModal(targetUsername) {
    if (!targetUsername || targetUsername === me?.username) return;
    giftTargetUsername = targetUsername;
    selectedGiftId = "rose";
    const u = contactProfiles[targetUsername] || { name: targetUsername };
    document.getElementById("giftTargetName").innerText = u.name || targetUsername;
    document.getElementById("giftMessageInp").value = "";
    renderGiftPickerGrid();
    document.getElementById("sendGiftModal").style.display = "flex";
}

function renderGiftPickerGrid() {
    const grid = document.getElementById("giftPickerGrid"); if (!grid) return;
    grid.innerHTML = GIFT_CATALOG.map(g => `
        <div class="gift-pick-tile ${selectedGiftId === g.id ? 'active' : ''}" onclick="selectedGiftId='${g.id}'; renderGiftPickerGrid();">
            <span class="gp-em">${g.em}</span>
            <span class="gp-lbl">${g.label}</span>
        </div>`).join("");
}

async function confirmSendGift() {
    if (!giftTargetUsername || !me) return;
    const gObj = GIFT_CATALOG.find(g => g.id === selectedGiftId) || GIFT_CATALOG[0];
    const msg = (document.getElementById("giftMessageInp")?.value || "").trim();
    const gId = "g_" + Date.now() + "_" + Math.random().toString(36).slice(2, 5);
    const payload = { id: gId, giftId: gObj.id, em: gObj.em, label: gObj.label, from: me.username, fromName: me.name, msg, ts: Date.now() };
    await db.ref(`gifts/${giftTargetUsername}/${gId}`).set(payload);
    sendNotification(giftTargetUsername, `أهداك ${me.name} ${gObj.em} (${gObj.label})${msg ? `: "${msg.slice(0, 30)}"` : ""}`, gObj.em);
    document.getElementById("sendGiftModal").style.display = "none";
    if (window.playScreenEffect) window.playScreenEffect("confetti");
    playSendSound();
    showToast(`تم إرسال ${gObj.em} ${gObj.label} بنجاح`);
    if (activeOtherProfileUser === giftTargetUsername) {
        otherProfileDataCache.gifts[gId] = payload;
        renderOtherProfileStatsAndTab();
    }
}

function buildGiftsHTML(giftsObj, emptyMsg) {
    const list = Object.values(giftsObj || {}).sort((a, b) => (b.ts || 0) - (a.ts || 0));
    if (!list.length) return `<div style="font-size:12px; color:var(--text-dim); padding:10px 4px;">${emptyMsg}</div>`;
    return list.map(g => `
        <div class="gift-card">
            <span class="g-em">${g.em || "🎁"}</span>
            <span class="g-from">من ${escapeHTML(g.fromName || g.from)}</span>
            ${g.msg ? `<div class="g-msg">«${escapeHTML(g.msg)}»</div>` : `<div class="g-msg">${escapeHTML(g.label || "")}</div>`}
        </div>`).join("");
}

let tempAvatarBase64 = null;

async function handleCoverUpload(e) {
    const f = e.target.files[0]; e.target.value = ""; if (!f || !me) return;
    showToast("جاري رفع الغلاف الشخصي...");
    const dataUrl = await compressImageFile(f, 920, 0.72);
    await db.ref(`users/${me.username}/coverImg`).set(dataUrl);
    me.coverImg = dataUrl;
    renderMyProfilePage();
    showToast("تم تحديث غلاف البروفايل");
}

function renderMyProfilePage() {
    if (!me) return;
    const cov = document.getElementById("myProfCover");
    if (cov) {
        if (me.coverImg) { cov.style.backgroundImage = `url(${me.coverImg})`; cov.style.backgroundSize = "cover"; }
        else { cov.style.backgroundImage = ""; }
    }
    setAvatarStyle(document.getElementById("myProfAvatar"), me, false);
    document.getElementById("myProfName").innerHTML = `${renderStyledUserName(me)} ${getVerifiedBadgeHTML(me.verified)} ${getDevBadgeHTML(me)}`;
    document.getElementById("myProfTag").innerText = getDisplayTag(me);
    document.getElementById("myProfBio").innerText = me.bio || "لا توجد نبذة بعد";

    const myPosts = Object.values(allPosts).filter(p => p.author === me.username).sort((a, b) => b.ts - a.ts);
    document.getElementById("stMyPosts").innerText = myPosts.length;
    document.getElementById("stMyFriends").innerText = Object.keys(myContacts).length;
    const gStat = document.getElementById("stMyGifts");
    if (gStat) gStat.innerText = Object.keys(myGifts || {}).length;

    const hlRow = document.getElementById("myHighlightsRow");
    hlRow.innerHTML = `<div class="hl-item" onclick="openCreateHighlightModal()"><div class="hl-circle" style="border-style:dashed;">+</div><span>جديد</span></div>`;
    Object.values(myHighlights).sort((a, b) => b.ts - a.ts).forEach(hl => {
        const el = document.createElement("div"); el.className = "hl-item"; el.onclick = () => openHighlightViewer(me.username, hl);
        const c = document.createElement("div"); c.className = "hl-circle";
        if (hl.coverImg) c.style.backgroundImage = `url(${hl.coverImg})`; else c.innerText = hl.icon || "✨";
        el.appendChild(c); const s = document.createElement("span"); s.innerText = hl.title; el.appendChild(s); hlRow.appendChild(el);
    });

    const gRow = document.getElementById("myGiftsRow");
    if (gRow) gRow.innerHTML = buildGiftsHTML(myGifts, "لم تصلك هدايا بعد — الهدايا التذكارية من أصدقائك تظهر هنا");

    const grid = document.getElementById("myPostsGrid"); grid.innerHTML = "";
    if (myPosts.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:25px; color:var(--text-dim); font-size:13px;">لم تنشر أي منشور بعد</div>`;
    } else {
        myPosts.forEach(p => {
            const tile = document.createElement("div"); tile.className = "grid-tile";
            if (p.type === "image") { tile.innerHTML = `<img src="${p.content}" loading="lazy">`; tile.onclick = () => openSinglePostPreview(p.id); }
            else { tile.style.background = p.bg || GRADIENTS[0]; tile.innerText = p.content.slice(0, 45); tile.onclick = () => openSinglePostPreview(p.id); }
            grid.appendChild(tile);
        });
    }
}

let activeOtherProfileUser = "";
let activeOtherProfileTab = "posts";
let prevTabBeforeOtherProfile = "chats";
let otherProfileDataCache = { user: null, highlights: {}, gifts: {}, sharedMedia: [] };
let opParallaxBound = false;

function bindOtherProfileParallax() {
    if (opParallaxBound) return;
    const scroller = document.getElementById("otherProfileScroll");
    if (!scroller) return;
    opParallaxBound = true;
    scroller.addEventListener("scroll", () => {
        const y = scroller.scrollTop;
        const bar = document.getElementById("opStickyBar");
        const cov = document.getElementById("opCover");
        if (bar) bar.classList.toggle("scrolled", y > 88);
        if (cov) cov.style.transform = y > 0 ? `translateY(${Math.min(y * 0.35, 65)}px)` : "";
    }, { passive: true });
}

function toggleOpMoreMenu(force) {
    const dd = document.getElementById("opMoreDropdown"); if (!dd) return;
    const show = typeof force === "boolean" ? force : !dd.classList.contains("open");
    dd.classList.toggle("open", show);
}

function closeOtherProfilePage() {
    toggleOpMoreMenu(false);
    if (typeof window.__stopOtherProfileSong === "function") window.__stopOtherProfileSong();
    activeOtherProfileUser = "";
    switchMainTab(prevTabBeforeOtherProfile || "chats");
}

function paintOtherProfileHeader(u) {
    if (!u) return;
    const cov = document.getElementById("opCover");
    if (cov) {
        if (u.coverImg) { cov.style.background = ""; cov.style.backgroundImage = `url(${u.coverImg})`; cov.style.backgroundSize = "cover"; }
        else { cov.style.backgroundImage = ""; cov.style.background = "var(--primary-grad)"; }
    }
    setAvatarStyle(document.getElementById("opAvatar"), u, true);
    document.getElementById("opAvatar").onclick = () => {
        if (getActiveStoriesFor(u.username).length > 0) openUserStory(u.username);
        else if (u.avatarImg) openLightbox(u.avatarImg);
    };
    document.getElementById("opStickyName").innerText = u.name || u.username;
    document.getElementById("opName").innerHTML = `${renderStyledUserName(u)} ${getVerifiedBadgeHTML(u.verified)} ${getDevBadgeHTML(u)}`;
    document.getElementById("opTag").innerText = getDisplayTag(u);

    const pres = document.getElementById("opPresence");
    if (pres) {
        if (u.moodText) pres.innerText = "• " + u.moodText + (u.online ? " (متصل)" : "");
        else if (u.online) { pres.innerText = "● متصل الآن"; pres.style.color = "var(--success)"; }
        else { pres.innerText = u.lastSeen ? `• آخر ظهور ${formatTime(u.lastSeen)}` : ""; pres.style.color = "var(--text-dim)"; }
    }
    document.getElementById("opBio").innerText = u.bio || "لا توجد نبذة بعد";

    document.getElementById("opMsgBtn").onclick = () => { addAndOpenContact(u.username); };
    document.getElementById("opCallBtn").onclick = () => { startCall(false, u.username); };
    document.getElementById("opVidBtn").onclick = () => { startCall(true, u.username); };
    document.getElementById("opHbBtn").onclick = async () => {
        if (typeof window.sendLiveHeartbeatTo === "function") window.sendLiveHeartbeatTo(u.username);
        else {
            await db.ref(`heartbeats/${u.username}`).set({ from: me.username, fromName: me.name, ts: Date.now() });
            triggerHaptic([60, 50, 90]);
            if (window.playScreenEffect) window.playScreenEffect("hearts");
            showToast(`أرسلت نبضة حية إلى ${u.name}`);
        }
    };
    document.getElementById("opGiftBtn").onclick = () => { openSendGiftModal(u.username); };

    const bBtn = document.getElementById("opBlockBtn");
    bBtn.innerText = myBlocked[u.username] ? "إلغاء الحظر" : "حظر المستخدم";
    bBtn.onclick = () => { toggleOpMoreMenu(false); toggleBlockUser(u.username, false); paintOtherProfileHeader(u); };
    document.getElementById("opReportBtn").onclick = () => { toggleOpMoreMenu(false); reportUser(u.username); };
}

function renderOtherProfileStatsAndTab() {
    const u = otherProfileDataCache.user; if (!u) return;
    const uPosts = Object.values(allPosts).filter(p => p.author === u.username).sort((a, b) => b.ts - a.ts);
    document.getElementById("opStPosts").innerText = uPosts.length;
    document.getElementById("opStMedia").innerText = otherProfileDataCache.sharedMedia.length;
    document.getElementById("opStGifts").innerText = Object.keys(otherProfileDataCache.gifts || {}).length;
    switchOtherProfileTab(activeOtherProfileTab);
}

function switchOtherProfileTab(tab) {
    activeOtherProfileTab = tab;
    document.querySelectorAll("#opTabsBar .op-tab").forEach(b => b.classList.toggle("active", b.getAttribute("data-optab") === tab));
    const box = document.getElementById("opTabContent"), u = otherProfileDataCache.user;
    if (!box || !u) return;

    if (tab === "posts") {
        const uPosts = Object.values(allPosts).filter(p => p.author === u.username).sort((a, b) => b.ts - a.ts);
        if (!uPosts.length) { box.innerHTML = `<div style="text-align:center; padding:28px; color:var(--text-dim); font-size:13px;">لا توجد منشورات بعد</div>`; return; }
        box.innerHTML = `<div class="posts-grid stagger-grid" id="opDynPostsGrid"></div>`;
        const grid = document.getElementById("opDynPostsGrid");
        uPosts.forEach(p => {
            const tile = document.createElement("div"); tile.className = "grid-tile";
            if (p.type === "image") tile.innerHTML = `<img src="${p.content}" loading="lazy" decoding="async">`;
            else { tile.style.background = p.bg || GRADIENTS[0]; tile.innerText = p.content.slice(0, 42); }
            tile.onclick = () => openSinglePostPreview(p.id);
            grid.appendChild(tile);
        });
    } else if (tab === "highlights") {
        const hls = Object.values(otherProfileDataCache.highlights || {}).sort((a, b) => (b.ts || 0) - (a.ts || 0));
        if (!hls.length) { box.innerHTML = `<div style="text-align:center; padding:28px; color:var(--text-dim); font-size:13px;">لا يوجد هايلايت محفوظ</div>`; return; }
        box.innerHTML = `<div class="highlights-row" id="opDynHlRow"></div>`;
        const row = document.getElementById("opDynHlRow");
        hls.forEach(hl => {
            const el = document.createElement("div"); el.className = "hl-item"; el.onclick = () => openHighlightViewer(u.username, hl);
            const c = document.createElement("div"); c.className = "hl-circle";
            if (hl.coverImg) c.style.backgroundImage = `url(${hl.coverImg})`; else c.innerText = hl.icon || "✨";
            el.appendChild(c); const sp = document.createElement("span"); sp.innerText = hl.title; el.appendChild(sp); row.appendChild(el);
        });
    } else if (tab === "shared") {
        const list = otherProfileDataCache.sharedMedia || [];
        if (!list.length) { box.innerHTML = `<div style="text-align:center; padding:28px; color:var(--text-dim); font-size:13px;">لا توجد صور أو فيديوهات مشتركة بينكما بعد</div>`; return; }
        const visual = list.filter(m => m.type === "image" || m.type === "video");
        const auds = list.filter(m => m.type === "audio");
        let html = "";
        if (visual.length) {
            html += `<div class="mg-grid" style="margin-bottom:10px;">` + visual.map(m =>
                m.type === "image"
                    ? `<div class="mg-tile" onclick="openLightbox('${m.content}')"><img src="${m.content}" loading="lazy" decoding="async"></div>`
                    : `<div class="mg-tile" onclick="openFullVideoModal('${m.content}')"><video src="${m.content}" preload="metadata" muted></video><span class="cvp-badge">▶</span></div>`
            ).join("") + `</div>`;
        }
        box.innerHTML = html;
        auds.slice(0, 8).forEach(m => {
            const row = document.createElement("div"); row.className = "mg-audio-row";
            row.innerHTML = `<div style="font-size:11px; color:var(--accent); font-weight:700; margin-bottom:4px;">${escapeHTML(m.senderName || m.sender)} • ${formatTime(m.ts)}</div>`;
            row.appendChild(buildVoicePlayer(m.content, m.id, m.voiceFilter));
            box.appendChild(row);
        });
    } else if (tab === "gifts") {
        const giftsHTML = buildGiftsHTML(otherProfileDataCache.gifts, "لا توجد هدايا بعد — كن أول من يهديه هدية لطيفة");
        box.innerHTML = `<div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">${giftsHTML}</div>
            <button class="btn btn-gold btn-sm" style="width:100%; margin-top:12px;" onclick="openSendGiftModal('${u.username}')">إرسال هدية تذكارية لـ ${escapeHTML(u.name)}</button>`;
    }
}

function openSinglePostPreview(postId) {
    const p = allPosts[postId]; if (!p) return;
    let m = document.getElementById("singlePostPreviewModal");
    if (!m) {
        m = document.createElement("div");
        m.id = "singlePostPreviewModal";
        m.className = "modal-bg";
        m.onclick = e => { if (e.target === m) m.style.display = "none"; };
        document.body.appendChild(m);
    }
    m.innerHTML = `<div style="width:100%; max-width:460px; max-height:90dvh; overflow-y:auto; position:relative;" id="singlePostCardHolder"></div>`;
    const holder = document.getElementById("singlePostCardHolder");
    holder.appendChild(buildIgPostCard(p));
    const closeB = document.createElement("button");
    closeB.className = "btn btn-outline btn-sm"; closeB.style.cssText = "width:100%; margin-top:10px;"; closeB.innerText = "إغلاق";
    closeB.onclick = () => { m.style.display = "none"; };
    holder.appendChild(closeB);
    m.style.display = "flex";
}

async function openOtherProfile(username) {
    if (!username) return;
    if (username === me.username) { switchMainTab("profile"); return; }
    if (typeof ensurePostsLoaded === "function") ensurePostsLoaded();

    bindOtherProfileParallax();
    const curActive = document.querySelector(".tab-view.active");
    if (curActive && curActive.id !== "view-other-profile") {
        prevTabBeforeOtherProfile = curActive.id.replace("view-", "");
    }

    activeOtherProfileUser = username;
    activeOtherProfileTab = "posts";

    const cachedUser = contactProfiles[username] || { username, name: username, bio: "" };
    const rId = getRoomId(me.username, username);
    const cachedMsgs = Object.values(roomMsgsCache[`chats/${rId}/messages`] || {})
        .filter(m => m && (m.type === "image" || m.type === "video" || m.type === "audio") && !(m.deletedFor && m.deletedFor[me.username]))
        .sort((a, b) => (b.ts || 0) - (a.ts || 0));

    otherProfileDataCache = { user: cachedUser, highlights: {}, gifts: {}, sharedMedia: cachedMsgs };
    paintOtherProfileHeader(cachedUser);
    renderOtherProfileStatsAndTab();

    const sc = document.getElementById("otherProfileScroll");
    if (sc) sc.scrollTop = 0;
    const sb = document.getElementById("opStickyBar");
    if (sb) sb.classList.remove("scrolled");

    document.querySelectorAll(".tab-view").forEach(v => v.classList.toggle("active", v.id === "view-other-profile"));

    const [uSnap, hlSnap, giftSnap, msgSnap] = await Promise.all([
        db.ref("users/" + username).once("value"),
        db.ref("highlights/" + username).once("value"),
        db.ref("gifts/" + username).once("value"),
        db.ref(`chats/${rId}/messages`).orderByKey().limitToLast(45).once("value")
    ]);

    if (activeOtherProfileUser !== username) return;
    if (uSnap.exists()) {
        const freshU = uSnap.val();
        contactProfiles[username] = freshU;
        otherProfileDataCache.user = freshU;
        paintOtherProfileHeader(freshU);
    }
    otherProfileDataCache.highlights = hlSnap.val() || {};
    otherProfileDataCache.gifts = giftSnap.val() || {};
    const freshMedia = Object.values(msgSnap.val() || {})
        .filter(m => m && (m.type === "image" || m.type === "video" || m.type === "audio") && !(m.deletedFor && m.deletedFor[me.username]))
        .sort((a, b) => (b.ts || 0) - (a.ts || 0));
    otherProfileDataCache.sharedMedia = freshMedia;
    renderOtherProfileStatsAndTab();
}

async function toggleBlockUser(targetUsername, closeModal = false) {
    const currently = !!myBlocked[targetUsername];
    await db.ref(`user_blocks/${me.username}/${targetUsername}`).set(currently ? null : true);
    showToast(currently ? "تم إلغاء الحظر" : "تم حظر المستخدم بنجاح");
    if (closeModal) closeOtherProfilePage();
}

async function reportUser(targetUsername) {
    const reason = prompt(`سبب الإبلاغ عن (@${targetUsername}):`, "إزعاج أو محتوى غير لائق");
    if (!reason || !reason.trim()) return;
    await db.ref("reports").push({ reporter: me.username, target: targetUsername, reason: reason.trim(), ts: Date.now() });
    showToast("تم إرسال البلاغ للإدارة بنجاح");
}

// ==================== 11. الإعدادات والمظهر وتغيير اليوزر ====================
function openSettingsModal() {
    tempAvatarBase64 = null;
    document.getElementById("profName").value = me.name;
    document.getElementById("profNewUser").value = me.displayTag || me.username;
    document.getElementById("profBio").value = me.bio || "";
    setAvatarStyle(document.getElementById("profAvatarPreview"), me, false);
    applyTheme(localStorage.getItem("app_theme") || "midnight", true);
    applyBubbleStyle(localStorage.getItem("app_bubble") || "soft", true);
    applyFont(localStorage.getItem("app_font") || "tajawal", true);
    applyFontSize(localStorage.getItem("app_fsize") || "md", true);
    applyWallpaper(localStorage.getItem("app_wp") || "pattern", true);
    document.getElementById("settingsModal").style.display = "flex";
    runPwaDiagnostics();
}

async function handleAvatarUpload(e) {
    const f = e.target.files[0]; if (!f) return;
    tempAvatarBase64 = await compressImageFile(f, 260, 0.78);
    const p = document.getElementById("profAvatarPreview");
    p.style.backgroundImage = `url(${tempAvatarBase64})`; p.innerText = "";
}

async function saveProfile() {
    const name = document.getElementById("profName").value.trim();
    const bio = document.getElementById("profBio").value.trim();
    const rawNewTag = document.getElementById("profNewUser").value.trim().replace(/^@/, "");
    const newKey = sanitizeKey(rawNewTag);
    if (name.length < 1) { showToast("اكتب اسماً صحيحاً"); return; }

    const upd = { name, bio };
    if (tempAvatarBase64) upd.avatarImg = tempAvatarBase64;

    if (newKey && newKey !== me.username) {
        if (newKey === "h" && !me.isDev) {
            const devCode = prompt("اليوزر (@H) محجوز للمطور فقط. أدخل رمز المطور:");
            const ok = (typeof verifyAdminPinInput === "function") ? await verifyAdminPinInput(devCode) : false;
            if (!ok) { showToast("اليوزر (@H) محجوز حصرياً للمطور!"); return; }
            upd.isDev = true; upd.verified = "gold";
        } else if (newKey !== "h" && newKey.length < 3) {
            showToast("اليوزر الجديد يجب أن يكون 3 أحرف على الأقل"); return;
        }
        if (await isHandleTakenAnywhere(newKey)) { showToast("هذا اليوزر محجوز مسبقاً لحساب أو قناة!"); return; }

        const oldKey = me.username;
        const migratedUser = { ...me, ...upd, username: newKey, displayTag: newKey === "h" ? "H" : (rawNewTag.replace(/[^a-zA-Z0-9_]/g, "") || newKey) };
        await db.ref(`users/${newKey}`).set(migratedUser);

        const nodes = ["user_contacts", "highlights", "stories", "saved_msgs", "notifications", "user_blocks", "gifts", "user_vault"];
        for (const n of nodes) {
            const s = await db.ref(`${n}/${oldKey}`).once("value");
            if (s.exists()) { await db.ref(`${n}/${newKey}`).set(s.val()); await db.ref(`${n}/${oldKey}`).remove(); }
        }
        for (const [pId, p] of Object.entries(allPosts)) { if (p.author === oldKey) await db.ref(`posts/${pId}/author`).set(newKey); }
        for (const [sId, sp] of Object.entries(allSpaces)) {
            if (sp.owner === oldKey) await db.ref(`spaces/${sId}/owner`).set(newKey);
            if (sp.members && sp.members[oldKey]) { await db.ref(`spaces/${sId}/members/${newKey}`).set(sp.members[oldKey]); await db.ref(`spaces/${sId}/members/${oldKey}`).remove(); }
        }
        await db.ref(`users/${oldKey}`).remove();
        localStorage.setItem("saved_account_u", newKey);
        showToast(`تم تغيير يوزرك إلى @${migratedUser.displayTag}`);
        setTimeout(() => location.reload(), 900);
        return;
    }

    await db.ref("users/" + me.username).update(upd);
    document.getElementById("settingsModal").style.display = "none";
    showToast("تم حفظ إعدادات حسابك");
}

function openVerifyReqModal() {
    if (me.verified) { showToast("حسابك موثق بالفعل"); return; }
    document.getElementById("vrReason").value = "";
    document.getElementById("verifyReqModal").style.display = "flex";
}

async function submitVerifyRequest() {
    const type = document.getElementById("vrType").value;
    const reason = document.getElementById("vrReason").value.trim() || "طلب توثيق رسمي";
    await db.ref(`verify_requests/u_${me.username}`).set({
        targetType: "user", targetId: me.username, username: me.username,
        displayTag: me.displayTag || me.username, name: me.name, requestedType: type, reason, ts: Date.now()
    });
    document.getElementById("verifyReqModal").style.display = "none";
    showToast("تم إرسال طلب التوثيق للمطور");
}
