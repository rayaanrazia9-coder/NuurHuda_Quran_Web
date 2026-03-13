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

    function render() {
        container.innerHTML = '';
        const pct = Math.round((progress.length / 30) * 100);
        document.getElementById('progressBar').style.width = pct + '%';
        document.getElementById('percent').textContent = pct + '%';

        if (state.view === 'list') {
            label.textContent = `Weekly Overview - Week ${state.week}`;
            const slice = items.slice((state.week - 1) * 7, state.week * 7);
            slice.forEach(it => {
                const isDone = progress.includes(it.day);
                const div = document.createElement('div');
                div.className = `list-row ${isDone ? 'completed' : ''}`;
                div.innerHTML = `
                    <div style="text-align:left">
                        <small style="color:var(--gold); font-weight:700">DAY ${it.day}</small>
                        <div style="font-size:18px">Juz ${it.juz}</div>
                    </div>
                    <button class="btn" onclick="mark(${it.day})">${isDone ? '✓ Done' : 'Mark Complete'}</button>
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
                const isDone = progress.includes(it.day);
                const box = document.createElement('div');
                box.className = `box ${isDone ? 'completed' : ''}`;
                box.onclick = () => mark(it.day);
                box.innerHTML = `<b>${it.day}</b><small>Juz ${it.juz}</small>`;
                grid.appendChild(box);
            });
            container.appendChild(grid);
            document.getElementById('prev').style.display = 'none';
            document.getElementById('next').style.display = 'none';
        }
    }

    window.mark = (day) => {
        const idx = progress.indexOf(day);
        idx > -1 ? progress.splice(idx, 1) : progress.push(day);
        localStorage.setItem('nuur_juz_progress', JSON.stringify(progress));
        render();
    };

    document.getElementById('viewList').onclick = () => { state.view = 'list'; render(); };
    document.getElementById('viewCalendar').onclick = () => { state.view = 'calendar'; render(); };
    document.getElementById('prev').onclick = () => { if(state.week > 1) { state.week--; render(); }};
    document.getElementById('next').onclick = () => { if(state.week < 5) { state.week++; render(); }};
    document.getElementById('reset').onclick = () => { if(confirm("Reset all 30 days?")) { progress = []; localStorage.removeItem('nuur_juz_progress'); render(); }};
    document.getElementById('year').textContent = new Date().getFullYear();

    render();
})();
