'use strict'

import stage from './stage.js'
import Socket from './socket.js'
import color from './color.js'
import gameover from './gameover.js'
import rank from './rank.js'

const socket = new Socket('chara')
const charaMap = new Map()
gameover.checkMap(charaMap)

let playerChara
let playerButton

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
    if (typeof value !== 'number' || Number.isNaN(value) || value === Infinity) throw Error('chara.x は数字以外を宣言できません')

    const updateStatus = { x: value }
    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }


  set y(value) {
    if (typeof value !== 'number' || Number.isNaN(value) || value === Infinity) throw Error('chara.y は数字以外を宣言できません')

    const updateStatus = { y: value }
    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }


  set size(value) {
    if (typeof value !== 'number' || Number.isNaN(value) || value === Infinity) throw Error('chara.size は数字以外を宣言できません')
    value = value < 10 ? 10 : value
    value = value > 100 ? 100 : value

    const updateStatus = { size: value }
    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }


  set color(value) {
    if (typeof value === 'number') {
      value = value.toString(16).padStart(6, '0')
    } else {
      value = value.replace(/^(0x|#)/, '')
    }
    if (!/^[0-9a-f]{6,}$/.test(value)) throw Error('chara.color のフォーマットが正しくありません。0-f で構成された6桁のrgb形式で表記してください 例)00ff00')

    sessionStorage.setItem('myColor', value)
    const updateStatus = { color: value }
    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }


  set hp(value) {
    if (typeof value !== 'number' || Number.isNaN(value) || value === Infinity) throw Error('chara.hp は数字以外を宣言できません')

    value = Math.floor(value)
    value = value > 0 ? value : 1
    value = value < playerChara.status.point + playerChara.status.hp ? value : playerChara.status.point + playerChara.status.hp
    const point = playerChara.status.point - value + playerChara.status.hp
    const updateStatus = { hp: value, point: point }
    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }

  hpUp(value) {
    if (typeof value !== 'number' || Number.isNaN(value) || value === Infinity) throw Error('chara.hpUp は数字以外を宣言できません')

    value = Math.floor(value)
    value = value < 0 && value - playerChara.status.hp < 1 ? 1 - playerChara.status.hp : value
    value = value < playerChara.status.point ? value : playerChara.status.point
    const point = playerChara.status.point - value
    const updateStatus = { hp: playerChara.status.hp + value, point: point }
    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }


  set power(value) {
    if (typeof value !== 'number' || Number.isNaN(value) || value === Infinity) throw Error('chara.power は数字以外を宣言できません')

    value = Math.floor(value)
    let negativeFrag = false
    if (value < 0) {
      negativeFrag = true
      value = -value
    }
    value = value < playerChara.status.point + playerChara.status.power ? value : playerChara.status.point + playerChara.status.power
    const point = playerChara.status.point - value + playerChara.status.power
    if (negativeFrag) { value = -value }

    const updateStatus = { power: value, point: point }

    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }

  powerUp(value) {
    if (typeof value !== 'number' || Number.isNaN(value) || value === Infinity) throw Error('chara.powerUp は数字以外を宣言できません')

    value = Math.floor(value)
    let negativeFrag = false
    if (value < 0) {
      negativeFrag = true
      value = -value
    }
    value = value < playerChara.status.point ? value : playerChara.status.point
    const point = playerChara.status.point - value
    if (negativeFrag) { value = -value }

    const updateStatus = { power: playerChara.status.power + value, point: point }
    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }


  set speed(value) {
    if (typeof value !== 'number' || Number.isNaN(value) || value === Infinity) throw Error('chara.speed は数字以外を宣言できません')
    value = Math.floor(value)
    if (value < 0) throw Error('chara.speed は負の値を宣言出来ません')

    value = value > 0 ? value : 1
    value = value < playerChara.status.point + playerChara.status.speed ? value : playerChara.status.point + playerChara.status.speed
    const point = playerChara.status.point - value + playerChara.status.speed
    const updateStatus = { speed: value, point: point }
    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }

  speedUp(value) {
    if (typeof value !== 'number' || Number.isNaN(value) || value === Infinity) throw Error('chara.speedUp は数字以外を宣言できません')

    value = Math.floor(value)

    value = playerChara.status.speed + value > 0 ? value : playerChara.status.speed - 1
    value = value < playerChara.status.point ? value : playerChara.status.point
    const point = playerChara.status.point - value
    const updateStatus = { speed: playerChara.status.speed + value, point: point }
    playerChara.update(updateStatus)
    socket.broad('update', updateStatus, socket.id)
  }


  get status() { return playerChara.status }
  get x() { return playerChara.status.x }
  get y() { return playerChara.status.y }
  get size() { return playerChara.status.size }
  get color() { return playerChara.status.color }
  get hp() { return playerChara.status.hp }
  get power() { return playerChara.status.power }
  get speed() { return playerChara.status.speed }
  get point() { return playerChara.status.point }
}


export default class Chara {
  constructor(status, socketId) {
    this.hitFrag = true

    this.status = {
      x: Math.floor(Math.random() * stage.width),
      y: Math.floor(Math.random() * stage.height),
      size: 20,
      color: 's000000',
      hp: 20,
      power: 20,
      speed: 20,
      point: parseInt(sessionStorage.getItem('myPoint') || 100),
    }

    this.status = Object.assign(this.status, status)
    this.socketId = socketId

    socket.connect(() => {
      this.add()
    })
  }


  add() {
    this.sprite = new PIXI.Container()
    this.charaSpriteChange()
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


  charaSpriteChange() {
    if (this.charaSprite) {
      this.charaSprite.parent.removeChild(this.charaSprite)
      this.charaSprite.destroy(true)
      this.charaSprite = null
    }

    this.charaSprite = new PIXI.Graphics()
    this.charaSprite.beginFill(`0x${this.status.color}`)
    this.charaSprite.drawCircle(0, 0, this.status.size)
    this.charaSprite.endFill()

    this.sprite.addChild(this.charaSprite)

    this.hpSpriteChange()
  }


  hpSpriteChange() {
    if (this.hpSprite) {
      this.hpSprite.parent.removeChild(this.hpSprite)
      this.hpSprite.destroy(true)
      this.hpSprite = null
    }

    this.hpSprite = new PIXI.Text(this.status.hp, { font: `bold ${this.status.size - 5}pt Arial`, fill: `0x${color.hexToTextColor(this.status.color)}` })
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
        case 'size': this.charaSpriteSizeUpdate(updateStatus.size); break
        case 'color': this.charaSpriteColorUpdate(updateStatus.color); break
        case 'hp': this.hpUpdate(updateStatus.hp); break
        default: this.status[statusName] = updateStatus[statusName]; break
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


  charaSpriteSizeUpdate(size) {
    this.status.size = size
    this.charaSpriteChange()
  }


  charaSpriteColorUpdate(color) {
    this.status.color = color
    if (playerButton) playerButton.style.backgroundColor = `#${color}`
    this.charaSpriteChange()
  }


  hpUpdate(hp) {
    if (this.status.hp <= 0) return

    this.status.hp = hp
    this.hpSpriteChange()
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

    const updateData = { hp: this.status.hp - Math.round(power / 2) }
    socket.broad('update', updateData, this.socketId)
    this.update(updateData)
  }


  playerChara(charaClass, button) {
    playerChara = charaClass
    playerButton = button
    this.addKeyEvent()
    this.addpointElement()
    window.chara = new CharaApi()

    this.hitFrag = false
    setTimeout(() => { this.hitFrag = true }, 1000 * 30)
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


  addpointElement() {

    let timeStamp = new Date()
    stage.addRoopEvent(() => {
      let nawTimeStamp = new Date()
      if (nawTimeStamp - timeStamp > 300) {
        timeStamp = nawTimeStamp
        this.status.point++
      }
      sessionStorage.setItem('myPoint', this.status.point)
      rank.update(socket.id, this.status.point)
    })
  }
}