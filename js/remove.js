'use strict'

export default new class Remove {
  animation(elm, option = 'remove') {
    return new Promise(resolve => {
      let removeTimer
      const endEvent = () => {
        elm && elm.remove()
        clearTimeout(removeTimer)
        resolve()
      }

      removeTimer = setTimeout(() => endEvent(), 1000)

      elm.addEventListener('transitionend', () => endEvent(), false)
      if (typeof option === 'function') {
        option()
      } else {
        elm.classList.add(option)
      }
    })
  }
}