<template>
  <div class="mint-swipe">
    <div class="mint-swipe-items-wrap" ref="wrap">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .mint-swipe {
    overflow: hidden;
    position: relative;
    height: 100%;

    .mint-swipe-items-wrap {
      position: relative;
      overflow: hidden;
      height: 100%;
      > div {
        position: absolute;
        transform: translateX(-100%);
        width: 100%;
        height: 100%;
        display: none;
        &.active {
          display: block;
          transform: none;
        }
      }
    }
  }
</style>

<script>
import { once, addClass, removeClass } from '@/components/utils'
export default {
  created () {
    this.dragState = {}
  },
  data () {
    return {
      ready: false,
      dragging: false,
      userScrolling: false,
      animating: false,
      index: 0,
      pages: [],
      timer: null,
      reInitTimer: null,
      noDrag: false,
      isDone: false,
      speed: 300,
      noDragWhenSingle: true,
      defaultIndex: 0
    }
  },
  methods: {
    initPages () {
      var children = this.$children;
      this.noDrag = children.length === 1 && this.noDragWhenSingle;
      var pages = [];
      var intDefaultIndex = Math.floor(this.defaultIndex)
      var defaultIndex = (intDefaultIndex >= 0 && intDefaultIndex < children.length) ? intDefaultIndex : 0;
      this.index = defaultIndex;

      children.forEach((child, index) => {
        pages.push(child.$el);
        removeClass(child.$el, 'is-active');
        if (index === defaultIndex) {
          addClass(child.$el, 'is-active')
        }
      });

      this.pages = pages
    },
    translate (element, offset, speed, callback) {
      if (speed) {
        this.animating = true;
        element.style.webkitTransition = '-webkit-transform ' + speed + 'ms ease'
        setTimeout(() => {
          element.style.webkitTransform = `translate3d(${offset}px, 0, 0)`;
        }, 50);

        var called = false;
        var transitionEndCallback = () => {
          if (called) return;
          called = true;
          this.animating = false;
          element.style.webkitTransition = '';
          element.style.webkitTransform = '';
          if (callback) {
            callback.apply(this, arguments)
          }
        };
        once(element, 'webkitTransitionEnd', transitionEndCallback);
        setTimeout(transitionEndCallback, speed + 100);
      } else {
        element.style.webkitTransition = '';
        element.style.webkitTransform = `translate3d(${offset}px, 0, 0)`;
      }
    },
    doAnimate (towards, options) {
      if (this.$children.length === 0) return;
      if (!options && this.$children.length < 2) return;

      var prevPage, nextPage, currentPage, pageWidth, offsetLeft;
      var speed = this.speed || 300;
      var index = this.index;
      var pages = this.pages;
      var pageCount = pages.length;

      if (!options) {
        pageWidth = this.$el.clientWidth;
        currentPage = pages[index];
        prevPage = pages[index - 1];
        nextPage = pages[index + 1];
        if (this.continuous && pages.length > 1) {
          if (!prevPage) {
            prevPage = pages[pages.length - 1];
          }
          if (!nextPage) {
            nextPage = pages[0];
          }
        }

        if (prevPage) {
          prevPage.style.display = 'block';
          this.translate(prevPage, -pageWidth);
        }
        if (nextPage) {
          nextPage.style.display = 'block';
          this.translate(nextPage, pageWidth);
        }
      } else {
        prevPage = options.prevPage;
        currentPage = options.currentPage;
        nextPage = options.nextPage;
        pageWidth = options.pageWidth;
        offsetLeft = options.offsetLeft;
      }

      var newIndex;

      var oldPage = this.$children[index].$el;

      if (towards === 'prev') {
        if (index > 0) {
          newIndex = index - 1;
        }
        if (this.continuous && index === 0) {
          newIndex = pageCount - 1;
        }
      } else if (towards === 'next') {
        if (index < pageCount - 1) {
          newIndex = index + 1;
        }
        if (this.continuous && index === pageCount - 1) {
          newIndex = 0;
        }
      }

      var callback = () => {
        if (newIndex !== undefined) {
          var newPage = this.$children[newIndex].$el;
          removeClass(oldPage, 'is-active');
          addClass(newPage, 'is-active');
          this.index = newIndex;
        }
        if (this.isDone) {
          this.end();
        }

        if (prevPage) {
          prevPage.style.display = '';
        }
        if (nextPage) {
          nextPage.style.display = '';
        }
      };

      setTimeout(() => {
        if (towards === 'next') {
          this.isDone = true;
          this.before(currentPage);
          this.translate(currentPage, -pageWidth, speed, callback);
          if (nextPage) {
            this.translate(nextPage, 0, speed);
          }
        } else if (towards === 'prev') {
          this.isDone = true;
          this.before(currentPage);
          this.translate(currentPage, pageWidth, speed, callback);
          if (prevPage) {
            this.translate(prevPage, 0, speed);
          }
        } else {
          this.isDone = false;
          this.translate(currentPage, 0, speed, callback);
          if (typeof offsetLeft !== 'undefined') {
            if (prevPage && offsetLeft > 0) {
              this.translate(prevPage, pageWidth * -1, speed);
            }
            if (nextPage && offsetLeft < 0) {
              this.translate(nextPage, pageWidth, speed);
            }
          } else {
            if (prevPage) {
              this.translate(prevPage, pageWidth * -1, speed);
            }
            if (nextPage) {
              this.translate(nextPage, pageWidth, speed);
            }
          }
        }
      }, 10)
    },
    next () {
      this.doAnimate('next');
    },
    prev () {
      this.doAnimate('prev');
    },
    before () {
      this.$emit('before', this.index);
    },
    end () {
      this.$emit('end', this.index);
    },
    touchStart (evt) {
      if (this.animating) return;
      this.dragging = true;
      this.userScrolling = false;
      if (this.noDrag) return;
      var element = this.$el;
      var dragState = this.dragState;
      var touch = event.touches[0];

      dragState.startTIme = new Date();
      dragState.startLeft = touch.pageX;
      dragState.startTop = touch.pageY;
      dragState.startTopAbsolute = touch.clientY;
      dragState.pageWidth = element.offsetWidth;
      dragState.pageWidth = element.offsetHeight;

      var prevPage = this.$children[this.index - 1];
      var dragPage = this.$children[this.index];
      var nextPage = this.$children[this.index + 1];

      if (this.continuous && this.pages.length - 1) {
        if (!prevPage) {
          prevPage = this.$children[this.$children.length - 1];
        }
        if (!nextPage) {
          nextPage = this.$children[0];
        }
      }

      dragState.prevPage = prevPage ? prevPage.$el : null;
      dragState.dragPage = dragPage ? dragPage.$el : null;
      dragState.nextPage = nextPage ? nextPage.$el : null;

      if (dragState.prevPage) {
        dragState.prevPage.style.display = 'block';
      }

      if (dragState.nextPage) {
        dragState.nextPage.style.display = 'block';
      }
    },
    touchMove (evt) {
      if (!this.dragging) return;
      if (this.noDrag) return;

      var dragState = this.dragState;
      var touch = event.touches[0];
      
      dragState.currentLeft = touch.pageX;
      dragState.currentTop = touch.pageX;
      dragState.currentTopAbsolute = touch.clientY;

      var offsetLeft = dragState.currentLeft - dragState.startLeft;
      var offsetTop = dragState.currentTopAbsolute - dragState.startTopAbsolute;

      var distanceX = Math.abs(offsetLeft);
      var distanceY = Math.abs(offsetTop);
      if (distanceX < 5 || (distanceX >= 5 && distanceY > 1.73 * distanceX)) {
        this.userScrolling = true;
        return;
      } else {
        this.userScrolling = false;
        event.preventDefault();
      }
      offsetLeft = Math.min(Math.max(-dragState.pageWidth + 1, offsetLeft), dragState.pageWidth - 1);
      var towards = offsetLeft < 0 ? 'next' : 'prev';

      if (dragState.prevPage && towards === 'prev') {
        this.translate(dragState.prevPage, offsetLeft - dragState.pageWidth);
      }
      this.translate(dragState.dragPage, offsetLeft);
      if (dragState.nextPage && towards === 'next') {
        this.translate(dragState.nextPage, offsetLeft + dragState.pageWidth)
      }
    },
    touchEnd (evt) {
      if (this.userScrolling) {
        this.dragging = false;
        this.dragState = {};
        return;
      }
      if (!this.dragging) return;
      this.dragging = false;
    }
  },
  mounted () {
    this.ready = true
    var element = this.$el;
    element.addEventListener('touchstart', this.touchStart);
    element.addEventListener('touchmove', this.touchMove);
    element.addEventListener('touchend', this.touchEnd);
  }
}
</script>
