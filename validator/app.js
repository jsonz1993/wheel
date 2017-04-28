/**
 * Created by Jsonz on 2017/4/27.
 */

class App extends Validator {
  constructor(opts) {
    super(opts);

    this.callbackItem = opts.callbackItem;
    this.type = opts.type;
    this.initHandle();
  }

  initHandle() {
    this.el = {};
    let el, field;
    for (let key in this.fields) {
      el = this.form[key];
      field = this.fields[key];
      if (!el || !field) continue;
      this.el[key] = el;
      if (el.getAttribute('has-validator'))
        return console.warn('绑定两次验证事件', el, field);

      el.addEventListener(this.type, ()=> {
        let a = this.validateField(this._initEl(el, field));
        this.callbackItem(a);
      });
      el.setAttribute('has-validator', true);
    }
  }
}