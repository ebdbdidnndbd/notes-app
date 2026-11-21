// ==================== غرفة المراجعة الجماعية للسادس العلمي (study.js — V10 Ultra) ====================
(function () {
    if (window.__STUDY_V10_LOADED__) return;
    window.__STUDY_V10_LOADED__ = true;

    const SUBJECTS = [
        { id: "math",  label: "📐 رياضيات" },
        { id: "phys",  label: "⚡ فيزياء" },
        { id: "chem",  label: "🧪 كيمياء" },
        { id: "bio",   label: "🧬 أحياء" },
        { id: "arab",  label: "📖 عربي" },
        { id: "eng",   label: "🌍 إنجليزي" }
    ];

    const STUDY_STATES = [
        { id: "focus",   label: "🔥 مركز" },
        { id: "exam",    label: "📝 يحل وزاريات" },
        { id: "review",  label: "🔁 مراجعة سريعة" },
        { id: "break",   label: "☕ استراحة" }
    ];

    const NUDGES = [
        { id: "n1", text: "💪 عفية أبطال، استمروا!" },
        { id: "n2", text: "🔥 قربنا نخلص هالجلسة!" },
        { id: "n3", text: "☕ يلا شوية ونأخذ استراحة" },
        { id: "n4", text: "🧠 تركيز 100% — لا تتشتتون!" },
        { id: "n5", text: "🏆 المعدل العالي ينتظرنا!" }
    ];

    const RING_CIRC = 2 * Math.PI * 88; // ≈ 552.92

    let studyMounted = false;
    let inStudyRoom = false;
    let studyTickInterval = null;
    let minuteTrackerSec = 0;

    let timerState = {
        mode: "study", // "study" | "break"
        running: false,
        studyMin: 45,
        breakMin: 10,
        durationSec: 45 * 60,
        remainingSec: 45 * 60,
        startedAt: 0,
        by: ""
    };

    let membersMap = {};
    let goalsMap = {};
    let statsMap = {};
    let mySubject = localStorage.getItem("study_subj") || SUBJECTS[0].label;
    let myStudyStatus = localStorage.getItem("study_stat") || STUDY_STATES[0].label;
    let lastNudgeTs = 0;

    let timerRef = null, membersRef = null, goalsRef = null, statsRef = null, nudgeRef = null;

    function studyDayKey() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    // ==================== محرّك أصوات التركيز المدمج (Web Audio — صفر سحب نت) ====================
    const FocusAudio = {
        ctx: null,
        masterGain: null,
        activeNodes: [],
        activeType: "off", // "off" | "rain" | "brown" | "alpha"
        volume: 0.35,

        ensureCtx() {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.value = this.volume;
                this.masterGain.connect(this.ctx.destination);
            }
            if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
        },

        stop() {
            this.activeNodes.forEach(n => {
                try { if (n.stop) n.stop(); } catch {}
                try { if (n.disconnect) n.disconnect(); } catch {}
            });
            this.activeNodes = [];
            this.activeType = "off";
            updateAmbientButtonsUI();
        },

        setVolume(val) {
            this.volume = Math.max(0.02, Math.min(1, parseFloat(val) || 0.35));
            if (this.masterGain && this.ctx) {
                this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
            }
        },

        play(type) {
            if (this.activeType === type || type === "off") {
                this.stop();
                return;
            }
            this.stop();
            try {
                this.ensureCtx();
                const ctx = this.ctx;
                this.activeType = type;

                if (type === "rain") {
                    // توليد صوت مطر ناعم عبر Pink Noise + Bandpass
                    const bufSize = ctx.sampleRate * 3;
                    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
                    const data = buf.getChannelData(0);
                    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
                    for (let i = 0; i < bufSize; i++) {
                        const w = Math.random() * 2 - 1;
                        b0 = 0.99886 * b0 + w * 0.0555179;
                        b1 = 0.99332 * b1 + w * 0.0750759;
                        b2 = 0.96900 * b2 + w * 0.1538520;
                        b3 = 0.86650 * b3 + w * 0.3104856;
                        b4 = 0.55000 * b4 + w * 0.5329522;
                        b5 = -0.7616 * b5 - w * 0.0168980;
                        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.045;
                        b6 = w * 0.115926;
                    }
                    const src = ctx.createBufferSource();
                    src.buffer = buf; src.loop = true;

                    const lp = ctx.createBiquadFilter();
                    lp.type = "lowpass"; lp.frequency.value = 1400;
                    const hp = ctx.createBiquadFilter();
                    hp.type = "highpass"; hp.frequency.value = 260;

                    src.connect(hp); hp.connect(lp); lp.connect(this.masterGain);
                    src.start();
                    this.activeNodes.push(src, lp, hp);
                } else if (type === "brown") {
                    // ضوضاء بنية عميقة تعزل الضوضاء الخارجية تماماً
                    const bufSize = ctx.sampleRate * 3;
                    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
                    const data = buf.getChannelData(0);
                    let last = 0;
                    for (let i = 0; i < bufSize; i++) {
                        const w = Math.random() * 2 - 1;
                        data[i] = (last + 0.02 * w) / 1.02;
                        last = data[i];
                        data[i] *= 1.8;
                    }
                    const src = ctx.createBufferSource();
                    src.buffer = buf; src.loop = true;

                    const lp = ctx.createBiquadFilter();
                    lp.type = "lowpass"; lp.frequency.value = 340;
                    src.connect(lp); lp.connect(this.masterGain);
                    src.start();
                    this.activeNodes.push(src, lp);
                } else if (type === "alpha") {
                    // نغمة تركيز دافئة هادئة (Alpha Calm Drone)
                    const freqs = [174, 180, 261.6];
                    freqs.forEach((f, idx) => {
                        const osc = ctx.createOscillator();
                        const g = ctx.createGain();
                        osc.type = "sine";
                        osc.frequency.value = f;
                        g.gain.value = idx === 2 ? 0.06 : 0.11;
                        osc.connect(g); g.connect(this.masterGain);
                        osc.start();
                        this.activeNodes.push(osc, g);
                    });
                }
                updateAmbientButtonsUI();
                showToast("🎧 تم تشغيل صوت التركيز الهادئ");
            } catch {
                showToast("تعذر تشغيل الصوت على هذا المتصفح");
            }
        }
    };

    function playStudyChime() {
        try {
            playTone(523.25, 0.25, "sine", 0.08);
            setTimeout(() => playTone(659.25, 0.28, "sine", 0.08), 220);
            setTimeout(() => playTone(783.99, 0.45, "sine", 0.09), 440);
        } catch {}
    }

    // ==================== 1. حقن ستايلات غرفة المراجعة ====================
    function injectStudyStyles() {
        if (document.getElementById("studyStylesV10")) return;
        const s = document.createElement("style");
        s.id = "studyStylesV10";
        s.textContent = `
            .study-wrap {
                width: 100%; height: 100%; display: flex; flex-direction: column;
                background: radial-gradient(circle at top, rgba(16,185,129,0.10), var(--bg-main) 55%);
                overflow: hidden;
            }
            .study-scroll {
                flex: 1; overflow-y: auto; padding: 14px 12px 26px;
                max-width: 720px; width: 100%; margin: 0 auto;
            }
            .study-card {
                background: var(--bg-panel); border: 1px solid var(--border-bright);
                border-radius: 22px; padding: 16px; margin-bottom: 12px;
                box-shadow: 0 10px 28px rgba(0,0,0,0.34);
            }
            .study-card-title {
                font-size: 14px; font-weight: 800; color: var(--accent);
                margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;
            }

            /* المؤقت الدائري المتوهج */
            .timer-hero { display: flex; flex-direction: column; align-items: center; padding: 6px 0 4px; }
            .timer-ring-box { position: relative; width: 204px; height: 204px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
            .timer-ring-box svg { position: absolute; inset: 0; transform: rotate(-90deg); width: 100%; height: 100%; }
            .tr-bg { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 9; }
            .tr-prog { fill: none; stroke: var(--accent); stroke-width: 9; stroke-linecap: round; transition: stroke-dashoffset 0.55s ease, stroke 0.3s; filter: drop-shadow(0 0 8px var(--glow)); }
            .tr-prog.break-mode { stroke: #10b981; }
            .timer-center { text-align: center; z-index: 2; }
            .timer-mode-pill {
                display: inline-block; font-size: 11px; font-weight: 800; padding: 3px 11px;
                border-radius: 99px; background: rgba(56,189,248,0.16); color: var(--accent);
                border: 1px solid var(--border-bright); margin-bottom: 6px;
            }
            .timer-mode-pill.break-mode { background: rgba(16,185,129,0.18); color: #34d399; border-color: rgba(52,211,153,0.4); }
            .timer-digits { font-size: 42px; font-weight: 800; letter-spacing: 2px; font-variant-numeric: tabular-nums; line-height: 1; color: #fff; }
            .timer-sub { font-size: 11px; color: var(--text-dim); margin-top: 6px; }

            .timer-presets { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; margin-bottom: 12px; }
            .tp-btn {
                padding: 5px 11px; border-radius: 99px; border: 1px solid var(--border);
                background: var(--bg-card); color: var(--text-dim); font-size: 11.5px; font-weight: 700; cursor: pointer;
            }
            .tp-btn.active { background: var(--primary-grad); border-color: transparent; color: #fff; }

            .timer-controls { display: flex; gap: 8px; justify-content: center; width: 100%; max-width: 320px; }

            /* الحاضرون الآن */
            .study-members-grid { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; }
            .sm-card {
                min-width: 118px; background: var(--glass-inner); border: 1px solid var(--border);
                border-radius: 16px; padding: 10px; text-align: center; flex-shrink: 0;
                display: flex; flex-direction: column; align-items: center; gap: 4px;
            }
            .sm-card.me-card { border-color: var(--accent); background: rgba(56,189,248,0.08); }
            .sm-name { font-size: 12.5px; font-weight: 800; color: var(--text); max-width: 102px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .sm-tag { font-size: 10.5px; font-weight: 700; color: var(--accent); background: var(--bg-card); padding: 2px 8px; border-radius: 99px; }
            .sm-st { font-size: 10.5px; color: var(--text-dim); }

            /* اختيارات المادة والمود */
            .study-chips { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 8px; }
            .s-chip {
                padding: 6px 11px; border-radius: 99px; border: 1px solid var(--border);
                background: var(--glass-inner); color: var(--text-dim); font-size: 12px; font-weight: 700;
                cursor: pointer; white-space: nowrap; flex-shrink: 0;
            }
            .s-chip.active { background: var(--primary-grad); border-color: transparent; color: #fff; }

            /* أصوات التركيز */
            .ambient-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; margin-bottom: 10px; }
            .amb-btn {
                padding: 9px 4px; border-radius: 14px; border: 1px solid var(--border);
                background: var(--glass-inner); color: var(--text-dim); font-size: 11.5px; font-weight: 700;
                cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;
            }
            .amb-btn.active { background: linear-gradient(135deg, rgba(16,185,129,0.28), rgba(14,165,233,0.28)); border-color: var(--accent); color: #fff; }
            .amb-vol-row { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--text-dim); }
            .amb-vol-row input { flex: 1; accent-color: var(--accent); }

            /* أهداف الجلسة */
            .goal-row {
                display: flex; align-items: center; justify-content: space-between; gap: 8px;
                background: var(--glass-inner); border: 1px solid var(--border);
                border-radius: 13px; padding: 9px 11px; margin-bottom: 7px;
            }
            .goal-row.done { opacity: 0.62; border-color: rgba(16,185,129,0.4); }
            .goal-left { display: flex; align-items: center; gap: 9px; flex: 1; min-width: 0; cursor: pointer; }
            .goal-check {
                width: 22px; height: 22px; border-radius: 7px; border: 2px solid var(--accent);
                display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0;
            }
            .goal-row.done .goal-check { background: var(--success); border-color: var(--success); color: #fff; }
            .goal-txt { font-size: 13px; font-weight: 700; word-break: break-word; }
            .goal-row.done .goal-txt { text-decoration: line-through; color: var(--text-dim); }
            .goal-by { font-size: 10.5px; color: var(--text-dim); display: block; }

            /* النغزات التشجيعية */
            .nudge-banner {
                display: none; position: fixed; top: 58px; left: 50%; transform: translateX(-50%);
                background: linear-gradient(135deg, #059669, #0ea5e9); color: #fff;
                padding: 8px 18px; border-radius: 99px; font-size: 13px; font-weight: 800;
                z-index: 9400; box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: fadeIn 0.2s ease;
                max-width: 90%; text-align: center;
            }
            .nudge-banner.show { display: block; }

            /* شاشة وضع التركيز الكامل */
            #focusZenOverlay {
                display: none; position: fixed; inset: 0; z-index: 950;
                background: radial-gradient(circle at center, #0c1a2e 0%, #03060d 78%);
                flex-direction: column; align-items: center; justify-content: center; gap: 18px; padding: 24px;
            }
            #focusZenOverlay.open { display: flex; animation: fadeIn 0.24s ease; }
            .zen-digits { font-size: 74px; font-weight: 800; letter-spacing: 3px; color: #fff; font-variant-numeric: tabular-nums; text-shadow: 0 0 36px var(--glow); }
            .zen-sub { font-size: 15px; color: var(--accent); font-weight: 700; }
        `;
        document.head.appendChild(s);
    }

    // ==================== 2. بناء هيكل غرفة المراجعة ====================
    function mountStudyUI() {
        if (studyMounted) return;
        const container = document.getElementById("view-study");
        if (!container) return;
        studyMounted = true;

        container.innerHTML = `
            <div class="study-wrap">
                <div class="top-bar">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button class="icon-btn" style="width:34px; height:34px;" title="رجوع" onclick="window.leaveStudyRoomView()">➔</button>
                        <h3>⏱️ غرفة المراجعة الجماعية</h3>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-sm" onclick="window.openFocusZenOverlay()">🔒 تركيز كامل</button>
                        <button class="btn btn-sm btn-outline" onclick="window.exitStudySessionCompletely()" title="إيقاف الأصوات ومغادرة الجلسة">خروج</button>
                    </div>
                </div>

                <div class="study-scroll">
                    <!-- بطاقة المؤقت المشترك -->
                    <div class="study-card">
                        <div class="timer-hero">
                            <div class="timer-ring-box">
                                <svg viewBox="0 0 200 200">
                                    <circle class="tr-bg" cx="100" cy="100" r="88"></circle>
                                    <circle class="tr-prog" id="studyRingProg" cx="100" cy="100" r="88" stroke-dasharray="${RING_CIRC.toFixed(2)}" stroke-dashoffset="0"></circle>
                                </svg>
                                <div class="timer-center">
                                    <span class="timer-mode-pill" id="studyModePill">📚 وقت الدراسة</span>
                                    <div class="timer-digits" id="studyTimerDigits">45:00</div>
                                    <div class="timer-sub" id="studyTimerBy">جاهز للبدء</div>
                                </div>
                            </div>

                            <div class="timer-presets">
                                <button type="button" class="tp-btn" onclick="window.setStudyPreset(25, 5)">25 / 5</button>
                                <button type="button" class="tp-btn active" onclick="window.setStudyPreset(45, 10)">45 / 10 (سادس)</button>
                                <button type="button" class="tp-btn" onclick="window.setStudyPreset(60, 15)">60 / 15</button>
                                <button type="button" class="tp-btn" onclick="window.setCustomStudyPreset()">⚙️ مخصص</button>
                            </div>

                            <div class="timer-controls">
                                <button class="btn" id="studyStartPauseBtn" style="flex:1;" onclick="window.toggleStudyTimer()">▶ ابدأ الجلسة</button>
                                <button class="btn btn-outline btn-sm" onclick="window.switchStudyPhaseManual()" title="تبديل دراسة/استراحة">🔄</button>
                                <button class="btn btn-outline btn-sm" onclick="window.resetStudyTimer()" title="إعادة ضبط">↺</button>
                            </div>
                        </div>
                    </div>

                    <!-- بطاقة الحاضرين الآن + حالتي ومادتي -->
                    <div class="study-card">
                        <div class="study-card-title">
                            <span>👥 يدرسون الآن (<span id="studyMembersCount">0</span>)</span>
                            <span style="font-size:11px; color:var(--text-dim);">تحديث فوري</span>
                        </div>
                        <div class="study-members-grid" id="studyMembersGrid"></div>

                        <div style="margin-top:12px; padding-top:10px; border-top:1px solid var(--border);">
                            <div style="font-size:11.5px; color:var(--text-dim); font-weight:700; margin-bottom:5px;">اختر المادة اللي جاي تقراها:</div>
                            <div class="study-chips" id="studySubjectChips"></div>
                            <div style="font-size:11.5px; color:var(--text-dim); font-weight:700; margin-bottom:5px;">حالتك الحالية:</div>
                            <div class="study-chips" id="studyStatusChips"></div>
                        </div>
                    </div>

                    <!-- بطاقة أصوات التركيز الهادئة (صفر نت) -->
                    <div class="study-card">
                        <div class="study-card-title">
                            <span>🌧️ أصوات تركيز هادئة</span>
                            <span style="font-size:11px; color:var(--success);">تشتغل بدون سحب نت</span>
                        </div>
                        <div class="ambient-row" id="studyAmbientRow">
                            <button type="button" class="amb-btn active" data-amb="off" onclick="window.setFocusAmbient('off')"><span>🔇</span><span>صامت</span></button>
                            <button type="button" class="amb-btn" data-amb="rain" onclick="window.setFocusAmbient('rain')"><span>🌧️</span><span>مطر هادئ</span></button>
                            <button type="button" class="amb-btn" data-amb="brown" onclick="window.setFocusAmbient('brown')"><span>🌊</span><span>تركيز عميق</span></button>
                            <button type="button" class="amb-btn" data-amb="alpha" onclick="window.setFocusAmbient('alpha')"><span>✨</span><span>نغمة هادئة</span></button>
                        </div>
                        <div class="amb-vol-row">
                            <span>🔉 مستوى الصوت</span>
                            <input type="range" min="0.05" max="0.85" step="0.05" value="0.35" oninput="window.setFocusAmbientVolume(this.value)">
                        </div>
                    </div>

                    <!-- بطاقة نغزات التشجيع السريعة -->
                    <div class="study-card">
                        <div class="study-card-title"><span>👏 نغزة تشجيع سريعة (بدون تشتيت الشات)</span></div>
                        <div class="study-chips" style="margin-bottom:0;">
                            ${NUDGES.map(n => `<button type="button" class="s-chip" onclick="window.sendStudyNudge('${escapeHTML(n.text)}')">${n.text}</button>`).join("")}
                        </div>
                    </div>

                    <!-- بطاقة أهداف الجلسة -->
                    <div class="study-card">
                        <div class="study-card-title">
                            <span>✅ أهداف جلسة اليوم</span>
                            <span id="studyGoalsProgress" style="font-size:12px; color:var(--success);">0/0</span>
                        </div>
                        <div style="display:flex; gap:7px; margin-bottom:10px;">
                            <input type="text" id="studyGoalInput" class="input" maxlength="85" placeholder="مثال: أكمل 10 صفحات أحياء أو مسائل الفصل 3..." onkeydown="if(event.key==='Enter'){event.preventDefault(); window.addStudyGoal();}">
                            <button class="btn" style="width:78px;" onclick="window.addStudyGoal()">إضافة</button>
                        </div>
                        <div id="studyGoalsList"></div>
                    </div>

                    <!-- بطاقة عدّاد ساعات القراية اليومي -->
                    <div class="study-card">
                        <div class="study-card-title">
                            <span>🏆 أبطال المراجعة اليوم</span>
                            <span style="font-size:11px; color:var(--text-dim);">يُحسب تلقائياً أثناء المؤقت</span>
                        </div>
                        <div id="studyLeaderboardList"></div>
                    </div>
                </div>
            </div>`;

        if (!document.getElementById("studyNudgeBanner")) {
            const nb = document.createElement("div");
            nb.id = "studyNudgeBanner"; nb.className = "nudge-banner";
            document.body.appendChild(nb);
        }

        if (!document.getElementById("focusZenOverlay")) {
            const ov = document.createElement("div");
            ov.id = "focusZenOverlay";
            ov.innerHTML = `
                <span class="timer-mode-pill" id="zenModePill">📚 وضع التركيز الكامل</span>
                <div class="zen-digits" id="zenDigits">45:00</div>
                <div class="zen-sub" id="zenSubText"></div>
                <div style="display:flex; gap:10px; margin-top:14px;">
                    <button class="btn btn-sm" id="zenToggleBtn" onclick="window.toggleStudyTimer()">⏸ إيقاف</button>
                    <button class="btn btn-sm btn-outline" onclick="window.setFocusAmbient('rain')">🌧️ مطر</button>
                    <button class="btn btn-sm btn-danger" onclick="window.closeFocusZenOverlay()">إنهاء التركيز</button>
                </div>`;
            document.body.appendChild(ov);
        }

        renderSubjectAndStatusChips();
    }

    function updateAmbientButtonsUI() {
        document.querySelectorAll("#studyAmbientRow .amb-btn").forEach(b => {
            b.classList.toggle("active", b.getAttribute("data-amb") === FocusAudio.activeType);
        });
    }

    function renderSubjectAndStatusChips() {
        const subBox = document.getElementById("studySubjectChips");
        const stBox = document.getElementById("studyStatusChips");
        if (subBox) {
            subBox.innerHTML = SUBJECTS.map(s =>
                `<button type="button" class="s-chip ${mySubject === s.label ? 'active' : ''}" onclick="window.setMyStudySubject('${escapeHTML(s.label)}')">${s.label}</button>`
            ).join("");
        }
        if (stBox) {
            stBox.innerHTML = STUDY_STATES.map(s =>
                `<button type="button" class="s-chip ${myStudyStatus === s.label ? 'active' : ''}" onclick="window.setMyStudyStatus('${escapeHTML(s.label)}')">${s.label}</button>`
            ).join("");
        }
    }

    // ==================== 3. مزامنة الغرفة مع Firebase ====================
    function calcLiveRemainingSec() {
        if (!timerState.running) return Math.max(0, Math.round(timerState.remainingSec || 0));
        const elapsed = Math.floor((Date.now() - (timerState.startedAt || Date.now())) / 1000);
        return Math.max(0, Math.round((timerState.remainingSec || 0) - elapsed));
    }

    function fmtMMSS(sec) {
        const m = Math.floor(sec / 60), s = sec % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }

    function renderTimerUI() {
        const rem = calcLiveRemainingSec();
        const total = Math.max(1, timerState.durationSec || (timerState.studyMin * 60) || 2700);
        const pct = Math.max(0, Math.min(1, rem / total));
        const isBreak = timerState.mode === "break";
        const timeStr = fmtMMSS(rem);

        const dig = document.getElementById("studyTimerDigits");
        const ring = document.getElementById("studyRingProg");
        const pill = document.getElementById("studyModePill");
        const byEl = document.getElementById("studyTimerBy");
        const btn = document.getElementById("studyStartPauseBtn");

        if (dig) dig.innerText = timeStr;
        if (ring) {
            ring.style.strokeDashoffset = (RING_CIRC * (1 - pct)).toFixed(2);
            ring.classList.toggle("break-mode", isBreak);
        }
        if (pill) {
            pill.innerText = isBreak ? "☕ وقت الاستراحة" : "📚 وقت الدراسة";
            pill.classList.toggle("break-mode", isBreak);
        }
        if (byEl) {
            byEl.innerText = timerState.running
                ? (timerState.by ? `شغّله: ${timerState.by}` : "الجلسة شغالة الآن 🔥")
                : "متوقف مؤقتاً";
        }
        if (btn) {
            btn.innerText = timerState.running ? "⏸ إيقاف مؤقت" : (rem < total ? "▶ متابعة" : "▶ ابدأ الجلسة");
        }

        // تحديث شاشة التركيز الكامل إذا مفتوحة
        const zenDig = document.getElementById("zenDigits");
        const zenPill = document.getElementById("zenModePill");
        const zenSub = document.getElementById("zenSubText");
        const zenBtn = document.getElementById("zenToggleBtn");
        if (zenDig) zenDig.innerText = timeStr;
        if (zenPill) { zenPill.innerText = isBreak ? "☕ وقت الاستراحة" : "🔒 وضع التركيز الكامل"; zenPill.classList.toggle("break-mode", isBreak); }
        if (zenSub) zenSub.innerText = `${mySubject} • ${myStudyStatus}`;
        if (zenBtn) zenBtn.innerText = timerState.running ? "⏸ إيقاف" : "▶ متابعة";

        // تحديث أزرار المدد الجاهزة
        document.querySelectorAll(".timer-presets .tp-btn").forEach((b, i) => {
            if (i === 0) b.classList.toggle("active", timerState.studyMin === 25 && timerState.breakMin === 5);
            else if (i === 1) b.classList.toggle("active", timerState.studyMin === 45 && timerState.breakMin === 10);
            else if (i === 2) b.classList.toggle("active", timerState.studyMin === 60 && timerState.breakMin === 15);
        });
    }

    async function handleTimerTick() {
        renderTimerUI();
        if (!timerState.running || !me) return;

        const rem = calcLiveRemainingSec();
        // احتساب دقائق القراية الفعلية كل دقيقة كاملة بوضع الدراسة
        if (timerState.mode === "study" && inStudyRoom) {
            minuteTrackerSec++;
            if (minuteTrackerSec >= 60) {
                minuteTrackerSec = 0;
                const dKey = studyDayKey();
                const ref = db.ref(`study_room/stats/${dKey}/${me.username}`);
                ref.transaction(cur => {
                    const prevMin = (cur && cur.minutes) ? cur.minutes : 0;
                    return { name: me.name, minutes: prevMin + 1, subject: mySubject, updatedAt: Date.now() };
                }).catch(() => {});
            }
        }

        // انتهاء الوقت -> تنبيه صوتي وتبديل المرحلة تلقائياً
        if (rem <= 0) {
            playStudyChime();
            if (typeof triggerHaptic === "function") triggerHaptic([100, 60, 120]);
            const nextMode = timerState.mode === "study" ? "break" : "study";
            const nextSec = (nextMode === "study" ? (timerState.studyMin || 45) : (timerState.breakMin || 10)) * 60;
            showToast(nextMode === "break" ? "🎉 خلصت جلسة القراية! حان وقت الاستراحة ☕" : "🔔 خلصت الاستراحة — يلا نرجع ندرس! 📚");
            if (nextMode === "break" && FocusAudio.activeType !== "off") FocusAudio.stop();
            await db.ref("study_room/timer").set({
                ...timerState, mode: nextMode, running: false, durationSec: nextSec, remainingSec: nextSec, startedAt: 0
            }).catch(() => {});
        }
    }

    function renderStudyMembers() {
        const grid = document.getElementById("studyMembersGrid");
        const cntEl = document.getElementById("studyMembersCount");
        if (!grid) return;
        const now = Date.now();
        const activeList = Object.values(membersMap || {}).filter(m => m && m.username && (!m.ts || (now - m.ts) < 3600000 * 6));
        if (cntEl) cntEl.innerText = activeList.length;

        if (!activeList.length) {
            grid.innerHTML = `<div style="font-size:12.5px; color:var(--text-dim); padding:10px;">الغرفة فارغة حالياً — كن أول من يبدأ القراية!</div>`;
            return;
        }
        grid.innerHTML = "";
        activeList.forEach(m => {
            const uObj = contactProfiles[m.username] || (m.username === me?.username ? me : { name: m.name });
            const card = document.createElement("div");
            card.className = "sm-card" + (m.username === me?.username ? " me-card" : "");
            const av = document.createElement("div"); av.className = "avatar sm";
            setAvatarStyle(av, uObj, true);
            card.appendChild(av);
            card.innerHTML += `
                <div class="sm-name">${escapeHTML(m.name || m.username)}</div>
                <span class="sm-tag">${escapeHTML(m.subject || "📚 دراسة")}</span>
                <span class="sm-st">${escapeHTML(m.status || "🔥 مركز")}</span>`;
            grid.appendChild(card);
        });
    }

    function renderStudyGoals() {
        const box = document.getElementById("studyGoalsList");
        const prog = document.getElementById("studyGoalsProgress");
        if (!box) return;
        const list = Object.entries(goalsMap || {}).map(([id, g]) => ({ id, ...g })).sort((a, b) => (b.ts || 0) - (a.ts || 0));
        const doneCount = list.filter(g => g.done).length;
        if (prog) prog.innerText = `${doneCount}/${list.length} مكتمل`;

        if (!list.length) {
            box.innerHTML = `<div style="text-align:center; padding:14px; font-size:12.5px; color:var(--text-dim);">اكتب أول هدف تريد تخلصه بهاي الساعة ✅</div>`;
            return;
        }
        box.innerHTML = list.map(g => `
            <div class="goal-row ${g.done ? 'done' : ''}">
                <div class="goal-left" onclick="window.toggleStudyGoal('${escapeHTML(g.id)}', ${!g.done})">
                    <div class="goal-check">${g.done ? '✓' : ''}</div>
                    <div style="min-width:0;">
                        <div class="goal-txt">${escapeHTML(g.text)}</div>
                        <span class="goal-by">${escapeHTML(g.byName || "")}</span>
                    </div>
                </div>
                ${g.by === me?.username ? `<button class="icon-btn danger" style="width:28px; height:28px; font-size:11px;" onclick="window.deleteStudyGoal('${escapeHTML(g.id)}')">✕</button>` : ""}
            </div>`).join("");
    }

    function renderStudyLeaderboard() {
        const box = document.getElementById("studyLeaderboardList"); if (!box) return;
        const list = Object.entries(statsMap || {})
            .map(([u, d]) => ({ username: u, name: d.name || u, minutes: d.minutes || 0, subject: d.subject || "" }))
            .filter(x => x.minutes > 0)
            .sort((a, b) => b.minutes - a.minutes);

        if (!list.length) {
            box.innerHTML = `<div style="text-align:center; padding:12px; font-size:12.5px; color:var(--text-dim);">ابدأ المؤقت وستُحسب دقائق وساعات قرايتك تلقائياً هنا 🏆</div>`;
            return;
        }
        const medals = ["🥇", "🥈", "🥉"];
        box.innerHTML = list.map((x, idx) => {
            const hrs = Math.floor(x.minutes / 60), mins = x.minutes % 60;
            const durTxt = hrs > 0 ? `${hrs} س و ${mins} د` : `${mins} دقيقة`;
            return `<div class="adm-row" style="margin-bottom:6px; padding:9px 12px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:18px;">${medals[idx] || "⭐"}</span>
                    <div>
                        <strong style="font-size:13.5px;">${escapeHTML(x.name)}</strong>
                        <div style="font-size:11px; color:var(--text-dim);">${escapeHTML(x.subject)}</div>
                    </div>
                </div>
                <span class="score-pill" style="color:var(--accent);">⏱️ ${durTxt}</span>
            </div>`;
        }).join("");
    }

    function attachStudyListeners() {
        if (!me) return;
        const dKey = studyDayKey();

        // تسجيل وجودي داخل الغرفة مع حذف تلقائي عند انقطاع الاتصال
        const myPresence = db.ref(`study_room/members/${me.username}`);
        myPresence.onDisconnect().remove();
        myPresence.set({ username: me.username, name: me.name, subject: mySubject, status: myStudyStatus, ts: Date.now() });

        if (!timerRef) {
            timerRef = db.ref("study_room/timer");
            timerRef.on("value", s => {
                if (s.exists()) timerState = { ...timerState, ...s.val() };
                renderTimerUI();
            });
        }
        if (!membersRef) {
            membersRef = db.ref("study_room/members");
            membersRef.on("value", s => { membersMap = s.val() || {}; renderStudyMembers(); });
        }
        if (!goalsRef) {
            goalsRef = db.ref(`study_room/goals/${dKey}`);
            goalsRef.on("value", s => { goalsMap = s.val() || {}; renderStudyGoals(); });
        }
        if (!statsRef) {
            statsRef = db.ref(`study_room/stats/${dKey}`);
            statsRef.on("value", s => { statsMap = s.val() || {}; renderStudyLeaderboard(); });
        }
        if (!nudgeRef) {
            nudgeRef = db.ref("study_room/last_nudge");
            nudgeRef.on("value", s => {
                const n = s.val();
                if (!n || !n.ts || n.ts <= lastNudgeTs || (Date.now() - n.ts) > 12000) return;
                lastNudgeTs = n.ts;
                if (n.from === me.username) return;
                const b = document.getElementById("studyNudgeBanner");
                if (b) {
                    b.innerText = `${n.fromName}: ${n.text}`;
                    b.classList.add("show");
                    playRecvSound();
                    clearTimeout(b._tm);
                    b._tm = setTimeout(() => b.classList.remove("show"), 3500);
                }
            });
        }

        if (!studyTickInterval) studyTickInterval = setInterval(handleTimerTick, 1000);
    }

    // ==================== 4. أوامر التحكم بالغرفة ====================
    window.setStudyPreset = async function (studyMin, breakMin) {
        const sec = studyMin * 60;
        await db.ref("study_room/timer").set({
            mode: "study", running: false, studyMin, breakMin, durationSec: sec, remainingSec: sec, startedAt: 0, by: me?.name || ""
        });
        showToast(`تم ضبط المؤقت: ${studyMin} دقيقة دراسة / ${breakMin} استراحة ⏱️`);
    };

    window.setCustomStudyPreset = function () {
        const s = parseInt(prompt("كم دقيقة دراسة؟ (مثلاً 50):", String(timerState.studyMin || 45)) || "", 10);
        if (!s || s < 1 || s > 180) return;
        const b = parseInt(prompt("كم دقيقة استراحة؟ (مثلاً 10):", String(timerState.breakMin || 10)) || "10", 10);
        window.setStudyPreset(s, Math.max(1, Math.min(60, b || 10)));
    };

    window.toggleStudyTimer = async function () {
        if (!me) return;
        if (typeof triggerHaptic === "function") triggerHaptic(12);
        if (timerState.running) {
            const rem = calcLiveRemainingSec();
            await db.ref("study_room/timer").update({ running: false, remainingSec: rem, startedAt: 0, by: me.name });
        } else {
            const rem = calcLiveRemainingSec() || timerState.durationSec || (timerState.studyMin * 60);
            await db.ref("study_room/timer").set({
                ...timerState, running: true, remainingSec: rem, startedAt: Date.now(), by: me.name
            });
            playSendSound();
        }
    };

    window.switchStudyPhaseManual = async function () {
        const nextMode = timerState.mode === "study" ? "break" : "study";
        const sec = (nextMode === "study" ? (timerState.studyMin || 45) : (timerState.breakMin || 10)) * 60;
        await db.ref("study_room/timer").set({ ...timerState, mode: nextMode, running: false, durationSec: sec, remainingSec: sec, startedAt: 0 });
    };

    window.resetStudyTimer = async function () {
        const sec = (timerState.mode === "study" ? (timerState.studyMin || 45) : (timerState.breakMin || 10)) * 60;
        await db.ref("study_room/timer").update({ running: false, durationSec: sec, remainingSec: sec, startedAt: 0 });
    };

    window.setMyStudySubject = function (label) {
        mySubject = label;
        localStorage.setItem("study_subj", label);
        renderSubjectAndStatusChips();
        if (me) db.ref(`study_room/members/${me.username}`).update({ subject: label, ts: Date.now() }).catch(() => {});
    };

    window.setMyStudyStatus = function (label) {
        myStudyStatus = label;
        localStorage.setItem("study_stat", label);
        renderSubjectAndStatusChips();
        if (me) db.ref(`study_room/members/${me.username}`).update({ status: label, ts: Date.now() }).catch(() => {});
    };

    window.setFocusAmbient = type => FocusAudio.play(type);
    window.setFocusAmbientVolume = v => FocusAudio.setVolume(v);

    window.sendStudyNudge = async function (text) {
        if (!me) return;
        await db.ref("study_room/last_nudge").set({ from: me.username, fromName: me.name, text, ts: Date.now() });
        playSendSound();
        showToast("تم إرسال التشجيع للغرفة 👏");
    };

    window.addStudyGoal = async function () {
        const inp = document.getElementById("studyGoalInput");
        const txt = (inp?.value || "").trim();
        if (!txt || !me) return;
        inp.value = "";
        const id = "g_" + Date.now();
        await db.ref(`study_room/goals/${studyDayKey()}/${id}`).set({ text: txt, by: me.username, byName: me.name, done: false, ts: Date.now() });
        playSendSound();
    };

    window.toggleStudyGoal = async function (id, nextDone) {
        await db.ref(`study_room/goals/${studyDayKey()}/${id}/done`).set(!!nextDone);
        if (nextDone) {
            playStudyChime();
            if (window.playScreenEffect) window.playScreenEffect("confetti");
            showToast("عاشت إيدك! هدف مكتمل 🎉");
        }
    };

    window.deleteStudyGoal = async function (id) {
        await db.ref(`study_room/goals/${studyDayKey()}/${id}`).remove();
    };

    window.openFocusZenOverlay = function () {
        renderTimerUI();
        document.getElementById("focusZenOverlay").classList.add("open");
    };
    window.closeFocusZenOverlay = function () {
        document.getElementById("focusZenOverlay").classList.remove("open");
    };

    window.leaveStudyRoomView = function () {
        switchMainTab("spaces");
    };

    window.exitStudySessionCompletely = function () {
        inStudyRoom = false;
        FocusAudio.stop();
        window.closeFocusZenOverlay();
        if (me) db.ref(`study_room/members/${me.username}`).remove().catch(() => {});
        showToast("تمت مغادرة جلسة المراجعة وإيقاف الأصوات");
        switchMainTab("spaces");
    };

    // تسجيل غرفة المراجعة داخل AppModules لتفتح فوراً من قسم المزيد
    window.AppModules = window.AppModules || {};
    window.AppModules.study = function () {
        if (!me) return;
        injectStudyStyles();
        mountStudyUI();
        inStudyRoom = true;
        switchMainTab("study");
        attachStudyListeners();
        renderTimerUI();
    };
})();
