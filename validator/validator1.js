/**
 * 验证类
 * @param {object} opts
 * @property {object|string} form dom元素 || id名 建议直接传入from元素
 * @property {isLazy} 是否有验证不通过就停止 默认跑完全部验证
 * @property callback 回调事件 (instance, [event])
 * @property fields 验证的具体规则
 *  {
 *    name: 'email', // input's name
      display:"你输入的不是合法邮箱|太长|太短",
      rules: 'email|maxLength(12)|minLength(10)' // 验证条件
     }
 *
 * 表单事件，会拦截submit事件。提交前执行验证，失败则触发回调callback
 * 可以通过 instance.validate调用 返回 Promise(instance);
 *
 * [demo]
let validator = new Validator({
  el: 'form',
  fields: [
    {
      name: 'email', //name 字段
      display:"你输入的不是合法邮箱|太长|太短",
      rules: 'email|maxLength(12)|minLength(10)' // 验证条件
    }, {
      name:'phone',
      display: '你输入错误了',
      rules: 'phone|maxLength(12)'
    }
  ],
  isLazy: true,
  callback: function(obj,evt) {
    if (obj.errors) {
      console.log(obj.errors);
    }
  }
});
dom.addEventListener('click', function () {
  validator.validate().then(e=> console.log(e.errors));
});
 *
 */
class Validator {
  constructor(opts) {
    this.initProps(opts);
    for (let i = 0; i < opts.fields.length; i++) {
      let field = opts.fields[i];
      // 如果通过不正确，我们需要跳过该领域(表单)
      if (!field.name || !field.rules) {
        return console.warn(field);
      }
      this.addField(field, field.name);
    }

    let _onSubmit = this.form.onsubmit;
    this.form.onsubmit = (e) => {
      try {
        this._validate(e);
        _onSubmit && _onSubmit();
      } catch (e) {
        console.warn(e)
      }
    }

  }

  // 初始化属性 方法 && 参数
  initProps(opts) {
    Object.assign(this, _testHook); // 添加一些静态验证方法
    this.callback = opts.callback;
    this.form = formElm(opts.el) || {};
    this.errors = [];
    this.handles = {};
    this.fields = {};
    this.isLazy = opts.isLazy;
  }

  // 外部调用
  validate() {
    this.errors = [];
    for (let key in this.fields) {
      if (this.errors.length && this.isLazy || !this.fields.hasOwnProperty(key)) continue;
      let field = this.fields[key] || {},
        el = this.form[field.name];
      if (!!el) {
        this.validateField(this._initEl(el, field));
      }
    }
    return new Promise(res => res(this));
  }

  // 内部调用，提交时会调用
  _validate(e) {
    this.validate(e);

    if (this.errors.length > 0) {
      e.preventDefault();
    }

    this.callback(this, e);
  }

  // 根据el 初始化一些参数配置等
  _initEl(el, field) {
    return Object.assign(field, {
      type: el.length > 0 ? el[0].type : el.type,
      value: attribute(el, 'value'),
      checked: attribute(el, 'checked'),
      id: attribute(el, 'id'),
      el
    });
  }

  // 验证的方法具体实现
  validateField(field) {
    let rules = field.rules.split('|');
    for (let i = 0; i < rules.length; i++) {
      let method = rules[i],
        parts = regexs.rule.exec(method),
        param = null,
        failed = false;

      if (parts) {
        method = parts[1];
        param = parts[2];
      }
      if (typeof this[method] === 'function') {
        if (!this[method].apply(this, [field, param])) {
          failed = true;
        }
      }

      if (regexs[method] && /^regexp\_/.test(method)) {
        if (!regexs[method].test(field.value)) {
          failed = true;
        }
      }

      if (failed) {
        let message = (() => field.display.split('|')[i])();

        let existingError;
        for (let j = 0; j < this.errors.length; j++) {
          if (field.el === this.errors[j].el) existingError = this.errors[j];
        }
        let errorObject = existingError || {
            id: field.id,
            display: field.display,
            el: field.el,
            message,
            rule: method,
            val: field.el.value,
          };
        if (!existingError) this.errors.push(errorObject);
        return errorObject;
      }
    }
    return true;
  }

  // 构建具有所有需要验证信息
  addField(field, name) {
    this.fields[name] = {
      display: field.display || name,
      rules: field.rules,
      id: null,
      element: null,
      type: null,
      value: null,
      checked: null,
      name
    };
    for (let key in field) {
      if (field.hasOwnProperty(key) && /^regexp\_/.test(key)) {
        regexs[a] = field[key];
      }
    }
  }
}


// 正则规则
const regexs = {
  rule: /(.+?)\((.+)\)$/, // max_length(12 => ["max_length", 12]
  number: /^[0-9]+$/, // 数字
  email: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/, // 邮箱
  fax: /^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/, // 国家代码(2到3位)-区号(2到3位)-电话号码(7到8位)-分机号(3位)
  phone: /^((\+?[0-9]{1,4})|(\(\+86\)))?(13[0-9]|14[57]|15[012356789]|17[03678]|18[0-9])\d{8}$/, // phone
};

const attribute = (el, attr) => {
  let len = el.length;
  if ((len > 0) && (['checkbox', 'radio'].includes(el[0].type))) {
    for (let i = 0; i < len; i++) {
      if (el[i].checked) return el[i][attr];
    }
    return;
  }
  return el[attr];
};
const backVal = field => typeof field === 'string' ? field : field.value;
const formElm = elm => typeof elm === 'object' ? elm : document.getElementById(elm);

// 正则验证方法
const _testHook = (() => {
  let _obj = {
    required: field => {
      let val = backVal(field);
      return (['checkbox', 'radio'].includes(field.type)) ? field.checked === true : (val !== null && val !== '');
    },

    maxLength: (field, length) => {
      return (!regexs.number.test(length)) ? false : backVal(field).length <= parseInt(length, 10)
    },

    minLength: (field, length) => (!regexs.number.test(length)) ? false : backVal(field).length >= parseInt(length, 10),

  };
  ['email', 'tel', 'phone', 'number'].forEach(item => {
    _obj[item] = field => regexs[item].test(backVal(field));
  });

  return _obj;
})();



// export default Validator;
// export {
//   Validator,
//   _testHook as testFn
// }
