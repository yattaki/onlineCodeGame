'use strict'

const hideClass = 'editor-hide'

export default class Editor {
  constructor() {
    this.add()
  }

  add() {
    this.editorElement = document.createElement('div')
    this.editorElement.classList.add('editor', hideClass)
    this.editor = ace.edit(this.editorElement)
    this.editor.setFontSize(16)
    this.editor.setShowPrintMargin(false)
    this.editor.setTheme("ace/theme/monokai")
    this.editor.session.setTabSize(2)
    this.editor.session.setUseSoftTabs(true)
    this.editor.session.setMode('ace/mode/javascript')

    this.autoCompleate()
    this.addCommand()
    this.editorElement.addEventListener('keydown', this.stopEvent())
    document.getElementById('app').appendChild(this.editorElement)
  }


  stopEvent() {
    return (e) => { e.stopPropagation() }
  }


  freez() {
    this._freezFrag = true
    this.editor.setReadOnly(true)
  }


  autoCompleate() {
    this.editor.$blockScrolling = Infinity
    this.editor.setOptions({ enableBasicAutocompletion: true, enableSnippets: true, enableLiveAutocompletion: true })
    this.editor.session.setMode("ace/mode/javascript")
  }


  view() {
    this.editorElement.classList.remove(hideClass)
    !this._freezFrag && this.editor.setReadOnly(false)
    this.editor.focus()
  }


  hide() {
    this.editorElement.classList.add(hideClass)
    this.editor.setReadOnly(true)
  }


  toggle() {
    this.editorElement.classList.toggle(hideClass)

    if (this.editorElement.classList.contains(hideClass)) {
      this.editor.setReadOnly(true)
      document.activeElement.blur()
      return false
    } else {
      !this._freezFrag && this.editor.setReadOnly(false)
      this.editor.focus()
      return true
    }
  }


  addEventListener(eventName, callback) {
    this.editorElement.addEventListener(eventName, (e) => callback(e))
  }


  addCommand() {
    this.editor.commands.addCommand({
      name: 'myCommand',
      bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
      exec: () => {
        this.editorElement.dispatchEvent(new Event('save'))
      }
    })
  }


  get value() {
    return this.editor.getValue()
  }


  set value(value = '') {
    return this.editor.setValue(value)
  }

  set addClass(value) {
    this.editorElement.classList.add(value)
  }
}