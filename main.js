const addBtn = document.getElementById("addBtn");
const reminderInput = document.getElementById("reminderInput");
const reminderTime = document.getElementById("reminderTime");
const reminderList = document.getElementById("reminderList");

let reminders = JSON.parse(localStorage.getItem("reminders")) || [];

function saveReminders(){
localStorage.setItem("reminders", JSON.stringify(reminders));
}

function displayReminders(){
reminderList.innerHTML="";

reminders.forEach((reminder,index)=>{

let li=document.createElement("li");

li.innerHTML=`
<div>
<strong>${reminder.text}</strong>
<div class="time">${reminder.time}</div>
</div>

<span class="delete" onclick="deleteReminder(${index})">❌</span>
`;

reminderList.appendChild(li);

});

}

function addReminder(){

let text = reminderInput.value;
let time = reminderTime.value;

if(text===""){
alert("Please write reminder");
return;
}

reminders.push({
text:text,
time:time
});

saveReminders();
displayReminders();

reminderInput.value="";
reminderTime.value="";
}

function deleteReminder(index){
reminders.splice(index,1);
saveReminders();
displayReminders();
}

addBtn.addEventListener("click",addReminder);

displayReminders();