'use strict'

const http = require('http')
const socketio = require('socket.io')
const fs = require('fs')
const mime = require('mime')

new class Server {
  constructor() {
    this.errorHandling()

    const server = http.createServer(this.request)
    const port = process.env.PORT || 3000
    server.listen(port)
    const io = socketio.listen(server)
    this.socket(io)

    console.log('server running...')
  }


  request(req, res) {
    const path = decodeURI(req.url === '/' ? './index.html' : `.${req.url}`).replace(/[?].*$/, '')


    console.log('file load: ', path)
    fs.readFile(path, (error, result) => {
      if (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.write(`${req.url} not found.\nerror: ${error}`)
        res.end()
        return
      }

      res.writeHead(200, { 'Content-Type': mime.getType(path) })
      res.write(result)
      res.end()
    })
  }


  socket(io) {
    io.sockets.on('connection', (socket) => {
      console.log('connection socket: ', socket.id)
      socket.on('disconnect', () => io.sockets.emit('disconnect', socket.id))

      socket.on('broad', (socketName, args) => socket.broadcast.emit(socketName, args))
      socket.on('private', (socketName, socketId, args) => io.to(socketId).emit(socketName, args))

    })
  }


  errorHandling() {
    process.on('uncaughtException', (error) => { return console.error(error) })
  }
}