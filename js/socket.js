'use strict'

const socket = io.connect()
window.io = null

const pri = new WeakMap()

class Socket {
  constructor(nameSpace) {
    pri.set(this, nameSpace)
  }

  parseSocketName(socketName) {
    if (socketName === 'string') throw Error('socketNameが Strig 型ではありません')
    if (/-/.test(socketName)) throw Error('socketNameに - を含める事は出来ません')
    return socketName += `-${pri.get(this)}`
  }

  connect(callback) {
    return new Promise((resolve) => {
      if (socket.id) {
        callback && callback()
        return resolve()
      }
      socket.on('connect', () => {
        callback && callback()
        return resolve()
      })
    })
  }

  disconnect(callback) {
    socket.on('disconnect', callback)
  }


  _kill() {
    socket.disconnect()
  }


  get id() {
    return socket.id
  }

  on(socketName, callback) {
    socketName = this.parseSocketName(socketName)
    socket.on(socketName, (args) => callback(...args))
  }


  broad(socketName, ...args) {
    socketName = this.parseSocketName(socketName)
    socket.emit('broad', socketName, args)
  }


  private(socketName, socketId, ...args) {
    socketName = this.parseSocketName(socketName)
    socket.emit('private', socketName, socketId, args)
  }
}

if (!window.socket) window.socket = new Socket('gloval')

export default Socket