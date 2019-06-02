'use strict'


import block from './block.js'
import rank from './rank.js'
import Socket from './socket.js'
import color from './color.js'
import remove from './remove.js'
import main from './main.js'



let myGroup
const socket = new Socket('login')

socket.on('callGroup', (socketId) => {
  myGroup && socket.private('receveGroup', socketId, myGroup)
})

export default new class Login {
  async init() {
    this.setDefaultData()
    this.loginPage()
  }


  setDefaultData() {
    if (!sessionStorage.getItem('myColor')) {
      let hex = ''
      let count = 6
      while (count--) { hex += Math.floor(Math.random() * 16).toString(16) }

      sessionStorage.setItem('myColor', hex)
    }


    if (!sessionStorage.getItem('myPoint')) {
      sessionStorage.setItem('myPoint', 100)
    }
  }


  async loginPage() {
    const loginBlock = this.addloginBlock()

    const receveGroup = socket.on('receveGroup', (data) => {
      const c = `#${data.color}`

      const { button } = block.add(loginBlock.group, [
        'button', { text: data.name, style: { backgroundColor: c, color: color.hexToTextColor(c) }, return: 'button' }
      ])

      button.addEventListener('click', this.supporterLoginEvent(loginBlock, receveGroup, data.id))

      socket.disconnect((socketId) => {
        if (socketId === data.id) button.remove()
      })
    })

    await socket.connect()
    socket.broad('callGroup', socket.id)

    loginBlock.newGroup.addEventListener('click', this.newGroupEvent(loginBlock, receveGroup))
  }



  addloginBlock() {
    return block.add(document.body, [
      'div', { class: 'cover', return: 'cover' }, [
        'div', { class: 'login-card' }, [
          'label', [
            'div', ['span', { text: 'name' }],
            'div', ['input', { value: sessionStorage.getItem('myName') || '', return: 'name' }]
          ],

          'div', { class: 'group', return: 'group' }, [
            'button', { text: '新しくグループを作る', return: 'newGroup' }
          ]
        ]
      ]
    ])
  }


  newGroupEvent(block, receveGroup) {
    return (e) => {
      const value = block.name.value
      if (!value || value.length <= 0) return alert('名前が空です')

      sessionStorage.setItem('myName', value)

      this.login()

      myGroup = {
        id: socket.id,
        name: sessionStorage.getItem('myName'),
        color: sessionStorage.getItem('myColor')
      }
      socket.broad('receveGroup', myGroup)

      socket.off('receveGroup', receveGroup)
      remove.animation(block.cover)
    }
  }


  login() {
    main.init()

    rank.createGroup({
      name: sessionStorage.getItem('myName'),
      color: `#${sessionStorage.getItem('myColor')}`,
      point: parseInt(sessionStorage.getItem('myPoint'))
    })
  }


  supporterLoginEvent(block, receveGroup, socketId) {
    return () => {
      main.guestStart(socketId)
      console.log(socketId)

      socket.off('receveGroup', receveGroup)
      remove.animation(block.cover)
    }
  }
}