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