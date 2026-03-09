const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => [...r.querySelectorAll(s)];

function setActiveNav() {
  const path = location.pathname.split(/[\\/]/).pop().toLowerCase() || "index.html";
  qsa("nav a").forEach(a => {
    const href = a.getAttribute("href") || "";
    if ((path === "index.html" && href.endsWith("index.html")) || (href && path === href.toLowerCase())) {
      a.classList.add("active");
    }
  });
}

function initTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  if (saved === "dark") document.body.classList.add("dark");
  const toggle = qs("#themeToggle");
  if (toggle) {
    const sync = () => {
      const isDark = document.body.classList.contains("dark");
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.querySelector("span.mode").textContent = isDark ? "Dark" : "Light";
    };
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
      sync();
    });
    sync();
  }
}

function smoothAnchorScroll() {
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    const el = qs(`#${CSS.escape(id)}`);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  });
}

function keyboardShortcuts() {
  document.addEventListener("keydown", e => {
    if (e.key.toLowerCase() === "d" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const btn = qs("#themeToggle");
      if (btn) btn.click();
    }
  });
}

function initNotifications() {
  const btn = qs("#enableNotifications");
  if (!btn) return;
  const update = (state) => {
    btn.disabled = state === "granted";
    btn.textContent = state === "granted" ? "Notifications Enabled" : "Enable Prayer Reminder";
  };
  update(Notification.permission);
  btn.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      alert("Notifications are not supported in this browser.");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      update(perm);
      if (perm === "granted") {
        new Notification("Prayer Reminder", { body: "Prayer times are precious. Remember your Salah.", silent: false });
      }
    } catch {}
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  initTheme();
  smoothAnchorScroll();
  keyboardShortcuts();
  initNotifications();
});

