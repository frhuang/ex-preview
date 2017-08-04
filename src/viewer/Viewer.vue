<template>
  <div class="imageview">
        <finger
      :singleTap="singleTap"
      :pressMove="pressMove"
      :swipe="swipe">
      <ul ref="imagelist" class="imagelist">
        <li 
          v-for="(item, $index) in imagelist"
          class="imagelist-item" 
          :style="'margin-right:' + gap + 'px'" :key="'img'+$index">
          <finger 
            :pressMove="picPressMove"
            :multipointStart="multipointStart"
            :doubleTap="doubleTap"
            :multipointEnd="multipointEnd"
            :pinch="pinch">
            <loading-img class="imagelist-item-img" 
            :current="current"
            :lazySrc="item"
            :index="$index" 
            :id="'view'+$index"></loading-img>
          </finger>
        </li>
      </ul>
    </finger>    
    <p style="position: fixed; left: 0;top:0 ;color: #fff;">{{msg}}</p>
       <!-- <ul ref="imagelist" class="imagelist"
        v-touch
        v-pressMove="{methods:pressMove}"
        v-swipe="{methods:swipe}">
        <li 
          v-for="(item, $index) in imagelist"
          class="imagelist-item" 
          :style="'margin-right:' + gap + 'px'" :key="'img'+$index"
            v-pressMove="{methods:picPressMove}"
            v-multipointStart="{methods:multipointStart}"
            v-doubleTap="{methods:doubleTap}"
            v-pinch="{methods:pinch}"
            v-multipointEnd="{methods:multipointEnd}">
            <loading-img class="imagelist-item-img" 
            :current="current"
            :lazySrc="item" 
            :id="'view'+$index"></loading-img>
        </li>
      </ul>    -->
  </div>
</template>

<script>
import Finger from './Finger.vue'
import LoadingImg from './LoadingImg'
import Transform from './transform'
export default {
  props: {
    imagelist: {
      type: Array
    },
    gap: {
      type: Number,
      default: 0
    },
    maxScale: {
      type: Number,
      default: 2
    },
    enableRotate: {
      type: Boolean,
      default: false
    },
    disableDoubleTap: {
      type: Boolean,
      default: false,
    },
    disablePageNum: {
      type: Number
    },
    disablePinch: {
      type: Boolean,
      default: false
    },
    longTap: Function,
    close: Function,
    changeIndex: Function,
    initCallback: Function
  },
  data () {
    return {
      arrLength: 0,
      list: null,
      focused: null,
      initScale: 1,
      screenWidth: window.innerWidth || window.screen.availWidth,
      screenHeight: window.innerHeight || window.screen.availHeight,
      ob: null,
      current: 0,
      msg: ""
    }
  },
  methods: {
    singleTap (evt) {

    },

    pressMove (evt) {
      this.endAnimation();
      if (!this.focused) {
        if ((this.current === 0 && evt.deltaX > 0) ||
          (this.current === this.arrLength - 1 && evt.deltaX < 0)) {
          this.list.translateX += evt.deltaX / 3;
        } else {
          this.list.translateX += evt.deltaX;
        }
      }
      evt.preventDefault();
    },

    picPressMove (evt) {
      const { deltaX, deltaY } = evt;
      const isLongPic = this.ob.getAttribute('long');
      const { scaleX, width } = this.ob;
      if (scaleX <= 1 || evt.touches.length > 1) {
        return;
      }
      if (this.ob && this.checkBoundary(deltaX, deltaY)) {
        !isLongPic && (this.ob.translateX += deltaX);
        this.ob.translateY += deltaY;

        if (isLongPic && scaleX * width === this.screenWidth) {
          this.focused = false
        } else {
          this.focused = true;
        }
      } else {
        this.focused = false;
      }
      evt.preventDefault();
    },

    swipe (evt) {
      var direction = evt.direction
      if (this.focused) return false;
      switch (direction) {
        case 'Left': 
          this.current < this.arrLength - 1 && ++this.current && this.bindStyle(this.current);
          break;
        case 'Right': 
          this.current > 0 && this.current-- && this.bindStyle(this.current);
          break;
      }
      this.changeViewIndex(this.current);
    },

    multipointStart () {
      this.initScale = this.ob.scaleX;
    },

    pinch (evt) {
      if (this.disablePinch || this.ob.getAttribute('long')) {
        return false;
      }
      this.ob.style.webkitTransition = 'cubic-bezier(.25,.01,.25,1)'

      const { originX, originY } = this.ob,
        originX2 = evt.center.x - this.screenWidth / 2 - document.body.scrollLeft,
        originY2 = evt.center.y - this.screenHeight / 2 - document.body.scrollTop;
      this.ob.originX = originX2;
      this.ob.originY = originY2;
      this.ob.translateX = this.ob.translateX + (originX2 - originX) * this.ob.scaleX;
      this.ob.translateY = this.ob.translateY + (originY2 - originY) * this.ob.scaleY;
      this.ob.scaleX = this.ob.scaleY = this.initScale * evt.scale;
      this.msg = evt.scale
    },

    rotate (evt) {
      if (!this.enableRotate || this.ob.getAttribute('rate') >= 3.5) {
        return false;
      }
      this.ob.style.webkitTransition = 'cubic-bezier(.25,.01,.25,1)'
      this.ob.rotateZ += evt.angle;
    },

    multipointEnd (evt) {
      this.changeViewIndex(this.current);

      if (!this.ob) return;

      this.ob.style.webkitTransition = '300ms ease';

      const isLongPic = this.ob.getAttribute('long');
      if (this.ob.scaleX < 1) {
        this.restore();
      }
      if (this.ob.scaleX > this.maxScale && !isLongPic) {
        this.setScale(this.maxScale);
      }
    },

    doubleTap (evt) {
      if (this.disableDoubleTap) {
        return false;
      }
      const { origin } = evt;
      const originX = origin[0] - this.screenWidth / 2 - document.body.scrollLeft;
      const originY = origin[1] - this.screenHeight / 2 - document.body.scrollTop;
      
      const isLongPic = this.ob.getAttribute('long');
      if (this.ob.scaleX === 1) {
        !isLongPic && (this.ob.translateX = this.ob.originX = originX);
        !isLongPic && (this.ob.translateY = this.ob.originY = originY);
        this.setScale(isLongPic ? this.screenWidth / this.ob.width : this.maxScale)
      } else {
        this.ob.translateX = this.ob.originX;
        this.ob.translateY = this.ob.originY;
        this.setScale(1);
      }
    },
    bindStyle (current) {
      this.ob && this.restore();
      this.ob = document.getElementById(`view${current}`);
      if (this.ob && !this.ob.scaleX) {
        Transform(this.ob);
      }

    },

    changeViewIndex (current, ease=true) {
      ease && (this.list.style.webkitTransition = '300ms ease');
      this.list.translateX = -current * (this.screenWidth + this.gap);
      this.changeIndex && this.changeIndex(current);
    },

    setScale (size) {
      this.ob.style.webkitTransition = '300ms ease-in-out';
      this.ob.scaleX = this.ob.scaleY = size;
    },

    restore () {
      this.ob.translateX = this.ob.translateY = 0;
      this.ob.scaleX = this.ob.scaleY = 1;
      this.ob.originX = this.ob.originY = 0;
    },

    endAnimation () {
      this.list.style.webkitTransition = '0';
      this.ob && this.ob.style && (this.ob.style.webkitTransition = '0');
    },

    checkBoundary (deltaX=0, deltaY=0) {
      const { scaleX, translateX, translateY, originX, originY, width, height } = this.ob;
      const rate = this.ob.getAttribute('rate');

      if (scaleX !== 1 || scaleX !== rate) {
        const rangeLeft = (scaleX - 1) * (width / 2 + originX) + originX,
          rangeRight = -(scaleX - 1) * (width / 2 - originX) + originX,
          rangeUp = (scaleX - 1) * (height / 2 + originY) + originY,
          rangeDown = -(scaleX - 1) * (height / 2 - originY) + originY;
        if(translateX + deltaX <= rangeLeft
          && translateX + deltaX >= rangeRight
          && translateY + deltaY <= rangeUp
          && translateY + deltaY >= rangeDown ) {
          return true;
        }
      }
      return false;
    }
  },
  mounted () {
    this.arrLength = this.imagelist.length;
    this.list = this.$refs["imagelist"];
    Transform(this.list);

    this.current && this.changeViewIndex(this.current, false);
    this.bindStyle(this.current);
  },
  components: {
    Finger,
    LoadingImg
  }
}
</script>

<style lang="scss">
html, body, div, ul, li, a {
    padding: 0;
    margin: 0;
}

.hide {
    opacity: 0;
    transition: opacity 0.2s;
    -webkit-transition: opacity 0.2s;
}

.imageview {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    z-index: 900;
    background-color: #000;
    overflow: hidden;
    animation: easeshow 0.25s;

    .page {
        font-family: -apple-system-font, 'Helvetica Neue', Helvetica, STHeiTi,sans-serif;
        position: fixed;
        font-size: 14px;
        color: #fff;
        padding: 2px 5px;
        bottom: 10px;
        left: 50%;
        -webkit-transform: translateX(-50%);
                transform: translateX(-50%);
        -webkit-touch-callout: none;
        -webkit-user-select: none;
    }

    .spinner {
        width: 40px;
        height: 40px;
        position: absolute;
        top: 45%;
        left: 50%;
        transform: translate(-50%,-50%);
    }

    .double-bounce1, .double-bounce2 {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #333;
        opacity: 0.6;
        position: absolute;
        top: 0;
        left: 0;

        -webkit-animation: sk-bounce 2.0s infinite ease-in-out;
        animation: sk-bounce 2.0s infinite ease-in-out;
    }

    .double-bounce2 {
        -webkit-animation-delay: -1.0s;
        animation-delay: -1.0s;
    }

    .errorpage {
        position: absolute;
        font-size: 16px;
        text-align: center;
        color: rgb(170, 170, 170);
        top: 28%;
        left: 50%;
        margin-left: -70px;

        &:before {
            content:'';
            display: block;
            width: 150px;
            height: 140px;
            margin: 0 auto;
            padding-bottom: 20px;
            background-size: 100%;
            opacity: .4;
        }
    }
}

@keyframes easeshow {
    from { opacity: 0; }
    to { opacity: 1; }
}
@-webkit-keyframes easeshow {
    from { opacity: 0; }
    to { opacity: 1; }
}

.imagelist {
    display: -webkit-box;
    display: box;
    height: 100%;
    list-style-type: none; 
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    .imagelist-item {
        display: -webkit-box;
        -webkit-box-pack: center;
        -webkit-box-align: center;
        width: 100%;
        height: 100%;
        text-align: center;
        position: relative;
        background-color: #000;
        overflow-y: scroll;

        .imagelist-item-img {
            position: absolute;
            top: 0;
            left: 0;
            max-width: 100%;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
        }
    }
}

@-webkit-keyframes sk-bounce {
    0%, 100% { -webkit-transform: scale(0.0) }
    50% { -webkit-transform: scale(1.0) }
}

@keyframes sk-bounce {
    0%, 100% { 
        transform: scale(0.0);
        -webkit-transform: scale(0.0);
    } 50% { 
        transform: scale(1.0);
        -webkit-transform: scale(1.0);
    }
}

</style>
