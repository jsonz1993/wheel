/**
 * Created by Jsonz@github.com/jsonz1993 on 17/04/16
 * CopyText 将文本copy到剪切板 支持pc && web。 有兼容问题 H5 建议用原生copy接口
 * @param {Object} options 配置参数
 * @property {String} text 要复制的文本
 * @property {Function} success 成功回调
 * @property {Function} error 失败回调
 * 
 * CopyText.isSupported 判断当前环境是否支持copy事件
 */

export default class CopyText {
    constructor(options) {
        this.resolveOptions(options);
        this.init();
    }

    // 配置参数
    resolveOptions(options= {}) {
        this.text = options.text;
        this.successCb = typeof options.success === 'function'? options.success: ()=> {};
        this.errorCb = typeof options.error === 'function'? options.error: ()=> {};
    }

    // 初始化函数
    init() {
        if (CopyText.isSupported()) this.selectFake();
        else this.handleResult(false);
    }

    // 创建虚拟dom && copy
    selectFake() {
        const isRTL = document.documentElement.getAttribute('dir');
        this.removeFake();
        this.fakeHandlerCallback = ()=> this.removeFake();
        this.fakeHandler = document.addEventListener('click', this.fakeHandlerCallback) || true;
        this.fakeEl = document.createElement('textarea');
        let yPosition = window.pageYOffset || document.documentElement.scrollTo;
        styleFn(this.fakeEl, {
            fontSize: '12pt',
            border: '0',
            margin: '0',
            padding: '0',
            position: 'absolute',
            [isRTL? 'right': 'left']: '-9999px',
            top: `${yPosition}px`,
        });
        this.fakeEl.setAttribute('readonly', '');
        this.fakeEl.value = this.text;

        document.body.appendChild(this.fakeEl);
        this.selectedText = this.selectDom(this.fakeEl);
        this.copyText();
    }

    // 移除虚拟dom
    removeFake() {
        if (this.fakeHandler) {
            document.body.removeEventListener('click', this.fakeHandlerCallback);
            this.fakeHandler = null;
            this.fakeHandlerCallback = null;
        }
        if (this.fakeEl) {
            document.body.removeChild(this.fakeEl);
            this.fakeEl = null;
        }
    }

    // 选择dom
    selectDom(el) {
        let selectedText;
        el.select();
        el.setSelectionRange(0, el.value.length);
        el.removeAttribute('readonly');
        return el.value;
    }

    // copy
    copyText() {
        let succeeded;
        try {
            succeeded = document.execCommand('copy');
        } catch(e) {
            succeeded = fale;
        }
        this.handleResult(succeeded); // 事件回调处理
    }

    // 回调
    handleResult(succeeded) {
        succeeded? this.successCb(): this.errorCb();
    }

    // 判断是否支持该事件
    static isSupported(action= 'copy') {
        return !!document.queryCommandSupported && !!document.queryCommandSupported(action);
    }
}

const styleFn = (el, opts)=> {
    if (typeof opts !== 'object' || !el.nodeType) return;
    for (let key in opts) {
        el.style[key] = opts[key];
    }
    return el;
}