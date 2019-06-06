'use strict'

import Socket from './socket.js'
import stage from './stage.js'

const socket = new Socket('gameover')


export default new class Gameover {
  check() {
    if (!this.map) return

    for (const chara of this.map.values()) {
      if (chara.status.hp <= 0) {
        if (chara.socketId === socket.id) {
          this.end()
        }
      }
    }
  }

  checkMap(map) {
    this.map = map
  }

  end() {
    socket._kill()
    stage.roopEnd()

    const cover = document.createElement('div')
    cover.classList.add('gameover')
    const message = document.createElement('p')
    message.textContent = 'GAME OVER'
    const button = document.createElement('button')
    button.textContent = 'リトライ'
    button.focus()

    document.body.appendChild(cover)
    cover.appendChild(message)
    cover.appendChild(button)

    button.addEventListener('click', () => { location.reload() })
  }
}