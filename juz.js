function applyTheme() {
    const isDark = localStorage.getItem('quranTheme') === 'alt';
    if (isDark) {
        document.body.classList.add('alt-theme');
    }
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
    if (btn) {
        btn.innerText = isAlt ? "Light Theme" : "Dark Theme";
    }
}

function initUI() {
    window.onscroll = () => {
        let winScroll = document.documentElement.scrollTop;
        let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        document.getElementById("progress-bar").style.width = (winScroll / height) * 100 + "%";
        document.getElementById("scrollToTop").style.display = winScroll > 400 ? "block" : "none";
    };
    document.getElementById("scrollToTop").onclick = () => window.scrollTo({top: 0, behavior: 'smooth'});
}

let activeAudio = null;
let ayahsData = [];

async function loadReader() {
    const id = new URLSearchParams(window.location.search).get('juz');
    if (!id) return;
    document.getElementById('juzTitle').innerText = `JUZ ${id}`;

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
                    <div style="font-size: 12px; color: var(--gold); margin-bottom:10px; font-weight:700;">${ayah.surah.englishName} : ${ayah.numberInSurah}</div>
                    <div class="arabic">${ayah.text}</div>
                    <p style="margin: 20px 0; opacity: 0.8; font-style: italic;">${en.data.ayahs[i].text}</p>
                    <div style="display: flex; justify-content: center; gap: 10px;">
                        <button class="btn" id="play-${i}" onclick="playVerse(${i})">▶ PLAY</button>
                        <button class="btn" id="stop-${i}" style="display:none; border-color: #ff4444; color: #ff4444;" onclick="stopAudio()">■ STOP</button>
                        <a href="${ayah.audio}" download class="btn">↓ SAVE</a>
                    </div>
                </div>
            `;
        });
        document.getElementById('quranContent').innerHTML = html;
    } catch (e) { console.error(e); }
}

function playVerse(index) {
    stopAudio();
    activeAudio = new Audio(ayahsData[index].audio);
    document.getElementById(`play-${index}`).style.display = 'none';
    document.getElementById(`stop-${index}`).style.display = 'inline-block';
    activeAudio.play();
    activeAudio.onended = () => {
        stopAudio();
        if(index + 1 < ayahsData.length) {
            playVerse(index + 1);
            document.getElementById(`ayah-${index + 1}`).scrollIntoView({behavior: 'smooth', block: 'center'});
        }
    };
}

function stopAudio() {
    if(activeAudio) { activeAudio.pause(); activeAudio.currentTime = 0; }
    document.querySelectorAll('[id^="stop-"]').forEach(b => b.style.display = 'none');
    document.querySelectorAll('[id^="play-"]').forEach(b => b.style.display = 'inline-block');
}
