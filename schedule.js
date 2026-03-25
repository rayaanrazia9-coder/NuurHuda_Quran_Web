function toggleTheme() {
    const isAlt = document.body.classList.toggle('alt-theme');
    localStorage.setItem('nuurhuda_theme', isAlt ? 'black' : 'green');
    document.getElementById('themeBtn').textContent = isAlt ? "Light Theme" : "Dark Theme";
}

(function() {
    // Sync Theme on Load
    if(localStorage.getItem('nuurhuda_theme') === 'black') {
        document.body.classList.add('alt-theme');
        document.getElementById('themeBtn').textContent = "Light Theme";
    }

    let progress = JSON.parse(localStorage.getItem('nuur_juz_progress')) || [];
    let state = { view: 'list', week: 1 };
    const items = Array.from({length: 30}, (_, i) => ({ day: i + 1, juz: i + 1 }));

    const container = document.getElementById('scheduleContainer');
    const label = document.getElementById('viewLabel');

    const motivationalMessages = [
        "The best among you are those who learn the Quran and teach it. ✨",
        "Keep going! You're building a beautiful habit. 📖",
        "Every letter you read is a ten-fold reward. 🤲",
        "The Quran will be an intercessor for its companions on the Day of Resurrection. 🌟",
        "You're doing great! May Allah make it easy for you. ❤️",
        "Halfway there! Your dedication is inspiring. 🎉",
        "Almost finished! The light of the Quran is with you. 🕯️",
        "MashaAllah! You've completed your 30-day journey. 🏆"
    ];

    function calculateStreak() {
        if (progress.length === 0) return 0;
        const sorted = [...progress].sort((a, b) => a - b);
        let streak = 0;
        let currentStreak = 0;
        
        // Simplified streak: consecutive days in the 30-day plan
        for (let i = 1; i <= 30; i++) {
            if (progress.includes(i)) {
                currentStreak++;
                streak = Math.max(streak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }
        return streak;
    }

    function updateStats() {
        const completed = progress.length;
        const remaining = 30 - completed;
        const streak = calculateStreak();
        const pct = Math.round((completed / 30) * 100);

        document.getElementById('daysCompleted').textContent = completed;
        document.getElementById('daysRemaining').textContent = remaining;
        document.getElementById('currentStreak').textContent = streak;
        document.getElementById('progressBar').style.width = pct + '%';
        document.getElementById('percent').textContent = pct + '%';

        // Update motivational message
        const msgIndex = Math.min(Math.floor(pct / 15), motivationalMessages.length - 1);
        const msgElement = document.getElementById('motivationalMessage');
        if (pct === 100) {
            msgElement.textContent = motivationalMessages[motivationalMessages.length - 1];
        } else if (pct > 0) {
            msgElement.textContent = `You're on Juz ${Math.max(...progress) + 1}! ${motivationalMessages[msgIndex]}`;
        } else {
            msgElement.textContent = motivationalMessages[0];
        }
    }

    function getJuzState(day) {
        if (progress.includes(day)) return 'completed';
        const lastCompleted = progress.length > 0 ? Math.max(...progress) : 0;
        if (day === lastCompleted + 1) return 'current';
        if (day > lastCompleted + 1) return 'locked';
        return 'pending';
    }

    function getStatusIcon(state) {
        switch(state) {
            case 'completed': return '✅';
            case 'current': return '🟡';
            case 'locked': return '🔒';
            default: return '📖';
        }
    }

    function render() {
        container.innerHTML = '';
        updateStats();

        if (state.view === 'list') {
            label.textContent = `Weekly Overview - Week ${state.week}`;
            const slice = items.slice((state.week - 1) * 7, state.week * 7);
            slice.forEach(it => {
                const itemState = getJuzState(it.day);
                const isDone = itemState === 'completed';
                const div = document.createElement('div');
                div.className = `list-row ${itemState}`;
                div.innerHTML = `
                    <div style="text-align:left">
                        <small style="color:var(--gold); font-weight:700">DAY ${it.day} ${getStatusIcon(itemState)}</small>
                        <div style="font-size:18px">Juz ${it.juz}</div>
                    </div>
                    <button class="btn ${itemState === 'current' ? 'btn-primary' : ''}" 
                            onclick="mark(${it.day})" 
                            ${itemState === 'locked' ? 'disabled' : ''}>
                        ${isDone ? '✓ Done' : (itemState === 'current' ? 'Read Now' : 'Mark Complete')}
                    </button>
                `;
                container.appendChild(div);
            });
            document.getElementById('prev').style.display = 'inline-block';
            document.getElementById('next').style.display = 'inline-block';
        } else {
            label.textContent = `Full 30-Day Schedule`;
            const grid = document.createElement('div');
            grid.className = 'box-grid';
            items.forEach(it => {
                const itemState = getJuzState(it.day);
                const box = document.createElement('div');
                box.className = `box ${itemState}`;
                if (itemState !== 'locked') {
                    box.onclick = () => mark(it.day);
                }
                box.innerHTML = `
                    <b>${it.day}</b>
                    <small>Juz ${it.juz}</small>
                    <div class="status-icon">${getStatusIcon(itemState)}</div>
                `;
                grid.appendChild(box);
            });
            container.appendChild(grid);
            document.getElementById('prev').style.display = 'none';
            document.getElementById('next').style.display = 'none';
        }
    }

    window.mark = (day) => {
        const idx = progress.indexOf(day);
        if (idx > -1) {
            progress.splice(idx, 1);
        } else {
            // Only allow marking the next available day or any previous day
            const lastCompleted = progress.length > 0 ? Math.max(...progress) : 0;
            if (day <= lastCompleted + 1) {
                progress.push(day);
            }
        }
        localStorage.setItem('nuur_juz_progress', JSON.stringify(progress));
        render();
    };

    document.getElementById('continueReading').onclick = () => {
        const nextDay = progress.length > 0 ? Math.max(...progress) + 1 : 1;
        if (nextDay <= 30) {
            state.view = 'list';
            state.week = Math.ceil(nextDay / 7);
            render();
            // Optional: highlight the current day or scroll to it
        }
    };

    document.getElementById('viewList').onclick = () => { state.view = 'list'; render(); };
    document.getElementById('viewCalendar').onclick = () => { state.view = 'calendar'; render(); };
    document.getElementById('prev').onclick = () => { if(state.week > 1) { state.week--; render(); }};
    document.getElementById('next').onclick = () => { if(state.week < 5) { state.week++; render(); }};

    // Modal logic
    const modal = document.getElementById('resetModal');
    const resetBtn = document.getElementById('reset');
    const cancelBtn = document.getElementById('cancelReset');
    const confirmBtn = document.getElementById('confirmReset');

    resetBtn.onclick = () => {
        modal.style.display = 'flex';
    };

    cancelBtn.onclick = () => {
        modal.style.display = 'none';
    };

    confirmBtn.onclick = () => {
        progress = [];
        localStorage.removeItem('nuur_juz_progress');
        modal.style.display = 'none';
        render();
    };

    // Close modal when clicking outside
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    document.getElementById('year').textContent = new Date().getFullYear();

    render();
})();
