document.addEventListener('DOMContentLoaded',()=>{
  const desktop = document.getElementById('desktop')
  const dock = document.getElementById('dock')
  const template = document.getElementById('window-template')
  const systemButton = document.getElementById('system-button')
  const systemMenu = document.getElementById('system-menu')
  const languageSelect = document.getElementById('language-select')
  const zStack = {top:1}
  const state = {
    lang: localStorage.getItem('webos_lang') || 'it'
  }
  const locales = {
    it: {
      title: 'WebOS – Demo',
      topbarSubtitle: 'Sistema demo',
      systemMenuButton: 'Sistema',
      languageLabel: 'Lingua del sistema',
      notes: 'Note',
      calculator: 'Calcolatrice',
      files: 'File',
      notesTitle: 'Note',
      calculatorTitle: 'Calcolatrice',
      filesTitle: 'File',
      notesPlaceholder: 'Scrivi qui...',
      filesText: 'Vista file semplice, pronta per essere estesa.',
      resultError: 'Errore'
    },
    en: {
      title: 'WebOS - Demo',
      topbarSubtitle: 'Demo system',
      systemMenuButton: 'System',
      languageLabel: 'System language',
      notes: 'Notes',
      calculator: 'Calculator',
      files: 'Files',
      notesTitle: 'Notes',
      calculatorTitle: 'Calculator',
      filesTitle: 'Files',
      notesPlaceholder: 'Write here...',
      filesText: 'Simple file view, ready to expand.',
      resultError: 'Error'
    },
    es: {
      title: 'WebOS - Demo',
      topbarSubtitle: 'Sistema de demo',
      systemMenuButton: 'Sistema',
      languageLabel: 'Idioma del sistema',
      notes: 'Notas',
      calculator: 'Calculadora',
      files: 'Archivos',
      notesTitle: 'Notas',
      calculatorTitle: 'Calculadora',
      filesTitle: 'Archivos',
      notesPlaceholder: 'Escribe aquí...',
      filesText: 'Vista simple de archivos, lista para crecer.',
      resultError: 'Error'
    }
  }

  const appMeta = {
    notes: {titleKey: 'notesTitle', builder: notesApp},
    calc: {titleKey: 'calculatorTitle', builder: calcApp},
    files: {titleKey: 'filesTitle', builder: filesApp}
  }

  let dragState = null

  function t(key){
    return locales[state.lang]?.[key] || locales.it[key] || key
  }

  function applyLanguage(){
    document.documentElement.lang = state.lang
    document.title = t('title')
    document.querySelectorAll('[data-i18n]').forEach(element => {
      element.textContent = t(element.dataset.i18n)
    })
    document.querySelectorAll('.icon').forEach(icon => {
      const labelKey = icon.dataset.labelKey
      const titleKey = icon.dataset.titleKey
      const labelElement = icon.querySelector('.label')
      const nextLabel = t(labelKey)
      labelElement.textContent = nextLabel
      icon.title = nextLabel
      const image = icon.querySelector('img')
      if (image) {
        image.alt = nextLabel
      }
    })
    document.querySelectorAll('.dock-item').forEach(item => {
      item.textContent = t(item.dataset.labelKey)
    })
    document.querySelectorAll('.window').forEach(win => {
      const appKey = win.dataset.app
      const meta = appMeta[appKey]
      if (meta) {
        win.querySelector('.title').textContent = t(meta.titleKey)
      }
      const notesField = win.querySelector('.notes-textarea')
      if (notesField) {
        notesField.placeholder = t('notesPlaceholder')
      }
    })
    languageSelect.value = state.lang
  }

  function openWindow(appKey){
    const meta = appMeta[appKey]
    if (!meta) return null
    const node = template.content.firstElementChild.cloneNode(true)
    node.dataset.app = appKey
    node.style.left = '80px'
    node.style.top = '96px'
    node.querySelector('.title').textContent = t(meta.titleKey)
    node.querySelector('.content').appendChild(meta.builder())
    node.style.zIndex = ++zStack.top
    document.body.appendChild(node)

    makeDraggable(node)

    node.querySelector('.close').addEventListener('click',()=>node.remove())
    node.querySelector('.min').addEventListener('click',()=>node.classList.add('minimized'))
    node.addEventListener('mousedown',()=> node.style.zIndex = ++zStack.top)
    return node
  }

  function makeDraggable(win){
    const bar = win.querySelector('.titlebar')
    bar.addEventListener('mousedown',(e)=>{
      dragState = {
        win,
        offsetX: e.clientX - win.offsetLeft,
        offsetY: e.clientY - win.offsetTop
      }
      bar.style.cursor = 'grabbing'
    })
  }

  function notesApp(){
    const wrap = document.createElement('div')
    wrap.style.height = '100%'
    const ta = document.createElement('textarea')
    ta.className='notes-textarea'
    ta.placeholder=t('notesPlaceholder')
    ta.value = localStorage.getItem('webos_notes')||''
    ta.addEventListener('input',()=> localStorage.setItem('webos_notes',ta.value))
    wrap.appendChild(ta)
    return wrap
  }

  function calcApp(){
    const wrap = document.createElement('div')
    const display = document.createElement('input')
    display.style.width='100%'
    display.style.fontSize='20px'
    display.style.marginBottom='12px'
    display.style.padding='12px 14px'
    display.style.borderRadius='14px'
    display.style.border='1px solid rgba(255,255,255,0.12)'
    display.style.background='rgba(255,255,255,0.08)'
    display.style.color='inherit'
    display.readOnly=true
    display.value=''
    wrap.appendChild(display)
    const grid = document.createElement('div')
    grid.className='calc-grid'
    const labels = ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+']
    labels.forEach(label => {
      const button = document.createElement('button')
      button.className='calc-btn'
      button.textContent = label
      button.addEventListener('click',()=>{
        if(label==='='){
          try{
            display.value = String(Function(`'use strict'; return (${display.value})`)())
          }catch(error){
            display.value = t('resultError')
          }
        } else {
          display.value += label
        }
      })
      grid.appendChild(button)
    })
    wrap.appendChild(grid)
    return wrap
  }

  function filesApp(){
    const wrap = document.createElement('div')
    const card = document.createElement('div')
    card.style.padding = '16px'
    card.style.borderRadius = '18px'
    card.style.background = 'rgba(255,255,255,0.08)'
    card.style.border = '1px solid rgba(255,255,255,0.12)'
    card.style.lineHeight = '1.6'
    card.textContent = t('filesText')
    wrap.appendChild(card)
    return wrap
  }

  function openApp(appKey){
    openWindow(appKey)
  }

  desktop.addEventListener('dblclick',event=>{
    const icon = event.target.closest('.icon')
    if(!icon) return
    openApp(icon.dataset.app)
  })

  dock.addEventListener('click',event=>{
    const dockItem = event.target.closest('.dock-item')
    if(!dockItem) return
    openApp(dockItem.dataset.app)
  })

  systemButton.addEventListener('click',event=>{
    event.stopPropagation()
    systemMenu.classList.toggle('open')
    systemMenu.setAttribute('aria-hidden', String(!systemMenu.classList.contains('open')))
  })

  languageSelect.addEventListener('change',()=>{
    state.lang = languageSelect.value
    localStorage.setItem('webos_lang', state.lang)
    applyLanguage()
  })

  document.addEventListener('click',event=>{
    if (!systemMenu.contains(event.target) && event.target !== systemButton) {
      systemMenu.classList.remove('open')
      systemMenu.setAttribute('aria-hidden', 'true')
    }
  })

  window.addEventListener('mousemove',event=>{
    if(!dragState) return
    dragState.win.style.left = `${event.clientX - dragState.offsetX}px`
    dragState.win.style.top = `${event.clientY - dragState.offsetY}px`
  })

  window.addEventListener('mouseup',()=>{
    if (!dragState) return
    dragState.win.querySelector('.titlebar').style.cursor = 'grab'
    dragState = null
  })

  window.addEventListener('keydown',event=>{
    if(event.ctrlKey && event.key.toLowerCase()==='n'){
      openApp('notes')
    }
    if(event.key === 'Escape'){
      systemMenu.classList.remove('open')
      systemMenu.setAttribute('aria-hidden', 'true')
    }
  })

  applyLanguage()
})