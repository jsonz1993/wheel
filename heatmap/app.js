// style 方法
const styleFn = (el, styleObj = {}) => {
  if (!el) throw new Error(el);
  for (let [key, value] of Object.entries(styleObj)) {
    el.style[key] = value;
  }
  return el;
};

/**
 * 需要发送到后台的数据
 * { url, screenH, screenW, list: [{x, y, pageX, pageY}] }
 * 发送到后台的时机：
 *  1. 可控的 定时发送 必须要list有更新才发送
 */
class HeatCollect {
  constructor(opts = {}) {
    this.initProps(opts);
    this.setDataForServer();
    return this;
  }

  initProps(opts) {
    this.list = [];
    this.url = location.href;
    this.screenHeight = window.screen.height;
    this.screenWidth = window.screen.width;
    this.serverCode = '1001';
    this.index = 0;
    this.timer = null;
    this.time = opts.time || 2;
    this.maxLength = opts.maxLength || 100;
    this.Time = 0;
    this.queue = []; // 队列 暂存请求的坐标
  }

  push(obj) {
    obj.index = ++this.index;
    this.list.push(obj);
    this.list = this.list.splice(0, 100); // 防止恶意过长
    return this.list;
  }

  getServerData() {
    return {
      list: this.queue,
      url: this.url,
      screenHeight: this.screenHeight,
      screenWidth: this.screenWidth,
      serverCode: this.serverCode,
      timestamp: Date.now(),
    }
  }

  setDataForServer() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.queue = this.list.splice(0, Math.min(this.list.length, 100));
      if (!this.queue.length) return this.setDataForServer();

      Server.setData(this.getServerData()).then(({
        code
      }) => {
        if (code === 0) {
          this.queue = [];
        } else {
          this.list = this.queue.concat(this.list);
        }
      }, () => {
        this.list = this.queue.concat(this.list);
      }).then(() => {
        this.setDataForServer();
      });

    }, this.time * 1000)
  }

}

/**
 * 绘制函数
 */
class Draw {
  constructor() {
    this.initCanvas();
    return this;
  }

  initDom() {
    let dom = document.createElement('div'),
      domParent = document.createElement('div');
    dom.id = 'heatmapContainer';
    domParent.id = 'heatmapContainerWrapper';
    domParent.appendChild(dom);
    domParent.style.height = document.documentElement.offsetHeight + 'px';
    domParent.style.width = document.documentElement.offsetWidth + 'px' ;
    document.body.appendChild(domParent);
  }

  initCanvas() {
    this.initDom();
    this.heatmap = h337.create({
      container: document.getElementById('heatmapContainer'),
      maxOpacity: .6,
      radius: 50,
      blur: .90,
      backgroundColor: 'rgba(0, 0, 0, .1)'
    });
  }

  draw(list) {
    for (let i = 0; i < list.length; i++) {
      this.heatmap.addData(this.getDrawData(list[i]));
    }
  }

  getDrawData(data) {
    return {
      x: data.pageX,
      y: data.pageY,
      value: 1
    }
  }
}


/**
 * 处理兼容等工具类
 */
const Util = {

  // 获取鼠标坐标
  getMouseInfo(e) {
    let {
      officeX,
      officeY
    } = this.getPageOffice(), {
      clientX: x,
      clientY: y
    } = e;
    return {
      pageX: officeX + x,
      pageY: officeY + y,
      x,
      y,
    }
  },

  // 获取页面高宽
  getPageOffice() {
    let officeY = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop || 0,
      officeX = document.documentElement.scrollLeft || window.pageXOffset || document.body.scrollLeft || 0;
    return {
      officeX,
      officeY
    }
  },
  
};


/**
 * 入口函数
 */
const Main = {
  init() {
    this.infoData = new HeatCollect();
    this.draw = new Draw();
    document.documentElement.addEventListener('click', (e) => this.mouseEvent(e));
  },

  mouseEvent(e) {
    let _mouseData = Util.getMouseInfo(e);
    this.infoData.push(_mouseData);
  },

  drawFn() {
    let list = JSON.parse(sessionStorage.getItem('test') || '{}').list || [];
    this.draw.draw(list);
  }
};
Main.init();
Main.drawFn();



// 模拟发送请求
const Server = {
  setData(data) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        let isSuccess = Math.random() < .95;
        if (isSuccess) {
          let oldData = sessionStorage.getItem('test');
          if (oldData) {
            oldData = JSON.parse(oldData);
            oldData.list = oldData.list.concat(data.list);
          } else {
            oldData = data;
          }
          sessionStorage.setItem('test', JSON.stringify(oldData));
          console.log('success', oldData.list);
          res({
            code: 0,
            data
          })
        } else {
          rej({
            code: 5000
          })
        }
      }, 2000);
    });
  }
};

