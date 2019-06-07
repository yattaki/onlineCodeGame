'use strict'

import block from './block.js'
import Socket from './socket.js'

const socket = new Socket('alert')

const typeOf = (item) => {
  return Object.prototype.toString.call(item).slice(8, -1).toLowerCase()
}

const alertList = document.createElement('div')
alertList.classList.add('alert')
document.body.appendChild(alertList)

const alert = (message, option = {}, sendFrag = true) => {
  const { wrapper, alertContents, messageContent, buttonContent } = block.add(alertList, [
    'div', { class: 'alert-wrapper', return: 'wrapper' }, [
      'a', { class: 'alert-contents', return: 'alertContents' }, [
        'div', { class: 'alert-message', return: 'messageContent' },
        'div', { class: 'alert-button-content', return: 'buttonContent' }
      ]
    ]
  ])

  option.socketId = socket.group
  sendFrag && socket.broad('alert', message, option)

  if (typeof message === 'string') {
    block.add(messageContent, [
      'p', { text: message }
    ])
  } else if (typeOf(message) === 'object') {
    for (const key in message) {
      if (message.hasOwnProperty(key)) {
        block.add(messageContent, [
          'p', [
            'span', { class: 'alert-objectKey', text: key },
            'span', { class: 'alert-objectValue', text: message[key] }
          ]
        ])
      }
    }

  } else if (typeOf(message) === 'array') {
    for (const text of message) {
      block.add(messageContent, [
        'p', { text: text }
      ])
    }
  } else if (typeOf(message) === 'error') {
    block.add(messageContent, [
      'p', { text: message }
    ])

    option = option ? option : {}
    option.type = 'error'
  }

  alert.scrollTop = alert.scrollHeight

  const removeEvent = (removeElement, className) => {
    const removeTimer = setTimeout(() => {
      removeElement.remove()
    }, 1000)

    removeElement.classList.add(className)
    removeElement.addEventListener('transitionend', () => {
      removeElement.remove()
      clearTimeout(removeTimer)
    }, false)
  }

  const clickHideEvent = () => removeEvent(wrapper, 'alert-remove')
  alertContents.addEventListener('click', clickHideEvent, false)

  if (option.no) { option.type = 'confirm' }
  if (option.finishMessage) { option.type = 'delay' }
  if (option.progress) { option.type = 'delay' }

  switch (option.type) {
    case 'error':
    case 'warn': {
      alertContents.classList.add(`alert-${option.type}`)

      const time = option ? option.delay || 5000 : 5000
      setTimeout(() => {
        removeEvent(wrapper, 'alert-remove')
      }, time)
      break
    }

    case 'confirm': {
      return new Promise(resolve => {
        alertContents.removeEventListener('click', clickHideEvent, false)

        const yesText = option.yes || 'はい'
        const noText = option.no || 'いいえ'

        const buttonList = option.buttons || []
        buttonList.push(yesText, noText)

        let yesButton
        let noButton
        for (const text of buttonList) {
          const { button } = block.add(buttonContent, [
            'button', { class: 'haretara-button', textContent: text, return: 'button' }
          ])

          if (!yesButton) {
            yesButton = button
            !option.buttons && button.classList.add('haretara-button-hover')
          } else if (!noButton && text === noText) {
            noButton = button
          }

          button.addEventListener('click', () => {
            option.event && option.event(text)
            if (option.noClose !== true || text === noText) removeEvent(wrapper, 'alert-remove')
            yesButton = null
            resolve(text)
          }, false)
        }

        const touchEvent = (e) => {
          e.stopPropagation()
          if (option.look) {
            option.look.addEventListener('animationend', () => {
              option.look.style.animation = ''
            }, false)
            option.look.style.animation = option.lookAnimation || 'alert-look 1s 0s ease'
          }
        }
        wrapper.addEventListener('mousedown', touchEvent, false)
        wrapper.addEventListener('touchstart', touchEvent, false)

        const clickEvent = (e) => {
          if (yesButton && (e.key === 'Enter' || e.key === 'y')) {
            yesButton.click()
          } else {
            noButton.click()
          }

          yesButton && yesButton.classList.remove('haretara-button-hover')
          window.removeEventListener('keydown', clickEvent, false)
          window.removeEventListener('mousedown', clickEvent, false)
          window.removeEventListener('touchstart', clickEvent, false)
        }
        window.addEventListener('keydown', clickEvent, false)
        window.addEventListener('mousedown', clickEvent, false)
        window.addEventListener('touchstart', clickEvent, false)
      })
    }

    case 'delay': {
      const finishEvent = (message) => {
        removeEvent(wrapper, 'alert-remove')
        alert(message)
      }

      if (option.progress) {
        const { progress } = block.add(buttonContent, [
          'div', { class: 'alert-progressBar' }, ['div', { return: 'progress' }]
        ])

        let endCount = 0
        option.progress.forEach(promise => {
          promise.then(() => {
            endCount++
            progress.style.transform = `scale(${endCount / option.progress.length}, 1)`
          })
        })

        if (option.finishMessage) {
          Promise.all(option.progress).then(() => {
            finishEvent(option.finishMessage)
          })
        }
      }


      return {
        finish: finishEvent
      }
    }


    default:
      const time = option ? option.delay || 5000 : 5000
      setTimeout(() => {
        removeEvent(wrapper, 'alert-remove')
      }, time)
      break
  }

  alertList.scrollTop = alertList.scrollHeight
}


socket.on('alert', (message, option) => {
  if (socket.group === option.socketId) alert(message, option, false)
})


export default alert