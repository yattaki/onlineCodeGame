'use strict'

if (PIXI) {
  const free = (object, skipList) => {
    for (const key in object) {
      if (object.hasOwnProperty(key)) continue

      if (skipList && skipList.indexOf(typeof object[key]) >= 0) continue

      if (typeof object[key] === 'object') {
        free(object[key])
      } else {
        object[key] = null
      }
    }
  }

  PIXI.Text.prototype.destroy = function (destroyTexture) {
    destroyTexture && this.texture.destroy(destroyTexture)
    free(this)
  }

  PIXI.BaseTexture.prototype.destroy = function () {
    free(this, ['function'])
  }
}
