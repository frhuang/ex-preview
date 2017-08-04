<template>
    <img :src="curImg" ref="img" class="loading-img">
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
      preloadNum: 1,
      currentIndex: this.current,
      curImg: "/static/img/spinner.svg"
    }
  },
  created () {
    // this.loadImg();
    console.log(this.current, this.index)
    
    var maxNum = this.current + this.preloadNum
    var minNum = this.current - this.preloadNum
    if (this.index <= maxNum && this.index >= minNum) {
      this.loadImg();
    }
  },
  watch: {
    current (val) {
      var maxNum = val + this.preloadNum
      var minNum = val - this.preloadNum
      if (this.index <= maxNum && this.index >= minNum) {
        this.loadImg()
      }
    }
  },
  methods: {
    loadImg () {
      
      this.curImg = this.lazySrc;
      // if (this.lazySrc && this.index <= maxNum && this.index >= minNum ) {
        let img = new Image()
        img.src = this.lazySrc
        img.onload = () => {
          this.loading = false
          this.onImgLoad();
        }
        img.onerror = () => {
          this.loading = false
          this.error = true
        }
      // }
    },
    onImgLoad (e) {
      this.loaded = true
      const target = this.$refs['img'],
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

<style lang="scss" scoped>

</style>
