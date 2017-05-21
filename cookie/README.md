## 用法

```JavaScript
// 获取
Cookie.get('name');

// 设置
Cookie.set({key: val, key1: val1}, opts);
Cookie.set('key', 'val');

// 移除某个值
Cookie.remove(name);
Cookie.remove([name1, name2]);

// 清除Cookie
Cookie.clear();

// 获取所有cookie
Cookie.getAll(); // {key: val}
```
