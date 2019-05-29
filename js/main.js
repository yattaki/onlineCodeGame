'use strict'

import './login.js'
import alert from './alert.js'

window.alert = alert

window.onerror = (message) => { alert(message) }