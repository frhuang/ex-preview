<template>
  <div>
    <swipe>
      <swipe-item 
        v-for="(image, $index) in images"
        :key="$index">
        <img :src="image" alt="">
      </swipe-item>
    </swipe>
  </div>
</template>
<style>
.mint-swipe {
  height: 200px;
}
.mint-swipe-item img {
  width: 100%;
}
</style>

<script>
import Swipe from './components/swipe/Swipe'
import SwipeItem from './components/swipe/SwipeItem'
export default {
  data () {
    return{
      images: [
        "/static/img/1.jpg",
        "/static/img/2.jpg",
        "/static/img/test.png",
      ]
    }
  },
  components: {
    Swipe,
    SwipeItem
  }
}
</script>
