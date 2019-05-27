# Online Code Game


## これはなに？

オンラインでコードを記述し、自分のキャラクターに機能を追加していって戦うゲームです

[サンプルページ](https://onlinecodegame.herokuapp.com/)

## 始め方

- プレイヤーとして始める
  - 左上のプラスボタンを押すと開始

  - もう一度押すと、自分自身でキャラクターに機能を追加するエディターモードになる

- サポーターとして始める
  - 左側のプラス以外のボタンを押すと開始

  - サポートする相手は最初に押したボタンのキャラクターになる

## プレイヤー基本行動

プレイヤーは相手にぶつかると、自分の攻撃力(power)分だけ相手のHPを減らします

当然、相手と衝突する形になるので、自分のHPも相手の攻撃力分だけ減ります

### プレイヤー初期ボタン

- __w__: 上に速度(speed)分移動

- __a__: 左に速度(speed)分移動

- __s__: 下に速度(speed)分移動

- __d__: 右に速度(speed)分移動


## サポーター基本機能

サポーターは自分がサポートしているキャラクターに機能を追加する事ができます

また、プレイヤーも自身に対してサポーターと同じ機能を持っています

但し、自分自信のキャラクターに機能を追加している間は動けません

### サポーター初期ボタン

- __Escape__: code editor を開く

- __Ctrl + s__: 機能を保存し、プレイヤーに反映する


## update api


### 繰り返し処理を行います

---
繰り返し処理を行い際に使用する api です

これは setinterval の代替になります

繰り返しはおおよそ一秒間に30回繰り返し実行されます

    update = () => { callback }

サンプル
```javascript
// 自動回復機能を追加します
update = () => {
  chara.hpUp(1)
}
```


## chara api

chara api はキャラクターのステータスを操作する api です

charaクラスは初期状態で以下のデータを所持しています


---
chara.x // x座標の位置です。初期状態はランダムで決まります

chara.y   // y座標の位置です。初期状態はランダムで決まります

chara.size = 20  // キャラクターの半径です。衝突判定に利用されます 初期値は20です

chara.color // 見た目の色です。ブラウザの初回読み時にランダムで決まります

chara.hp = 50  // 体力です。初期値は50です

chara.power =  50 // 攻撃力です。初期値は50です

chara.speed =  50 // 移動力です。初期値は50です

chara.resource = 100 // ステータスを変更できるリソースです。初回ブラウザ読み込み時に100になり、ゆっくりと加算されて行きます
---

---
### キャラクターを移動させる

指定したx座標にキャラクターを移動する

    chara.x = value: number

指定したy座標にキャラクターを移動する

    chara.y = value: number


サンプル
```javascript
// キャラクターを {x: 100m, y: 200} に移動する
chara.x = 100
chara.y = 200
```

---
### キャラクターのサイズを変更する

キャラクターのサイズを指定した数値にします

最小値は10で、最大値は100です

    chara.size = value: number

サンプル
```javascript
// キャラクターの体力が少なくなった時に、小さくなって辺りにくくします
update = () => {
  chara.size = chara.hp
}
```


---
### キャラクターの体力を管理する

キャラクターの体力を指定した数値にします

変更時、元の体力の差分だけリソースが変更されます

    chara.hp = value: number


キャラクターの体力を指定した数値だけ加算する

変更時、加算した値だけリソースが変更されます

    chara.hpUp(value: number)

サンプル
```javascript
// キャラクターの体力が10になります
chara.hp = 10

// キャラクターの体力に10加算されて、20になります
// resourceが10消費されます
chara.hpUp(10)

// キャラクターの体力が50になります
// resourceが20消費されます
chara.ho = 50
```

---
### キャラクターの攻撃力を管理する

キャラクターの攻撃力を指定した数値にします

変更時、元の攻撃力の差分の絶対値だけリソースを消費します

    chara.power = value: number


キャラクターの攻撃力を指定した数値だけ加算します

変更時、値の絶対値だけリソースを消費します

    chara.powerUp(value: number)

サンプル
```javascript
// キャラクターの攻撃力が10になります
chara.powe = 10

// キャラクターの攻撃力に10加算されて、20になります
// resourceが10消費されます
chara.powerUp(10)

// キャラクターの攻撃力が50になります
// resourceが20消費されます
chara.ho = 50
```

---
### キャラクターの速度を管理する

キャラクターの速度を指定した数値にします

変更時、元の速度の値だけリソースが変更されます

    chara.speed = value: number


キャラクターの速度を指定した数値だけ加算します

変更時、加算した値だけリソースが変更されます

    chara.speedUp(value: number)

サンプル
```javascript
// キャラクターの速度が10になります
chara.speed = 10

// キャラクターの速度に10加算されて、20になります
// resourceが10消費されます
chara.speedUp(10)

// キャラクターの速度が50になります
// resourceが20消費されます
chara.speed = 50
```

---
### リソースを取得する

現在のリソースを取得します

    chara.resource: number

サンプル
```javascript
// キャラクターの体力をリソースの半分まで加算します
// リソースが半分消費されます
chara.hpUp(chara.resource / 2)

// 攻撃力を現在のリソースの値に変更します
// リソースが消費され、前の攻撃力分だけ残ります
chara.power = chara.resource

// 残りのリソースを速度に追加します
chara.hpUp(chara.resource)
```

---
### 設定を取得します

現在の設定を取得します

    chara.status: {x, y, size, color, hp, power, speed, resource}

サンプル
```javascript
// キャラクターの体力と攻撃力分を入れ替える処理

const beforeHp = chara.status.hp  // 現在の体力を取得する
const beforePower = chara.status.power  // 現在の攻撃力を取得する

// それぞれを入れ替えます
chara.hp = beforePower
chara.power = beforeHp
```


## 更新履歴

5/27
    初期位置がcanvas外になるバグの修正
    chara api に chara.size, chara.color を追加


## ライセンス

ISC @yattali