---
title: postMessage 消息传递
tags:
  - work
  - JavaScript
  - learn
categories:
  - technology
date: 2017-08-10 19:26:58
---

## 背景

最近捣鼓一个小项目， 做了一个后台管理平台 里面要对线上项目做一个操作 显示热力图。
所以只能采用 `iframe` 去嵌套，再做其他操作。
包括 加载相对的js脚本（热力图脚本 称heatmap.js)， 在后台筛选日期 地点时 `heatmap.js` 要做对应的操作
因为后台的域和前端不一致 所以跨域操作 首选用 `postMessage`

## postMessage api

```JavaScript
otherWindow.postMessage(message, targetOrigin, [transfer] )

otherWindow: 其他窗口的一个引用，比如iframe的contentWindow属性、执行window.open返回的窗口对象、或者是命名过或数值索引的window.frames。

message: 将要发送到其他 window的数据。它将会被结构化克隆算法序列化。这意味着你可以不受什么限制的将数据对象安全的传送给目标窗口而无需自己序列化。

targetOrigin: 通过窗口的origin属性来指定哪些窗口能接收到消息事件，其值可以是字符串"*"（表示无限制）或者一个URI。在发送消息的时候，如果目标窗口的协议、主机地址或端口这三者的任意一项不匹配targetOrigin提供的值，那么消息就不会被发送；只有三者完全匹配，消息才会被发送。这个机制用来控制消息可以发送到哪些窗口；例如，当用postMessage传送密码时，这个参数就显得尤为重要，必须保证它的值与这条包含密码的信息的预期接受者的orign属性完全一致，来防止密码被恶意的第三方截获。如果你明确的知道消息应该发送到哪个窗口，那么请始终提供一个有确切值的targetOrigin，而不是*。不提供确切的目标将导致数据泄露到任何对数据感兴趣的恶意站点。

transfer 可选
是一串和message 同时传递的 Transferable 对象. 这些对象的所有权将被转移给消息的接收方，而发送一方将不再保有所有权。
```

需要注意的是

message 不可以包含 dom对象, 可以把验证或校对信息放置在 message 一并发送出去


## 小demo

```html a.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
</head>
<body>
    <iframe src="./demo1.html" frameborder="0" name="iframe1"></iframe>
    <script>
        const iframeWindow = document.iframe1
        iframeWindow.addEventListener('load', function() {
            iframeWindow.postMessage({
                type: 'script',
                evalFn: 'alert(1)'
            }, '*')
        })

        window.addEventListener('message', ()=> {
            console.log('parent message ')
        })
        
    </script>
</body>
</html>
```

```html b.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
</head>
<body>
    <h1>hello</h1>
    <script>
        window.addEventListener('message', event=> {
            console.log(event)
            const { evalFn, type } = event.data
            const { source } = event
            console.log(type, evalFn)
            if (type === 'script') eval(evalFn)
            source.postMessage('bilibili', '*')
        })
    </script>
</body>
</html>
```

![event 输出格式](./post_message_data.png)

## 实际应用小例子

```JavaScript admin-iframe/index.js
...
const iframeWindow = iframe.contentWindow
this.initMessenger = new postMessage(iframeWindow, 'initPostMessage')
this.initMessenger.send({type: 'asyncLoadScript', data: {src: config.heatmapJs}})

// heatmapMessage 处理与heatmap-show相关的事件
this.heatmapMessenger = new postMessage(iframeWindow, 'heatmap')
// 每次跳转页面或load 都重新在state 更新事件到heatmap-show

this.targetMessenger.listen('loadSuccess', ()=> {
  const { startTime, endTime, site, continent, isHeatmap } = this.props.heatmap
  this.heatmapMessenger.send({type: 'initFilter', data: {
    date: [startTime, endTime],
    site,
    isHeatmap
  }})
})
...
```

```JavaScript postMessage.js

/*
 * @Author: Jsonz 
 * @Date: 2017-08-05 15:42:15 
 * @Last Modified by: Jsonz
 * @Last Modified time: 2017-08-05 16:15:44
 * 
 * const messenger = new Messenger(window, 'heatmap')
 * messenger.send({ type: 'changeType', data: { } })
 * messenger.listen({ type: 'changeType', cb: ()=> {} })
 */

class Messenger {
  constructor(target, prefix) {
    this.target = target
    this.prefix = prefix
    this.listenFunc = []
    this.initListen()
  }

  send(msg) {
    if (!msg.type) throw new Error('postMessage send 没有传type')
    msg.type = this.prefix + '__' + msg.type
    this.target.postMessage(msg, '*')
  }

  listen(type, cb) {
    const len = this.listenFunc.length
    type = this.prefix + '__' + type
    let cbIsExist = false
    for (let i= 0; i< len; i++) {
      if (this.listenFunc[i].type === type) {
        cbIsExist = true
        break
      }
    }

    if (!cbIsExist) this.listenFunc.push({ cb, type })
  }

  initListen() {
    const cb= event=> {
      let messageObj
      if (typeof event === 'object' && event.data) messageObj = event.data
      if (!messageObj.type || !messageObj.type.includes('__')) return
      for (let i= 0; i< this.listenFunc.length; i++) {
        let itemFn = this.listenFunc[i]
        if (itemFn.type === messageObj.type) itemFn.cb(messageObj.data)
      }
    }

    window.addEventListener('message', cb, false)
  }
}

// modules.export = Messenger
export default Messenger

```


## 参考

[blog](https://jsonz1993.github.io/2017/08/postMessage-%E6%B6%88%E6%81%AF%E4%BC%A0%E9%80%92/)

### [postMessage MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage)

### caniuse <iframe height=498 width="100%" src="http://caniuse.com/#search=postmessage" frameborder=0 allowfullscreen></iframe>

### arale/messenger/index.js