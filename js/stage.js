'use strict'

import gameover from './gameover.js'

const roopListEvent = []

const stage = new class Stage {
  constructor() {
    this._roopFrag = true
    this._renderFrag = false
    this.init()
  }

  async init() {
    this.addStage()
  }

  addStage() {
    const renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, { antialias: true, transparent: true })
    document.getElementById('app').appendChild(renderer.view)
    this.stage = new PIXI.Container()
    this.view = renderer.view

    this.resize(renderer)
    this.roop(renderer)
    window.dispatchEvent(new Event('resize'))
  }

  roop(renderer) {
    let timeStamp = new Date()

    const roopEvent = () => {
      this._roopFrag && requestAnimationFrame(roopEvent)

      roopListEvent.forEach(callback => callback())

      const nawTimeStamp = new Date()
      if (nawTimeStamp - timeStamp > 1000 / 60) {
        timeStamp = nawTimeStamp
        typeof window.update === 'function' && window.update()
      }

      gameover.check()

      this._renderFrag && renderer.render(this.stage)
      this._renderFrag = false
    }
    roopEvent()
  }


  roopEnd() {
    this._roopFrag = false
  }


  resize(renderer) {
    window.addEventListener('resize', () => {
      this.view.width = this.view.getBoundingClientRect().width
      this.view.height = this.view.getBoundingClientRect().height
      this.render()
      renderer.resize(this.width, this.height)
    })
  }

  addChara(sprite) {
    this.stage.addChild(sprite)
    this.render()
  }

  render() {
    this._renderFrag = true
  }

  get width() {
    return this.view.width
  }

  get height() {
    return this.view.height
  }
}


export default new class StageApi {
  addChara(chara) {
    stage.addChara(chara)
  }

  render() {
    stage.render()
  }


  addRoopEvent(callback) {
    roopListEvent.push(callback)
  }


  roopEnd() {
    stage.roopEnd()
  }


  get width() {
    return stage.width
  }

  get height() {
    return stage.height
  }
}