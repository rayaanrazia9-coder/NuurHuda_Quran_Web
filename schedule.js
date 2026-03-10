;(function(){
  var items = Array.from({length:30},function(_,i){
    return { day:i+1, juz:i+1 }
  })

  var state = {
    view:'list',
    week:1
  }

  var container = document.getElementById('scheduleContainer')
  var label = document.getElementById('viewLabel')
  var btnList = document.getElementById('viewList')
  var btnCal = document.getElementById('viewCalendar')
  var btnPrev = document.getElementById('prev')
  var btnNext = document.getElementById('next')
  var btnReset = document.getElementById('reset')
  var yearEl = document.getElementById('year')
  if(yearEl){ yearEl.textContent = new Date().getFullYear() }

  function setActiveButtons(){
    if(state.view==='list'){
      btnList.classList.remove('secondary')
      btnCal.classList.add('secondary')
    }else{
      btnCal.classList.remove('secondary')
      btnList.classList.add('secondary')
    }
  }

  function render(){
    setActiveButtons()
    if(state.view==='list'){
      var start = (state.week-1)*7
      var slice = items.slice(start,start+7)
      label.textContent = 'View: List • Week ' + state.week
      var html = ['<div class="list">']
      for(var i=0;i<slice.length;i++){
        var it = slice[i]
        html.push('<div class="row">')
        html.push('<div class="day">Day '+it.day+'</div>')
        html.push('<div class="juz">Juz '+it.juz+'</div>')
        html.push('<div class="action"><button class="btn secondary" data-day="'+it.day+'">Mark</button></div>')
        html.push('</div>')
      }
      html.push('</div>')
      container.innerHTML = html.join('')
      btnPrev.disabled = state.week===1
      btnNext.disabled = state.week===5
    }else{
      label.textContent = 'View: Calendar'
      var html2 = ['<div class="grid">']
      for(var d=1;d<=35;d++){
        if(d>30){
          html2.push('<div class="cell blank"></div>')
          continue
        }
        html2.push('<div class="cell">')
        html2.push('<h4>Day '+d+'</h4>')
        html2.push('<p>Juz '+d+'</p>')
        html2.push('<span class="badge">Read</span>')
        html2.push('</div>')
      }
      html2.push('</div>')
      container.innerHTML = html2.join('')
      btnPrev.disabled = true
      btnNext.disabled = true
    }
  }

  btnList.addEventListener('click',function(){
    state.view='list'
    render()
  })
  btnCal.addEventListener('click',function(){
    state.view='calendar'
    render()
  })
  btnPrev.addEventListener('click',function(){
    if(state.week>1){ state.week--; render() }
  })
  btnNext.addEventListener('click',function(){
    if(state.week<5){ state.week++; render() }
  })
  btnReset.addEventListener('click',function(){
    state.view='list'; state.week=1; render()
  })

  render()
})()
