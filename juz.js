// =========================
// 🌙 THEME SYSTEM
// =========================
function applyTheme() {
    const isDark = localStorage.getItem('quranTheme') === 'alt';
    if (isDark) document.body.classList.add('alt-theme');
    updateToggleText(isDark);
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('alt-theme');
    const isAlt = body.classList.contains('alt-theme');
    localStorage.setItem('quranTheme', isAlt ? 'alt' : 'original');
    updateToggleText(isAlt);
}

function updateToggleText(isAlt) {
    const btn = document.getElementById('themeBtn');
    if (btn) btn.innerText = isAlt ? "Theme Light" : "Theme Dark";
}


// =========================
// 🧭 NAV ACTIVE LINK
// =========================
function setActiveNav() {
    const path = location.pathname.split(/[\\/]/).pop().toLowerCase();

    document.querySelectorAll("nav a").forEach(a => {
        const href = a.getAttribute("href") || "";
        if (href.toLowerCase() === path) {
            a.classList.add("active");
        }
    });
}


// =========================
// 📜 SCROLL UI (progress + top button)
// =========================
function initUI() {
    window.onscroll = () => {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        // progress bar
        const bar = document.getElementById("progress-bar");
        if (bar) bar.style.width = (winScroll / height) * 100 + "%";

        // scroll-to-top button
        const btn = document.getElementById("scrollToTop");
        if (btn) btn.style.display = winScroll > 400 ? "block" : "none";
    };

    const btn = document.getElementById("scrollToTop");
    if (btn) {
        btn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
    }
}


// =========================
// 📊 JUZ TRACKING SYSTEM
// =========================
let done = JSON.parse(localStorage.getItem("juzDone")) || [];
let lastRead = Number(localStorage.getItem("lastReadJuz")) || null;

function createJuzGrid() {
    const container = document.getElementById('juzContainer');
    if (!container) return; // only runs on juz page

    container.innerHTML = "";

    for (let i = 1; i <= 30; i++) {
        const box = document.createElement("div");
        box.className = "box";
        box.dataset.juz = i;

        const title = document.createElement("b");
        title.innerText = "Juz " + i;

        const btn = document.createElement("button");
        btn.className = "mark-btn";
        btn.innerText = done.includes(i) ? "Undo" : "✓";

        // mark or undo
        btn.onclick = (e) => {
            e.stopPropagation();
            toggleComplete(i, btn);
        };

        // open reader
        box.onclick = () => {
            localStorage.setItem("lastReadJuz", i);
            window.location.href = `reader.html?juz=${i}`;
        };

        box.appendChild(title);
        box.appendChild(btn);
        container.appendChild(box);
    }

    // scroll to last read juz
    setTimeout(() => {
        if (lastRead) {
            const el = document.querySelector(`[data-juz="${lastRead}"]`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, 200);

    updateUI();
    updateProgressText();
}

function toggleComplete(juz, btn) {
    const index = done.indexOf(juz);

    if (index === -1) {
        done.push(juz);
        btn.innerText = "Undo";
        celebrate(); // 🎉 celebration
    } else {
        done.splice(index, 1);
        btn.innerText = "✓";
    }

    localStorage.setItem("juzDone", JSON.stringify(done));
    updateUI();
    updateProgressText();
}

function updateUI() {
    lastRead = Number(localStorage.getItem("lastReadJuz")) || null;

    document.querySelectorAll(".box").forEach(box => {
        const num = Number(box.dataset.juz);

        box.classList.remove("completed", "last-read");

        if (done.includes(num)) box.classList.add("completed");
        if (num === lastRead) box.classList.add("last-read");
    });
}

function updateProgressText() {
    const el = document.getElementById("progressText");
    if (!el) return;
    el.innerText = `${done.length} / 30 Completed`;
}

function resetAll() {
    if (confirm("Reset all progress?")) {
        done = [];
        localStorage.removeItem("juzDone");
        createJuzGrid(); // rebuild grid to reset Undo buttons
        updateProgressText();
    }
}


// =========================
// 📖 QURAN READER
// =========================
let activeAudio = null;
let ayahsData = [];

async function loadReader() {
    const id = new URLSearchParams(window.location.search).get('juz');
    if (!id) return; // only runs on reader page

    const title = document.getElementById('juzTitle');
    if (title) title.innerText = "JUZ " + id;

    try {
        const [arR, enR] = await Promise.all([
            fetch(`https://api.alquran.cloud/v1/juz/${id}/ar.alafasy`),
            fetch(`https://api.alquran.cloud/v1/juz/${id}/en.asad`)
        ]);

        const ar = await arR.json();
        const en = await enR.json();

        ayahsData = ar.data.ayahs;

        let html = "";
        ayahsData.forEach((ayah, i) => {
            html += `
                <div class="ayah-card" id="ayah-${i}">
                    <div style="font-size:12px;color:var(--gold);margin-bottom:10px;font-weight:700;">
                        ${ayah.surah.englishName} : ${ayah.numberInSurah}
                    </div>
                    <div class="arabic">${ayah.text}</div>
                    <p style="margin:20px 0;opacity:0.8;font-style:italic;">
                        ${en.data.ayahs[i].text}
                    </p>
                    <div style="display:flex;justify-content:center;gap:10px;">
                        <button class="btn" id="play-${i}" onclick="playVerse(${i})">▶ PLAY</button>
                        <button class="btn" id="stop-${i}" style="display:none;color:red;border-color:red;" onclick="stopAudio()">■ STOP</button>
                        <a href="${ayah.audio}" download class="btn">↓ SAVE</a>
                    </div>
                </div>
            `;
        });

        const container = document.getElementById('quranContent');
        if (container) container.innerHTML = html;

    } catch (e) {
        console.error("Error loading Quran:", e);
    }
}

function playVerse(index) {
    stopAudio();
    activeAudio = new Audio(ayahsData[index].audio);

    document.getElementById(`play-${index}`).style.display = 'none';
    document.getElementById(`stop-${index}`).style.display = 'inline-block';

    activeAudio.play();
    activeAudio.onended = stopAudio;
}

function stopAudio() {
    if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
    }

    document.querySelectorAll('[id^="stop-"]').forEach(b => b.style.display = 'none');
    document.querySelectorAll('[id^="play-"]').forEach(b => b.style.display = 'inline-block');
}


// =========================
// 🎉 CELEBRATION
// =========================
function celebrate() {
    const box = document.getElementById("celebration");
    if (!box) return;

    box.classList.add("show");

    // hide after 2 sec
    setTimeout(() => box.classList.remove("show"), 2000);

    // confetti
    for (let i = 0; i < 30; i++) {
        const c = document.createElement("div");
        c.className = "confetti";
        c.style.left = Math.random() * 100 + "vw";
        c.style.background = ["gold", "#10b981", "#0ea5e9"][Math.floor(Math.random() * 3)];
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 2000);
    }
}

// =========================
// ▶ CONTINUE READING
// =========================
function continueReading() {
    if (lastRead) {
        window.location.href = `reader.html?juz=${lastRead}`;
    } else {
        alert("Start reading a Juz first!");
    }
}


// =========================
// 🚀 INIT (RUN EVERYTHING SAFELY)
// =========================
document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    setActiveNav();
    initUI();

    createJuzGrid(); // only runs on juz page
    loadReader();    // only runs on reader page
});
