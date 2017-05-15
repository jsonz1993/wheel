var timer = null;

// setTimeout 和 setInterval 都会返回一个 整数编号（定时器的id)用于清除该定时器的

// setTimeout 
// setTimeout 推迟后，执行的回调函数是在全局环境执行
// 执行环境全局 例子1
var x = 1;
var o = {
    x: 2,
    y: function() {
        console.log(this.x)
    }
}

setTimeout(o.y, 1000); // 输出的是1

// 执行环境全局 例子2
function User(login) {
    this.login = login;
    this.sayHi = function() {
        console.log(this.login);
    }
}
var user = new User('Jsonz');
setTimeout(user.sayHi, 1000);

// 解决方法一： 是放到一个匿名函数里面执行, 这样执行的环境就是函数作用域而不是全局
setTimeout(function() {
    user.sayHi();
}, 1000);

// 解决方法二：不直接使用this
document.body.addEventListener('click', function() {
    var self = this;
    setTimeout(function() {
        self.value = 'ok';
    }, 10)
});

// 解决方法三： 使用es6 箭头语法
setTimeout(()=> user.sayHi(), 1000);


// setInterval
// 接受参数
function f() {
    for (var i = 0; i< arguments.length; i++) {
        console.log(arguments[i]);
    }
}

timer = setInterval(f, 1000, 'hello world');
setTimeout(()=> {
    clearInterval(timer)
}, 2000);

// setInterval指定的是函数开始执行的时间间隔，所以实际上，两次执行之间的间隔会小于setInterval指定的时间。
// 假定setInterval指定每100毫秒执行一次， 每次执行需要5ms，那么第一次执行结束后95毫秒，第二次执行就会开始。
// 如果某次执行特别耗时，比如需要105毫秒，那么它结束后，就会立即执行下一次的函数
// 提供demo

// setTimeout 和 setInterval的运行机制是 将代码移除本次执行，等待下一轮的Event Loop再检查是否到了指定的时间
// 所以setTimeout(()=>{}, 0) 可以用来模拟异步操作

function init(){
    //   { 耗时5ms的某个操作 } 
    handleMouseClick();
    //   { 耗时5ms的某个操作 }
    setInterval(timerTask,10);
    // { 耗时5ms的某个操作 }
}

function handleMouseClick(){
//    耗时8ms的某个操作 
}

function timerTask(){
//    耗时2ms的某个操作 
}

// 0-15ms：运行init函数。

// 15-23ms：运行handleMouseClick函数。请注意，这个函数是在5ms时触发的，应该在那个时候就立即运行，但是由于单线程的关系，必须等到init函数完成之后再运行。

// 23-25ms：运行timerTask函数。这个函数是在10ms时触发的，规定每10ms运行一次，即在20ms、30ms、40ms等时候运行。由于20ms时，JavaScript线程还有任务在运行，因此必须延迟到前面任务完成时再运行。

// 30-32ms：运行timerTask函数。

// 40-42ms：运行timerTask函数。


setTimeout(function() { 
  console.log("Timeout");
}, 0);

function a(x) { 
    console.log("a() 开始运行");
    b(x);
    console.log("a() 结束运行");
}

function b(y) { 
    console.log("b() 开始运行");
    console.log("传入的值为" + y);
    console.log("b() 结束运行");
}

console.log("当前任务开始");
a(42);
console.log("当前任务结束");

// 当前任务开始
// a() 开始运行
// b() 开始运行
// 传入的值是 42
// b() 运行结束
// a() 运行结束
// 当前任务结束
// timeout

// 参考链接 http://blog.csdn.net/cxl444905143/article/details/40180491