/**
  * @Author: Jsonz
  * @Create Date:  2017-04-27
 * 验证类
 * @param {object} opts
 * @property {object|string} form dom元素 || id名 建议直接传入from元素
 * @property {isLazy} 是否有验证不通过就停止 默认跑完全部验证
 * @property callback 回调事件 (instance, [event])
 * @property fields 验证的具体规则
 * @fn validate @return Promise手动触发验证
 * @fn validateCb 回调函数 参数为 instance
 *
 * 表单事件，会拦截submit事件。提交前执行验证，失败则触发回调callback
 * 可以通过 instance.validate调用 返回 Promise(instance);
 *
 * 
 *{
      name: 'email', // input's name
      display:"你输入的不是合法邮箱|太长|太短",
      rules: 'email|maxLength(12)|minLength(10)' // 验证条件
  }
 [demo]
 let validator = new Validator({
   el: 'form',
   fields: [
     {
       name: 'email', //name 字段
       display:"你输入的不是合法邮箱|太长|太短",
       rules: 'email|maxLength(12)|minLength(10)', // 验证条件
       needValidate: function() { return false }// 跳过验证 直接返回是正确的
     }, {
       name:'phone',
       display: '你输入错误了',
       rules: 'phone|maxLength(12)',
       needValidate: function() { return true }// 需要进行验证
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
    return this;
  }

  // 初始化一些参数配置等
  initProps(opts) {
    Object.assign(this, _testHook);
    this.opts = opts;
    this.errors = [];
    this.fields = {};
    this.isLazy = opts.isLazy;
    this.autoFocus = opts.autoFocus;
    this.form = formElm(opts.el);

    for (let i = 0; i < opts.fields.length; i++) {
      let field = opts.fields[i];
      if (!field.name || !field.rules) {
        return console.warn(field);
      }
      this.addFieldProps(field, field.name);
    }
  }

  // 更新对象
  update(opts) {

  }

  // 外部调用的验证基本方法
  validateBest() {
    this.errors = []; // 每次都把之前的errors 清空
    for (let key in this.fields) {
      if (this.errors.length && this.isLazy) continue;
      let field = this.fields[key] || {},
        elItem = this.form[field.name];
      if (!!elItem) this.validateField(field, elItem);
    }
    this.autoFocus && this.errors.length && this.errors[0].elItem.focus();
  }

  // 外部调用的 Promise版本
  validate() {
    this.validateBest();
    return new Promise(res => {
      res(this);
    });
  }

  // 外部调用的 回调版本
  validateCb(cb) {
    this.validateBest();
    cb(this);
  }

  // 验证方法
  validateField(fieldItem, elItem) {
    let field = fieldItem.hasInit ? fieldItem : this.addFieldState(elItem, fieldItem),
      rules = field.rules.split('|'),
      isRequired = rules.includes('required'),
      needValidate = typeof field.needValidate === 'function'? field.needValidate(): true,
      _tempObj = {
        id: field.id,
        display: field.display,
        elItem: field.el,
        val: field.value,
        messsage: '',
        state: true
      };

    if (!needValidate) return _tempObj;

    // 验证
    for (let i = 0; i < rules.length; i++) {
      let method = rules[i],
        parts = _regexs.rule.reg.exec(method),
        param = null,
        failed = false;
      if (parts) {
        method = parts[1];
        param = parts[2];
      }

      failed = typeof this[method] === 'function' &&
        (isRequired ?
          !this[method].apply(this, [field, param]) :
          (!!field.value && !this[method].apply(this, [field, param])));

      if (failed) {
        let message = (() => field.display.split('|')[i] || field.display.split('|')[0] || _regexs[method].display)();

        let errorObject = Object.assign(_tempObj, {
          message,
          rule: method,
          state: false,
        });
        this.errors.push(errorObject); // TODO 会重复?
        return errorObject;
      }
    }

    return _tempObj;
  }

  // 添加一些初始化属性
  addFieldProps(field, name) {
    this.fields[name] = {
      display: field.display || (_regexs[field.rules] && _regexs[field.rules].display) || '',
      rules: field.rules,
      id: null,
      el: null,
      type: null,
      value: null,
      checked: null,
      fieldData: field,
      needValidate: field.needValidate,
      name,
    }
  }

  // 添加一些实时性比较高的属性
  addFieldState(el, field) {
    return Object.assign(field, {
      type: el.length > 0 ? el[0].type : el.type,
      value: attribute(el, 'value'),
      checked: attribute(el, 'checked'),
      id: attribute(el, 'id'),
      el,
      hasInit: true
    })
  }
}

const _regexs = {
  rule: {
    reg: /(.+?)\((.+)\)$/, // max_length(12) => ["max_length", 12]
  },
  required: {
    reg: /\w+/,
  },
  email: {
    reg: /^[A-Za-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
    display: 'Please enter a valid email address',
  },
  number: {
    reg: /^[0-9]+$/,
    display: ''
  },
  phone: {
    reg: /^((\+?[0-9]{1,4})|(\(\+86\)))?(13[0-9]|14[57]|15[012356789]|17[03678]|18[0-9])\d{8}$/,
    display: ''
  },
  month: {
    reg: /^[0|1][0-9]$/,
    display: 'Please enter the month/year of expiration.',
  },
  cvcCode: {
    reg: /^\d{3}$/,
    display: 'Please enter a valid cvc code.'
  },
  card: {
    reg: /^\d{16,19}$/,
    display: 'Please enter a valid credit card number.'
  },
  flight_no: {
    reg: /^[0-9]{0,1}[A-Za-z]{1,3}[0-9]{1,5}$/,
    display: 'Please enter a valid credit card number.'
  }
}

// 返回值
const backVal = field => typeof field === 'string' ? field : field.value;

// 表单dom
const formElm = el => typeof el === 'object' ? el : document.getElementById(el);

// 获取属性
const attribute = (el, attr) => {
  let len = el.length;
  if ((len > 0) && (['checkbox', 'radio'].includes(el[0].type))) {
    for (let i = 0; i < len; i++) {
      if (el[i].checked) return el[i][attr];
    }
    return;
  }
  return el[attr];
}

// 测试的方法的Hook
const _testHook = (() => {
  let _obj = {
    // 必填项
    required: field => {
      let val = backVal(field);
      return (['checkbox', 'radio'].includes(field.type)) ? field.checked === true : _regexs.required.reg.test(val);
    },

    // 最大长度
    maxLength: (field, length) => (!_regexs.number.reg.test(length)) ? false : backVal(field).length <= parseInt(length, 10),

    // 最小长度
    minLength: (field, length) => (!_regexs.number.reg.test(length)) ? false : backVal(field).length >= parseInt(length, 10),

  }

  for (let [key, value] of Object.entries(_regexs)) {
    if (typeof value.display !== 'undefined') _obj[key] = field => {
      return value.reg.test(backVal(field));
    }
  }
  return _obj;
})();

export default Validator;
export {
  Validator,
  _testHook as testFn
}