'use strict'

import login from './login.js'
import alert from './alert.js'

window.alert = alert
window.onerror = (message) => { alert(message, { type: 'error' }) }


new class Main {
  constructor() {
    login.init()
  }
}
