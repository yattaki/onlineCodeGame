# Online Code Game


## これはなに？

オンラインでコードを記述し、自分のキャラクターに機能を追加していって戦うゲームです

[サンプルページ](https://onlinecodegame.herokuapp.com/)

## 始め方

### プレイヤーとして始める
- 左上のプラスボタンを押すと開始

 - もう一度押すと、自分自身でキャラクターに機能を追加するエディターモードになる

### サポーターとして始める
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


## update API


### 繰り返し処理を行います

---
繰り返し処理を行い際に使用する API です

これは setinterval の代替になります

繰り返しの初期値はおおよそ一秒間に30回繰り返し実行されます

第二引数を指定することで、繰り返しを遅らせることが可能です

    update(callback: function, timer: number)

サンプル
```javascript
// 自動回復機能を追加します
update(() => {
  chara.hpUp(1)
})
```


## chara API

chara API はキャラクターのステータスを操作する API です

charaクラスは初期状態で以下のデータを所持しています


---
chara.x // x座標の位置です。初期状態はランダムで決まります

chara.y   // y座標の位置です。初期状態はランダムで決まります

chara.size = 20  // キャラクターの半径です。衝突判定に利用されます 初期値は20です

chara.color // 見た目の色です。ブラウザの初回読み時にランダムで決まります

chara.hp = 10  // 体力です。初期値は50です

chara.power =  10 // 攻撃力です。初期値は50です

chara.speed =  10 // 移動力です。初期値は50です

chara.point = 100 // ステータスを変更できるリソースです。初回ブラウザ読み込み時に100になり、ゆっくりと加算されて行きます
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
// キャラクターの体力が少なくなった時に、小さくなって当たりにくくします
update(() => {
    chara.size = chara.hp
})
```


---
### キャラクターの色を変更する

キャラクターの色を指定した色に変更します

指定するカラーコードは ffffff のような rgb形式での記述になります

    chara.color = value: rgb

サンプル
```javascript
// ステータスに応じて色を変える
update(() => {
    const r = Math.max(0, Math.min(255, chara.power)).toString(16).padStart(2, '0')
    const g = Math.max(0, Math.min(255, chara.hp)).toString(16).padStart(2, '0')
    const b = Math.max(0, Math.min(255, chara.speed)).toString(16).padStart(2, '0')
    chara.color = `${r}${g}${b}`
})
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
//pointが10消費されます
chara.hpUp(10)

// キャラクターの体力が50になります
//pointが20消費されます
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
chara.power = 10

// キャラクターの攻撃力に10加算されて、20になります
//pointが10消費されます
chara.powerUp(10)

// キャラクターの攻撃力が50になります
//pointが20消費されます
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
//pointが10消費されます
chara.speedUp(10)

// キャラクターの速度が50になります
//pointが20消費されます
chara.speed = 50
```

---
### リソースを取得する

現在のリソースを取得します

    chara.point: number

サンプル
```javascript
// キャラクターの体力をリソースの半分まで加算します
// リソースが半分消費されます
chara.hpUp(chara.point / 2)

// 攻撃力を現在のリソースの値に変更します
// リソースが消費され、前の攻撃力分だけ残ります
chara.power = chara.point

// 残りのリソースを速度に追加します
chara.hpUp(chara.point)
```

---
### 設定を取得します

現在の設定を取得します

    chara.status: {x, y, size, color, hp, power, speed,point}

サンプル
```javascript
// キャラクターの体力と攻撃力分を入れ替える処理

const beforeHp = chara.status.hp  // 現在の体力を取得する
const beforePower = chara.status.power  // 現在の攻撃力を取得する

// それぞれを入れ替えます
chara.hp = beforePower
chara.power = beforeHp
```


## socket API

socket API は他人とデータをやり取りする為の API です


---
### 自分の socketId を取得する

自身の socketId を返します

接続前に呼び出した場合 undefine を返します

    socket.id

サンプル
```javascript
// ソケットのidを取得します
 sockey.connect().then(() => {
     alert(socket.id)
 })
```


---

### 接続を確認します

promise 構文を返し、接続できた、あるいは既に出来ている場合は resolve を返します

また、resolve の際、引数に関数が指定されている場合は実行されます

        socket.connect([callback: function])

サンプル
```javascript
// ソケットの接続を待機します
 sockey.connect().then(() => {
     alert('接続できた')
 })

 // あるいは
 socket.connect(() => {
     alert('接続できた')
 })
```

---
## 切断を監視します

誰かが接続から外れた時に引数の関数を実行します

    socket.disconnect(callback: function)

サンプル
```javascript
// ソケットの切断を取得します
 sockey.connect().then(() => {
     alert('誰かが抜けた')
 })
```


---
## ソケットを自分以外に送信します

指定したソケット名のソケットを送信します

    socket.broad(socketName: string, ...args: wildcard type)

サンプル
```javascript
// 'declareWar' ソケットを全員に送る
 sockey.on('declareWar', '戦線布告だ！')
```

---
## ソケットを特定の相手に送信します

指定したソケット名のソケットを特定の相手に送信します

    socket.private(socketName: string, socketId: string, ...args: wildcard type)

サンプル
```javascript
// 'declareWar' ソケットを qawsedrf に送る
 sockey.private('declareWar', 'qawsedrf',  '戦線布告だ！')
```

---
## ソケットの発信を監視します

誰から送信されたソケットを取得します

    socket.on(socketName: string, callback: function)

サンプル
```javascript
// 'declareWar' ソケットを受け取る
 sockey.on('declareWar', (message) => {
     alert('宣戦布告を受けた！')
     alert(message)
 })
```


## alert API

alert API はゲーム中に動作がロックされないよう変更したメッセージ API です

デバッグやリソースの確認を開発者モードを開かずとも確認が出来ます

※ デフォルトの alert を上書きしています。デバッグを行う際は conssole.log() からの出力を推奨します

---

確認内容を表示します

    alert(message : number, option: object)



### オプションリスト

option.type: メッセージタイプを指定します
- error: エラーアラートに変更されます。背景が赤くなり、クリックするまで消えません

- warn: 警告アラートに変更されます。背景が黄色くなり、クリックするまで消えません

- confirm: 選択アラートに変更されます。promise構文を返すようになり、クリックした際にクリックしたボタンの名前を resolveします

- delay: 待機アラートに変更されます。finish イベントを返すようになり、発火させることで消えます

option.delay = 5000: 表示時間をミリ秒で指定します 初期状態は5000です

option.yes = , option.no: 選択ボタンの名前を変更します option.type が自動的に confirm に変更されます 引数は String 型です

option.progress: 選択ボタンを追加します option.type が自動的に confirm に変更されます 引数はarray: String 型です

option.finishMessage: 選択ボタンの名前を変更します option.type が自動的に delay に変更されます 引数は String 型です

option.progress: promise 構文が完了するまで待機し、完了後自動で finish イベントを発火させます option.type が自動的に delay に変更されます 引数は array: promise 型です


サンプル
```javascript
// キャラクターの現在ステータスを表示します
alert(chara.status)
```


## 開発者向け

ローカル動作環境準備

1. [Node.js](https://nodejs.org/ja/) をダウンロード

2. Git リポトジ を取得する

    コマンドラインからの取得
    ```
    git clone https://github.com/yattaki/onlineCodeGame.git
    ```
3. サーバーを立ち上げる

    windowsの場合は server.bat をクリックすれば立ち上がります

    コマンドラインからの立ち上げ

    ```
    node server.js
    ```

4. ブラウザから、サーバーにアクセス

    デフォルトポートは3000番になります

    URL: http://localhost:3000


## 使用環境

サーバーサイド

    Node.js v8.11.3

ライブラリ

    pixi.js v5.0.3

## 更新履歴

5/27

    初期位置がcanvas外になるバグの修正
    chara API に chara.size, chara.color を追加

5/29

    pixi.jsをv5.0.3に更新

    pixi.jsのメモリーリークの修正

    ローカルテスト用の bat ファイル追加

    alert API の追加

    eval フィルタの追加

6/3

    resource => point に変更

    ランキング機能の実装

    スタートの変更

## ライセンス

@yattali.

Released under the ISC license.