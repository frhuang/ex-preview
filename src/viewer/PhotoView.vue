<template>
  <div class="imageview">
    <ul ref="imagelist" class="imagelist"
      @touchstart="_parentTouchStart"
      @touchmove="_parentTouchMove"
      @touchend="_parentTouchEnd"
      @touchcancel="_parentTouchCancel">
      <li 
        v-for="(item, $index) in imagelist" 
        class="imagelist-item" 
        :style="'margin-right:' + gap + 'px'" 
        :key="'img'+$index"
        @touchstart="_handleTouchStart"
        @touchmove="_handleTouchMove"
        @touchend="_handleTouchEnd"
        @touchcancel="_handleTouchCancel">
        <loading-img 
          class="imagelist-item-img" 
          :current="current" 
          :lazySrc="item" 
          :id="'view'+$index"></loading-img>
      </li>
    </ul>
  </div>
</template>

<script>
import LoadingImg from './LoadingImg'
import Transform from './transform'
import { getLen, dot, getAngle, cross, getRotateAngle} from './utils'
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
    disablePinch: Boolean,
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
      screenWidth: 0,
      screenHeight: 0,
      ob: null,
      current: 0,
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
      }
    }
  },
  created () {
    this.screenWidth = window.innerWidth || window.screen.availWidth;
    this.screenHeight = window.innerHeight || window.screen.availHeight
  },
  components: {
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