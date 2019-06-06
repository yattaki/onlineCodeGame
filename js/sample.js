'use strict'

import block from './block.js'

export default new class Samplae {
  add() {
    const { content } = this.samplaeBlock()
    const { button } = this.buttonBlock()

    button.addEventListener('click', () => {
      content.classList.toggle('sample-hide')
    }, false)
  }


  samplaeBlock() {
    const mainBlock = block.add(document.getElementById('app'), [
      'div', { class: 'sample sample-hide', return: 'content' }
    ])

    this.addMd(mainBlock.content)

    return mainBlock
  }


  async addMd(parent) {
    const res = await fetch('md/sample.md')
    if (!res.ok) return
    const md = await res.text()

    parent.innerHTML = marked(md)

    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightBlock(block)
    })
  }


  buttonBlock() {
    return block.add(document.getElementById('app'), [
      'button', { class: 'sample-button', return: 'button' }, [
        'i', { class: 'icon-align-left' }
      ]
    ])
  }
}