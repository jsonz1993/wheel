# wheel wow!!!

平时工作 or 无聊写的小轮子

### fq-demo
  - 函数式编程学习用到的demo
  - rxJs, ramdaJs
  - [文章链接](https://jsonz1993.github.io/2018/08/fp/)

### video-to-chat
  - 视频转成字符串展示
  - video => canvas => image => char => canvas
  - [在线demo](//jsonz1993.github.io/demo/video2char/index.html)
  - [相关介绍](//jsonz1993.github.io/2018/07/video-to-chat/)
  - [源码](https://github.com/jsonz1993/wheel/tree/master/video2char)


### print-partial
  - 浏览器局部打印
  - 无依赖js写，可以参照这个思路做自己的需求
  - [打印其他相关介绍](https://jsonz1993.github.io/2018/06/window-print%E2%80%94%E2%80%94%E5%85%B3%E4%BA%8E%E6%B5%8F%E8%A7%88%E5%99%A8%E6%89%93%E5%8D%B0/)

### babel-plugin-jsonz
  - 学习babel插件编写
  - next 项目一个小的插件

### auto_test
  - auto_test 利用 puppeteer 来进行功能测试 将测试结果发送到后台记录
  - auto_test_backend 存取测试结果，方便查看
  - [链接](https://jsonz1993.github.io/2018/04/%E8%87%AA%E5%8A%A8%E5%8C%96%E5%8A%9F%E8%83%BD%E6%B5%8B%E8%AF%95%E6%B5%81%E7%A8%8B%E6%96%B9%E6%A1%88/)

#### qqZone puppeteer自动化删除留言板与说说程序

#### min-compiler 简单的用js实现一个编译器，主要了解编译器的原理

#### Promise 简单的照着别人的代码敲一遍， 主要为了理解原理 做技术分享

#### postMessage 简单的封装了 系统自带的postMessage 添加类型监听

#### react-native-countdown ReactNative的倒计时组件
- 造这个轮子的原因是学习rn的时候，视频推荐额一个组件，但是这个组件已经停止维护 所以只能自己造一个
- 支持日期与秒数的倒计时
- 简单粗暴

#### fixedTop 吸顶效果
- 一个很小的常用效果
- 主要细节 在于改变dom为 fixed布局后在该dom后面生成一个占位的，防止兄弟节点的抖动

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


#### cookie 封装了一些常用的api

- get, set, remove, clean, getAll
