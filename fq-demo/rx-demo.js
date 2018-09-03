// 我们现在来实现一个功能，页面上有一个按钮，点击之后输出计数
const { fromEvent, operators: { scan, throttleTime, map } } = rxjs;

// 普通版本
{
  let count = 0;
  const button = document.querySelector('#b1');
  button.addEventListener('click', ()=> {
    count += 1; // 用到外部变量
    console.log(`clicked!${count} times`);
  });
}

// RxJs版本
{
 const button = document.querySelector('#b2');

 fromEvent(button, 'click')
  .pipe(
    // scan 随着时间的推移进行归并。
    scan((count)=> count+ 1, 0)
  )
  .subscribe(count=> console.log(`clicked! ${count} times`));
}

// 添加节流和累加点击坐标

// 普通版本
{
  let count = 0;
  const button = document.querySelector('#b3');
  const rate = 1000;
  let lastClick = Date.now() - rate;
  button.addEventListener('click', (e)=> {
    if (Date.now() - lastClick >= rate) {
      count += e.clientX;
      console.log(`clicked!${count} times`);
      lastClick = Date.now();
    }
  });
}

// Rx版本
{
 
 const button = document.querySelector('#b4');

 fromEvent(button, 'click')
  .pipe(
    throttleTime(1000),
    map(e=> e.clientX),
    scan((count, clientX)=> count+ clientX, 0)
  )
  .subscribe(count=> console.log(`clicked! ${count} times`));
}