'use strict'


import block from './block.js'
import Socket from './socket.js'
import color from './color.js'


const socket = new Socket('ranking')
let myRank
let ranking = []

const rank = new class Rank {
  constructor() { }

  async join(data) {

  }


  async createGroup(data) {
    await socket.connect()

    data.id = socket.id
    socket.broad('add', data)

    myRank = data
    this.add(data)
  }


  addGroup(data, socketId) {

  }


  add(data) {
    ranking.push({
      id: data.id,
      point: data.point,
      block: this.addRankerBlock(data.name, data.color, data.point),
    })
    this.sort()
  }


  update(id, point, socketEvent = true) {
    for (const ranker of ranking) {
      if (ranker.id === id) {
        ranker.point = point
        ranker.block.point.textContent = point
        socketEvent && socket.broad('update', ranker.id, ranker.point)
        return this.sort()
      }
    }
  }


  sort() {
    ranking.sort((a, b) => { return b.point - a.point })
    let height = 0
    let zIndex = 100
    ranking.forEach((ranker) => {
      ranker.block.wrapper.style.transform = `translate(0, ${height}px)`
      ranker.block.wrapper.style.transform = zIndex

      height += ranker.block.wrapper.getBoundingClientRect().height
      zIndex--
    })
  }


  addRankerBlock(name, color, point) {
    return block.add(document.getElementById('app'), [
      'div', { class: 'ranking-wrapper', return: 'wrapper' }, [
        this.rankerBlueprint(name, color, point)
      ]
    ])
  }


  rankerBlueprint(name, colorStyle, point) {
    return [
      'div', { class: 'ranking', style: { backgroundColor: colorStyle, color: color.hexToTextColor(colorStyle) } }, [
        'pre', { class: 'myName', text: name, return: 'name' },
        'span', { class: 'myPoint', text: point, return: 'point' },
      ]
    ]
  }
}


socket.on('add', (data) => {
  rank.add(data)
})


socket.connect(() => {
  socket.broad('call', socket.id)
})

socket.on('call', (socketId) => {
  myRank && socket.private('add', socketId, myRank)
})


socket.on('update', (socketId, point) => {
  rank.update(socketId, point, false)
})


socket.disconnect((id) => {
  for (const ranker of ranking) {
    if (ranker.id === id) {
      ranker.block.wrapper.remove()
      ranking = ranking.filter(i => i !== ranker)
      return rank.sort()
    }
  }
})

export default rank