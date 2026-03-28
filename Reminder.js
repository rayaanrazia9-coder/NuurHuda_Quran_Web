const input = document.getElementById("reminderInput");
const time = document.getElementById("reminderTime");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("reminderList");

addBtn.addEventListener("click", () => {
  if (input.value === "" || time.value === "") {
    alert("Fadlan buuxi reminder + time");
    return;
  }

  let li = document.createElement("li");

  li.innerHTML = `
    ${input.value} - ${time.value}
    <span class="delete">X</span>
  `;

  list.appendChild(li);

  input.value = "";
  time.value = "";

  li.querySelector(".delete").addEventListener("click", () => {
    li.remove();
  });
});

function toggleTheme() {
  document.body.classList.toggle("dark");
}