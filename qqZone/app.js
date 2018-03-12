const puppeteer = require('puppeteer');
const data = require('./a');

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
    headless: true,
    devtools: true,
    slowMo: 100,
    ignoreHTTPSErrors: true,
  });

  const loginPage = await browser.newPage();
  const page = loginPage;
  loginPage.emulate({ viewport: { width: 1280, height: 800 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3347.0 Safari/537.36' });
  pageTool(loginPage);
  debugger;

  await loginPage.goto('https://i.qq.com/?s_url=http%3A%2F%2Fuser.qzone.qq.com%2F847691625%2Finfocenter&rd=1');
  await loginPage.waitFor(3000);

  // 登录步骤
  (async () => {
    const iframeDom = await loginPage.frames().filter(iframe => iframe._name === 'login_frame')[0];

    // 快捷登录模式
    const iframeLoginBtn = await iframeDom.$('#img_out_847691625');
    if (iframeLoginBtn) {
      await iframeLoginBtn.click();
    } else {
      if (data.qq === '你的qq账号') throw new Error('先在a.js 输入qq账号和密码');
      // 密码模式
      const plogin = await iframeDom.$('#switcher_plogin');
      await plogin.click();
      const userName = await iframeDom.$('#u');
      await userName.type(data.qq);
      const pw = await iframeDom.$('#p');
      await pw.type(data.pw);
      const loginBtn = await iframeDom.$('#login_button');
      await loginBtn.click();
    }

    console.log('登录完成');
  })();

  // 删除留言板模块
  async function delCommit() {
    await page.waitForSelector('.head-nav-menu a[title="留言板"]');
    await page.waitFor(1000);
    await page._click('.head-nav-menu a[title="留言板"]');
    await page.waitForSelector('.app_canvas_frame');
    console.log('留言板iframe加载完成');

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
  // await delCommit();

  // 删除说说模块
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
  delEmotion();

})();
