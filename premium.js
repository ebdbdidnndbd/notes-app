// ==================== نظام المميزات المستقل (V7 Premium — صفر ثقل، 60fps) ====================
(function () {
    if (window.__PREMIUM_V7_LOADED__) return;
    window.__PREMIUM_V7_LOADED__ = true;

    const ACCENT_PALETTES = {
        default: { label: "افتراضي", main: "#38bdf8", grad: "linear-gradient(135deg,#0ea5e9,#3b82f6)" },
        rose:    { label: "وردي",    main: "#f472b6", grad: "linear-gradient(135deg,#ec4899,#8b5cf6)" },
        violet:  { label: "بنفسجي",  main: "#a78bfa", grad: "linear-gradient(135deg,#7c3aed,#4f46e5)" },
        gold:    { label: "ذهبي",    main: "#fbbf24", grad: "linear-gradient(135deg,#f59e0b,#eab308)" },
        emerald: { label: "زمردي",   main: "#34d399", grad: "linear-gradient(135deg,#059669,#10b981)" },
        crimson: { label: "ياقوتي",  main: "#fb7185", grad: "linear-gradient(135deg,#e11d48,#f97316)" },
        sunset:  { label: "غروب",    main: "#fb923c", grad: "linear-gradient(135deg,#f97316,#ec4899)" },
        cyan:    { label: "سماوي",   main: "#22d3ee", grad: "linear-gradient(135deg,#06b6d4,#2563eb)" }
    };

    const STATUS_EMOJIS = [
        "", "👑", "🔥", "❤️‍🔥", "💎", "🦋", "⚡", "✨", "🌙", "🌹",
        "🎧", "📚", "🎮", "☕", "🏆", "💫", "🧿", "🕊️", "💜", "😎"
    ];

    const MSG_EFFECTS = {
        hearts:   { label: "قلوب",    icon: "❤️", items: ["❤️", "💖", "💕", "💘", "💗"] },
        balloons: { label: "بالونات", icon: "🎈", items: ["🎈", "🩷", "🩵", "💜", "🎈"] },
        fire:     { label: "نار",     icon: "🔥", items: ["🔥", "💥", "✨", "🧡", "🔥"] },
        confetti: { label: "احتفال",  icon: "🎉", items: ["🎉", "🎊", "✨", "🌟", "💜"] },
        snow:     { label: "ثلج",     icon: "❄️", items: ["❄️", "🤍", "✨", "❄️", "🫧"] },
        stars:    { label: "نجوم",    icon: "⭐", items: ["⭐", "🌟", "✨", "💫", "⚡"] }
    };

    const ANIM_EMOJIS = [
        { em: "❤️", anim: "beat" }, { em: "🔥", anim: "wiggle" }, { em: "😂", anim: "bounce" },
        { em: "🥰", anim: "beat" }, { em: "👑", anim: "float" },  { em: "✨", anim: "spin" },
        { em: "🎉", anim: "wiggle" }, { em: "🦋", anim: "float" }, { em: "💎", anim: "spin" },
        { em: "🥺", anim: "bounce" }, { em: "🌹", anim: "float" }, { em: "⚡", anim: "wiggle" },
        { em: "💔", anim: "beat" }, { em: "🚀", anim: "bounce" }, { em: "😍", anim: "beat" },
        { em: "👻", anim: "float" }
    ];

    const PREM_BIG_STICKERS = [
        { id: "ps_love",  em: "💘", cap: "حب لا نهائي",  fx: "hearts",   bg: "linear-gradient(135deg,#be123c,#ec4899)" },
        { id: "ps_party", em: "🥳", cap: "ألف مبروك!",   fx: "confetti", bg: "linear-gradient(135deg,#7c3aed,#f59e0b)" },
        { id: "ps_fire",  em: "❤️‍🔥", cap: "شعلة حماس",   fx: "fire",     bg: "linear-gradient(135deg,#ea580c,#dc2626)" },
        { id: "ps_star",  em: "🌟", cap: "نجم المنصة",   fx: "stars",    bg: "linear-gradient(135deg,#0284c7,#6366f1)" },
        { id: "ps_bday",  em: "🎈", cap: "فرحة كبيرة",   fx: "balloons", bg: "linear-gradient(135deg,#059669,#0ea5e9)" },
        { id: "ps_snow",  em: "❄️", cap: "أجواء هادئة",  fx: "snow",     bg: "linear-gradient(135deg,#1e3a8a,#38bdf8)" }
    ];

    const SHARED_WP_PRESETS = [
        { id: "none",   label: "افتراضي",   css: "" },
        { id: "purple", label: "ليلكي",     css: "linear-gradient(160deg,#1a0b2e 0%,#2d1448 50%,#120820 100%)" },
        { id: "ocean",  label: "محيط هادئ", css: "linear-gradient(160deg,#06182c 0%,#0c3559 55%,#04101f 100%)" },
        { id: "rose",   label: "غروب ناعم", css: "linear-gradient(160deg,#240b1c 0%,#4a1632 52%,#160713 100%)" },
        { id: "forest", label: "غابة ليلية",css: "linear-gradient(160deg,#051a14 0%,#0f3b2e 55%,#04110d 100%)" },
        { id: "gold",   label: "فخم داكن",  css: "linear-gradient(160deg,#1a1408 0%,#33260f 52%,#0e0b05 100%)" }
    ];

    let selectedMsgEffect = "";
    let sharedWpRef = null;
    let tgStickersMap = {};
    const playedFxIds = new Set();

    // ==================== 1. حقن ستايلات المميزات الخفيفة (60fps GPU) ====================
    function injectPremiumStyles() {
        if (document.getElementById("premStylesV7")) return;
        const s = document.createElement("style");
        s.id = "premStylesV7";
        s.textContent = `
            .status-em {
                display: inline-block; margin-right: 4px; font-size: 14px;
                animation: premFloat 2.4s ease-in-out infinite; vertical-align: middle;
            }
            @keyframes premFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2.5px); } }
            @keyframes premBeat  { 0%,100% { transform: scale(1); } 30% { transform: scale(1.22); } 60% { transform: scale(0.95); } }
            @keyframes premBounce{ 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
            @keyframes premWiggle{ 0%,100% { transform: rotate(0); } 25% { transform: rotate(-10deg); } 75% { transform: rotate(10deg); } }
            @keyframes premSpin  { 0%,100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.16) rotate(12deg); } }

            .anim-em { display: inline-block; font-size: 1.32em; vertical-align: -2px; margin: 0 1px; will-change: transform; }
            .anim-em.beat   { animation: premBeat 1.4s ease-in-out infinite; }
            .anim-em.bounce { animation: premBounce 1.2s ease-in-out infinite; }
            .anim-em.wiggle { animation: premWiggle 1.3s ease-in-out infinite; }
            .anim-em.float  { animation: premFloat 2s ease-in-out infinite; }
            .anim-em.spin   { animation: premSpin 2.2s ease-in-out infinite; }

            .av-vid-mask {
                position: absolute; inset: 0; border-radius: 50%; overflow: hidden;
                pointer-events: none; z-index: 0;
            }
            .av-vid-mask video { width: 100%; height: 100%; object-fit: cover; display: block; }
            .avatar .online-badge { z-index: 2; }

            #fxStage {
                position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 9500;
            }
            .fx-p {
                position: fixed; font-size: 28px; will-change: transform, opacity;
                animation: fxFly var(--dur, 2.2s) cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
            }
            @keyframes fxFly {
                0%   { opacity: 0; transform: translate3d(0, 0, 0) scale(0.5) rotate(0deg); }
                15%  { opacity: 1; }
                80%  { opacity: 1; }
                100% { opacity: 0; transform: translate3d(var(--dx, 0px), var(--dy, -460px), 0) scale(1.25) rotate(var(--rot, 25deg)); }
            }

            #effectPickerBar {
                display: none; background: var(--bg-panel); border-top: 1px solid var(--border);
                padding: 7px 10px; gap: 6px; overflow-x: auto; flex-shrink: 0; align-items: center;
            }
            #effectPickerBar.open { display: flex; }
            .fx-opt-btn {
                background: var(--bg-card); border: 1px solid var(--border); color: var(--text);
                padding: 5px 11px; border-radius: 99px; font-size: 12px; font-weight: 700;
                cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px;
            }
            .fx-opt-btn.active { background: var(--primary-grad); border-color: transparent; color: #fff; }
            .fx-msg-pill {
                display: inline-flex; align-items: center; gap: 3px;
                background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.28);
                border-radius: 99px; padding: 1px 7px; font-size: 11px; font-weight: 800;
                color: #fff; cursor: pointer; margin-left: 4px;
            }

            .prem-big-sticker {
                width: 148px; height: 148px; border-radius: 26px;
                display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
                cursor: pointer; box-shadow: 0 10px 26px rgba(0,0,0,0.38); position: relative;
                border: 1px solid rgba(255,255,255,0.22);
            }
            .prem-big-sticker .pbs-em { font-size: 62px; animation: premBeat 1.8s ease-in-out infinite; }
            .prem-big-sticker .pbs-cap { font-size: 12px; font-weight: 800; color: #fff; }
            .prem-big-sticker .pbs-spark { position: absolute; top: 8px; left: 8px; font-size: 14px; }

            .tg-st-media {
                width: 154px; height: 154px; object-fit: contain; border-radius: 14px;
                display: block; cursor: pointer; background: transparent;
            }
            .tg-tile video { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; pointer-events: none; }

            .prem-color-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 8px 0 14px; }
            .prem-color-dot {
                height: 38px; border-radius: 12px; cursor: pointer; border: 2px solid transparent;
                color: #fff; font-size: 11.5px; font-weight: 800; display: flex; align-items: center; justify-content: center;
            }
            .prem-color-dot.active { border-color: #fff; transform: scale(1.05); }
            .status-em-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 7px; margin: 8px 0 14px; }
            .status-em-btn {
                height: 40px; border-radius: 12px; border: 1px solid var(--border);
                background: var(--glass-inner); font-size: 20px; cursor: pointer; color: var(--text);
            }
            .status-em-btn.active { border-color: var(--accent); background: rgba(56,189,248,0.22); }
            .swp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 10px 0; }
            .swp-tile {
                height: 62px; border-radius: 14px; border: 2px solid var(--border); cursor: pointer;
                display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #fff;
            }
            .swp-tile.active { border-color: var(--accent); }
        `;
        document.head.appendChild(s);
    }

    // ==================== 2. حقن عناصر الواجهة (أزرار + نوافذ المميزات) ====================
    function injectPremiumDOM() {
        // مسرح التأثيرات الحية
        if (!document.getElementById("fxStage")) {
            const stage = document.createElement("div");
            stage.id = "fxStage";
            document.body.appendChild(stage);
        }

        // شريط اختيار تأثير الرسالة فوق مربع الكتابة
        const formatBar = document.getElementById("formatBar");
        if (formatBar && !document.getElementById("effectPickerBar")) {
            const bar = document.createElement("div");
            bar.id = "effectPickerBar";
            bar.innerHTML = `<button type="button" class="fx-opt-btn active" data-fx="" onclick="window.selectMsgEffect('')">بدون تأثير</button>` +
                Object.entries(MSG_EFFECTS).map(([k, v]) =>
                    `<button type="button" class="fx-opt-btn" data-fx="${k}" onclick="window.selectMsgEffect('${k}')">${v.icon} ${v.label}</button>`
                ).join("");
            formatBar.parentNode.insertBefore(bar, formatBar.nextSibling);
        }

        // زر التأثيرات (✨) بجانب زر الإرسال
        const sendBtn = document.getElementById("sendBtn");
        if (sendBtn && !document.getElementById("fxToggleBtn")) {
            const fxBtn = document.createElement("button");
            fxBtn.id = "fxToggleBtn";
            fxBtn.className = "icon-btn";
            fxBtn.title = "إضافة تأثير متحرك للرسالة";
            fxBtn.innerText = "✨";
            fxBtn.onclick = () => window.toggleEffectPicker();
            sendBtn.parentNode.insertBefore(fxBtn, sendBtn);
        }

        // زر الخلفية المشتركة لكلا الطرفين (🎨) في شريط المحادثة العلوي
        const actionsPill = document.querySelector(".chat-actions-pill");
        if (actionsPill && !document.getElementById("btnSharedWp")) {
            const wpBtn = document.createElement("button");
            wpBtn.id = "btnSharedWp";
            wpBtn.className = "pill-act";
            wpBtn.title = "خلفية المحادثة لكلا الطرفين";
            wpBtn.style.display = "none";
            wpBtn.innerText = "🎨";
            wpBtn.onclick = () => window.openSharedWpModal();
            actionsPill.insertBefore(wpBtn, actionsPill.firstChild);
        }

        // تبويب «✨ مميز» في لوحة الملصقات السفلية
        const dbt = document.querySelector(".drawer-bottom-tabs");
        if (dbt && !dbt.querySelector('[data-dtab="premium"]')) {
            const btn = document.createElement("button");
            btn.className = "dbt-btn";
            btn.setAttribute("data-dtab", "premium");
            btn.innerText = "✨ مميز";
            btn.onclick = () => switchDrawerTab("premium");
            dbt.insertBefore(btn, dbt.querySelector(".dbt-close"));
        }

        // زر فتح نافذة «تخصيص المميز» في صفحة البروفايل وداخل الإعدادات
        const profBtnRow = document.querySelector("#view-profile .prof-av-row > div:last-child");
        if (profBtnRow && !document.getElementById("openPremProfileBtn")) {
            const b = document.createElement("button");
            b.id = "openPremProfileBtn";
            b.className = "btn btn-sm btn-gold";
            b.innerText = "✨ مميز";
            b.onclick = () => window.openPremiumModal();
            profBtnRow.insertBefore(b, profBtnRow.firstChild);
        }

        // نافذة تخصيص المميز (رمز الحالة + لون الاسم والردود + صورة البروفايل المتحركة)
        if (!document.getElementById("premiumModal")) {
            const m = document.createElement("div");
            m.id = "premiumModal";
            m.className = "modal-bg";
            m.onclick = e => { if (e.target === m) m.style.display = "none"; };
            m.innerHTML = `
                <div class="glass-card" style="max-width:430px;">
                    <h3>✨ تخصيص الحساب المميز</h3>
                    <p class="sub">مجاني بالكامل — يظهر لك ولكل أصدقائك فوراً</p>

                    <div class="form-group">
                        <label>1. رمز الحالة المتحرك بجانب اسمك:</label>
                        <div class="status-em-grid" id="premStatusGrid"></div>
                    </div>

                    <div class="form-group">
                        <label>2. لون الاسم والملف الشخصي وإطار الردود:</label>
                        <div class="prem-color-grid" id="premColorGrid"></div>
                    </div>

                    <div class="form-group">
                        <label>3. صورة متحركة للملف الشخصي (فيديو قصير أو GIF):</label>
                        <input type="file" id="premAnimAvInput" accept="video/mp4,video/webm,image/gif" style="display:none" onchange="window.handleAnimAvatarUpload(event)">
                        <div style="display:flex; gap:8px;">
                            <button class="btn btn-sm" style="flex:1;" onclick="document.getElementById('premAnimAvInput').click()">🎬 رفع فيديو/GIF</button>
                            <button class="btn btn-sm btn-outline" onclick="window.removeAnimAvatar()">إزالة الفيديو</button>
                        </div>
                        <div style="font-size:11px; color:var(--text-dim); margin-top:5px;">يفضّل فيديو 2–4 ثواني (أقل من 1.8 ميجابايت) حتى يتحرك بسلاسة على النت الضعيف.</div>
                    </div>

                    <button class="btn btn-outline btn-sm" style="margin-top:8px; width:100%;" onclick="document.getElementById('premiumModal').style.display='none'">إغلاق</button>
                </div>`;
            document.body.appendChild(m);
        }

        // نافذة خلفية المحادثة لكلا الطرفين
        if (!document.getElementById("sharedWpModal")) {
            const m = document.createElement("div");
            m.id = "sharedWpModal";
            m.className = "modal-bg";
            m.onclick = e => { if (e.target === m) m.style.display = "none"; };
            m.innerHTML = `
                <div class="glass-card" style="max-width:410px;">
                    <h3>🎨 خلفية المحادثة لكلا الطرفين</h3>
                    <p class="sub">تتغير الخلفية عندك وعند شريكك بالمحادثة بنفس اللحظة</p>
                    <div class="swp-grid" id="sharedWpGrid"></div>
                    <input type="file" id="sharedWpFileInput" accept="image/*" style="display:none" onchange="window.handleSharedWpUpload(event)">
                    <div style="display:flex; gap:8px; margin-top:10px;">
                        <button class="btn btn-sm" style="flex:1;" onclick="document.getElementById('sharedWpFileInput').click()">🖼️ رفع صورة لكليكما</button>
                        <button class="btn btn-sm btn-outline" onclick="window.setSharedWallpaper('')">استعادة الافتراضي</button>
                    </div>
                    <button class="btn btn-outline btn-sm" style="margin-top:10px; width:100%;" onclick="document.getElementById('sharedWpModal').style.display='none'">إغلاق</button>
                </div>`;
            document.body.appendChild(m);
        }

        // مدخل رفع ملصق متحرك / حزمة خاصة للـ Firebase
        if (!document.getElementById("tgStickerUploadInput")) {
            const inp = document.createElement("input");
            inp.type = "file";
            inp.id = "tgStickerUploadInput";
            inp.accept = "image/gif,image/webp,image/png,image/jpeg,video/webm,video/mp4";
            inp.style.display = "none";
            inp.onchange = e => window.handleUploadSharedTgSticker(e);
            document.body.appendChild(inp);
        }
    }

    // ==================== 3. محرّك تأثيرات الرسائل الخفيف ====================
    window.playScreenEffect = function (fxKey) {
        const fx = MSG_EFFECTS[fxKey];
        const stage = document.getElementById("fxStage");
        if (!fx || !stage) return;

        const fromTop = fxKey === "snow" || fxKey === "confetti";
        const count = 20;
        const frag = document.createDocumentFragment();
        const nodes = [];

        for (let i = 0; i < count; i++) {
            const p = document.createElement("span");
            p.className = "fx-p";
            p.innerText = fx.items[i % fx.items.length];
            const startX = 8 + Math.random() * 84;
            const startY = fromTop ? (-6 - Math.random() * 14) : (78 + Math.random() * 18);
            const dx = (Math.random() - 0.5) * 140;
            const dy = fromTop ? (window.innerHeight * 0.92) : -(window.innerHeight * (0.55 + Math.random() * 0.35));
            const rot = (Math.random() - 0.5) * 90;
            const dur = 1.6 + Math.random() * 1.0;

            p.style.left = startX + "vw";
            p.style.top = startY + "vh";
            p.style.fontSize = (22 + Math.random() * 16) + "px";
            p.style.animationDelay = (Math.random() * 0.35) + "s";
            p.style.setProperty("--dx", dx.toFixed(0) + "px");
            p.style.setProperty("--dy", dy.toFixed(0) + "px");
            p.style.setProperty("--rot", rot.toFixed(0) + "deg");
            p.style.setProperty("--dur", dur.toFixed(2) + "s");
            frag.appendChild(p);
            nodes.push(p);
        }
        stage.appendChild(frag);
        setTimeout(() => nodes.forEach(n => n.remove()), 3100);
    };

    window.toggleEffectPicker = function (force) {
        const bar = document.getElementById("effectPickerBar");
        if (!bar) return;
        const show = typeof force === "boolean" ? force : !bar.classList.contains("open");
        bar.classList.toggle("open", show);
        const btn = document.getElementById("fxToggleBtn");
        if (btn) btn.classList.toggle("accent", show || !!selectedMsgEffect);
    };

    window.selectMsgEffect = function (fxKey) {
        selectedMsgEffect = fxKey || "";
        document.querySelectorAll("#effectPickerBar .fx-opt-btn").forEach(b => {
            b.classList.toggle("active", b.getAttribute("data-fx") === selectedMsgEffect);
        });
        const btn = document.getElementById("fxToggleBtn");
        if (btn) {
            btn.innerText = selectedMsgEffect ? MSG_EFFECTS[selectedMsgEffect].icon : "✨";
            btn.classList.toggle("accent", !!selectedMsgEffect);
        }
        if (selectedMsgEffect) {
            window.playScreenEffect(selectedMsgEffect);
            window.toggleEffectPicker(false);
            showToast(`تأثير ${MSG_EFFECTS[selectedMsgEffect].label} جاهز مع رسالتك القادمة ✨`);
        }
    };

    // ==================== 4. تخصيص الحساب المميز (الحالة + الألوان + الأفاتار المتحرك) ====================
    window.openPremiumModal = function () {
        if (!me) return;
        const curSt = me.statusEmoji || "";
        const stGrid = document.getElementById("premStatusGrid");
        stGrid.innerHTML = STATUS_EMOJIS.map(em =>
            `<button type="button" class="status-em-btn ${curSt === em ? 'active' : ''}" onclick="window.setMyStatusEmoji('${em}')">${em || "✕"}</button>`
        ).join("");

        const curCol = me.accentColor || "default";
        const cGrid = document.getElementById("premColorGrid");
        cGrid.innerHTML = Object.entries(ACCENT_PALETTES).map(([k, p]) =>
            `<div class="prem-color-dot ${curCol === k ? 'active' : ''}" style="background:${p.grad}" onclick="window.setMyAccentColor('${k}')">${p.label}</div>`
        ).join("");

        document.getElementById("premiumModal").style.display = "flex";
    };

    window.setMyStatusEmoji = async function (em) {
        if (!me) return;
        await db.ref(`users/${me.username}/statusEmoji`).set(em);
        me.statusEmoji = em;
        window.openPremiumModal();
        showToast(em ? `تم تعيين رمز الحالة ${em}` : "تمت إزالة رمز الحالة");
    };

    window.setMyAccentColor = async function (key) {
        if (!me || !ACCENT_PALETTES[key]) return;
        await db.ref(`users/${me.username}/accentColor`).set(key);
        me.accentColor = key;
        window.openPremiumModal();
        renderMyProfilePage();
        showToast(`تم تحديث لون حسابك إلى ${ACCENT_PALETTES[key].label} 🎨`);
    };

    window.handleAnimAvatarUpload = function (e) {
        const f = e.target.files[0];
        e.target.value = "";
        if (!f || !me) return;
        if (f.size > 1.85 * 1024 * 1024) {
            showToast("الحد الأقصى للفيديو/GIF هو 1.8 ميجابايت حتى يشتغل بسلاسة");
            return;
        }
        showToast("جاري رفع الصورة المتحركة لحسابك...");
        const r = new FileReader();
        r.onload = async ev => {
            if (f.type === "image/gif") {
                await db.ref(`users/${me.username}`).update({ avatarImg: ev.target.result, avatarVideo: "" });
            } else {
                await db.ref(`users/${me.username}`).update({ avatarVideo: ev.target.result });
            }
            showToast("تم تفعيل الصورة المتحركة لبروفايلك 🎬✨");
        };
        r.readAsDataURL(f);
    };

    window.removeAnimAvatar = async function () {
        if (!me) return;
        await db.ref(`users/${me.username}/avatarVideo`).set("");
        showToast("تمت إزالة فيديو البروفايل");
    };

    // ==================== 5. خلفية المحادثة لكلا الطرفين ====================
    function applySharedWpToArea(wpVal) {
        const area = document.getElementById("messagesList");
        if (!area) return;
        if (!wpVal) {
            applyWallpaper(localStorage.getItem("app_wp") || "pattern", true);
            return;
        }
        if (wpVal.startsWith("data:image")) {
            area.style.backgroundImage = `linear-gradient(rgba(4,8,18,0.52), rgba(4,8,18,0.56)), url(${wpVal})`;
            area.style.backgroundSize = "cover";
            area.style.backgroundPosition = "center";
        } else {
            area.style.backgroundImage = wpVal;
            area.style.backgroundSize = "cover";
        }
    }

    window.openSharedWpModal = function () {
        if (activeChatType !== "dm" || !activeRoomId) return;
        const grid = document.getElementById("sharedWpGrid");
        grid.innerHTML = SHARED_WP_PRESETS.map(p =>
            `<div class="swp-tile" style="background:${p.css || 'var(--bg-card)'}" onclick="window.setSharedWallpaper('${p.css}')">${p.label}</div>`
        ).join("");
        document.getElementById("sharedWpModal").style.display = "flex";
    };

    window.setSharedWallpaper = async function (cssOrImg) {
        if (activeChatType !== "dm" || !activeRoomId) return;
        await db.ref(`chats/${activeRoomId}/shared_wp`).set({ value: cssOrImg || "", by: me.name, ts: Date.now() });
        document.getElementById("sharedWpModal").style.display = "none";
        showToast(cssOrImg ? "تم تغيير خلفية المحادثة لكليكما 🎨✨" : "تمت استعادة الخلفية الافتراضية");
    };

    window.handleSharedWpUpload = async function (e) {
        const f = e.target.files[0];
        e.target.value = "";
        if (!f) return;
        showToast("جاري ضغط وتطبيق الخلفية لكليكما...");
        const dataUrl = await compressImageFile(f, 880, 0.70);
        await window.setSharedWallpaper(dataUrl);
    };

    function detachSharedWp() {
        if (sharedWpRef) { sharedWpRef.off(); sharedWpRef = null; }
        const btn = document.getElementById("btnSharedWp");
        if (btn) btn.style.display = "none";
    }

    // ==================== 6. مخزن ملصقات تليگرام والملصقات المتحركة الخاصة ====================
    window.handleUploadSharedTgSticker = async function (e) {
        const f = e.target.files[0];
        e.target.value = "";
        if (!f || !me) return;
        if (f.size > 1.85 * 1024 * 1024) {
            showToast("الحد الأقصى للملصق المتحرك 1.8 ميجابايت");
            return;
        }
        showToast("جاري إضافة الملصق لمخزن المنصة الخاص...");
        const isVideo = f.type.startsWith("video/");
        const isAnimatedImg = f.type === "image/gif" || f.type === "image/webp";
        let dataUrl = "";
        if (isVideo || isAnimatedImg) {
            dataUrl = await new Promise((res, rej) => {
                const r = new FileReader(); r.onload = ev => res(ev.target.result); r.onerror = rej; r.readAsDataURL(f);
            });
        } else {
            dataUrl = await compressImageFile(f, 340, 0.78);
        }
        const id = "tgs_" + Date.now();
        await db.ref(`tg_stickers/custom_pack/${id}`).set({
            id, pack: "حزمنا الخاصة", mediaType: isVideo ? "video" : "image",
            src: dataUrl, addedBy: me.username, ts: Date.now()
        });
        showToast("تمت إضافة الملصق لجميع أعضاء المنصة ✨");
    };

    window.sendPremBigSticker = function (psId) {
        const ps = PREM_BIG_STICKERS.find(x => x.id === psId);
        if (!ps) return;
        pushMessageSafe("prem_sticker", ps.id, `${ps.em} ${ps.cap}`, { effect: ps.fx });
        window.playScreenEffect(ps.fx);
        toggleStickerDrawer(false);
    };

    window.sendTgSticker = function (packKey, stId) {
        const st = tgStickersMap?.[packKey]?.[stId];
        if (!st) return;
        pushMessageSafe("tg_sticker", st.src, "🎭 ملصق متحرك", { mediaType: st.mediaType || "image" });
        toggleStickerDrawer(false);
    };

    window.deleteTgSticker = async function (packKey, stId) {
        if (!confirm("حذف هذا الملصق من مخزن المنصة؟")) return;
        await db.ref(`tg_stickers/${packKey}/${stId}`).remove();
        showToast("تم حذف الملصق");
    };

    function renderPremiumDrawerTab(body) {
        let html = `<div class="st-sec-title">✨ رموز تعبيرية متحركة (تندمج داخل نص الرسالة)</div>
            <div class="emoji-grid" style="margin-bottom:12px;">
                ${ANIM_EMOJIS.map(a => `<button type="button" class="emoji-cell" onclick="insertEmojiToInput('[[${a.em}]]')"><span class="anim-em ${a.anim}">${a.em}</span></button>`).join("")}
            </div>`;

        html += `<div class="st-sec-title">🌟 ملصقات مميزة كبيرة (تنفجر بتأثير على الشاشة)</div>
            <div class="sticker-grid">
                ${PREM_BIG_STICKERS.map(ps => `
                    <div class="sticker-tile" style="background:${ps.bg}; border-color:rgba(255,255,255,0.2);" onclick="window.sendPremBigSticker('${ps.id}')">
                        <span class="st-em">${ps.em}</span>
                        <span class="st-cap" style="color:#fff;">${escapeHTML(ps.cap)}</span>
                    </div>`).join("")}
            </div>`;

        html += `<div class="st-sec-title">🎭 ملصقاتنا المتحركة وحزم تليگرام الخاصة</div>
            <div class="sticker-grid">
                <div class="sticker-tile sticker-create-tile" onclick="document.getElementById('tgStickerUploadInput').click()">
                    <span style="font-size:22px;">＋</span><span>رفع متحرك</span>
                </div>`;

        const allPacks = Object.entries(tgStickersMap || {});
        allPacks.forEach(([packKey, packObj]) => {
            if (!packObj || typeof packObj !== "object") return;
            Object.entries(packObj).forEach(([stId, st]) => {
                if (!st || !st.src) return;
                const canDel = st.addedBy === me?.username || me?.isDev;
                const mediaHTML = st.mediaType === "video"
                    ? `<video src="${st.src}" autoplay loop muted playsinline></video>`
                    : `<img src="${st.src}" loading="lazy">`;
                html += `<div class="sticker-tile tg-tile" style="position:relative;" onclick="window.sendTgSticker('${escapeHTML(packKey)}','${escapeHTML(stId)}')">
                    ${mediaHTML}
                    ${canDel ? `<button type="button" onclick="event.stopPropagation(); window.deleteTgSticker('${escapeHTML(packKey)}','${escapeHTML(stId)}')" style="position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:50%; border:none; background:rgba(0,0,0,0.72); color:#fff; font-size:10px; cursor:pointer;">✕</button>` : ""}
                </div>`;
            });
        });
        html += `</div>`;
        body.innerHTML = html;
    }

    // ==================== 7. ربط المميزات مع محرّك V6 بدون لمس ملفاته ====================
    function installHooks() {
        // 1) رمز الحالة المتحرك بجانب الاسم في كل المنصة تلقائياً
        const _origDevBadge = window.getDevBadgeHTML;
        window.getDevBadgeHTML = function (userObj) {
            const base = _origDevBadge ? _origDevBadge(userObj) : "";
            const st = userObj && userObj.statusEmoji ? `<span class="status-em" title="الحالة">${escapeHTML(userObj.statusEmoji)}</span>` : "";
            return base + st;
        };

        // 2) الصورة المتحركة (فيديو قصير) للملف الشخصي بدون وميض
        const _origSetAvatar = window.setAvatarStyle;
        window.setAvatarStyle = function (el, obj, showOnline = true) {
            if (el && obj && obj.avatarVideo) {
                const sig = String(obj.avatarVideo).slice(-28);
                if (el.getAttribute("data-avid") !== sig) {
                    el.setAttribute("data-avid", sig);
                    el.style.backgroundImage = "none";
                    el.innerHTML = `<div class="av-vid-mask"><video src="${obj.avatarVideo}" autoplay loop muted playsinline></video></div>` +
                        (showOnline ? `<span class="online-badge ${obj.online ? 'on' : ''}"></span>` : "");
                } else if (showOnline) {
                    const dot = el.querySelector(".online-badge");
                    if (dot) dot.classList.toggle("on", !!obj.online);
                }
                return;
            }
            if (el) el.removeAttribute("data-avid");
            if (_origSetAvatar) _origSetAvatar(el, obj, showOnline);
        };

        // 3) الرموز التعبيرية المتحركة داخل نص الرسالة [[❤️]]
        const _origFormatRich = window.formatRichText;
        window.formatRichText = function (raw) {
            let html = _origFormatRich ? _origFormatRich(raw) : escapeHTML(raw);
            html = html.replace(/\[\[([^\[\]]{1,8})\]\]/g, (_, em) => {
                const found = ANIM_EMOJIS.find(a => a.em === em);
                const cls = found ? found.anim : "beat";
                return `<span class="anim-em ${cls}">${em}</span>`;
            });
            return html;
        };

        // 4) حفظ يوزر صاحب الرسالة عند الرد لتلوين إطار الرد بلونه الخاص
        const _origReply = window.replyToSelected;
        window.replyToSelected = function () {
            const senderKey = selectedMsg?.data?.sender || "";
            if (_origReply) _origReply();
            if (replyTarget && senderKey) replyTarget.sender = senderKey;
        };

        // 5) إرفاق التأثير المختار تلقائياً عند إرسال أي رسالة
        const _origPush = window.pushMessageSafe;
        window.pushMessageSafe = async function (type, content, previewLabel, extra = {}) {
            const eff = extra.effect || selectedMsgEffect;
            if (eff) {
                extra = { ...extra, effect: eff };
                selectedMsgEffect = "";
                const btn = document.getElementById("fxToggleBtn");
                if (btn) { btn.innerText = "✨"; btn.classList.remove("accent"); }
                document.querySelectorAll("#effectPickerBar .fx-opt-btn").forEach(b => b.classList.toggle("active", b.getAttribute("data-fx") === ""));
                window.playScreenEffect(eff);
            }
            return _origPush(type, content, previewLabel, extra);
        };

        // 6) عرض الملصقات المميزة وملصقات تليگرام وتأثيرات الرسائل وألوان الردود
        const _origBuildMsg = window.buildMessageNode;
        window.buildMessageNode = function (id, m) {
            const wrap = _origBuildMsg(id, m);
            const bubble = wrap.querySelector(".msg-bubble");
            const slot = wrap.querySelector(".msg-content-slot");

            if (m.type === "prem_sticker" && slot) {
                const ps = PREM_BIG_STICKERS.find(x => x.id === m.content) || PREM_BIG_STICKERS[0];
                if (bubble) bubble.classList.add("sticker-bubble");
                slot.innerHTML = `<div class="prem-big-sticker" style="background:${ps.bg}" onclick="event.stopPropagation(); window.playScreenEffect('${ps.fx}')">
                    <span class="pbs-spark">✨</span><span class="pbs-em">${ps.em}</span><span class="pbs-cap">${escapeHTML(ps.cap)}</span>
                </div>`;
            } else if (m.type === "tg_sticker" && slot) {
                if (bubble) bubble.classList.add("sticker-bubble");
                if (m.mediaType === "video") {
                    slot.innerHTML = `<video class="tg-st-media" src="${m.content}" autoplay loop muted playsinline></video>`;
                } else {
                    slot.innerHTML = `<img class="tg-st-media" src="${m.content}" onclick="openLightbox('${m.content}')">`;
                }
            }

            // تلوين اسم المرسل وإطار الردود بلون المستخدم الخاص
            const senderObj = contactProfiles[m.sender] || (m.sender === me?.username ? me : null);
            if (senderObj?.accentColor && ACCENT_PALETTES[senderObj.accentColor]) {
                const pal = ACCENT_PALETTES[senderObj.accentColor];
                const lbl = wrap.querySelector(".msg-sender-lbl");
                if (lbl && activeChatType === "group") lbl.style.color = pal.main;
            }
            if (m.replyTo?.sender) {
                const rUser = contactProfiles[m.replyTo.sender] || (m.replyTo.sender === me?.username ? me : null);
                const pal = rUser?.accentColor && ACCENT_PALETTES[rUser.accentColor];
                const rq = wrap.querySelector(".reply-quote");
                if (rq && pal) {
                    rq.style.borderRightColor = pal.main;
                    const stEl = rq.querySelector("strong");
                    if (stEl) stEl.style.color = pal.main;
                }
            }

            // زر تشغيل/إعادة تشغيل تأثير الرسالة + تشغيل تلقائي عند وصول رسالة جديدة
            if (m.effect && MSG_EFFECTS[m.effect]) {
                const fx = MSG_EFFECTS[m.effect];
                const foot = wrap.querySelector(".msg-footer");
                if (foot) {
                    const pill = document.createElement("button");
                    pill.className = "fx-msg-pill";
                    pill.innerHTML = `✨ ${fx.icon}`;
                    pill.title = "اضغط لإعادة التأثير";
                    pill.onclick = e => { e.stopPropagation(); window.playScreenEffect(m.effect); };
                    foot.insertBefore(pill, foot.firstChild);
                }
                if (!m._pending && m.ts && (Date.now() - m.ts < 8000) && !playedFxIds.has(id)) {
                    playedFxIds.add(id);
                    setTimeout(() => window.playScreenEffect(m.effect), 120);
                }
            }
            return wrap;
        };

        // 7) ألوان البروفايل الشخصي وبروفايل الأصدقاء
        const _origRenderMyProf = window.renderMyProfilePage;
        window.renderMyProfilePage = function () {
            if (_origRenderMyProf) _origRenderMyProf();
            if (!me) return;
            const pal = ACCENT_PALETTES[me.accentColor || "default"] || ACCENT_PALETTES.default;
            const cov = document.getElementById("myProfCover");
            const nm = document.getElementById("myProfName");
            if (cov) cov.style.background = pal.grad;
            if (nm) nm.style.color = me.accentColor && me.accentColor !== "default" ? pal.main : "";
        };

        const _origOpenOtherProf = window.openOtherProfile;
        window.openOtherProfile = async function (username) {
            await _origOpenOtherProf(username);
            const u = contactProfiles[username] || (await db.ref("users/" + username).once("value")).val();
            if (!u) return;
            const pal = ACCENT_PALETTES[u.accentColor || "default"] || ACCENT_PALETTES.default;
            const cov = document.querySelector("#userProfileModal .glass-card > div:first-child");
            const nm = document.getElementById("upName");
            if (cov) cov.style.background = pal.grad;
            if (nm) nm.style.color = u.accentColor && u.accentColor !== "default" ? pal.main : "";
        };

        // 8) ربط الخلفية المشتركة لكلا الطرفين عند فتح وإغلاق المحادثة
        const _origOpenDM = window.openDM;
        window.openDM = function (partnerUsername) {
            detachSharedWp();
            _origOpenDM(partnerUsername);
            const btn = document.getElementById("btnSharedWp");
            if (btn) btn.style.display = "inline-flex";
            const roomCopy = activeRoomId;
            const tokCopy = activeRoomToken;
            sharedWpRef = db.ref(`chats/${roomCopy}/shared_wp`);
            sharedWpRef.on("value", s => {
                if (tokCopy !== activeRoomToken) return;
                const d = s.val();
                applySharedWpToArea(d?.value || "");
            });
        };

        const _origOpenSaved = window.openSavedMessages;
        window.openSavedMessages = function () { detachSharedWp(); _origOpenSaved(); applyWallpaper(localStorage.getItem("app_wp") || "pattern", true); };

        const _origOpenSpace = window.openSpaceRoom;
        window.openSpaceRoom = function (id) { detachSharedWp(); _origOpenSpace(id); applyWallpaper(localStorage.getItem("app_wp") || "pattern", true); };

        const _origCloseChat = window.closeActiveChat;
        window.closeActiveChat = function () { detachSharedWp(); window.toggleEffectPicker(false); _origCloseChat(); };

        // 9) ربط تبويب «✨ مميز» في لوحة الملصقات
        const _origRenderDrawer = window.renderDrawerContent;
        window.renderDrawerContent = function () {
            if (typeof activeDrawerTab !== "undefined" && activeDrawerTab === "premium") {
                const body = document.getElementById("drawerBody");
                if (body) renderPremiumDrawerTab(body);
                return;
            }
            if (_origRenderDrawer) _origRenderDrawer();
        };

        // 10) الاستماع لمخزن ملصقات المنصة/تليگرام الخاصة بعد تسجيل الدخول
        const _origEnter = window.enterMainApp;
        window.enterMainApp = function (uData) {
            _origEnter(uData);
            db.ref("tg_stickers").on("value", s => {
                tgStickersMap = s.val() || {};
                if (typeof activeDrawerTab !== "undefined" && activeDrawerTab === "premium" && document.getElementById("stickerDrawer").style.display === "flex") {
                    window.renderDrawerContent();
                }
            });
        };
    }

    injectPremiumStyles();
    injectPremiumDOM();
    installHooks();
})();
