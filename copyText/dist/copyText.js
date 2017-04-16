/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Jsonz on 17/04/16
 * CopyText 将文本copy到剪切板 支持pc && web。 有兼容问题 H5 建议用原生copy接口
 * @param {Object} options 配置参数
 * @property {String} text 要复制的文本
 * @property {Function} success 成功回调
 * @property {Function} error 失败回调
 * 
 * CopyText.isSupported 判断当前环境是否支持copy事件
 */

var CopyText = function () {
    function CopyText(options) {
        _classCallCheck(this, CopyText);

        this.resolveOptions(options);
        this.init();
    }

    // 配置参数


    _createClass(CopyText, [{
        key: 'resolveOptions',
        value: function resolveOptions() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            this.text = options.text;
            this.successCb = typeof options.success === 'function' ? options.success : function () {};
            this.errorCb = typeof options.error === 'function' ? options.error : function () {};
        }

        // 初始化函数

    }, {
        key: 'init',
        value: function init() {
            if (CopyText.isSupported()) this.selectFake();else this.handleResult(false);
        }

        // 创建虚拟dom && copy

    }, {
        key: 'selectFake',
        value: function selectFake() {
            var _this = this,
                _styleFn;

            var isRTL = document.documentElement.getAttribute('dir');
            this.removeFake();
            this.fakeHandlerCallback = function () {
                return _this.removeFake();
            };
            this.fakeHandler = document.addEventListener('click', this.fakeHandlerCallback) || true;
            this.fakeEl = document.createElement('textarea');
            var yPosition = window.pageYOffset || document.documentElement.scrollTo;
            styleFn(this.fakeEl, (_styleFn = {
                fontSize: '12pt',
                border: '0',
                margin: '0',
                padding: '0',
                position: 'absolute'
            }, _defineProperty(_styleFn, isRTL ? 'right' : 'left', '-9999px'), _defineProperty(_styleFn, 'top', yPosition + 'px'), _styleFn));
            this.fakeEl.setAttribute('readonly', '');
            this.fakeEl.value = this.text;

            document.body.appendChild(this.fakeEl);
            this.selectedText = this.selectDom(this.fakeEl);
            this.copyText();
        }

        // 移除虚拟dom

    }, {
        key: 'removeFake',
        value: function removeFake() {
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

    }, {
        key: 'selectDom',
        value: function selectDom(el) {
            var selectedText = void 0;
            el.select();
            el.setSelectionRange(0, el.value.length);
            el.removeAttribute('readonly');
            return el.value;
        }

        // copy

    }, {
        key: 'copyText',
        value: function copyText() {
            var succeeded = void 0;
            try {
                succeeded = document.execCommand('copy');
            } catch (e) {
                succeeded = fale;
            }
            this.handleResult(succeeded);
        }

        // 回调

    }, {
        key: 'handleResult',
        value: function handleResult(succeeded) {
            succeeded ? this.successCb() : this.errorCb();
        }

        // 判断是否支持该事件

    }], [{
        key: 'isSupported',
        value: function isSupported() {
            var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'copy';

            return !!document.queryCommandSupported && !!document.queryCommandSupported(action);
        }
    }]);

    return CopyText;
}();

var styleFn = function styleFn(el, opts) {
    if ((typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) !== 'object' || !el.nodeType) return;
    for (var key in opts) {
        el.style[key] = opts[key];
    }
    return el;
};

module.exports = CopyText;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _copyText = __webpack_require__(0);

var _copyText2 = _interopRequireDefault(_copyText);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.getElementById('btn').addEventListener('click', function () {
    new _copyText2.default({
        text: '这是复制的文案',
        success: function success() {
            console.log('成功');
        },
        error: function error() {
            console.log('失败');
        }
    });
});

/***/ })
/******/ ]);