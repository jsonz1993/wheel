const video = {
  init() {
    this.domInput = document.getElementById('inputFile');
    this.domVideo = document.getElementById('video');
    this.canvasVideo = document.createElement('canvas');
    this.canvasShow = document.getElementById('canvasShow');
    this.ctxVideo = this.canvasVideo.getContext('2d');
    this.ctxShow = this.canvasShow.getContext('2d');
    this.size = { w: 0, h: 0};

    this.bindEvent();
  },

  bindEvent() {
    this.handleChangeInput();
  },

  handleChangeInput() {
    this.domInput.addEventListener('change', async({target: { files}})=> {
      this.clear();
      const file = files[0];
      this.lastUrl = URL.createObjectURL(file);
      this.domVideo.src = this.lastUrl;
      await new Promise(res=> this.domVideo.addEventListener('canplay', res));
      this.handleVideoInit();
    });
  },

  handleVideoInit() {
    const { domVideo, canvasVideo, size, canvasShow } = this;
    domVideo.currentTime = 0;
    size.w = domVideo.width = canvasVideo.width = canvasShow.width = domVideo.videoWidth * .5;
    size.h = domVideo.height = canvasVideo.height = canvasShow.height = domVideo.videoHeight * .5;
    this.video2Img();
  },

  async video2Img({
    timePoint= 0,
    curT= Date.now(),
    prevT= Date.now(),
    prevInterval,
  }= {}) {
    const { ctxVideo, domVideo, canvasVideo, size: { w, h}} = this;
    domVideo.currentTime = timePoint;
    await new Promise(res=> this.domVideo.addEventListener('canplay', res));
    ctxVideo.drawImage(domVideo, 0, 0, w, h);
    this.drawOnce();

    let _interval = Math.max((curT - prevT), 16) / 1000;
    if (curT - prevT !== 0) _interval -= prevInterval;
    await new Promise(res=> setTimeout(res, _interval*1000));
    const nextTimePoint = _interval + timePoint;
    if (nextTimePoint > domVideo.duration) return this.clear(false);

    this.tId = window.requestAnimationFrame(()=> this.video2Img({
      timePoint: nextTimePoint,
      prevT: curT,
      curT: Date.now(),
      prevInterval: _interval,
    }));
  },

  drawOnce() {
    const { ctxVideo, ctxShow, size: {w, h}} = this;
    const { data } = ctxVideo.getImageData(0, 0, w, h);
    ctxShow.clearRect(0, 0, w, h);
    for (let _h= 0; _h< h; _h+= 8) {
      for (let _w= 0; _w< w; _w+= 8) {
        const index = (_w + w * _h) * 4;
        const r = data[index + 0];
        const g = data[index + 1];
        const b = data[index + 2];
        const gray = .299 * r + .587 * g + .114 * b;
        ctxShow.fillText(this.img2Text(gray), _w, _h + 8);
      }
    }
  },

  textList: ['#', '&', '@', '%', '$', 'w', '*', '+', 'o', '?', '!', ';', '^', ',', '.', ' '],

  textList2: ['Aa', 'Bv', 'Cc', 'Dd', '#', '&', '@', '$', '*', '?', ';', '^', '·', '·', '·', '·'],

  img2Text(g) {
    const i = g % 16 === 0 ? parseInt(g / 16) - 1 : parseInt(g/ 16);
    return this.textList[i];
  },

  clear(clearCtx= true) {
    const { tId, ctxShow, ctxVideo, size: {w, h}, lastUrl } = this;
    lastUrl && URL.revokeObjectURL(lastUrl);
    tId && window.cancelAnimationFrame(tId);
    clearCtx && ctxShow.clearRect(0, 0, w, h);
    clearCtx && ctxVideo.clearRect(0, 0, w, h);
  }
}

video.init();