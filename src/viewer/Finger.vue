<template>
  <div class="finger" 
    @touchstart="_handleTouchStart"
    @touchmove.prevent="_handleTouchMove"
    @touchend="_handleTouchEnd"
    @touchcancel="_handleTouchCancel">
    <slot></slot>
    <!-- <p style="position: fixed; left: 0;top:0 ;color: #fff;">{{msg}}</p> -->
  </div>
</template>

<script>
export default {
  props: {
    tap: Function,
    singleTap: Function,
    doubleTap: Function,
    longTap: Function,
    swipe: Function,
    pressMove: Function,
    pinch: Function,
    rotate: Function,
    multipointStart: Function,
    multipointEnd: Function,
  },
  data () {
    return {
      preV: {
        x: null,
        y: null
      },
      pinchStartLen: null,
      scale: 1,
      isDoubleTap: false,
      delta: null,
      last: null,
      now: null,
      end: null,
      multiTouch: false,
      tapTimeout: null,
      longTapTimeout: null,
      singleTapTimeout: null,
      swipeTimeout: null,
      x1: null,
      x2: null,
      y1: null,
      y2: null,
      preTapPosition: {
        x: null,
        y: null
      },
      msg: ""
    }
  },
  methods: {
    getLen (v) {
      return Math.sqrt(v.x * v.x + v.y * v.y);
    },
    dot (v1, v2) {
      return v1.x * v2.x + v1.y * v2.y;
    },
    getAngle (v1, v2) {
      var mr = this.getLen(v1) * this.getLen(v2);
      if (mr === 0) return mr;
      var r = this.dot(v1, v2) / mr;
      if (r > 1) r = 1;
      return Math.acos(r);
    },
    cross (v1, v2) {
      return v1.x * v2.y - v2.x * v1.y;
    },
    _resetState () {
      // this.x = null;
      // this.y = null;
      // this.swiping = false;
      // this.start = 0;
    },
    _emitEvent (name, ...arg) {
      // console.log(name)
      this.msg = name
      if (this[name]) {
        this[name](...arg);
      }
    },
    _handleTouchStart (evt) {
      if (!evt.touches) return;
      this.now = Date.now();
      this.x1 = evt.touches[0].pageX;
      this.y1 = evt.touches[0].pageY;
      this.delta = this.now - (this.last || this.now);
      if (this.preTapPosition.x != null) {
        this.isDoubleTap = (this.delta > 0 && this.delta <= 250 && Math.abs(this.preTapPosition.x - this.x1) < 30 && Math.abs(this.preTapPosition.y - this.y1) < 30)
      }
      this.preTapPosition.x = this.x1;
      this.preTapPosition.y = this.y1;
      this.last = this.now;
      var preV = this.preV;
      var len = evt.touches.length;
      
      if (len > 1) {
        this._cancelLongTap();
        this._cancelSingleTap();
        preV.x = evt.touches[1].pageX - this.x1
        preV.y = evt.touches[1].pageY - this.y1
        this.pinchStartLen = this.getLen(preV);
        this._emitEvent('multipointStart', evt);
      }
      this.longTapTimeout = setTimeout(() => {
        this._emitEvent('longTap', evt);
      }, 750);
    },
    _handleTouchMove (evt) {
      var preV = this.preV,
          len = evt.touches.length,
          currentX = evt.touches[0].pageX,
          currentY = evt.touches[0].pageY;
      
      this.isDoubleTap = false;
      this.msg = len
      if (len > 1) {
        this._cancelLongTap();
        var v = {
          x: evt.touches[1].pageX - currentX,
          y: evt.touches[1].pageY - currentY
        }
        if (preV.x != null) {
          if (this.pinchStartLen > 0) {
            evt.center = {
              x: (evt.touches[1].pageX + currentX) / 2,
              y: (evt.touches[1].pageY + currentY) / 2
            };
            
            // var s = this.getLen(v) / this.pinchStartLen;
            this._emitEvent('pinch', evt);
          }
          // evt.angle = this.getRotateAngle(v, preV);
          // this._emitEvent('rotate', evt);
        } 
        
        preV.x = v.x;
        preV.y = v.y;
        this.multiTouch = true;
      } else {
        if (this.x2 !== null) {
          evt.deltaX = currentX - this.x2;
          evt.deltaY = currentY - this.y2;
        } else {
          evt.deltaX = 0;
          evt.deltaY = 0;
        }
        this._emitEvent('pressMove', evt);
      }
      this._cancelLongTap();
      this.x2 = currentX;
      this.y2 = currentY;
      if (len > 1) {
        evt.preventDefault();
      }
    },
    _handleTouchEnd (evt) {
      this.end = Date.now();
      this._cancelLongTap();
      if (evt.touches.length < 2) {
        this._emitEvent('multipointEnd', evt);
      }
      evt.origin = [this.x1, this.y1];
      if (this.multiTouch === false) {
        if ((this.x2 && Math.abs(this.x1 - this.x2) > 30) ||
          (this.y2 && Math.abs(this.preV.y - this.y2) > 30)) {
          evt.direction = this._swipeDirection(this.x1, this.x2, this.y1, this.y2);
          evt.distance = Math.abs(this.x1 - this.x2);
          this.swipeTimeout = setTimeout(() => {
            this._emitEvent('swipe', evt);
          }, 0)
        } else {
          this.tapTimeout = setTimeout(() => {
            this._emitEvent('tap', evt);
            if (this.isDoubleTap) {
              this._emitEvent('doubleTap', evt);
              clearTimeout(this.singleTapTimeout);
              this.isDoubleTap = false;
            } else {
              this.singleTapTimeout = setTimeout(() => {
                this._emitEvent('singleTap', evt);
              }, 250);
            }
          }, 0)
        }
      }
      this.preV.x = 0;
      this.preV.y = 0;
      this.scale = 1;
      this.pinchStartLen = null;
      this.x1 = this.x2 = this.y1 = this.y2 = null;
      this.multiTouch = false;
    },
    
    _handleTouchCancel () {
      clearInterval(this.singleTapTimeout);
      clearInterval(this.tapTimeout);
      clearInterval(this.longTapTimeout);
      clearInterval(this.swipeTimeout);
    },
    _cancelLongTap () {
      clearTimeout(this.longTapTimeout);
    },
    _cancelSingleTap () {
      clearTimeout(this.singleTapTimeout)
    },
    _swipeDirection (x1, x2, y1, y2) {
      if (Math.abs(x1 - x2) > 80 || this.end -this.now <= 250) {
        return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')    
      } else {
        return 'Nochange'
      }
    }
  }
}
</script>

<style>
.finger {
  width: 100%;
  height: 100%;
}
</style>