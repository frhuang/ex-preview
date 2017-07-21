<template>
  <div id="app">
    <router-view class="child-view"></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
body, html {
  width: 100%;
  height: 100%;
}
#app {
  width: 100%;
  height: 100%;
}
.child-view {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  transition: all .5s ease;
  background: #fff;
}

</style>
