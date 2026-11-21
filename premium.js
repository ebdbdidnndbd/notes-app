// ==================== نظام المميزات الملكي (V8 — أغاني إنستا + نسمع سوا + شعلة + وضع مختفي — 60fps) ====================
(function () {
    if (window.__PREMIUM_V8_LOADED__) return;
    window.__PREMIUM_V8_LOADED__ = true;

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

    // حالات المميزات
    let selectedMsgEffect = "";
    let sharedWpRef = null;
    let allStickerPacks = {};
    let loadingPacksSet = new Set();
    let mySavedPacks = {};
    let activeSelectedPackId = "";
    let activePackVisibleCount = 12;
    let uploadTargetPackId = null;
    const playedFxIds = new Set();

    // حالات الملاحظات والموسيقى
    let allNotesMap = {};
    let viewingNoteUser = "";
    let draftNoteSong = null;
    let draftStorySong = null;
    let lastMusicResults = [];
    let musicPickerCallback = null;
    let musicPreviewIdx = -1;
    let storyMusicMuted = false;

    // حالات «نسمع سوا» + «الوضع المختفي» + «شعلة التواصل»
    let listenRef = null;
    let currentListenData = null;
    let vanishRef = null;
    let isVanishActive = false;
    let allStreaksMap = {};

    // ==================== محرّك الصوت الموحّد (أغنية واحدة نشطة فقط — صفر تداخل) ====================
    const PremAudio = {
        el: new Audio(),
        context: "",   // "preview" | "note" | "profile" | "story" | "listen"
        currentUrl: "",
        onStateChange: null,
        init() {
            this.el.preload = "auto";
            this.el.addEventListener("ended", () => {
                if (this.el.loop) return;
                this.notify(false);
            });
            this.el.addEventListener("pause", () => this.notify(false));
            this.el.addEventListener("play", () => this.notify(true));
        },
        notify(isPlaying) {
            if (typeof this.onStateChange === "function") {
                try { this.onStateChange(isPlaying, this.context, this.currentUrl); } catch {}
            }
        },
        stop(onlyContext) {
            if (onlyContext && this.context !== onlyContext) return;
            try { this.el.pause(); } catch {}
            this.el.loop = false;
            const prevCtx = this.context;
            this.context = "";
            this.currentUrl = "";
            if (prevCtx) this.notify(false);
        },
        play(url, context, { loop = false, startAt = 0, muted = false } = {}) {
            if (!url) return Promise.resolve(false);
            if (typeof stopAnyVoicePlayback === "function") stopAnyVoicePlayback();
            const same = this.currentUrl === url && this.context === context;
            this.context = context;
            this.el.loop = !!loop;
            this.el.muted = !!muted;
            if (!same) {
                this.currentUrl = url;
                this.el.src = url;
            }
            if (startAt > 0) {
                const seek = () => {
                    try {
                        const dur = this.el.duration || 29.5;
                        this.el.currentTime = startAt % dur;
                    } catch {}
                };
                if (this.el.readyState >= 1) seek();
                else this.el.addEventListener("loadedmetadata", seek, { once: true });
            }
            return this.el.play().then(() => true).catch(() => false);
        },
        toggle(url, context, opts = {}) {
            if (this.currentUrl === url && this.context === context && !this.el.paused) {
                this.el.pause();
                return Promise.resolve(false);
            }
            return this.play(url, context, opts);
        }
    };
    PremAudio.init();

    // محرّك البحث عن الأغاني عبر iTunes (JSONP — يعمل 100% بدون مشاكل CORS وبصفر مساحة على Firebase)
    function searchItunesSongs(query) {
        return new Promise((resolve, reject) => {
            const cbName = "__itCb_" + Date.now() + "_" + Math.floor(Math.random() * 9999);
            const script = document.createElement("script");
            let done = false;
            const cleanup = () => {
                if (script.parentNode) script.parentNode.removeChild(script);
                try { delete window[cbName]; } catch { window[cbName] = undefined; }
            };
            const timer = setTimeout(() => {
                if (done) return;
                done = true;
                cleanup();
                reject(new Error("timeout"));
            }, 9500);

            window[cbName] = data => {
                if (done) return;
                done = true;
                clearTimeout(timer);
                cleanup();
                const list = (data && Array.isArray(data.results) ? data.results : [])
                    .filter(t => t.previewUrl)
                    .map(t => ({
                        title: t.trackName || "أغنية",
                        artist: t.artistName || "",
                        cover: (t.artworkUrl100 || t.artworkUrl60 || "").replace("http://", "https://"),
                        url: (t.previewUrl || "").replace("http://", "https://")
                    }));
                resolve(list);
            };

            script.onerror = () => {
                if (done) return;
                done = true;
                clearTimeout(timer);
                cleanup();
                reject(new Error("network"));
            };
            script.src = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=12&callback=${cbName}`;
            document.head.appendChild(script);
        });
    }

    // ==================== محرّك الذاكرة الخفيف للملصقات (Blob Cache + Video Cap) ====================
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
        } catch { return src; }
    }

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
                if (ent.isIntersecting) requestManagedVideoPlay(ent.target);
                else pauseManagedVideo(ent.target);
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

    // ==================== 1. حقن ستايلات V8 الخفيفة ====================
    function injectPremiumStyles() {
        if (document.getElementById("premStylesV8")) return;
        const s = document.createElement("style");
        s.id = "premStylesV8";
        s.textContent = `
            /* ===== شريط ملاحظات إنستگرام ===== */
            .notes-strip {
                display: flex; gap: 14px; overflow-x: auto; padding: 10px 14px 9px;
                border-bottom: 1px solid var(--border); flex-shrink: 0; align-items: flex-end;
                background: rgba(255,255,255,0.015);
            }
            .note-item {
                display: flex; flex-direction: column; align-items: center;
                min-width: 74px; max-width: 84px; cursor: pointer; flex-shrink: 0; transition: transform 0.14s;
            }
            .note-item:active { transform: scale(0.94); }
            .note-bubble-slot {
                min-height: 38px; display: flex; align-items: flex-end; justify-content: center;
                margin-bottom: -10px; z-index: 3; width: 100%;
            }
            .note-bubble {
                position: relative; background: var(--bg-card); border: 1px solid var(--border-bright);
                color: var(--text); padding: 5px 9px; border-radius: 15px; font-size: 10.5px; font-weight: 700;
                line-height: 1.3; text-align: center; max-width: 86px; min-width: 58px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.42); word-break: break-word;
            }
            .note-bubble.empty-note { color: var(--text-dim); border-style: dashed; background: var(--glass-inner); }
            .note-bubble-txt { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            .note-music-mini {
                display: flex; align-items: center; justify-content: center; gap: 3px;
                font-size: 9.5px; color: var(--accent); margin-top: 2px;
            }
            .note-music-mini span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 58px; }
            .note-bubble::before {
                content: ""; position: absolute; bottom: -5px; right: 14px; width: 8px; height: 8px;
                border-radius: 50%; background: var(--bg-card); border: 1px solid var(--border-bright);
            }
            .note-bubble::after {
                content: ""; position: absolute; bottom: -9px; right: 19px; width: 4.5px; height: 4.5px;
                border-radius: 50%; background: var(--bg-card); border: 1px solid var(--border-bright);
            }
            .note-av-wrap { position: relative; z-index: 1; }
            .note-av-wrap .avatar { width: 52px; height: 52px; font-size: 18px; }
            .note-react-pill {
                position: absolute; bottom: -2px; left: -4px; background: var(--bg-panel);
                border: 1px solid var(--border-bright); border-radius: 99px; font-size: 11px;
                padding: 1px 5px; z-index: 4; box-shadow: 0 2px 6px rgba(0,0,0,0.45);
            }
            .note-name {
                font-size: 11px; color: var(--text-dim); font-weight: 700; margin-top: 5px;
                max-width: 74px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            }
            .note-preview-card {
                background: var(--glass-inner); border: 1px solid var(--border-bright);
                border-radius: 20px; padding: 16px; margin: 10px 0; text-align: center;
            }
            .note-preview-text { font-size: 17px; font-weight: 800; line-height: 1.6; color: var(--text); }
            .note-quick-reacts { display: flex; justify-content: center; gap: 10px; margin: 10px 0 12px; }
            .note-qr-btn {
                width: 42px; height: 42px; border-radius: 50%; border: 1px solid var(--border);
                background: var(--bg-card); font-size: 20px; cursor: pointer; transition: transform 0.14s;
            }
            .note-qr-btn:active { transform: scale(1.22); }
            .note-qr-btn.mine { border-color: var(--accent); background: rgba(56,189,248,0.22); }

            /* ===== نظام الموسيقى (المشغلات + الإكوالايزر + نافذة البحث) ===== */
            .eq-bars { display: inline-flex; align-items: flex-end; gap: 2px; height: 12px; flex-shrink: 0; }
            .eq-bars i { width: 2.5px; background: var(--accent); border-radius: 2px; height: 4px; }
            .eq-bars.on i { animation: eqAnim 0.7s ease-in-out infinite alternate; }
            .eq-bars.on i:nth-child(2) { animation-delay: 0.2s; }
            .eq-bars.on i:nth-child(3) { animation-delay: 0.4s; }
            @keyframes eqAnim { 0% { height: 3px; } 100% { height: 12px; } }
            @keyframes discSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

            .song-card-inline {
                display: flex; align-items: center; gap: 10px;
                background: linear-gradient(135deg, rgba(14,165,233,0.12), rgba(139,92,246,0.12));
                border: 1px solid var(--border-bright); border-radius: 16px;
                padding: 8px 10px; margin-top: 10px; text-align: right;
            }
            .song-cover {
                width: 42px; height: 42px; border-radius: 12px; object-fit: cover; flex-shrink: 0;
                background: var(--bg-card); border: 1px solid rgba(255,255,255,0.18);
            }
            .song-cover.round { border-radius: 50%; }
            .song-cover.spin { animation: discSpin 6s linear infinite; }
            .song-meta { flex: 1; min-width: 0; }
            .song-meta strong { display: block; font-size: 13px; font-weight: 800; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .song-meta span { display: block; font-size: 11px; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .song-play-btn {
                width: 34px; height: 34px; border-radius: 50%; border: none;
                background: var(--primary-grad); color: #fff; font-size: 14px;
                cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
            }

            .music-res-item {
                display: flex; align-items: center; gap: 10px; padding: 8px 10px;
                background: var(--glass-inner); border: 1px solid var(--border);
                border-radius: 14px; margin-bottom: 7px;
            }

            /* شريط أغنية الستوري العائم */
            .sv-music-pill {
                position: absolute; top: 12px; right: 12px; z-index: 6;
                display: flex; align-items: center; gap: 8px; max-width: 78%;
                background: rgba(8, 13, 26, 0.78); border: 1px solid rgba(255,255,255,0.22);
                border-radius: 99px; padding: 5px 10px 5px 6px; color: #fff;
            }
            .sv-music-pill img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
            .sv-music-pill .svm-txt { min-width: 0; font-size: 11.5px; line-height: 1.25; }
            .sv-music-pill .svm-txt b { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
            .sv-music-pill .svm-txt span { display: block; font-size: 10px; color: rgba(255,255,255,0.72); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
            .sv-mute-btn {
                width: 28px; height: 28px; border-radius: 50%; border: none;
                background: rgba(255,255,255,0.16); color: #fff; font-size: 13px; cursor: pointer; flex-shrink: 0;
            }

            /* ===== شريط «نسمع سوا 🎧» أعلى المحادثة ===== */
            #listenTogetherBar {
                display: none; align-items: center; gap: 9px; padding: 7px 12px;
                background: linear-gradient(90deg, rgba(14,165,233,0.20), rgba(139,92,246,0.22));
                border-bottom: 1px solid var(--border-bright); flex-shrink: 0; z-index: 5;
            }
            #listenTogetherBar.open { display: flex; }
            .lt-info { flex: 1; min-width: 0; }
            .lt-info strong { display: flex; align-items: center; gap: 5px; font-size: 12.5px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .lt-info span { display: block; font-size: 10.5px; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .lt-btn {
                width: 30px; height: 30px; border-radius: 50%; border: 1px solid var(--border-bright);
                background: rgba(0,0,0,0.35); color: #fff; font-size: 13px; cursor: pointer;
                display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
            }
            .lt-sync-pill {
                background: var(--primary-grad); border: none; color: #fff;
                font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 99px; cursor: pointer; flex-shrink: 0;
            }

            /* ===== شعلة التواصل (Streak 🔥) ===== */
            .streak-pill {
                display: inline-flex; align-items: center; gap: 2px;
                background: linear-gradient(135deg, rgba(249,115,22,0.22), rgba(239,68,68,0.22));
                border: 1px solid rgba(251,146,60,0.45);
                color: #fdba74; font-size: 10.5px; font-weight: 800;
                padding: 1px 6px; border-radius: 99px; margin-right: 5px; flex-shrink: 0;
            }
            .streak-pill.warn { border-style: dashed; color: #fde047; }

            /* ===== الوضع المختفي (Vanish Mode 👻) ===== */
            #vanishBanner {
                display: none; align-items: center; justify-content: space-between; gap: 8px;
                padding: 6px 12px; font-size: 11.5px; font-weight: 800; color: #e9d5ff;
                background: linear-gradient(90deg, #1e1036, #311557, #1e1036);
                border-bottom: 1px solid rgba(192,132,252,0.35); flex-shrink: 0;
            }
            #vanishBanner.open { display: flex; }
            .chat-pane.vanish-on { background: #07040e !important; }
            .chat-pane.vanish-on .messages-area {
                background-image: radial-gradient(rgba(168,85,247,0.14) 1.3px, transparent 1.3px) !important;
                background-size: 24px 24px !important;
            }
            .chat-pane.vanish-on .input-area {
                background: #0d0719 !important; border-top-color: rgba(192,132,252,0.32) !important;
            }
            .pill-act.vanish-active { background: rgba(168,85,247,0.32) !important; color: #e9d5ff !important; }
            .msg-wrap.vanish-msg .msg-bubble {
                border: 1px dashed rgba(192,132,252,0.58) !important;
                box-shadow: 0 3px 14px rgba(139,92,246,0.22);
            }
            .vanish-tag { font-size: 10px; opacity: 0.9; margin-left: 3px; }

            /* ===== ستايلات المميزات السابقة (V7.2) ===== */
            .status-em { display: inline-block; margin-right: 4px; font-size: 14px; animation: premFloat 2.4s ease-in-out infinite; vertical-align: middle; }
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

            .av-vid-mask { position: absolute; inset: 0; border-radius: 50%; overflow: hidden; pointer-events: none; z-index: 0; }
            .av-vid-mask video { width: 100%; height: 100%; object-fit: cover; display: block; }
            .avatar .online-badge { z-index: 2; }

            #fxStage { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 9500; }
            .fx-p { position: fixed; font-size: 28px; will-change: transform, opacity; animation: fxFly var(--dur, 2.2s) cubic-bezier(0.2, 0.7, 0.3, 1) forwards; }
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
            .tg-st-media { width: 148px; height: 148px; object-fit: contain; border-radius: 14px; display: block; background: transparent; }
            .tg-st-hint {
                position: absolute; bottom: 4px; right: 4px; background: rgba(8, 13, 26, 0.78);
                border: 1px solid rgba(255,255,255,0.22); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 99px;
            }
            .tg-tile { contain: content; }
            .tg-tile video { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; pointer-events: none; background: rgba(0,0,0,0.2); }
            .tg-vid-dot { position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.68); color: #fff; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 6px; pointer-events: none; }

            .pack-tabs-bar { display: flex; gap: 6px; overflow-x: auto; padding: 2px 0 8px; margin-bottom: 4px; }
            .pack-tab-pill { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-dim); padding: 5px 11px; border-radius: 99px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
            .pack-tab-pill.active { background: var(--primary-grad); border-color: transparent; color: #fff; }
            .pack-head-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin: 4px 0 8px; padding: 6px 10px; background: var(--glass-inner); border: 1px solid var(--border); border-radius: 12px; }
            .pack-head-title { font-size: 12.5px; font-weight: 800; color: var(--text); }
            .pack-head-acts { display: flex; gap: 5px; }
            .pack-mini-btn { border: 1px solid var(--border); background: var(--bg-card); color: var(--accent); font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 8px; cursor: pointer; }
            .pack-mini-btn.danger { color: #fb7185; border-color: rgba(244,63,94,0.3); }

            .prem-color-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 8px 0 14px; }
            .prem-color-dot { height: 38px; border-radius: 12px; cursor: pointer; border: 2px solid transparent; color: #fff; font-size: 11.5px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
            .prem-color-dot.active { border-color: #fff; transform: scale(1.05); }
            .status-em-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 7px; margin: 8px 0 14px; }
            .status-em-btn { height: 40px; border-radius: 12px; border: 1px solid var(--border); background: var(--glass-inner); font-size: 20px; cursor: pointer; color: var(--text); }
            .status-em-btn.active { border-color: var(--accent); background: rgba(56,189,248,0.22); }
            .swp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 10px 0; }
            .swp-tile { height: 62px; border-radius: 14px; border: 2px solid var(--border); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #fff; }
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

        // شريط ملاحظات إنستگرام تحت الستوري
        const storiesStrip = document.getElementById("storiesStrip");
        if (storiesStrip && !document.getElementById("notesStrip")) {
            const ns = document.createElement("div");
            ns.id = "notesStrip";
            ns.className = "notes-strip";
            storiesStrip.parentNode.insertBefore(ns, storiesStrip.nextSibling);
        }

        // شريط «نسمع سوا 🎧» و شريط «الوضع المختفي 👻» فوق الرسائل
        const pinnedBar = document.getElementById("pinnedBar");
        if (pinnedBar && !document.getElementById("listenTogetherBar")) {
            const lt = document.createElement("div");
            lt.id = "listenTogetherBar";
            pinnedBar.parentNode.insertBefore(lt, pinnedBar.nextSibling);

            const vb = document.createElement("div");
            vb.id = "vanishBanner";
            vb.innerHTML = `<span>👻 الوضع المختفي مُفعّل — الرسائل تختفي بعد قراءتها</span><button type="button" class="pack-mini-btn" onclick="window.toggleVanishMode()">إيقاف</button>`;
            lt.parentNode.insertBefore(vb, lt.nextSibling);
        }

        // أزرار الشات الخاصة: «نسمع سوا 🎧» + «الوضع المختفي 👻» + «الخلفية المشتركة 🎨»
        const actionsPill = document.querySelector(".chat-actions-pill");
        if (actionsPill && !document.getElementById("btnSharedWp")) {
            const wpBtn = document.createElement("button");
            wpBtn.id = "btnSharedWp"; wpBtn.className = "pill-act"; wpBtn.title = "خلفية لكلا الطرفين";
            wpBtn.style.display = "none"; wpBtn.innerText = "🎨";
            wpBtn.onclick = () => window.openSharedWpModal();

            const ltBtn = document.createElement("button");
            ltBtn.id = "btnListenTogether"; ltBtn.className = "pill-act"; ltBtn.title = "نسمع أغنية سوا";
            ltBtn.style.display = "none"; ltBtn.innerText = "🎧";
            ltBtn.onclick = () => window.startListenTogetherPicker();

            const vnBtn = document.createElement("button");
            vnBtn.id = "btnVanishMode"; vnBtn.className = "pill-act"; vnBtn.title = "الوضع المختفي (رسائل مؤقتة)";
            vnBtn.style.display = "none"; vnBtn.innerText = "👻";
            vnBtn.onclick = () => window.toggleVanishMode();

            actionsPill.insertBefore(wpBtn, actionsPill.firstChild);
            actionsPill.insertBefore(vnBtn, wpBtn);
            actionsPill.insertBefore(ltBtn, vnBtn);
        }

        // خانة أغنية البروفايل (بحسابي وبحساب الأصدقاء)
        const myProfBio = document.getElementById("myProfBio");
        if (myProfBio && !document.getElementById("myProfileSongSlot")) {
            const div = document.createElement("div");
            div.id = "myProfileSongSlot";
            myProfBio.parentNode.insertBefore(div, myProfBio.nextSibling);
        }
        const upBio = document.getElementById("upBio");
        if (upBio && !document.getElementById("otherProfileSongSlot")) {
            const div = document.createElement("div");
            div.id = "otherProfileSongSlot";
            div.style.marginBottom = "10px";
            upBio.parentNode.insertBefore(div, upBio.nextSibling);
        }

        // زر إضافة أغنية داخل نافذة إنشاء الستوري
        const stModalCard = document.querySelector("#createStoryModal .glass-card");
        if (stModalCard && !document.getElementById("storyMusicDraftSlot")) {
            const pubBtn = stModalCard.querySelector("button.btn:last-child");
            const box = document.createElement("div");
            box.id = "storyMusicDraftSlot";
            box.style.marginTop = "10px";
            if (pubBtn) stModalCard.insertBefore(box, pubBtn);
            else stModalCard.appendChild(box);
        }

        // نافذة البحث واختيار الأغاني (مشتركة للملاحظات والبروفايل والستوري ونسمع سوا)
        if (!document.getElementById("musicPickerModal")) {
            const m = document.createElement("div");
            m.id = "musicPickerModal";
            m.className = "modal-bg sheet-bg story-top-modal";
            m.onclick = e => { if (e.target === m) window.closeMusicPicker(); };
            m.innerHTML = `
                <div class="bottom-sheet" style="max-height:84dvh; display:flex; flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <h4 id="mpTitle">🎵 اختر أغنية</h4>
                        <button class="icon-btn" style="width:32px; height:32px;" onclick="window.closeMusicPicker()">✕</button>
                    </div>
                    <div style="display:flex; gap:7px; margin-bottom:10px;">
                        <input type="text" id="musicSearchInp" class="input" placeholder="ابحث باسم الأغنية أو المطرب (مثال: كاظم، ماجد، حسام)..." onkeydown="if(event.key==='Enter'){event.preventDefault(); window.runMusicSearch();}">
                        <button class="btn" style="width:82px;" onclick="window.runMusicSearch()">بحث</button>
                    </div>
                    <div style="display:flex; gap:6px; overflow-x:auto; margin-bottom:10px; padding-bottom:2px;">
                        <button type="button" class="pack-tab-pill" onclick="window.quickMusicQuery('كاظم الساهر')">كاظم الساهر</button>
                        <button type="button" class="pack-tab-pill" onclick="window.quickMusicQuery('ماجد المهندس')">ماجد المهندس</button>
                        <button type="button" class="pack-tab-pill" onclick="window.quickMusicQuery('سيف نبيل')">سيف نبيل</button>
                        <button type="button" class="pack-tab-pill" onclick="window.quickMusicQuery('محمود التركي')">محمود التركي</button>
                        <button type="button" class="pack-tab-pill" onclick="window.quickMusicQuery('أصيل هميم')">أصيل هميم</button>
                        <button type="button" class="pack-tab-pill" onclick="window.quickMusicQuery('حسام الرسام')">حسام الرسام</button>
                    </div>
                    <div id="musicResultsList" style="flex:1; overflow-y:auto; max-height:52dvh;">
                        <div style="text-align:center; padding:26px 10px; color:var(--text-dim); font-size:13px;">
                            اكتب اسم أي أغنية عراقية أو عربية أو أجنبية واضغط بحث 🎧
                        </div>
                    </div>
                </div>`;
            document.body.appendChild(m);
        }

        // نافذة كتابة / تعديل ملاحظتي (مع اختيار أغنية حقيقية)
        if (!document.getElementById("noteComposeModal")) {
            const m = document.createElement("div");
            m.id = "noteComposeModal";
            m.className = "modal-bg sheet-bg";
            m.onclick = e => { if (e.target === m) m.style.display = "none"; };
            m.innerHTML = `
                <div class="bottom-sheet">
                    <h4 style="text-align:center; margin-bottom:4px;">💭 ملاحظة جديدة (24 ساعة)</h4>
                    <div style="text-align:center; font-size:11.5px; color:var(--text-dim); margin-bottom:12px;">تظهر فوق صورتك مع أغنيتك المختارة نفس إنستگرام</div>
                    <div class="form-group">
                        <label>ملاحظتك (<span id="noteCharCnt">0</span>/60)</label>
                        <input type="text" id="noteTextInput" class="input" maxlength="60" placeholder="شنو ابالك هسة؟..." oninput="document.getElementById('noteCharCnt').innerText=this.value.length" onkeydown="if(event.key==='Enter'){event.preventDefault(); window.publishMyNote();}">
                    </div>
                    <div class="form-group">
                        <label>🎵 أغنية الملاحظة (اختياري)</label>
                        <div id="noteSongDraftSlot"></div>
                    </div>
                    <div id="myNoteLikesBox" style="margin-bottom:10px;"></div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn" style="flex:1;" onclick="window.publishMyNote()">مشاركة الملاحظة ✨</button>
                        <button class="btn btn-danger btn-sm" id="delMyNoteBtn" style="display:none;" onclick="window.deleteMyNote()">حذف</button>
                    </div>
                </div>`;
            document.body.appendChild(m);
        }

        // نافذة عرض ملاحظة صديق + تشغيل الأغنية تلقائياً + تفاعل + رد مباشر للخاص
        if (!document.getElementById("noteViewModal")) {
            const m = document.createElement("div");
            m.id = "noteViewModal";
            m.className = "modal-bg sheet-bg";
            m.onclick = e => { if (e.target === m) window.closeFriendNoteView(); };
            m.innerHTML = `
                <div class="bottom-sheet">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                        <div style="display:flex; align-items:center; gap:9px;">
                            <div class="avatar sm" id="nvAvatar">؟</div>
                            <div>
                                <div id="nvName" style="font-weight:800; font-size:14px; display:flex; align-items:center; gap:4px;">الاسم</div>
                                <div id="nvTime" style="font-size:11px; color:var(--text-dim);">الآن</div>
                            </div>
                        </div>
                        <button class="icon-btn" style="width:32px; height:32px;" onclick="window.closeFriendNoteView()">✕</button>
                    </div>
                    <div class="note-preview-card">
                        <div class="note-preview-text" id="nvText"></div>
                        <div id="nvMusicWrap"></div>
                    </div>
                    <div class="note-quick-reacts" id="nvReactsRow"></div>
                    <div style="display:flex; gap:8px;">
                        <input type="text" id="nvReplyInput" class="input" placeholder="رد على الملاحظة..." onkeydown="if(event.key==='Enter'){event.preventDefault(); window.replyToViewedNote();}">
                        <button class="btn" style="width:88px;" onclick="window.replyToViewedNote()">إرسال</button>
                    </div>
                </div>`;
            document.body.appendChild(m);
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
            fxBtn.id = "fxToggleBtn"; fxBtn.className = "icon-btn"; fxBtn.title = "تأثير متحرك للرسالة"; fxBtn.innerText = "✨";
            fxBtn.onclick = () => window.toggleEffectPicker();
            sendBtn.parentNode.insertBefore(fxBtn, sendBtn);
        }

        const dbt = document.querySelector(".drawer-bottom-tabs");
        if (dbt && !dbt.querySelector('[data-dtab="premium"]')) {
            const btn = document.createElement("button");
            btn.className = "dbt-btn"; btn.setAttribute("data-dtab", "premium"); btn.innerText = "✨ مميز";
            btn.onclick = () => switchDrawerTab("premium");
            dbt.insertBefore(btn, dbt.querySelector(".dbt-close"));
        }

        const profBtnRow = document.querySelector("#view-profile .prof-av-row > div:last-child");
        if (profBtnRow && !document.getElementById("openPremProfileBtn")) {
            const b = document.createElement("button");
            b.id = "openPremProfileBtn"; b.className = "btn btn-sm btn-gold"; b.innerText = "✨ مميز";
            b.onclick = () => window.openPremiumModal();
            profBtnRow.insertBefore(b, profBtnRow.firstChild);
        }

        if (!document.getElementById("premiumModal")) {
            const m = document.createElement("div");
            m.id = "premiumModal"; m.className = "modal-bg";
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
                        <label>3. أغنية الملف الشخصي (نفس إنستگرام):</label>
                        <div style="display:flex; gap:8px;">
                            <button class="btn btn-sm" style="flex:1;" onclick="document.getElementById('premiumModal').style.display='none'; window.pickMyProfileSong()">🎵 اختيار / تغيير الأغنية</button>
                            <button class="btn btn-sm btn-outline" onclick="window.removeMyProfileSong()">إزالة</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>4. صورة متحركة للملف الشخصي (فيديو قصير أو GIF):</label>
                        <input type="file" id="premAnimAvInput" accept="video/mp4,video/webm,image/gif" style="display:none" onchange="window.handleAnimAvatarUpload(event)">
                        <div style="display:flex; gap:8px;">
                            <button class="btn btn-sm" style="flex:1;" onclick="document.getElementById('premAnimAvInput').click()">🎬 رفع فيديو/GIF</button>
                            <button class="btn btn-sm btn-outline" onclick="window.removeAnimAvatar()">إزالة الفيديو</button>
                        </div>
                    </div>
                    <button class="btn btn-outline btn-sm" style="margin-top:8px; width:100%;" onclick="document.getElementById('premiumModal').style.display='none'">إغلاق</button>
                </div>`;
            document.body.appendChild(m);
        }

        if (!document.getElementById("sharedWpModal")) {
            const m = document.createElement("div");
            m.id = "sharedWpModal"; m.className = "modal-bg";
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
            m.id = "stickerPackPreviewModal"; m.className = "modal-bg sheet-bg story-top-modal";
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
            inp.type = "file"; inp.id = "tgStickerUploadInput"; inp.multiple = true;
            inp.accept = "image/gif,image/webp,image/png,image/jpeg,video/webm,video/mp4";
            inp.style.display = "none";
            inp.onchange = e => window.handleUploadStickersToPack(e);
            document.body.appendChild(inp);
        }
    }

    // ==================== 3. واجهة البحث واختيار الأغاني (iTunes) ====================
    window.openMusicPicker = function (title, onSelect) {
        musicPickerCallback = onSelect;
        musicPreviewIdx = -1;
        document.getElementById("mpTitle").innerText = title || "🎵 اختر أغنية";
        document.getElementById("musicSearchInp").value = "";
        document.getElementById("musicPickerModal").style.display = "flex";
        setTimeout(() => document.getElementById("musicSearchInp").focus(), 90);
    };

    window.closeMusicPicker = function () {
        PremAudio.stop("preview");
        musicPreviewIdx = -1;
        document.getElementById("musicPickerModal").style.display = "none";
    };

    window.quickMusicQuery = function (q) {
        document.getElementById("musicSearchInp").value = q;
        window.runMusicSearch();
    };

    window.runMusicSearch = async function () {
        const q = (document.getElementById("musicSearchInp").value || "").trim();
        const box = document.getElementById("musicResultsList");
        if (!q) { showToast("اكتب اسم الأغنية أو المطرب أولاً"); return; }

        PremAudio.stop("preview");
        musicPreviewIdx = -1;
        box.innerHTML = `<div style="text-align:center; padding:26px; color:var(--text-dim); font-size:13px;">⏳ جاري البحث عن الأغاني...</div>`;

        try {
            const list = await searchItunesSongs(q);
            lastMusicResults = list;
            if (!list.length) {
                box.innerHTML = `<div style="text-align:center; padding:26px; color:var(--text-dim); font-size:13px;">ما لگينا نتائج لـ «${escapeHTML(q)}» — جرّب اسم المطرب أو كلمة ثانية</div>`;
                return;
            }
            renderMusicSearchResults();
        } catch {
            box.innerHTML = `<div style="text-align:center; padding:26px; color:#fb7185; font-size:13px;">تعذر البحث حالياً — تأكد من النت وحاول مرة ثانية</div>`;
        }
    };

    function renderMusicSearchResults() {
        const box = document.getElementById("musicResultsList");
        if (!box) return;
        box.innerHTML = lastMusicResults.map((s, i) => {
            const isPlaying = musicPreviewIdx === i && PremAudio.context === "preview" && !PremAudio.el.paused;
            return `<div class="music-res-item">
                <img class="song-cover ${isPlaying ? 'round spin' : ''}" src="${escapeHTML(s.cover)}" onerror="this.style.visibility='hidden'">
                <div class="song-meta">
                    <strong>${escapeHTML(s.title)}</strong>
                    <span>${escapeHTML(s.artist)}</span>
                </div>
                <button type="button" class="song-play-btn" title="معاينة" onclick="window.previewMusicResult(${i})">${isPlaying ? "⏸" : "▶"}</button>
                <button type="button" class="btn btn-sm" onclick="window.pickMusicResult(${i})">اختيار</button>
            </div>`;
        }).join("");
    }

    window.previewMusicResult = async function (idx) {
        const s = lastMusicResults[idx];
        if (!s) return;
        if (musicPreviewIdx === idx && PremAudio.context === "preview" && !PremAudio.el.paused) {
            PremAudio.stop("preview");
            musicPreviewIdx = -1;
            renderMusicSearchResults();
            return;
        }
        musicPreviewIdx = idx;
        await PremAudio.play(s.url, "preview", { loop: false });
        renderMusicSearchResults();
    };

    window.pickMusicResult = function (idx) {
        const s = lastMusicResults[idx];
        const cb = musicPickerCallback;
        window.closeMusicPicker();
        if (s && typeof cb === "function") cb(s);
    };

    // ==================== 4. أغنية البروفايل (بحسابي وبحساب الأصدقاء) ====================
    function renderSongCardInto(containerId, song, ctxKey, isMine) {
        const box = document.getElementById(containerId);
        if (!box) return;
        if (!song || !song.url) {
            if (isMine) {
                box.innerHTML = `<button type="button" class="btn btn-sm btn-outline" style="width:100%; margin:4px 0 8px; border-style:dashed;" onclick="window.pickMyProfileSong()">🎵 إضافة أغنيتك المفضلة للبروفايل</button>`;
            } else {
                box.innerHTML = "";
            }
            return;
        }
        const playing = PremAudio.context === ctxKey && PremAudio.currentUrl === song.url && !PremAudio.el.paused;
        box.innerHTML = `
            <div class="song-card-inline">
                <img class="song-cover round ${playing ? 'spin' : ''}" src="${escapeHTML(song.cover || '')}" onerror="this.style.display='none'">
                <div class="song-meta">
                    <strong><span class="eq-bars ${playing ? 'on' : ''}"><i></i><i></i><i></i></span> &nbsp;${escapeHTML(song.title)}</strong>
                    <span>${escapeHTML(song.artist || "مقطع صوتي")}</span>
                </div>
                <button type="button" class="song-play-btn" onclick="window.toggleProfileSongPlay('${ctxKey}', '${escapeHTML(containerId)}')">${playing ? "⏸" : "▶"}</button>
                ${isMine ? `<button type="button" class="pack-mini-btn" onclick="window.pickMyProfileSong()">تغيير</button>` : ""}
            </div>`;
        box._songObj = song;
    }

    window.toggleProfileSongPlay = async function (ctxKey, containerId) {
        const box = document.getElementById(containerId);
        const song = box?._songObj;
        if (!song || !song.url) return;
        await PremAudio.toggle(song.url, ctxKey, { loop: true });
        renderSongCardInto(containerId, song, ctxKey, containerId === "myProfileSongSlot");
    };

    window.pickMyProfileSong = function () {
        window.openMusicPicker("🎵 اختر أغنية لبروفايلك", async song => {
            if (!me) return;
            await db.ref(`users/${me.username}/profileSong`).set(song);
            me.profileSong = song;
            renderSongCardInto("myProfileSongSlot", song, "profile_me", true);
            showToast(`تم تثبيت «${song.title}» ببروفايلك 🎵✨`);
        });
    };

    window.removeMyProfileSong = async function () {
        if (!me) return;
        PremAudio.stop("profile_me");
        await db.ref(`users/${me.username}/profileSong`).remove();
        me.profileSong = null;
        renderSongCardInto("myProfileSongSlot", null, "profile_me", true);
        showToast("تمت إزالة أغنية البروفايل");
    };

    // ==================== 5. ميزة «نسمع سوا 🎧» داخل المحادثة الخاصة ====================
    window.startListenTogetherPicker = function () {
        if (activeChatType !== "dm" || !activeRoomId) return;
        window.openMusicPicker("🎧 اختر أغنية نسمعها سوا", async song => {
            if (activeChatType !== "dm" || !activeRoomId) return;
            const now = Date.now();
            const payload = {
                title: song.title, artist: song.artist, cover: song.cover, url: song.url,
                playing: true, startedAt: now, offset: 0, by: me.name, byUser: me.username, ts: now
            };
            await db.ref(`chats/${activeRoomId}/listen_together`).set(payload);
            PremAudio.play(song.url, "listen", { loop: true, startAt: 0 });
            showToast(`🎧 بدأت جلسة استماع: ${song.title}`);
        });
    };

    window.toggleListenTogetherPlay = async function () {
        if (activeChatType !== "dm" || !activeRoomId || !currentListenData) return;
        const d = currentListenData;
        const now = Date.now();
        if (d.playing) {
            const elapsed = Math.max(0, (now - (d.startedAt || now)) / 1000);
            const newOffset = ((d.offset || 0) + elapsed) % 29.5;
            await db.ref(`chats/${activeRoomId}/listen_together`).update({ playing: false, offset: newOffset, startedAt: now });
        } else {
            await db.ref(`chats/${activeRoomId}/listen_together`).update({ playing: true, startedAt: now });
            PremAudio.play(d.url, "listen", { loop: true, startAt: d.offset || 0 });
        }
    };

    window.syncListenTogetherTap = function () {
        if (!currentListenData || !currentListenData.url) return;
        const elapsed = currentListenData.playing ? Math.max(0, (Date.now() - (currentListenData.startedAt || Date.now())) / 1000) : 0;
        const pos = (currentListenData.offset || 0) + elapsed;
        PremAudio.play(currentListenData.url, "listen", { loop: true, startAt: pos }).then(ok => {
            if (ok) renderListenTogetherBar(currentListenData, false);
        });
    };

    window.stopListenTogether = async function () {
        PremAudio.stop("listen");
        if (activeChatType === "dm" && activeRoomId) {
            await db.ref(`chats/${activeRoomId}/listen_together`).remove();
        }
    };

    function renderListenTogetherBar(data, needsTap = false) {
        const bar = document.getElementById("listenTogetherBar");
        if (!bar) return;
        if (!data || !data.url) {
            bar.classList.remove("open");
            bar.innerHTML = "";
            return;
        }
        const isActuallyPlaying = data.playing && PremAudio.context === "listen" && !PremAudio.el.paused;
        bar.classList.add("open");
        bar.innerHTML = `
            <img class="song-cover round ${isActuallyPlaying ? 'spin' : ''}" style="width:36px; height:36px;" src="${escapeHTML(data.cover || '')}" onerror="this.style.display='none'">
            <div class="lt-info">
                <strong><span class="eq-bars ${isActuallyPlaying ? 'on' : ''}"><i></i><i></i><i></i></span> ${escapeHTML(data.title)}</strong>
                <span>🎧 نسمع سوا • ${escapeHTML(data.artist || "")} (${escapeHTML(data.by || "")})</span>
            </div>
            ${needsTap
                ? `<button type="button" class="lt-sync-pill" onclick="window.syncListenTogetherTap()">▶ استمع الآن</button>`
                : `<button type="button" class="lt-btn" title="تشغيل/إيقاف للطرفين" onclick="window.toggleListenTogetherPlay()">${data.playing ? "⏸" : "▶"}</button>`
            }
            <button type="button" class="lt-btn" title="تغيير الأغنية" onclick="window.startListenTogetherPicker()">🎵</button>
            <button type="button" class="lt-btn" title="إنهاء الجلسة" onclick="window.stopListenTogether()">✕</button>`;
    }

    function detachListenTogether() {
        if (listenRef) { listenRef.off(); listenRef = null; }
        currentListenData = null;
        PremAudio.stop("listen");
        renderListenTogetherBar(null);
        const btn = document.getElementById("btnListenTogether");
        if (btn) btn.style.display = "none";
    }

    // ==================== 6. شعلة التواصل (Streak 🔥) ====================
    function getLocalDayKey(ts = Date.now()) {
        const d = new Date(ts);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    function diffDays(dayA, dayB) {
        if (!dayA || !dayB) return 999;
        const [y1, m1, d1] = dayA.split("-").map(Number);
        const [y2, m2, d2] = dayB.split("-").map(Number);
        const t1 = Date.UTC(y1, m1 - 1, d1);
        const t2 = Date.UTC(y2, m2 - 1, d2);
        return Math.round((t2 - t1) / 86400000);
    }

    function getActiveStreakInfo(roomId) {
        const st = allStreaksMap[roomId];
        if (!st || !st.lastDay || !st.count) return null;
        const gap = diffDays(st.lastDay, getLocalDayKey());
        if (gap === 0) return { count: st.count, warn: false };
        if (gap === 1) return { count: st.count, warn: true };
        return null;
    }

    async function bumpDmStreak(roomId) {
        if (!roomId) return;
        const today = getLocalDayKey();
        const cur = allStreaksMap[roomId];
        if (!cur || !cur.lastDay) {
            await db.ref(`chat_streaks/${roomId}`).set({ count: 1, lastDay: today, updatedAt: Date.now() }).catch(() => {});
            return;
        }
        const gap = diffDays(cur.lastDay, today);
        if (gap === 0) return;
        if (gap === 1) {
            const next = (cur.count || 1) + 1;
            await db.ref(`chat_streaks/${roomId}`).set({ count: next, lastDay: today, updatedAt: Date.now() }).catch(() => {});
            showToast(`🔥 شعلة التواصل وصلت ${next} أيام متواصلة!`);
        } else if (gap > 1) {
            await db.ref(`chat_streaks/${roomId}`).set({ count: 1, lastDay: today, updatedAt: Date.now() }).catch(() => {});
        }
    }

    // ==================== 7. الوضع المختفي (Vanish Mode 👻) ====================
    function applyVanishUI(active) {
        isVanishActive = !!active;
        const pane = document.getElementById("chatPane");
        const banner = document.getElementById("vanishBanner");
        const btn = document.getElementById("btnVanishMode");
        if (pane) pane.classList.toggle("vanish-on", isVanishActive);
        if (banner) banner.classList.toggle("open", isVanishActive);
        if (btn) btn.classList.toggle("vanish-active", isVanishActive);
    }

    window.toggleVanishMode = async function () {
        if (activeChatType !== "dm" || !activeRoomId) return;
        const roomCopy = activeRoomId;
        const nextState = !isVanishActive;
        await db.ref(`chats/${roomCopy}/vanish_mode`).set({ active: nextState, by: me.name, ts: Date.now() });
        if (!nextState) {
            await cleanupVanishMessages(roomCopy, true);
            showToast("تم إيقاف الوضع المختفي ومسح رسائله 👻");
        } else {
            showToast("👻 تم تفعيل الوضع المختفي لكليكما");
        }
    };

    async function cleanupVanishMessages(roomId, deleteAll) {
        if (!roomId || !me) return;
        try {
            const snap = await db.ref(`chats/${roomId}/messages`).once("value");
            const updates = {};
            let removedCount = 0;
            snap.forEach(ch => {
                const m = ch.val();
                if (!m || !m.vanish) return;
                // إذا أُغلق الوضع: احذف كل رسائل الوضع المختفي. وإذا خرجت من الشات: احذف المقروءة فقط حتى لا تضيع غير المقروءة على الطرف الثاني.
                if (deleteAll || m.seen || m.sender !== me.username) {
                    updates[ch.key] = null;
                    removedCount++;
                }
            });
            if (removedCount > 0) {
                await db.ref(`chats/${roomId}/messages`).update(updates);
                await db.ref(`chat_meta/${roomId}/lastMsg`).set("👻 اختفت رسائل الوضع المختفي").catch(() => {});
            }
        } catch {}
    }

    function detachVanishMode(shouldCleanSeen = false) {
        const roomCopy = activeRoomId;
        const wasOn = isVanishActive;
        if (vanishRef) { vanishRef.off(); vanishRef = null; }
        applyVanishUI(false);
        const btn = document.getElementById("btnVanishMode");
        if (btn) btn.style.display = "none";
        if (shouldCleanSeen && wasOn && roomCopy) cleanupVanishMessages(roomCopy, false);
    }

    // ==================== 8. نظام ملاحظات إنستگرام + الأغنية الحقيقية ====================
    function getActiveNote(username) {
        const n = allNotesMap[username];
        if (!n || (!n.text && !n.song) || (n.expiresAt && n.expiresAt <= Date.now())) return null;
        return n;
    }

    function renderNotesStrip() {
        const strip = document.getElementById("notesStrip");
        if (!strip || !me) return;
        strip.innerHTML = "";

        const buildBubbleHTML = note => {
            if (!note) return `<div class="note-bubble empty-note">ملاحظة...</div>`;
            const songTitle = note.song?.title || note.music || "";
            return `<div class="note-bubble">
                ${note.text ? `<div class="note-bubble-txt">${escapeHTML(note.text)}</div>` : ""}
                ${songTitle ? `<div class="note-music-mini">🎵 <span>${escapeHTML(songTitle)}</span></div>` : ""}
            </div>`;
        };

        const myNote = getActiveNote(me.username);
        const myLikesCount = myNote && myNote.likes ? Object.keys(myNote.likes).length : 0;
        const myItem = document.createElement("div");
        myItem.className = "note-item";
        myItem.onclick = () => window.openMyNoteCompose();

        const mySlot = document.createElement("div");
        mySlot.className = "note-bubble-slot";
        mySlot.innerHTML = buildBubbleHTML(myNote);

        const myAvWrap = document.createElement("div");
        myAvWrap.className = "note-av-wrap";
        const myAv = document.createElement("div");
        myAv.className = "avatar";
        setAvatarStyle(myAv, me, false);
        myAvWrap.appendChild(myAv);
        if (myLikesCount > 0) {
            const rp = document.createElement("span");
            rp.className = "note-react-pill"; rp.innerText = `❤️ ${myLikesCount}`;
            myAvWrap.appendChild(rp);
        }
        const myLbl = document.createElement("span");
        myLbl.className = "note-name"; myLbl.innerText = "ملاحظتك";
        myItem.appendChild(mySlot); myItem.appendChild(myAvWrap); myItem.appendChild(myLbl);
        strip.appendChild(myItem);

        const friendsWithNotes = Object.values(contactProfiles)
            .filter(u => u && u.username !== me.username && !u.banned && !myBlocked[u.username] && getActiveNote(u.username))
            .sort((a, b) => (getActiveNote(b.username).ts || 0) - (getActiveNote(a.username).ts || 0));

        friendsWithNotes.forEach(u => {
            const note = getActiveNote(u.username);
            const myReact = note.likes?.[me.username]?.em || "";
            const item = document.createElement("div");
            item.className = "note-item";
            item.onclick = () => window.openFriendNoteView(u.username);

            const slot = document.createElement("div");
            slot.className = "note-bubble-slot";
            slot.innerHTML = buildBubbleHTML(note);

            const avWrap = document.createElement("div");
            avWrap.className = "note-av-wrap";
            const av = document.createElement("div");
            av.className = "avatar";
            setAvatarStyle(av, u, true);
            avWrap.appendChild(av);
            if (myReact) {
                const rp = document.createElement("span");
                rp.className = "note-react-pill"; rp.innerText = myReact;
                avWrap.appendChild(rp);
            }
            const lbl = document.createElement("span");
            lbl.className = "note-name"; lbl.innerText = u.name;
            item.appendChild(slot); item.appendChild(avWrap); item.appendChild(lbl);
            strip.appendChild(item);
        });
    }

    function renderNoteSongDraft() {
        const slot = document.getElementById("noteSongDraftSlot");
        if (!slot) return;
        if (!draftNoteSong) {
            slot.innerHTML = `<button type="button" class="btn btn-sm btn-outline" style="width:100%; border-style:dashed;" onclick="window.pickNoteSong()">🎵 بحث وإضافة أغنية للملاحظة</button>`;
        } else {
            slot.innerHTML = `
                <div class="song-card-inline" style="margin-top:0;">
                    <img class="song-cover" src="${escapeHTML(draftNoteSong.cover || '')}" onerror="this.style.display='none'">
                    <div class="song-meta">
                        <strong>${escapeHTML(draftNoteSong.title)}</strong>
                        <span>${escapeHTML(draftNoteSong.artist || "")}</span>
                    </div>
                    <button type="button" class="pack-mini-btn danger" onclick="window.clearNoteSongDraft()">✕</button>
                </div>`;
        }
    }

    window.pickNoteSong = function () {
        window.openMusicPicker("🎵 اختر أغنية لملاحظتك", song => {
            draftNoteSong = song;
            renderNoteSongDraft();
        });
    };

    window.clearNoteSongDraft = function () {
        draftNoteSong = null;
        renderNoteSongDraft();
    };

    window.openMyNoteCompose = function () {
        if (!me) return;
        const cur = getActiveNote(me.username);
        const txtInp = document.getElementById("noteTextInput");
        txtInp.value = cur ? (cur.text || "") : "";
        draftNoteSong = cur && cur.song ? cur.song : null;
        document.getElementById("noteCharCnt").innerText = txtInp.value.length;
        document.getElementById("delMyNoteBtn").style.display = cur ? "inline-flex" : "none";
        renderNoteSongDraft();

        const likesBox = document.getElementById("myNoteLikesBox");
        const likesEntries = cur && cur.likes ? Object.values(cur.likes) : [];
        if (likesEntries.length > 0) {
            likesBox.innerHTML = `<div style="font-size:12px; color:var(--accent); font-weight:800; margin-bottom:6px;">تفاعلات أصدقائك على ملاحظتك (${likesEntries.length}):</div>` +
                likesEntries.map(l => `<div class="adm-row" style="padding:7px 10px; margin-bottom:5px;"><span style="font-size:13px; font-weight:700;">${escapeHTML(l.name)}</span><span style="font-size:18px;">${l.em || "❤️"}</span></div>`).join("");
        } else {
            likesBox.innerHTML = "";
        }

        document.getElementById("noteComposeModal").style.display = "flex";
        setTimeout(() => txtInp.focus(), 80);
    };

    window.publishMyNote = async function () {
        if (!me) return;
        const text = document.getElementById("noteTextInput").value.trim().slice(0, 60);
        if (!text && !draftNoteSong) { showToast("اكتب ملاحظتك أو اختر أغنية 💭"); return; }
        const payload = {
            text,
            music: draftNoteSong ? `${draftNoteSong.title} - ${draftNoteSong.artist}` : "",
            song: draftNoteSong || null,
            ts: Date.now(),
            expiresAt: Date.now() + 86400000
        };
        await db.ref(`notes/${me.username}`).set(payload);
        document.getElementById("noteComposeModal").style.display = "none";
        playSendSound();
        showToast("تم نشر ملاحظتك لمدة 24 ساعة ✨");
    };

    window.deleteMyNote = async function () {
        if (!me) return;
        await db.ref(`notes/${me.username}`).remove();
        document.getElementById("noteComposeModal").style.display = "none";
        showToast("تم حذف ملاحظتك");
    };

    window.closeFriendNoteView = function () {
        PremAudio.stop("note");
        document.getElementById("noteViewModal").style.display = "none";
    };

    window.openFriendNoteView = function (username, skipAutoPlay = false) {
        const u = contactProfiles[username];
        const note = getActiveNote(username);
        if (!u || !note) return;
        viewingNoteUser = username;

        setAvatarStyle(document.getElementById("nvAvatar"), u, true);
        document.getElementById("nvName").innerHTML = `${escapeHTML(u.name)} ${getVerifiedBadgeHTML(u.verified)} ${getDevBadgeHTML(u)}`;
        document.getElementById("nvTime").innerText = "نُشرت الساعة " + formatTime(note.ts);
        document.getElementById("nvText").innerText = note.text || "🎵 يشاركك هذه الأغنية";

        const mWrap = document.getElementById("nvMusicWrap");
        if (note.song && note.song.url) {
            if (!skipAutoPlay) PremAudio.play(note.song.url, "note", { loop: true });
            renderSongCardInto("nvMusicWrap", note.song, "note", false);
        } else if (note.music) {
            mWrap.innerHTML = `<div style="display:inline-flex; margin-top:8px; padding:4px 12px; border-radius:99px; background:rgba(56,189,248,0.14); color:var(--accent); font-size:12px; font-weight:700;">🎵 ${escapeHTML(note.music)}</div>`;
        } else {
            mWrap.innerHTML = "";
        }

        const myEm = note.likes?.[me.username]?.em || "";
        const reacts = ["❤️", "🔥", "😂", "😍", "🥺"];
        document.getElementById("nvReactsRow").innerHTML = reacts.map(em =>
            `<button type="button" class="note-qr-btn ${myEm === em ? 'mine' : ''}" onclick="window.reactToViewedNote('${em}')">${em}</button>`
        ).join("");

        document.getElementById("nvReplyInput").value = "";
        document.getElementById("noteViewModal").style.display = "flex";
    };

    window.reactToViewedNote = async function (em) {
        if (!viewingNoteUser || !me) return;
        const note = getActiveNote(viewingNoteUser);
        if (!note) return;
        const cur = note.likes?.[me.username]?.em || "";
        if (cur === em) await db.ref(`notes/${viewingNoteUser}/likes/${me.username}`).remove();
        else {
            await db.ref(`notes/${viewingNoteUser}/likes/${me.username}`).set({ em, name: me.name, ts: Date.now() });
            sendNotification(viewingNoteUser, `تفاعل ${me.name} بـ ${em} على ملاحظتك`, em);
            playSendSound();
        }
        window.openFriendNoteView(viewingNoteUser, true);
    };

    window.replyToViewedNote = async function () {
        const inp = document.getElementById("nvReplyInput");
        const txt = (inp?.value || "").trim();
        if (!txt || !viewingNoteUser || !me) return;
        const note = getActiveNote(viewingNoteUser);
        const u = contactProfiles[viewingNoteUser] || { name: viewingNoteUser };
        const rId = getRoomId(me.username, viewingNoteUser);
        const now = Date.now();
        const mId = "m_" + now + "_" + Math.random().toString(36).slice(2, 7);

        await db.ref(`chats/${rId}/messages/${mId}`).set({
            id: mId, sender: me.username, senderName: me.name, type: "text",
            content: txt, seen: false, ts: now,
            replyTo: { sender: viewingNoteUser, senderName: u.name, preview: "💭 ملاحظة: " + (note?.text || note?.song?.title || "") }
        });
        await db.ref(`user_contacts/${viewingNoteUser}/${me.username}`).update({ addedAt: now });
        await db.ref(`chat_meta/${rId}`).set({
            lastMsg: "رد على ملاحظتك: " + txt, lastSender: me.username, lastTs: now, unreadFor: viewingNoteUser
        });
        bumpDmStreak(rId);
        sendNotification(viewingNoteUser, `ردّ ${me.name} على ملاحظتك: "${txt.slice(0, 30)}"`, "💭");
        inp.value = "";
        window.closeFriendNoteView();
        playSendSound();
        showToast("تم إرسال ردك للمحادثة الخاصة ✅");
    };

    // ==================== 9. موسيقى الستوري (إنشاء + تشغيل تلقائي مع كتم) ====================
    function renderStorySongDraft() {
        const slot = document.getElementById("storyMusicDraftSlot");
        if (!slot) return;
        if (!draftStorySong) {
            slot.innerHTML = `<button type="button" class="btn btn-sm btn-outline" style="width:100%; border-style:dashed;" onclick="window.pickStorySong()">🎵 إضافة أغنية للستوري (اختياري)</button>`;
        } else {
            slot.innerHTML = `
                <div class="song-card-inline" style="margin-top:0;">
                    <img class="song-cover" src="${escapeHTML(draftStorySong.cover || '')}" onerror="this.style.display='none'">
                    <div class="song-meta">
                        <strong>${escapeHTML(draftStorySong.title)}</strong>
                        <span>${escapeHTML(draftStorySong.artist || "")}</span>
                    </div>
                    <button type="button" class="pack-mini-btn danger" onclick="window.clearStorySongDraft()">✕</button>
                </div>`;
        }
    }

    window.pickStorySong = function () {
        window.openMusicPicker("🎵 اختر أغنية لقصتك", song => {
            draftStorySong = song;
            renderStorySongDraft();
        });
    };

    window.clearStorySongDraft = function () {
        draftStorySong = null;
        renderStorySongDraft();
    };

    window.toggleStoryMusicMute = function (e) {
        if (e) e.stopPropagation();
        storyMusicMuted = !storyMusicMuted;
        if (PremAudio.context === "story") {
            PremAudio.el.muted = storyMusicMuted;
            if (!storyMusicMuted && PremAudio.el.paused) PremAudio.el.play().catch(() => {});
        }
        const btn = document.getElementById("svMuteBtn");
        if (btn) btn.innerText = storyMusicMuted ? "🔇" : "🔊";
    };

    // ==================== 10. تأثيرات الرسائل وتخصيص الحساب والخلفية المشتركة ====================
    window.playScreenEffect = function (fxKey) {
        const fx = MSG_EFFECTS[fxKey];
        const stage = document.getElementById("fxStage");
        if (!fx || !stage) return;
        const fromTop = fxKey === "snow" || fxKey === "confetti";
        const frag = document.createDocumentFragment();
        const nodes = [];
        for (let i = 0; i < 18; i++) {
            const p = document.createElement("span");
            p.className = "fx-p"; p.innerText = fx.items[i % fx.items.length];
            p.style.left = (8 + Math.random() * 84) + "vw";
            p.style.top = (fromTop ? (-6 - Math.random() * 14) : (78 + Math.random() * 18)) + "vh";
            p.style.fontSize = (22 + Math.random() * 15) + "px";
            p.style.animationDelay = (Math.random() * 0.32) + "s";
            p.style.setProperty("--dx", ((Math.random() - 0.5) * 140).toFixed(0) + "px");
            p.style.setProperty("--dy", (fromTop ? (window.innerHeight * 0.92) : -(window.innerHeight * (0.55 + Math.random() * 0.35))).toFixed(0) + "px");
            p.style.setProperty("--rot", ((Math.random() - 0.5) * 90).toFixed(0) + "deg");
            p.style.setProperty("--dur", (1.6 + Math.random() * 0.9).toFixed(2) + "s");
            frag.appendChild(p); nodes.push(p);
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
        document.querySelectorAll("#effectPickerBar .fx-opt-btn").forEach(b => b.classList.toggle("active", b.getAttribute("data-fx") === selectedMsgEffect));
        const btn = document.getElementById("fxToggleBtn");
        if (btn) { btn.innerText = selectedMsgEffect ? MSG_EFFECTS[selectedMsgEffect].icon : "✨"; btn.classList.toggle("accent", !!selectedMsgEffect); }
        if (selectedMsgEffect) { window.playScreenEffect(selectedMsgEffect); window.toggleEffectPicker(false); showToast(`تأثير ${MSG_EFFECTS[selectedMsgEffect].label} جاهز مع رسالتك ✨`); }
    };

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
        me.statusEmoji = em; window.openPremiumModal();
        showToast(em ? `تم تعيين رمز الحالة ${em}` : "تمت إزالة رمز الحالة");
    };

    window.setMyAccentColor = async function (key) {
        if (!me || !ACCENT_PALETTES[key]) return;
        await db.ref(`users/${me.username}/accentColor`).set(key);
        me.accentColor = key; window.openPremiumModal(); renderMyProfilePage();
        showToast(`تم تحديث لون حسابك إلى ${ACCENT_PALETTES[key].label} 🎨`);
    };

    window.handleAnimAvatarUpload = function (e) {
        const f = e.target.files[0]; e.target.value = "";
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

    function applySharedWpToArea(wpVal) {
        const area = document.getElementById("messagesList");
        if (!area) return;
        if (!wpVal) { applyWallpaper(localStorage.getItem("app_wp") || "pattern", true); return; }
        if (wpVal.startsWith("data:image")) {
            area.style.backgroundImage = `linear-gradient(rgba(4,8,18,0.52), rgba(4,8,18,0.56)), url(${toBlobUrl(wpVal)})`;
            area.style.backgroundSize = "cover"; area.style.backgroundPosition = "center";
        } else { area.style.backgroundImage = wpVal; area.style.backgroundSize = "cover"; }
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
        const f = e.target.files[0]; e.target.value = "";
        if (!f) return;
        showToast("جاري ضغط وتطبيق الخلفية لكليكما...");
        await window.setSharedWallpaper(await compressImageFile(f, 880, 0.70));
    };

    function detachSharedWp() {
        if (sharedWpRef) { sharedWpRef.off(); sharedWpRef = null; }
        const btn = document.getElementById("btnSharedWp");
        if (btn) btn.style.display = "none";
    }

    // ==================== 11. حزم الملصقات الشخصية الخفيفة (تحميل عند الطلب) ====================
    async function fetchPackOnce(packId, force = false) {
        if (!packId) return null;
        if (!force && allStickerPacks[packId]) return allStickerPacks[packId];
        if (loadingPacksSet.has(packId)) return allStickerPacks[packId] || null;
        loadingPacksSet.add(packId);
        try {
            const snap = await db.ref(`tg_packs/${packId}`).once("value");
            if (snap.exists()) allStickerPacks[packId] = snap.val();
            else delete allStickerPacks[packId];
            return allStickerPacks[packId] || null;
        } catch { return null; }
        finally { loadingPacksSet.delete(packId); }
    }

    async function ensureMyPacksLoaded() {
        const ids = Object.keys(mySavedPacks || {}).filter(pid => mySavedPacks[pid]);
        const missing = ids.filter(pid => !allStickerPacks[pid]);
        if (missing.length > 0) await Promise.all(missing.map(pid => fetchPackOnce(pid)));
        const validIds = ids.filter(pid => allStickerPacks[pid]);
        if (!activeSelectedPackId || !validIds.includes(activeSelectedPackId)) {
            activeSelectedPackId = validIds[0] || ""; activePackVisibleCount = 12;
        }
        return validIds;
    }

    window.selectStickerPackTab = function (pid) { activeSelectedPackId = pid; activePackVisibleCount = 12; const b = document.getElementById("drawerBody"); if (b) renderPremiumDrawerTab(b); };
    window.showMorePackStickers = function () { activePackVisibleCount += 12; const b = document.getElementById("drawerBody"); if (b) renderPremiumDrawerTab(b); };

    window.createNewStickerPack = async function () {
        if (!me) return;
        const name = prompt("اكتب اسم حزمة الملصقات الجديدة:", "ملصقات " + me.name);
        if (!name || !name.trim()) return;
        const packId = "pk_" + me.username + "_" + Date.now();
        const packObj = { id: packId, name: name.trim(), owner: me.username, ownerName: me.name, ts: Date.now(), stickers: {} };
        await db.ref(`tg_packs/${packId}`).set(packObj);
        await db.ref(`user_sticker_packs/${me.username}/${packId}`).set(true);
        allStickerPacks[packId] = packObj; activeSelectedPackId = packId; activePackVisibleCount = 12; uploadTargetPackId = packId;
        showToast(`تم إنشاء حزمة «${name.trim()}» ✨`);
        document.getElementById("tgStickerUploadInput").click();
    };

    window.triggerAddStickerToPack = function (packId) { uploadTargetPackId = packId; document.getElementById("tgStickerUploadInput").click(); };

    window.handleUploadStickersToPack = async function (e) {
        const files = Array.from(e.target.files || []); e.target.value = "";
        if (!files.length || !me) return;
        let packId = uploadTargetPackId;
        if (!packId || !allStickerPacks[packId]) {
            const owned = Object.values(allStickerPacks).find(p => p && p.owner === me.username);
            if (owned) packId = owned.id;
            else {
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
            if (f.size > 1.85 * 1024 * 1024) continue;
            const isVideo = f.type.startsWith("video/");
            const isAnimatedImg = f.type === "image/gif" || f.type === "image/webp";
            let dataUrl = (isVideo || isAnimatedImg)
                ? await new Promise((res, rej) => { const r = new FileReader(); r.onload = ev => res(ev.target.result); r.onerror = rej; r.readAsDataURL(f); })
                : await compressImageFile(f, 340, 0.78);
            const stId = "st_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
            const stObj = { id: stId, mediaType: isVideo ? "video" : "image", src: dataUrl, ts: Date.now() };
            await db.ref(`tg_packs/${packId}/stickers/${stId}`).set(stObj);
            if (!allStickerPacks[packId].stickers) allStickerPacks[packId].stickers = {};
            allStickerPacks[packId].stickers[stId] = stObj; uploaded++;
        }
        if (uploaded > 0) {
            activeSelectedPackId = packId;
            showToast(`تمت إضافة ${uploaded} ملصق ✅`);
            const b = document.getElementById("drawerBody");
            if (b && activeDrawerTab === "premium" && document.getElementById("stickerDrawer").style.display === "flex") renderPremiumDrawerTab(b);
        }
    };

    window.sendPremBigSticker = function (psId) {
        const ps = PREM_BIG_STICKERS.find(x => x.id === psId); if (!ps) return;
        pushMessageSafe("prem_sticker", ps.id, `${ps.em} ${ps.cap}`, { effect: ps.fx });
        window.playScreenEffect(ps.fx); toggleStickerDrawer(false);
    };

    window.sendPackSticker = function (packId, stId) {
        const pack = allStickerPacks[packId], st = pack?.stickers?.[stId]; if (!st) return;
        pushMessageSafe("tg_sticker", st.src, `🎭 ملصق (${pack.name})`, { mediaType: st.mediaType || "image", packId: pack.id, packName: pack.name });
        toggleStickerDrawer(false);
    };

    window.deleteStickerFromPack = async function (packId, stId) {
        if (!confirm("حذف هذا الملصق؟")) return;
        await db.ref(`tg_packs/${packId}/stickers/${stId}`).remove();
        if (allStickerPacks[packId]?.stickers) delete allStickerPacks[packId].stickers[stId];
        const b = document.getElementById("drawerBody"); if (b && activeDrawerTab === "premium") renderPremiumDrawerTab(b);
    };

    window.removePackFromMyList = async function (packId) {
        const pack = allStickerPacks[packId];
        if (pack && pack.owner === me.username) {
            if (!confirm(`حذف حزمتك «${pack.name}» بالكامل؟`)) return;
            await db.ref(`tg_packs/${packId}`).remove(); delete allStickerPacks[packId];
        }
        await db.ref(`user_sticker_packs/${me.username}/${packId}`).remove();
        if (activeSelectedPackId === packId) activeSelectedPackId = "";
        window.closeStickerPackPreview(); showToast("تمت إزالة الحزمة");
    };

    window.addPackToMyList = async function (packId) {
        if (!me || !packId) return;
        await db.ref(`user_sticker_packs/${me.username}/${packId}`).set(true);
        activeSelectedPackId = packId; window.closeStickerPackPreview();
        showToast(`تمت إضافة «${allStickerPacks[packId]?.name || "الحزمة"}» لملصقاتك ✅🎭`);
    };

    window.closeStickerPackPreview = function () {
        const grid = document.getElementById("sppGrid");
        if (grid) { stopAndReleaseVideos(grid); grid.innerHTML = ""; }
        const m = document.getElementById("stickerPackPreviewModal"); if (m) m.style.display = "none";
    };

    window.openStickerPackPreview = async function (packId, fallbackSrc, fallbackMedia) {
        const m = document.getElementById("stickerPackPreviewModal"), grid = document.getElementById("sppGrid"), actRow = document.getElementById("sppActionRow");
        if (packId && !allStickerPacks[packId]) {
            document.getElementById("sppTitle").innerText = "⏳ جاري فتح الحزمة..."; document.getElementById("sppMeta").innerText = "";
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:24px; color:var(--text-dim); font-size:13px;">جاري تحميل الملصقات...</div>`;
            actRow.innerHTML = `<button class="btn btn-sm btn-outline" style="width:100%;" onclick="window.closeStickerPackPreview()">إغلاق</button>`;
            m.style.display = "flex"; await fetchPackOnce(packId, true);
        }
        const pack = packId ? allStickerPacks[packId] : null;
        if (!pack) { window.closeStickerPackPreview(); if (fallbackSrc && fallbackMedia !== "video") openLightbox(toBlobUrl(fallbackSrc)); return; }
        const stickersList = Object.values(pack.stickers || {}), hasIt = !!mySavedPacks[pack.id], isOwner = pack.owner === me.username;
        document.getElementById("sppTitle").innerText = `🎭 ${pack.name}`;
        document.getElementById("sppMeta").innerText = `${stickersList.length} ملصق • بواسطة ${pack.ownerName || pack.owner}`;
        stopAndReleaseVideos(grid);
        grid.innerHTML = stickersList.length ? stickersList.slice(0, 24).map(st => {
            const url = toBlobUrl(st.src);
            const mediaHTML = st.mediaType === "video"
                ? `<video class="tg-lazy-vid" data-vsrc="${url}" preload="metadata" loop muted playsinline></video><span class="tg-vid-dot">🎬</span>`
                : `<img src="${url}" loading="lazy" decoding="async">`;
            return `<div class="sticker-tile tg-tile" style="position:relative;" onclick="if('${hasIt}'==='true'){ window.sendPackSticker('${escapeHTML(pack.id)}','${escapeHTML(st.id)}'); window.closeStickerPackPreview(); }">${mediaHTML}</div>`;
        }).join("") : `<div style="grid-column:1/-1; text-align:center; padding:24px; color:var(--text-dim); font-size:13px;">الحزمة فارغة</div>`;
        attachLazyVideos(grid);
        actRow.innerHTML = hasIt
            ? `${isOwner ? `<button class="btn btn-sm" style="flex:1;" onclick="window.closeStickerPackPreview(); window.triggerAddStickerToPack('${escapeHTML(pack.id)}')">➕ إضافة</button>` : `<button class="btn btn-sm btn-success" style="flex:1;" disabled>✓ مضافة لديك</button>`}<button class="btn btn-sm btn-danger" onclick="window.removePackFromMyList('${escapeHTML(pack.id)}')">${isOwner ? 'حذف' : 'إزالة'}</button><button class="btn btn-sm btn-outline" onclick="window.closeStickerPackPreview()">إغلاق</button>`
            : `<button class="btn" style="flex:1;" onclick="window.addPackToMyList('${escapeHTML(pack.id)}')">➕ إضافة الحزمة لملصقاتي (${stickersList.length})</button><button class="btn btn-outline btn-sm" onclick="window.closeStickerPackPreview()">إغلاق</button>`;
        m.style.display = "flex";
    };

    async function renderPremiumDrawerTab(body) {
        stopAndReleaseVideos(body);
        const savedIds = Object.keys(mySavedPacks || {}).filter(pid => mySavedPacks[pid]);
        if (savedIds.some(pid => !allStickerPacks[pid])) {
            body.innerHTML = `<div style="text-align:center; padding:34px; color:var(--text-dim); font-size:13px;">⏳ جاري تجهيز حزم ملصقاتك...</div>`;
            await ensureMyPacksLoaded();
            if (activeDrawerTab !== "premium" || document.getElementById("stickerDrawer").style.display !== "flex") return;
        } else await ensureMyPacksLoaded();

        const myPackIds = savedIds.filter(pid => allStickerPacks[pid]);
        let html = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span class="st-sec-title" style="margin:0;">🎭 حزم ملصقاتي (${myPackIds.length})</span>
                <button type="button" class="pack-mini-btn" onclick="window.createNewStickerPack()">➕ حزمة جديدة</button>
            </div>`;
        if (!myPackIds.length) {
            html += `<div style="background:var(--glass-inner); border:1px dashed var(--border-bright); border-radius:14px; padding:12px; text-align:center; font-size:12px; color:var(--text-dim); margin-bottom:12px;">ما عندك حزم بعد — اضغط <b>«➕ حزمة جديدة»</b> أو اضغط على أي ملصق يدزه صديقك بالمحادثة!</div>`;
        } else {
            html += `<div class="pack-tabs-bar">${myPackIds.map(pid => {
                const pk = allStickerPacks[pid];
                return `<button type="button" class="pack-tab-pill ${pid === activeSelectedPackId ? 'active' : ''}" onclick="window.selectStickerPackTab('${escapeHTML(pid)}')">📦 ${escapeHTML(pk.name)} (${Object.keys(pk.stickers || {}).length})</button>`;
            }).join("")}</div>`;
            const pack = allStickerPacks[activeSelectedPackId] || allStickerPacks[myPackIds[0]];
            if (pack) {
                const isOwner = pack.owner === me.username, stEntries = Object.entries(pack.stickers || {});
                html += `<div class="pack-head-row"><span class="pack-head-title">${escapeHTML(pack.name)} (${stEntries.length})</span><div class="pack-head-acts">${isOwner ? `<button type="button" class="pack-mini-btn" onclick="window.triggerAddStickerToPack('${escapeHTML(pack.id)}')">＋ إضافة</button>` : ""}<button type="button" class="pack-mini-btn danger" onclick="window.removePackFromMyList('${escapeHTML(pack.id)}')">${isOwner ? 'حذف' : 'إزالة'}</button></div></div><div class="sticker-grid">`;
                if (!stEntries.length) html += `<div class="sticker-tile sticker-create-tile" onclick="window.triggerAddStickerToPack('${escapeHTML(pack.id)}')"><span>＋</span><span>رفع ملصق</span></div>`;
                else stEntries.slice(0, activePackVisibleCount).forEach(([stId, st]) => {
                    if (!st || !st.src) return;
                    const url = toBlobUrl(st.src);
                    const mediaHTML = st.mediaType === "video" ? `<video class="tg-lazy-vid" data-vsrc="${url}" preload="metadata" loop muted playsinline></video><span class="tg-vid-dot">🎬</span>` : `<img src="${url}" loading="lazy" decoding="async">`;
                    html += `<div class="sticker-tile tg-tile" style="position:relative;" onclick="window.sendPackSticker('${escapeHTML(pack.id)}','${escapeHTML(stId)}')">${mediaHTML}${isOwner ? `<button type="button" onclick="event.stopPropagation(); window.deleteStickerFromPack('${escapeHTML(pack.id)}','${escapeHTML(stId)}')" style="position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:50%; border:none; background:rgba(0,0,0,0.72); color:#fff; font-size:10px; cursor:pointer;">✕</button>` : ""}</div>`;
                });
                html += `</div>`;
                if (stEntries.length > activePackVisibleCount) html += `<button type="button" class="btn btn-sm btn-outline" style="width:100%; margin-bottom:12px;" onclick="window.showMorePackStickers()">عرض المزيد (+${stEntries.length - activePackVisibleCount})</button>`;
            }
        }
        html += `<div class="st-sec-title">✨ رموز تعبيرية متحركة</div><div class="emoji-grid" style="margin-bottom:10px;">${ANIM_EMOJIS.map(a => `<button type="button" class="emoji-cell" onclick="insertEmojiToInput('[[${a.em}]]')"><span class="anim-em ${a.anim}">${a.em}</span></button>`).join("")}</div>`;
        html += `<div class="st-sec-title">🌟 ملصقات مميزة بتأثيرات</div><div class="sticker-grid">${PREM_BIG_STICKERS.map(ps => `<div class="sticker-tile" style="background:${ps.bg}; border-color:rgba(255,255,255,0.2);" onclick="window.sendPremBigSticker('${ps.id}')"><span class="st-em">${ps.em}</span><span class="st-cap" style="color:#fff;">${escapeHTML(ps.cap)}</span></div>`).join("")}</div>`;
        body.innerHTML = html; attachLazyVideos(body);
    }

    // تحديث واجهة المشغلات تلقائياً عند تغيير حالة الصوت
    PremAudio.onStateChange = (playing, ctx) => {
        if (ctx === "listen" && currentListenData) renderListenTogetherBar(currentListenData, false);
        if (ctx === "profile_me" && me?.profileSong) renderSongCardInto("myProfileSongSlot", me.profileSong, "profile_me", true);
        if (ctx === "profile_other") {
            const box = document.getElementById("otherProfileSongSlot");
            if (box?._songObj) renderSongCardInto("otherProfileSongSlot", box._songObj, "profile_other", false);
        }
        if (ctx === "note") {
            const box = document.getElementById("nvMusicWrap");
            if (box?._songObj) renderSongCardInto("nvMusicWrap", box._songObj, "note", false);
        }
    };

    // ==================== 12. ربط كل المميزات مع محرّك V6 بدون لمس ملفاته ====================
    function installHooks() {
        // شريط الملاحظات مع الستوري
        const _origRenderStories = window.renderStoriesStrip;
        window.renderStoriesStrip = function () {
            if (_origRenderStories) _origRenderStories();
            renderNotesStrip();
        };

        // شعلة التواصل بقائمة المحادثات
        const _origRenderSidebar = window.renderChatsSidebar;
        window.renderChatsSidebar = function () {
            if (_origRenderSidebar) _origRenderSidebar();
            if (!me) return;
            const list = document.getElementById("chatsListEl");
            if (!list) return;
            const q = (document.getElementById("localFilterInput")?.value || "").trim().toLowerCase();
            const friends = Object.values(contactProfiles).filter(u => u && u.username !== me.username && !u.banned);
            const filtered = friends.filter(u => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
            filtered.sort((a, b) => (allMeta[getRoomId(me.username, b.username)]?.lastTs || 0) - (allMeta[getRoomId(me.username, a.username)]?.lastTs || 0));
            const offset = (!q || "الرسائل المحفوظة".includes(q)) ? 1 : 0;
            const rows = list.querySelectorAll(".chat-row");
            filtered.forEach((u, idx) => {
                const row = rows[idx + offset];
                if (!row) return;
                const st = getActiveStreakInfo(getRoomId(me.username, u.username));
                if (!st) return;
                const nameEl = row.querySelector(".chat-row-name");
                if (nameEl && !nameEl.querySelector(".streak-pill")) {
                    const sp = document.createElement("span");
                    sp.className = "streak-pill" + (st.warn ? " warn" : "");
                    sp.title = st.warn ? "راسل اليوم حتى تحافظ على الشعلة!" : "أيام التواصل المتواصلة";
                    sp.innerText = `🔥 ${st.count}`;
                    nameEl.appendChild(sp);
                }
            });
        };

        // شعلة التواصل بهيدر المحادثة الخاصة
        const _origUpdateHeader = window.updateActiveHeader;
        window.updateActiveHeader = function () {
            if (_origUpdateHeader) _origUpdateHeader();
            if (activeChatType === "dm" && activeRoomId) {
                const st = getActiveStreakInfo(activeRoomId);
                const nm = document.getElementById("chatPartnerName");
                if (st && nm && !nm.querySelector(".streak-pill")) {
                    const sp = document.createElement("span");
                    sp.className = "streak-pill" + (st.warn ? " warn" : "");
                    sp.innerText = `🔥 ${st.count}`;
                    nm.appendChild(sp);
                }
            }
        };

        // رمز الحالة المتحرك
        const _origDevBadge = window.getDevBadgeHTML;
        window.getDevBadgeHTML = function (userObj) {
            const base = _origDevBadge ? _origDevBadge(userObj) : "";
            const st = userObj && userObj.statusEmoji ? `<span class="status-em" title="الحالة">${escapeHTML(userObj.statusEmoji)}</span>` : "";
            return base + st;
        };

        // صورة البروفايل المتحركة (فيديو)
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

        // الرموز المتحركة داخل النص
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

        // إرفاق التأثير + وسم الوضع المختفي + تحديث شعلة التواصل عند الإرسال
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
            if (activeChatType === "dm" && isVanishActive) {
                extra = { ...extra, vanish: true };
                previewLabel = "👻 رسالة مختفية";
            }
            const dmRoomForStreak = activeChatType === "dm" ? activeRoomId : null;
            const res = await _origPush(type, content, previewLabel, extra);
            if (dmRoomForStreak) bumpDmStreak(dmRoomForStreak);
            return res;
        };

        // بناء الرسائل (ملصقات مميزة + حزم + تأثيرات + ألوان الردود + الوضع المختفي)
        const _origBuildMsg = window.buildMessageNode;
        window.buildMessageNode = function (id, m) {
            const wrap = _origBuildMsg(id, m);
            const bubble = wrap.querySelector(".msg-bubble");
            const slot = wrap.querySelector(".msg-content-slot");

            if (m.vanish) {
                wrap.classList.add("vanish-msg");
                const foot = wrap.querySelector(".msg-footer");
                if (foot) {
                    const vt = document.createElement("span");
                    vt.className = "vanish-tag"; vt.innerText = "👻";
                    foot.insertBefore(vt, foot.firstChild);
                }
            }

            if (m.type === "prem_sticker" && slot) {
                const ps = PREM_BIG_STICKERS.find(x => x.id === m.content) || PREM_BIG_STICKERS[0];
                if (bubble) bubble.classList.add("sticker-bubble");
                slot.innerHTML = `<div class="prem-big-sticker" style="background:${ps.bg}" onclick="event.stopPropagation(); window.playScreenEffect('${ps.fx}')"><span class="pbs-spark">✨</span><span class="pbs-em">${ps.em}</span><span class="pbs-cap">${escapeHTML(ps.cap)}</span></div>`;
            } else if (m.type === "tg_sticker" && slot) {
                if (bubble) bubble.classList.add("sticker-bubble");
                const url = toBlobUrl(m.content);
                const stWrap = document.createElement("div"); stWrap.className = "tg-st-wrap";
                stWrap.innerHTML = m.mediaType === "video"
                    ? `<video class="tg-st-media tg-lazy-vid" data-vsrc="${url}" preload="metadata" loop muted playsinline></video>`
                    : `<img class="tg-st-media" src="${url}" loading="lazy" decoding="async">`;
                if (m.packId) {
                    const hint = document.createElement("span"); hint.className = "tg-st-hint"; hint.innerText = "📦 الحزمة";
                    stWrap.appendChild(hint);
                }
                stWrap.onclick = e => { e.stopPropagation(); window.openStickerPackPreview(m.packId || "", m.content, m.mediaType || "image"); };
                slot.innerHTML = ""; slot.appendChild(stWrap); attachLazyVideos(stWrap);
            }

            const senderObj = contactProfiles[m.sender] || (m.sender === me?.username ? me : null);
            if (senderObj?.accentColor && ACCENT_PALETTES[senderObj.accentColor]) {
                const lbl = wrap.querySelector(".msg-sender-lbl");
                if (lbl && activeChatType === "group") lbl.style.color = ACCENT_PALETTES[senderObj.accentColor].main;
            }
            if (m.replyTo?.sender) {
                const rUser = contactProfiles[m.replyTo.sender] || (m.replyTo.sender === me?.username ? me : null);
                const pal = rUser?.accentColor && ACCENT_PALETTES[rUser.accentColor];
                const rq = wrap.querySelector(".reply-quote");
                if (rq && pal) {
                    rq.style.borderRightColor = pal.main;
                    const stEl = rq.querySelector("strong"); if (stEl) stEl.style.color = pal.main;
                }
            }

            if (m.effect && MSG_EFFECTS[m.effect]) {
                const fx = MSG_EFFECTS[m.effect];
                const foot = wrap.querySelector(".msg-footer");
                if (foot) {
                    const pill = document.createElement("button");
                    pill.className = "fx-msg-pill"; pill.innerHTML = `✨ ${fx.icon}`; pill.title = "اضغط لإعادة التأثير";
                    pill.onclick = e => { e.stopPropagation(); window.playScreenEffect(m.effect); };
                    foot.insertBefore(pill, foot.firstChild);
                }
                if (!m._pending && m.ts && (Date.now() - m.ts < 8000) && !playedFxIds.has(id)) {
                    playedFxIds.add(id); setTimeout(() => window.playScreenEffect(m.effect), 120);
                }
            }
            return wrap;
        };

        // موسيقى الستوري (عند الإنشاء + عند العرض + الإيقاف عند الإغلاق)
        const _origOpenCreateStory = window.openCreateStoryModal;
        window.openCreateStoryModal = function () {
            draftStorySong = null;
            if (_origOpenCreateStory) _origOpenCreateStory();
            renderStorySongDraft();
        };

        const _origSwitchStoryType = window.switchStoryType;
        window.switchStoryType = function (t) {
            if (_origSwitchStoryType) _origSwitchStoryType(t);
            const slot = document.getElementById("storyMusicDraftSlot");
            if (slot) slot.style.display = t === "video" ? "none" : "block";
        };

        const _origPublishStory = window.publishStory;
        window.publishStory = async function () {
            const songToAttach = draftStorySong;
            await _origPublishStory();
            if (songToAttach && me) {
                draftStorySong = null;
                try {
                    const snap = await db.ref(`stories/${me.username}`).once("value");
                    const list = Object.values(snap.val() || {}).sort((a, b) => (b.ts || 0) - (a.ts || 0));
                    if (list[0] && list[0].type !== "video" && (Date.now() - (list[0].ts || 0)) < 15000) {
                        await db.ref(`stories/${me.username}/${list[0].id}/music`).set(songToAttach);
                    }
                } catch {}
            }
        };

        const _origRenderSlide = window.renderCurrentStorySlide;
        window.renderCurrentStorySlide = function () {
            PremAudio.stop("story");
            if (_origRenderSlide) _origRenderSlide();
            try {
                if (typeof svList === "undefined" || !svList || svIndex >= svList.length) return;
                const item = svList[svIndex];
                const liveItem = (!svIsHighlight && allStories[svOwner]?.[item.id]) ? allStories[svOwner][item.id] : item;
                if (liveItem && liveItem.type !== "video" && liveItem.music && liveItem.music.url) {
                    const m = liveItem.music;
                    const stage = document.getElementById("svStage");
                    if (stage) {
                        const pill = document.createElement("div");
                        pill.className = "sv-music-pill";
                        pill.onclick = e => e.stopPropagation();
                        pill.innerHTML = `
                            <img class="song-cover round spin" src="${escapeHTML(m.cover || '')}" onerror="this.style.display='none'">
                            <div class="svm-txt"><b>${escapeHTML(m.title)}</b><span>${escapeHTML(m.artist || "")}</span></div>
                            <button type="button" class="sv-mute-btn" id="svMuteBtn" onclick="window.toggleStoryMusicMute(event)">${storyMusicMuted ? "🔇" : "🔊"}</button>`;
                        stage.appendChild(pill);
                    }
                    PremAudio.play(m.url, "story", { loop: true, muted: storyMusicMuted });
                }
            } catch {}
        };

        const _origPauseStory = window.pauseStoryMedia;
        window.pauseStoryMedia = function (paused) {
            if (_origPauseStory) _origPauseStory(paused);
            if (PremAudio.context === "story") {
                if (paused) PremAudio.el.pause();
                else PremAudio.el.play().catch(() => {});
            }
        };

        const _origCloseStory = window.closeStoryViewer;
        window.closeStoryViewer = function () {
            PremAudio.stop("story");
            if (_origCloseStory) _origCloseStory();
        };

        // ألوان + أغنية البروفايل الشخصي وبروفايل الأصدقاء
        const _origRenderMyProf = window.renderMyProfilePage;
        window.renderMyProfilePage = function () {
            if (_origRenderMyProf) _origRenderMyProf();
            if (!me) return;
            const pal = ACCENT_PALETTES[me.accentColor || "default"] || ACCENT_PALETTES.default;
            const cov = document.getElementById("myProfCover"), nm = document.getElementById("myProfName");
            if (cov) cov.style.background = pal.grad;
            if (nm) nm.style.color = me.accentColor && me.accentColor !== "default" ? pal.main : "";
            renderSongCardInto("myProfileSongSlot", me.profileSong || null, "profile_me", true);
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
            renderSongCardInto("otherProfileSongSlot", u.profileSong || null, "profile_other", false);
        };

        // إيقاف أغنية بروفايل الصديق عند إغلاق نافذته
        const upModal = document.getElementById("userProfileModal");
        if (upModal) {
            const origOnClick = upModal.onclick;
            upModal.onclick = e => {
                if (e.target === upModal) PremAudio.stop("profile_other");
                if (origOnClick) origOnClick(e);
            };
        }

        // إيقاف الموسيقى عند المكالمات أو تسجيل بصمة صوتية
        const _origStartCall = window.startCall;
        window.startCall = function (v) { PremAudio.stop(); return _origStartCall(v); };
        const _origAnswerCall = window.answerIncomingCall;
        window.answerIncomingCall = function () { PremAudio.stop(); return _origAnswerCall(); };
        const _origStartRec = window.startRecording;
        window.startRecording = function () { PremAudio.stop(); return _origStartRec(); };

        // ربط الغرفة الخاصة (الخلفية المشتركة + نسمع سوا + الوضع المختفي)
        const _origDetach = window.detachRoomListeners;
        window.detachRoomListeners = function () {
            stopAndReleaseVideos(document.getElementById("messagesList"));
            if (_origDetach) _origDetach();
        };

        const _origOpenDM = window.openDM;
        window.openDM = function (partnerUsername) {
            detachSharedWp();
            detachListenTogether();
            detachVanishMode(true);
            _origOpenDM(partnerUsername);

            ["btnSharedWp", "btnListenTogether", "btnVanishMode"].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = "inline-flex";
            });

            const roomCopy = activeRoomId;
            const tokCopy = activeRoomToken;

            sharedWpRef = db.ref(`chats/${roomCopy}/shared_wp`);
            sharedWpRef.on("value", s => {
                if (tokCopy !== activeRoomToken) return;
                applySharedWpToArea(s.val()?.value || "");
            });

            listenRef = db.ref(`chats/${roomCopy}/listen_together`);
            listenRef.on("value", s => {
                if (tokCopy !== activeRoomToken) return;
                const d = s.val();
                currentListenData = d;
                if (!d || !d.url) {
                    PremAudio.stop("listen");
                    renderListenTogetherBar(null);
                    return;
                }
                if (d.playing) {
                    const elapsed = Math.max(0, (Date.now() - (d.startedAt || Date.now())) / 1000);
                    const pos = (d.offset || 0) + elapsed;
                    PremAudio.play(d.url, "listen", { loop: true, startAt: pos }).then(ok => {
                        renderListenTogetherBar(d, !ok);
                    });
                } else {
                    if (PremAudio.context === "listen") PremAudio.el.pause();
                    renderListenTogetherBar(d, false);
                }
            });

            vanishRef = db.ref(`chats/${roomCopy}/vanish_mode`);
            vanishRef.on("value", s => {
                if (tokCopy !== activeRoomToken) return;
                const v = s.val();
                const wasOn = isVanishActive;
                const nowOn = !!(v && v.active);
                applyVanishUI(nowOn);
                if (wasOn && !nowOn) cleanupVanishMessages(roomCopy, true);
            });
        };

        const _origOpenSaved = window.openSavedMessages;
        window.openSavedMessages = function () {
            detachSharedWp(); detachListenTogether(); detachVanishMode(true);
            _origOpenSaved(); applyWallpaper(localStorage.getItem("app_wp") || "pattern", true);
        };

        const _origOpenSpace = window.openSpaceRoom;
        window.openSpaceRoom = function (id) {
            detachSharedWp(); detachListenTogether(); detachVanishMode(true);
            _origOpenSpace(id); applyWallpaper(localStorage.getItem("app_wp") || "pattern", true);
        };

        const _origCloseChat = window.closeActiveChat;
        window.closeActiveChat = function () {
            detachSharedWp(); detachListenTogether(); detachVanishMode(true);
            window.toggleEffectPicker(false);
            _origCloseChat();
        };

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

        // الاستماع لـ الملاحظات + شعلة التواصل + حزم الملصقات بعد الدخول
        const _origEnter = window.enterMainApp;
        window.enterMainApp = function (uData) {
            _origEnter(uData);
            db.ref("notes").on("value", s => {
                allNotesMap = s.val() || {};
                renderNotesStrip();
            });
            db.ref("chat_streaks").on("value", s => {
                allStreaksMap = s.val() || {};
                renderChatsSidebar();
                if (activeChatType === "dm") updateActiveHeader();
            });
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
