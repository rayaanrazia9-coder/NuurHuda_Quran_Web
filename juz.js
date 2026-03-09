// Shared scroll features (Progress bar & Top button)
function initScrollFeatures() {
    window.onscroll = () => {
        let winScroll = document.documentElement.scrollTop;
        let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        
        const progressBar = document.getElementById("progress-bar");
        if (progressBar) progressBar.style.width = (winScroll / height) * 100 + "%";

        const topBtn = document.getElementById("scrollToTop");
        if (topBtn) topBtn.style.display = winScroll > 300 ? "block" : "none";
    };

    const topBtn = document.getElementById("scrollToTop");
    if (topBtn) {
        topBtn.onclick = () => window.scrollTo({top: 0, behavior: 'smooth'});
    }
}

let activeAudio = null;
let ayahsData = [];

async function loadReader() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('juz');
    if (!id) return;
    
    const title = document.getElementById('juzTitle');
    if (title) title.innerText = `JUZ ${id}`;

    try {
        const [arR, enR] = await Promise.all([
            fetch(`https://api.alquran.cloud/v1/juz/${id}/ar.alafasy`),
            fetch(`https://api.alquran.cloud/v1/juz/${id}/en.asad`)
        ]);
        const ar = await arR.json();
        const en = await enR.json();
        ayahsData = ar.data.ayahs;
        const enAyahs = en.data.ayahs;

        let html = "";
        ayahsData.forEach((ayah, i) => {
            html += `
                <div class="ayah-card" id="ayah-${i}">
                    <div style="font-size: 11px; color: var(--gold); margin-bottom: 10px; font-weight:700;">
                        ${ayah.surah.englishName} : ${ayah.numberInSurah}
                    </div>
                    <div class="arabic">${ayah.text}</div>
                    <p style="margin: 20px 0; opacity: 0.8;">${enAyahs[i].text}</p>
                    
                    <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                        <button class="btn" id="play-btn-${i}" onclick="playVerse(${i})">▶ PLAY</button>
                        <button class="btn" id="stop-btn-${i}" style="display:none; border-color: #ff4d4d; color: #ff4d4d;" onclick="stopAudio()">■ STOP</button>
                        <a href="${ayah.audio}" download="Juz${id}_Ayah${i}.mp3" class="btn" style="text-decoration:none;">↓ SAVE</a>
                        <button class="btn" onclick="navigator.clipboard.writeText('${ayah.text}')">📋 COPY</button>
                    </div>
                </div>
            `;
        });
        document.getElementById('quranContent').innerHTML = html;
    } catch (e) { 
        document.getElementById('quranContent').innerHTML = "<p style='text-align:center;'>Error loading content.</p>";
    }
}

function playVerse(index) {
    stopAudio(); // Reset any playing audio
    
    activeAudio = new Audio(ayahsData[index].audio);
    
    // Toggle buttons
    document.getElementById(`play-btn-${index}`).style.display = 'none';
    document.getElementById(`stop-btn-${index}`).style.display = 'inline-block';
    
    activeAudio.play();
    
    // AUTOPLAY NEXT LOGIC
    activeAudio.onended = () => {
        stopAudio();
        if(index + 1 < ayahsData.length) {
            playVerse(index + 1);
            // Smooth Scroll to the next verse
            document.getElementById(`ayah-${index + 1}`).scrollIntoView({behavior: 'smooth', block: 'center'});
        }
    };
}

function stopAudio() {
    if(activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
    }
    // Reset all buttons to "Play" state
    document.querySelectorAll('[id^="stop-btn-"]').forEach(btn => btn.style.display = 'none');
    document.querySelectorAll('[id^="play-btn-"]').forEach(btn => btn.style.display = 'inline-block');
}
