import Vue from 'vue'
import Router from 'vue-router'
import Picture from '@/Picture'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Picture
    }
  ]
})
