# copyText
简单的copy插件， ES6 语法， 不依赖其他插件， 适用pc && web

#### 使用方法
```javascript
import CopyText from './copyText';
document.getElementById('btn').addEventlistener('click', ()=> {
	new CopyText({
		text: '复制的文本', 
		success() { 
			// 成功回调 
		}, 
		error() {
 		   // 失败回调 
		}
	});
});

CopyText.isSupported() 可以判断该环境是否支持复制黏贴板事件
```

#### other
源码有注释，简单 100 行。


