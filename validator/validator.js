/**
 * @Author: Jsonz
 * @Create Date:  2017-04-27
 * 继承 ValidatorBase 封装一些和业务有关的逻辑 具体用法可以看该类
 * @param {object} this 
 * @property {string} changeClass 改变的class方法
 * @property {function} callbackItem 每次单个input触发事件后的回调 (instance, type)
 * @property {string} type 触发的事件名 如 input, keyup, blur, focus等
 * @class Validator
 * @extends {ValidatorBase}
 * @API FN {validate} 手动触发验证方法
 */

import ValidatorBase from './validatorBase';
class Validator extends ValidatorBase {
    constructor(opts={}) {
        opts.autoFocus = typeof opts.autoFocus === 'undefined'? true: opts.autoFocus;
        super(opts);
        this.callbackItem = opts.callbackItem;
        this.changeClass = opts.changeClass;
        this.type = opts.type || 'blur';
        this.initHandle();
        return this;
    }

    initHandle() {
        this.el = {};
        for (let key in this.fields) {
            let el = this.form[key];
            let field = this.fields[key];
            if (!el || !field) continue;
            this.el[key] = el;
            if (el.getAttribute('has-validator'))
                return console.warn('绑定两次验证事件', el, field);

            el.addEventListener(this.type, (e) => {
                this.callbackItem(this.validateField(this.addFieldState(el, field)), this.type);
            });
            el.setAttribute('has-validator', true);
        }
    }
}

export default Validator;