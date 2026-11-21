// ==================== المساعد الذكي وتوليد الصور (ai.js — V11 Ultra Shield — ثبات أعلى + تلخيص + اقتراح ردود) ====================
(function () {
    if (window.__AI_V11_LOADED__) return;
    window.__AI_V11_LOADED__ = true;

    const PERSONAS = {
        tutor: {
            id: "tutor",
            label: "📚 أستاذ السادس",
            badge: "شرح مبسط للسادس العلمي",
            placeholder: "اسأل عن مسألة فيزياء، كيمياء، رياضيات، أحياء، عربي، أو إنجليزي...",
            system: "أنت أستاذ عراقي خبير بمنهج السادس العلمي (فيزياء، كيمياء، رياضيات، أحياء، عربي، إنجليزي). اشرح بخطوات مرتبة وواضحة ومختصرة وبأسلوب مشجّع وسهل الفهم.",
            quick: [
                "اشرحلي قانون المتسعات باختصار ⚡",
                "لخّصلي قاعدة لو شاتيليه بالكيمياء 🧪",
                "شنو الفرق بين الانقسام الخيطي والاختزالي؟ 🧬",
                "انطيني جدول مراجعة مركّز لليوم 📅"
            ]
        },
        iraqi: {
            id: "iraqi",
            label: "💬 صديق عراقي",
            badge: "سوالف، أفكار، برمجة وحلول",
            placeholder: "سولف وياي أو اطلب أي شي ببالك...",
            system: "أنت مساعد ذكي ودود تحچي باللهجة العراقية الراقية والمرتبة. إجاباتك مباشرة، ذكية، وخفيفة ظل بدون تطويل ممل.",
            quick: [
                "انطيني فكرة مفاجأة حلوة ولطيفة 🎁",
                "اكتبلي نكتة عراقية جديدة تضحّك 😂",
                "شلون أنظم وقتي بين الدراسة والشغل؟ ⏱️",
                "ساعدني بكتابة بايو فخم للحساب ✨"
            ]
        },
        poet: {
            id: "poet",
            label: "✍️ شاعر وكاتب",
            badge: "شعر عراقي، رسائل ومعايدات",
            placeholder: "اطلب بيت شعر، رسالة حلوة، أو عبارة مرتبة...",
            system: "أنت شاعر وكاتب عراقي مبدع، تتقن الشعر الشعبي العراقي والفصيح والرسائل الراقية القصيرة المؤثرة. اكتب بإحساس صادق وألفاظ أنيقة بدون مبالغة مبتذلة.",
            quick: [
                "اكتبلي بيتين شعر عراقي شعبي حلوين 🌙",
                "اكتبلي رسالة صباحية لطيفة وقصيرة ☀️",
                "عبارة فخمة لملاحظة إنستگرام (أقل من 50 حرف) 💭",
                "رسالة تشجيع قبل الامتحان 💌"
            ]
        }
    };

    let aiMounted = false;
    let activePersona = localStorage.getItem("ai_persona_v11") || "tutor";
    let aiHistory = [];
    let aiBusy = false;
    let imgSendToChatMode = false;
    let lastGeneratedImgUrl = "";
    let lastSummaryText = "";

    function extendAdminAiOptions() {
        const sel = document.getElementById("admAiProvider");
        if (!sel || sel.querySelector('option[value="worker"]')) return;
        const opt1 = document.createElement("option");
        opt1.value = "worker";
        opt1.textContent = "نموذجك الخاص (رابط Cloudflare Worker الآمن ⚡)";
        const opt2 = document.createElement("option");
        opt2.value = "bridge";
        opt2.textContent = "نموذجك الخاص (جسر بايثون محمي عبر Firebase)";
        sel.insertBefore(opt1, sel.firstChild);
        sel.appendChild(opt2);
    }

    function loadAiHistory() {
        if (!me) return [];
        try {
            const raw = JSON.parse(localStorage.getItem("ai_hist_v11_" + me.username) || localStorage.getItem("ai_hist_v10_" + me.username) || "[]");
            return Array.isArray(raw) ? raw.slice(-30) : [];
        } catch { return []; }
    }

    function saveAiHistory() {
        if (!me) return;
        try { localStorage.setItem("ai_hist_v11_" + me.username, JSON.stringify(aiHistory.slice(-30))); } catch {}
    }

    function formatAiMarkdown(raw) {
        let s = escapeHTML(raw || "");
        s = s.replace(/```([\s\S]*?)```/g, (_, code) => `<pre class="ai-code-block">${code.trim()}</pre>`);
        s = s.replace(/`([^`]+)`/g, `<code class="msg-code-inline">$1</code>`);
        s = s.replace(/\*\*([^*]+)\*\*/g, `<strong>$1</strong>`);
        s = s.replace(/\*([^*\n]+)\*/g, `<em>$1</em>`);
        s = s.replace(/\n/g, "<br>");
        return s;
    }

    async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
        const ctrl = new AbortController();
        const tm = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
            return await fetch(url, { ...options, signal: ctrl.signal });
        } finally {
            clearTimeout(tm);
        }
    }

    // ==================== محرّك الاتصال الذكي المستقر (إعادة محاولة + Fallback) ====================
    async function callWorkerProvider(workerUrl, prompt, historyMsgs, systemPrompt) {
        const cleanUrl = (workerUrl || "").trim();
        if (!cleanUrl.startsWith("http")) throw new Error("no_worker_url");

        const bodyStr = JSON.stringify({
            prompt,
            systemPrompt,
            history: (historyMsgs || []).slice(-6)
        });

        let lastErr = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const res = await fetchWithTimeout(cleanUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: bodyStr
                }, 15000);
                if (!res.ok) throw new Error("worker_http_" + res.status);
                const data = await res.json();
                const txt = (data.reply || data.text || data.content || "").trim();
                if (txt) return txt;
                throw new Error("worker_empty");
            } catch (err) {
                lastErr = err;
                if (attempt < 2) await new Promise(r => setTimeout(r, 950));
            }
        }
        throw lastErr || new Error("worker_failed");
    }

    async function callGeminiProvider(apiKey, prompt, historyMsgs, systemPrompt) {
        if (!apiKey) throw new Error("no_gemini_key");
        const contents = [];
        (historyMsgs || []).slice(-8).forEach(m => {
            contents.push({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] });
        });
        contents.push({ role: "user", parts: [{ text: prompt }] });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
        const res = await fetchWithTimeout(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ system_instruction: { parts: [{ text: systemPrompt }] }, contents })
        }, 16000);
        if (!res.ok) throw new Error("gemini_http_" + res.status);
        const data = await res.json();
        const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!txt) throw new Error("gemini_empty");
        return txt;
    }

    async function callGroqProvider(apiKey, prompt, historyMsgs, systemPrompt) {
        if (!apiKey) throw new Error("no_groq_key");
        const messages = [{ role: "system", content: systemPrompt }];
        (historyMsgs || []).slice(-8).forEach(m => {
            messages.push({ role: m.role === "user" ? "user" : "assistant", content: m.text });
        });
        messages.push({ role: "user", content: prompt });

        const res = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages, temperature: 0.7 })
        }, 16000);
        if (!res.ok) throw new Error("groq_http_" + res.status);
        const data = await res.json();
        const txt = data?.choices?.[0]?.message?.content?.trim();
        if (!txt) throw new Error("groq_empty");
        return txt;
    }

    async function callFirebaseBridgeProvider(prompt, historyMsgs, systemPrompt) {
        const reqId = "air_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
        const reqRef = db.ref(`ai_bridge/requests/${reqId}`);
        const repRef = db.ref(`ai_bridge/replies/${reqId}`);
        await reqRef.set({
            id: reqId, user: me?.username || "guest", prompt, systemPrompt,
            history: (historyMsgs || []).slice(-6), ts: Date.now()
        });

        return new Promise((resolve, reject) => {
            const tm = setTimeout(() => {
                repRef.off(); reqRef.remove().catch(() => {});
                reject(new Error("bridge_timeout"));
            }, 16000);
            repRef.on("value", s => {
                const v = s.val();
                if (!v || !v.reply) return;
                clearTimeout(tm); repRef.off();
                reqRef.remove().catch(() => {}); repRef.remove().catch(() => {});
                resolve(String(v.reply).trim());
            });
        });
    }

    async function callFreePollinations(prompt, historyMsgs, systemPrompt) {
        const messages = [{ role: "system", content: systemPrompt }];
        (historyMsgs || []).slice(-5).forEach(m => {
            messages.push({ role: m.role === "user" ? "user" : "assistant", content: m.text });
        });
        messages.push({ role: "user", content: prompt });

        try {
            const res = await fetchWithTimeout("https://text.pollinations.ai/openai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: "openai", messages, seed: Math.floor(Math.random() * 99999) })
            }, 15000);
            if (res.ok) {
                const data = await res.json();
                const txt = data?.choices?.[0]?.message?.content?.trim();
                if (txt) return txt;
            }
        } catch {}

        const compact = `${systemPrompt}\nالسؤال: ${prompt}`;
        const r2 = await fetchWithTimeout(`https://text.pollinations.ai/${encodeURIComponent(compact)}?model=openai`, {}, 14000);
        if (!r2.ok) throw new Error("free_failed");
        const t2 = (await r2.text()).trim();
        if (!t2) throw new Error("free_empty");
        return t2;
    }

    async function askAiEngine(prompt, historyMsgs, systemPrompt) {
        const cfg = (typeof sysConfig !== "undefined" && sysConfig.ai) ? sysConfig.ai : { provider: "free", apiKey: "" };
        const prov = cfg.provider || "free";
        const key = (cfg.apiKey || "").trim();

        try {
            if (prov === "worker" && key) return await callWorkerProvider(key, prompt, historyMsgs, systemPrompt);
            if (prov === "gemini" && key) return await callGeminiProvider(key, prompt, historyMsgs, systemPrompt);
            if (prov === "groq" && key) return await callGroqProvider(key, prompt, historyMsgs, systemPrompt);
            if (prov === "bridge") return await callFirebaseBridgeProvider(prompt, historyMsgs, systemPrompt);
        } catch (err) {
            console.warn("Primary AI provider failed, switching to fallback:", err?.message || err);
        }

        return await callFreePollinations(prompt, historyMsgs, systemPrompt);
    }

    // ==================== 1. حقن ستايلات الذكاء الاصطناعي ====================
    function injectAiStyles() {
        if (document.getElementById("aiStylesV11")) return;
        const s = document.createElement("style");
        s.id = "aiStylesV11";
        s.textContent = `
            .ai-wrap { width: 100%; height: 100%; display: flex; flex-direction: column; background: radial-gradient(circle at top, rgba(139,92,246,0.14), var(--bg-main) 58%); overflow: hidden; }
            .ai-persona-bar { display: flex; gap: 6px; overflow-x: auto; padding: 8px 12px; border-bottom: 1px solid var(--border); background: var(--bg-panel); flex-shrink: 0; }
            .ai-p-pill { padding: 6px 12px; border-radius: 99px; border: 1px solid var(--border); background: var(--glass-inner); color: var(--text-dim); font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: 0.15s; }
            .ai-p-pill.active { background: var(--primary-grad); border-color: transparent; color: #fff; }
            .ai-messages { flex: 1; overflow-y: auto; padding: 14px 12px; display: flex; flex-direction: column; gap: 10px; max-width: 760px; width: 100%; margin: 0 auto; }
            .ai-bubble-row { display: flex; flex-direction: column; max-width: 88%; animation: msgIn 0.16s ease; }
            .ai-bubble-row.user { align-self: flex-start; }
            .ai-bubble-row.bot { align-self: flex-end; }
            .ai-bubble { padding: 10px 14px; border-radius: 18px; font-size: var(--msg-fs, 14px); line-height: 1.65; word-break: break-word; position: relative; }
            .ai-bubble-row.user .ai-bubble { background: var(--bubble-me); color: #fff; border-bottom-right-radius: 4px; }
            .ai-bubble-row.bot .ai-bubble { background: var(--bg-card); border: 1px solid var(--border-bright); color: var(--text); border-bottom-left-radius: 4px; }
            .ai-bubble-foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 6px; font-size: 10.5px; color: var(--text-dim); }
            .ai-copy-btn { border: 1px solid var(--border); background: var(--glass-inner); color: var(--accent); font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 8px; cursor: pointer; }
            .ai-code-block { background: #04070f; border: 1px solid var(--border); border-radius: 12px; padding: 10px; margin: 6px 0; overflow-x: auto; font-family: monospace; font-size: 12.5px; direction: ltr; text-align: left; color: #93c5fd; }
            .ai-welcome { margin: auto; text-align: center; max-width: 420px; padding: 14px; }
            .ai-quick-grid { display: flex; flex-direction: column; gap: 7px; margin-top: 14px; }
            .ai-quick-btn { width: 100%; padding: 10px 13px; border-radius: 14px; border: 1px solid var(--border); background: var(--bg-panel); color: var(--text); font-size: 13px; font-weight: 700; text-align: right; cursor: pointer; transition: 0.14s; }
            .ai-quick-btn:active { transform: scale(0.98); border-color: var(--accent); }
            .ai-input-bar { display: flex; align-items: flex-end; gap: 7px; padding: 9px 10px calc(9px + env(safe-area-inset-bottom, 0px)); background: var(--bg-panel); border-top: 1px solid var(--border); flex-shrink: 0; }
            .ai-input-bar textarea { flex: 1; background: var(--glass-inner); border: 1px solid var(--border); color: var(--text); padding: 9px 14px; border-radius: 20px; font-size: 14px; outline: none; min-height: 40px; max-height: 110px; resize: none; }
            .ai-input-bar textarea:focus { border-color: var(--accent); }
            .ai-img-preview-box { width: 100%; aspect-ratio: 1 / 1; max-height: 310px; border-radius: 18px; background: var(--glass-inner); border: 1px solid var(--border-bright); display: flex; align-items: center; justify-content: center; overflow: hidden; margin: 10px 0; }
            .ai-img-preview-box img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .ai-suggest-chip {
                width: 100%; text-align: right; padding: 12px 14px; border-radius: 15px;
                background: var(--bg-card); border: 1px solid var(--border-bright); color: var(--text);
                font-size: 13.5px; font-weight: 700; cursor: pointer; margin-bottom: 8px; line-height: 1.5;
                transition: transform 0.12s, border-color 0.15s;
            }
            .ai-suggest-chip:active { transform: scale(0.97); border-color: var(--accent); }
            .ai-summary-card {
                background: var(--glass-inner); border: 1px solid var(--border-bright);
                border-radius: 16px; padding: 14px; font-size: 14px; line-height: 1.75; color: var(--text);
                margin: 10px 0 12px;
            }
        `;
        document.head.appendChild(s);
    }

    // ==================== 2. النوافذ السفلية (التلخيص + اقتراح الرد + توليد الصور) ====================
    function injectAiModals() {
        if (!document.getElementById("aiImageModal")) {
            const m = document.createElement("div");
            m.id = "aiImageModal"; m.className = "modal-bg";
            m.onclick = e => { if (e.target === m) m.style.display = "none"; };
            m.innerHTML = `
                <div class="glass-card" style="max-width:420px; padding:18px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <h3 style="font-size:17px;">🎨 تخيّل صورة بالذكاء الاصطناعي</h3>
                        <button class="icon-btn" style="width:32px; height:32px;" onclick="document.getElementById('aiImageModal').style.display='none'">✕</button>
                    </div>
                    <p class="sub" style="margin-bottom:10px;">اكتب وصف الصورة (عربي أو إنجليزي) وتجهز خلال ثواني</p>
                    <div style="display:flex; gap:7px;">
                        <input type="text" id="aiImgPromptInp" class="input" placeholder="مثال: قمر بنفسجي فوق البحر بأسلوب سينمائي..." onkeydown="if(event.key==='Enter'){event.preventDefault(); window.generateAiImageNow();}">
                        <button class="btn" style="width:82px;" onclick="window.generateAiImageNow()">رسم ✨</button>
                    </div>
                    <div class="ai-img-preview-box" id="aiImgPreviewBox">
                        <span style="color:var(--text-dim); font-size:13px;">اكتب الوصف واضغط رسم 🎨</span>
                    </div>
                    <div id="aiImgActionBtns" style="display:none; gap:8px;">
                        <button class="btn btn-sm" id="aiImgSendChatBtn" style="flex:1;" onclick="window.sendGeneratedImgToActiveChat()">📤 إرسال بالمحادثة</button>
                        <button class="btn btn-sm btn-outline" style="flex:1;" onclick="window.saveGeneratedImgToSaved()">🔖 حفظ بالمحفوظة</button>
                    </div>
                </div>`;
            document.body.appendChild(m);
        }

        if (!document.getElementById("aiToolsSheet")) {
            const sh = document.createElement("div");
            sh.id = "aiToolsSheet"; sh.className = "modal-bg sheet-bg";
            sh.onclick = e => { if (e.target === sh) sh.style.display = "none"; };
            sh.innerHTML = `
                <div class="bottom-sheet" style="max-height:80dvh; display:flex; flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <h4 id="aiToolsSheetTitle">🤖 المساعد الذكي</h4>
                        <button class="icon-btn" style="width:32px; height:32px;" onclick="document.getElementById('aiToolsSheet').style.display='none'">✕</button>
                    </div>
                    <div id="aiToolsSheetBody" style="overflow-y:auto; max-height:62dvh;"></div>
                </div>`;
            document.body.appendChild(sh);
        }
    }

    function mountAiUI() {
        if (aiMounted) return;
        const container = document.getElementById("view-ai");
        if (!container) return;
        aiMounted = true;

        container.innerHTML = `
            <div class="ai-wrap">
                <div class="top-bar">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button class="icon-btn" style="width:34px; height:34px;" onclick="switchMainTab('chats')">➔</button>
                        <div>
                            <h3 style="font-size:15.5px;">🤖 مساعد المنصة AI</h3>
                            <div id="aiEngineSub" style="font-size:10.5px; color:var(--accent); font-weight:700;">جاهز للمساعدة</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-sm" onclick="window.openAiImageGenerator(false)">🎨 رسم صورة</button>
                        <button class="icon-btn danger" style="width:34px; height:34px;" title="مسح المحادثة" onclick="window.clearAiChatHistory()">🗑️</button>
                    </div>
                </div>

                <div class="ai-persona-bar" id="aiPersonaBar">
                    ${Object.values(PERSONAS).map(p => `<button type="button" class="ai-p-pill ${p.id === activePersona ? 'active' : ''}" data-ap="${p.id}" onclick="window.setAiPersona('${p.id}')">${p.label}</button>`).join("")}
                </div>

                <div class="ai-messages" id="aiMessagesList"></div>

                <div class="ai-input-bar">
                    <textarea id="aiMsgInput" rows="1" placeholder="${PERSONAS[activePersona]?.placeholder || 'اسأل أي شيء...'}" oninput="this.style.height='auto'; this.style.height=Math.min(this.scrollHeight,110)+'px';" onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault(); window.sendAiChatMessage();}"></textarea>
                    <button class="send-circle" id="aiSendBtn" onclick="window.sendAiChatMessage()" title="إرسال">
                        <svg viewBox="0 0 24 24" style="transform:rotate(180deg);"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    </button>
                </div>
            </div>`;
    }

    function updateEngineLabel() {
        const el = document.getElementById("aiEngineSub"); if (!el) return;
        const p = sysConfig?.ai?.provider || "free";
        const names = {
            worker: "⚡ متصل بالـ Worker الآمن",
            gemini: "⚡ متصل بـ Google Gemini",
            groq: "⚡ متصل بـ Groq Llama 3",
            bridge: "⚡ متصل بجسر بايثون المحمي",
            free: "✨ الوضع المجاني السريع"
        };
        el.innerText = names[p] || names.free;
    }

    function renderAiMessages() {
        const box = document.getElementById("aiMessagesList"); if (!box) return;
        const p = PERSONAS[activePersona] || PERSONAS.tutor;

        if (!aiHistory.length) {
            box.innerHTML = `
                <div class="ai-welcome">
                    <div style="font-size:48px; margin-bottom:6px;">🤖✨</div>
                    <h3 style="font-size:18px; margin-bottom:4px;">أهلاً ${escapeHTML(me?.name || "")}!</h3>
                    <p style="font-size:12.5px; color:var(--text-dim);">${p.badge} — وتگدر تناديني بأي شات بكتابة <b>@ai</b></p>
                    <div class="ai-quick-grid">
                        ${p.quick.map(q => `<button type="button" class="ai-quick-btn" onclick="window.sendAiQuickPrompt('${escapeHTML(q)}')">${escapeHTML(q)}</button>`).join("")}
                    </div>
                </div>`;
            return;
        }

        box.innerHTML = aiHistory.map((m, idx) => `
            <div class="ai-bubble-row ${m.role === 'user' ? 'user' : 'bot'}">
                <div class="ai-bubble">
                    ${m.imgUrl ? `<img src="${escapeHTML(m.imgUrl)}" class="msg-img" style="margin-bottom:6px;" onclick="openLightbox('${escapeHTML(m.imgUrl)}')">` : ""}
                    <div>${formatAiMarkdown(m.text)}</div>
                    <div class="ai-bubble-foot">
                        <span>${formatTime(m.ts)}</span>
                        ${m.role === "bot" ? `<button type="button" class="ai-copy-btn" onclick="window.copyAiReply(${idx})">📋 نسخ</button>` : ""}
                    </div>
                </div>
            </div>`).join("");

        if (aiBusy) {
            box.innerHTML += `<div class="ai-bubble-row bot"><div class="typing-bubble"><span>🤖 يفكر الآن</span><div class="typing-dots"><i></i><i></i><i></i></div></div></div>`;
        }
        box.scrollTop = box.scrollHeight;
    }

    // ==================== 3. أدوات الذكاء داخل الشات (✨ لخّصلي + 💡 اقترح رد) ====================
    function collectRecentChatTranscript(limit = 18) {
        if (typeof activeMsgsMap === "undefined" || !activeMsgsMap) return [];
        return Object.values(activeMsgsMap)
            .filter(m => m && m.type === "text" && m.content && !m.scratch && !m.isAi)
            .sort((a, b) => (a.ts || 0) - (b.ts || 0))
            .slice(-limit)
            .map(m => `${m.sender === me?.username ? (me?.name || "أنا") : (m.senderName || m.sender)}: ${String(m.content).slice(0, 220)}`);
    }

    window.aiSummarizeActiveChat = async function () {
        if (!activeRoomId) return;
        const lines = collectRecentChatTranscript(20);
        if (lines.length < 2) { showToast("ماكو رسائل نصية كافية للتلخيص حالياً"); return; }

        injectAiModals();
        const sh = document.getElementById("aiToolsSheet");
        document.getElementById("aiToolsSheetTitle").innerText = "✨ ملخّص المحادثة السريع";
        document.getElementById("aiToolsSheetBody").innerHTML = `<div style="text-align:center; padding:26px; color:var(--text-dim);">⏳ جاري تلخيص آخر ${lines.length} رسالة...</div>`;
        sh.style.display = "flex";

        try {
            const sys = "أنت مساعد ذكي تلخّص محادثات عربية وعراقية. لخّص الحوار التالي في 3 إلى 4 نقاط واضحة ومختصرة جداً بالعربية بدون مقدمات طويلة.";
            const reply = await askAiEngine("لخّص هذه المحادثة:\n" + lines.join("\n"), [], sys);
            lastSummaryText = reply;
            document.getElementById("aiToolsSheetBody").innerHTML = `
                <div class="ai-summary-card">${formatAiMarkdown(reply)}</div>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-sm" style="flex:1;" onclick="window.copyLastSummary()">📋 نسخ الملخص</button>
                    <button class="btn btn-sm btn-outline" style="flex:1;" onclick="window.sendLastSummaryToChat()">📤 إرساله هنا</button>
                </div>`;
            playRecvSound();
        } catch {
            document.getElementById("aiToolsSheetBody").innerHTML = `<div style="text-align:center; padding:24px; color:#fb7185;">تعذر التلخيص حالياً — تأكد من اتصال النت وحاول مرة ثانية</div>`;
        }
    };

    window.copyLastSummary = function () {
        if (!lastSummaryText) return;
        navigator.clipboard.writeText(lastSummaryText);
        showToast("تم نسخ الملخص 📋");
    };

    window.sendLastSummaryToChat = async function () {
        if (!lastSummaryText || !activeRoomId) return;
        document.getElementById("aiToolsSheet").style.display = "none";
        await pushMessageSafe("text", "✨ ملخص المحادثة:\n" + lastSummaryText, "✨ ملخص المحادثة", { isAi: true });
    };

    window.aiSuggestQuickReply = async function () {
        if (!activeRoomId) return;
        const lines = collectRecentChatTranscript(8);
        if (!lines.length) { showToast("ماكو رسائل سابقة لاقتراح رد عليها"); return; }

        injectAiModals();
        const sh = document.getElementById("aiToolsSheet");
        document.getElementById("aiToolsSheetTitle").innerText = "💡 اقتراحات رد ذكية";
        document.getElementById("aiToolsSheetBody").innerHTML = `<div style="text-align:center; padding:26px; color:var(--text-dim);">⏳ جاري تجهيز 3 ردود مناسبة...</div>`;
        sh.style.display = "flex";

        try {
            const sys = `أنت مساعد يقترح ردوداً قصيرة وطبيعية باللهجة العراقية الراقية للمستخدم (${me?.name || "المستخدم"}). أعطِ بالضبط 3 اقتراحات ردود مختلفة (رد لطيف، رد مختصر، رد مرح)، كل اقتراح في سطر مستقل يبدأ برقم مثل:
1- ...
2- ...
3- ...
بدون أي شرح إضافي.`;
            const raw = await askAiEngine("آخر رسائل المحادثة:\n" + lines.join("\n") + "\n\nاقترح 3 ردود مناسبة:", [], sys);
            const suggestions = raw
                .split(/\r?\n/)
                .map(l => l.replace(/^\s*(?:[1-3][\.\-\)\:]|[-•*])\s*/, "").replace(/^["«]|["»]$/g, "").trim())
                .filter(l => l.length >= 2)
                .slice(0, 3);

            if (!suggestions.length) throw new Error("no_suggestions");

            const labels = ["💜 رد لطيف", "⚡ رد مختصر", "😄 رد مرح"];
            const body = document.getElementById("aiToolsSheetBody");
            body.innerHTML = `<div style="font-size:12px; color:var(--text-dim); margin-bottom:10px; text-align:center;">اضغط على أي رد حتى ينكتب فوراً بخانة الرسالة:</div>`;
            suggestions.forEach((txt, i) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "ai-suggest-chip";
                btn.innerHTML = `<div style="font-size:11px; color:var(--accent); margin-bottom:3px;">${labels[i] || "✨ اقتراح"}</div><div>${escapeHTML(txt)}</div>`;
                btn.onclick = () => {
                    const inp = document.getElementById("msgInput");
                    if (inp) {
                        inp.value = txt;
                        if (typeof handleMsgInputResize === "function") handleMsgInputResize(inp);
                        inp.focus();
                    }
                    sh.style.display = "none";
                    if (typeof triggerHaptic === "function") triggerHaptic(10);
                };
                body.appendChild(btn);
            });
            playRecvSound();
        } catch {
            document.getElementById("aiToolsSheetBody").innerHTML = `<div style="text-align:center; padding:24px; color:#fb7185;">تعذر توليد الاقتراحات حالياً — جرّب مرة ثانية</div>`;
        }
    };

    // ==================== 4. أوامر محادثة الـ AI ومناداة @ai ====================
    window.setAiPersona = function (id) {
        if (!PERSONAS[id]) return;
        activePersona = id; localStorage.setItem("ai_persona_v11", id);
        document.querySelectorAll("#aiPersonaBar .ai-p-pill").forEach(b => b.classList.toggle("active", b.getAttribute("data-ap") === id));
        const inp = document.getElementById("aiMsgInput"); if (inp) inp.placeholder = PERSONAS[id].placeholder;
        renderAiMessages();
    };

    window.sendAiQuickPrompt = function (txt) {
        const inp = document.getElementById("aiMsgInput"); if (inp) inp.value = txt;
        window.sendAiChatMessage();
    };

    window.copyAiReply = function (idx) {
        const m = aiHistory[idx]; if (m?.text) { navigator.clipboard.writeText(m.text); showToast("تم نسخ الرد 📋"); }
    };

    window.clearAiChatHistory = function () {
        if (!confirm("مسح سجل محادثتك مع المساعد الذكي؟")) return;
        aiHistory = []; saveAiHistory(); renderAiMessages();
    };

    window.sendAiChatMessage = async function () {
        if (aiBusy) return;
        const inp = document.getElementById("aiMsgInput"), txt = (inp?.value || "").trim();
        if (!txt) return;

        inp.value = ""; inp.style.height = "40px";
        aiHistory.push({ role: "user", text: txt, ts: Date.now() });
        saveAiHistory(); aiBusy = true; renderAiMessages(); playSendSound();

        try {
            const p = PERSONAS[activePersona] || PERSONAS.tutor;
            const reply = await askAiEngine(txt, aiHistory.slice(0, -1), p.system);
            aiHistory.push({ role: "bot", text: reply, ts: Date.now() });
            saveAiHistory(); playRecvSound();
        } catch {
            aiHistory.push({ role: "bot", text: "عذراً، صار ضعف مؤقت بالاتصال. جرّب تدز سؤالك مرة ثانية بعد لحظة 🙏", ts: Date.now() });
        } finally {
            aiBusy = false; renderAiMessages();
        }
    };

    window.handleInChatAiCommand = async function (question) {
        if (!question || !activeRoomId) return;
        const targetRoomSnapshot = activeRoomId;

        if (/^(ارسم|صورة|تخيل|رسم|draw|imagine)\s+/i.test(question)) {
            const imgDesc = question.replace(/^(ارسم|صورة|تخيل|رسم|draw|imagine)\s+/i, "").trim();
            showToast("🎨 جاري رسم الصورة بالذكاء الاصطناعي...");
            const seed = Math.floor(Math.random() * 999999);
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(imgDesc)}?width=768&height=768&nologo=true&seed=${seed}`;
            if (activeRoomId === targetRoomSnapshot) await pushMessageSafe("image", url, `🎨 صورة AI: ${imgDesc.slice(0, 30)}`, { isAi: true });
            return;
        }

        showToast("🤖 مساعد AI جاي يكتب الرد...");
        try {
            const sys = "أنت مساعد ذكي داخل دردشة خاصة بين أصدقاء وطلاب سادس علمي في العراق. رد بذكاء ولباقة واختصار مفيد باللهجة العراقية الراقية أو العربية الفصحى حسب طبيعة السؤال.";
            const reply = await askAiEngine(question, [], sys);
            if (activeRoomId === targetRoomSnapshot) await pushMessageSafe("text", reply, "🤖 رد الذكاء الاصطناعي", { isAi: true });
        } catch { showToast("تعذر رد الذكاء الاصطناعي حالياً — تأكد من النت"); }
    };

    // ==================== 5. توليد الصور بالذكاء الاصطناعي ====================
    window.openAiImageGenerator = function (sendToChat = false) {
        injectAiModals();
        imgSendToChatMode = !!sendToChat; lastGeneratedImgUrl = "";
        document.getElementById("aiImgPromptInp").value = "";
        document.getElementById("aiImgPreviewBox").innerHTML = `<span style="color:var(--text-dim); font-size:13px;">اكتب الوصف واضغط رسم 🎨</span>`;
        document.getElementById("aiImgActionBtns").style.display = "none";
        document.getElementById("aiImgSendChatBtn").style.display = (activeRoomId && imgSendToChatMode) ? "inline-flex" : "none";
        document.getElementById("aiImageModal").style.display = "flex";
        setTimeout(() => document.getElementById("aiImgPromptInp").focus(), 80);
    };

    window.generateAiImageNow = function () {
        const prompt = (document.getElementById("aiImgPromptInp").value || "").trim();
        if (!prompt) { showToast("اكتب وصف الصورة أولاً 🎨"); return; }

        const box = document.getElementById("aiImgPreviewBox"), acts = document.getElementById("aiImgActionBtns");
        acts.style.display = "none";
        box.innerHTML = `<div class="skel-bubble tall" style="width:86%; height:86%; border-radius:16px;"></div>`;

        const seed = Math.floor(Math.random() * 999999);
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&nologo=true&seed=${seed}`;
        const img = new Image();
        img.onload = () => {
            lastGeneratedImgUrl = url; box.innerHTML = "";
            img.onclick = () => openLightbox(url); box.appendChild(img);
            acts.style.display = "flex";
            document.getElementById("aiImgSendChatBtn").style.display = activeRoomId ? "inline-flex" : "none";
            playSendSound();
        };
        img.onerror = () => { box.innerHTML = `<span style="color:#fb7185; font-size:13px;">تعذر توليد الصورة حالياً — جرّب وصفاً آخر</span>`; };
        img.src = url;
    };

    window.sendGeneratedImgToActiveChat = async function () {
        if (!lastGeneratedImgUrl || !activeRoomId) return;
        document.getElementById("aiImageModal").style.display = "none";
        await pushMessageSafe("image", lastGeneratedImgUrl, "🎨 صورة مولدة بالـ AI");
        showToast("تم إرسال الصورة بالمحادثة 🎨✨");
    };

    window.saveGeneratedImgToSaved = async function () {
        if (!lastGeneratedImgUrl || !me) return;
        const mId = "m_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
        await db.ref(`saved_msgs/${me.username}/${mId}`).set({
            id: mId, sender: me.username, senderName: me.name, type: "image",
            content: lastGeneratedImgUrl, seen: true, ts: Date.now()
        });
        document.getElementById("aiImageModal").style.display = "none";
        showToast("تم حفظ الصورة في الرسائل المحفوظة 🔖");
    };

    // ==================== 6. تسجيل القسم ====================
    injectAiStyles();
    injectAiModals();
    extendAdminAiOptions();

    window.AppModules = window.AppModules || {};
    window.AppModules.ai = function () {
        if (!me) return;
        mountAiUI();
        aiHistory = loadAiHistory();
        updateEngineLabel();
        switchMainTab("ai");
        renderAiMessages();
    };
})();
