---
title: 自动化测试 puppeteer 与qq空间
tags:
  - github
  - JavaScript
  - learn
categories:
  - technology
date: 2018-03-12 15:39:25
---

# 项目背景

emmmm 前几天女朋友想加我qq。才想到 万年没用的qq里面qqZone 遗留着千年前的一堆中二留言 && 中二说说。 刚好最近有接触到 自动化测试 [puppeteer](https://github.com/GoogleChrome/puppeteer) 框架， 就想着写个脚本去自动删掉留言板和说说。 整个项目基于 node8 运行 用的 async await语法。

# 概述
首先 puppeteer 可以理解为 是谷歌出的一个无UI版本的Chrome。

![1.png](./1.png)

先从 puppeteer 实例化出一个 `Browser`， 根据 `Browser`去new 一个 `Page`。
这个Page可以理解成 我们平时浏览器的一个 tab。 一般操作都是基于 Page去实现的

Page 提供了很多简单易用的api用于操作网页元素， 基本都是异步操作，所以直接用 async/await 非常方便快捷简单易懂。

- 比如获取元素: `page.$('#switcher_plogin')` 
- 在输入框填入特定信息，每次输入间隔100毫秒模拟输入: `page.type('#mytextarea', 'World', {delay: 100});`
- 选择下拉框: `Page.select('select#colors', 'blue');`


# 项目细节

## 项目初始化与登录步骤

首先我们要打开 qq空间 的页面 并登录

```JavaScript
// 常用操作的工具函数
function pageTool(page) {
  const _page = {

    async _click(selector) {
      await page.waitForSelector(selector, { visible: true });
      return page.click(selector);
    },

    async _waitForNavigation(opts = {}) {
      return await page.waitForNavigation({ waitUntil: 'domcontentloaded', ...opts });
    },

  }

  Object.assign(page, _page);

  return page;
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true, // 是否显示界面
    devtools: true, // 是否显示开发者工具
    slowMo: 100, // 延迟每一次操作的毫秒数
    ignoreHTTPSErrors: true, // 是否忽略HTTPS错误
  });

  const loginPage = await browser.newPage(); // 打开新tab 获取当前tab的实例
  const page = loginPage;
  
  // 仿真 设置窗口大小与 UA 信息。 这里可以设置为 移动端的。
  // puppeteer 内置了一些设备可供选择 可以通过以下获取：
  // const devices = require('puppeteer/DeviceDescriptors');
  // const iPhone = devices['iPhone 6'];
  loginPage.emulate({ viewport: { width: 1280, height: 800 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3347.0 Safari/537.36' });

  // 打开特定链接，并等待3秒钟
  // PS: 一般是用 page.waitForNavigation 去等待页面加载，这里网络问题经常会出现卡住 所以简单设置为等3s
  await loginPage.goto('https://i.qq.com/?s_url=http%3A%2F%2Fuser.qzone.qq.com%2F847691625%2Finfocenter&rd=1');
  await loginPage.waitFor(3000);
  
  // 这里封装了一点点常用的操作
  pageTool(loginPage);

  // 打开成功之后 我们开始走登录的步骤了
  (async () => {
  
    // QQ空间里面是用一个 iframe 去装登录的部分，所以这里要先获取 登录iframe对象再进行操作
    const iframeDom = await loginPage.frames().filter(iframe => iframe._name === 'login_frame')[0];

    // 如果有登录qq的话，可以使用快捷登录模式
    const iframeLoginBtn = await iframeDom.$('#img_out_847691625');
    if (iframeLoginBtn) {
      await iframeLoginBtn.click();
    } else {
      // 如果没有登录qq 直接读配置里面的信息去用账户密码登录
      if (data.qq === '你的qq账号') throw new Error('先在a.js 输入qq账号和密码');
      // 密码模式
      const plogin = await iframeDom.$('#switcher_plogin');
      await plogin.click(); //点击账户密码登录的按钮
      const userName = await iframeDom.$('#u');
      await userName.type(data.qq); // 填入账户
      const pw = await iframeDom.$('#p');
      await pw.type(data.pw); // 填入密码
      const loginBtn = await iframeDom.$('#login_button');
      await loginBtn.click(); // 点击登录
    }

    console.log('登录完成');
    // 到这里 登录步骤已经完成 大概涵盖了整个项目的80%操作 其他都是类似的dom操作
  })();

  /** 删除留言板模块代码，见下一个栏目 **/

  /** 删除说说模块代码，见下下个栏目 **/

})();
```

## 删除留言板的功能模块

```JavaScript
  async function delCommit() {
    // 等待一个 .head-nav-menu a[title="留言板"] 的元素 css选择器
    await page.waitForSelector('.head-nav-menu a[title="留言板"]');
    await page.waitFor(1000);
    await page._click('.head-nav-menu a[title="留言板"]');
    await page.waitForSelector('.app_canvas_frame');
    console.log('留言板iframe加载完成');

    // 这里重新获取一个 ifrmae 留言板也是用一个iframe 嵌套进来的....没想到整个qq空间是由一堆的ifrmae堆起来
    const iframeDom = await page.frames().filter(iframe => iframe.url().includes('qzs.qq.com/qzone/msgboard/msgbcanvas.html'))[0];
    await page.waitFor(1000);
    console.log('留言板iframe 获取完成 ', iframeDom);

    const btnBatchBottom = await iframeDom.$('#btnBatchBottom');
    await btnBatchBottom.click();
    console.log('批量点击成功 ', btnBatchBottom);

    let delTime = 1;

    // 一次完整的删除逻辑
    async function delOnes() {
      console.log(`第${delTime}次 删除 开始执行`);

      await page.waitFor(1000);

      const $chkSelectAllBottom = '#chkSelectAllBottom';
      const chkSelectAllBottom = await iframeDom.$($chkSelectAllBottom);
      await chkSelectAllBottom.click();
      if (delTime !== 1) await chkSelectAllBottom.click();
      console.log(`第${delTime}次 删除 点击全选`, chkSelectAllBottom);

      const $delAll = '#btnDeleteBatchBottom';
      const delAll = await iframeDom.$($delAll);
      await delAll.click();
      console.log(`第${delTime}次 删除 点击删除`, delAll)

      const $sureBtn = '.qz_dialog_layer_btn.qz_dialog_layer_sub span';
      await page._click($sureBtn);
      console.log(`第${delTime}次 删除 点击确定`)

      await page.waitFor(3000);

      console.log(`第${delTime}次 删除 执行结束`);
      delTime++;

      // 递归
      const hasCommit = await iframeDom.$('#ulCommentList .bor3');
      if (hasCommit) {
        await delOnes();
      }
    }

    await delOnes();

  };
  // delCommit();
```

## 删除说说模块

```JavaScript
async function delEmotion() {
  await page.waitForSelector('.head-nav-menu a[title="说说"]');
  await page.waitFor(1000);
  await page._click('.head-nav-menu a[title="说说"]');
  await page.waitForSelector('.app_canvas_frame');
  await page.waitFor(1000);
  console.log('说说iframe加载完成');

  const iframeDom = await page.frames().filter(iframe => {
    console.log(iframe.url());
    return iframe.url().includes('qzs.qq.com/qzone/app/mood_v6/html/index.html');
  })[0];
  console.log('说说iframe 获取完成 ', iframeDom);

  let delTime = 1;

  async function delOnes() {
    try {
      console.log(`第 ${delTime}次删除 开始执行`);

      const moreBtn = await iframeDom.$('.dropdown-trigger.c_tx');
      await moreBtn.hover();
      console.log(`第 ${delTime}次删除 展示删除按钮`);

      const delBtn = await iframeDom.$('.del.del_btn.author_display');
      await delBtn.click();
      console.log(`第 ${delTime}次删除 点击删除按钮`);

      await page.waitForSelector('.qz_dialog_layer_btn.qz_dialog_layer_sub span');
      const delBtnSure = await page.$('.qz_dialog_layer_btn.qz_dialog_layer_sub span');
      await delBtnSure.click();

      await page.waitFor(1000);
      console.log(`第 ${delTime}次删除 点击确定按钮`);

      console.log(`第 ${delTime} 次删除 执行结束`);

      if (delTime % 10 === 0) await nextPage();

      await page.waitFor(1000);
      delTime++;
      await delOnes();
    } catch (e) {
      console.log(e, '报错了 尝试方案');
      await delOnes();
    }
  }

  try {
    await delOnes();
  } catch (e) {
    console.log(`第${delTime}次 出错 重新try 一遍`)
    await delOnes();
  }

  async function nextPage() {
    console.log(`第${delTime}次执行 遇到跳转`);
    const nextBtn = await iframeDom.$('a[title="下一页"]');
    nextBtn.click();
    console.log(`第${delTime}次执行 点击跳转`);
    await page.waitFor(5000);
    console.log(`第${delTime}次执行 跳转结束`);
  }
}
```

# 项目总结

大概代码都丢👆了 ，附上 __[源码地址](https://github.com/jsonz1993/wheel/tree/master/qqZone)__ 在 `a.js` 填上账号密码。 
再打开源码里面的 `// await delCommit();` 或者 `// await delEmotion();` 来删除 留言板或说说。没有做并发操作 所以只能执行一种功能。
修改完之后`npm install && node app.js` 就可以跑了。

项目中遇到几个问题：

1. page.waitForNavigation(options) 一直等不到完成状态, 30s 超时报错
可能是一直有一些脚本挂掉或者在loading。所以后面换成 等待3秒 虽然比较 low。。。但是可行

2. iframe 里面的dom元素不能直接通过 page.$ 获取，需要先获取 iframe 再通过这个 iframe去获取想要的dom元素

3. 就算是浏览器执行 模拟人为删除，但是连续删除太多行数据的时候， 还是会触发 腾讯的验证码机制。
原本用 puppeteer 截图api 去获取验证码，然后用 [Tesseract](https://github.com/tesseract-ocr/tesseract) 去识别验证码。但是发现说 识别的有效率极低... 也没有去折腾数据训练。 后面就放弃验证码这一块的技术识别，出了验证码就先不跑 隔断时间再跑。


最后给出完整的项目演示

删除留言板功能演示
<video src="./1.mov" width="320" height="240" controls="controls">
删除留言板功能演示
</video>

删除说说功能演示
<video src="./2.mov" width="320" height="240" controls="controls">
删除说说功能演示
</video>

日志输出
![log](./log.png)

# [源码地址](https://github.com/jsonz1993/wheel/tree/master/qqZone)