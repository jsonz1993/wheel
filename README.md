# wheel wow!!!

平时工作 or 无聊写的小轮子


#### copyText 复制黏贴板插件
- 支持h5，PC
- `success`, `error`回调
- 判断浏览器是否支持该事件接口




#### heatmap 热力图

- 老大提的小需求 一两个小时完成
- 点击页面会间隔(10s)存到`sessionLocation`。 刷新后会把存在`sessionLocation` 绘制成热力图展示在页面上

#### validator 小型表单验证插件

- 移动端简单的验证插件
- 支持自己配置验证项 支持多重验证
- ```JavaScript
	let myValidator = new Validator({
        el: 'emailForm',
        autoFocus: true,
        fields: [{
            name: 'first_name',
            display: 'Please enter your first name',
            rules: 'required',
        }, {
            name: 'last_name',
            display: 'Please enter your last name',
            rules: 'required',
        }, {
            name: 'email',
            rules: 'required|email',
            display: 'Please enter a valid email address'
        }, {
            name: 'reference_number',
            display: 'place enter a valid reference number',
            rules: 'maxLength(12)'
        }, {
            name: 'subject',
            display: 'Please enter the subject.',
            rules: 'required'
        }, {
            name: 'question',
            display: 'Please tell us what we can help you with.',
            rules: 'required',
            needValidate() {
            	return true;
            }
        }],
        callbackItem: instance=> {
            console.log(instance);
        }
    });

    myValidator.validate().then(instance=> {
        console.log(instance);
    });
  ```
  ​