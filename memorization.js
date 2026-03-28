// Theme Toggle Logic
function toggleTheme() {
    const isAlt = document.body.classList.toggle('alt-theme');
    localStorage.setItem('nuurhuda_theme', isAlt ? 'black' : 'green');
    document.getElementById('themeBtn').textContent = isAlt ? "Light Theme" : "Dark Theme";
}

// Initial Theme Sync
if (localStorage.getItem('nuurhuda_theme') === 'black') {
    document.body.classList.add('alt-theme');
    document.getElementById('themeBtn').textContent = "Light Theme";
}

// Core Data State
let memorizationTasks = JSON.parse(localStorage.getItem('nuur_memo_tasks')) || [];
let surahs = [];

// DOM Elements
const surahSelect = document.getElementById('surahSelect');
const ayahStart = document.getElementById('ayahStart');
const ayahEnd = document.getElementById('ayahEnd');
const dailyTargetInput = document.getElementById('dailyTarget');
const startBtn = document.getElementById('startBtn');
const activeTasksContainer = document.getElementById('activeTasksContainer');
const revisionTasksContainer = document.getElementById('revisionTasksContainer');
const congratsModal = document.getElementById('congratsModal');
const congratsMessage = document.getElementById('congratsMessage');
const closeCongrats = document.getElementById('closeCongrats');
const todayCount = document.getElementById('todayCount');
const totalMemorized = document.getElementById('totalMemorized');
const goalBar = document.getElementById('goalBar');
const goalPercent = document.getElementById('goalPercent');

// Initialize App
async function init() {
    await fetchSurahs();
    renderTasks();
    updateGlobalStats();
}

// Fetch Surahs from API
async function fetchSurahs() {
    try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        surahs = data.data;
        
        surahs.forEach(surah => {
            const option = document.createElement('option');
            option.value = surah.number;
            option.textContent = `${surah.number}. ${surah.englishName} (${surah.name})`;
            surahSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching surahs:', error);
    }
}

// Update Ayah Range based on Surah selection
surahSelect.addEventListener('change', () => {
    const selectedSurah = surahs.find(s => s.number == surahSelect.value);
    if (selectedSurah) {
        ayahStart.value = 1;
        ayahEnd.value = selectedSurah.numberOfAyahs;
        ayahEnd.max = selectedSurah.numberOfAyahs;
    }
});

// Start New Task
startBtn.addEventListener('click', () => {
    const surahNum = surahSelect.value;
    const start = parseInt(ayahStart.value);
    const end = parseInt(ayahEnd.value);
    const target = parseInt(dailyTargetInput.value);

    if (!surahNum || !start || !end || !target) {
        alert('Please fill all fields');
        return;
    }

    const selectedSurah = surahs.find(s => s.number == surahNum);
    
    const newTask = {
        id: Date.now(),
        surahName: selectedSurah.englishName,
        surahNumber: selectedSurah.number,
        ayahStart: start,
        ayahEnd: end,
        dailyTarget: target,
        currentAyah: start - 1, // Last completed ayah
        totalAyahs: end - start + 1,
        status: 'Not Started', // Not Started, In Progress, Completed
        history: [], // [{date: 'YYYY-MM-DD', count: 5}]
        createdAt: new Date().toISOString()
    };

    memorizationTasks.push(newTask);
    saveTasks();
    renderTasks();
    
    // Clear form
    surahSelect.value = '';
    ayahStart.value = '';
    ayahEnd.value = '';
});

// Save Tasks to LocalStorage and Backend
function saveTasks() {
    localStorage.setItem('nuur_memo_tasks', JSON.stringify(memorizationTasks));
    updateGlobalStats();
    
    // Backend Sync (Optional but requested)
    fetch('/api/memorization/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: memorizationTasks })
    }).catch(err => console.log('Backend sync failed, using local only.'));
}

// Render Tasks
function renderTasks() {
    activeTasksContainer.innerHTML = '';
    revisionTasksContainer.innerHTML = '';

    const activeTasks = memorizationTasks.filter(t => t.status !== 'Completed');
    const completedTasks = memorizationTasks.filter(t => t.status === 'Completed');

    if (activeTasks.length === 0) {
        activeTasksContainer.innerHTML = '<div class="empty-state"><p>No active tasks. Start a new one above! 📖</p></div>';
    } else {
        activeTasks.forEach(task => {
            const card = createTaskCard(task);
            activeTasksContainer.appendChild(card);
        });
    }

    if (completedTasks.length === 0) {
        revisionTasksContainer.innerHTML = '<div class="empty-state"><p>Complete a task to see it here for revision. 🌟</p></div>';
    } else {
        completedTasks.forEach(task => {
            const card = createTaskCard(task, true);
            revisionTasksContainer.appendChild(card);
        });
    }
}

// Create Task Card DOM
function createTaskCard(task, isRevision = false) {
    const div = document.createElement('div');
    div.className = `task-card ${task.status === 'Completed' ? 'completed' : ''}`;
    
    const completedCount = task.currentAyah - task.ayahStart + 1;
    const progressPct = Math.min(Math.round((completedCount / task.totalAyahs) * 100), 100);
    
    const statusClass = task.status.toLowerCase().replace(/\s+/g, '-');
    const statusIcon = task.status === 'Completed' ? '✅' : (task.status === 'In Progress' ? '🟡' : '🔒');

    div.innerHTML = `
        <div class="task-header">
            <div>
                <h3 class="task-title">${task.surahName}</h3>
                <span class="task-range">Ayah ${task.ayahStart} - ${task.ayahEnd}</span>
            </div>
            <span class="status-badge status-${statusClass}">${statusIcon} ${task.status}</span>
        </div>
        <div class="progress-section">
            <div class="progress-info">
                <span>Progress</span>
                <span>${progressPct}% (${completedCount}/${task.totalAyahs})</span>
            </div>
            <div class="progress-track">
                <div class="progress-fill" style="width: ${progressPct}%"></div>
            </div>
        </div>
        <div class="task-actions">
            ${!isRevision ? `
                <button class="btn btn-sm btn-primary" onclick="markAyah(${task.id})">
                    <i class="fas fa-check"></i> Mark Ayah ${task.currentAyah + 1}
                </button>
                <button class="btn btn-sm btn-outline" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            ` : `
                <button class="btn btn-sm btn-outline" onclick="markAyah(${task.id}, true)">
                    <i class="fas fa-redo"></i> Revise Again
                </button>
                <button class="btn btn-sm btn-outline" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            `}
        </div>
    `;
    return div;
}

// Mark Ayah as Memorized
window.markAyah = (taskId, isRevision = false) => {
    const task = memorizationTasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.currentAyah < task.ayahEnd) {
        task.currentAyah++;
        task.status = 'In Progress';
        
        // Track daily progress
        const today = new Date().toISOString().split('T')[0];
        const historyEntry = task.history.find(h => h.date === today);
        if (historyEntry) {
            historyEntry.count++;
        } else {
            task.history.push({ date: today, count: 1 });
        }

        if (task.currentAyah === task.ayahEnd) {
            task.status = 'Completed';
            showCongrats(task.surahName);
        }
        
        saveTasks();
        renderTasks();
    } else if (isRevision) {
        // Reset for revision if needed
        task.currentAyah = task.ayahStart - 1;
        task.status = 'In Progress';
        saveTasks();
        renderTasks();
    }
};

// Delete Task
window.deleteTask = (taskId) => {
    if (confirm('Are you sure you want to delete this task?')) {
        memorizationTasks = memorizationTasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
    }
};

// Update Global Stats
function updateGlobalStats() {
    const today = new Date().toISOString().split('T')[0];
    let dailyCount = 0;
    let totalAyahs = 0;
    let dailyTarget = 5; // Default if no tasks

    memorizationTasks.forEach(task => {
        const historyEntry = task.history.find(h => h.date === today);
        if (historyEntry) dailyCount += historyEntry.count;
        
        totalAyahs += (task.currentAyah - task.ayahStart + 1);
        if (task.status !== 'Completed') dailyTarget = task.dailyTarget;
    });

    todayCount.textContent = dailyCount;
    totalMemorized.textContent = totalAyahs;
    
    const goalPct = Math.min(Math.round((dailyCount / dailyTarget) * 100), 100);
    goalBar.style.width = goalPct + '%';
    goalPercent.textContent = goalPct + '%';
}

// Congratulation Modal
function showCongrats(surahName) {
    congratsMessage.textContent = `MashaAllah! You have successfully completed memorizing Surah ${surahName}. May Allah reward your efforts! 🎉`;
    congratsModal.style.display = 'flex';
}

closeCongrats.onclick = () => {
    congratsModal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target === congratsModal) {
        congratsModal.style.display = 'none';
    }
};

document.getElementById('year').textContent = new Date().getFullYear();

// Start
init();
