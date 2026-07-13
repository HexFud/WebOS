document.addEventListener('DOMContentLoaded',()=>{
  const desktop = document.getElementById('desktop')
  const template = document.getElementById('window-template')
  const zStack = {top:1}

  function openWindow(id, title, contentNode){
    const node = template.content.firstElementChild.cloneNode(true)
    node.style.left = '80px'
    node.style.top = '80px'
    node.querySelector('.title').textContent = title
    node.querySelector('.content').appendChild(contentNode)
    node.style.zIndex = ++zStack.top
    document.body.appendChild(node)

    makeDraggable(node)

    node.querySelector('.close').addEventListener('click',()=>node.remove())
    node.addEventListener('mousedown',()=> node.style.zIndex=++zStack.top)
    return node
  }

  function makeDraggable(win){
    const bar = win.querySelector('.titlebar')
    let offsetX=0,offsetY=0,dragging=false
    bar.addEventListener('mousedown',(e)=>{
      dragging=true
      offsetX = e.clientX - win.offsetLeft
      offsetY = e.clientY - win.offsetTop
      bar.style.cursor='grabbing'
    })
    window.addEventListener('mousemove',(e)=>{
      if(!dragging) return
      win.style.left = (e.clientX - offsetX) + 'px'
      win.style.top = (e.clientY - offsetY) + 'px'
    })
    window.addEventListener('mouseup',()=>{dragging=false;bar.style.cursor='grab'})
  }

  // Apps
  function notesApp(){
    const wrap = document.createElement('div')
    const ta = document.createElement('textarea')
    ta.className='notes-textarea'
    ta.placeholder='Scrivi qui...'
    ta.value = localStorage.getItem('webos_notes')||''
    ta.addEventListener('input',()=> localStorage.setItem('webos_notes',ta.value))
    wrap.appendChild(ta)
    return wrap
  }

  function calcApp(){
    const wrap = document.createElement('div')
    const display = document.createElement('input')
    display.style.width='100%';display.style.fontSize='20px';display.readOnly=true
    display.value=''
    wrap.appendChild(display)
    const grid = document.createElement('div')
    grid.className='calc-grid'
    const labels = ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+']
    labels.forEach(l=>{
      const b=document.createElement('button')
      b.className='calc-btn'
      b.textContent=l
      b.addEventListener('click',()=>{
        if(l==='='){ try{display.value=String(eval(display.value))}catch(e){display.value='Err'}}
        else display.value += l
      })
      grid.appendChild(b)
    })
    wrap.appendChild(grid)
    return wrap
  }

  // eventi icone
  desktop.addEventListener('dblclick',e=>{
    const icon = e.target.closest('.icon')
    if(!icon) return
    const app = icon.dataset.app
    if(app==='notes') openWindow('notes','Notes',notesApp())
    if(app==='calc') openWindow('calc','Calcolatrice',calcApp())
    if(app==='files'){
      const n = document.createElement('div')
      n.textContent = 'Semplice vista file (demo)'
      openWindow('files','File',n)
    }
  })

  // dock click
  document.getElementById('dock').addEventListener('click',e=>{
    const d = e.target.closest('.dock-item')
    if(!d) return
    const app = d.dataset.app
    if(app==='notes') openWindow('notes','Notes',notesApp())
    if(app==='calc') openWindow('calc','Calcolatrice',calcApp())
  })

  // keyboard: Ctrl+N apre Notes
  window.addEventListener('keydown',e=>{if(e.ctrlKey && e.key.toLowerCase()==='n'){openWindow('notes','Notes',notesApp())}})

})
