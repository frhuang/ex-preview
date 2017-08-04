import Vue from 'vue'
import App from './App'
import router from './router'
import VueFinger from './viewer/vue-finger'

Vue.config.productionTip = false
Vue.use(VueFinger)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
