/**
 * Created by Jsonz on 2017/5/29.
 */


// import $ from './jquery-2.1.1';
// 引入jq

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


const fixedTop = {
  init(el, opts={ hold: true}) {
    this.$el = el instanceof $? el: $(el);

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
    this.holdEl = opts.hold? `<div class="J-fixedTop-pad" style="height:${this.defaultHeight}px; visibility: hidden;"></div>`: '';

    this.bindEvent();
  },

  bindEvent() {
    let $win = $(window);
    $win.scroll(()=> {

      let isTop = ($win.scrollTop() - this.offsetTop) >= 0,
        isFixed = this.$el.data('fixed');

      if (isTop && !isFixed) {

        this.$el.data('fixed', true);
        if (!this.$el.next().hasClass('J-fixedTop-pad')) {
          this.$el.after(this.holdEl);
        }
        this.addCss();

      } else if (!isTop && isFixed){

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
