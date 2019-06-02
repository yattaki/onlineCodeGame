'use strict'

import Socket from './socket.js'
import Chara from './chara.js'
import color from './color.js'
import Editor from './editor.js'
import remove from './remove.js'

const socket = new Socket('login')

const app = document.getElementById('app')
const list = document.createElement('div')
list.classList.add('login')
app.appendChild(list)

const charaList = new Map()


export default new class Login {
  constructor() {
    this.init()

    this._group
    this._editorId
    this._myEditor = new Editor()
    this._myEditor.value = sessionStorage.getItem('code') || ''
    this._myEditor.addEventListener('save', this.codeSaveEvent())
    this._otherEditor = new Editor()
    this._otherEditor.addClass = 'editor-mini'

    this._myEditor.addEventListener('keydown', this.toggleEvent())
    window.addEventListener('keydown', this.toggleEvent())
  }



  async init() {
    this.setColor()
    await socket.connect()
    this.openSocket()
    this._myButton = this.createCharaButton()
    socket.broad('send', socket.id)
  }


  toggleEvent() {
    return (e) => { if (e.key === 'Escape') this._myEditor.toggle() }
  }


  setColor() {
    if (sessionStorage.getItem('myColor')) return
    let hex = ''
    let count = 3
    while (count--) {
      hex += Math.floor(Math.random() * 255).toString(16).padStart(2, '0')
    }

    sessionStorage.setItem('myColor', hex)
  }


  codeSaveEvent() {
    return () => {
      const code = this._myEditor.value
      if (/_/.test(code)) return alert('_ は使用出来ません')
      if (!this._group) return
      sessionStorage.setItem('code', code)

      if (this._group === socket.id) {
        this.run(code)
      } else {
        socket.private('eval', this._group, code)
        socket.broad('codeUpdate', code, this._group)
      }
    }
  }


  createCharaButton() {
    const hexColor = `#${sessionStorage.getItem('myColor')}`
    const addButton = document.createElement('button')
    addButton.textContent = '+'
    addButton.classList.add('addCharaButton')
    addButton.style.color = color.hexToTextColor(hexColor)
    addButton.style.backgroundColor = hexColor
    list.appendChild(addButton)

    this.addCharaEvent(addButton)
    return addButton
  }


  addCharaEvent(button) {
    const callback = () => {
      button.removeEventListener('click', callback)

      socket.broad('addChara', sessionStorage.getItem('myColor'), socket.id)

      this._group = socket.id
      button.textContent = ''

      const chara = new Chara({ color: sessionStorage.getItem('myColor') }, socket.id)
      chara.playerChara(chara, button)
      this.run(sessionStorage.getItem('code'))

      button.addEventListener('click', this.toggleEditorEvent())
    }
    button.addEventListener('click', callback)
  }


  toggleEditorEvent() {
    return () => {
      this._myEditor.toggle()
    }
  }


  addEditorEvent(button, socketId) {
    const callback = () => {
      if (!this._group) {
        remove.animation(this._myButton)
        this._group = socketId
      }

      socket.private('getCode', socketId, socket.id)
      if (this._group === socketId) { return this._myEditor.toggle() }
      if (this._editorId === socketId) { return this._otherEditor.toggle() }
      this._editorId = socketId

      this._otherEditor.view()
      this._group !== socketId && this._otherEditor.freez()
    }
    button.addEventListener('click', callback)
  }


  addChara(socketId, hex) {
    const addButton = document.createElement('button')
    addButton.classList.add('charaButton')
    addButton.style.color = color.hexToTextColor(hex)
    addButton.style.backgroundColor = hex
    list.appendChild(addButton)
    charaList.set(socketId, addButton)

    if (socketId === socket.id) {
      this.addCharaEvent(addButton)
    } else {
      this.addEditorEvent(addButton, socketId)
    }
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

      window.update = null
      !(0, eval)(code)
      sessionStorage.setItem('code', code)
    } catch (error) {
      console.error(error)
      alert(error)
    }
  }


  codeUpdate(code, socketId) {
    if (socketId === this._group) { return this._myEditor.value = code }
    if (socketId === this._editorId) { return this._otherEditor.value = code }
  }


  openSocket() {
    socket.on('getCode', (socketId) => {
      socket.private('sendCode', socketId, sessionStorage.getItem('code'), socket.id)
    })
    socket.on('sendCode', (code, socketId) => {
      console.log(code)
      if (this._group === socketId) {
        this._myEditor.value = code
      } else {
        this._otherEditor.value = code
      }
    })

    socket.disconnect(this.removeCharaEvent())

    socket.on('send', (socketId) => {
      if (this._group === socket.id) socket.private('reply', socketId, sessionStorage.getItem('myColor'), socket.id)
    })

    socket.on('addChara', (color, socketId) => {
      this.addChara(socketId, `#${color}`)
    })

    socket.on('reply', (color, socketId) => {
      this.addChara(socketId, `#${color}`)
    })

    socket.on('eval', (code) => {
      this.run(code)
    })

    socket.on('codeUpdate', (code, socketId) => {
      this.codeUpdate(code, socketId)
    })
  }
}