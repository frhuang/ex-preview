<template>
  <div ref="hello">
  </div>
</template>
<style>
.preview-img-item {
  /* display: none; */
}
</style>
<script>
import Vue from 'vue'
import PhotoSwipeComponent from './photoswipe/PhotoSwipe'
export default {
  data () {
    return {
      imgs: [
        "/static/img/1.jpg",
        "/static/img/2.jpg",
        "/static/img/test.png"
      ],
      images: []
    }
  },
  created () {
    this.initImages()
  },
  methods: {
    initImages () {
      var count = 0;
      var self = this
      var maxW = document.documentElement.clientWidth
      var maxH = document.documentElement.clientHeight
      for (let i = 0; i < this.imgs.length; i++) {
        this.getImageWidth(this.imgs[i], function(src, w, h) {
          var ww = maxH * w / h
          var hh = h * maxW / w
          if (ww > maxW) {
            w = maxW
            h = hh
          } else if (hh > maxH) {
            w = ww
            h = maxH
          }
          var obj = {
            src: src,
            w: w,
            h: h
          }
          self.images.push(obj)
          if (count === i) {
            self.init()
          }
          count++
        })
      }
      this.init()
    },
    getImageWidth(url, callback) {
      var img = new Image()
      img.src = url
      if (img.complete) {
        callback(img.src, img.width, img.height)
      } else {
        img.onload = function () {
          callback(img.src, img.width, img.height)
        }
      }
    },
    init () {
      const PhotoSwipe = Vue.extend(PhotoSwipeComponent)
      let $vm = new PhotoSwipe({ el: document.createElement('div') })
      console.log(this.$refs["hello"])
      this.$refs["hello"].appendChild($vm.$el)
      $vm.init(0, this.images)
      // this.$photoswipe.init(this.images)
    }
  }
}
</script>

