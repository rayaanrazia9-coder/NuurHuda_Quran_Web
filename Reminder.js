// 1. Soo qaado xogta kaydsan
let reminders = JSON.parse(localStorage.getItem('myReminders')) || [];
let memos = JSON.parse(localStorage.getItem('myMemos')) || [];

window.onload = () => {
    displayReminders();
    displayMemos();
    setInterval(checkAlerts, 1000); // Hubi saacadda ilbidhiqsi walba
};

// --- REMINDER FUNCTIONS ---
function saveReminder() {
    const text = document.getElementById('remInput').value;
    const time = document.getElementById('remTime').value;
    if (!text || !time) return alert("Fadlan buuxi!");

    reminders.push({ text, time, notified: false });
    localStorage.setItem('myReminders', JSON.stringify(reminders));
    displayReminders();
    document.getElementById('remInput').value = "";
}

function displayReminders() {
    const list = document.getElementById('reminderList');
    list.innerHTML = "";
    reminders.forEach((r, index) => {
        const li = document.createElement('li');
        li.className = "item";
        li.innerHTML = `<span><b>${r.time}</b> - ${r.text}</span>
                        <button class="del-btn" onclick="deleteRem(${index})">X</button>`;
        list.appendChild(li);
    });
}

function deleteRem(index) {
    reminders.splice(index, 1);
    localStorage.setItem('myReminders', JSON.stringify(reminders));
    displayReminders();
}

// --- MEMORIZATION FUNCTIONS ---
function saveMemo() {
    const surah = document.getElementById('memoSurah').value;
    const pages = document.getElementById('memoPages').value;
    if (!surah || !pages) return alert("Fadlan buuxi xifdiga!");

    memos.push({ surah, pages });
    localStorage.setItem('myMemos', JSON.stringify(memos));
    displayMemos();
    document.getElementById('memoSurah').value = "";
    document.getElementById('memoPages').value = "";
}

function displayMemos() {
    const list = document.getElementById('memoList');
    if (!list) return;
    list.innerHTML = "";
    memos.forEach((m, index) => {
        const li = document.createElement('li');
        li.className = "item";
        li.innerHTML = `<span>📖 ${m.surah} (${m.pages} bog)</span>
                        <button class="del-btn" onclick="deleteMemo(${index})">X</button>`;
        list.appendChild(li);
    });
}

function deleteMemo(index) {
    memos.splice(index, 1);
    localStorage.setItem('myMemos', JSON.stringify(memos));
    displayMemos();
}

// --- ALERT & POPUP ---
function checkAlerts() {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                        now.getMinutes().toString().padStart(2, '0');

    reminders.forEach((r, index) => {
        if (r.time === currentTime && !r.notified) {
            document.getElementById('notifSound').play().catch(() => {});
            alert(`🔔 XASUUSIN: ${r.text}`);
            reminders[index].notified = true;
            localStorage.setItem('myReminders', JSON.stringify(reminders));
        }
    });
}