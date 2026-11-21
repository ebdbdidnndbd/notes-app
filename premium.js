// ==================== نظام المميزات الملكي (V11 Ultra Shield — قص أغاني + MP3 + يوتيوب سوا + ذكريات + ثيم لكل شات + إطارات — 60fps) ====================
(function () {
    if (window.__PREMIUM_V11_LOADED__) return;
    window.__PREMIUM_V11_LOADED__ = true;

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

    const AVATAR_FRAMES = [
        { id: "",       label: "بدون إطار", css: "var(--bg-card)" },
        { id: "gold",   label: "👑 ذهبي",    css: "linear-gradient(135deg,#ca8a04,#fde047)" },
        { id: "neon",   label: "⚡ نيون",    css: "linear-gradient(135deg,#06b6d4,#3b82f6)" },
        { id: "galaxy", label: "🌌 مجرّة",   css: "linear-gradient(135deg,#7c3aed,#ec4899)" },
        { id: "rose",   label: "🌹 وردي",    css: "linear-gradient(135deg,#e11d48,#f472b6)" }
    ];

    const CHAT_THEMES = [
        { id: "",        label: "افتراضي",  bg: "",                                          preview: "var(--bubble-me)" },
        { id: "ocean",   label: "محيط",     bg: "linear-gradient(135deg,#0284c7,#1d4ed8)",   preview: "linear-gradient(135deg,#0284c7,#1d4ed8)" },
        { id: "love",    label: "وردي حب",  bg: "linear-gradient(135deg,#db2777,#9333ea)",   preview: "linear-gradient(135deg,#db2777,#9333ea)" },
        { id: "royal",   label: "ملكي",     bg: "linear-gradient(135deg,#6d28d9,#4338ca)",   preview: "linear-gradient(135deg,#6d28d9,#4338ca)" },
        { id: "emerald", label: "زمردي",    bg: "linear-gradient(135deg,#047857,#0d9488)",   preview: "linear-gradient(135deg,#047857,#0d9488)" },
        { id: "sunset",  label: "غروب",     bg: "linear-gradient(135deg,#ea580c,#db2777)",   preview: "linear-gradient(135deg,#ea580c,#db2777)" },
        { id: "gold",    label: "ذهبي",     bg: "linear-gradient(135deg,#b45309,#d97706)",   preview: "linear-gradient(135deg,#b45309,#d97706)" },
        { id: "crimson", label: "ياقوتي",   bg: "linear-gradient(135deg,#be123c,#e11d48)",   preview: "linear-gradient(135deg,#be123c,#e11d48)" }
    ];

    const STATUS_EMOJIS = [
        "", "👑", "🔥", "❤️‍🔥", "💎", "🦋", "⚡", "✨", "🌙", "🌹",
        "🎧", "📚", "🎮", "☕", "🏆", "💫", "🧿", "🕊️", "💜", "😎"
    ];

    const QUICK_MOODS = [
        { id: "",      label: "✕ بدون مود" },
        { id: "study", label: "📚 أدرس سادس" },
        { id: "tea",   label: "☕ أشرب چاي" },
        { id: "music", label: "🎧 أسمع أغاني" },
        { id: "miss",  label: "🥺 مشتاق" },
        { id: "happy", label: "✨ مزاجي رايق" },
        { id: "sleep", label: "😴 نعسان" },
        { id: "busy",  label: "🔥 مشغول شوية" }
    ];

    const MSG_EFFECTS = {
        hearts:   { label: "قلوب",    icon: "❤️", items: ["❤️", "💖", "💕", "💘", "💗"] },
        balloons: { label: "بالونات", icon: "🎈", items: ["🎈", "🩷", "🩵", "💜", "🎈"] },
        fire:     { label: "نار",     icon: "🔥", items: ["🔥", "💥", "✨", "🧡", "🔥"] },
        confetti: { label: "احتفال",  icon: "🎉", items: ["🎉", "🎊", "✨", "🌟", "💜"] },
        snow:     { label: "ثلج",     icon: "❄️", items: ["❄️", "🤍", "✨", "🌙", "🫧"] },
        stars:    { label: "نجوم",    icon: "⭐", items: ["⭐", "🌟", "✨", "💫", "⚡"] }
    };

    const SMART_FX_RULES = [
        { re: /(أحبك|احبك|أحبچ|احبچ|حبيبي|حبيبتي|عمري|روحي|فدوه|فدوة)/i, fx: "hearts" },
        { re: /(مشتاق|اشتقت|مشتاگ|ولهان)/i, fx: "stars" },
        { re: /(مبروك|الف مبروك|ألف مبروك|عيد ميلاد|كل عام)/i, fx: "confetti" },
        { re: /(تصبح على خير|تصبحين على خير|نوم العوافي|احلام سعيدة)/i, fx: "snow" },
        { re: /(عاشوو|كفو|نار وشرار|اسطور)/i, fx: "fire" }
    ];

    const DAILY_PROMPTS_BANK = [
        "شنو أول شي لفت انتباهك بيه من تعرّفنا؟ 👀",
        "لو نكدر نسافر باچر لأي مكان بالعالم، وين نروح سوا؟ ✈️",
        "شنو أكثر لحظة أو موقف صار بيننا وبعدك تبتسم من تذكره؟ 💛",
        "شنو الأغنية اللي كل ما تسمعها أجي ببالك فوراً؟ 🎵",
        "لو تكتبلي رسالة من سطر واحد أفتحها بعد سنة، شنو تكتب؟ ⏳",
        "شنو أكثر صفة تحبها بشخصيتي وشنو صفة تغثك شوية؟ 😅",
        "شنو أكثر أكلة أو شغلة تتمنى نجرّبها سوا قريباً؟ ☕",
        "بشنو تحس إني أفرق عن باقي الناس بحياتك؟ ✨",
        "لو گضينا يوم كامل بدون موبايلات وإنترنت، شنو نسوي؟ 🌙",
        "شنو أكثر دعوة تدعيها إلي بظهر الغيب؟ 🤲",
        "شنو الشي اللي بس أني أگدر أضحّكك عليه بسرعة؟ 😂",
        "شنو أكثر هدف تتمنى نحققه ثنيننا هالسنة؟ 🏆",
        "إذا چنت ضايج كلش، شنو الكلمة اللي تريّحني منك؟ 🤍",
        "شنو أحلى ذكرى صارت إلنا هذا الشهر؟ 📸"
    ];

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
        { id: "none",   label: "افتراضي",    css: "" },
        { id: "purple", label: "ليلكي",      css: "linear-gradient(160deg,#1a0b2e 0%,#2d1448 50%,#120820 100%)" },
        { id: "ocean",  label: "محيط هادئ",  css: "linear-gradient(160deg,#06182c 0%,#0c3559 55%,#04101f 100%)" },
        { id: "rose",   label: "غروب ناعم",  css: "linear-gradient(160deg,#240b1c 0%,#4a1632 52%,#160713 100%)" },
        { id: "forest", label: "غابة ليلية", css: "linear-gradient(160deg,#051a14 0%,#0f3b2e 55%,#04110d 100%)" },
        { id: "gold",   label: "فخم داكن",   css: "linear-gradient(160deg,#1a1408 0%,#33260f 52%,#0e0b05 100%)" }
    ];

    const MUSIC_SUGGEST_CATS = [
        { id: "iraqi",    label: "🔥 عراقية",   queries: ["ماجد المهندس", "محمود التركي", "أصيل هميم"] },
        { id: "romantic", label: "❤️ رومانسية", queries: ["كاظم الساهر", "إليسا"] },
        { id: "hype",     label: "⚡ حماسية",   queries: ["سيف نبيل", "نور الزين"] },
        { id: "chill",    label: "🌙 هادئة",    queries: ["فيروز", "شيرين"] },
        { id: "global",   label: "🌍 أجنبي",    queries: ["The Weeknd", "Lana Del Rey"] }
    ];

    // حالات المميزات
    let selectedMsgEffect = "";
    let scratchModeActive = false;
    let sharedWpRef = null;
    let chatThemeRef = null;
    let ytTogetherRef = null;
    let currentYtData = null;
    let ytPlayerMinimized = false;
    let countdownRef = null;
    let memoriesRef = null;
    let currentMemoriesData = {};
    let currentCountdownData = null;

    let allStickerPacks = {};
    let loadingPacksSet = new Set();
    let mySavedPacks = {};
    let activeSelectedPackId = "";
    let activePackVisibleCount = 12;
    let uploadTargetPackId = null;
    const playedFxIds = new Set();

    // الملاحظات والموسيقى المطوّرة
    let allNotesMap = {};
    let viewingNoteUser = "";
    let draftNoteSong = null;
    let draftStorySong = null;
    let lastMusicResults = [];
    let musicPickerCallback = null;
    let musicPickerAllowTrim = true;
    let musicPreviewIdx = -1;
    let activeMusicCat = "iraqi";
    let activeMusicSourceTab = "search"; // "search" | "youtube" | "mp3"
    let pendingTrimSong = null;
    const musicCatCache = {};
    let storyMusicMuted = false;

    // نسمع سوا + الوضع المختفي + الشعلة + السؤال اليومي + الرسم الحي + كبسولات الزمن
    let listenRef = null;
    let currentListenData = null;
    let vanishRef = null;
    let isVanishActive = false;
    let allStreaksMap = {};
    let dailyPromptRef = null;
    let liveDrawRef = null;
    let liveDrawColor = "#38bdf8";
    let liveDrawSize = 4;
    let capsuleInterval = null;
    let lastHeartbeatTs = 0;

    window.__getDraftStorySong = () => draftStorySong;
    window.__clearDraftStorySong = () => { draftStorySong = null; };
    window.__stopOtherProfileSong = () => { PremAudio.stop("profile_other"); };

    function extractYoutubeId(input) {
        const str = String(input || "").trim();
        if (!str) return "";
        if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
        const m = str.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : "";
    }

    // ==================== محرّك الصوت الموحّد (يدعم القصّ startSec/endSec + التشغيل للنهاية) ====================
    const PremAudio = {
        el: new Audio(),
        context: "",
        currentUrl: "",
        clipStart: 0,
        clipEnd: 0, // 0 تعني للنهاية
        playFull: true,
        onStateChange: null,
        init() {
            this.el.preload = "auto";
            this.el.setAttribute("playsinline", "");
            this.el.volume = 1.0;
            this.el.addEventListener("timeupdate", () => {
                if (this.clipEnd > 0 && this.el.currentTime >= this.clipEnd) {
                    if (this.el.loop) {
                        this.el.currentTime = this.clipStart || 0;
                    } else {
                        this.el.pause();
                        this.notify(false);
                    }
                }
            });
            this.el.addEventListener("ended", () => { if (!this.el.loop) this.notify(false); });
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
            this.clipStart = 0; this.clipEnd = 0; this.playFull = true;
            const prevCtx = this.context;
            this.context = ""; this.currentUrl = "";
            if (prevCtx) this.notify(false);
        },
        play(url, context, { loop = false, startAt = 0, muted = false, clipStart = 0, clipEnd = 0, playFull = true } = {}) {
            if (!url) return Promise.resolve(false);
            if (typeof stopAnyVoicePlayback === "function") stopAnyVoicePlayback();
            const same = this.currentUrl === url && this.context === context;
            this.context = context;
            this.clipStart = Math.max(0, Number(clipStart) || 0);
            this.clipEnd = playFull ? 0 : Math.max(0, Number(clipEnd) || 0);
            this.playFull = !!playFull;
            this.el.loop = !!loop; this.el.muted = !!muted; this.el.volume = 1.0;
            if (!same) {
                this.currentUrl = url; this.el.src = url;
                try { this.el.load(); } catch {}
            }
            const targetTime = startAt > 0 ? startAt : this.clipStart;
            const seek = () => {
                try {
                    const dur = isFinite(this.el.duration) && this.el.duration > 0 ? this.el.duration : 29.5;
                    this.el.currentTime = Math.min(dur - 0.2, Math.max(0, targetTime % dur));
                } catch {}
            };
            if (targetTime > 0 || !same) {
                if (this.el.readyState >= 1) seek(); else this.el.addEventListener("loadedmetadata", seek, { once: true });
            }
            const p = this.el.play();
            return (p && typeof p.then === "function") ? p.then(() => true).catch(() => false) : Promise.resolve(true);
        },
        toggle(url, context, opts = {}) {
            if (this.currentUrl === url && this.context === context && !this.el.paused) { this.el.pause(); return Promise.resolve(false); }
            return this.play(url, context, opts);
        }
    };
    PremAudio.init();

    // إرجاع نسبة التقدم الحقيقية لصوت الستوري عند تفعيل «تشغيل للنهاية»
    window.__storyAudioProgress = function () {
        if (PremAudio.context !== "story" || !PremAudio.el || !isFinite(PremAudio.el.duration) || PremAudio.el.duration <= 0) return null;
        const start = PremAudio.clipStart || 0;
        const end = (PremAudio.clipEnd > start) ? PremAudio.clipEnd : PremAudio.el.duration;
        const span = Math.max(1, end - start);
        if (PremAudio.el.ended) return 100;
        return Math.max(0, Math.min(100, ((PremAudio.el.currentTime - start) / span) * 100));
    };

    function searchItunesSongs(query, limit = 12) {
        return new Promise((resolve, reject) => {
            const cbName = "__itCb_" + Date.now() + "_" + Math.floor(Math.random() * 99999);
            const script = document.createElement("script");
            let done = false;
            const cleanup = () => { if (script.parentNode) script.parentNode.removeChild(script); try { delete window[cbName]; } catch { window[cbName] = undefined; } };
            const timer = setTimeout(() => { if (done) return; done = true; cleanup(); reject(new Error("timeout")); }, 9000);
            window[cbName] = data => {
                if (done) return; done = true; clearTimeout(timer); cleanup();
                const seen = new Set();
                resolve((data && Array.isArray(data.results) ? data.results : [])
                    .filter(t => t.previewUrl)
                    .map(t => ({
                        title: t.trackName || "أغنية", artist: t.artistName || "",
                        cover: (t.artworkUrl100 || t.artworkUrl60 || "").replace("http://", "https://"),
                        url: (t.previewUrl || "").replace("http://", "https://"),
                        source: "itunes", durationSec: 30
                    }))
                    .filter(t => { const k = (t.title + "|" + t.artist).toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }));
            };
            script.onerror = () => { if (done) return; done = true; clearTimeout(timer); cleanup(); reject(new Error("net")); };
            script.src = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=${limit}&callback=${cbName}`;
            document.head.appendChild(script);
        });
    }

    async function loadSuggestedCategory(catId) {
        if (musicCatCache[catId]) return musicCatCache[catId];
        const cat = MUSIC_SUGGEST_CATS.find(c => c.id === catId) || MUSIC_SUGGEST_CATS[0];
        const perQ = Math.max(4, Math.ceil(12 / cat.queries.length));
        const groups = await Promise.all(cat.queries.map(q => searchItunesSongs(q, perQ).catch(() => [])));
        const merged = [], seen = new Set(), maxLen = Math.max(0, ...groups.map(g => g.length));
        for (let i = 0; i < maxLen; i++) {
            for (const g of groups) {
                const s = g[i]; if (!s || seen.has(s.url)) continue;
                seen.add(s.url); merged.push(s);
            }
        }
        if (merged.length) musicCatCache[catId] = merged.slice(0, 14);
        return merged.slice(0, 14);
    }

    // ==================== محرّك الذاكرة الخفيف للملصقات ====================
    const blobUrlCache = new Map();
    function toBlobUrl(src) {
        if (!src || typeof src !== "string" || !src.startsWith("data:")) return src || "";
        const key = src.length + "_" + src.slice(0, 44) + "_" + src.slice(-28);
        if (blobUrlCache.has(key)) return blobUrlCache.get(key);
        try {
            const comma = src.indexOf(","); if (comma < 0) return src;
            const mime = src.slice(5, comma).split(";")[0] || "application/octet-stream";
            const bin = atob(src.slice(comma + 1)), arr = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
            const url = URL.createObjectURL(new Blob([arr], { type: mime }));
            blobUrlCache.set(key, url); return url;
        } catch { return src; }
    }

    const MAX_CONCURRENT_VIDEOS = 4, activePlayingVids = [];
    function pauseManagedVideo(v) { if (!v) return; try { v.pause(); } catch {} const i = activePlayingVids.indexOf(v); if (i !== -1) activePlayingVids.splice(i, 1); }
    function requestManagedVideoPlay(v) {
        if (!v || !document.body.contains(v)) return;
        const src = v.getAttribute("data-vsrc"); if (src && !v.getAttribute("src")) v.setAttribute("src", src);
        if (activePlayingVids.includes(v)) { if (v.paused) v.play().catch(() => {}); return; }
        while (activePlayingVids.length >= MAX_CONCURRENT_VIDEOS) { const o = activePlayingVids.shift(); if (o && o !== v) { try { o.pause(); } catch {} } }
        activePlayingVids.push(v); v.play().catch(() => {});
    }
    const vidObserver = ("IntersectionObserver" in window)
        ? new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting ? requestManagedVideoPlay(e.target) : pauseManagedVideo(e.target)), { threshold: 0.15 })
        : null;
    function attachLazyVideos(c) { if (!c) return; c.querySelectorAll("video.tg-lazy-vid").forEach(v => vidObserver ? vidObserver.observe(v) : requestManagedVideoPlay(v)); }
    function stopAndReleaseVideos(c) { if (!c) return; c.querySelectorAll("video.tg-lazy-vid").forEach(v => { if (vidObserver) vidObserver.unobserve(v); pauseManagedVideo(v); try { v.removeAttribute("src"); v.load(); } catch {} }); }

    // ==================== 1. حقن ستايلات V11 السحرية ====================
    function injectPremiumStyles() {
        if (document.getElementById("premStylesV11")) return;
        const s = document.createElement("style");
        s.id = "premStylesV11";
        s.textContent = `
            /* ===== شريط يوتيوب سوا لايف (Watch Together 📺) ===== */
            #ytTogetherBar {
                flex-direction: column; background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(9, 13, 25, 0.94));
                border-bottom: 1px solid var(--border-bright); flex-shrink: 0; z-index: 10;
            }
            #ytTogetherBar.open { display: flex !important; }
            .yt-bar-head {
                display: flex; align-items: center; justify-content: space-between; gap: 8px;
                padding: 7px 12px; font-size: 12px; font-weight: 800; color: #fff;
            }
            .yt-frame-wrap {
                width: 100%; max-width: 440px; aspect-ratio: 16 / 9; margin: 0 auto 8px;
                border-radius: 14px; overflow: hidden; border: 1px solid var(--border-bright); background: #000;
            }
            .yt-frame-wrap iframe { width: 100%; height: 100%; border: none; display: block; }

            /* ===== شريط المناسبات التنازلي براس الشات (🗓️) ===== */
            #countdownBanner.open {
                display: flex !important; align-items: center; justify-content: space-between; gap: 10px;
                padding: 7px 12px; background: linear-gradient(90deg, rgba(245,158,11,0.18), rgba(236,72,153,0.18));
                border-bottom: 1px solid rgba(251,191,36,0.34); cursor: pointer; flex-shrink: 0;
            }
            .cd-title { font-size: 12.5px; font-weight: 800; color: #fde047; display: flex; align-items: center; gap: 6px; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .cd-days-pill { background: rgba(0,0,0,0.36); border: 1px solid rgba(251,191,36,0.45); color: #fff; font-size: 11.5px; font-weight: 800; padding: 3px 10px; border-radius: 99px; flex-shrink: 0; }
            .mem-item {
                background: var(--glass-inner); border: 1px solid var(--border); border-radius: 14px;
                padding: 10px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;
            }
            .mem-item strong { display: block; font-size: 13px; color: var(--text); margin-bottom: 2px; }
            .mem-item span { font-size: 11px; color: var(--text-dim); }

            /* ===== شريط قصّ الأغنية وتحديد المدة (Audio Trimmer ✂️) ===== */
            .trim-card {
                background: linear-gradient(135deg, rgba(14,165,233,0.14), rgba(139,92,246,0.14));
                border: 1px solid var(--border-bright); border-radius: 18px; padding: 14px; margin: 10px 0;
            }
            .trim-range-row { display: flex; align-items: center; gap: 8px; margin: 8px 0; font-size: 12px; font-weight: 700; }
            .trim-range-row input[type="range"] { flex: 1; accent-color: var(--accent); }
            .trim-toggle {
                display: flex; align-items: center; justify-content: space-between; gap: 8px;
                background: var(--glass-inner); border: 1px solid var(--border); border-radius: 12px;
                padding: 9px 12px; margin-bottom: 10px; cursor: pointer; font-size: 12.5px; font-weight: 800;
            }
            .sv-yt-wrap {
                position: absolute; bottom: 88px; left: 50%; transform: translateX(-50%); z-index: 12;
                width: 240px; height: 135px; border-radius: 14px; overflow: hidden;
                border: 1px solid rgba(255,255,255,0.28); box-shadow: 0 10px 28px rgba(0,0,0,0.65); background: #000;
            }

            /* ===== الكشط + النبضة + الكبسولة + السؤال اليومي + الرسم + المود ===== */
            .scratch-box { position: relative; min-width: 170px; min-height: 54px; border-radius: 14px; overflow: hidden; padding: 8px 10px; background: rgba(0, 0, 0, 0.22); }
            .scratch-secret { font-size: var(--msg-fs, 14.5px); line-height: 1.55; white-space: pre-wrap; user-select: text; }
            .scratch-canvas { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; cursor: crosshair; z-index: 3; transition: opacity 0.45s ease; }
            .scratch-canvas.done { opacity: 0; pointer-events: none; }

            #heartbeatOverlay { position: fixed; inset: 0; pointer-events: none; z-index: 9600; display: none; align-items: center; justify-content: center; flex-direction: column; background: radial-gradient(circle, rgba(244,63,94,0.28) 0%, rgba(139,92,246,0.14) 45%, transparent 75%); }
            #heartbeatOverlay.pulse { display: flex; animation: hbFade 2.6s ease forwards; }
            .hb-heart { font-size: 86px; animation: hbBeat 0.85s ease-in-out 3; filter: drop-shadow(0 0 28px rgba(244,63,94,0.85)); }
            .hb-label { margin-top: 10px; background: rgba(10,16,32,0.86); border: 1px solid rgba(251,113,133,0.5); color: #fff; padding: 8px 20px; border-radius: 99px; font-size: 15px; font-weight: 800; box-shadow: 0 10px 30px rgba(0,0,0,0.6); }
            @keyframes hbBeat { 0%,100%{transform:scale(1);} 25%{transform:scale(1.28);} 45%{transform:scale(0.95);} 70%{transform:scale(1.18);} }
            @keyframes hbFade { 0%{opacity:0;} 15%{opacity:1;} 80%{opacity:1;} 100%{opacity:0;} }

            .capsule-card { min-width: 215px; padding: 12px 14px; border-radius: 16px; background: linear-gradient(135deg, rgba(99,102,241,0.28), rgba(236,72,153,0.22)); border: 1px solid rgba(196,181,253,0.42); text-align: center; cursor: pointer; }
            .capsule-card.unlocked { background: linear-gradient(135deg, rgba(16,185,129,0.26), rgba(14,165,233,0.24)); border-color: rgba(52,211,153,0.55); }
            .capsule-timer { font-size: 16px; font-weight: 800; color: #fde047; margin: 5px 0 3px; font-variant-numeric: tabular-nums; }
            .capsule-sub { font-size: 11px; color: rgba(255,255,255,0.82); }
            @keyframes capShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-5px);} 75%{transform:translateX(5px);} }
            .capsule-card.shake { animation: capShake 0.3s ease; }

            .dp-q-box { background: linear-gradient(135deg, rgba(236,72,153,0.18), rgba(139,92,246,0.22)); border: 1px solid rgba(244,114,182,0.4); border-radius: 20px; padding: 16px; text-align: center; margin: 10px 0 14px; }
            .dp-q-box h4 { font-size: 16.5px; line-height: 1.55; color: #fff; }
            .dp-ans-card { background: var(--glass-inner); border: 1px solid var(--border-bright); border-radius: 16px; padding: 12px 14px; margin-bottom: 9px; text-align: right; }
            .dp-ans-card strong { display: block; font-size: 12px; color: var(--accent); margin-bottom: 4px; }
            .dp-ans-card p { font-size: 14px; line-height: 1.55; color: var(--text); }

            .draw-stage-wrap { width: 100%; aspect-ratio: 4 / 3; background: #070c18; border: 1px solid var(--border-bright); border-radius: 18px; overflow: hidden; position: relative; margin: 10px 0; }
            #liveDrawCanvas { width: 100%; height: 100%; display: block; touch-action: none; cursor: crosshair; }
            .draw-colors { display: flex; justify-content: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
            .draw-dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: transform 0.12s; }
            .draw-dot.active { border-color: #fff; transform: scale(1.18); }

            .mood-strip { display: flex; gap: 6px; overflow-x: auto; padding: 4px 0 8px; margin-top: 6px; }
            .mood-chip { padding: 5px 11px; border-radius: 99px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-dim); font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
            .mood-chip.active { background: var(--primary-grad); border-color: transparent; color: #fff; }
            .chat-pane.music-glow-on { box-shadow: inset 0 0 38px rgba(139, 92, 246, 0.28), inset 0 0 14px rgba(56, 189, 248, 0.22); }

            /* ===== الملاحظات + الأغاني + نسمع سوا + الشعلة + المختفي + الملصقات ===== */
            .notes-strip { display: flex; gap: 14px; overflow-x: auto; padding: 10px 14px 9px; border-bottom: 1px solid var(--border); flex-shrink: 0; align-items: flex-end; background: rgba(255,255,255,0.015); }
            .note-item { display: flex; flex-direction: column; align-items: center; min-width: 74px; max-width: 84px; cursor: pointer; flex-shrink: 0; transition: transform 0.14s; }
            .note-item:active { transform: scale(0.94); }
            .note-bubble-slot { min-height: 38px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -10px; z-index: 3; width: 100%; }
            .note-bubble { position: relative; background: var(--bg-card); border: 1px solid var(--border-bright); color: var(--text); padding: 5px 9px; border-radius: 15px; font-size: 10.5px; font-weight: 700; line-height: 1.3; text-align: center; max-width: 86px; min-width: 58px; box-shadow: 0 4px 12px rgba(0,0,0,0.42); word-break: break-word; }
            .note-bubble.empty-note { color: var(--text-dim); border-style: dashed; background: var(--glass-inner); }
            .note-bubble-txt { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            .note-music-mini { display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 9.5px; color: var(--accent); margin-top: 2px; }
            .note-music-mini span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 58px; }
            .note-bubble::before { content: ""; position: absolute; bottom: -5px; right: 14px; width: 8px; height: 8px; border-radius: 50%; background: var(--bg-card); border: 1px solid var(--border-bright); }
            .note-bubble::after { content: ""; position: absolute; bottom: -9px; right: 19px; width: 4.5px; height: 4.5px; border-radius: 50%; background: var(--bg-card); border: 1px solid var(--border-bright); }
            .note-av-wrap { position: relative; z-index: 1; }
            .note-av-wrap .avatar { width: 52px; height: 52px; font-size: 18px; }
            .note-react-pill { position: absolute; bottom: -2px; left: -4px; background: var(--bg-panel); border: 1px solid var(--border-bright); border-radius: 99px; font-size: 11px; padding: 1px 5px; z-index: 4; }
            .note-name { font-size: 11px; color: var(--text-dim); font-weight: 700; margin-top: 5px; max-width: 74px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .note-preview-card { background: var(--glass-inner); border: 1px solid var(--border-bright); border-radius: 20px; padding: 16px; margin: 10px 0; text-align: center; }
            .note-preview-text { font-size: 17px; font-weight: 800; line-height: 1.6; color: var(--text); }
            .note-quick-reacts { display: flex; justify-content: center; gap: 10px; margin: 10px 0 12px; }
            .note-qr-btn { width: 42px; height: 42px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg-card); font-size: 20px; cursor: pointer; }
            .note-qr-btn.mine { border-color: var(--accent); background: rgba(56,189,248,0.22); }

            .eq-bars { display: inline-flex; align-items: flex-end; gap: 2px; height: 12px; flex-shrink: 0; }
            .eq-bars i { width: 2.5px; background: var(--accent); border-radius: 2px; height: 4px; }
            .eq-bars.on i { animation: eqAnim 0.7s ease-in-out infinite alternate; }
            .eq-bars.on i:nth-child(2) { animation-delay: 0.2s; }
            .eq-bars.on i:nth-child(3) { animation-delay: 0.4s; }
            @keyframes eqAnim { 0% { height: 3px; } 100% { height: 12px; } }
            @keyframes discSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

            .song-card-inline { display: flex; align-items: center; gap: 10px; background: linear-gradient(135deg, rgba(14,165,233,0.12), rgba(139,92,246,0.12)); border: 1px solid var(--border-bright); border-radius: 16px; padding: 8px 10px; margin-top: 10px; text-align: right; }
            .song-cover { width: 42px; height: 42px; border-radius: 12px; object-fit: cover; flex-shrink: 0; background: var(--bg-card); border: 1px solid rgba(255,255,255,0.18); }
            .song-cover.round { border-radius: 50%; }
            .song-cover.spin { animation: discSpin 6s linear infinite; }
            .song-meta { flex: 1; min-width: 0; }
            .song-meta strong { display: block; font-size: 13px; font-weight: 800; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .song-meta span { display: block; font-size: 11px; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .song-play-btn { width: 34px; height: 34px; border-radius: 50%; border: none; background: var(--primary-grad); color: #fff; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .music-res-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: var(--glass-inner); border: 1px solid var(--border); border-radius: 14px; margin-bottom: 7px; }

            .sv-music-pill { position: absolute; top: 12px; right: 12px; z-index: 12; display: flex; align-items: center; gap: 8px; max-width: 82%; background: rgba(8, 13, 26, 0.84); border: 1px solid rgba(255,255,255,0.28); border-radius: 99px; padding: 5px 10px 5px 6px; color: #fff; cursor: pointer; box-shadow: 0 6px 20px rgba(0,0,0,0.5); }
            .sv-music-pill img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
            .sv-music-pill .svm-txt { min-width: 0; font-size: 11.5px; line-height: 1.25; }
            .sv-music-pill .svm-txt b { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 145px; }
            .sv-music-pill .svm-txt span { display: block; font-size: 10px; color: rgba(255,255,255,0.75); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 145px; }
            .sv-mute-btn { min-width: 30px; height: 30px; padding: 0 8px; border-radius: 99px; border: none; background: var(--primary-grad); color: #fff; font-size: 12px; font-weight: 800; cursor: pointer; flex-shrink: 0; }

            #listenTogetherBar { display: none; align-items: center; gap: 9px; padding: 7px 12px; background: linear-gradient(90deg, rgba(14,165,233,0.20), rgba(139,92,246,0.22)); border-bottom: 1px solid var(--border-bright); flex-shrink: 0; z-index: 5; }
            #listenTogetherBar.open { display: flex; }
            .lt-info { flex: 1; min-width: 0; }
            .lt-info strong { display: flex; align-items: center; gap: 5px; font-size: 12.5px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .lt-info span { display: block; font-size: 10.5px; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .lt-btn { width: 30px; height: 30px; border-radius: 50%; border: 1px solid var(--border-bright); background: rgba(0,0,0,0.35); color: #fff; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .lt-sync-pill { background: var(--primary-grad); border: none; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 99px; cursor: pointer; flex-shrink: 0; }

            .streak-pill { display: inline-flex; align-items: center; gap: 2px; background: linear-gradient(135deg, rgba(249,115,22,0.22), rgba(239,68,68,0.22)); border: 1px solid rgba(251,146,60,0.45); color: #fdba74; font-size: 10.5px; font-weight: 800; padding: 1px 6px; border-radius: 99px; margin-right: 5px; flex-shrink: 0; }
            .streak-pill.warn { border-style: dashed; color: #fde047; }

            #vanishBanner { display: none; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 12px; font-size: 11.5px; font-weight: 800; color: #e9d5ff; background: linear-gradient(90deg, #1e1036, #311557, #1e1036); border-bottom: 1px solid rgba(192,132,252,0.35); flex-shrink: 0; }
            #vanishBanner.open { display: flex; }
            .chat-pane.vanish-on { background: #07040e !important; }
            .chat-pane.vanish-on .messages-area { background-image: radial-gradient(rgba(168,85,247,0.14) 1.3px, transparent 1.3px) !important; background-size: 24px 24px !important; }
            .chat-pane.vanish-on .input-area { background: #0d0719 !important; border-top-color: rgba(192,132,252,0.32) !important; }
            .pill-act.vanish-active { background: rgba(168,85,247,0.32) !important; color: #e9d5ff !important; }
            .msg-wrap.vanish-msg .msg-bubble { border: 1px dashed rgba(192,132,252,0.58) !important; box-shadow: 0 3px 14px rgba(139,92,246,0.22); }
            .vanish-tag { font-size: 10px; opacity: 0.9; margin-left: 3px; }

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
            @keyframes fxFly { 0% { opacity: 0; transform: translate3d(0,0,0) scale(0.5) rotate(0deg); } 15% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; transform: translate3d(var(--dx,0px), var(--dy,-460px), 0) scale(1.25) rotate(var(--rot,25deg)); } }

            .fx-opt-btn { background: var(--bg-card); border: 1px solid var(--border); color: var(--text); padding: 5px 11px; border-radius: 99px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; }
            .fx-opt-btn.active { background: var(--primary-grad); border-color: transparent; color: #fff; }
            .fx-msg-pill { display: inline-flex; align-items: center; gap: 3px; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.28); border-radius: 99px; padding: 1px 7px; font-size: 11px; font-weight: 800; color: #fff; cursor: pointer; margin-left: 4px; }

            .prem-big-sticker { width: 146px; height: 146px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; cursor: pointer; box-shadow: 0 8px 22px rgba(0,0,0,0.34); position: relative; border: 1px solid rgba(255,255,255,0.22); }
            .prem-big-sticker .pbs-em { font-size: 60px; animation: premBeat 1.8s ease-in-out infinite; }
            .prem-big-sticker .pbs-cap { font-size: 12px; font-weight: 800; color: #fff; }
            .prem-big-sticker .pbs-spark { position: absolute; top: 8px; left: 8px; font-size: 14px; }

            .tg-st-wrap { position: relative; display: inline-block; cursor: pointer; }
            .tg-st-media { width: 148px; height: 148px; object-fit: contain; border-radius: 14px; display: block; background: transparent; }
            .tg-st-hint { position: absolute; bottom: 4px; right: 4px; background: rgba(8, 13, 26, 0.78); border: 1px solid rgba(255,255,255,0.22); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 99px; }
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

            .prem-color-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 8px 0 12px; }
            .prem-color-dot { height: 38px; border-radius: 12px; cursor: pointer; border: 2px solid transparent; color: #fff; font-size: 11.5px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
            .prem-color-dot.active { border-color: #fff; transform: scale(1.05); }
            .status-em-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 7px; margin: 8px 0 12px; }
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
            const stage = document.createElement("div"); stage.id = "fxStage"; document.body.appendChild(stage);
        }
        if (!document.getElementById("heartbeatOverlay")) {
            const hb = document.createElement("div"); hb.id = "heartbeatOverlay";
            hb.innerHTML = `<div class="hb-heart">💓</div><div class="hb-label" id="hbOverlayText"></div>`;
            document.body.appendChild(hb);
        }

        const storiesStrip = document.getElementById("storiesStrip");
        if (storiesStrip && !document.getElementById("notesStrip")) {
            const ns = document.createElement("div"); ns.id = "notesStrip"; ns.className = "notes-strip";
            storiesStrip.parentNode.insertBefore(ns, storiesStrip.nextSibling);
        }

        const pinnedBar = document.getElementById("pinnedBar");
        if (pinnedBar && !document.getElementById("listenTogetherBar")) {
            const lt = document.createElement("div"); lt.id = "listenTogetherBar";
            pinnedBar.parentNode.insertBefore(lt, pinnedBar.nextSibling);

            const vb = document.createElement("div"); vb.id = "vanishBanner";
            vb.innerHTML = `<span>👻 الوضع المختفي مُفعّل — الرسائل تختفي بعد قراءتها</span><button type="button" class="pack-mini-btn" onclick="window.toggleVanishMode()">إيقاف</button>`;
            lt.parentNode.insertBefore(vb, lt.nextSibling);
        }

        const fxRow = document.getElementById("effectPickerRow");
        if (fxRow && !fxRow.innerHTML.trim()) {
            fxRow.innerHTML = `<button type="button" class="fx-opt-btn active" data-fx="" onclick="window.selectMsgEffect('')">بدون تأثير</button>` +
                Object.entries(MSG_EFFECTS).map(([k, v]) => `<button type="button" class="fx-opt-btn" data-fx="${k}" onclick="window.selectMsgEffect('${k}')">${v.icon} ${v.label}</button>`).join("");
        }

        const myProfBio = document.getElementById("myProfBio");
        if (myProfBio && !document.getElementById("myProfileSongSlot")) {
            const div = document.createElement("div"); div.id = "myProfileSongSlot";
            myProfBio.parentNode.insertBefore(div, myProfBio.nextSibling);
        }

        // نافذة يوتيوب سوا لايف (Watch Together 📺)
        if (!document.getElementById("ytTogetherModal")) {
            const m = document.createElement("div"); m.id = "ytTogetherModal"; m.className = "modal-bg";
            m.onclick = e => { if (e.target === m) m.style.display = "none"; };
            m.innerHTML = `
                <div class="glass-card" style="max-width:420px;">
                    <h3>📺 نشوف يوتيوب سوا لايف</h3>
                    <p class="sub">الصق رابط أي فيديو يوتيوب (محاضرة، أغنية، مقطع) وراح يشتغل عندكم اثنينكم بنفس اللحظة</p>
                    <div class="form-group">
                        <label>رابط فيديو يوتيوب</label>
                        <input type="text" id="ytTogetherUrlInp" class="input" dir="ltr" placeholder="https://youtu.be/... أو youtube.com/watch?v=...">
                    </div>
                    <div class="form-group">
                        <label>عنوان اختياري (مثال: محاضرة فيزياء أو أغنية)</label>
                        <input type="text" id="ytTogetherTitleInp" class="input" maxlength="50" placeholder="مشاهدة ممتعة سوا 🍿">
                    </div>
                    <button class="btn" onclick="window.startYoutubeTogetherSession()">تشغيل الفيديو للطرفين 📺▶</button>
                </div>`;
            document.body.appendChild(m);
        }

        // نافذة لوحة المناسبات والذكريات (Memories & Countdown 🗓️)
        if (!document.getElementById("memoriesBoardModal")) {
            const m = document.createElement("div"); m.id = "memoriesBoardModal"; m.className = "modal-bg sheet-bg";
            m.onclick = e => { if (e.target === m) m.style.display = "none"; };
            m.innerHTML = `
                <div class="bottom-sheet" style="max-height:85dvh; display:flex; flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <h4>🗓️ لوحة المناسبات والذكريات</h4>
                        <button class="icon-btn" style="width:32px; height:32px;" onclick="document.getElementById('memoriesBoardModal').style.display='none'">✕</button>
                    </div>
                    <div style="overflow-y:auto; max-height:70dvh;">
                        <div style="background:var(--glass-inner); border:1px solid var(--border-bright); border-radius:16px; padding:12px; margin-bottom:12px;">
                            <div style="font-size:12.5px; font-weight:800; color:#fde047; margin-bottom:8px;">⏳ تثبيت عدّاد مناسبة براس المحادثة</div>
                            <input type="text" id="cdTitleInp" class="input" style="margin-bottom:7px;" placeholder="مثال: امتحانات السادس أو يوم تعارفنا ✨">
                            <div style="display:flex; gap:7px;">
                                <input type="date" id="cdDateInp" class="input" style="flex:1;">
                                <button class="btn btn-sm" onclick="window.saveChatCountdown()">تثبيت</button>
                                <button class="btn btn-sm btn-outline" onclick="window.clearChatCountdown()">مسح</button>
                            </div>
                        </div>

                        <div style="font-size:12.5px; font-weight:800; color:var(--accent); margin-bottom:6px;">📌 ذكرياتنا وعباراتنا المحفوظة</div>
                        <div style="display:flex; gap:7px; margin-bottom:10px;">
                            <input type="text" id="memNoteInp" class="input" maxlength="140" placeholder="احفظ عبارة حلوة أو ذكرى جميلة بينكم..." onkeydown="if(event.key==='Enter'){event.preventDefault(); window.addSharedMemory();}">
                            <button class="btn" style="width:76px;" onclick="window.addSharedMemory()">حفظ</button>
                        </div>
                        <div id="memoriesListEl"></div>
                    </div>
                </div>`;
            document.body.appendChild(m);
        }

        // نافذة ثيم خاص للمحادثة الواحدة (Per-Chat Theme 🎨)
        if (!document.getElementById("chatThemeModal")) {
            const m = document.createElement("div"); m.id = "chatThemeModal"; m.className = "modal-bg";
            m.onclick = e => { if (e.target === m) m.style.display = "none"; };
            m.innerHTML = `
                <div class="glass-card" style="max-width:400px;">
                    <h3>🎨 ثيم خاص لهذه المحادثة</h3>
                    <p class="sub">يغيّر لون فقاعات هذه المحادثة لكليكما بدون تغيير باقي المحادثات</p>
                    <div class="prem-color-grid" id="chatThemeGrid"></div>
                    <button class="btn btn-outline btn-sm" style="width:100%;" onclick="document.getElementById('chatThemeModal').style.display='none'">إغلاق</button>
                </div>`;
            document.body.appendChild(m);
        }

        // نافذة سؤال اليوم السري
        if (!document.getElementById("dailyPromptModal")) {
            const m = document.createElement("div"); m.id = "dailyPromptModal"; m.className = "modal-bg sheet-bg";
            m.onclick = e => { if (e.target === m) window.closeDailyPromptModal(); };
            m.innerHTML = `
                <div class="bottom-sheet" style="max-height:84dvh; display:flex; flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h4>💌 سؤال اليوم السري</h4>
                        <button class="icon-btn" style="width:32px; height:32px;" onclick="window.closeDailyPromptModal()">✕</button>
                    </div>
                    <div id="dpBody" style="overflow-y:auto; max-height:68dvh;"></div>
                </div>`;
            document.body.appendChild(m);
        }

        // نافذة ارسم وياي لايف
        if (!document.getElementById("liveDrawModal")) {
            const m = document.createElement("div"); m.id = "liveDrawModal"; m.className = "modal-bg";
            m.onclick = e => { if (e.target === m) window.closeLiveDrawModal(); };
            m.innerHTML = `
                <div class="glass-card" style="max-width:430px; padding:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <h3 style="font-size:16px;">🎨 ارسم وياي لايف</h3>
                        <button class="icon-btn" style="width:32px; height:32px;" onclick="window.closeLiveDrawModal()">✕</button>
                    </div>
                    <p class="sub" style="margin-bottom:8px;">أي خط ترسمه يظهر گدام شريكك بنفس اللحظة!</p>
                    <div class="draw-stage-wrap"><canvas id="liveDrawCanvas"></canvas></div>
                    <div class="draw-colors" id="liveDrawColors"></div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn btn-sm" style="flex:1;" onclick="window.sendLiveDrawToChat()">📤 إرسال الرسمة بالشات</button>
                        <button class="btn btn-sm btn-outline" onclick="window.clearLiveDrawCanvas()">🧹 مسح</button>
                    </div>
                </div>`;
            document.body.appendChild(m);
        }

        // نافذة كبسولة الزمن
        if (!document.getElementById("timeCapsuleModal")) {
            const m = document.createElement("div"); m.id = "timeCapsuleModal"; m.className = "modal-bg";
            m.onclick = e => { if (e.target === m) m.style.display = "none"; };
            m.innerHTML = `
                <div class="glass-card" style="max-width:400px;">
                    <h3>⏳ كبسولة الزمن</h3>
                    <p class="sub">رسالة مقفولة بعدّاد تنازلي — ما تنفتح إلا بالوقت اللي تحدده</p>
                    <div class="form-group">
                        <label>عنوان اختياري للكبسولة</label>
                        <input type="text" id="capTitleInp" class="input" maxlength="40" placeholder="مثال: رسالة قبل الامتحان ✨">
                    </div>
                    <div class="form-group">
                        <label>الرسالة السرية بالداخل</label>
                        <textarea id="capTextInp" class="input" rows="3" placeholder="اكتب كلامك السري هنا..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>متى تنفتح الكبسولة؟</label>
                        <select id="capDelaySel" class="input">
                            <option value="60000">بعد دقيقة واحدة (للتجربة ⚡)</option>
                            <option value="300000">بعد 5 دقائق</option>
                            <option value="1800000">بعد نصف ساعة</option>
                            <option value="3600000">بعد ساعة واحدة</option>
                            <option value="21600000">بعد 6 ساعات</option>
                            <option value="86400000" selected>بعد 24 ساعة (باچر نفس الوقت 🌙)</option>
                            <option value="259200000">بعد 3 أيام</option>
                        </select>
                    </div>
                    <button class="btn" onclick="window.sendTimeCapsule()">إرسال الكبسولة المقفولة 🔒</button>
                </div>`;
            document.body.appendChild(m);
        }

        // نافذة الأغاني المطوّرة (بحث ومقترحات + رابط يوتيوب + رفع MP3 + قصّ المدة / تشغيل للنهاية)
        if (!document.getElementById("musicPickerModal")) {
            const m = document.createElement("div"); m.id = "musicPickerModal"; m.className = "modal-bg sheet-bg story-top-modal";
            m.onclick = e => { if (e.target === m) window.closeMusicPicker(); };
            m.innerHTML = `
                <div class="bottom-sheet" style="max-height:88dvh; display:flex; flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <h4 id="mpTitle">🎵 اختر أغنية</h4>
                        <button class="icon-btn" style="width:32px; height:32px;" onclick="window.closeMusicPicker()">✕</button>
                    </div>

                    <div class="tabs" style="margin-bottom:9px;">
                        <button class="tab-btn active" id="mpSrcSearch" onclick="window.switchMusicSourceTab('search')">🔍 بحث ومقترحات</button>
                        <button class="tab-btn" id="mpSrcYt" onclick="window.switchMusicSourceTab('youtube')">🎬 رابط يوتيوب</button>
                        <button class="tab-btn" id="mpSrcMp3" onclick="window.switchMusicSourceTab('mp3')">📁 رفع MP3</button>
                    </div>

                    <!-- خطوة القصّ وتحديد المدة (تظهر بعد اختيار أغنية) -->
                    <div id="mpTrimStage" style="display:none; overflow-y:auto;"></div>

                    <!-- التبويب 1: البحث والمقترحات -->
                    <div id="mpPaneSearch" style="display:flex; flex-direction:column; flex:1; min-height:0;">
                        <div style="display:flex; gap:7px; margin-bottom:8px;">
                            <input type="text" id="musicSearchInp" class="input" placeholder="ابحث عن أي أغنية أو مطرب..." onkeydown="if(event.key==='Enter'){event.preventDefault(); window.runMusicSearch();}">
                            <button class="btn" style="width:76px;" onclick="window.runMusicSearch()">بحث</button>
                        </div>
                        <div class="pack-tabs-bar" id="musicCatsBar">
                            ${MUSIC_SUGGEST_CATS.map(c => `<button type="button" class="pack-tab-pill ${c.id === activeMusicCat ? 'active' : ''}" data-mcat="${c.id}" onclick="window.selectMusicCategory('${c.id}')">${c.label}</button>`).join("")}
                        </div>
                        <div id="musicResultsList" style="flex:1; overflow-y:auto; max-height:46dvh;"></div>
                    </div>

                    <!-- التبويب 2: رابط يوتيوب للأغاني الكاملة -->
                    <div id="mpPaneYt" style="display:none; padding:4px 0;">
                        <div class="form-group">
                            <label>رابط أغنية يوتيوب كاملة (تشتغل من البداية للنهاية)</label>
                            <input type="text" id="mpYtUrlInp" class="input" dir="ltr" placeholder="https://youtu.be/... أو youtube.com/watch?v=...">
                        </div>
                        <div class="form-group">
                            <label>اسم الأغنية / المطرب</label>
                            <input type="text" id="mpYtTitleInp" class="input" placeholder="مثال: كاظم الساهر - زيديني عشقاً">
                        </div>
                        <button class="btn" onclick="window.confirmYoutubeSongPick()">اعتماد أغنية اليوتيوب 🎬✨</button>
                    </div>

                    <!-- التبويب 3: رفع ملف MP3 من الجهاز -->
                    <div id="mpPaneMp3" style="display:none; padding:4px 0;">
                        <div class="form-group">
                            <label>اختر ملف صوتي من جهازك (MP3 / M4A — حد أقصى 2.5 ميجابايت)</label>
                            <input type="file" id="mpLocalFileInp" accept="audio/*" class="input" onchange="window.handleLocalMp3Upload(event)">
                        </div>
                        <div class="form-group">
                            <label>اسم المقطع الصوتي (اختياري)</label>
                            <input type="text" id="mpLocalTitleInp" class="input" placeholder="سيأخذ اسم الملف تلقائياً إن تركته فارغاً">
                        </div>
                        <div id="mpLocalStatus" style="font-size:12px; color:var(--text-dim); text-align:center; padding:8px;">اختر ملفاً صوتياً لتحديد مدته أو تشغيله بالكامل 🎧</div>
                    </div>
                </div>`;
            document.body.appendChild(m);
        }

        if (!document.getElementById("noteComposeModal")) {
            const m = document.createElement("div"); m.id = "noteComposeModal"; m.className = "modal-bg sheet-bg";
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

        if (!document.getElementById("noteViewModal")) {
            const m = document.createElement("div"); m.id = "noteViewModal"; m.className = "modal-bg sheet-bg";
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
            const m = document.createElement("div"); m.id = "premiumModal"; m.className = "modal-bg";
            m.onclick = e => { if (e.target === m) m.style.display = "none"; };
            m.innerHTML = `
                <div class="glass-card" style="max-width:440px;">
                    <h3>✨ تخصيص الحساب المميز</h3>
                    <p class="sub">مجاني بالكامل — يظهر لك ولكل أصدقائك فوراً</p>
                    <div class="form-group"><label>1. إطار الصورة الشخصية الفخم:</label><div class="prem-color-grid" style="grid-template-columns:repeat(3,1fr);" id="premFrameGrid"></div></div>
                    <div class="form-group"><label>2. رمز الحالة المتحرك بجانب اسمك:</label><div class="status-em-grid" id="premStatusGrid"></div></div>
                    <div class="form-group"><label>3. لون الاسم والملف الشخصي وإطار الردود:</label><div class="prem-color-grid" id="premColorGrid"></div></div>
                    <div class="form-group">
                        <label>4. أغنية الملف الشخصي:</label>
                        <div style="display:flex; gap:8px;">
                            <button class="btn btn-sm" style="flex:1;" onclick="document.getElementById('premiumModal').style.display='none'; window.pickMyProfileSong()">🎵 اختيار / قصّ الأغنية</button>
                            <button class="btn btn-sm btn-outline" onclick="window.removeMyProfileSong()">إزالة</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>5. صورة متحركة للملف الشخصي (فيديو قصير أو GIF):</label>
                        <input type="file" id="premAnimAvInput" accept="video/mp4,video/webm,image/gif" style="display:none" onchange="window.handleAnimAvatarUpload(event)">
                        <div style="display:flex; gap:8px;">
                            <button class="btn btn-sm" style="flex:1;" onclick="document.getElementById('premAnimAvInput').click()">🎬 رفع فيديو/GIF</button>
                            <button class="btn btn-sm btn-outline" onclick="window.removeAnimAvatar()">إزالة</button>
                        </div>
                    </div>
                    <button class="btn btn-outline btn-sm" style="margin-top:8px; width:100%;" onclick="document.getElementById('premiumModal').style.display='none'">إغلاق</button>
                </div>`;
            document.body.appendChild(m);
        }

        if (!document.getElementById("sharedWpModal")) {
            const m = document.createElement("div"); m.id = "sharedWpModal"; m.className = "modal-bg";
            m.onclick = e => { if (e.target === m) m.style.display = "none"; };
            m.innerHTML = `
                <div class="glass-card" style="max-width:410px;">
                    <h3>🖼️ خلفية المحادثة لكلا الطرفين</h3>
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
            const m = document.createElement("div"); m.id = "stickerPackPreviewModal"; m.className = "modal-bg sheet-bg story-top-modal";
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
            const inp = document.createElement("input"); inp.type = "file"; inp.id = "tgStickerUploadInput"; inp.multiple = true;
            inp.accept = "image/gif,image/webp,image/png,image/jpeg,video/webm,video/mp4"; inp.style.display = "none";
            inp.onchange = e => window.handleUploadStickersToPack(e);
            document.body.appendChild(inp);
        }
    }

    // ==================== 3. مشاهدة يوتيوب سوا لايف (Watch Together 📺) ====================
    window.openYoutubeTogetherModal = function () {
        if (activeChatType !== "dm" || !activeRoomId) return;
        document.getElementById("ytTogetherUrlInp").value = "";
        document.getElementById("ytTogetherTitleInp").value = "";
        document.getElementById("ytTogetherModal").style.display = "flex";
        setTimeout(() => document.getElementById("ytTogetherUrlInp").focus(), 80);
    };

    window.startYoutubeTogetherSession = async function () {
        if (activeChatType !== "dm" || !activeRoomId || !me) return;
        const url = document.getElementById("ytTogetherUrlInp").value.trim();
        const ytId = extractYoutubeId(url);
        if (!ytId) { showToast("الرابط غير صحيح — الصق رابط فيديو يوتيوب صحيح"); return; }
        const title = document.getElementById("ytTogetherTitleInp").value.trim() || "مشاهدة يوتيوب سوا 📺";
        document.getElementById("ytTogetherModal").style.display = "none";
        ytPlayerMinimized = false;
        await db.ref(`chats/${activeRoomId}/yt_together`).set({
            ytId, title, startedAt: Date.now(), offset: 0, by: me.name, rev: Date.now()
        });
        showToast("📺 تم تشغيل فيديو اليوتيوب لكليكما لايف!");
    };

    window.toggleYtMinimize = function () {
        ytPlayerMinimized = !ytPlayerMinimized;
        renderYtTogetherBar(currentYtData);
    };

    window.syncYtTogetherNow = async function () {
        if (!activeRoomId || !currentYtData) return;
        await db.ref(`chats/${activeRoomId}/yt_together`).update({ startedAt: Date.now(), offset: 0, rev: Date.now(), by: me.name });
        showToast("🔄 تمت إعادة مزامنة الفيديو للطرفين");
    };

    window.stopYoutubeTogether = async function () {
        if (activeChatType === "dm" && activeRoomId) await db.ref(`chats/${activeRoomId}/yt_together`).remove();
    };

    function renderYtTogetherBar(data) {
        const bar = document.getElementById("ytTogetherBar"); if (!bar) return;
        if (!data || !data.ytId) { bar.classList.remove("open"); bar.innerHTML = ""; return; }
        bar.classList.add("open");
        const elapsed = Math.max(0, Math.floor((Date.now() - (data.startedAt || Date.now())) / 1000)) + (data.offset || 0);
        const embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(data.ytId)}?autoplay=1&start=${elapsed}&rel=0&playsinline=1`;
        bar.innerHTML = `
            <div class="yt-bar-head">
                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">📺 ${escapeHTML(data.title || "يوتيوب سوا")} <span style="color:var(--text-dim); font-weight:600;">(${escapeHTML(data.by || "")})</span></span>
                <div style="display:flex; gap:5px; flex-shrink:0;">
                    <button type="button" class="pack-mini-btn" onclick="window.syncYtTogetherNow()">🔄 مزامنة</button>
                    <button type="button" class="pack-mini-btn" onclick="window.toggleYtMinimize()">${ytPlayerMinimized ? "⬇ فتح" : "⬆ تصغير"}</button>
                    <button type="button" class="pack-mini-btn danger" onclick="window.stopYoutubeTogether()">✕</button>
                </div>
            </div>
            ${ytPlayerMinimized ? "" : `<div class="yt-frame-wrap"><iframe src="${embedUrl}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`}`;
    }

    function detachYoutubeTogether() {
        if (ytTogetherRef) { ytTogetherRef.off(); ytTogetherRef = null; }
        currentYtData = null; ytPlayerMinimized = false; renderYtTogetherBar(null);
    }

    // ==================== 4. لوحة المناسبات والذكريات (Memories & Countdown 🗓️) ====================
    function renderCountdownBanner(cd) {
        const bar = document.getElementById("countdownBanner"); if (!bar) return;
        if (!cd || !cd.title || !cd.date) { bar.classList.remove("open"); bar.innerHTML = ""; return; }
        const targetMs = new Date(cd.date + "T00:00:00").getTime();
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const diffDaysVal = Math.round((targetMs - today.getTime()) / 86400000);
        let badgeTxt = "";
        if (diffDaysVal > 0) badgeTxt = `باقي ${diffDaysVal} يوم ⏳`;
        else if (diffDaysVal === 0) badgeTxt = "اليوم هو الموعد! 🎉";
        else badgeTxt = `مضى ${Math.abs(diffDaysVal)} يوم 💛`;

        bar.classList.add("open");
        bar.onclick = () => window.openMemoriesBoardModal();
        bar.innerHTML = `<div class="cd-title">🗓️ ${escapeHTML(cd.title)}</div><span class="cd-days-pill">${badgeTxt}</span>`;
    }

    window.openMemoriesBoardModal = function () {
        if (activeChatType !== "dm" || !activeRoomId) return;
        document.getElementById("cdTitleInp").value = currentCountdownData?.title || "";
        document.getElementById("cdDateInp").value = currentCountdownData?.date || "";
        document.getElementById("memNoteInp").value = "";
        renderMemoriesList();
        document.getElementById("memoriesBoardModal").style.display = "flex";
    };

    window.saveChatCountdown = async function () {
        if (!activeRoomId) return;
        const title = document.getElementById("cdTitleInp").value.trim();
        const date = document.getElementById("cdDateInp").value;
        if (!title || !date) { showToast("اكتب عنوان المناسبة واختر التاريخ"); return; }
        await db.ref(`chats/${activeRoomId}/countdown`).set({ title, date, by: me.name, ts: Date.now() });
        showToast("تم تثبيت العدّاد براس المحادثة 🗓️✨");
    };

    window.clearChatCountdown = async function () {
        if (!activeRoomId) return;
        await db.ref(`chats/${activeRoomId}/countdown`).remove();
        document.getElementById("cdTitleInp").value = ""; document.getElementById("cdDateInp").value = "";
        showToast("تم إزالة العدّاد");
    };

    window.addSharedMemory = async function () {
        const inp = document.getElementById("memNoteInp"), text = (inp?.value || "").trim();
        if (!text || !activeRoomId) return;
        inp.value = "";
        const id = "mem_" + Date.now();
        await db.ref(`chats/${activeRoomId}/memories/${id}`).set({ id, text, by: me.username, byName: me.name, ts: Date.now() });
        playSendSound(); showToast("تم حفظ الذكرى بنجاح 💛");
    };

    window.deleteSharedMemory = async function (id) {
        if (!activeRoomId) return;
        await db.ref(`chats/${activeRoomId}/memories/${id}`).remove();
    };

    function renderMemoriesList() {
        const box = document.getElementById("memoriesListEl"); if (!box) return;
        const list = Object.values(currentMemoriesData || {}).sort((a, b) => (b.ts || 0) - (a.ts || 0));
        if (!list.length) { box.innerHTML = `<div style="text-align:center; padding:18px; color:var(--text-dim); font-size:12.5px;">لا توجد ذكريات محفوظة بعد — احفظ أول عبارة أو تاريخ حلو بينكم 💛</div>`; return; }
        box.innerHTML = list.map(m => `
            <div class="mem-item">
                <div><strong>💛 ${escapeHTML(m.text)}</strong><span>${escapeHTML(m.byName || "")} • ${formatDateLabel(m.ts)}</span></div>
                <button class="icon-btn danger" style="width:26px; height:26px; font-size:11px;" onclick="window.deleteSharedMemory('${escapeHTML(m.id)}')">✕</button>
            </div>`).join("");
    }

    function detachMemoriesAndCountdown() {
        if (countdownRef) { countdownRef.off(); countdownRef = null; }
        if (memoriesRef) { memoriesRef.off(); memoriesRef = null; }
        currentCountdownData = null; currentMemoriesData = {};
        renderCountdownBanner(null);
    }

    // ==================== 5. ثيم خاص لكل محادثة لوحدها (Per-Chat Theme 🎨) ====================
    function applyChatThemeCss(themeId) {
        const pane = document.getElementById("chatPane"); if (!pane) return;
        const th = CHAT_THEMES.find(t => t.id === themeId);
        if (th && th.bg) pane.style.setProperty("--chat-me-bg", th.bg);
        else pane.style.removeProperty("--chat-me-bg");
    }

    window.openChatThemeModal = function () {
        if (activeChatType !== "dm" || !activeRoomId) return;
        const grid = document.getElementById("chatThemeGrid");
        grid.innerHTML = CHAT_THEMES.map(t =>
            `<div class="prem-color-dot" style="background:${t.preview}" onclick="window.setActiveChatTheme('${t.id}')">${t.label}</div>`
        ).join("");
        document.getElementById("chatThemeModal").style.display = "flex";
    };

    window.setActiveChatTheme = async function (themeId) {
        if (activeChatType !== "dm" || !activeRoomId) return;
        await db.ref(`chats/${activeRoomId}/chat_theme`).set({ id: themeId || "", by: me.name, ts: Date.now() });
        document.getElementById("chatThemeModal").style.display = "none";
        showToast(themeId ? "تم تغيير ثيم هذه المحادثة لكليكما 🎨✨" : "تمت استعادة اللون الافتراضي");
    };

    function detachChatTheme() {
        if (chatThemeRef) { chatThemeRef.off(); chatThemeRef = null; }
        applyChatThemeCss("");
    }

    // ==================== 6. رسالة الكشط + النبضة الحية + السؤال اليومي + الرسم + الكبسولة + المود ====================
    window.toggleScratchMode = function () {
        scratchModeActive = !scratchModeActive;
        const btn = document.getElementById("scratchModeBtn"), fxBtn = document.getElementById("fxToggleBtn");
        if (btn) btn.classList.toggle("active", scratchModeActive);
        if (fxBtn) { fxBtn.innerText = scratchModeActive ? "🪄" : (selectedMsgEffect ? MSG_EFFECTS[selectedMsgEffect].icon : "✨"); fxBtn.classList.toggle("accent", scratchModeActive || !!selectedMsgEffect); }
        if (scratchModeActive) { if (typeof toggleChatExtras === "function") toggleChatExtras(false); showToast("🪄 وضع الكشط شغال — رسالتك الجاية تنكشف بمسح الإصبع!"); }
    };

    function mountScratchCanvas(boxEl, secretHTML) {
        boxEl.innerHTML = `<div class="scratch-secret">${secretHTML}</div><canvas class="scratch-canvas"></canvas>`;
        const canvas = boxEl.querySelector(".scratch-canvas");
        let initialized = false, drawing = false, cleared = false, moves = 0;
        const initLayer = () => {
            if (initialized) return;
            const rect = boxEl.getBoundingClientRect();
            const w = Math.max(170, Math.round(rect.width || 190)), h = Math.max(54, Math.round(rect.height || 58));
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext("2d"), grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, "#1e293b"); grad.addColorStop(0.5, "#3b2e6e"); grad.addColorStop(1, "#0f172a");
            ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "rgba(255,255,255,0.22)";
            for (let i = 0; i < 24; i++) ctx.fillRect((i * 37) % w, (i * 19) % h, 2, 2);
            ctx.fillStyle = "#e2e8f0"; ctx.font = "bold 12px Tajawal, sans-serif";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("🪄 امسح بإصبعك لتكشف السر", w / 2, h / 2);
            initialized = true;
        };
        requestAnimationFrame(initLayer); setTimeout(initLayer, 180);
        const scratchAt = (cx, cy) => {
            if (cleared) return;
            initLayer();
            const rect = canvas.getBoundingClientRect();
            const x = ((cx - rect.left) / rect.width) * canvas.width, y = ((cy - rect.top) / rect.height) * canvas.height;
            const ctx = canvas.getContext("2d");
            ctx.globalCompositeOperation = "destination-out"; ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill();
            moves++;
            if (moves % 6 === 0 && typeof triggerHaptic === "function") triggerHaptic(6);
            if (moves >= 18) { cleared = true; canvas.classList.add("done"); if (typeof triggerHaptic === "function") triggerHaptic(18); playSendSound(); }
        };
        canvas.addEventListener("pointerdown", e => { e.stopPropagation(); drawing = true; canvas.setPointerCapture?.(e.pointerId); scratchAt(e.clientX, e.clientY); });
        canvas.addEventListener("pointermove", e => { if (!drawing) return; e.stopPropagation(); scratchAt(e.clientX, e.clientY); });
        canvas.addEventListener("pointerup", () => { drawing = false; });
        canvas.addEventListener("pointercancel", () => { drawing = false; });
    }

    window.sendLiveHeartbeatTo = async function (targetUser) {
        if (!targetUser || !me) return;
        const now = Date.now();
        if (now - lastHeartbeatTs < 4000) { showToast("انتظر ثواني قبل إرسال نبضة جديدة 💓"); return; }
        lastHeartbeatTs = now;
        await db.ref(`heartbeats/${targetUser}`).set({ from: me.username, fromName: me.name, ts: now });
        if (typeof triggerHaptic === "function") triggerHaptic([60, 50, 90]);
        window.playScreenEffect("hearts");
        showToast(`💓 أرسلت نبضة حية إلى ${contactProfiles[targetUser]?.name || targetUser}`);
    };
    window.sendLiveHeartbeat = () => { if (activeChatType === "dm" && activePartner) window.sendLiveHeartbeatTo(activePartner); };

    function showHeartbeatOverlay(fromName) {
        const ov = document.getElementById("heartbeatOverlay"), lbl = document.getElementById("hbOverlayText"); if (!ov || !lbl) return;
        lbl.innerText = `💓 ${fromName} ببالك هسة`;
        ov.classList.remove("pulse"); void ov.offsetWidth; ov.classList.add("pulse");
        if (typeof triggerHaptic === "function") triggerHaptic([80, 60, 120, 60, 80]);
        playRecvSound(); setTimeout(() => ov.classList.remove("pulse"), 2650);
    }

    function getTodayPromptIndex() {
        const dayKey = getLocalDayKey();
        let h = 0; for (let i = 0; i < dayKey.length; i++) h = (h * 31 + dayKey.charCodeAt(i)) >>> 0;
        return h % DAILY_PROMPTS_BANK.length;
    }
    window.closeDailyPromptModal = () => { if (dailyPromptRef) { dailyPromptRef.off(); dailyPromptRef = null; } const m = document.getElementById("dailyPromptModal"); if (m) m.style.display = "none"; };
    window.openDailyPromptModal = () => {
        if (activeChatType !== "dm" || !activeRoomId || !me) return;
        const dayKey = getLocalDayKey(), defaultQ = DAILY_PROMPTS_BANK[getTodayPromptIndex()], roomCopy = activeRoomId, partnerName = contactProfiles[activePartner]?.name || activePartner;
        if (dailyPromptRef) dailyPromptRef.off();
        dailyPromptRef = db.ref(`chats/${roomCopy}/daily_prompts/${dayKey}`);
        document.getElementById("dailyPromptModal").style.display = "flex";
        dailyPromptRef.on("value", snap => {
            const d = snap.val() || { question: defaultQ, answers: {} }, qText = d.question || defaultQ, answers = d.answers || {};
            const myAns = answers[me.username], partnerAns = answers[activePartner], both = !!(myAns && partnerAns), body = document.getElementById("dpBody"); if (!body) return;
            let html = `<div class="dp-q-box"><h4>${escapeHTML(qText)}</h4></div>`;
            if (both) html += `<div class="dp-ans-card"><strong>💬 جوابك (${escapeHTML(me.name)}):</strong><p>${escapeHTML(myAns.text)}</p></div><div class="dp-ans-card" style="border-color:#f472b6;"><strong>💜 جواب ${escapeHTML(partnerName)}:</strong><p>${escapeHTML(partnerAns.text)}</p></div><div style="text-align:center; font-size:12px; color:var(--success); font-weight:800; margin-top:8px;">✨ انكشف الجوابان! نلتقي بسؤال جديد باچر 🌙</div>`;
            else if (myAns) html += `<div class="dp-ans-card"><strong>💬 جوابك المحفوظ:</strong><p>${escapeHTML(myAns.text)}</p></div><div class="dp-ans-card" style="text-align:center; border-style:dashed;"><p style="color:var(--text-dim);">⏳ بانتظار <b>${escapeHTML(partnerName)}</b> يكتب جوابه حتى تنفتح الإجابات سوا!</p></div>`;
            else html += `${partnerAns ? `<div style="background:rgba(16,185,129,0.16); border:1px solid var(--success); border-radius:14px; padding:9px 12px; font-size:12.5px; color:#6ee7b7; font-weight:700; text-align:center; margin-bottom:10px;">🔒 ${escapeHTML(partnerName)} جاوب بالفعل! اكتب جوابك هسة حتى ينفتح جوابه فوراً</div>` : ""}<textarea id="dpAnswerInp" class="input" rows="3" placeholder="اكتب جوابك بصراحة..."></textarea><button class="btn" style="margin-top:10px;" onclick="window.submitDailyPromptAnswer()">حفظ وكشف الجواب ✨</button>`;
            body.innerHTML = html;
        });
    };
    window.submitDailyPromptAnswer = async () => {
        const txt = (document.getElementById("dpAnswerInp")?.value || "").trim(); if (!txt || !activeRoomId || !me) return;
        const dayKey = getLocalDayKey();
        await db.ref(`chats/${activeRoomId}/daily_prompts/${dayKey}`).update({ question: DAILY_PROMPTS_BANK[getTodayPromptIndex()] });
        await db.ref(`chats/${activeRoomId}/daily_prompts/${dayKey}/answers/${me.username}`).set({ text: txt, name: me.name, ts: Date.now() });
        sendNotification(activePartner, `جاوب ${me.name} على سؤال اليوم السري — افتحه وجاوب لتكشفه!`, "💌");
        window.playScreenEffect("hearts"); showToast("تم حفظ جوابك السري 💌✨");
    };

    const DRAW_PALETTE = ["#38bdf8", "#f472b6", "#fbbf24", "#34d399", "#a78bfa", "#fb7185", "#ffffff"];
    let drawCtx = null, isPointerDrawing = false, currentStrokePts = [], renderedStrokeIds = new Set();
    window.closeLiveDrawModal = () => { if (liveDrawRef) { liveDrawRef.off(); liveDrawRef = null; } renderedStrokeIds.clear(); const m = document.getElementById("liveDrawModal"); if (m) m.style.display = "none"; };
    function drawStrokeOnCtx(ctx, st, w, h) {
        if (!st || !Array.isArray(st.pts) || st.pts.length < 2) return;
        ctx.strokeStyle = st.color || "#38bdf8"; ctx.lineWidth = st.size || 4; ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath(); ctx.moveTo(st.pts[0][0] * w, st.pts[0][1] * h);
        for (let i = 1; i < st.pts.length; i++) ctx.lineTo(st.pts[i][0] * w, st.pts[i][1] * h);
        ctx.stroke();
    }
    window.openLiveDrawModal = () => {
        if (activeChatType !== "dm" || !activeRoomId) return;
        document.getElementById("liveDrawModal").style.display = "flex";
        document.getElementById("liveDrawColors").innerHTML = DRAW_PALETTE.map(c => `<div class="draw-dot ${c === liveDrawColor ? 'active' : ''}" style="background:${c}" onclick="window.setLiveDrawColor('${c}', this)"></div>`).join("");
        const canvas = document.getElementById("liveDrawCanvas"); canvas.width = 520; canvas.height = 390;
        drawCtx = canvas.getContext("2d"); drawCtx.fillStyle = "#070c18"; drawCtx.fillRect(0, 0, canvas.width, canvas.height); renderedStrokeIds.clear();
        if (!canvas._boundV11) {
            canvas._boundV11 = true;
            const getNorm = e => { const r = canvas.getBoundingClientRect(); return [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))]; };
            canvas.addEventListener("pointerdown", e => { isPointerDrawing = true; canvas.setPointerCapture?.(e.pointerId); currentStrokePts = [getNorm(e)]; });
            canvas.addEventListener("pointermove", e => {
                if (!isPointerDrawing) return;
                const pt = getNorm(e), prev = currentStrokePts[currentStrokePts.length - 1];
                if (prev && Math.hypot(pt[0] - prev[0], pt[1] - prev[1]) < 0.006) return;
                currentStrokePts.push(pt); drawStrokeOnCtx(drawCtx, { color: liveDrawColor, size: liveDrawSize, pts: [prev, pt] }, canvas.width, canvas.height);
            });
            const endStroke = () => {
                if (!isPointerDrawing) return; isPointerDrawing = false;
                if (currentStrokePts.length >= 2 && activeRoomId) {
                    const id = "dk_" + Date.now() + "_" + Math.random().toString(36).slice(2, 5); renderedStrokeIds.add(id);
                    db.ref(`chats/${activeRoomId}/live_draw/${id}`).set({ color: liveDrawColor, size: liveDrawSize, pts: currentStrokePts.slice(0, 120), by: me.username }).catch(() => {});
                }
                currentStrokePts = [];
            };
            canvas.addEventListener("pointerup", endStroke); canvas.addEventListener("pointercancel", endStroke);
        }
        if (liveDrawRef) liveDrawRef.off();
        liveDrawRef = db.ref(`chats/${activeRoomId}/live_draw`);
        liveDrawRef.on("child_added", s => { if (renderedStrokeIds.has(s.key)) return; renderedStrokeIds.add(s.key); drawStrokeOnCtx(drawCtx, s.val(), canvas.width, canvas.height); });
        liveDrawRef.on("value", s => { if (!s.exists()) { renderedStrokeIds.clear(); drawCtx.fillStyle = "#070c18"; drawCtx.fillRect(0, 0, canvas.width, canvas.height); } });
    };
    window.setLiveDrawColor = (c, el) => { liveDrawColor = c; document.querySelectorAll("#liveDrawColors .draw-dot").forEach(d => d.classList.remove("active")); if (el) el.classList.add("active"); };
    window.clearLiveDrawCanvas = async () => { if (activeRoomId) await db.ref(`chats/${activeRoomId}/live_draw`).remove(); };
    window.sendLiveDrawToChat = async () => { const c = document.getElementById("liveDrawCanvas"); if (!c || !activeRoomId) return; const d = c.toDataURL("image/jpeg", 0.80); window.closeLiveDrawModal(); await pushMessageSafe("image", d, "🎨 رسمة مشتركة لايف"); showToast("تم إرسال الرسمة بالمحادثة 🎨✨"); };

    window.openTimeCapsuleModal = () => { if (!activeRoomId) return; document.getElementById("capTitleInp").value = ""; document.getElementById("capTextInp").value = ""; document.getElementById("timeCapsuleModal").style.display = "flex"; setTimeout(() => document.getElementById("capTextInp").focus(), 80); };
    window.sendTimeCapsule = async () => {
        const title = (document.getElementById("capTitleInp").value || "").trim(), text = (document.getElementById("capTextInp").value || "").trim(), delayMs = parseInt(document.getElementById("capDelaySel").value || "86400000", 10);
        if (!text) { showToast("اكتب الرسالة داخل الكبسولة أولاً"); return; }
        document.getElementById("timeCapsuleModal").style.display = "none";
        await pushMessageSafe("capsule", text, "⏳ كبسولة زمن مقفولة", { unlockAt: Date.now() + delayMs, capTitle: title || "كبسولة زمن سرية" });
        showToast("تم إرسال كبسولة الزمن 🔒⏳");
    };
    function formatCountdown(ms) {
        if (ms <= 0) return "جاهزة للفتح! 🔓";
        const s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
        return d > 0 ? `${d} يوم و ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    }
    function refreshAllCapsuleCountdowns() {
        document.querySelectorAll(".capsule-card[data-unlock]").forEach(card => {
            if (card.getAttribute("data-opened") === "1") return;
            const left = parseInt(card.getAttribute("data-unlock") || "0", 10) - Date.now(), tm = card.querySelector(".capsule-timer"), sub = card.querySelector(".capsule-sub");
            if (left <= 0) { card.classList.add("unlocked"); if (tm) tm.innerText = "🔓 حان وقت الفتح!"; if (sub) sub.innerText = "اضغط الآن لفتح كبسولة الزمن ✨"; }
            else if (tm) tm.innerText = formatCountdown(left);
        });
    }

    function renderMyMoodBar() {
        const slot = document.getElementById("myMoodBarSlot"); if (!slot || !me) return;
        const cur = me.moodText || "";
        slot.innerHTML = `<div class="mood-strip">${QUICK_MOODS.map(m => { const val = m.id ? m.label : ""; return `<button type="button" class="mood-chip ${cur === val ? 'active' : ''}" onclick="window.setMyQuickMood('${escapeHTML(val)}')">${m.label}</button>`; }).join("")}</div>`;
    }
    window.setMyQuickMood = async val => { if (!me) return; await db.ref(`users/${me.username}/moodText`).set(val || ""); me.moodText = val || ""; renderMyMoodBar(); showToast(val ? `حالتك الآن: ${val}` : "تمت إزالة حالة المود"); };

    // ==================== 7. نافذة الأغاني المطوّرة (بحث + يوتيوب + MP3 + قصّ المدة / تشغيل للنهاية) ====================
    window.openMusicPicker = function (title, onSelect, opts = {}) {
        musicPickerCallback = onSelect;
        musicPickerAllowTrim = opts.allowTrim !== false;
        musicPreviewIdx = -1;
        pendingTrimSong = null;
        document.getElementById("mpTitle").innerText = title || "🎵 اختر أغنية";
        document.getElementById("musicSearchInp").value = "";
        document.getElementById("mpTrimStage").style.display = "none";
        document.getElementById("musicPickerModal").style.display = "flex";
        window.switchMusicSourceTab("search");
        window.selectMusicCategory(activeMusicCat || "iraqi");
    };

    window.closeMusicPicker = function () {
        PremAudio.stop("preview"); musicPreviewIdx = -1; pendingTrimSong = null;
        document.getElementById("musicPickerModal").style.display = "none";
    };

    window.switchMusicSourceTab = function (tab) {
        activeMusicSourceTab = tab;
        PremAudio.stop("preview");
        document.getElementById("mpTrimStage").style.display = "none";
        document.getElementById("mpSrcSearch").classList.toggle("active", tab === "search");
        document.getElementById("mpSrcYt").classList.toggle("active", tab === "youtube");
        document.getElementById("mpSrcMp3").classList.toggle("active", tab === "mp3");
        document.getElementById("mpPaneSearch").style.display = tab === "search" ? "flex" : "none";
        document.getElementById("mpPaneYt").style.display = tab === "youtube" ? "block" : "none";
        document.getElementById("mpPaneMp3").style.display = tab === "mp3" ? "block" : "none";
    };

    function openTrimStageForSong(song) {
        PremAudio.stop("preview");
        pendingTrimSong = {
            ...song,
            playFull: true,
            startSec: 0,
            endSec: Math.round(song.durationSec || 30)
        };
        document.getElementById("mpPaneSearch").style.display = "none";
        document.getElementById("mpPaneYt").style.display = "none";
        document.getElementById("mpPaneMp3").style.display = "none";

        const stage = document.getElementById("mpTrimStage");
        stage.style.display = "block";

        // جلب المدة الحقيقية للصوت إن أمكن
        if (song.url) {
            const probe = new Audio(song.url);
            probe.addEventListener("loadedmetadata", () => {
                if (isFinite(probe.duration) && probe.duration > 1 && pendingTrimSong) {
                    const dur = Math.max(5, Math.floor(probe.duration));
                    pendingTrimSong.durationSec = dur;
                    pendingTrimSong.endSec = dur;
                    renderTrimStageUI();
                }
            }, { once: true });
        }
        renderTrimStageUI();
    }

    function renderTrimStageUI() {
        const stage = document.getElementById("mpTrimStage"), s = pendingTrimSong;
        if (!stage || !s) return;
        const maxDur = Math.max(5, Math.round(s.durationSec || 30));
        const isYt = !!s.ytId && !s.url;
        const isPlaying = PremAudio.context === "preview" && !PremAudio.el.paused;

        stage.innerHTML = `
            <div class="trim-card">
                <div class="song-card-inline" style="margin-top:0; margin-bottom:10px;">
                    <img class="song-cover round ${isPlaying ? 'spin' : ''}" src="${escapeHTML(s.cover || '')}" onerror="this.style.display='none'">
                    <div class="song-meta">
                        <strong>${escapeHTML(s.title)}</strong>
                        <span>${escapeHTML(s.artist || (isYt ? "أغنية يوتيوب كاملة" : "ملف صوتي"))} • ${isYt ? "كاملة" : (maxDur + " ثانية")}</span>
                    </div>
                    ${s.url ? `<button type="button" class="song-play-btn" onclick="window.previewTrimmedSong()">${isPlaying ? "⏸" : "▶"}</button>` : ""}
                </div>

                <label class="trim-toggle" onclick="window.toggleTrimPlayFull()">
                    <span>♾️ تشغيل الأغنية للنهاية (بدون قصّ)</span>
                    <span style="color:${s.playFull ? 'var(--success)' : 'var(--text-dim)'};">${s.playFull ? "مفعّل ✓" : "مخصص ✂️"}</span>
                </label>

                ${(!s.playFull && !isYt) ? `
                    <div class="trim-range-row">
                        <span style="min-width:68px;">البداية: ${s.startSec}ث</span>
                        <input type="range" min="0" max="${Math.max(1, maxDur - 3)}" value="${s.startSec}" oninput="window.updateTrimRange('start', this.value)">
                    </div>
                    <div class="trim-range-row">
                        <span style="min-width:68px;">النهاية: ${s.endSec}ث</span>
                        <input type="range" min="3" max="${maxDur}" value="${s.endSec}" oninput="window.updateTrimRange('end', this.value)">
                    </div>
                    <div style="text-align:center; font-size:11.5px; color:var(--accent); font-weight:700;">المدة المختارة: ${Math.max(3, s.endSec - s.startSec)} ثانية ✂️</div>
                ` : (!s.playFull && isYt) ? `
                    <div class="trim-range-row">
                        <span style="min-width:82px;">ابدأ من (ث):</span>
                        <input type="number" class="input" min="0" max="600" value="${s.startSec}" oninput="window.updateTrimRange('start', this.value)">
                    </div>
                ` : ""}
            </div>
            <div style="display:flex; gap:8px;">
                <button class="btn" style="flex:1;" onclick="window.confirmTrimmedSongSelection()">اعتماد الأغنية ✅</button>
                <button class="btn btn-outline btn-sm" onclick="window.switchMusicSourceTab(activeMusicSourceTab)">رجوع</button>
            </div>`;
    }

    window.toggleTrimPlayFull = function () {
        if (!pendingTrimSong) return;
        pendingTrimSong.playFull = !pendingTrimSong.playFull;
        if (!pendingTrimSong.playFull) {
            const maxDur = Math.max(6, Math.round(pendingTrimSong.durationSec || 30));
            pendingTrimSong.startSec = 0;
            pendingTrimSong.endSec = Math.min(maxDur, 15);
        }
        renderTrimStageUI();
    };

    window.updateTrimRange = function (which, val) {
        if (!pendingTrimSong) return;
        const n = Math.max(0, parseInt(val || "0", 10));
        const maxDur = Math.max(5, Math.round(pendingTrimSong.durationSec || 30));
        if (which === "start") {
            pendingTrimSong.startSec = Math.min(n, maxDur - 3);
            if (pendingTrimSong.endSec <= pendingTrimSong.startSec + 2) pendingTrimSong.endSec = Math.min(maxDur, pendingTrimSong.startSec + 3);
        } else {
            pendingTrimSong.endSec = Math.max(pendingTrimSong.startSec + 3, Math.min(n, maxDur));
        }
        renderTrimStageUI();
    };

    window.previewTrimmedSong = async function () {
        if (!pendingTrimSong?.url) return;
        if (PremAudio.context === "preview" && !PremAudio.el.paused) {
            PremAudio.stop("preview"); renderTrimStageUI(); return;
        }
        await PremAudio.play(pendingTrimSong.url, "preview", {
            loop: false,
            clipStart: pendingTrimSong.playFull ? 0 : pendingTrimSong.startSec,
            clipEnd: pendingTrimSong.playFull ? 0 : pendingTrimSong.endSec,
            playFull: pendingTrimSong.playFull
        });
        renderTrimStageUI();
    };

    window.confirmTrimmedSongSelection = function () {
        const song = pendingTrimSong, cb = musicPickerCallback;
        window.closeMusicPicker();
        if (song && typeof cb === "function") cb(song);
    };

    window.confirmYoutubeSongPick = function () {
        const url = document.getElementById("mpYtUrlInp").value.trim();
        const ytId = extractYoutubeId(url);
        if (!ytId) { showToast("الرابط غير صحيح — الصق رابط يوتيوب صحيح"); return; }
        const title = document.getElementById("mpYtTitleInp").value.trim() || "أغنية يوتيوب كاملة";
        const song = {
            title, artist: "YouTube كامل 🎬",
            cover: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
            ytId, url: "", source: "youtube", playFull: true, startSec: 0, durationSec: 60
        };
        if (musicPickerAllowTrim) openTrimStageForSong(song);
        else { const cb = musicPickerCallback; window.closeMusicPicker(); if (typeof cb === "function") cb(song); }
    };

    window.handleLocalMp3Upload = function (e) {
        const f = e.target.files[0]; e.target.value = ""; if (!f) return;
        if (f.size > 2.6 * 1024 * 1024) { showToast("الحد الأقصى للملف الصوتي 2.5 ميجابايت حتى يفتح بسرعة"); return; }
        const stEl = document.getElementById("mpLocalStatus");
        if (stEl) stEl.innerText = "⏳ جاري تجهيز الملف الصوتي...";
        const r = new FileReader();
        r.onload = ev => {
            const customTitle = (document.getElementById("mpLocalTitleInp")?.value || "").trim();
            const cleanName = customTitle || f.name.replace(/\.[^.]+$/, "").slice(0, 42);
            const song = { title: cleanName, artist: "ملف MP3 مخصص 🎧", cover: "", url: ev.target.result, source: "mp3", playFull: true, startSec: 0, durationSec: 30 };
            openTrimStageForSong(song);
        };
        r.readAsDataURL(f);
    };

    window.selectMusicCategory = async function (catId) {
        activeMusicCat = catId;
        document.querySelectorAll("#musicCatsBar .pack-tab-pill").forEach(b => b.classList.toggle("active", b.getAttribute("data-mcat") === catId));
        PremAudio.stop("preview"); musicPreviewIdx = -1;
        const box = document.getElementById("musicResultsList");
        if (!musicCatCache[catId]) box.innerHTML = `<div style="text-align:center; padding:26px; color:var(--text-dim); font-size:13px;">⏳ جاري جلب الاقتراحات الموسيقية...</div>`;
        try {
            const list = await loadSuggestedCategory(catId);
            if (activeMusicCat !== catId) return;
            lastMusicResults = list;
            if (!list.length) { box.innerHTML = `<div style="text-align:center; padding:24px; color:var(--text-dim); font-size:13px;">تعذر جلب المقترحات — جرّب البحث بالأعلى</div>`; return; }
            renderMusicSearchResults();
        } catch { box.innerHTML = `<div style="text-align:center; padding:24px; color:#fb7185; font-size:13px;">تأكد من اتصال النت وحاول مرة ثانية</div>`; }
    };

    window.runMusicSearch = async function () {
        const q = (document.getElementById("musicSearchInp").value || "").trim();
        const box = document.getElementById("musicResultsList");
        if (!q) { window.selectMusicCategory(activeMusicCat || "iraqi"); return; }
        document.querySelectorAll("#musicCatsBar .pack-tab-pill").forEach(b => b.classList.remove("active"));
        PremAudio.stop("preview"); musicPreviewIdx = -1;
        box.innerHTML = `<div style="text-align:center; padding:26px; color:var(--text-dim); font-size:13px;">⏳ جاري البحث عن «${escapeHTML(q)}»...</div>`;
        try {
            const list = await searchItunesSongs(q, 14);
            lastMusicResults = list;
            if (!list.length) { box.innerHTML = `<div style="text-align:center; padding:26px; color:var(--text-dim); font-size:13px;">ما لگينا نتائج لـ «${escapeHTML(q)}»</div>`; return; }
            renderMusicSearchResults();
        } catch { box.innerHTML = `<div style="text-align:center; padding:26px; color:#fb7185; font-size:13px;">تعذر البحث حالياً</div>`; }
    };

    function renderMusicSearchResults() {
        const box = document.getElementById("musicResultsList"); if (!box) return;
        box.innerHTML = lastMusicResults.map((s, i) => {
            const isPlaying = musicPreviewIdx === i && PremAudio.context === "preview" && !PremAudio.el.paused;
            return `<div class="music-res-item"><img class="song-cover ${isPlaying ? 'round spin' : ''}" src="${escapeHTML(s.cover)}" onerror="this.style.visibility='hidden'"><div class="song-meta"><strong>${escapeHTML(s.title)}</strong><span>${escapeHTML(s.artist)}</span></div><button type="button" class="song-play-btn" onclick="window.previewMusicResult(${i})">${isPlaying ? "⏸" : "▶"}</button><button type="button" class="btn btn-sm" onclick="window.pickMusicResult(${i})">اختيار</button></div>`;
        }).join("");
    }
    window.previewMusicResult = async idx => { const s = lastMusicResults[idx]; if (!s) return; if (musicPreviewIdx === idx && PremAudio.context === "preview" && !PremAudio.el.paused) { PremAudio.stop("preview"); musicPreviewIdx = -1; renderMusicSearchResults(); return; } musicPreviewIdx = idx; await PremAudio.play(s.url, "preview"); renderMusicSearchResults(); };
    window.pickMusicResult = idx => {
        const s = lastMusicResults[idx]; if (!s) return;
        if (musicPickerAllowTrim) openTrimStageForSong(s);
        else { const cb = musicPickerCallback; window.closeMusicPicker(); if (typeof cb === "function") cb({ ...s, playFull: true, startSec: 0 }); }
    };

    // ==================== 8. أغنية البروفايل + نسمع سوا + الشعلة + المختفي + الملاحظات ====================
    function songBadgeMeta(song) {
        if (!song) return "";
        if (song.ytId && !song.url) return "🎬 يوتيوب كامل";
        if (song.playFull) return "♾️ كاملة";
        if (typeof song.startSec === "number" && typeof song.endSec === "number") return `✂️ ${song.startSec}ث–${song.endSec}ث`;
        return "";
    }

    function renderSongCardInto(containerId, song, ctxKey, isMine) {
        const box = document.getElementById(containerId); if (!box) return;
        if (!song || (!song.url && !song.ytId)) {
            box.innerHTML = isMine ? `<button type="button" class="btn btn-sm btn-outline" style="width:100%; margin:4px 0 8px; border-style:dashed;" onclick="window.pickMyProfileSong()">🎵 إضافة أغنيتك المفضلة للبروفايل</button>` : "";
            box._songObj = null; return;
        }
        const isYtOnly = !!song.ytId && !song.url;
        const playing = !isYtOnly && PremAudio.context === ctxKey && PremAudio.currentUrl === song.url && !PremAudio.el.paused;
        const badge = songBadgeMeta(song);
        box.innerHTML = `<div class="song-card-inline">
            <img class="song-cover round ${playing ? 'spin' : ''}" src="${escapeHTML(song.cover || '')}" onerror="this.style.display='none'">
            <div class="song-meta">
                <strong><span class="eq-bars ${playing ? 'on' : ''}"><i></i><i></i><i></i></span> &nbsp;${escapeHTML(song.title)}</strong>
                <span>${escapeHTML(song.artist || "مقطع صوتي")} ${badge ? "• " + badge : ""}</span>
            </div>
            ${isYtOnly
                ? `<button type="button" class="song-play-btn" onclick="window.openProfileYtEmbed('${escapeHTML(containerId)}')">▶</button>`
                : `<button type="button" class="song-play-btn" onclick="window.toggleProfileSongPlay('${ctxKey}', '${escapeHTML(containerId)}')">${playing ? "⏸" : "▶"}</button>`}
            ${isMine ? `<button type="button" class="pack-mini-btn" onclick="window.pickMyProfileSong()">تغيير</button>` : ""}
        </div><div id="${escapeHTML(containerId)}_ytSlot"></div>`;
        box._songObj = song;
    }

    window.openProfileYtEmbed = function (containerId) {
        const box = document.getElementById(containerId), s = box?._songObj, slot = document.getElementById(containerId + "_ytSlot");
        if (!s?.ytId || !slot) return;
        if (slot.innerHTML) { slot.innerHTML = ""; return; }
        const st = Math.max(0, s.startSec || 0);
        slot.innerHTML = `<div class="yt-frame-wrap" style="margin-top:8px;"><iframe src="https://www.youtube.com/embed/${encodeURIComponent(s.ytId)}?autoplay=1&start=${st}&rel=0&playsinline=1" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`;
    };

    window.toggleProfileSongPlay = async (ctxKey, containerId) => {
        const b = document.getElementById(containerId), s = b?._songObj; if (!s?.url) return;
        await PremAudio.toggle(s.url, ctxKey, {
            loop: true,
            clipStart: s.playFull ? 0 : (s.startSec || 0),
            clipEnd: s.playFull ? 0 : (s.endSec || 0),
            playFull: s.playFull !== false
        });
        renderSongCardInto(containerId, s, ctxKey, containerId === "myProfileSongSlot");
    };
    window.pickMyProfileSong = () => window.openMusicPicker("🎵 اختر أغنية لبروفايلك", async s => { if (!me) return; await db.ref(`users/${me.username}/profileSong`).set(s); me.profileSong = s; renderSongCardInto("myProfileSongSlot", s, "profile_me", true); showToast(`تم تثبيت «${s.title}» 🎵✨`); });
    window.removeMyProfileSong = async () => { if (!me) return; PremAudio.stop("profile_me"); await db.ref(`users/${me.username}/profileSong`).remove(); me.profileSong = null; renderSongCardInto("myProfileSongSlot", null, "profile_me", true); showToast("تمت الإزالة"); };

    window.startListenTogetherPicker = () => {
        if (activeChatType !== "dm" || !activeRoomId) return;
        window.openMusicPicker("🎧 اختر أغنية نسمعها سوا", async song => {
            if (activeChatType !== "dm" || !activeRoomId) return;
            if (song.ytId && !song.url) {
                // إذا اختار رابط يوتيوب كامل -> يشغّله بميزة يوتيوب سوا لايف فوراً
                ytPlayerMinimized = false;
                await db.ref(`chats/${activeRoomId}/yt_together`).set({ ytId: song.ytId, title: song.title, startedAt: Date.now(), offset: song.startSec || 0, by: me.name, rev: Date.now() });
                showToast(`📺 تم تشغيل الأغنية الكاملة: ${song.title}`);
                return;
            }
            const now = Date.now();
            await db.ref(`chats/${activeRoomId}/listen_together`).set({
                title: song.title, artist: song.artist, cover: song.cover || "", url: song.url,
                playing: true, startedAt: now, offset: song.playFull ? 0 : (song.startSec || 0),
                clipStart: song.playFull ? 0 : (song.startSec || 0),
                clipEnd: song.playFull ? 0 : (song.endSec || 0),
                playFull: song.playFull !== false, by: me.name, byUser: me.username, ts: now
            });
            PremAudio.play(song.url, "listen", {
                loop: true,
                startAt: song.playFull ? 0 : (song.startSec || 0),
                clipStart: song.playFull ? 0 : (song.startSec || 0),
                clipEnd: song.playFull ? 0 : (song.endSec || 0),
                playFull: song.playFull !== false
            });
            showToast(`🎧 بدأت جلسة استماع: ${song.title}`);
        });
    };

    window.toggleListenTogetherPlay = async () => {
        if (activeChatType !== "dm" || !activeRoomId || !currentListenData) return;
        const d = currentListenData, now = Date.now();
        if (d.playing) {
            const el = Math.max(0, (now - (d.startedAt || now)) / 1000);
            await db.ref(`chats/${activeRoomId}/listen_together`).update({ playing: false, offset: ((d.offset || 0) + el) % 180, startedAt: now });
        } else {
            await db.ref(`chats/${activeRoomId}/listen_together`).update({ playing: true, startedAt: now });
            PremAudio.play(d.url, "listen", { loop: true, startAt: d.offset || 0, clipStart: d.clipStart || 0, clipEnd: d.clipEnd || 0, playFull: d.playFull !== false });
        }
    };
    window.syncListenTogetherTap = () => {
        if (!currentListenData?.url) return;
        const d = currentListenData;
        const el = d.playing ? Math.max(0, (Date.now() - (d.startedAt || Date.now())) / 1000) : 0;
        PremAudio.play(d.url, "listen", { loop: true, startAt: (d.offset || 0) + el, clipStart: d.clipStart || 0, clipEnd: d.clipEnd || 0, playFull: d.playFull !== false }).then(ok => { if (ok) renderListenTogetherBar(d, false); });
    };
    window.stopListenTogether = async () => { PremAudio.stop("listen"); if (activeChatType === "dm" && activeRoomId) await db.ref(`chats/${activeRoomId}/listen_together`).remove(); };

    function renderListenTogetherBar(data, needsTap = false) {
        const bar = document.getElementById("listenTogetherBar"), pane = document.getElementById("chatPane"); if (!bar) return;
        if (!data || !data.url) { bar.classList.remove("open"); bar.innerHTML = ""; if (pane) pane.classList.remove("music-glow-on"); return; }
        const isPlaying = data.playing && PremAudio.context === "listen" && !PremAudio.el.paused;
        if (pane) pane.classList.toggle("music-glow-on", isPlaying);
        bar.classList.add("open");
        bar.innerHTML = `<img class="song-cover round ${isPlaying ? 'spin' : ''}" style="width:36px; height:36px;" src="${escapeHTML(data.cover || '')}" onerror="this.style.display='none'"><div class="lt-info"><strong><span class="eq-bars ${isPlaying ? 'on' : ''}"><i></i><i></i><i></i></span> ${escapeHTML(data.title)}</strong><span>🎧 نسمع سوا • ${escapeHTML(data.artist || "")} (${escapeHTML(data.by || "")})</span></div>${needsTap ? `<button type="button" class="lt-sync-pill" onclick="window.syncListenTogetherTap()">▶ استمع الآن</button>` : `<button type="button" class="lt-btn" onclick="window.toggleListenTogetherPlay()">${data.playing ? "⏸" : "▶"}</button>`}<button type="button" class="lt-btn" onclick="window.startListenTogetherPicker()">🎵</button><button type="button" class="lt-btn" onclick="window.stopListenTogether()">✕</button>`;
    }
    function detachListenTogether() { if (listenRef) { listenRef.off(); listenRef = null; } currentListenData = null; PremAudio.stop("listen"); renderListenTogetherBar(null); }

    function getLocalDayKey(ts = Date.now()) { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
    function diffDays(a, b) { if (!a || !b) return 999; const [y1, m1, d1] = a.split("-").map(Number), [y2, m2, d2] = b.split("-").map(Number); return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000); }
    function getActiveStreakInfo(roomId) { const st = allStreaksMap[roomId]; if (!st?.lastDay || !st.count) return null; const gap = diffDays(st.lastDay, getLocalDayKey()); if (gap === 0) return { count: st.count, warn: false }; if (gap === 1) return { count: st.count, warn: true }; return null; }
    async function bumpDmStreak(roomId) {
        if (!roomId) return;
        const today = getLocalDayKey(), cur = allStreaksMap[roomId];
        if (!cur?.lastDay) { await db.ref(`chat_streaks/${roomId}`).set({ count: 1, lastDay: today, updatedAt: Date.now() }).catch(() => {}); return; }
        const gap = diffDays(cur.lastDay, today);
        if (gap === 1) { const next = (cur.count || 1) + 1; await db.ref(`chat_streaks/${roomId}`).set({ count: next, lastDay: today, updatedAt: Date.now() }).catch(() => {}); showToast(`🔥 شعلة التواصل وصلت ${next} أيام!`); }
        else if (gap > 1) await db.ref(`chat_streaks/${roomId}`).set({ count: 1, lastDay: today, updatedAt: Date.now() }).catch(() => {});
    }

    function applyVanishUI(active) {
        isVanishActive = !!active;
        const pane = document.getElementById("chatPane"), banner = document.getElementById("vanishBanner"), menuBtn = document.getElementById("btnChatToolsMenu"), item = document.getElementById("menuVanishBtn");
        if (pane) pane.classList.toggle("vanish-on", isVanishActive);
        if (banner) banner.classList.toggle("open", isVanishActive);
        if (menuBtn) menuBtn.classList.toggle("vanish-active", isVanishActive);
        if (item) item.innerHTML = isVanishActive ? "👻 &nbsp; إيقاف الوضع المختفي" : "👻 &nbsp; تفعيل الوضع المختفي";
    }
    window.toggleVanishMode = async () => {
        if (activeChatType !== "dm" || !activeRoomId) return;
        const rc = activeRoomId, next = !isVanishActive;
        await db.ref(`chats/${rc}/vanish_mode`).set({ active: next, by: me.name, ts: Date.now() });
        if (!next) { await cleanupVanishMessages(rc, true); showToast("تم إيقاف الوضع المختفي ومسح رسائله 👻"); }
        else showToast("👻 تم تفعيل الوضع المختفي لكليكما");
    };
    async function cleanupVanishMessages(roomId, delAll) {
        if (!roomId || !me) return;
        try {
            const snap = await db.ref(`chats/${roomId}/messages`).once("value"), upd = {}; let c = 0;
            snap.forEach(ch => { const m = ch.val(); if (m?.vanish && (delAll || m.seen || m.sender !== me.username)) { upd[ch.key] = null; c++; } });
            if (c > 0) { await db.ref(`chats/${roomId}/messages`).update(upd); await db.ref(`chat_meta/${roomId}/lastMsg`).set("👻 اختفت رسائل الوضع المختفي").catch(() => {}); }
        } catch {}
    }
    function detachVanishMode(clean = false) { const rc = activeRoomId, was = isVanishActive; if (vanishRef) { vanishRef.off(); vanishRef = null; } applyVanishUI(false); if (clean && was && rc) cleanupVanishMessages(rc, false); }

    function getActiveNote(u) { const n = allNotesMap[u]; return (!n || (!n.text && !n.song) || (n.expiresAt && n.expiresAt <= Date.now())) ? null : n; }
    function renderNotesStrip() {
        const strip = document.getElementById("notesStrip"); if (!strip || !me) return;
        strip.innerHTML = "";
        const bHTML = n => !n ? `<div class="note-bubble empty-note">ملاحظة...</div>` : `<div class="note-bubble">${n.text ? `<div class="note-bubble-txt">${escapeHTML(n.text)}</div>` : ""}${(n.song?.title || n.music) ? `<div class="note-music-mini">🎵 <span>${escapeHTML(n.song?.title || n.music)}</span></div>` : ""}</div>`;
        const myNote = getActiveNote(me.username), myCnt = myNote?.likes ? Object.keys(myNote.likes).length : 0;
        const myItem = document.createElement("div"); myItem.className = "note-item"; myItem.onclick = () => window.openMyNoteCompose();
        const mySlot = document.createElement("div"); mySlot.className = "note-bubble-slot"; mySlot.innerHTML = bHTML(myNote);
        const myAvW = document.createElement("div"); myAvW.className = "note-av-wrap"; const myAv = document.createElement("div"); myAv.className = "avatar"; setAvatarStyle(myAv, me, false); myAvW.appendChild(myAv);
        if (myCnt > 0) { const rp = document.createElement("span"); rp.className = "note-react-pill"; rp.innerText = `❤️ ${myCnt}`; myAvW.appendChild(rp); }
        const myL = document.createElement("span"); myL.className = "note-name"; myL.innerText = "ملاحظتك";
        myItem.appendChild(mySlot); myItem.appendChild(myAvW); myItem.appendChild(myL); strip.appendChild(myItem);

        Object.values(contactProfiles).filter(u => u && u.username !== me.username && !u.banned && !myBlocked[u.username] && getActiveNote(u.username))
            .sort((a, b) => (getActiveNote(b.username).ts || 0) - (getActiveNote(a.username).ts || 0))
            .forEach(u => {
                const n = getActiveNote(u.username), myR = n.likes?.[me.username]?.em || "";
                const item = document.createElement("div"); item.className = "note-item"; item.onclick = () => window.openFriendNoteView(u.username);
                const sl = document.createElement("div"); sl.className = "note-bubble-slot"; sl.innerHTML = bHTML(n);
                const avW = document.createElement("div"); avW.className = "note-av-wrap"; const av = document.createElement("div"); av.className = "avatar"; setAvatarStyle(av, u, true); avW.appendChild(av);
                if (myR) { const rp = document.createElement("span"); rp.className = "note-react-pill"; rp.innerText = myR; avW.appendChild(rp); }
                const lb = document.createElement("span"); lb.className = "note-name"; lb.innerText = u.name;
                item.appendChild(sl); item.appendChild(avW); item.appendChild(lb); strip.appendChild(item);
            });
    }
    function renderNoteSongDraft() {
        const s = document.getElementById("noteSongDraftSlot"); if (!s) return;
        s.innerHTML = !draftNoteSong ? `<button type="button" class="btn btn-sm btn-outline" style="width:100%; border-style:dashed;" onclick="window.pickNoteSong()">🎵 اختيار أغنية للملاحظة (مع القصّ / MP3)</button>` : `<div class="song-card-inline" style="margin-top:0;"><img class="song-cover" src="${escapeHTML(draftNoteSong.cover || '')}" onerror="this.style.display='none'"><div class="song-meta"><strong>${escapeHTML(draftNoteSong.title)}</strong><span>${escapeHTML(draftNoteSong.artist || "")} ${songBadgeMeta(draftNoteSong) ? "• " + songBadgeMeta(draftNoteSong) : ""}</span></div><button type="button" class="pack-mini-btn danger" onclick="window.clearNoteSongDraft()">✕</button></div>`;
    }
    window.pickNoteSong = () => window.openMusicPicker("🎵 اختر أغنية لملاحظتك", s => { draftNoteSong = s; renderNoteSongDraft(); });
    window.clearNoteSongDraft = () => { draftNoteSong = null; renderNoteSongDraft(); };
    window.openMyNoteCompose = () => {
        if (!me) return;
        const cur = getActiveNote(me.username), inp = document.getElementById("noteTextInput");
        inp.value = cur ? (cur.text || "") : ""; draftNoteSong = cur?.song || null;
        document.getElementById("noteCharCnt").innerText = inp.value.length;
        document.getElementById("delMyNoteBtn").style.display = cur ? "inline-flex" : "none";
        renderNoteSongDraft();
        const likes = cur?.likes ? Object.values(cur.likes) : [];
        document.getElementById("myNoteLikesBox").innerHTML = likes.length ? `<div style="font-size:12px; color:var(--accent); font-weight:800; margin-bottom:6px;">تفاعلات أصدقائك (${likes.length}):</div>` + likes.map(l => `<div class="adm-row" style="padding:7px 10px; margin-bottom:5px;"><span style="font-size:13px; font-weight:700;">${escapeHTML(l.name)}</span><span style="font-size:18px;">${l.em || "❤️"}</span></div>`).join("") : "";
        document.getElementById("noteComposeModal").style.display = "flex"; setTimeout(() => inp.focus(), 80);
    };
    window.publishMyNote = async () => {
        if (!me) return; const text = document.getElementById("noteTextInput").value.trim().slice(0, 60);
        if (!text && !draftNoteSong) { showToast("اكتب ملاحظتك أو اختر أغنية"); return; }
        await db.ref(`notes/${me.username}`).set({ text, music: draftNoteSong ? `${draftNoteSong.title} - ${draftNoteSong.artist}` : "", song: draftNoteSong || null, ts: Date.now(), expiresAt: Date.now() + 86400000 });
        document.getElementById("noteComposeModal").style.display = "none"; playSendSound(); showToast("تم نشر ملاحظتك لمدة 24 ساعة ✨");
    };
    window.deleteMyNote = async () => { if (!me) return; await db.ref(`notes/${me.username}`).remove(); document.getElementById("noteComposeModal").style.display = "none"; showToast("تم الحذف"); };
    window.closeFriendNoteView = () => { PremAudio.stop("note"); document.getElementById("noteViewModal").style.display = "none"; };
    window.openFriendNoteView = (username, skipAuto = false) => {
        const u = contactProfiles[username], n = getActiveNote(username); if (!u || !n) return;
        viewingNoteUser = username;
        setAvatarStyle(document.getElementById("nvAvatar"), u, true);
        document.getElementById("nvName").innerHTML = `${renderStyledUserName(u)} ${getVerifiedBadgeHTML(u.verified)} ${getDevBadgeHTML(u)}`;
        document.getElementById("nvTime").innerText = "نُشرت الساعة " + formatTime(n.ts);
        document.getElementById("nvText").innerText = n.text || "🎵 يشاركك هذه الأغنية";
        const mWrap = document.getElementById("nvMusicWrap");
        if (n.song && (n.song.url || n.song.ytId)) {
            if (!skipAuto && n.song.url) PremAudio.play(n.song.url, "note", { loop: true, clipStart: n.song.playFull ? 0 : (n.song.startSec || 0), clipEnd: n.song.playFull ? 0 : (n.song.endSec || 0), playFull: n.song.playFull !== false });
            renderSongCardInto("nvMusicWrap", n.song, "note", false);
        } else if (n.music) mWrap.innerHTML = `<div style="display:inline-flex; margin-top:8px; padding:4px 12px; border-radius:99px; background:rgba(56,189,248,0.14); color:var(--accent); font-size:12px; font-weight:700;">🎵 ${escapeHTML(n.music)}</div>`;
        else mWrap.innerHTML = "";
        const myEm = n.likes?.[me.username]?.em || "";
        document.getElementById("nvReactsRow").innerHTML = ["❤️", "🔥", "😂", "😍", "🥺"].map(em => `<button type="button" class="note-qr-btn ${myEm === em ? 'mine' : ''}" onclick="window.reactToViewedNote('${em}')">${em}</button>`).join("");
        document.getElementById("nvReplyInput").value = ""; document.getElementById("noteViewModal").style.display = "flex";
    };
    window.reactToViewedNote = async em => {
        if (!viewingNoteUser || !me) return; const n = getActiveNote(viewingNoteUser); if (!n) return;
        if (n.likes?.[me.username]?.em === em) await db.ref(`notes/${viewingNoteUser}/likes/${me.username}`).remove();
        else { await db.ref(`notes/${viewingNoteUser}/likes/${me.username}`).set({ em, name: me.name, ts: Date.now() }); sendNotification(viewingNoteUser, `تفاعل ${me.name} بـ ${em} على ملاحظتك`, em); playSendSound(); }
        window.openFriendNoteView(viewingNoteUser, true);
    };
    window.replyToViewedNote = async () => {
        const inp = document.getElementById("nvReplyInput"), txt = (inp?.value || "").trim(); if (!txt || !viewingNoteUser || !me) return;
        const n = getActiveNote(viewingNoteUser), u = contactProfiles[viewingNoteUser] || { name: viewingNoteUser }, rId = getRoomId(me.username, viewingNoteUser), now = Date.now(), mId = "m_" + now + "_" + Math.random().toString(36).slice(2, 7);
        const enc = await e2eEncrypt(rId, txt), encPrev = await e2eEncrypt(rId, "رد على ملاحظتك: " + txt);
        await db.ref(`chats/${rId}/messages/${mId}`).set({
            id: mId, sender: me.username, senderName: me.name, type: "text",
            content: enc.e2e ? "" : txt, e2e: enc.e2e, encContent: enc.e2e ? enc.data : "", seen: false, ts: now,
            replyTo: { sender: viewingNoteUser, senderName: u.name, preview: "💭 ملاحظة: " + (n?.text || n?.song?.title || "") }
        });
        await db.ref(`user_contacts/${viewingNoteUser}/${me.username}`).update({ addedAt: now });
        await db.ref(`chat_meta/${rId}`).set({ lastMsg: encPrev.e2e ? "🔒 رسالة مشفّرة" : ("رد على ملاحظتك: " + txt), lastMsgEnc: encPrev.e2e ? encPrev.data : "", lastSender: me.username, lastTs: now, unreadFor: viewingNoteUser });
        bumpDmStreak(rId); sendNotification(viewingNoteUser, `ردّ ${me.name} على ملاحظتك: "${txt.slice(0, 30)}"`, "💭");
        inp.value = ""; window.closeFriendNoteView(); playSendSound(); showToast("تم إرسال ردك للخاص ✅");
    };

    // موسيقى الستوري المطوّرة (مع القصّ والتشغيل للنهاية ويوتيوب)
    function renderStorySongDraft() {
        const s = document.getElementById("storyMusicDraftSlot"); if (!s) return;
        s.innerHTML = !draftStorySong
            ? `<button type="button" class="btn btn-sm btn-outline" style="width:100%; border-style:dashed;" onclick="window.pickStorySong()">🎵 إضافة أغنية للستوري (قصّ المدة أو للنهاية)</button>`
            : `<div class="song-card-inline" style="margin-top:0;"><img class="song-cover" src="${escapeHTML(draftStorySong.cover || '')}" onerror="this.style.display='none'"><div class="song-meta"><strong>${escapeHTML(draftStorySong.title)}</strong><span>${escapeHTML(draftStorySong.artist || "")} • ${songBadgeMeta(draftStorySong)}</span></div><button type="button" class="pack-mini-btn danger" onclick="window.clearStorySongDraft()">✕</button></div>`;
    }
    window.pickStorySong = () => window.openMusicPicker("🎵 اختر أغنية لقصتك", s => { draftStorySong = s; renderStorySongDraft(); });
    window.clearStorySongDraft = () => { draftStorySong = null; renderStorySongDraft(); };
    window.toggleStoryMusicMute = e => {
        if (e) e.stopPropagation();
        const btn = document.getElementById("svMuteBtn");
        if (PremAudio.context === "story" && PremAudio.el.paused && PremAudio.currentUrl) {
            storyMusicMuted = false; PremAudio.el.muted = false; PremAudio.el.volume = 1.0;
            PremAudio.el.play().then(() => { if (btn) btn.innerText = "🔊"; }).catch(() => {}); return;
        }
        storyMusicMuted = !storyMusicMuted;
        if (PremAudio.context === "story") { PremAudio.el.muted = storyMusicMuted; if (!storyMusicMuted && PremAudio.el.paused) PremAudio.el.play().catch(() => {}); }
        if (btn) btn.innerText = storyMusicMuted ? "🔇" : "🔊";
    };

    // ==================== 9. التأثيرات، التخصيص (مع إطارات الصور)، الخلفية وحزم الملصقات ====================
    window.playScreenEffect = function (fxKey) {
        const fx = MSG_EFFECTS[fxKey], stage = document.getElementById("fxStage"); if (!fx || !stage) return;
        const fromTop = fxKey === "snow" || fxKey === "confetti", frag = document.createDocumentFragment(), nodes = [];
        for (let i = 0; i < 18; i++) {
            const p = document.createElement("span"); p.className = "fx-p"; p.innerText = fx.items[i % fx.items.length];
            p.style.left = (8 + Math.random() * 84) + "vw"; p.style.top = (fromTop ? (-6 - Math.random() * 14) : (78 + Math.random() * 18)) + "vh";
            p.style.fontSize = (22 + Math.random() * 15) + "px"; p.style.animationDelay = (Math.random() * 0.32) + "s";
            p.style.setProperty("--dx", ((Math.random() - 0.5) * 140).toFixed(0) + "px");
            p.style.setProperty("--dy", (fromTop ? (window.innerHeight * 0.92) : -(window.innerHeight * (0.55 + Math.random() * 0.35))).toFixed(0) + "px");
            p.style.setProperty("--rot", ((Math.random() - 0.5) * 90).toFixed(0) + "deg");
            p.style.setProperty("--dur", (1.6 + Math.random() * 0.9).toFixed(2) + "s");
            frag.appendChild(p); nodes.push(p);
        }
        stage.appendChild(frag); setTimeout(() => nodes.forEach(n => n.remove()), 2900);
    };

    window.toggleEffectPicker = force => { if (typeof toggleChatExtras === "function") toggleChatExtras(force); };
    window.selectMsgEffect = fxKey => {
        selectedMsgEffect = fxKey || "";
        document.querySelectorAll("#effectPickerRow .fx-opt-btn").forEach(b => b.classList.toggle("active", b.getAttribute("data-fx") === selectedMsgEffect));
        const btn = document.getElementById("fxToggleBtn");
        if (btn) { btn.innerText = selectedMsgEffect ? MSG_EFFECTS[selectedMsgEffect].icon : (scratchModeActive ? "🪄" : "✨"); btn.classList.toggle("accent", !!selectedMsgEffect || scratchModeActive); }
        if (selectedMsgEffect) { window.playScreenEffect(selectedMsgEffect); if (typeof toggleChatExtras === "function") toggleChatExtras(false); showToast(`تأثير ${MSG_EFFECTS[selectedMsgEffect].label} جاهز ✨`); }
    };

    window.openPremiumModal = () => {
        if (!me) return;
        const st = me.statusEmoji || "", col = me.accentColor || "default", fr = me.avatarFrame || "";
        document.getElementById("premFrameGrid").innerHTML = AVATAR_FRAMES.map(f => `<div class="prem-color-dot ${fr === f.id ? 'active' : ''}" style="background:${f.css}" onclick="window.setMyAvatarFrame('${f.id}')">${f.label}</div>`).join("");
        document.getElementById("premStatusGrid").innerHTML = STATUS_EMOJIS.map(em => `<button type="button" class="status-em-btn ${st === em ? 'active' : ''}" onclick="window.setMyStatusEmoji('${em}')">${em || "✕"}</button>`).join("");
        document.getElementById("premColorGrid").innerHTML = Object.entries(ACCENT_PALETTES).map(([k, p]) => `<div class="prem-color-dot ${col === k ? 'active' : ''}" style="background:${p.grad}" onclick="window.setMyAccentColor('${k}')">${p.label}</div>`).join("");
        document.getElementById("premiumModal").style.display = "flex";
    };
    window.setMyAvatarFrame = async fr => { if (!me) return; await db.ref(`users/${me.username}/avatarFrame`).set(fr || ""); me.avatarFrame = fr || ""; window.openPremiumModal(); renderMyProfilePage(); showToast(fr ? "تم تفعيل إطار الصورة الفخم ✨" : "تمت إزالة الإطار"); };
    window.setMyStatusEmoji = async em => { if (!me) return; await db.ref(`users/${me.username}/statusEmoji`).set(em); me.statusEmoji = em; window.openPremiumModal(); showToast(em ? `تم تعيين رمز الحالة ${em}` : "تمت الإزالة"); };
    window.setMyAccentColor = async k => { if (!me || !ACCENT_PALETTES[k]) return; await db.ref(`users/${me.username}/accentColor`).set(k); me.accentColor = k; window.openPremiumModal(); renderMyProfilePage(); showToast(`تم تحديث لونك إلى ${ACCENT_PALETTES[k].label} 🎨`); };
    window.handleAnimAvatarUpload = e => {
        const f = e.target.files[0]; e.target.value = ""; if (!f || !me) return;
        if (f.size > 1.85 * 1024 * 1024) { showToast("الحد الأقصى 1.8 ميجابايت"); return; }
        showToast("جاري رفع الصورة المتحركة...");
        const r = new FileReader();
        r.onload = async ev => {
            if (f.type === "image/gif") await db.ref(`users/${me.username}`).update({ avatarImg: ev.target.result, avatarVideo: "" });
            else await db.ref(`users/${me.username}`).update({ avatarVideo: ev.target.result });
            showToast("تم التفعيل 🎬✨");
        };
        r.readAsDataURL(f);
    };
    window.removeAnimAvatar = async () => { if (!me) return; await db.ref(`users/${me.username}/avatarVideo`).set(""); showToast("تمت إزالة الفيديو"); };

    function applySharedWpToArea(wpVal) {
        const area = document.getElementById("messagesList"); if (!area) return;
        if (!wpVal) { applyWallpaper(localStorage.getItem("app_wp") || "pattern", true); return; }
        if (wpVal.startsWith("data:image")) { area.style.backgroundImage = `linear-gradient(rgba(4,8,18,0.52), rgba(4,8,18,0.56)), url(${toBlobUrl(wpVal)})`; area.style.backgroundSize = "cover"; area.style.backgroundPosition = "center"; }
        else { area.style.backgroundImage = wpVal; area.style.backgroundSize = "cover"; }
    }
    window.openSharedWpModal = () => { if (activeChatType !== "dm" || !activeRoomId) return; document.getElementById("sharedWpGrid").innerHTML = SHARED_WP_PRESETS.map(p => `<div class="swp-tile" style="background:${p.css || 'var(--bg-card)'}" onclick="window.setSharedWallpaper('${p.css}')">${p.label}</div>`).join(""); document.getElementById("sharedWpModal").style.display = "flex"; };
    window.setSharedWallpaper = async v => { if (activeChatType !== "dm" || !activeRoomId) return; await db.ref(`chats/${activeRoomId}/shared_wp`).set({ value: v || "", by: me.name, ts: Date.now() }); document.getElementById("sharedWpModal").style.display = "none"; showToast(v ? "تم تغيير الخلفية لكليكما 🎨✨" : "تمت الاستعادة"); };
    window.handleSharedWpUpload = async e => { const f = e.target.files[0]; e.target.value = ""; if (!f) return; showToast("جاري التطبيق..."); await window.setSharedWallpaper(await compressImageFile(f, 880, 0.70)); };
    function detachSharedWp() { if (sharedWpRef) { sharedWpRef.off(); sharedWpRef = null; } }

    // حزم الملصقات
    async function fetchPackOnce(pid, force = false) {
        if (!pid) return null; if (!force && allStickerPacks[pid]) return allStickerPacks[pid]; if (loadingPacksSet.has(pid)) return allStickerPacks[pid] || null;
        loadingPacksSet.add(pid);
        try { const s = await db.ref(`tg_packs/${pid}`).once("value"); if (s.exists()) allStickerPacks[pid] = s.val(); else delete allStickerPacks[pid]; return allStickerPacks[pid] || null; }
        catch { return null; } finally { loadingPacksSet.delete(pid); }
    }
    async function ensureMyPacksLoaded() {
        const ids = Object.keys(mySavedPacks || {}).filter(p => mySavedPacks[p]), miss = ids.filter(p => !allStickerPacks[p]);
        if (miss.length) await Promise.all(miss.map(p => fetchPackOnce(p)));
        const valid = ids.filter(p => allStickerPacks[p]);
        if (!activeSelectedPackId || !valid.includes(activeSelectedPackId)) { activeSelectedPackId = valid[0] || ""; activePackVisibleCount = 12; }
        return valid;
    }
    window.selectStickerPackTab = p => { activeSelectedPackId = p; activePackVisibleCount = 12; const b = document.getElementById("drawerBody"); if (b) renderPremiumDrawerTab(b); };
    window.showMorePackStickers = () => { activePackVisibleCount += 12; const b = document.getElementById("drawerBody"); if (b) renderPremiumDrawerTab(b); };
    window.createNewStickerPack = async () => {
        if (!me) return; const n = prompt("اكتب اسم حزمة الملصقات الجديدة:", "ملصقات " + me.name); if (!n?.trim()) return;
        const pid = "pk_" + me.username + "_" + Date.now(), obj = { id: pid, name: n.trim(), owner: me.username, ownerName: me.name, ts: Date.now(), stickers: {} };
        await db.ref(`tg_packs/${pid}`).set(obj); await db.ref(`user_sticker_packs/${me.username}/${pid}`).set(true);
        allStickerPacks[pid] = obj; activeSelectedPackId = pid; activePackVisibleCount = 12; uploadTargetPackId = pid;
        showToast(`تم إنشاء حزمة «${n.trim()}» ✨`); document.getElementById("tgStickerUploadInput").click();
    };
    window.triggerAddStickerToPack = p => { uploadTargetPackId = p; document.getElementById("tgStickerUploadInput").click(); };
    window.handleUploadStickersToPack = async e => {
        const files = Array.from(e.target.files || []); e.target.value = ""; if (!files.length || !me) return;
        let pid = uploadTargetPackId;
        if (!pid || !allStickerPacks[pid]) {
            const owned = Object.values(allStickerPacks).find(p => p?.owner === me.username);
            if (owned) pid = owned.id;
            else { pid = "pk_" + me.username + "_" + Date.now(); const o = { id: pid, name: "حزمة " + me.name, owner: me.username, ownerName: me.name, ts: Date.now(), stickers: {} }; await db.ref(`tg_packs/${pid}`).set(o); await db.ref(`user_sticker_packs/${me.username}/${pid}`).set(true); allStickerPacks[pid] = o; }
        }
        let up = 0; showToast(`جاري رفع ${files.length} ملصق...`);
        for (const f of files.slice(0, 12)) {
            if (f.size > 1.85 * 1024 * 1024) continue;
            const isV = f.type.startsWith("video/"), isA = f.type === "image/gif" || f.type === "image/webp";
            const dUrl = (isV || isA) ? await new Promise((res, rej) => { const r = new FileReader(); r.onload = ev => res(ev.target.result); r.onerror = rej; r.readAsDataURL(f); }) : await compressImageFile(f, 340, 0.78);
            const stId = "st_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6), stObj = { id: stId, mediaType: isV ? "video" : "image", src: dUrl, ts: Date.now() };
            await db.ref(`tg_packs/${pid}/stickers/${stId}`).set(stObj);
            if (!allStickerPacks[pid].stickers) allStickerPacks[pid].stickers = {};
            allStickerPacks[pid].stickers[stId] = stObj; up++;
        }
        if (up) { activeSelectedPackId = pid; showToast(`تمت إضافة ${up} ملصق ✅`); const b = document.getElementById("drawerBody"); if (b && activeDrawerTab === "premium" && document.getElementById("stickerDrawer").style.display === "flex") renderPremiumDrawerTab(b); }
    };
    window.sendPremBigSticker = id => { const ps = PREM_BIG_STICKERS.find(x => x.id === id); if (!ps) return; pushMessageSafe("prem_sticker", ps.id, `${ps.em} ${ps.cap}`, { effect: ps.fx }); window.playScreenEffect(ps.fx); toggleStickerDrawer(false); };
    window.sendPackSticker = (p, s) => { const pk = allStickerPacks[p], st = pk?.stickers?.[s]; if (!st) return; pushMessageSafe("tg_sticker", st.src, `🎭 ملصق (${pk.name})`, { mediaType: st.mediaType || "image", packId: pk.id, packName: pk.name }); toggleStickerDrawer(false); };
    window.deleteStickerFromPack = async (p, s) => { if (!confirm("حذف الملصق؟")) return; await db.ref(`tg_packs/${p}/stickers/${s}`).remove(); if (allStickerPacks[p]?.stickers) delete allStickerPacks[p].stickers[s]; const b = document.getElementById("drawerBody"); if (b && activeDrawerTab === "premium") renderPremiumDrawerTab(b); };
    window.removePackFromMyList = async p => { const pk = allStickerPacks[p]; if (pk?.owner === me.username) { if (!confirm(`حذف «${pk.name}»؟`)) return; await db.ref(`tg_packs/${p}`).remove(); delete allStickerPacks[p]; } await db.ref(`user_sticker_packs/${me.username}/${p}`).remove(); if (activeSelectedPackId === p) activeSelectedPackId = ""; window.closeStickerPackPreview(); showToast("تمت الإزالة"); };
    window.addPackToMyList = async p => { if (!me || !p) return; await db.ref(`user_sticker_packs/${me.username}/${p}`).set(true); activeSelectedPackId = p; window.closeStickerPackPreview(); showToast(`تمت إضافة «${allStickerPacks[p]?.name || "الحزمة"}» ✅🎭`); };
    window.closeStickerPackPreview = () => { const g = document.getElementById("sppGrid"); if (g) { stopAndReleaseVideos(g); g.innerHTML = ""; } const m = document.getElementById("stickerPackPreviewModal"); if (m) m.style.display = "none"; };
    window.openStickerPackPreview = async (pid, fSrc, fMed) => {
        const m = document.getElementById("stickerPackPreviewModal"), g = document.getElementById("sppGrid"), act = document.getElementById("sppActionRow");
        if (pid && !allStickerPacks[pid]) { document.getElementById("sppTitle").innerText = "⏳ جاري فتح الحزمة..."; document.getElementById("sppMeta").innerText = ""; g.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:24px; color:var(--text-dim);">جاري التحميل...</div>`; act.innerHTML = `<button class="btn btn-sm btn-outline" style="width:100%;" onclick="window.closeStickerPackPreview()">إغلاق</button>`; m.style.display = "flex"; await fetchPackOnce(pid, true); }
        const pk = pid ? allStickerPacks[pid] : null;
        if (!pk) { window.closeStickerPackPreview(); if (fSrc && fMed !== "video") openLightbox(toBlobUrl(fSrc)); return; }
        const list = Object.values(pk.stickers || {}), hasIt = !!mySavedPacks[pk.id], isOwner = pk.owner === me.username;
        document.getElementById("sppTitle").innerText = `🎭 ${pk.name}`; document.getElementById("sppMeta").innerText = `${list.length} ملصق • بواسطة ${pk.ownerName || pk.owner}`;
        stopAndReleaseVideos(g);
        g.innerHTML = list.length ? list.slice(0, 24).map(st => { const u = toBlobUrl(st.src); return `<div class="sticker-tile tg-tile" style="position:relative;" onclick="if('${hasIt}'==='true'){ window.sendPackSticker('${escapeHTML(pk.id)}','${escapeHTML(st.id)}'); window.closeStickerPackPreview(); }">${st.mediaType === "video" ? `<video class="tg-lazy-vid" data-vsrc="${u}" preload="metadata" loop muted playsinline></video><span class="tg-vid-dot">🎬</span>` : `<img src="${u}" loading="lazy" decoding="async">`}</div>`; }).join("") : `<div style="grid-column:1/-1; text-align:center; padding:24px; color:var(--text-dim);">الحزمة فارغة</div>`;
        attachLazyVideos(g);
        act.innerHTML = hasIt ? `${isOwner ? `<button class="btn btn-sm" style="flex:1;" onclick="window.closeStickerPackPreview(); window.triggerAddStickerToPack('${escapeHTML(pk.id)}')">➕ إضافة</button>` : `<button class="btn btn-sm btn-success" style="flex:1;" disabled>✓ مضافة لديك</button>`}<button class="btn btn-sm btn-danger" onclick="window.removePackFromMyList('${escapeHTML(pk.id)}')">${isOwner ? 'حذف' : 'إزالة'}</button><button class="btn btn-sm btn-outline" onclick="window.closeStickerPackPreview()">إغلاق</button>` : `<button class="btn" style="flex:1;" onclick="window.addPackToMyList('${escapeHTML(pk.id)}')">➕ إضافة الحزمة لملصقاتي (${list.length})</button><button class="btn btn-outline btn-sm" onclick="window.closeStickerPackPreview()">إغلاق</button>`;
        m.style.display = "flex";
    };

    async function renderPremiumDrawerTab(body) {
        stopAndReleaseVideos(body);
        const saved = Object.keys(mySavedPacks || {}).filter(p => mySavedPacks[p]);
        if (saved.some(p => !allStickerPacks[p])) { body.innerHTML = `<div style="text-align:center; padding:34px; color:var(--text-dim);">⏳ جاري التجهيز...</div>`; await ensureMyPacksLoaded(); if (activeDrawerTab !== "premium" || document.getElementById("stickerDrawer").style.display !== "flex") return; }
        else await ensureMyPacksLoaded();
        const myP = saved.filter(p => allStickerPacks[p]);
        let html = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;"><span class="st-sec-title" style="margin:0;">🎭 حزم ملصقاتي (${myP.length})</span><button type="button" class="pack-mini-btn" onclick="window.createNewStickerPack()">➕ حزمة جديدة</button></div>`;
        if (!myP.length) html += `<div style="background:var(--glass-inner); border:1px dashed var(--border-bright); border-radius:14px; padding:12px; text-align:center; font-size:12px; color:var(--text-dim); margin-bottom:12px;">ما عندك حزم بعد — اضغط <b>«➕ حزمة جديدة»</b> أو اضغط على أي ملصق يدزه صديقك!</div>`;
        else {
            html += `<div class="pack-tabs-bar">${myP.map(pid => `<button type="button" class="pack-tab-pill ${pid === activeSelectedPackId ? 'active' : ''}" onclick="window.selectStickerPackTab('${escapeHTML(pid)}')">📦 ${escapeHTML(allStickerPacks[pid].name)} (${Object.keys(allStickerPacks[pid].stickers || {}).length})</button>`).join("")}</div>`;
            const pk = allStickerPacks[activeSelectedPackId] || allStickerPacks[myP[0]];
            if (pk) {
                const isO = pk.owner === me.username, ents = Object.entries(pk.stickers || {});
                html += `<div class="pack-head-row"><span class="pack-head-title">${escapeHTML(pk.name)} (${ents.length})</span><div class="pack-head-acts">${isO ? `<button type="button" class="pack-mini-btn" onclick="window.triggerAddStickerToPack('${escapeHTML(pk.id)}')">＋ إضافة</button>` : ""}<button type="button" class="pack-mini-btn danger" onclick="window.removePackFromMyList('${escapeHTML(pk.id)}')">${isO ? 'حذف' : 'إزالة'}</button></div></div><div class="sticker-grid">`;
                if (!ents.length) html += `<div class="sticker-tile sticker-create-tile" onclick="window.triggerAddStickerToPack('${escapeHTML(pk.id)}')"><span>＋</span><span>رفع ملصق</span></div>`;
                else ents.slice(0, activePackVisibleCount).forEach(([sid, st]) => { if (!st?.src) return; const u = toBlobUrl(st.src); html += `<div class="sticker-tile tg-tile" style="position:relative;" onclick="window.sendPackSticker('${escapeHTML(pk.id)}','${escapeHTML(sid)}')">${st.mediaType === "video" ? `<video class="tg-lazy-vid" data-vsrc="${u}" preload="metadata" loop muted playsinline></video><span class="tg-vid-dot">🎬</span>` : `<img src="${u}" loading="lazy" decoding="async">`}${isO ? `<button type="button" onclick="event.stopPropagation(); window.deleteStickerFromPack('${escapeHTML(pk.id)}','${escapeHTML(sid)}')" style="position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:50%; border:none; background:rgba(0,0,0,0.72); color:#fff; font-size:10px; cursor:pointer;">✕</button>` : ""}</div>`; });
                html += `</div>`;
                if (ents.length > activePackVisibleCount) html += `<button type="button" class="btn btn-sm btn-outline" style="width:100%; margin-bottom:12px;" onclick="window.showMorePackStickers()">عرض المزيد (+${ents.length - activePackVisibleCount})</button>`;
            }
        }
        html += `<div class="st-sec-title">✨ رموز تعبيرية متحركة</div><div class="emoji-grid" style="margin-bottom:10px;">${ANIM_EMOJIS.map(a => `<button type="button" class="emoji-cell" onclick="insertEmojiToInput('[[${a.em}]]')"><span class="anim-em ${a.anim}">${a.em}</span></button>`).join("")}</div>`;
        html += `<div class="st-sec-title">🌟 ملصقات مميزة بتأثيرات</div><div class="sticker-grid">${PREM_BIG_STICKERS.map(ps => `<div class="sticker-tile" style="background:${ps.bg}; border-color:rgba(255,255,255,0.2);" onclick="window.sendPremBigSticker('${ps.id}')"><span class="st-em">${ps.em}</span><span class="st-cap" style="color:#fff;">${escapeHTML(ps.cap)}</span></div>`).join("")}</div>`;
        body.innerHTML = html; attachLazyVideos(body);
    }

    PremAudio.onStateChange = (playing, ctx) => {
        if (ctx === "listen" && currentListenData) renderListenTogetherBar(currentListenData, false);
        if (ctx === "profile_me" && me?.profileSong) renderSongCardInto("myProfileSongSlot", me.profileSong, "profile_me", true);
        if (ctx === "profile_other") { const b = document.getElementById("otherProfileSongSlot"); if (b?._songObj) renderSongCardInto("otherProfileSongSlot", b._songObj, "profile_other", false); }
        if (ctx === "note") { const b = document.getElementById("nvMusicWrap"); if (b?._songObj) renderSongCardInto("nvMusicWrap", b._songObj, "note", false); }
        if (ctx === "preview" && pendingTrimSong) renderTrimStageUI();
    };

    // ==================== 10. ربط كل المميزات مع محرّك V11 ====================
    function installHooks() {
        const _origRenderStories = window.renderStoriesStrip;
        window.renderStoriesStrip = function () { if (_origRenderStories) _origRenderStories(); renderNotesStrip(); };

        const _origRenderSidebarNow = window.renderChatsSidebarNow;
        window.renderChatsSidebarNow = function () {
            if (_origRenderSidebarNow) _origRenderSidebarNow();
            if (!me) return;
            const list = document.getElementById("chatsListEl"); if (!list) return;
            list.querySelectorAll(".chat-row[data-dm-user]").forEach(row => {
                const st = getActiveStreakInfo(getRoomId(me.username, row.getAttribute("data-dm-user"))); if (!st) return;
                const nm = row.querySelector(".chat-row-name");
                if (nm && !nm.querySelector(".streak-pill")) { const sp = document.createElement("span"); sp.className = "streak-pill" + (st.warn ? " warn" : ""); sp.innerText = `🔥 ${st.count}`; nm.appendChild(sp); }
            });
        };

        const _origUpdateHeader = window.updateActiveHeader;
        window.updateActiveHeader = function () {
            if (_origUpdateHeader) _origUpdateHeader();
            if (activeChatType === "dm" && activeRoomId) {
                const st = getActiveStreakInfo(activeRoomId), nm = document.getElementById("chatPartnerName");
                if (st && nm && !nm.querySelector(".streak-pill")) { const sp = document.createElement("span"); sp.className = "streak-pill" + (st.warn ? " warn" : ""); sp.innerText = `🔥 ${st.count}`; nm.appendChild(sp); }
            }
        };

        const _origDevBadge = window.getDevBadgeHTML;
        window.getDevBadgeHTML = u => (_origDevBadge ? _origDevBadge(u) : "") + (u?.statusEmoji ? `<span class="status-em" title="الحالة">${escapeHTML(u.statusEmoji)}</span>` : "");

        const _origSetAvatar = window.setAvatarStyle;
        window.setAvatarStyle = function (el, obj, showOnline = true) {
            if (el && obj && obj.avatarVideo) {
                el.classList.remove("av-frame-gold", "av-frame-neon", "av-frame-galaxy", "av-frame-rose");
                if (obj.avatarFrame && ["gold", "neon", "galaxy", "rose"].includes(obj.avatarFrame)) el.classList.add("av-frame-" + obj.avatarFrame);
                const sig = String(obj.avatarVideo).slice(-28);
                if (el.getAttribute("data-avid") !== sig) {
                    el.setAttribute("data-avid", sig); el.style.backgroundImage = "none";
                    el.innerHTML = `<div class="av-vid-mask"><video src="${toBlobUrl(obj.avatarVideo)}" autoplay loop muted playsinline></video></div>` + (showOnline ? `<span class="online-badge ${obj.online ? 'on' : ''}"></span>` : "");
                } else if (showOnline) { const d = el.querySelector(".online-badge"); if (d) d.classList.toggle("on", !!obj.online); }
                return;
            }
            if (el) el.removeAttribute("data-avid");
            if (_origSetAvatar) _origSetAvatar(el, obj, showOnline);
        };

        const _origFormatRich = window.formatRichText;
        window.formatRichText = raw => (_origFormatRich ? _origFormatRich(raw) : escapeHTML(raw)).replace(/\[\[([^\[\]]{1,8})\]\]/g, (_, em) => `<span class="anim-em ${(ANIM_EMOJIS.find(a => a.em === em)?.anim) || 'beat'}">${em}</span>`);

        const _origPush = window.pushMessageSafe;
        window.pushMessageSafe = async function (type, content, previewLabel, extra = {}) {
            let eff = extra.effect || selectedMsgEffect;
            if (!eff && type === "text" && !extra.isAi) {
                const hit = SMART_FX_RULES.find(r => r.re.test(String(content || "")));
                if (hit) eff = hit.fx;
            }
            if (eff) {
                extra = { ...extra, effect: eff };
                selectedMsgEffect = "";
                document.querySelectorAll("#effectPickerRow .fx-opt-btn").forEach(b => b.classList.toggle("active", b.getAttribute("data-fx") === ""));
                window.playScreenEffect(eff);
            }
            if (scratchModeActive && type === "text" && !extra.isAi) {
                extra = { ...extra, scratch: true }; previewLabel = "🪄 رسالة مخفية (امسح لتكشفها)"; scratchModeActive = false;
                const sBtn = document.getElementById("scratchModeBtn"); if (sBtn) sBtn.classList.remove("active");
            }
            const fxBtn = document.getElementById("fxToggleBtn");
            if (fxBtn && !selectedMsgEffect && !scratchModeActive) { fxBtn.innerText = "✨"; fxBtn.classList.remove("accent"); }
            if (activeChatType === "dm" && isVanishActive && !extra.isAi) { extra = { ...extra, vanish: true }; previewLabel = "👻 رسالة مختفية"; }
            const dmRoom = activeChatType === "dm" ? activeRoomId : null;
            const res = await _origPush(type, content, previewLabel, extra);
            if (dmRoom && !extra.isAi) bumpDmStreak(dmRoom);
            return res;
        };

        const _origBuildMsg = window.buildMessageNode;
        window.buildMessageNode = function (id, m) {
            const wrap = _origBuildMsg(id, m), bubble = wrap.querySelector(".msg-bubble"), slot = wrap.querySelector(".msg-content-slot");
            if (m.vanish) {
                wrap.classList.add("vanish-msg");
                const foot = wrap.querySelector(".msg-footer");
                if (foot) { const vt = document.createElement("span"); vt.className = "vanish-tag"; vt.innerText = "👻"; foot.insertBefore(vt, foot.firstChild); }
            }
            if (m.type === "text" && m.scratch && slot) {
                const box = document.createElement("div"); box.className = "scratch-box"; slot.innerHTML = ""; slot.appendChild(box); mountScratchCanvas(box, formatRichText(m.content));
            } else if (m.type === "capsule" && slot) {
                const unlockAt = m.unlockAt || 0, left = unlockAt - Date.now(), card = document.createElement("div");
                card.className = "capsule-card" + (left <= 0 ? " unlocked" : ""); card.setAttribute("data-unlock", String(unlockAt));
                card.innerHTML = `<div style="font-size:12px; font-weight:800; color:#e9d5ff;">⏳ ${escapeHTML(m.capTitle || "كبسولة زمن")}</div><div class="capsule-timer">${formatCountdown(left)}</div><div class="capsule-sub">${left <= 0 ? "اضغط الآن لفتح كبسولة الزمن ✨" : "مقفولة حتى انتهاء العدّاد 🔒"}</div>`;
                card.onclick = e => {
                    e.stopPropagation();
                    if (Date.now() < unlockAt) { card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake"); triggerHaptic(20); showToast(`🔒 مقفولة! المتبقي: ${formatCountdown(unlockAt - Date.now())}`); return; }
                    card.setAttribute("data-opened", "1"); card.classList.add("unlocked");
                    card.innerHTML = `<div style="font-size:11.5px; color:#6ee7b7; font-weight:800; margin-bottom:5px;">🔓 ${escapeHTML(m.capTitle || "كبسولة الزمن")}</div><div class="msg-text" style="text-align:right;">${formatRichText(m.content)}</div>`;
                    window.playScreenEffect("confetti"); triggerHaptic([20, 40, 30]);
                };
                slot.innerHTML = ""; slot.appendChild(card);
            } else if (m.type === "prem_sticker" && slot) {
                const ps = PREM_BIG_STICKERS.find(x => x.id === m.content) || PREM_BIG_STICKERS[0];
                if (bubble) bubble.classList.add("sticker-bubble");
                slot.innerHTML = `<div class="prem-big-sticker" style="background:${ps.bg}" onclick="event.stopPropagation(); window.playScreenEffect('${ps.fx}')"><span class="pbs-spark">✨</span><span class="pbs-em">${ps.em}</span><span class="pbs-cap">${escapeHTML(ps.cap)}</span></div>`;
            } else if (m.type === "tg_sticker" && slot) {
                if (bubble) bubble.classList.add("sticker-bubble");
                const url = toBlobUrl(m.content), stWrap = document.createElement("div"); stWrap.className = "tg-st-wrap";
                stWrap.innerHTML = m.mediaType === "video" ? `<video class="tg-st-media tg-lazy-vid" data-vsrc="${url}" preload="metadata" loop muted playsinline></video>` : `<img class="tg-st-media" src="${url}" loading="lazy" decoding="async">`;
                if (m.packId) { const h = document.createElement("span"); h.className = "tg-st-hint"; h.innerText = "📦 الحزمة"; stWrap.appendChild(h); }
                stWrap.onclick = e => { e.stopPropagation(); window.openStickerPackPreview(m.packId || "", m.content, m.mediaType || "image"); };
                slot.innerHTML = ""; slot.appendChild(stWrap); attachLazyVideos(stWrap);
            }

            const senderObj = contactProfiles[m.sender] || (m.sender === me?.username ? me : null);
            if (senderObj?.accentColor && ACCENT_PALETTES[senderObj.accentColor]) {
                const lbl = wrap.querySelector(".msg-sender-lbl"); if (lbl && activeChatType === "group") lbl.style.color = ACCENT_PALETTES[senderObj.accentColor].main;
            }
            if (m.replyTo?.sender) {
                const rUser = contactProfiles[m.replyTo.sender] || (m.replyTo.sender === me?.username ? me : null);
                const pal = rUser?.accentColor && ACCENT_PALETTES[rUser.accentColor], rq = wrap.querySelector(".reply-quote");
                if (rq && pal) { rq.style.borderRightColor = pal.main; const stEl = rq.querySelector("strong"); if (stEl) stEl.style.color = pal.main; }
            }
            if (m.effect && MSG_EFFECTS[m.effect]) {
                const fx = MSG_EFFECTS[m.effect], foot = wrap.querySelector(".msg-footer");
                if (foot) {
                    const pill = document.createElement("button"); pill.className = "fx-msg-pill"; pill.innerHTML = `✨ ${fx.icon}`;
                    pill.onclick = e => { e.stopPropagation(); window.playScreenEffect(m.effect); };
                    foot.insertBefore(pill, foot.firstChild);
                }
                if (!m._pending && m.ts && (Date.now() - m.ts < 8000) && !playedFxIds.has(id)) { playedFxIds.add(id); setTimeout(() => window.playScreenEffect(m.effect), 120); }
            }
            return wrap;
        };

        // موسيقى الستوري (تدعم القصّ + التشغيل للنهاية + يوتيوب)
        const _origOpenCreateStory = window.openCreateStoryModal;
        window.openCreateStoryModal = () => { draftStorySong = null; if (_origOpenCreateStory) _origOpenCreateStory(); renderStorySongDraft(); };
        const _origSwitchStoryType = window.switchStoryType;
        window.switchStoryType = t => { if (_origSwitchStoryType) _origSwitchStoryType(t); const sl = document.getElementById("storyMusicDraftSlot"); if (sl) sl.style.display = t === "video" ? "none" : "block"; };
        const _origRenderSlide = window.renderCurrentStorySlide;
        window.renderCurrentStorySlide = function () {
            PremAudio.stop("story");
            if (_origRenderSlide) _origRenderSlide();
            try {
                if (typeof svList === "undefined" || !svList || svIndex >= svList.length) return;
                const item = svList[svIndex], live = (!svIsHighlight && allStories[svOwner]?.[item.id]) ? allStories[svOwner][item.id] : item;
                if (live && live.type !== "video" && live.music && (live.music.url || live.music.ytId)) {
                    const m = live.music, stage = document.getElementById("svStage");
                    if (stage) {
                        const pill = document.createElement("div"); pill.className = "sv-music-pill"; pill.onclick = e => window.toggleStoryMusicMute(e);
                        pill.innerHTML = `<img class="song-cover round spin" src="${escapeHTML(m.cover || '')}" onerror="this.style.display='none'"><div class="svm-txt"><b>${escapeHTML(m.title)}</b><span>${escapeHTML(m.artist || "")} ${songBadgeMeta(m) ? "• " + songBadgeMeta(m) : ""}</span></div>${m.url ? `<button type="button" class="sv-mute-btn" id="svMuteBtn">${storyMusicMuted ? "🔇" : "🔊"}</button>` : ""}`;
                        stage.appendChild(pill);
                        if (m.ytId && !m.url) {
                            const ytBox = document.createElement("div"); ytBox.className = "sv-yt-wrap";
                            ytBox.innerHTML = `<iframe style="width:100%;height:100%;border:none;" src="https://www.youtube.com/embed/${encodeURIComponent(m.ytId)}?autoplay=1&start=${m.startSec || 0}&rel=0&playsinline=1" allow="autoplay; encrypted-media"></iframe>`;
                            stage.appendChild(ytBox);
                        }
                    }
                    if (m.url) {
                        PremAudio.play(m.url, "story", {
                            loop: !m.playFull,
                            muted: storyMusicMuted,
                            clipStart: m.playFull ? 0 : (m.startSec || 0),
                            clipEnd: m.playFull ? 0 : (m.endSec || 0),
                            playFull: m.playFull !== false
                        }).then(ok => { const b = document.getElementById("svMuteBtn"); if (!ok && b) b.innerText = "▶ شغّل"; });
                    }
                }
            } catch {}
        };
        const _origPauseStory = window.pauseStoryMedia;
        window.pauseStoryMedia = p => { if (_origPauseStory) _origPauseStory(p); if (PremAudio.context === "story") { if (p) PremAudio.el.pause(); else if (!storyMusicMuted) PremAudio.el.play().catch(() => {}); } };
        const _origCloseStory = window.closeStoryViewer;
        window.closeStoryViewer = () => { PremAudio.stop("story"); if (_origCloseStory) _origCloseStory(); };

        // ربط صفحتي الشخصية + صفحة البروفايل الكامل للأصدقاء (V11 Full-Screen)
        const _origRenderMyProf = window.renderMyProfilePage;
        window.renderMyProfilePage = () => {
            if (_origRenderMyProf) _origRenderMyProf(); if (!me) return;
            const pal = ACCENT_PALETTES[me.accentColor || "default"] || ACCENT_PALETTES.default;
            const cov = document.getElementById("myProfCover"), nm = document.getElementById("myProfName");
            if (cov && !me.coverImg) cov.style.background = pal.grad;
            if (nm && !(me.isDev || me.verified === "gold")) nm.style.color = me.accentColor && me.accentColor !== "default" ? pal.main : "";
            renderSongCardInto("myProfileSongSlot", me.profileSong || null, "profile_me", true);
            renderMyMoodBar();
        };

        const _origPaintOther = window.paintOtherProfileHeader;
        window.paintOtherProfileHeader = u => {
            if (_origPaintOther) _origPaintOther(u);
            if (!u) return;
            const pal = ACCENT_PALETTES[u.accentColor || "default"] || ACCENT_PALETTES.default;
            const cov = document.getElementById("opCover"), nm = document.getElementById("opName");
            if (cov && !u.coverImg) cov.style.background = pal.grad;
            if (nm && !(u.isDev || u.verified === "gold")) nm.style.color = u.accentColor && u.accentColor !== "default" ? pal.main : "";
            renderSongCardInto("otherProfileSongSlot", u.profileSong || null, "profile_other", false);
            const stSlot = document.getElementById("opStreakBadge");
            if (stSlot && me) {
                const st = getActiveStreakInfo(getRoomId(me.username, u.username));
                stSlot.innerHTML = st ? `<span class="streak-pill" style="font-size:12.5px; padding:4px 10px;">🔥 شعلة ${st.count} أيام</span>` : "";
            }
        };

        const _origStartCall = window.startCall; window.startCall = (v, t) => { PremAudio.stop(); return _origStartCall(v, t); };
        const _origAnswerCall = window.answerIncomingCall; window.answerIncomingCall = () => { PremAudio.stop(); return _origAnswerCall(); };
        const _origStartRec = window.startRecording; window.startRecording = () => { PremAudio.stop(); return _origStartRec(); };

        const _origDetach = window.detachRoomListeners;
        window.detachRoomListeners = () => {
            stopAndReleaseVideos(document.getElementById("messagesList"));
            window.closeDailyPromptModal(); window.closeLiveDrawModal();
            detachYoutubeTogether(); detachMemoriesAndCountdown(); detachChatTheme();
            if (_origDetach) _origDetach();
        };

        const _origOpenDM = window.openDM;
        window.openDM = partnerUsername => {
            detachSharedWp(); detachListenTogether(); detachVanishMode(true);
            detachYoutubeTogether(); detachMemoriesAndCountdown(); detachChatTheme();
            _origOpenDM(partnerUsername);
            const roomCopy = activeRoomId, tokCopy = activeRoomToken;

            sharedWpRef = db.ref(`chats/${roomCopy}/shared_wp`);
            sharedWpRef.on("value", s => { if (tokCopy === activeRoomToken) applySharedWpToArea(s.val()?.value || ""); });

            chatThemeRef = db.ref(`chats/${roomCopy}/chat_theme`);
            chatThemeRef.on("value", s => { if (tokCopy === activeRoomToken) applyChatThemeCss(s.val()?.id || ""); });

            ytTogetherRef = db.ref(`chats/${roomCopy}/yt_together`);
            ytTogetherRef.on("value", s => { if (tokCopy === activeRoomToken) { currentYtData = s.val(); renderYtTogetherBar(currentYtData); } });

            countdownRef = db.ref(`chats/${roomCopy}/countdown`);
            countdownRef.on("value", s => { if (tokCopy === activeRoomToken) { currentCountdownData = s.val(); renderCountdownBanner(currentCountdownData); } });

            memoriesRef = db.ref(`chats/${roomCopy}/memories`);
            memoriesRef.on("value", s => {
                if (tokCopy === activeRoomToken) {
                    currentMemoriesData = s.val() || {};
                    if (document.getElementById("memoriesBoardModal").style.display === "flex") renderMemoriesList();
                }
            });

            listenRef = db.ref(`chats/${roomCopy}/listen_together`);
            listenRef.on("value", s => {
                if (tokCopy !== activeRoomToken) return;
                const d = s.val(); currentListenData = d;
                if (!d?.url) { PremAudio.stop("listen"); renderListenTogetherBar(null); return; }
                if (d.playing) {
                    const el = Math.max(0, (Date.now() - (d.startedAt || Date.now())) / 1000);
                    PremAudio.play(d.url, "listen", { loop: true, startAt: (d.offset || 0) + el, clipStart: d.clipStart || 0, clipEnd: d.clipEnd || 0, playFull: d.playFull !== false }).then(ok => renderListenTogetherBar(d, !ok));
                } else { if (PremAudio.context === "listen") PremAudio.el.pause(); renderListenTogetherBar(d, false); }
            });

            vanishRef = db.ref(`chats/${roomCopy}/vanish_mode`);
            vanishRef.on("value", s => {
                if (tokCopy !== activeRoomToken) return;
                const was = isVanishActive, now = !!(s.val()?.active);
                applyVanishUI(now); if (was && !now) cleanupVanishMessages(roomCopy, true);
            });
        };

        const _origOpenSaved = window.openSavedMessages;
        window.openSavedMessages = () => { detachSharedWp(); detachListenTogether(); detachVanishMode(true); _origOpenSaved(); applyWallpaper(localStorage.getItem("app_wp") || "pattern", true); };
        const _origOpenSpace = window.openSpaceRoom;
        window.openSpaceRoom = id => { detachSharedWp(); detachListenTogether(); detachVanishMode(true); _origOpenSpace(id); applyWallpaper(localStorage.getItem("app_wp") || "pattern", true); };
        const _origCloseChat = window.closeActiveChat;
        window.closeActiveChat = () => { detachSharedWp(); detachListenTogether(); detachVanishMode(true); _origCloseChat(); };

        const _origToggleDrawer = window.toggleStickerDrawer;
        window.toggleStickerDrawer = force => {
            const d = document.getElementById("stickerDrawer"), will = typeof force === "boolean" ? force : d.style.display !== "flex";
            if (!will) { const b = document.getElementById("drawerBody"); stopAndReleaseVideos(b); if (b && activeDrawerTab === "premium") b.innerHTML = ""; }
            _origToggleDrawer(force);
        };
        const _origSwitchDTab = window.switchDrawerTab;
        window.switchDrawerTab = tab => { const b = document.getElementById("drawerBody"); if (b) stopAndReleaseVideos(b); _origSwitchDTab(tab); };
        const _origRenderDrawer = window.renderDrawerContent;
        window.renderDrawerContent = () => { if (typeof activeDrawerTab !== "undefined" && activeDrawerTab === "premium") { const b = document.getElementById("drawerBody"); if (b) renderPremiumDrawerTab(b); return; } if (_origRenderDrawer) _origRenderDrawer(); };

        const _origEnter = window.enterMainApp;
        window.enterMainApp = uData => {
            _origEnter(uData);
            db.ref("notes").on("value", s => { allNotesMap = s.val() || {}; renderNotesStrip(); });
            db.ref("chat_streaks").on("value", s => { allStreaksMap = s.val() || {}; renderChatsSidebarNow(); if (activeChatType === "dm") updateActiveHeader(); });
            db.ref(`user_sticker_packs/${me.username}`).on("value", s => { mySavedPacks = s.val() || {}; if (typeof activeDrawerTab !== "undefined" && activeDrawerTab === "premium" && document.getElementById("stickerDrawer").style.display === "flex") window.renderDrawerContent(); });

            db.ref(`heartbeats/${me.username}`).on("value", s => {
                const hb = s.val();
                if (!hb || !hb.ts || (Date.now() - hb.ts) > 15000) return;
                showHeartbeatOverlay(hb.fromName || hb.from);
                db.ref(`heartbeats/${me.username}`).remove().catch(() => {});
            });

            if (!capsuleInterval) capsuleInterval = setInterval(refreshAllCapsuleCountdowns, 1000);
        };
    }

    injectPremiumStyles();
    injectPremiumDOM();
    installHooks();
})();
