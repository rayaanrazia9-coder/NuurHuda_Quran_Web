const input=document.getElementById("reminderInput")
const time=document.getElementById("reminderTime")
const addBtn=document.getElementById("addBtn")
const list=document.getElementById("reminderList")

let reminders=JSON.parse(localStorage.getItem("reminders"))||[]

function save(){
localStorage.setItem("reminders",JSON.stringify(reminders))
}

function show(){

list.innerHTML=""

reminders.forEach((r,i)=>{

let li=document.createElement("li")

li.innerHTML=`
<span>${r.text} <span class="time">${r.time}</span></span>
<span class="delete" onclick="del(${i})">✖</span>
`

list.appendChild(li)

})

}

function add(){

if(input.value==""||time.value==""){
alert("Write reminder and time")
return
}

reminders.push({
text:input.value,
time:time.value
})

input.value=""
time.value=""

save()
show()

}

function del(i){

reminders.splice(i,1)

save()
show()

}

addBtn.addEventListener("click",add)

show()