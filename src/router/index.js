import Vue from 'vue'
import Router from 'vue-router'
import Picture from '@/Picture'
import Hello from '@/components/Hello'
import Calendar from '@/Calendar'
import Home from '@/Home'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/hello',
      component: Hello
    },
    {
      path: '/calendar',
      component: Calendar
    }
  ]
})
