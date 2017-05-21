/**
 * Created by Jsonz on 2017/5/21.
 */

const isObject = obj=> !!value && Object.prototype.toString.call(obj) === '[object Object]';

const Cookie = {
  get(name) {
    let cookieName = name + '=',
      ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      let cItem = (ca[i][0] === ' ')? ca[i].slice(1): ca[i];
      if (cItem.indexOf(cookieName) === 0) return decodeURI(cItem.substr(cookieName.length+1));
    }

    return false;
  },

  set(name, value, opts) {

    if (isObject(name)) {
      for (let key in name) {
        if (name.hasOwnProperty(key)) this.set(key, name[key], value);
      }
    } else {
      let opt = isObject(opts)? opts: { expires: opts},
        expires = typeof opt.expires === 'undefined'? '': opt.expires,
        expiresType = typeof expires,
        path = typeof opt.path === 'undefined'? ';path=/': `;path=${opt.path}`,
        domain = opt.domain? `;domain=${opt.domain}`: '',
        secure = opt.secure? ';secure': '';

      if (expiresType === 'string' && expires) expires = new Date(expires);
      else if (expiresType === 'number') expires = new Date(+new Date + 1000 * 60 * 60 * 24 * expires);
      if (expires !== '' && 'toGMTString' in expires) expires = ';expires=' + expires.toGMTString();

      document.cookie = [name, '=', encodeURI(value), expires, path, domain, secure].join('');
    }
  },

  remove(name) {
    let names = Array.isArray(name)? name: [name];
    for (let i= 0; i< names.length; i++) {
      this.set(names[i], '', -1);
    }
    return names;
  },

  clear(name) {
    return name? this.remove(name): this.remove(Object.keys(this.getAll()));
  },

  getAll() {
    if (document.cookie === '') return {};
    let cookies = document.cookie.split('; '), result = {};
    for (let i= 0; i< cookies.length; i++) {
      let item = cookies[i].split('=');
      result[decodeURI(item[0])] = decodeURI(item[1]);
    }
    return result;
  }
};

