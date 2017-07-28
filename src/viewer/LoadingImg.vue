<template>
    <img :src="lazySrc" alt="" @load="onImgLoad">
    <!-- <div ></div>
    <div class="spinner">
      <div class="double-bounce1"></div>
      <div class="double-bounce2"></div>
    </div> -->
</template>

<script>
export default {
  props: {
    lazySrc: String,
    index: Number,
    current: Number
  },
  data () {
    return {
      loading: true,
      error: false,
      loaded: false,
      preloadNum: 3,
      currentIndex: this.current
    }
  },
  methods: {
    loadImg () {
      var maxNum = this.currentIndex + this.preloadNum
      var minNum = this.currentIndex - this.preloadNum
      if (this.lazySrc && this.index <= maxNum && this.index >= minNum ) {
        let img = new Image()
        img.src = this.lazySrc
        img.onload = () => {
          this.loading = false
        }
        img.onerror = () => {
          this.loading = false
          this.error = true
        }
      }
    },
    onImgLoad (e) {
      this.loaded = true
      const target = e.target,
        h = target.naturalHeight,
        w = target.naturalWidth,
        r = h / w,
        height = window.innerHeight || window.screen.availHeight,
        width = window.innerWidth || window.screen.availWidth,
        rate = height / width;
      
      let imgStyle = {}
      if (r > 3.5) {
        target.setAttribute('long', true);
      }
      if (r > rate) {
        imgStyle.height = height + "px";
        imgStyle.width = w * height / h + "px";
        imgStyle.left = width / 2 - (w * height / h) / 2 + "px";
      } else if (r < rate) {
        imgStyle.width = width + "px";
        imgStyle.height = h * width / w + "px";
        imgStyle.top = height / 2 - (h * width / w) / 2 + "px";
      } else {
        imgStyle.width = width;
        imgStyle.height = height;
      }
      target.setAttribute('style', `width:${imgStyle.width}; height:${imgStyle.height}; left:${imgStyle.left}; top:${imgStyle.top}`);
      target.setAttribute('rate', 1/r);
    }
  }
}
</script>

