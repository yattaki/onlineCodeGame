'use strict'

class Block {
  constructor() {
    this._customElementList = new Map()
  }

  add(parent, childrenData) {
    if (!Array.isArray(childrenData)) throw 'blockには配列を引数として宣言してください'
    let children = {}
    let child

    for (const childData of childrenData) {
      switch (Object.prototype.toString.call(childData).slice(8, -1).toLowerCase()) {
        case 'string':
          child = this.create(childData, parent)
          break

        case 'object':
          if (childData.tag) { child = this.create(childData.tag, parent) }

          const childTag = this.set(child, childData)
          if (childTag !== undefined) { children[childTag] = child }
          break

        case 'array':
          const list = this.add(child || parent, childData)
          Object.assign(children, list)
          break
        default:
          throw `${item} 型の引数は使用出来ません`
      }
    }
    return children
  }

  set(elm, data) {
    let tag

    for (const type in data) {
      const value = data[type]
      switch (type) {
        case 'class':
          const classList = value.split(/ +/)
          if (value.length > 0) elm.classList.add(...classList)
          break

        case 'style':
          for (const styleType in value) {
            const styleValue = value[styleType]
            elm.style[styleType] = styleValue
          }
          break

        case 'data':
          for (const dataType in value) {
            const dataValue = value[dataType]
            elm.dataset[dataType] = dataValue
          }
          break

        case 'return':
          tag = value
          break

        case 'text':
          elm.textContent = value
          break

        default:
          elm[type] = value
          break
      }
    }

    return tag
  }

  addCustomWidget(option) {
    this._customElementList.set(option.name, option)
  }

  create(tagName, parent) {
    if (tagName.toLowerCase() === 'script') throw Error('script要素は宣言できません 外部ファイルを読み込む場合はimportを使用してください')

    if (/.+-.+/.test(tagName)) {
      for (const [name, option] of this._customElementList) {
        if (tagName === name) {
          const widget = document.createElement(option.tag || 'div')
          new option.class(widget)

          parent && parent.appendChild(widget)
          return widget
        }
      }
    }


    const widget = document.createElement(tagName)
    parent && parent.appendChild(widget)
    return widget
  }
}

export default new Block()