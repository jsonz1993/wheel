
const PENDING = ['PENDING']
const RESOLVED = ['RESOLVED']
const REJECTED = ['REJECTED']

// 这里一般可以用 npm install immediate 
const immediate = fn => setTimeout(fn, 0);

function INTERNAL() { }

class Promise {
  constructor(resolver) {
    if (typeof resolver !== 'function')
      throw new TypeError('resolver must be a function')

    this.status = PENDING // 状态维护
    this.queue = [] // 绑定的队列
    this.outcome = void 0 // 终值
    if (resolver !== INTERNAL) {
      safelyResolveThenable(this, resolver)
    }
  }

  then(onResolved, onRejected) {
    if (
      (typeof onResolved !== 'function' && this.status === RESOLVED) ||
      (typeof onRejected !== 'function' && this.status === REJECTED)
    ) return this

    const promise = new this.constructor(INTERNAL)

    if (this.status !== PENDING) {
      const resolver = this.status === REJECTED ? onRejected : onResolved
      unwrap(promise, resolver, this.outcome)
    } else {
      this.queue.push(new QueueItem(promise, onResolved, onRejected))
    }

    return promise
  }

  // catch 语法糖
  catch(onRejected) {
    this.then(null, onRejected)
  }

  static resolve(value) {
    if (value instanceof this) return value
    return handlers.resolve(new this(INTERNAL), value)
  }

  static reject(error) {
    const promise = new this(INTERNAL)
    return handlers.reject(promise, error)
  }

  static all(iterable) {
    const len = iterable.length
    let called = false
    if (!len) return this.resolve([])

    const values = new Array(len)
    let resolved = 0
    let i = -1
    const promise = new this(INTERNAL)

    const allResolver = (value, i) => {
      this.resolve(value).then(outValue => {
        values[i] = outValue
        if (++resolved === len && !called) {
          called = true
          handler.resolve(promis, values)
        }
      }, error => {
        if (!called) {
          called = true
          handlers.reject(promise, error)
        }
      });
    }

    while (++i < len)
      allResolver(iterable[i], i)

    return promise
  }

  static race(iterable) {
    const len = iterable.length
    let called = false
    if (!len) return this.resolve([])

    let i = -1
    const promise = new this(INTERNAL)
    const resolver = value => {
      this.resolve(value).then(response => {
        if (!called) {
          called = true
          handlers.resolve(promise, response)
        }
      }, error => {
        if (!called) {
          called = true
          handlers.reject(promise, error)
        }
      })
    }

    while (++i < len)
      resolver(iterable[i])
    return promise
  }

}

class QueueItem {
  constructor(promise, onResolved, onRejected) {
    this.promise = promise
    if (typeof onResolved === 'function') {
      this.onResolved = onResolved
      this.callResolved = this.otherCallResolved
    }
    if (typeof onRejected === 'function') {
      this.onRejected = onRejected
      this.callRejected = this.otherCallRejected
    }
  }

  callResolved(value) {
    handlers.resolve(this.promise, value)
  }

  otherCallResolved(value) {
    unwrap(this.promise, this.onResolved, value)
  }

  callRejected(value) {
    handlers.reject(this.promise, value)
  }

  otherCallRejected(value) {
    unwrap(this.promise, this.onRejected, value)
  }
}

const handlers = {
  // (promise, [[PromiseValue]])
  resolve(self, value) {
    const result = tryCatch(getThen, value)
    if (result.status === 'error')
      return this.resolve(self, result.value)
    const thenable = result.value
    if (thenable) {
      safelyResolveThenable(self, thenable)
    } else {
      self.status = RESOLVED
      self.outcome = value
      let i = -1
      const len = self.queue.length
      while (++i < len)
        self.queue[i].callResolved(value)
    }
    return self
  },
  reject(self, error) {
    self.status = REJECTED
    self.outcome = error
    let i = -1
    const len = self.queue.length
    while (++i < len)
      self.queue[i].callRejected(error)
    return self
  }
}

function unwrap(promise, func, value) {
  immediate(function () {
    var returnValue
    try {
      returnValue = func(value)
    } catch (e) {
      return handlers.reject(promise, e)
    }
    if (returnValue === promise) {
      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'))
    } else {
      handlers.resolve(promise, returnValue)
    }
  })
}

function tryCatch(func, value) {
  var out = {}
  try {
    out.value = func(value)
    out.status = 'success'
  } catch (e) {
    out.status = 'error'
    out.value = e
  }
  return out
}

function getThen(obj) {
  const then = obj && obj.then
  if (obj && (typeof obj === 'object' || typeof obj === 'function') && typeof then === 'function')
    return function applyThen(...args) {
      then.apply(obj, args)
    }
}

function safelyResolveThenable(self, thenable) {
  function onError(value) {
    if (self.status !== PENDING) return
    handlers.reject(self, value)
  }

  function onSuccess(value) {
    if (self.status !== PENDING) return
    handlers.resolve(self, value)
  }

  function tryToUnwrap() {
    thenable(onSuccess, onError)
  }

  const result = tryCatch(tryToUnwrap)
  if (result.status === 'error') onError(result.value)
}