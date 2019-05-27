'use strict'

import stage from './stage.js'
import Socket from './socket.js'
import color from './color.js'
import gameover from './gameover.js'

const socket = new Socket('chara')
const charaMap = new Map()
gameover.checkMap(charaMap)

let playerChara


socket.connect(() => { socket.broad('callChara', socket.id) })

socket.on('callChara', (socketId) => {
  playerChara && socket.private('addChara', socketId, playerChara.status, socket.id)
})

socket.on('addChara', (status, socketId) => { new Chara(status, socketId) })

socket.on('update', (status, socketId) => {
  const chara = charaMap.get(socketId)
  if (!chara) return

  chara.update(status)
})


socket.disconnect((socketId) => {
  const chara = charaMap.get(socketId)
  if (!chara) return

  chara.remove()
})

class CharaApi {
  set x(value) {
    if (typeof value !== 'number' || !isFinite(value)) throw Error('chara.x は数字以外を宣言できません')

    const updateStatus = { x: value }
    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }


  set y(value) {
    if (typeof value !== 'number' || !isFinite(value)) throw Error('chara.y は数字以外を宣言できません')

    const updateStatus = { y: value }
    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }


  set hp(value) {
    if (typeof value !== 'number' || !isFinite(value)) throw Error('chara.hp は数字以外を宣言できません')

    value = value > 0 ? value : 1
    value = value < playerChara.status.resource + playerChara.status.hp ? value : playerChara.status.resource + playerChara.status.hp
    const resource = playerChara.status.resource - value + playerChara.status.hp
    const updateStatus = { hp: value, resource: resource }
    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }

  hpUp(value) {
    if (typeof value !== 'number' || !isFinite(value)) throw Error('chara.hpUp は数字以外を宣言できません')

    value = value < 0 && value - playerChara.status.hp < 1 ? 1 - playerChara.status.hp : value
    value = value < playerChara.status.resource ? value : playerChara.status.resource
    const resource = playerChara.status.resource - value
    const updateStatus = { hp: playerChara.status.hp + value, resource: resource }
    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }


  set power(value) {
    if (typeof value !== 'number' || !isFinite(value)) throw Error('chara.power は数字以外を宣言できません')

    let negativeFrag = false
    if (value < 0) {
      negativeFrag = true
      value = -value
    }
    value = value < playerChara.status.resource + playerChara.status.power ? value : playerChara.status.resource + playerChara.status.power
    const resource = playerChara.status.resource - value + playerChara.status.power
    if (negativeFrag) { value = -value }

    const updateStatus = { power: value, resource: resource }

    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }

  powerUp(value) {
    if (typeof value !== 'number' || !isFinite(value)) throw Error('chara.powerUp は数字以外を宣言できません')

    let negativeFrag = false
    if (value < 0) {
      negativeFrag = true
      value = -value
    }
    value = value < playerChara.status.resource ? value : playerChara.status.resource
    const resource = playerChara.status.resource - value
    if (negativeFrag) { value = -value }

    const updateStatus = { power: playerChara.status.power + value, resource: resource }
    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }


  set speed(value) {
    if (typeof value !== 'number' || !isFinite(value)) throw Error('chara.speed は数字以外を宣言できません')
    if (value < 0) throw Error('chara.speed は負の値を宣言出来ません')

    value = value > 0 ? value : 1
    value = value < playerChara.status.resource + playerChara.status.speed ? value : playerChara.status.resource + playerChara.status.speed
    const resource = playerChara.status.resource - value + playerChara.status.speed
    const updateStatus = { speed: value, resource: resource }
    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }

  speedUp(value) {
    if (typeof value !== 'number' || !isFinite(value)) throw Error('chara.speedUp は数字以外を宣言できません')
    if (value < 0) throw Error('chara.speedUp は負の値を宣言出来ません')

    value = value < playerChara.status.speed ? value : playerChara.status.speed - 1
    value = value < playerChara.status.resource ? value : playerChara.status.resource
    const resource = playerChara.status.resource - value
    const updateStatus = { speed: playerChara.status.speed + value, resource: resource }
    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }


  get status() { playerChara.status }
  get x() { return playerChara.status.x }
  get y() { return playerChara.status.y }
  get size() { return playerChara.status.size }
  get color() { return playerChara.status.color }
  get hp() { return playerChara.status.hp }
  get power() { return playerChara.status.power }
  get speed() { return playerChara.status.speed }
  get resource() { return playerChara.status.resource }
}


export default class Chara {
  constructor(status, socketId) {
    this.hitFrag = true

    this.status = {
      x: Math.floor(Math.random() * window.innerWidth),
      y: Math.floor(Math.random() * window.innerHeight),
      size: 20,
      color: 0x000000,
      hp: 50,
      power: 50,
      speed: 50,
      resource: parseInt(sessionStorage.getItem('resource') || 100),
    }

    this.socketId = socketId

    socket.connect(() => {
      this.add(status)
    })
  }


  add(status) {
    this.status = Object.assign(this.status, status)

    this.sprite = new PIXI.Container()
    this.charaSpriteUpdate()
    this.hpSpriteUpdate()
    this.sprite.position.x = this.status.x
    this.sprite.position.y = this.status.y

    stage.addChara(this.sprite)
    charaMap.set(this.socketId, this)
    this.socketId === socket.id && socket.broad('addChara', this.status, this.socketId)
  }


  remove() {
    this.sprite.parent.removeChild(this.sprite)
    this.sprite.destroy({ children: true, texture: true, baseTexture: true })
    charaMap.delete(this.socketId)
    stage.render()
  }


  charaSpriteUpdate() {
    if (this.charaSprite) {
      this.charaSprite.parent.removeChild(this.charaSprite)
      this.charaSprite.destroy({ children: true, texture: true, baseTexture: true })
      this.charaSprite = null
    }

    this.charaSprite = new PIXI.Graphics()
    this.charaSprite.beginFill(this.status.color)
    this.charaSprite.drawCircle(0, 0, this.status.size)
    this.charaSprite.endFill()

    this.sprite.addChild(this.charaSprite)
    stage.render()
  }


  hpSpriteUpdate() {
    if (this.hpSprite) {
      this.hpSprite.parent.removeChild(this.hpSprite)
      this.hpSprite.destroy({ children: true, texture: true, baseTexture: true })
      this.hpSprite = null
    }

    this.hpSprite = new PIXI.Text(this.status.hp, { font: 'bold 16pt Arial', fill: color.hexToTextColor(this.status.color) })
    this.hpSprite.anchor.x = 0.5
    this.hpSprite.anchor.y = 0.5

    this.sprite.addChild(this.hpSprite)
    stage.render()
  }


  update(updateStatus) {
    for (const statusName in updateStatus) {
      switch (statusName) {
        case 'x': this.positionXUpdate(updateStatus.x); break
        case 'y': this.positionYUpdate(updateStatus.y); break
        case 'hp': this.hpUpdate(updateStatus.hp); break
        default: this.statsUpdate(updateStatus); break
      }
    }
  }


  positionXUpdate(x = this.status.x) {
    x = x < 0 ? 0 : x > stage.width ? stage.width : x
    if (this.sprite) this.sprite.position.x = this.status.x = x
    this.collisionCheck()

    stage.render()
  }


  positionYUpdate(y = this.status.y) {
    y = y < 0 ? 0 : y > stage.height ? stage.height : y
    if (this.sprite) this.sprite.position.y = this.status.y = y
    this.collisionCheck()

    stage.render()
  }


  hpUpdate(hp) {
    this.statsUpdate({ hp: hp })
    this.hpSpriteUpdate()
  }


  statsUpdate(updateStatus) {
    for (const statusType in updateStatus) {
      this.status[statusType] = updateStatus[statusType]
    }
  }


  collisionCheck() {
    for (const chara of charaMap.values()) {
      if (chara === this) continue

      if (Math.sqrt(Math.pow(chara.status.x - this.status.x, 2) + Math.pow(chara.status.y - this.status.y, 2)) < chara.status.size + this.status.size) {
        this.hit(chara.status.power)
        chara.hit(this.status.power)
      }
    }
  }


  hit(power) {
    if (!this.hitFrag) return
    this.hitFrag = false
    setTimeout(() => { this.hitFrag = true }, 1000)

    this.update({ hp: this.status.hp - power })
  }


  playerChara(charaClass) {
    playerChara = charaClass
    this.addKeyEvent()
    this.addResourceElement()
    window.chara = new CharaApi()
  }


  addKeyEvent() {
    let moveX, moveY
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'a': moveX = 'a'; break
        case 'd': moveX = 'd'; break
        case 'w': moveY = 'w'; break
        case 's': moveY = 's'; break
      }
    })

    window.addEventListener('keyup', (e) => {
      switch (e.key) {
        case 'a':
        case 'd':
          moveX = undefined; break
        case 'w':
        case 's':
          moveY = undefined; break
      }

    })

    stage.addRoopEvent(() => {
      if (!moveX && !moveY) return
      console.log(moveX, moveY)

      const offsetSpeed = this.status.speed / 10

      const updateStatus = {}
      if (moveX === 'a') updateStatus.x = this.status.x - offsetSpeed
      if (moveX === 'd') updateStatus.x = this.status.x + offsetSpeed
      if (moveY === 'w') updateStatus.y = this.status.y - offsetSpeed
      if (moveY === 's') updateStatus.y = this.status.y + offsetSpeed

      this.update(updateStatus)
      socket.broad('update', updateStatus, socket.id)
    })
  }


  addResourceElement() {
    const resourceElement = document.createElement('div')
    resourceElement.classList.add('resource')
    resourceElement.textContent = this.status.resource
    document.body.appendChild(resourceElement)

    let timeStamp = new Date()
    stage.addRoopEvent(() => {
      let nawTimeStamp = new Date()
      if (nawTimeStamp - timeStamp > 500) {
        timeStamp = nawTimeStamp
        this.status.resource++
        sessionStorage.setItem('resource', this.status.resource)
      }

      if (resourceElement.textContent !== this.status.resource) resourceElement.textContent = this.status.resource
    })
  }
}