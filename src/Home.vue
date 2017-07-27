<template>
  <div>
    <image-view 
      :list="list" 
      v-model="showViewer" 
      @zoom="zoom" 
      @slide-end="slide" 
      @slide-next="slide" 
      @slide-pre="slide">
    </image-view>
  </div>
</template>

<script>
import ImageView from './components/ImageView'
export default {
  data() {
    return {
      showViewer: true,
      list: [
        { img: "/static/img/1.jpg" },
        { img: "/static/img/1.jpg" }
      ]
    }
  },
  methods: {
    zoom(val) {
      console.log(val);
    },
    slide(val) {
      console.log(val);
    }
  },
  components: {
    ImageView
  }
}
</script>

