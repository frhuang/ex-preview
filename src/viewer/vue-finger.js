function getLen(v) {
  if (isNaN(v.x) || isNaN(v.y)) {
    return 0
  } else {
    return Math.sqrt(v.x * v.x + v.y * v.y)
  }
}
function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y
}
function getAngle(v1, v2) {
  var mr = getLen(v1) * getLen(v2)
  if (mr === 0) return 0
  var r = dot(v1, v2) / mr
  if (r > 1) r = 1
  return Math.acos(r)
}
function cross(v1, v2) {
  return v1.x * v2.y - v2.x * v1.y
}
function getRotateAngle(v1, v2) {
  var angle = getAngle(v1, v2)
  if (cross(v1, v2) > 0) {
    angle *= -1
  }
  return angle * 180 / Math.PI
}
var VueFinger = {}
VueFinger.install = function (Vue, options) {
  var self = this
  self.config = {
    preV: { x: null, y: null },
    pinchStartLen: null,
    scale: 1,
    isDoubleTap: false,
    delta: null,
    last: null,
    now: null,
    end: null,
    multiTouch: false,
    tapTimeout: null,
    singleTapTimeout: null,
    longTapTimeout: null,
    swipeTimeout: null,
    x1: null,
    x2: null,
    y1: null,
    y2: null,
    preTapPosition: { x: null, y: null },
    tap: function () { },
    singleTap: function () { },
    longTap: function () { },
    doubleTap: function () { },
    pressMove: function () { },
    multipointStart: function () { },
    multipointEnd: function () { },
    swipe: function () { },
    pinch: function () { },
    rotate: function () { },
  }
  self._handleTouchStart = function (e) {
    if (!e.touches) return
    var config = self.config
    // e.preventDefault()
    self.config.now = Date.now()
    self.config.x1 = e.touches[0].pageX
    self.config.y1 = e.touches[0].pageY
    self.config.delta = self.config.now - (self.config.last || self.config.now)
    if (self.config.preTapPosition.x !== null) {
      self.config.isDoubleTap = (self.config.delta > 0 && self.config.delta <= 250 &&
        Math.abs(self.config.preTapPosition.x - self.config.x1) < 30 &&
        Math.abs(self.config.preTapPosition.y - self.config.y1) < 30)
    }
    self.config.preTapPosition.x = self.config.x1
    self.config.preTapPosition.y = self.config.y1
    self.config.last = self.config.now
    var preV = self.config.preV
    var len = e.touches.length
    if (len > 1) {
      self._cancelLongTap();
      self._cancelSingleTap();
      var v = { x: e.touches[1].pageX - self.config.x1, y: e.touches[1].pageY - self.config.y1 }
      preV.x = v.x
      preV.y = v.y
      self.config.pinchStartLen = getLen(preV)
      self._emitEvent('multipointStart', e);
    }
    self.config.longTapTimeout = setTimeout(function () {
      self._emitEvent('longTap', e);
    }, 750)
  }
  self._handleTouchMove = function (e) {
    // if (!e.touches) return
    // e.preventDefault()
    var preV = self.config.preV
    var len = e.touches.length
    var currentX = e.touches[0].pageX
    var currentY = e.touches[0].pageY
    self.config.isDoubleTap = false
    if (len > 1) {
      var v = { x: e.touches[1].pageX - currentX, y: e.touches[1].pageY - currentY }
      if (preV.x !== null) {
        if (self.config.pinchStartLen > 0) {
          e.center = {
            x: (e.touches[1].pageX + currentX) / 2,
            y: (e.touches[1].pageY + currentY) / 2
          }
          e.scale = getLen(v) / self.config.pinchStartLen
          self._emitEvent('pinch', e)
          // self.config.pinch(e)
        }
        e.angle = getRotateAngle(v, preV)
        self._emitEvent('rotate', e)
        // self.config.rotate(e)
      }
      preV.x = v.x
      preV.y = v.y
      self.multiTouch = true;
    } else {
      if (self.config.x2 !== null) {
        e.deltaX = currentX - self.config.x2
        e.deltaY = currentY - self.config.y2
      } else {
        e.deltaX = 0
        e.deltaY = 0
      }
      self._emitEvent('pressMove', e);
      // self.config.pressMove(e)
    }
    // self.config.touchMove(e)
    self._cancelLongTap()
    self.config.x2 = currentX
    self.config.y2 = currentY
    if (len > 1) {
      // self._cancelLongTap()
      e.preventDefault()
    }
  }
  self._handleTouchEnd = function (e) {
    self.config.end = Date.now();
    self._cancelLongTap()

    if (e.touches.length < 2) {
      self._emitEvent('multipointEnd', e);
    }
    e.origin = [self.config.x1, self.config.y1];
    // swipe
    var config = self.config
    if (self.config.multiTouch === false) {
      if ((config.x2 && Math.abs(config.x1 - config.x2) > 30) ||
        (config.y2 && Math.abs(config.preV.y - config.y2) > 30)) {
        e.direction = self._swipeDirection(config.x1, config.x2, config.y1, config.y2)
        e.distance = Math.abs(config.x1, config.x2)
        self.config.swipeTimeout = setTimeout(() => {
          self._emitEvent('swipe', e);
          // self.config.swipe(e)
        }, 0)
      } else {
        self.config.tapTimeout = setTimeout(() => {
          self._emitEvent('tap', e);
          // self.config.tap(e)
          // trigger double tap immediately
          if (self.config.isDoubleTap) {
            self._emitEvent('doubleTap', e);
            clearTimeout(self.config.singleTapTimeout)
            self.config.isDoubleTap = false
          } else {
            self.config.singleTapTimeout = setTimeout(function () {
              self._emitEvent('singleTap', e);
            }, 250)
          }
        }, 0)
      }
    }
    
    self.config.preV.x = 0
    self.config.preV.y = 0
    self.config.scale = 1
    self.config.pinchStartLen = null
    self.config.x1 = self.config.x2 = self.config.y1 = self.config.y2 = null
    self.config.multiTouch = false;
  }
  self._handleTouchCancel = function (e) {
    clearInterval(self.config.singleTapTimeout);
    clearInterval(self.config.tapTimeout);
    clearInterval(self.config.longTapTimeout);
    clearInterval(self.config.swipeTimeout);
  }
  self._cancelLongTap = function () {
    clearTimeout(self.config.longTapTimeout)
  }
  self._cancelSingleTap = function (e) {
    clearTimeout(self.config.singleTapTimeout)
  }
  self._swipeDirection = function (x1, x2, y1, y2) {
    if (Math.abs(x1 - x2) > 80 || self.config.end - self.config.now <= 250) {
      return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
    } else {
      return 'Nochange'
    }
  }
  self._emitEvent = function (name, ...arg) {
    // console.log(name);
    if (self.config[name]) {
      self.config[name](...arg)
    }
  }
  self.bindingTouchEvent = function (el) {
    el.addEventListener('touchstart', self._handleTouchStart, false)
    el.addEventListener('touchmove', self._handleTouchMove, false)
    el.addEventListener('touchend', self._handleTouchEnd, false)
    el.addEventListener('touchcancel', self._handleTouchCancel, false)
  }
  Vue.directive('touch', {
      bind(el) {
        self.bindingTouchEvent(el)
      }
    })
  // 自定义指令
  Vue.directive('tap', {
    bind(el, binding, vnode, oldVnode) {
      var args = binding.value.arg || {}
      args.el = el
      self.config.tap = function (e) {
        binding.value.methods.call(binding.value.methods, e, args)
      }
      // self.bindingTouchEvent(el)
    }
  })
  Vue.directive('singleTap', {
    bind(el, binding, vnode, oldVnode) {
      var args = binding.value.arg || {}
      args.el = el
      self.config.singleTap = function (e) {
        binding.value.methods.call(binding.value.methods, e, args)
      }
      // self.bindingTouchEvent(el)
    }
  })
  Vue.directive('longTap', {
    bind(el, binding, vnode, oldVnode) {
      var args = binding.value.arg || {}
      args.el = el
      self.config.longTap = function (e) {
        binding.value.methods.call(binding.value.methods, e, args)
      }
      // self.bindingTouchEvent(el)
    }
  })
  Vue.directive('doubleTap', {
    bind(el, binding, vnode, oldVnode) {
      var args = binding.value.arg || {}
      args.el = el
      self.config.doubleTap = function (e) {
        binding.value.methods.call(binding.value.methods, e, args)
      }
      // self.bindingTouchEvent(el)
    }
  })
  Vue.directive('pressMove', {
    bind(el, binding, vnode, oldVnode) {
      var args = binding.value.arg || {}
      args.el = el
      self.config.pressMove = function (e) {
        binding.value.methods.call(binding.value.methods, e, args)
      }
      // self.bindingTouchEvent(el)
    }
  })
  Vue.directive('multipointStart', {
    bind(el, binding, vnode, oldVnode) {
      var args = binding.value.arg || {}
      args.el = el
      self.config.multipointStart = function (e) {
        binding.value.methods.call(binding.value.methods, e, args)
      }
      // self.bindingTouchEvent(el)
    }
  })
  Vue.directive('multipointEnd', {
    bind(el, binding, vnode, oldVnode) {
      var args = binding.value.arg || {}
      args.el = el
      self.config.multipointEnd = function (e) {
        binding.value.methods.call(binding.value.methods, e, args)
      }
      // self.bindingTouchEvent(el)
    }
  })
  Vue.directive('swipe', {
    bind(el, binding, vnode, oldVnode) {
      var args = binding.value.arg || {}
      args.el = el
      self.config.swipe = function (e) {
        binding.value.methods.call(binding.value.methods, e, args)
      }
      // self.bindingTouchEvent(el)
    }
  })
  Vue.directive('pinch', {
    bind(el, binding, vnode, oldVnode) {
      var args = binding.value.arg || {}
      args.el = el
      self.config.pinch = function (e) {
        binding.value.methods.call(binding.value.methods, e, args)
      }
      // self.bindingTouchEvent(el)
    }
  })
  Vue.directive('rotate', {
    bind(el, binding, vnode, oldVnode) {
      var args = binding.value.arg || {}
      args.el = el
      self.config.pinch = function (e) {
        binding.value.methods.call(binding.value.methods, e, args)
      }
      // self.bindingTouchEvent(el)
    }
  })
}
export default VueFinger