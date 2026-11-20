// ==================== ساحة الألعاب والتحديات الحية (XO + مبارزة الأسئلة + صراحة وجرأة) ====================
const QUIZ_BANKS = {
    study: {
        title: "📚 تحدي السادس العلمي",
        items: [
            { q: "ما هو ناتج مشتقة الدالة f(x) = sin(2x)؟", opts: ["2cos(2x)", "cos(2x)", "-2cos(2x)", "2sin(2x)"], ans: 0 },
            { q: "وحدة قياس السعة الكهربائية في النظام الدولي هي:", opts: ["أوم", "فاراد", "هنري", "تسلا"], ans: 1 },
            { q: "العدد التأكسدي للكروم (Cr) في المركب K2Cr2O7 هو:", opts: ["+3", "+4", "+6", "+7"], ans: 2 },
            { q: "أي عضية في الخلية تُعرف بـ «بيوت الطاقة»؟", opts: ["الرايبوسومات", "المايتوكوندريا", "جهاز كولجي", "النواة"], ans: 1 },
            { q: "ما قيمة المقدار (i^4) في الأعداد المركبة؟", opts: ["-1", "i", "1", "-i"], ans: 2 },
            { q: "القانون الذي يربط القوة الدافعة المحتثة بمعدل تغير الفيض المغناطيسي هو قانون:", opts: ["أوم", "فاراداي", "كولوم", "بويل"], ans: 1 },
            { q: "التفاعل الذي يمتص حرارة من المحيط تكون قيمة ΔH له:", opts: ["سالبة", "موجبة", "صفر", "متغيرة"], ans: 1 },
            { q: "ما هي قيمة ∫(1/x) dx؟", opts: ["x^2", "ln|x| + C", "e^x + C", "-1/x^2"], ans: 1 }
        ]
    },
    general: {
        title: "🧠 تحدي الثقافة والذكاء",
        items: [
            { q: "ما هي أكبر قارة في العالم من حيث المساحة؟", opts: ["أفريقيا", "آسيا", "أوروبا", "أمريكا الشمالية"], ans: 1 },
            { q: "كم عدد كواكب المجموعة الشمسية؟", opts: ["7", "8", "9", "10"], ans: 1 },
            { q: "أي دولة تُلقّب بـ «بلاد الرافدين»؟", opts: ["مصر", "العراق", "سوريا", "الأردن"], ans: 1 },
            { q: "ما هو أسرع حيوان بري على وجه الأرض؟", opts: ["الأسد", "الفهد", "النمر", "الغزال"], ans: 1 },
            { q: "كم دقيقة في 3 ساعات وربع؟", opts: ["185", "195", "205", "175"], ans: 1 },
            { q: "ما العنصر الكيميائي الذي رمزه (Au)؟", opts: ["الفضة", "الذهب", "النحاس", "الحديد"], ans: 1 },
            { q: "شيء كلما أخذت منه كبر أكثر، ما هو؟", opts: ["البحر", "الحفرة", "الجبل", "الظل"], ans: 1 },
            { q: "ما هي عاصمة اليابان؟", opts: ["سيول", "طوكيو", "بكين", "أوساكا"], ans: 1 }
        ]
    }
};

const TRUTH_OR_DARE = {
    truth: [
        "شنو أكثر شي فرحك هالأسبوع؟",
        "لو گدرت تسافر لأي مكان بالعالم هسة، وين تروح وية منو؟",
        "شنو أكثر صفة تحبها بالشخص اللي گدامك؟",
        "شنو أغرب موقف محرج صار وياك وما تنساه؟",
        "شنو حلمك الكبير بعد السادس العلمي؟",
        "لو تگدر تمسح ذكرى وحدة أو تعيد ذكرى وحدة، يا هي تختار؟",
        "منو أول شخص يخطر ببالك من تضوج؟",
        "شنو أكثر أكلة ما تمل منها أبداً؟"
    ],
    dare: [
        "دز بصمة صوتية هسة وگول بيها جملة حلوة بدون ما تضحك!",
        "غيّر حالتك (البايو) لمدة ساعة لجملة يختارها الطرف الثاني.",
        "انشر ستوري نصي سريع بكلمة وحدة يختارها صديقك.",
        "اكتب 3 صفات حلوة عن الشخص اللي تتحداه برسالة وحدة.",
        "دز صورة لآخر شي گدامك هسة (دفتر، كوب چاي، مكتب...).",
        "اتصل بالطرف الثاني 10 ثواني واسأله سؤال عشوائي وسد الخط!"
    ]
};

let allGamesMap = {};
let activeGameId = null;
let activeGameRef = null;
let soloQuizState = null;

function initGamesListeners() {
    if (!me) return;
    db.ref("games").on("value", snap => {
        allGamesMap = snap.val() || {};
        const myActive = Object.values(allGamesMap).filter(g => g && g.players && g.players[me.username] && g.status !== "finished");
        const hasTurn = myActive.some(g => (g.type === "xo" && g.turn === me.username) || (g.type === "quiz" && !g.finishedBy?.[me.username]));
        const dot = document.getElementById("gameInviteDot");
        if (dot) dot.classList.toggle("on", hasTurn);
        if (document.getElementById("view-games").classList.contains("active")) renderGamesHub();
    });
}

function refreshGamesHub() {
    renderGamesHub();
    showToast("تم تحديث ساحة الألعاب 🎮");
}

function getFriendsSelectOptions() {
    const list = Object.values(contactProfiles).filter(u => u && u.username !== me.username && !u.banned && !myBlocked[u.username]);
    if (list.length === 0) return `<option value="">أضف صديقاً أولاً من البحث (@)</option>`;
    return list.map(u => `<option value="${u.username}">${escapeHTML(u.name)} (${escapeHTML(getDisplayTag(u))})</option>`).join("");
}

function renderGamesHub() {
    const box = document.getElementById("gamesHubContainer");
    if (!box || !me) return;

    const myGames = Object.values(allGamesMap)
        .filter(g => g && g.players && g.players[me.username])
        .sort((a, b) => (b.updatedAt || b.ts || 0) - (a.updatedAt || a.ts || 0))
        .slice(0, 8);

    let html = "";

    // التحديات الجارية مع الأصدقاء
    if (myGames.length > 0) {
        html += `<div style="font-size:13px; font-weight:800; color:var(--accent); margin-bottom:8px;">🔥 تحدياتك الجارية والسابقة</div>`;
        myGames.forEach(g => {
            const oppKey = Object.keys(g.players).find(u => u !== me.username) || me.username;
            const oppName = contactProfiles[oppKey]?.name || g.playerNames?.[oppKey] || oppKey;
            const isXo = g.type === "xo";
            const statusTxt = g.status === "finished"
                ? (g.winner === "draw" ? "🤝 تعادل" : (g.winner === me.username ? "🏆 فزت بالتحدي!" : `🏅 فاز ${escapeHTML(oppName)}`))
                : (isXo ? (g.turn === me.username ? "⚡ دورك الآن!" : `بانتظار ${escapeHTML(oppName)}`) : "⚡ تحدي الأسئلة مفتوح");

            html += `
                <div class="game-invite-card">
                    <div>
                        <div style="font-weight:800; font-size:14px;">${isXo ? "⭕❌ تحدي XO" : "🧠 مبارزة الأسئلة"} ضد ${escapeHTML(oppName)}</div>
                        <div style="font-size:12px; color:var(--text-dim); margin-top:2px;">${statusTxt}</div>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-sm" onclick="openGameArena('${g.id}')">${g.status === "finished" ? "النتيجة" : "العب الآن"}</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteGameRoom('${g.id}')">✕</button>
                    </div>
                </div>`;
        });
    }

    // بطاقة 1: لعبة XO أونلاين
    html += `
        <div class="game-card">
            <h4>⭕❌ لعبة XO أونلاين (تحدي مباشر)</h4>
            <p>تحدَّ صديقك في جولة XO حية لحظة بلحظة — كل حركة تظهر عند الطرف الثاني فوراً!</p>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <select id="xoOppSelect" class="input" style="flex:1; min-width:160px;">${getFriendsSelectOptions()}</select>
                <button class="btn btn-sm" onclick="createXoMatch()">ابدأ التحدي ⚔️</button>
            </div>
        </div>`;

    // بطاقة 2: مبارزة الأسئلة (تحدي ثنائي أو فردي)
    html += `
        <div class="game-card">
            <h4>🧠 مبارزة الأسئلة والتحدي</h4>
            <p>اختر المجال وتحدَّ صديقك في 5 أسئلة سريعة لنعرف منو يحقق أعلى نقاط، أو العب تحدي فردي!</p>
            <div style="display:flex; gap:8px; margin-bottom:8px; flex-wrap:wrap;">
                <select id="quizCatSelect" class="input" style="flex:1; min-width:140px;">
                    <option value="study">📚 السادس العلمي</option>
                    <option value="general">🌍 ثقافة عامة وذكاء</option>
                </select>
                <select id="quizOppSelect" class="input" style="flex:1; min-width:140px;">${getFriendsSelectOptions()}</select>
            </div>
            <div style="display:flex; gap:8px;">
                <button class="btn btn-sm" style="flex:1;" onclick="createQuizDuel()">⚔️ تحدَّ صديقك</button>
                <button class="btn btn-sm btn-outline" style="flex:1;" onclick="startSoloQuiz()">🎯 تحدي فردي سريع</button>
            </div>
        </div>`;

    // بطاقة 3: صراحة وجرأة (جلسة أصدقاء)
    html += `
        <div class="game-card">
            <h4>🎲 لعبة صراحة أم جرأة</h4>
            <p>أسئلة صراحة وتحديات جرأة ممتعة تكدر تنسخها أو تدزها مباشرة بالمحادثة!</p>
            <div style="display:flex; gap:8px;">
                <button class="btn btn-sm" style="flex:1;" onclick="openTruthOrDare('truth')">💬 سؤال صراحة</button>
                <button class="btn btn-sm btn-gold" style="flex:1;" onclick="openTruthOrDare('dare')">🔥 تحدي جرأة</button>
            </div>
        </div>`;

    box.innerHTML = html;
}

// ==================== 1. لعبة XO أونلاين ====================
async function createXoMatch() {
    const opp = document.getElementById("xoOppSelect")?.value;
    if (!opp) { showToast("اختر صديقاً للتحدي أولاً"); return; }
    const id = "gm_xo_" + Date.now();
    const oppName = contactProfiles[opp]?.name || opp;
    await db.ref(`games/${id}`).set({
        id, type: "xo", status: "playing",
        board: ["", "", "", "", "", "", "", "", ""],
        players: { [me.username]: "X", [opp]: "O" },
        playerNames: { [me.username]: me.name, [opp]: oppName },
        turn: me.username, winner: "", ts: Date.now(), updatedAt: Date.now()
    });
    sendNotification(opp, `تحداك ${me.name} في لعبة XO أونلاين ⭕❌`, "🎮");
    openGameArena(id);
}

function checkXoWinner(b) {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a, c, d] of lines) {
        if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    return b.every(x => x) ? "draw" : "";
}

async function makeXoMove(gameId, idx) {
    const g = allGamesMap[gameId];
    if (!g || g.status === "finished" || g.turn !== me.username) return;
    const board = [...(g.board || ["","","","","","","","",""])];
    if (board[idx]) return;

    const myMark = g.players[me.username];
    const opp = Object.keys(g.players).find(u => u !== me.username);
    board[idx] = myMark;

    const res = checkXoWinner(board);
    const upd = { board, updatedAt: Date.now() };
    if (res === "draw") {
        upd.status = "finished"; upd.winner = "draw";
    } else if (res) {
        upd.status = "finished"; upd.winner = me.username;
        if (opp) sendNotification(opp, `انتهى تحدي XO بفوز ${me.name} 🏆`, "🎮");
    } else {
        upd.turn = opp || me.username;
    }
    playSendSound();
    await db.ref(`games/${gameId}`).update(upd);
}

// ==================== 2. مبارزة الأسئلة أونلاين + الفردي ====================
function pickRandomQuestions(catKey, count = 5) {
    const bank = QUIZ_BANKS[catKey] || QUIZ_BANKS.study;
    const arr = [...bank.items].sort(() => Math.random() - 0.5);
    return arr.slice(0, count);
}

async function createQuizDuel() {
    const opp = document.getElementById("quizOppSelect")?.value;
    const cat = document.getElementById("quizCatSelect")?.value || "study";
    if (!opp) { showToast("اختر صديقاً للمبارزة أولاً"); return; }

    const id = "gm_qz_" + Date.now();
    const oppName = contactProfiles[opp]?.name || opp;
    const questions = pickRandomQuestions(cat, 5);

    await db.ref(`games/${id}`).set({
        id, type: "quiz", cat, catTitle: QUIZ_BANKS[cat].title, status: "playing",
        questions,
        players: { [me.username]: true, [opp]: true },
        playerNames: { [me.username]: me.name, [opp]: oppName },
        scores: { [me.username]: 0, [opp]: 0 },
        progress: { [me.username]: 0, [opp]: 0 },
        finishedBy: {},
        winner: "", ts: Date.now(), updatedAt: Date.now()
    });
    sendNotification(opp, `تحداك ${me.name} في ${QUIZ_BANKS[cat].title} 🧠`, "⚔️");
    openGameArena(id);
}

async function answerDuelQuestion(gameId, qIdx, chosenIdx) {
    const g = allGamesMap[gameId];
    if (!g || g.finishedBy?.[me.username]) return;
    const curIdx = g.progress?.[me.username] || 0;
    if (qIdx !== curIdx) return;

    const q = g.questions[qIdx];
    const isRight = chosenIdx === q.ans;
    const newScore = (g.scores?.[me.username] || 0) + (isRight ? 1 : 0);
    const nextIdx = curIdx + 1;
    const isDone = nextIdx >= g.questions.length;

    showToast(isRight ? "✅ إجابة صحيحة! +1" : `❌ خطأ — الصحيح: ${q.opts[q.ans]}`);
    playTone(isRight ? 760 : 280, 0.14, "sine", 0.08);

    const upd = {
        [`scores/${me.username}`]: newScore,
        [`progress/${me.username}`]: nextIdx,
        updatedAt: Date.now()
    };
    if (isDone) upd[`finishedBy/${me.username}`] = true;

    await db.ref(`games/${gameId}`).update(upd);

    // إذا أنهى اللاعبان كل الأسئلة نحدد الفائز تلقائياً
    const freshSnap = await db.ref(`games/${gameId}`).once("value");
    const fg = freshSnap.val();
    if (fg && fg.players) {
        const pKeys = Object.keys(fg.players);
        if (pKeys.every(u => fg.finishedBy && fg.finishedBy[u])) {
            const [u1, u2] = pKeys;
            const s1 = fg.scores?.[u1] || 0, s2 = fg.scores?.[u2] || 0;
            const win = s1 === s2 ? "draw" : (s1 > s2 ? u1 : u2);
            await db.ref(`games/${gameId}`).update({ status: "finished", winner: win });
        }
    }
}

function startSoloQuiz() {
    const cat = document.getElementById("quizCatSelect")?.value || "study";
    soloQuizState = { catTitle: QUIZ_BANKS[cat].title, questions: pickRandomQuestions(cat, 5), idx: 0, score: 0 };
    document.getElementById("gameArenaModal").style.display = "flex";
    renderSoloQuizView();
}

function renderSoloQuizView() {
    const body = document.getElementById("gameArenaBody");
    const st = soloQuizState;
    if (!st) return;
    if (st.idx >= st.questions.length) {
        body.innerHTML = `
            <h3>🏆 انتهى التحدي الفردي!</h3>
            <p class="sub">${escapeHTML(st.catTitle)}</p>
            <div style="font-size:38px; font-weight:800; color:var(--accent); margin:12px 0;">${st.score} / ${st.questions.length}</div>
            <div style="display:flex; gap:8px;">
                <button class="btn btn-sm" style="flex:1;" onclick="startSoloQuiz()">🔄 جولة جديدة</button>
                <button class="btn btn-sm btn-outline" style="flex:1;" onclick="closeGameArena()">إغلاق</button>
            </div>`;
        return;
    }
    const q = st.questions[st.idx];
    body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span class="score-pill">${escapeHTML(st.catTitle)}</span>
            <span class="score-pill">سؤال ${st.idx + 1}/${st.questions.length} • النقاط: ${st.score}</span>
        </div>
        <h3 style="font-size:16.5px; line-height:1.6; margin:12px 0;">${escapeHTML(q.q)}</h3>
        <div class="quiz-opts">
            ${q.opts.map((o, i) => `<button class="quiz-opt" onclick="answerSoloQuiz(${i})">${escapeHTML(o)}</button>`).join("")}
        </div>
        <button class="btn btn-outline btn-sm" style="margin-top:14px;" onclick="closeGameArena()">إغلاق</button>`;
}

function answerSoloQuiz(i) {
    const st = soloQuizState; if (!st) return;
    const q = st.questions[st.idx];
    const ok = i === q.ans;
    if (ok) st.score++;
    playTone(ok ? 780 : 270, 0.14, "sine", 0.08);
    showToast(ok ? "✅ إجابة صحيحة!" : `❌ الإجابة الصحيحة: ${q.opts[q.ans]}`);
    st.idx++;
    renderSoloQuizView();
}

// ==================== 3. صراحة أم جرأة ====================
function openTruthOrDare(mode) {
    const list = TRUTH_OR_DARE[mode] || TRUTH_OR_DARE.truth;
    const pick = list[Math.floor(Math.random() * list.length)];
    const title = mode === "truth" ? "💬 سؤال صراحة" : "🔥 تحدي جرأة";
    const body = document.getElementById("gameArenaBody");
    body.innerHTML = `
        <h3>${title}</h3>
        <div style="background:var(--glass-inner); border:1px solid var(--border-bright); border-radius:18px; padding:22px 16px; margin:16px 0; font-size:17px; font-weight:800; line-height:1.7;">
            ${escapeHTML(pick)}
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-sm" style="flex:1;" onclick="openTruthOrDare('${mode}')">🎲 غيره</button>
            <button class="btn btn-sm btn-success" style="flex:1;" onclick="navigator.clipboard.writeText('${escapeHTML(title + ": " + pick)}'); showToast('تم النسخ — الصقه بالمحادثة 📋');">📋 نسخ للمحادثة</button>
        </div>
        <button class="btn btn-outline btn-sm" style="margin-top:10px; width:100%;" onclick="closeGameArena()">إغلاق</button>`;
    document.getElementById("gameArenaModal").style.display = "flex";
}

// ==================== 4. عارض ساحة اللعب الحية ====================
function openGameArena(gameId) {
    if (activeGameRef) { activeGameRef.off(); activeGameRef = null; }
    activeGameId = gameId;
    soloQuizState = null;
    document.getElementById("gameArenaModal").style.display = "flex";

    activeGameRef = db.ref(`games/${gameId}`);
    activeGameRef.on("value", snap => {
        const g = snap.val();
        if (!g) { closeGameArena(); return; }
        allGamesMap[gameId] = g;
        renderLiveGameArena(g);
    });
}

function renderLiveGameArena(g) {
    const body = document.getElementById("gameArenaBody");
    const opp = Object.keys(g.players || {}).find(u => u !== me.username) || me.username;
    const oppName = contactProfiles[opp]?.name || g.playerNames?.[opp] || opp;

    if (g.type === "xo") {
        const myMark = g.players[me.username];
        const board = g.board || ["","","","","","","","",""];
        let headerMsg = g.status === "finished"
            ? (g.winner === "draw" ? "🤝 انتهت بالتعادل!" : (g.winner === me.username ? "🏆 مبروك! أنت الفائز!" : `🏅 فاز ${escapeHTML(oppName)}`))
            : (g.turn === me.username ? `⚡ دورك الآن (${myMark})` : `⏳ بانتظار حركة ${escapeHTML(oppName)}...`);

        body.innerHTML = `
            <h3>⭕❌ تحدي XO ضد ${escapeHTML(oppName)}</h3>
            <p class="sub" style="color:var(--accent); font-weight:800; margin-top:4px;">${headerMsg}</p>
            <div class="xo-board">
                ${board.map((c, idx) => `<button class="xo-cell ${c === 'X' ? 'x' : (c === 'O' ? 'o' : '')}" onclick="makeXoMove('${g.id}', ${idx})">${c || ""}</button>`).join("")}
            </div>
            <div style="display:flex; gap:8px;">
                ${g.status === "finished" ? `<button class="btn btn-sm" style="flex:1;" onclick="rematchXo('${g.id}')">🔄 جولة ثانية</button>` : ""}
                <button class="btn btn-outline btn-sm" style="flex:1;" onclick="closeGameArena()">إغلاق</button>
            </div>`;
    } else if (g.type === "quiz") {
        const myScore = g.scores?.[me.username] || 0;
        const oppScore = g.scores?.[opp] || 0;
        const myProg = g.progress?.[me.username] || 0;
        const total = (g.questions || []).length;
        const iFinished = !!g.finishedBy?.[me.username];

        let inner = `
            <h3>${escapeHTML(g.catTitle || "🧠 مبارزة الأسئلة")}</h3>
            <div style="display:flex; justify-content:center; gap:8px; margin:10px 0; flex-wrap:wrap;">
                <span class="score-pill">أنت: ${myScore}/${total}</span>
                <span class="score-pill">${escapeHTML(oppName)}: ${oppScore}/${total}</span>
            </div>`;

        if (g.status === "finished") {
            const res = g.winner === "draw" ? "🤝 تعادل!" : (g.winner === me.username ? "🏆 فزت بالمبارزة!" : `🏅 فاز ${escapeHTML(oppName)}!`);
            inner += `<div style="font-size:22px; font-weight:800; color:var(--accent); margin:16px 0;">${res}</div>`;
        } else if (iFinished) {
            inner += `<div style="padding:18px 10px; color:var(--text-dim); font-size:14px;">✅ أنهيت أسئلتك بنتيجة <b>${myScore}/${total}</b>.<br>بانتظار إكمال ${escapeHTML(oppName)} لأسئلته...</div>`;
        } else {
            const q = g.questions[myProg];
            inner += `
                <div style="font-size:12px; color:var(--accent); font-weight:700; margin-bottom:6px;">سؤال ${myProg + 1} من ${total}</div>
                <h4 style="font-size:16px; line-height:1.6; margin-bottom:10px;">${escapeHTML(q.q)}</h4>
                <div class="quiz-opts">
                    ${q.opts.map((o, i) => `<button class="quiz-opt" onclick="answerDuelQuestion('${g.id}', ${myProg}, ${i})">${escapeHTML(o)}</button>`).join("")}
                </div>`;
        }
        inner += `<button class="btn btn-outline btn-sm" style="margin-top:14px; width:100%;" onclick="closeGameArena()">إغلاق</button>`;
        body.innerHTML = inner;
    }
}

async function rematchXo(gameId) {
    const g = allGamesMap[gameId];
    if (!g) return;
    await db.ref(`games/${gameId}`).update({
        board: ["","","","","","","","",""],
        status: "playing", winner: "", turn: me.username, updatedAt: Date.now()
    });
}

async function deleteGameRoom(gameId) {
    await db.ref(`games/${gameId}`).remove();
    showToast("تم حذف التحدي");
}

function closeGameArena() {
    if (activeGameRef) { activeGameRef.off(); activeGameRef = null; }
    activeGameId = null;
    soloQuizState = null;
    document.getElementById("gameArenaModal").style.display = "none";
}
