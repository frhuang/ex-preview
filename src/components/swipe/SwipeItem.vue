<template>
  <div class="mint-swipe-item">
    <slot></slot>
  </div>
</template>

<script>
export default {
  mounted () {
    this.$parent && this.$parent.swipeItemCreated(this);
  },
  destroyed () {
    this.$parent && this.$parent.swipeItemDestroyed(this);
  }
}
</script>
