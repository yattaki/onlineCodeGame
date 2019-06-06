# 基本の書き方

```javascript
chara.x = 100 // キャラのx座標を変更する
chara.y = 100 // キャラのx座標を変更する
chara.hp = 10 // 体力を変更する
chara.power = 10 // 攻撃力を変更する
chara.speed = 10 // 速度を変更する

chara.hp += 10 // 体力を変更する
chara.power += 10 // 攻撃力を変更する
chara.speed += 10 // 速度を変更する

alert(chara.status) // ステータスを確認する

// 繰り返し処理
update(() => {
  chara.speed += 10 // 自動回復
})
```

## サンプルキャラ

### メイン縦来た！　これで勝つる！

```javascript
// 体力が一定以下になった時に回復する
update(() => {
  // 体力が10より少ないか判別
  if (chara.hp < 10) {
    chara.hp += 100 // 少ないので100回復する
  }
}, 1000)


// 回復キーを追加する
window.onkeydown = (e) => {
  // hキーを押した時に体力を10回復する
  if(e.key === 'h') {
    chara.h += 10
  }
}


// プレイヤーに伝える
alert('hキーに回復機能を追加したよ！')
```

### 回避性能+2

```javascript
let pressKey // 押したキーを保持する
let pressTime // 押した時間を保持する

window.onkeydown = (e) => {
  pressKey = e.key
  pressTime = pressTime || new Date()
}

window.onkeyup = (e) => {
  // 押したキーが短い間に離された時に回避する
  if(e.key === pressKey && new Date() - pressTime < 500) {  // 500ms(0.5秒) 以内に離すと発火
    switch (e.key) {
      case 'w': // wキー
        chara.y -= 100
        break
      case 's': // sキー
        chara.y += 100
        break
      case 'a': // aキー
        chara.x -= 100
        break
      case 'd': // dキー
        chara.x += 100
        break
    }
  }

  pressTime = null
}


// プレイヤーに伝える
alert('にゃるがくるが！')
```



### カウンター

```javascript
let before  // 前の状態を保持する変数

window.onkeydown = (e) => {
  // cキーを押した時に体力と攻撃力を上げる
  if(e.key === 'c') {
    before = chara.status // 今の状態を保存する

    chara.speed = 10  // ポイントが足りない可能性がある為、速度をポイントに還元する
    chara.hp += chara.point / 2 // ポイントの半分を体力に加算する
    chara.power += chara.point / 2 // ポイントの半分を攻撃力に加算する
    chara.size = 100  // キャラを拡大してあたり易くする
  }
}

window.onkeyup = (e) => {
  // cキーを話した時に前の状態に戻す
  if(e.key === 'c') {
    chara.size = before.size
    chara.hp = before.hp
    chara.speed = before.speed
    chara.power += before.power
  }
}


// プレイヤーに伝える
alert('cキーにカウンター機能を追加したよ！')
```

### 空間を操るもの
```javascript
window.onkeydown = (e) => {
  // jキーを押した時にランダムな位置にジャンプする
  if(e.key === 'j') {
    // ランダムな位置作成する
    const x = Math.floor(Math.random() * 1000)
    const y = Math.floor(Math.random() * 1000)

    // ジャンプ！
    chara.x = x
    chara.y = y
  }
}


// プレイヤーに伝える
alert('jキーにジャンプ機能を追加したよ！')
```


### 稲妻ダッシュ

```javascript
chara.speed = 0 // 標準移動を無効化する

let ax=0 // x方向の加速度
let ay=0 // y方向の加速度
window.onkeydown = (e) => {
  //キーを押した時に加速度を追加する
  switch (e.key) {
    case 'w': // wキー
      ay = -25
      break
    case 's': // sキー
      ay = 25
      break
    case 'a': // aキー
      ax = -25
      break
    case 'd': // dキー
      ax = 25
      break
  }
}


// 加速度を計算
update(() => {
  // x座標の計算
  if(ax !== 0) {
    chara.x += ax // 加速度だけ移動する

    // 加速度を下げる
    if(ax > 0) {
      ax--
    } else {
      ax++
    }
  }

  // y座標の計算
  if(ay !== 0) {
    chara.y += ay // 加速度だけ移動する

    // 加速度を下げる
    if(ay > 0) {
      ay--
    } else {
      ay++
    }
  }
})



// プレイヤーに伝える
alert('黒いあのＧを思い出す動き...')
```