'use strict'

import Socket from './socket.js'
import Chara from './chara.js'
import color from './color.js'
import Editor from './editor.js'
import remove from './remove.js'
import block from './block.js'
import gameover from './gameover.js'

const socket = new Socket('login')

const app = document.getElementById('app')
const list = document.createElement('div')
list.classList.add('login')
app.appendChild(list)

const charaList = new Map()

const myEditor = new Editor()

const otherEditor = new Editor()
otherEditor.freez()
otherEditor.addClass = 'editor-mini'

socket.on('callCode', (socketId, type) => {
  socket.private('receveCode', socketId, sessionStorage.getItem('code'), type)
})

socket.on('receveCode', (code, type) => {
  if (type === 'main') {
    myEditor.value = code
  } else {
    otherEditor.value = code
  }
})

export default new class Main {
  constructor() {
    this._group
    this._editorId

    myEditor.addEventListener('keydown', this.toggleEvent())
    window.addEventListener('keydown', this.toggleEvent())
  }



  async init() {
    myEditor.toggle()
    myEditor.value = sessionStorage.getItem('code') || ''


    await socket.connect()
    this._group = socket.id
    this.openSocket()
    this._myButton = this.createCharaButton()

    this.startButton()

    socket.broad('send', socket.id)
    socket.broad('addChara', sessionStorage.getItem('myColor'), socket.id)
  }


  async guestStart(socketId) {
    myEditor.toggle()
    socket.private('callCode', socketId, socket.id, 'main')
    myEditor.addEventListener('save', this.codeSaveEvent())

    this._group = socketId

    socket.disconnect((disconnectId) => {
      if (disconnectId === socketId) { gameover.end() }
    })

    await socket.connect()
    this.openSocket()
    socket.broad('send', socket.id)
  }


  startButton() {
    const hexColor = `#${sessionStorage.getItem('myColor')}`

    const button = document.createElement('button')
    button.textContent = '開始する'
    button.classList.add('startButton')
    button.style.backgroundColor = hexColor
    button.style.color = color.hexToTextColor(hexColor)
    app.appendChild(button)

    const beforeSaveEvent = this.beforeSaveEvent()

    button.addEventListener('click', this.startEvent(button, beforeSaveEvent))
    myEditor.addEventListener('save', beforeSaveEvent)
  }


  beforeSaveEvent() {
    return () => {
      const code = myEditor.value
      sessionStorage.setItem('code', code)
      socket.broad('codeUpdate', code, socket.id)
    }
  }


  startEvent(button, beforeSaveEvent) {
    return () => {
      remove.animation(button)
      myEditor.hide()
      myEditor.addEventListener('save', beforeSaveEvent)

      const chara = new Chara({ color: sessionStorage.getItem('myColor') }, socket.id)
      chara.playerChara(chara, button)

      myEditor.addEventListener('save', this.codeSaveEvent())
      this.run(myEditor.value)
    }
  }


  toggleEvent() {
    return (e) => { if (e.key === 'Escape') myEditor.toggle() }
  }


  codeSaveEvent() {
    return () => {
      const code = myEditor.value

      if (this._group === socket.id) {
        this.run(code)
      } else {
        socket.private('eval', this._group, code)
      }
    }
  }


  createCharaButton() {
    const hex = `#${sessionStorage.getItem('myColor')}`
    const { addButton } = block.add(list, [
      'button', { class: 'charaButton', style: { backgroundColor: hex, color: color.hexToTextColor(hex) }, return: 'addButton' }, [
        'i', { class: 'icon-js' }
      ]
    ])

    addButton.addEventListener('click', this.toggleEditorEvent(socket.id))
    return addButton
  }


  toggleEditorEvent(socketId) {
    return () => {
      if (socketId === this._group) {
        socket.private('callCode', socketId, socket.id, 'main')
        myEditor.toggle()
      } else {
        socket.private('callCode', socketId, socket.id, 'sub')
        const result = otherEditor.toggle()
        if (result) { this._editorId = socketId }
      }
    }
  }


  addChara(hex, socketId) {
    const { addButton } = block.add(list, [
      'button', { class: 'charaButton', style: { backgroundColor: hex, color: color.hexToTextColor(hex) }, return: 'addButton' }, [
        'i', { class: 'icon-js' }
      ]
    ])
    charaList.set(socketId, addButton)

    addButton.addEventListener('click', this.toggleEditorEvent(socketId))
  }


  removeCharaEvent() {
    return (socketId) => {
      const charaButton = charaList.get(socketId)
      if (!charaButton) return

      charaButton.remove()
      charaList.delete(socketId)
    }
  }


  run(code) {
    if (!code) return

    try {
      if (/sleep/.test(code)) throw Error('sleep は禁止されています。他の環境でも絶対に使用しないでください')
      if (/eval/.test(code)) throw Error('eval は禁止されています。他の環境でも絶対に使用しないでください')
      if (/addEventListener/.test(code)) throw Error('addEventListener は禁止されています。代わりに window.on* を使用してください')
      if (/setinterval/.test(code)) throw Error('setinterval は禁止されています。代わりに update 関数を使用してください')
      if (/_/.test(code)) throw Error('_ の使用は禁止されています。変数名は nameAction のようなキャメルケースが推奨されます')

      if (window.chara) {
        !(0, eval)(`'use static';${code}`)
      }

      myEditor.value = code
      socket.broad('codeUpdate', code, socket.id)
      sessionStorage.setItem('code', code)
    } catch (error) {
      console.error(error)
      alert(error)
    }
  }


  codeUpdate(code, socketId) {
    if (socketId === this._group) {
      return myEditor.value = code
    } else {
      if (socketId === this._editorId) { return otherEditor.value = code }
    }
  }


  openSocket() {
    socket.disconnect(this.removeCharaEvent())

    socket.on('send', (socketId) => {
      if (this._group === socket.id) socket.private('reply', socketId, sessionStorage.getItem('myColor'), socket.id)
    })

    socket.on('addChara', (color, socketId) => {
      this.addChara(`#${color}`, socketId)
    })

    socket.on('reply', (color, socketId) => {
      this.addChara(`#${color}`, socketId)
    })

    socket.on('eval', (code) => {
      this.run(code)
    })

    socket.on('codeUpdate', (code, socketId) => {
      this.codeUpdate(code, socketId)
    })
  }
}