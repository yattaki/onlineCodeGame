export default new class Color {
  hexToTextColor(hex) {
    const split = hex.split(/^(#|0x)/).filter(Boolean)
    hex = split.pop()
    const head = split.length > 0 ? split.pop() : ''
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return

    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    return (r * 299 + g * 587 + b * 144) / 1000 < 128 ? `${head}ffffff` : `${head}000000`
  }
}
