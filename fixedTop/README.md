---
title: 工作日常 吸顶效果
tags:
  - github
  - work
  - JavaScript
  - css
categories:
  - technology
date: 2017-05-29 13:09:59
---

# 概述

吸顶 最常见的就是我们平时网站浏览的时候，下滑到某个程度之后 导航栏就固定到顶部而不随页面滚动而滚动（简单而言就是 fixed 布局 ).
最常见的实现方式思路就是 判断页面滚动高度，到某个高度的时候就让这个div改变定位方式

# 具体实现

引入 jq ，并加一判断，如果jq(zepto) 没有 outerHeight/outerWidth 手动实现。
```JavaScript
import $ from './jquery-2.1.1';

// 如果没有 outerWidth 或 outerHeight 手动实现outerWidth && outerHeight
(()=> {
  if (typeof $.outerHeight === 'function') return;

  ['height', 'width'].forEach(dimension=> {
    let Dimension = dimension.replace(/./, m=> m[0].toUpperCase());

    $.fn['outer' + Dimension] = function(margin) {
      if (this) {
        let size = this[dimension](),
          sides = {
            'width': ['left', 'right'],
            'height': ['top', 'bottom'],
          };

        sides[dimension].forEach(side=> {
          if (margin) size += parseInt(this.css('margin-' + side), 10);
        });

        return size;
      } else {
        return null;
      }
    }
  });
})();
```

实现代码
```JavaScript
const fixedTop = {
  /**
   * @param el 具体要 fixed 的 dom 的字符串或jqueryDom 或dom
   * @param opts 其他配置，目前只有 hold 是否要生成一个占位div防止div 脱离文档流后兄弟节点抖动
   */
  init(el, opts={ hold: true}) {
  	// 初始化需要的el
    this.$el = el instanceof $? el: $(el);

	// 获取后面要改变样式的具体参数
    let offset = this.$el.offset();
    this.offsetTop = offset.top;
    this.defaultHeight = this.$el.outerHeight(true);

    this.defaultState = {
      position: this.$el.css('position'),
      width: this.$el.css('width') || 'auto',
      top: this.$el.css('top') || 'auto',
    };

    this.changeState = {
      position: 'fixed',
      width: this.$el.outerWidth(),
      top: '0',
      left: offset.left,
    };

    // 如果有 hodl 参数， 配置好要生成的 占位dom
    this.holdEl = opts.hold? `<div class="J-fixedTop-pad" style="height:${this.defaultHeight}px; visibility: hidden;"></div>`: '';

	// 绑定事件
    this.bindEvent();
  },

  bindEvent() {
    let $win = $(window);
    $win.scroll(()=> {

      let isTop = ($win.scrollTop() - this.offsetTop) >= 0,
        isFixed = this.$el.data('fixed');

	  // 判断 如果大于top 并且当前的dom元素没有被改变样式，则执行逻辑
      if (isTop && !isFixed) {

        this.$el.data('fixed', true);
        if (!this.$el.next().hasClass('J-fixedTop-pad')) {
          this.$el.after(this.holdEl);
        }
        this.addCss();

      } else if (!isTop && isFixed){

      	// 反之 还原dom样式

        this.$el.data('fixed', false);
        this.removeCss();
        this.holdEl && this.$el.next().remove();

      }
    })
  },

  addCss() {
    this.$el.css(this.changeState);
  },

  removeCss() {
    this.$el.css(this.defaultState);
  }
};
```

调用
```JavaScript
fixedTop.init('#div');
```

# 后记

很简单的小需求， 是在工作中看到小伙伴的脚本后改进的。 主要是之前没有想到要生成一个占位dom来防止后面的抖动

然后有一个css样式可以直接达到这个效果，但是兼容性不乐观， 对布局也有所要求，有兴趣的可以去了解一下。

附上链接 []