// ==================== نظام المميزات المستقل (V7.1 Turbo — صفر ثقل، 60fps) ====================
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
    let allStickerPacks = {};       // كاش محلي للحزم المحمّلة عند الطلب فقط
    let loadingPacksSet = new Set();
    let mySavedPacks = {};          // user_sticker_packs/{me.username}
    let activeSelectedPackId = "";  // الحزمة المفتوحة حالياً فقط باللوحة
    let activePackVisibleCount = 12;
    let uploadTargetPackId = null;
    const playedFxIds = new Set();

    // ==================== محرّك الذاكرة الخفيف (Blob Cache + Video Decoder Cap) ====================
    const blobUrlCache = new Map();
    function toBlobUrl(src) {
        if (!src || typeof src !== "string" || !src.startsWith("data:")) return src || "";
        const key = src.length + "_" + src.slice(0, 44) + "_" + src.slice(-28);
        if (blobUrlCache.has(key)) return blobUrlCache.get(key);
        try {
            const comma = src.indexOf(",");
            if (comma < 0) return src;
            const mime = src.slice(5, comma).split(";")[0] || "application/octet-stream";
            const bin = atob(src.slice(comma + 1));
            const len = bin.length;
            const arr = new Uint8Array(len);
            for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
            const url = URL.createObjectURL(new Blob([arr], { type: mime }));
            blobUrlCache.set(key, url);
            return url;
        } catch {
            return src;
        }
    }

    // تحديد أقصى عدد فيديوهات ملصقات تعمل بنفس اللحظة بـ 4 فقط لحماية معالج الموبايل
    const MAX_CONCURRENT_VIDEOS = 4;
    const activePlayingVids = [];

    function pauseManagedVideo(v) {
        if (!v) return;
        try { v.pause(); } catch {}
        const idx = activePlayingVids.indexOf(v);
        if (idx !== -1) activePlayingVids.splice(idx, 1);
    }

    function requestManagedVideoPlay(v) {
        if (!v || !document.body.contains(v)) return;
        const src = v.getAttribute("data-vsrc");
        if (src && !v.getAttribute("src")) v.setAttribute("src", src);
        if (activePlayingVids.includes(v)) {
            if (v.paused) v.play().catch(() => {});
            return;
        }
        while (activePlayingVids.length >= MAX_CONCURRENT_VIDEOS) {
            const oldest = activePlayingVids.shift();
            if (oldest && oldest !== v) { try { oldest.pause(); } catch {} }
        }
        activePlayingVids.push(v);
        v.play().catch(() => {});
    }

    const vidObserver = ("IntersectionObserver" in window)
        ? new IntersectionObserver(entries => {
            entries.forEach(ent => {
                const v = ent.target;
                if (ent.isIntersecting) requestManagedVideoPlay(v);
                else pauseManagedVideo(v);
            });
        }, { threshold: 0.15 })
        : null;

    function attachLazyVideos(container) {
        if (!container) return;
        container.querySelectorAll("video.tg-lazy-vid").forEach(v => {
            if (vidObserver) vidObserver.observe(v);
            else requestManagedVideoPlay(v);
        });
    }

    function stopAndReleaseVideos(container) {
        if (!container) return;
        container.querySelectorAll("video.tg-lazy-vid").forEach(v => {
            if (vidObserver) vidObserver.unobserve(v);
            pauseManagedVideo(v);
            try { v.removeAttribute("src"); v.load(); } catch {}
        });
    }

    // ==================== 1. حقن ستايلات المميزات الخفيفة ====================
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

            .anim-em { display: inline-block; font-size: 1.32em; vertical-align: -2px; margin: 0 1px; }
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

            #fxStage { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 9500; }
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
                width: 146px; height: 146px; border-radius: 26px;
                display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
                cursor: pointer; box-shadow: 0 8px 22px rgba(0,0,0,0.34); position: relative;
                border: 1px solid rgba(255,255,255,0.22);
            }
            .prem-big-sticker .pbs-em { font-size: 60px; animation: premBeat 1.8s ease-in-out infinite; }
            .prem-big-sticker .pbs-cap { font-size: 12px; font-weight: 800; color: #fff; }
            .prem-big-sticker .pbs-spark { position: absolute; top: 8px; left: 8px; font-size: 14px; }

            .tg-st-wrap { position: relative; display: inline-block; cursor: pointer; }
            .tg-st-media {
                width: 148px; height: 148px; object-fit: contain; border-radius: 14px;
                display: block; background: transparent;
            }
            .tg-st-hint {
                position: absolute; bottom: 4px; right: 4px;
                background: rgba(8, 13, 26, 0.78); border: 1px solid rgba(255,255,255,0.22);
                color: #fff; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 99px;
            }
            .tg-tile { contain: content; }
            .tg-tile video { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; pointer-events: none; background: rgba(0,0,0,0.2); }
            .tg-vid-dot {
                position: absolute; bottom: 4px; right: 4px;
                background: rgba(0,0,0,0.68); color: #fff; font-size: 9px; font-weight: 800;
                padding: 1px 5px; border-radius: 6px; pointer-events: none;
            }

            .pack-tabs-bar {
                display: flex; gap: 6px; overflow-x: auto; padding: 2px 0 8px; margin-bottom: 4px;
            }
            .pack-tab-pill {
                background: var(--bg-card); border: 1px solid var(--border); color: var(--text-dim);
                padding: 5px 11px; border-radius: 99px; font-size: 12px; font-weight: 700;
                cursor: pointer; white-space: nowrap; flex-shrink: 0;
            }
            .pack-tab-pill.active { background: var(--primary-grad); border-color: transparent; color: #fff; }

            .pack-head-row {
                display: flex; justify-content: space-between; align-items: center; gap: 8px;
                margin: 4px 0 8px; padding: 6px 10px; background: var(--glass-inner);
                border: 1px solid var(--border); border-radius: 12px;
            }
            .pack-head-title { font-size: 12.5px; font-weight: 800; color: var(--text); }
            .pack-head-acts { display: flex; gap: 5px; }
            .pack-mini-btn {
                border: 1px solid var(--border); background: var(--bg-card); color: var(--accent);
                font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 8px; cursor: pointer;
            }
            .pack-mini-btn.danger { color: #fb7185; border-color: rgba(244,63,94,0.3); }

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
        `;
        document.head.appendChild(s);
    }

    // ==================== 2. حقن عناصر الواجهة ====================
    function injectPremiumDOM() {
        if (!document.getElementById("fxStage")) {
            const stage = document.createElement("div");
            stage.id = "fxStage";
            document.body.appendChild(stage);
        }

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

        const dbt = document.querySelector(".drawer-bottom-tabs");
        if (dbt && !dbt.querySelector('[data-dtab="premium"]')) {
            const btn = document.createElement("button");
            btn.className = "dbt-btn";
            btn.setAttribute("data-dtab", "premium");
            btn.innerText = "✨ مميز";
            btn.onclick = () => switchDrawerTab("premium");
            dbt.insertBefore(btn, dbt.querySelector(".dbt-close"));
        }

        const profBtnRow = document.querySelector("#view-profile .prof-av-row > div:last-child");
        if (profBtnRow && !document.getElementById("openPremProfileBtn")) {
            const b = document.createElement("button");
            b.id = "openPremProfileBtn";
            b.className = "btn btn-sm btn-gold";
            b.innerText = "✨ مميز";
            b.onclick = () => window.openPremiumModal();
            profBtnRow.insertBefore(b, profBtnRow.firstChild);
        }

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
                        <div style="font-size:11px; color:var(--text-dim); margin-top:5px;">يفضّل فيديو 2–4 ثواني (أقل من 1.8 ميجابايت) حتى يتحرك بسلاسة.</div>
                    </div>
                    <button class="btn btn-outline btn-sm" style="margin-top:8px; width:100%;" onclick="document.getElementById('premiumModal').style.display='none'">إغلاق</button>
                </div>`;
            document.body.appendChild(m);
        }

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

        if (!document.getElementById("stickerPackPreviewModal")) {
            const m = document.createElement("div");
            m.id = "stickerPackPreviewModal";
            m.className = "modal-bg sheet-bg story-top-modal";
            m.onclick = e => { if (e.target === m) window.closeStickerPackPreview(); };
            m.innerHTML = `
                <div class="bottom-sheet" style="max-height:80dvh; display:flex; flex-direction:column;">
                    <div style="text-align:center; margin-bottom:10px;">
                        <h4 id="sppTitle" style="font-size:16px;">🎭 حزمة ملصقات</h4>
                        <div id="sppMeta" style="font-size:12px; color:var(--text-dim); margin-top:2px;">...</div>
                    </div>
                    <div id="sppGrid" class="sticker-grid" style="flex:1; overflow-y:auto; max-height:46dvh; padding:4px;"></div>
                    <div id="sppActionRow" style="display:flex; gap:8px; margin-top:12px;"></div>
                </div>`;
            document.body.appendChild(m);
        }

        if (!document.getElementById("tgStickerUploadInput")) {
            const inp = document.createElement("input");
            inp.type = "file";
            inp.id = "tgStickerUploadInput";
            inp.multiple = true;
            inp.accept = "image/gif,image/webp,image/png,image/jpeg,video/webm,video/mp4";
            inp.style.display = "none";
            inp.onchange = e => window.handleUploadStickersToPack(e);
            document.body.appendChild(inp);
        }
    }

    // ==================== 3. محرّك تأثيرات الرسائل ====================
    window.playScreenEffect = function (fxKey) {
        const fx = MSG_EFFECTS[fxKey];
        const stage = document.getElementById("fxStage");
        if (!fx || !stage) return;

        const fromTop = fxKey === "snow" || fxKey === "confetti";
        const count = 18;
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
            const dur = 1.6 + Math.random() * 0.9;

            p.style.left = startX + "vw";
            p.style.top = startY + "vh";
            p.style.fontSize = (22 + Math.random() * 15) + "px";
            p.style.animationDelay = (Math.random() * 0.32) + "s";
            p.style.setProperty("--dx", dx.toFixed(0) + "px");
            p.style.setProperty("--dy", dy.toFixed(0) + "px");
            p.style.setProperty("--rot", rot.toFixed(0) + "deg");
            p.style.setProperty("--dur", dur.toFixed(2) + "s");
            frag.appendChild(p);
            nodes.push(p);
        }
        stage.appendChild(frag);
        setTimeout(() => nodes.forEach(n => n.remove()), 2900);
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
            showToast(`تأثير ${MSG_EFFECTS[selectedMsgEffect].label} جاهز مع رسالتك ✨`);
        }
    };

    // ==================== 4. تخصيص الحساب المميز ====================
    window.openPremiumModal = function () {
        if (!me) return;
        const curSt = me.statusEmoji || "";
        document.getElementById("premStatusGrid").innerHTML = STATUS_EMOJIS.map(em =>
            `<button type="button" class="status-em-btn ${curSt === em ? 'active' : ''}" onclick="window.setMyStatusEmoji('${em}')">${em || "✕"}</button>`
        ).join("");

        const curCol = me.accentColor || "default";
        document.getElementById("premColorGrid").innerHTML = Object.entries(ACCENT_PALETTES).map(([k, p]) =>
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
        if (f.size > 1.85 * 1024 * 1024) { showToast("الحد الأقصى للفيديو/GIF هو 1.8 ميجابايت"); return; }
        showToast("جاري رفع الصورة المتحركة لحسابك...");
        const r = new FileReader();
        r.onload = async ev => {
            if (f.type === "image/gif") await db.ref(`users/${me.username}`).update({ avatarImg: ev.target.result, avatarVideo: "" });
            else await db.ref(`users/${me.username}`).update({ avatarVideo: ev.target.result });
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
        if (!wpVal) { applyWallpaper(localStorage.getItem("app_wp") || "pattern", true); return; }
        if (wpVal.startsWith("data:image")) {
            const url = toBlobUrl(wpVal);
            area.style.backgroundImage = `linear-gradient(rgba(4,8,18,0.52), rgba(4,8,18,0.56)), url(${url})`;
            area.style.backgroundSize = "cover";
            area.style.backgroundPosition = "center";
        } else {
            area.style.backgroundImage = wpVal;
            area.style.backgroundSize = "cover";
        }
    }

    window.openSharedWpModal = function () {
        if (activeChatType !== "dm" || !activeRoomId) return;
        document.getElementById("sharedWpGrid").innerHTML = SHARED_WP_PRESETS.map(p =>
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

    // ==================== 6. نظام حزم الملصقات الخفيف (تحميل عند الطلب فقط) ====================
    async function fetchPackOnce(packId, force = false) {
        if (!packId) return null;
        if (!force && allStickerPacks[packId]) return allStickerPacks[packId];
        if (loadingPacksSet.has(packId)) return allStickerPacks[packId] || null;
        loadingPacksSet.add(packId);
        try {
            const snap = await db.ref(`tg_packs/${packId}`).once("value");
            if (snap.exists()) {
                allStickerPacks[packId] = snap.val();
            } else {
                delete allStickerPacks[packId];
            }
            return allStickerPacks[packId] || null;
        } catch {
            return null;
        } finally {
            loadingPacksSet.delete(packId);
        }
    }

    async function ensureMyPacksLoaded() {
        const ids = Object.keys(mySavedPacks || {}).filter(pid => mySavedPacks[pid]);
        const missing = ids.filter(pid => !allStickerPacks[pid]);
        if (missing.length > 0) {
            await Promise.all(missing.map(pid => fetchPackOnce(pid)));
        }
        const validIds = ids.filter(pid => allStickerPacks[pid]);
        if (!activeSelectedPackId || !validIds.includes(activeSelectedPackId)) {
            activeSelectedPackId = validIds[0] || "";
            activePackVisibleCount = 12;
        }
        return validIds;
    }

    window.selectStickerPackTab = function (pid) {
        activeSelectedPackId = pid;
        activePackVisibleCount = 12;
        const body = document.getElementById("drawerBody");
        if (body) renderPremiumDrawerTab(body);
    };

    window.showMorePackStickers = function () {
        activePackVisibleCount += 12;
        const body = document.getElementById("drawerBody");
        if (body) renderPremiumDrawerTab(body);
    };

    window.createNewStickerPack = async function () {
        if (!me) return;
        const name = prompt("اكتب اسم حزمة الملصقات الجديدة (مثال: ملصقاتي، ضحك، حب):", "ملصقات " + me.name);
        if (!name || !name.trim()) return;
        const packId = "pk_" + me.username + "_" + Date.now();
        const packObj = {
            id: packId, name: name.trim(), owner: me.username, ownerName: me.name, ts: Date.now(), stickers: {}
        };
        await db.ref(`tg_packs/${packId}`).set(packObj);
        await db.ref(`user_sticker_packs/${me.username}/${packId}`).set(true);
        allStickerPacks[packId] = packObj;
        activeSelectedPackId = packId;
        activePackVisibleCount = 12;
        uploadTargetPackId = packId;
        showToast(`تم إنشاء حزمة «${name.trim()}» — اختر ملصقات لإضافتها ✨`);
        document.getElementById("tgStickerUploadInput").click();
    };

    window.triggerAddStickerToPack = function (packId) {
        uploadTargetPackId = packId;
        document.getElementById("tgStickerUploadInput").click();
    };

    window.handleUploadStickersToPack = async function (e) {
        const files = Array.from(e.target.files || []);
        e.target.value = "";
        if (!files.length || !me) return;

        let packId = uploadTargetPackId;
        if (!packId || !allStickerPacks[packId]) {
            const owned = Object.values(allStickerPacks).find(p => p && p.owner === me.username);
            if (owned) {
                packId = owned.id;
            } else {
                packId = "pk_" + me.username + "_" + Date.now();
                const obj = { id: packId, name: "حزمة " + me.name, owner: me.username, ownerName: me.name, ts: Date.now(), stickers: {} };
                await db.ref(`tg_packs/${packId}`).set(obj);
                await db.ref(`user_sticker_packs/${me.username}/${packId}`).set(true);
                allStickerPacks[packId] = obj;
            }
        }

        let uploaded = 0;
        showToast(`جاري رفع ${files.length} ملصق لحزمتك...`);
        for (const f of files.slice(0, 12)) {
            if (f.size > 1.85 * 1024 * 1024) { showToast("تم تخطي ملف أكبر من 1.8 ميجابايت"); continue; }
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
            const stId = "st_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
            const stObj = { id: stId, mediaType: isVideo ? "video" : "image", src: dataUrl, ts: Date.now() };
            await db.ref(`tg_packs/${packId}/stickers/${stId}`).set(stObj);
            if (!allStickerPacks[packId].stickers) allStickerPacks[packId].stickers = {};
            allStickerPacks[packId].stickers[stId] = stObj;
            uploaded++;
        }
        if (uploaded > 0) {
            activeSelectedPackId = packId;
            showToast(`تمت إضافة ${uploaded} ملصق لحزمتك الخاصة ✅`);
            const body = document.getElementById("drawerBody");
            if (body && activeDrawerTab === "premium" && document.getElementById("stickerDrawer").style.display === "flex") {
                renderPremiumDrawerTab(body);
            }
        }
    };

    window.sendPremBigSticker = function (psId) {
        const ps = PREM_BIG_STICKERS.find(x => x.id === psId);
        if (!ps) return;
        pushMessageSafe("prem_sticker", ps.id, `${ps.em} ${ps.cap}`, { effect: ps.fx });
        window.playScreenEffect(ps.fx);
        toggleStickerDrawer(false);
    };

    window.sendPackSticker = function (packId, stId) {
        const pack = allStickerPacks[packId];
        const st = pack?.stickers?.[stId];
        if (!st) return;
        pushMessageSafe("tg_sticker", st.src, `🎭 ملصق (${pack.name})`, {
            mediaType: st.mediaType || "image",
            packId: pack.id,
            packName: pack.name
        });
        toggleStickerDrawer(false);
    };

    window.deleteStickerFromPack = async function (packId, stId) {
        if (!confirm("حذف هذا الملصق من الحزمة؟")) return;
        await db.ref(`tg_packs/${packId}/stickers/${stId}`).remove();
        if (allStickerPacks[packId]?.stickers) delete allStickerPacks[packId].stickers[stId];
        showToast("تم حذف الملصق");
        const body = document.getElementById("drawerBody");
        if (body && activeDrawerTab === "premium") renderPremiumDrawerTab(body);
    };

    window.removePackFromMyList = async function (packId) {
        const pack = allStickerPacks[packId];
        if (pack && pack.owner === me.username) {
            if (!confirm(`حذف حزمتك «${pack.name}» بالكامل؟`)) return;
            await db.ref(`tg_packs/${packId}`).remove();
            delete allStickerPacks[packId];
        }
        await db.ref(`user_sticker_packs/${me.username}/${packId}`).remove();
        if (activeSelectedPackId === packId) activeSelectedPackId = "";
        window.closeStickerPackPreview();
        showToast("تمت إزالة الحزمة من ملصقاتك");
    };

    window.addPackToMyList = async function (packId) {
        if (!me || !packId) return;
        await db.ref(`user_sticker_packs/${me.username}/${packId}`).set(true);
        activeSelectedPackId = packId;
        window.closeStickerPackPreview();
        const pName = allStickerPacks[packId]?.name || "الحزمة";
        showToast(`تمت إضافة «${pName}» إلى ملصقاتك بنجاح ✅🎭`);
    };

    window.closeStickerPackPreview = function () {
        const grid = document.getElementById("sppGrid");
        if (grid) { stopAndReleaseVideos(grid); grid.innerHTML = ""; }
        const m = document.getElementById("stickerPackPreviewModal");
        if (m) m.style.display = "none";
    };

    window.openStickerPackPreview = async function (packId, fallbackSrc, fallbackMedia) {
        const m = document.getElementById("stickerPackPreviewModal");
        const grid = document.getElementById("sppGrid");
        const actRow = document.getElementById("sppActionRow");

        if (packId && !allStickerPacks[packId]) {
            document.getElementById("sppTitle").innerText = "⏳ جاري فتح الحزمة...";
            document.getElementById("sppMeta").innerText = "";
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:24px; color:var(--text-dim); font-size:13px;">جاري تحميل الملصقات...</div>`;
            actRow.innerHTML = `<button class="btn btn-sm btn-outline" style="width:100%;" onclick="window.closeStickerPackPreview()">إغلاق</button>`;
            m.style.display = "flex";
            await fetchPackOnce(packId, true);
        }

        const pack = packId ? allStickerPacks[packId] : null;
        if (!pack) {
            window.closeStickerPackPreview();
            if (fallbackSrc && fallbackMedia !== "video") openLightbox(toBlobUrl(fallbackSrc));
            else showToast("هذه الحزمة لم تعد متوفرة");
            return;
        }

        const stickersList = Object.values(pack.stickers || {});
        const hasIt = !!mySavedPacks[pack.id];
        const isOwner = pack.owner === me.username;

        document.getElementById("sppTitle").innerText = `🎭 ${pack.name}`;
        document.getElementById("sppMeta").innerText = `${stickersList.length} ملصق • بواسطة ${pack.ownerName || pack.owner}`;

        stopAndReleaseVideos(grid);
        if (stickersList.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:24px; color:var(--text-dim); font-size:13px;">الحزمة فارغة حالياً</div>`;
        } else {
            grid.innerHTML = stickersList.slice(0, 24).map(st => {
                const url = toBlobUrl(st.src);
                const mediaHTML = st.mediaType === "video"
                    ? `<video class="tg-lazy-vid" data-vsrc="${url}" preload="metadata" loop muted playsinline></video><span class="tg-vid-dot">🎬</span>`
                    : `<img src="${url}" loading="lazy" decoding="async">`;
                return `<div class="sticker-tile tg-tile" style="position:relative;" onclick="if('${hasIt}'==='true'){ window.sendPackSticker('${escapeHTML(pack.id)}','${escapeHTML(st.id)}'); window.closeStickerPackPreview(); }">${mediaHTML}</div>`;
            }).join("");
            attachLazyVideos(grid);
        }

        if (hasIt) {
            actRow.innerHTML = `
                ${isOwner ? `<button class="btn btn-sm" style="flex:1;" onclick="window.closeStickerPackPreview(); window.triggerAddStickerToPack('${escapeHTML(pack.id)}')">➕ إضافة ملصقات</button>` : `<button class="btn btn-sm btn-success" style="flex:1;" disabled>✓ مضافة لديك</button>`}
                <button class="btn btn-sm btn-danger" onclick="window.removePackFromMyList('${escapeHTML(pack.id)}')">${isOwner ? 'حذف' : 'إزالة'}</button>
                <button class="btn btn-sm btn-outline" onclick="window.closeStickerPackPreview()">إغلاق</button>`;
        } else {
            actRow.innerHTML = `
                <button class="btn" style="flex:1;" onclick="window.addPackToMyList('${escapeHTML(pack.id)}')">➕ إضافة الحزمة لملصقاتي (${stickersList.length})</button>
                <button class="btn btn-outline btn-sm" onclick="window.closeStickerPackPreview()">إغلاق</button>`;
        }

        m.style.display = "flex";
    };

    async function renderPremiumDrawerTab(body) {
        stopAndReleaseVideos(body);

        const savedIds = Object.keys(mySavedPacks || {}).filter(pid => mySavedPacks[pid]);
        const needFetch = savedIds.some(pid => !allStickerPacks[pid]);
        if (needFetch) {
            body.innerHTML = `<div style="text-align:center; padding:34px; color:var(--text-dim); font-size:13px;">⏳ جاري تجهيز حزم ملصقاتك...</div>`;
            await ensureMyPacksLoaded();
            if (activeDrawerTab !== "premium" || document.getElementById("stickerDrawer").style.display !== "flex") return;
        } else {
            await ensureMyPacksLoaded();
        }

        const myPackIds = savedIds.filter(pid => allStickerPacks[pid]);

        let html = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span class="st-sec-title" style="margin:0;">🎭 حزم ملصقاتي (${myPackIds.length})</span>
                <button type="button" class="pack-mini-btn" onclick="window.createNewStickerPack()">➕ حزمة جديدة</button>
            </div>`;

        if (myPackIds.length === 0) {
            html += `<div style="background:var(--glass-inner); border:1px dashed var(--border-bright); border-radius:14px; padding:12px; text-align:center; font-size:12px; color:var(--text-dim); margin-bottom:12px;">
                ما عندك حزم بعد — اضغط <b>«➕ حزمة جديدة»</b> أو اضغط على أي ملصق يدزه صديقك بالمحادثة!
            </div>`;
        } else {
            // شريط تبويبات الحزم — يعرض حزمة وحدة فقط بالمرة لمنع التعليق نهائياً
            html += `<div class="pack-tabs-bar">`;
            myPackIds.forEach(pid => {
                const pk = allStickerPacks[pid];
                const cnt = Object.keys(pk.stickers || {}).length;
                html += `<button type="button" class="pack-tab-pill ${pid === activeSelectedPackId ? 'active' : ''}" onclick="window.selectStickerPackTab('${escapeHTML(pid)}')">📦 ${escapeHTML(pk.name)} (${cnt})</button>`;
            });
            html += `</div>`;

            const pack = allStickerPacks[activeSelectedPackId] || allStickerPacks[myPackIds[0]];
            if (pack) {
                const isOwner = pack.owner === me.username;
                const stEntries = Object.entries(pack.stickers || {});
                const visibleSlice = stEntries.slice(0, activePackVisibleCount);

                html += `<div class="pack-head-row">
                    <span class="pack-head-title">${escapeHTML(pack.name)} (${stEntries.length})</span>
                    <div class="pack-head-acts">
                        ${isOwner ? `<button type="button" class="pack-mini-btn" onclick="window.triggerAddStickerToPack('${escapeHTML(pack.id)}')">＋ إضافة</button>` : ""}
                        <button type="button" class="pack-mini-btn danger" onclick="window.removePackFromMyList('${escapeHTML(pack.id)}')">${isOwner ? 'حذف' : 'إزالة'}</button>
                    </div>
                </div><div class="sticker-grid">`;

                if (stEntries.length === 0) {
                    html += `<div class="sticker-tile sticker-create-tile" onclick="window.triggerAddStickerToPack('${escapeHTML(pack.id)}')"><span>＋</span><span>رفع ملصق</span></div>`;
                } else {
                    visibleSlice.forEach(([stId, st]) => {
                        if (!st || !st.src) return;
                        const url = toBlobUrl(st.src);
                        const mediaHTML = st.mediaType === "video"
                            ? `<video class="tg-lazy-vid" data-vsrc="${url}" preload="metadata" loop muted playsinline></video><span class="tg-vid-dot">🎬</span>`
                            : `<img src="${url}" loading="lazy" decoding="async">`;
                        html += `<div class="sticker-tile tg-tile" style="position:relative;" onclick="window.sendPackSticker('${escapeHTML(pack.id)}','${escapeHTML(stId)}')">
                            ${mediaHTML}
                            ${isOwner ? `<button type="button" onclick="event.stopPropagation(); window.deleteStickerFromPack('${escapeHTML(pack.id)}','${escapeHTML(stId)}')" style="position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:50%; border:none; background:rgba(0,0,0,0.72); color:#fff; font-size:10px; cursor:pointer;">✕</button>` : ""}
                        </div>`;
                    });
                }
                html += `</div>`;

                if (stEntries.length > activePackVisibleCount) {
                    html += `<button type="button" class="btn btn-sm btn-outline" style="width:100%; margin-bottom:12px;" onclick="window.showMorePackStickers()">عرض المزيد (+${stEntries.length - activePackVisibleCount})</button>`;
                }
            }
        }

        html += `<div class="st-sec-title">✨ رموز تعبيرية متحركة</div>
            <div class="emoji-grid" style="margin-bottom:10px;">
                ${ANIM_EMOJIS.map(a => `<button type="button" class="emoji-cell" onclick="insertEmojiToInput('[[${a.em}]]')"><span class="anim-em ${a.anim}">${a.em}</span></button>`).join("")}
            </div>`;

        html += `<div class="st-sec-title">🌟 ملصقات مميزة بتأثيرات</div>
            <div class="sticker-grid">
                ${PREM_BIG_STICKERS.map(ps => `
                    <div class="sticker-tile" style="background:${ps.bg}; border-color:rgba(255,255,255,0.2);" onclick="window.sendPremBigSticker('${ps.id}')">
                        <span class="st-em">${ps.em}</span>
                        <span class="st-cap" style="color:#fff;">${escapeHTML(ps.cap)}</span>
                    </div>`).join("")}
            </div>`;

        body.innerHTML = html;
        attachLazyVideos(body);
    }

    // ==================== 7. ربط المميزات مع محرّك V6 بدون لمس ملفاته ====================
    function installHooks() {
        const _origDevBadge = window.getDevBadgeHTML;
        window.getDevBadgeHTML = function (userObj) {
            const base = _origDevBadge ? _origDevBadge(userObj) : "";
            const st = userObj && userObj.statusEmoji ? `<span class="status-em" title="الحالة">${escapeHTML(userObj.statusEmoji)}</span>` : "";
            return base + st;
        };

        const _origSetAvatar = window.setAvatarStyle;
        window.setAvatarStyle = function (el, obj, showOnline = true) {
            if (el && obj && obj.avatarVideo) {
                const sig = String(obj.avatarVideo).slice(-28);
                if (el.getAttribute("data-avid") !== sig) {
                    const url = toBlobUrl(obj.avatarVideo);
                    el.setAttribute("data-avid", sig);
                    el.style.backgroundImage = "none";
                    el.innerHTML = `<div class="av-vid-mask"><video src="${url}" autoplay loop muted playsinline></video></div>` +
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

        const _origFormatRich = window.formatRichText;
        window.formatRichText = function (raw) {
            let html = _origFormatRich ? _origFormatRich(raw) : escapeHTML(raw);
            html = html.replace(/\[\[([^\[\]]{1,8})\]\]/g, (_, em) => {
                const found = ANIM_EMOJIS.find(a => a.em === em);
                return `<span class="anim-em ${found ? found.anim : 'beat'}">${em}</span>`;
            });
            return html;
        };

        const _origReply = window.replyToSelected;
        window.replyToSelected = function () {
            const senderKey = selectedMsg?.data?.sender || "";
            if (_origReply) _origReply();
            if (replyTarget && senderKey) replyTarget.sender = senderKey;
        };

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
                const url = toBlobUrl(m.content);
                const stWrap = document.createElement("div");
                stWrap.className = "tg-st-wrap";
                if (m.mediaType === "video") {
                    stWrap.innerHTML = `<video class="tg-st-media tg-lazy-vid" data-vsrc="${url}" preload="metadata" loop muted playsinline></video>`;
                } else {
                    stWrap.innerHTML = `<img class="tg-st-media" src="${url}" loading="lazy" decoding="async">`;
                }
                if (m.packId) {
                    const hint = document.createElement("span");
                    hint.className = "tg-st-hint";
                    hint.innerText = "📦 الحزمة";
                    stWrap.appendChild(hint);
                }
                stWrap.onclick = e => {
                    e.stopPropagation();
                    window.openStickerPackPreview(m.packId || "", m.content, m.mediaType || "image");
                };
                slot.innerHTML = "";
                slot.appendChild(stWrap);
                attachLazyVideos(stWrap);
            }

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

        const _origDetach = window.detachRoomListeners;
        window.detachRoomListeners = function () {
            stopAndReleaseVideos(document.getElementById("messagesList"));
            if (_origDetach) _origDetach();
        };

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
                applySharedWpToArea(s.val()?.value || "");
            });
        };

        const _origOpenSaved = window.openSavedMessages;
        window.openSavedMessages = function () { detachSharedWp(); _origOpenSaved(); applyWallpaper(localStorage.getItem("app_wp") || "pattern", true); };

        const _origOpenSpace = window.openSpaceRoom;
        window.openSpaceRoom = function (id) { detachSharedWp(); _origOpenSpace(id); applyWallpaper(localStorage.getItem("app_wp") || "pattern", true); };

        const _origCloseChat = window.closeActiveChat;
        window.closeActiveChat = function () { detachSharedWp(); window.toggleEffectPicker(false); _origCloseChat(); };

        // تفريغ الفيديوهات فوراً عند إغلاق لوحة الملصقات أو التبديل لتبويب آخر
        const _origToggleDrawer = window.toggleStickerDrawer;
        window.toggleStickerDrawer = function (force) {
            const d = document.getElementById("stickerDrawer");
            const willShow = typeof force === "boolean" ? force : d.style.display !== "flex";
            if (!willShow) {
                const body = document.getElementById("drawerBody");
                stopAndReleaseVideos(body);
                if (body && activeDrawerTab === "premium") body.innerHTML = "";
            }
            _origToggleDrawer(force);
        };

        const _origSwitchDTab = window.switchDrawerTab;
        window.switchDrawerTab = function (tab) {
            const body = document.getElementById("drawerBody");
            if (body) stopAndReleaseVideos(body);
            _origSwitchDTab(tab);
        };

        const _origRenderDrawer = window.renderDrawerContent;
        window.renderDrawerContent = function () {
            if (typeof activeDrawerTab !== "undefined" && activeDrawerTab === "premium") {
                const body = document.getElementById("drawerBody");
                if (body) renderPremiumDrawerTab(body);
                return;
            }
            if (_origRenderDrawer) _origRenderDrawer();
        };

        // استماع خفيف جداً لقائمة أسماء حزم المستخدم فقط (بدون تحميل بيانات الملصقات عند فتح التطبيق!)
        const _origEnter = window.enterMainApp;
        window.enterMainApp = function (uData) {
            _origEnter(uData);
            db.ref(`user_sticker_packs/${me.username}`).on("value", s => {
                mySavedPacks = s.val() || {};
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
